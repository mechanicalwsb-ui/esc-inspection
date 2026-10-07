const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const { db, initDatabase, logAudit, setAuditActor, purgeMockupDataFromSqlite } = require('./src/db');
const Domain = require('./public/js/domain');
const Reliability = require('./src/reliability');
const Security = require('./src/security');
const Gateway = require('./src/gateway');
const SourceRecords = require('./src/source-records');

// Initialize SQLite database and seed data
initDatabase();
Reliability.initialize(db);
Security.initialize(db);
SourceRecords.initialize(db);
// Daily verified backup before accepting requests (no WAL files on OneDrive).
const backupDir = process.env.COMIS_BACKUP_DIR || path.join(path.dirname(process.env.COMIS_DB_PATH || path.join(__dirname, 'data', 'comis.db')), 'backups');
if (!fs.existsSync(backupDir) || !fs.readdirSync(backupDir).some(n => n.startsWith(`comis-${Domain.day()}-`))) Reliability.backup(db, backupDir);

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  if (res._user) data = Gateway.sanitize(data, res._user);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key, If-Match'
  });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  if (req._body !== undefined) return Promise.resolve(req._body);
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 25 * 1024 * 1024) {
        const err = new Error('ข้อมูลเกินขนาด 25 MB'); err.status = 413; reject(err); req.destroy();
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        const parsed=JSON.parse(body);
        if(!parsed || typeof parsed!=='object' || Array.isArray(parsed)){const err=new Error('ข้อมูล JSON ต้องเป็น object');err.status=422;reject(err);return;}
        resolve(parsed);
      } catch (e) {
        const err = new Error('ข้อมูล JSON ไม่ถูกต้อง'); err.status = 400; reject(err);
      }
    });
    req.on('error', reject);
  });
}

async function sendTelegramNotification(messageText) {
  try {
    const tokenRow = db.prepare("SELECT value FROM system_settings WHERE key = 'telegram_bot_token'").get();
    const chatRow = db.prepare("SELECT value FROM system_settings WHERE key = 'telegram_default_chat_id'").get();
    const token = tokenRow?.value?.trim();
    const chatId = chatRow?.value?.trim();
    if (!token || !chatId) return { sent: false, reason: 'ไม่ได้ตั้งค่า Telegram Bot Token หรือ Chat ID' };

    const resp = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML'
      })
    });
    const result = await resp.json();
    return { sent: !!result.ok, result };
  } catch (err) {
    return { sent: false, reason: err.message };
  }
}

const getFullBootstrapData = require('./src/bootstrap').createBootstrap(db, Gateway);

const SNAPSHOT_TABLES = [
  'departments',
  'users',
  'machines',
  'form_templates',
  'inspections',
  'defect_tickets',
  'system_settings',
  'inspection_routes',
  'route_rounds',
  'machine_placements'
];

function captureSqliteRawSnapshot() {
  const snap = {};
  for (const tbl of SNAPSHOT_TABLES) {
    snap[tbl] = db.prepare(`SELECT * FROM ${tbl}`).all();
  }
  return snap;
}

function finalizeAuditSnapshotIfNeeded(req, pathname) {
  if (!req._preMutationSnapshot || req._preAuditMaxId === undefined) return;
  try {
    Reliability.normalizeInsertedTimes(db, req._preMutationSnapshot);
    const newLogs = db.prepare('SELECT id FROM audit_logs WHERE id > ? ORDER BY id DESC').all(req._preAuditMaxId);
    const rowChanges = Reliability.changes(req._preMutationSnapshot, captureSqliteRawSnapshot());
    const undoJson = JSON.stringify({
      mode: 'row_changes',
      endpoint: `${req.method} ${pathname}`,
      changes: rowChanges
    });
    if (newLogs.length > 0) {
      const updateStmt = db.prepare('UPDATE audit_logs SET can_undo = 1, undo_json = ? WHERE id = ?');
      for (const l of newLogs) {
        updateStmt.run(undoJson, l.id);
      }
    } else {
      // Endpoint did not explicitly call logAudit (e.g. DELETE or minor update); create an undoable log automatically
      db.prepare(`
        INSERT INTO audit_logs (actor_name, action_type, target_type, target_name, detail, can_undo, reverted, undo_json)
        VALUES (?, ?, ?, ?, ?, 1, 0, ?)
      `).run(req._body?.actor || 'System Admin', req.method, 'API_DATA', pathname, `ดำเนินการ ${req.method} ${pathname}`, undoJson);
    }
  } catch (e) {
    console.error('Failed to finalize audit snapshot:', e.message);
  }
  req._preMutationSnapshot = null;
}

async function handleRequest(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key, If-Match'
    });
    return res.end();
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  if (pathname === '/assets/source-forms/catalogue.js' && !Security.current(db, req)) return sendJson(res, 401, {ok:false,error:'กรุณาเข้าสู่ระบบเพื่ออ่านเอกสาร'});

  // Capture pre-mutation snapshot for any mutating API call so it can be undone in 1 click
  if (
    pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'DELETE'].includes(req.method) &&
    !pathname.startsWith('/api/audit-logs/') &&
    pathname !== '/api/telegram/test'
  ) {
    try {
      req._preMutationSnapshot = captureSqliteRawSnapshot();
      const maxRow = db.prepare('SELECT COALESCE(MAX(id), 0) as max_id FROM audit_logs').get();
      req._preAuditMaxId = maxRow ? maxRow.max_id : 0;
      const origEnd = res.end.bind(res);
      res.end = function (chunk, encoding, cb) {
        if (res.statusCode >= 200 && res.statusCode < 300 && req._preMutationSnapshot) {
          finalizeAuditSnapshotIfNeeded(req, pathname);
          // Refresh auditLogs in outgoing JSON payload if it includes bootstrap data
          try {
            if (typeof chunk === 'string' && chunk.includes('"auditLogs"')) {
              const parsed = JSON.parse(chunk);
              if (parsed && parsed.ok && parsed.data && parsed.data.auditLogs) {
                parsed.data = getFullBootstrapData();
                chunk = JSON.stringify(parsed);
              }
            }
          } catch (_) {}
        }
        return origEnd(chunk, encoding, cb);
      };
    } catch (e) {
      console.error('Snapshot init error:', e.message);
    }
  }

  try {
    // ====================================================
    // API ROUTES
    // ====================================================
    if (await SourceRecords.handle({db,req,res,pathname,body:req._body,sendJson,logAudit})) return;
    if (pathname === '/api/bootstrap' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    // --- 1. DEPARTMENTS CRUD ---
    if (pathname === '/api/departments' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.code || !body.name) {
        return sendJson(res, 400, { ok: false, error: 'กรุณาระบุรหัสแผนกและชื่อแผนก' });
      }
      const stmt = db.prepare(`
        INSERT INTO departments (code, name, plant_name, manager_name, color, icon, telegram_chat_id, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        body.code.trim().toUpperCase(),
        body.name.trim(),
        body.plant_name || 'โรงงานหลัก (Plant 1)',
        body.manager_name || '',
        body.color || '#2563eb',
        body.icon || 'wrench',
        body.telegram_chat_id || '',
        body.description || ''
      );
      logAudit(body.actor, 'CREATE', 'DEPARTMENT', `${body.code} - ${body.name}`);
      return sendJson(res, 201, { ok: true, id: info.lastInsertRowid, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/departments/') && req.method === 'PUT') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      db.prepare(`
        UPDATE departments
        SET code = ?, name = ?, plant_name = ?, manager_name = ?, color = ?,
            telegram_chat_id = ?, description = ?, updated_at = datetime('now', '+7 hours')
        WHERE id = ?
      `).run(
        body.code.trim().toUpperCase(),
        body.name.trim(),
        body.plant_name || 'โรงงานหลัก (Plant 1)',
        body.manager_name || '',
        body.color || '#2563eb',
        body.telegram_chat_id || '',
        body.description || '',
        id
      );
      logAudit(body.actor, 'UPDATE', 'DEPARTMENT', `${body.code} - ${body.name}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/departments/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[3]);
      const dept = db.prepare('SELECT * FROM departments WHERE id = ?').get(id);
      if (!dept) return sendJson(res, 404, { ok: false, error: 'ไม่พบแผนกนี้' });
      db.prepare('DELETE FROM departments WHERE id = ?').run(id);
      logAudit('Admin', 'DELETE', 'DEPARTMENT', `${dept.code} - ${dept.name}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    // --- 2. MACHINES CRUD ---
    if (pathname === '/api/machines' && req.method === 'GET') {
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData().machines });
    }
    if (/^\/api\/machines\/\d+$/.test(pathname) && req.method === 'GET') {
      const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(Number(pathname.split('/')[3]));
      if (!machine) return sendJson(res, 404, { ok: false, error: '???????????????????' });
      return sendJson(res, 200, { ok: true, data: { ...machine, specs: JSON.parse(machine.specs_json || '{}') } });
    }
    if (pathname === '/api/machines' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.machine_code || !body.name) {
        return sendJson(res, 400, { ok: false, error: 'กรุณาระบุรหัสเครื่องจักรและชื่อเครื่องจักร' });
      }
      const stmt = db.prepare(`
        INSERT INTO machines (
          machine_code, name, category, department_id, plant_area, system_name,
          brand, model, serial_number, install_year, criticality,
          operating_state, health_status, running_hours, location_note, specs_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        body.machine_code.trim().toUpperCase(),
        body.name.trim(),
        body.category || 'General Machinery',
        body.department_id ? Number(body.department_id) : null,
        body.plant_area || 'อาคารผลิตหลัก',
        body.system_name || 'ระบบหลัก',
        body.brand || '',
        body.model || '',
        body.serial_number || '',
        Number(body.install_year) || 2024,
        body.criticality || 'B',
        body.operating_state || 'running',
        body.health_status || 'normal',
        Number(body.running_hours) || 0,
        body.location_note || '',
        JSON.stringify(body.specs || {})
      );
      logAudit(body.actor, 'CREATE', 'MACHINE', `${body.machine_code} - ${body.name}`);
      return sendJson(res, 201, { ok: true, id: info.lastInsertRowid, data: getFullBootstrapData() });
    }

    if (pathname.match(/^\/api\/machines\/\d+\/clone$/) && req.method === 'POST') {
      const id = Number(pathname.split('/')[3]);
      const orig = db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
      if (!orig) return sendJson(res, 404, { ok: false, error: 'ไม่พบเครื่องจักรต้นแบบ' });
      const newCode = `${orig.machine_code}-COPY${require('node:crypto').randomBytes(5).toString('hex').toUpperCase()}`;
      const newName = `${orig.name} (สำเนา)`;
      db.prepare(`
        INSERT INTO machines (
          machine_code, name, category, department_id, plant_area, system_name,
          brand, model, serial_number, install_year, criticality,
          operating_state, health_status, running_hours, location_note, specs_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'normal', ?, ?, ?)
      `).run(
        newCode, newName, orig.category, orig.department_id, orig.plant_area, orig.system_name,
        orig.brand, orig.model, '', orig.install_year, orig.criticality,
        orig.operating_state, orig.running_hours, orig.location_note, orig.specs_json
      );
      logAudit('Admin', 'CLONE', 'MACHINE', `${newCode} จาก ${orig.machine_code}`);
      return sendJson(res, 201, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/machines/') && req.method === 'PUT') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      db.prepare(`
        UPDATE machines
        SET machine_code = ?, name = ?, category = ?, department_id = ?, plant_area = ?,
            system_name = ?, brand = ?, model = ?, serial_number = ?, install_year = ?,
            criticality = ?, operating_state = ?, health_status = ?, running_hours = ?,
            location_note = ?, specs_json = ?, updated_at = datetime('now', '+7 hours')
        WHERE id = ?
      `).run(
        body.machine_code.trim().toUpperCase(),
        body.name.trim(),
        body.category || 'General Machinery',
        body.department_id ? Number(body.department_id) : null,
        body.plant_area || 'อาคารผลิตหลัก',
        body.system_name || 'ระบบหลัก',
        body.brand || '',
        body.model || '',
        body.serial_number || '',
        Number(body.install_year) || 2024,
        body.criticality || 'B',
        body.operating_state || 'running',
        body.health_status || 'normal',
        Number(body.running_hours) || 0,
        body.location_note || '',
        JSON.stringify(body.specs || {}),
        id
      );
      logAudit(body.actor, 'UPDATE', 'MACHINE', `${body.machine_code} - ${body.name}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/machines/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[3]);
      const m = db.prepare('SELECT * FROM machines WHERE id = ?').get(id);
      if (!m) return sendJson(res, 404, { ok: false, error: 'ไม่พบเครื่องจักรนี้' });
      db.prepare('UPDATE machines SET is_active = 0 WHERE id = ?').run(id);
      logAudit('Admin', 'DELETE', 'MACHINE', `${m.machine_code} - ${m.name}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    // --- 3. FORM TEMPLATES CRUD (DYNAMIC FORM BUILDER) ---
    if (pathname === '/api/forms' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.form_code || !body.title) {
        return sendJson(res, 400, { ok: false, error: 'กรุณาระบุรหัสฟอร์มและชื่อแบบฟอร์ม' });
      }
      db.prepare(`
        INSERT INTO form_templates (
          form_code, title, description, department_id, target_machine_id,
          machine_category, frequency, estimated_minutes, version, require_signature, sections_json, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
      `).run(
        body.form_code.trim().toUpperCase(),
        body.title.trim(),
        body.description || '',
        body.department_id ? Number(body.department_id) : null,
        body.target_machine_id ? Number(body.target_machine_id) : null,
        body.machine_category || 'ALL',
        body.frequency || 'daily',
        Number(body.estimated_minutes) || 15,
        body.require_signature !== false ? 1 : 0,
        JSON.stringify(body.sections || []),
        body.actor || 'System Admin'
      );
      logAudit(body.actor, 'CREATE', 'FORM_TEMPLATE', `${body.form_code} - ${body.title}`);
      return sendJson(res, 201, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.match(/^\/api\/forms\/\d+\/clone$/) && req.method === 'POST') {
      const id = Number(pathname.split('/')[3]);
      const orig = db.prepare('SELECT * FROM form_templates WHERE id = ?').get(id);
      if (!orig) return sendJson(res, 404, { ok: false, error: 'ไม่พบแบบฟอร์มต้นฉบับ' });
      const newCode = `${orig.form_code}-COPY${require('node:crypto').randomBytes(5).toString('hex').toUpperCase()}`;
      const newTitle = `${orig.title} (สำเนา)`;
      db.prepare(`
        INSERT INTO form_templates (
          form_code, title, description, department_id, target_machine_id,
          machine_category, frequency, estimated_minutes, version, require_signature, sections_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
      `).run(
        newCode, newTitle, orig.description, orig.department_id, orig.target_machine_id,
        orig.machine_category, orig.frequency, orig.estimated_minutes, orig.require_signature, orig.sections_json
      );
      logAudit('Admin', 'CLONE', 'FORM_TEMPLATE', `${newCode} จาก ${orig.form_code}`);
      return sendJson(res, 201, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/forms/') && req.method === 'PUT') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      const existing = db.prepare('SELECT version FROM form_templates WHERE id = ?').get(id);
      const nextVersion = (existing?.version || 1) + 1;
      db.prepare(`
        UPDATE form_templates
        SET form_code = ?, title = ?, description = ?, department_id = ?, target_machine_id = ?,
            machine_category = ?, frequency = ?, estimated_minutes = ?, version = ?,
            require_signature = ?, sections_json = ?, updated_at = datetime('now', '+7 hours')
        WHERE id = ?
      `).run(
        body.form_code.trim().toUpperCase(),
        body.title.trim(),
        body.description || '',
        body.department_id ? Number(body.department_id) : null,
        body.target_machine_id ? Number(body.target_machine_id) : null,
        body.machine_category || 'ALL',
        body.frequency || 'daily',
        Number(body.estimated_minutes) || 15,
        nextVersion,
        body.require_signature !== false ? 1 : 0,
        JSON.stringify(body.sections || []),
        id
      );
      logAudit(body.actor, 'UPDATE', 'FORM_TEMPLATE', `${body.form_code} (v${nextVersion}) - ${body.title}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/forms/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[3]);
      const f = db.prepare('SELECT * FROM form_templates WHERE id = ?').get(id);
      if (!f) return sendJson(res, 404, { ok: false, error: 'ไม่พบแบบฟอร์มนี้' });
      db.prepare('DELETE FROM form_templates WHERE id = ?').run(id);
      logAudit('Admin', 'DELETE', 'FORM_TEMPLATE', `${f.form_code} - ${f.title}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    // --- 4. INSPECTIONS (SUBMIT / APPROVE / DELETE) ---
    if (pathname === '/api/inspections' && req.method === 'POST') {
      const body = await parseBody(req);
      
      const docNo = Reliability.nextDocument(db, body.inspection_type === 'emergency_quick' ? 'EMG' : 'INS');

      const answers = Array.isArray(body.answers) ? body.answers : [];
      let normalCount = 0;
      let warningCount = 0;
      let abnormalCount = 0;
      const abnormalItems = [];

      for (const ans of answers) {
        if (ans.status === 'abnormal') {
          abnormalCount++;
          abnormalItems.push(ans);
        } else if (ans.status === 'warning') {
          warningCount++;
        } else if (ans.status === 'normal') {
          normalCount++;
        }
      }

      let overallResult = 'normal';
      if (abnormalCount > 0 || body.force_open_defect) overallResult = 'abnormal';
      else if (warningCount > 0) overallResult = 'warning';

      const coInspectors = Array.isArray(body.co_inspectors) && body.co_inspectors.length > 0
        ? body.co_inspectors
        : [body.inspector_name || 'ช่างตรวจเช็ค'];

      const info = db.prepare(`
        INSERT INTO inspections (
          doc_no, machine_id, form_id, department_id, route_id, route_round_id,
          inspection_type, co_inspectors_json, inspector_name, inspector_code,
          shift, machine_state_at_check, checkin_method, overall_result,
          normal_count, warning_count, abnormal_count, answers_json,
          inspector_note, signature_data, approval_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `).run(
        docNo,
        Number(body.machine_id),
        Number(body.form_id || 1),
        body.department_id ? Number(body.department_id) : null,
        body.route_id ? Number(body.route_id) : null,
        body.route_round_id ? Number(body.route_round_id) : null,
        body.inspection_type || 'routine',
        JSON.stringify(coInspectors),
        body.inspector_name || 'ช่างตรวจเช็ค',
        body.inspector_code || '',
        body.shift || 'กะเช้า (07:00-19:00)',
        body.machine_state_at_check || 'running',
        body.checkin_method || 'qr_scan',
        overallResult,
        normalCount,
        warningCount,
        abnormalCount,
        JSON.stringify(answers),
        body.inspector_note || '',
        body.signature_data || ''
      );

      const inspectionId = info.lastInsertRowid;

      // Update machine health_status and operating_state
      db.prepare(`
        UPDATE machines
        SET health_status = ?, operating_state = ?, updated_at = datetime('now', '+7 hours')
        WHERE id = ?
      `).run(overallResult, body.machine_state_at_check || 'running', Number(body.machine_id));

      // Update active route_round if applicable
      const roundRow = body.route_round_id
        ? db.prepare('SELECT * FROM route_rounds WHERE id = ?').get(Number(body.route_round_id))
        : db.prepare("SELECT * FROM route_rounds WHERE status = 'in_progress' ORDER BY id DESC LIMIT 1").get();
      if (roundRow && body.route_round_id && body.inspection_type !== 'emergency_quick') {
        const stopsProg = JSON.parse(roundRow.stops_progress_json || '[]');
        const assignedIns = JSON.parse(roundRow.assigned_inspectors_json || '[]');
        let touched = false;
        for (const sp of stopsProg) {
          if (Number(sp.machine_id) === Number(body.machine_id) && (body.route_round_id || sp.status !== 'completed')) {
            sp.status = 'completed';
            sp.inspection_id = Number(inspectionId);
            sp.doc_no = docNo;
            sp.overall_result = overallResult;
            sp.checked_by = body.inspector_name || 'ช่างตรวจเช็ค';
            sp.co_inspectors = coInspectors;
            sp.shared_draft_answers = {};
            sp.checked_at = Domain.timestamp();
            touched = true;
          }
        }
        if (touched) {
          if (!assignedIns.some(x => x.inspector_name === body.inspector_name)) {
            assignedIns.push({
              inspector_code: body.inspector_code || 'EMP',
              inspector_name: body.inspector_name || 'ช่างตรวจเช็ค',
              role_note: 'ร่วมตรวจในสายเดินตรวจ'
            });
          }
          const allDone = stopsProg.length > 0 && stopsProg.every(s => s.status === 'completed');
          db.prepare(`
            UPDATE route_rounds
            SET status = ?, assigned_inspectors_json = ?, stops_progress_json = ?,
                completed_at = CASE WHEN ? = 'completed' THEN datetime('now', '+7 hours') ELSE completed_at END
            WHERE id = ?
          `).run(
            allDone ? 'completed' : 'in_progress',
            JSON.stringify(assignedIns),
            JSON.stringify(stopsProg),
            allDone ? 'completed' : 'in_progress',
            roundRow.id
          );
        }
      }

      // Auto-create Defect Ticket (F-Tag) if abnormal items found or emergency forced
      let createdTicketNo = null;
      const machine = db.prepare('SELECT * FROM machines WHERE id = ?').get(Number(body.machine_id));
      if (abnormalCount > 0 || body.force_open_defect) {
        
        createdTicketNo = Reliability.nextDocument(db, 'DEF');
        const itemsForDefect = abnormalItems.length > 0 ? abnormalItems : answers;
        const summaryTitle = itemsForDefect.map(a => `${a.label}: ${a.value}${a.unit ? ' ' + a.unit : ''}`).join(', ') || body.inspector_note || 'แจ้งความผิดปกติเร่งด่วนหน้างาน';
        const detailText = itemsForDefect.map(a => `• ${a.label} = ${a.value}${a.unit ? ' ' + a.unit : ''} ${a.remark ? '(' + a.remark + ')' : ''}`).join('\n') || body.inspector_note || '';
        const firstPhoto = itemsForDefect.find(a => a.photo)?.photo || '';

        db.prepare(`
          INSERT INTO defect_tickets (
            ticket_no, inspection_id, machine_id, component_name, defect_title,
            defect_detail, reported_by, assigned_dept_id, severity, status, before_photo
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?)
        `).run(
          createdTicketNo,
          inspectionId,
          Number(body.machine_id),
          body.inspection_type === 'emergency_quick' ? 'แจ้งเหตุฉุกเฉิน/ลงค่าด่วน ' + docNo : 'ตรวจพบจากใบตรวจเช็ค ' + docNo,
          summaryTitle.slice(0, 180),
          detailText,
          body.inspector_name || 'ช่างตรวจเช็ค',
          body.department_id ? Number(body.department_id) : (machine?.department_id || 1),
          body.inspection_type === 'emergency_quick' ? 'critical' : 'high',
          firstPhoto
        );

        // Send Telegram Alert if configured
        const alertMsg =
          `🚨 <b>[COMIS แจ้งเตือนพบความผิดปกติ]</b>\n` +
          `📄 เลขที่ใบตรวจ: <code>${docNo}</code>\n` +
          `🎟️ ใบแจ้งซ่อมอัตโนมัติ: <code>${createdTicketNo}</code>\n` +
          `⚙️ เครื่องจักร: <b>${machine?.machine_code} - ${machine?.name}</b>\n` +
          `📍 พื้นที่: ${machine?.plant_area || '-'}\n` +
          `👤 ผู้ตรวจ: ${coInspectors.join(', ')} (${body.shift})\n` +
          `❗ รายการผิดปกติ:\n${detailText}`;
        req._afterCommit = req._afterCommit || []; req._afterCommit.push(() => sendTelegramNotification(alertMsg).catch(() => {}));
      }

      logAudit(body.inspector_name, body.inspection_type === 'emergency_quick' ? 'EMERGENCY_QUICK_LOG' : 'SUBMIT_INSPECTION', 'INSPECTION', `${docNo} (${machine?.machine_code}) -> ${overallResult.toUpperCase()}`);
      return sendJson(res, 201, {
        ok: true,
        doc_no: docNo,
        overall_result: overallResult,
        created_ticket_no: createdTicketNo,
        data: getFullBootstrapData()
      });
    }

    if (pathname.match(/^\/api\/inspections\/\d+\/approve$/) && req.method === 'PUT') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      const status = body.approval_status || 'approved';
      db.prepare(`
        UPDATE inspections
        SET approval_status = ?, approved_by = ?, approval_note = ?, approved_at = datetime('now', '+7 hours')
        WHERE id = ?
      `).run(status, body.approved_by || 'หัวหน้าแผนก', body.approval_note || '', id);
      const ins = db.prepare('SELECT doc_no FROM inspections WHERE id = ?').get(id);
      logAudit(body.approved_by || 'หัวหน้าแผนก', status === 'approved' ? 'APPROVE' : 'REJECT', 'INSPECTION', ins?.doc_no || `#${id}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/inspections/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[3]);
      const ins = db.prepare('SELECT doc_no FROM inspections WHERE id = ?').get(id);
      db.prepare('DELETE FROM inspections WHERE id = ?').run(id);
      logAudit('Admin', 'DELETE', 'INSPECTION', ins?.doc_no || `#${id}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    // --- 5. DEFECT TICKETS / F-TAG CRUD ---
    if (pathname === '/api/defects' && req.method === 'POST') {
      const body = await parseBody(req);
      
      const ticketNo = Reliability.nextDocument(db, 'DEF');
      db.prepare(`
        INSERT INTO defect_tickets (
          ticket_no, machine_id, component_name, defect_title, defect_detail,
          reported_by, assigned_dept_id, assigned_to, severity, status,
          root_cause, corrective_action, before_photo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        ticketNo,
        Number(body.machine_id),
        body.component_name || 'ชุดหลัก',
        body.defect_title,
        body.defect_detail || '',
        body.reported_by || 'ผู้ใช้งานระบบ',
        body.assigned_dept_id ? Number(body.assigned_dept_id) : 1,
        body.assigned_to || '',
        body.severity || 'high',
        body.status || 'open',
        body.root_cause || '',
        body.corrective_action || '',
        body.before_photo || ''
      );
      
      logAudit(body.reported_by, 'CREATE', 'DEFECT_TICKET', ticketNo);
      return sendJson(res, 201, { ok: true, ticket_no: ticketNo, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/defects/') && req.method === 'PUT') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      const isResolved = body.status === 'resolved' || body.status === 'closed';
      db.prepare(`
        UPDATE defect_tickets
        SET component_name = ?, defect_title = ?, defect_detail = ?,
            assigned_dept_id = ?, assigned_to = ?, severity = ?, status = ?,
            root_cause = ?, corrective_action = ?, downtime_hours = ?,
            after_photo = CASE WHEN ? != '' THEN ? ELSE after_photo END,
            resolved_at = CASE WHEN ? = 1 AND resolved_at = '' THEN datetime('now', '+7 hours') ELSE resolved_at END,
            updated_at = datetime('now', '+7 hours')
        WHERE id = ?
      `).run(
        body.component_name || 'ชุดหลัก',
        body.defect_title || '',
        body.defect_detail || '',
        body.assigned_dept_id ? Number(body.assigned_dept_id) : null,
        body.assigned_to || '',
        body.severity || 'medium',
        body.status || 'open',
        body.root_cause || '',
        body.corrective_action || '',
        Number(body.downtime_hours) || 0,
        body.after_photo || '',
        body.after_photo || '',
        isResolved ? 1 : 0,
        id
      );

      logAudit(body.actor || 'ช่างซ่อมบำรุง', 'UPDATE', 'DEFECT_TICKET', `${body.ticket_no || '#' + id} -> ${body.status}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/defects/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[3]);
      db.prepare('DELETE FROM defect_tickets WHERE id = ?').run(id);
      logAudit('Admin', 'DELETE', 'DEFECT_TICKET', `#${id}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    // Shared Hub defaults are writable only by super_admin via the API gateway.
    if (pathname === '/api/hub-settings' && req.method === 'GET') {
      const row = db.prepare("SELECT value FROM system_settings WHERE key='hub_defaults'").get();
      return sendJson(res, 200, { ok: true, settings: JSON.parse(row?.value || '{}'), revision: Gateway.revision(db, pathname) });
    }
    if (pathname === '/api/hub-settings' && req.method === 'PUT') {
      const body = await parseBody(req);
      if (Number(req.headers['if-match']) !== Gateway.revision(db, pathname) || req.headers['if-match'] === undefined) {
        return sendJson(res, 409, { ok: false, error: 'การตั้งค่าถูกแก้ไขแล้ว กรุณาเปิดหน้าการตั้งค่าใหม่' });
      }
      const settings = {};
      for (const key of ['year', 'shift', 'dept', 'section', 'factory', 'printDpi', 'autoLock']) {
        if (typeof body[key] !== 'string' || body[key].length > 300) return sendJson(res, 422, { ok: false, error: 'ค่าการตั้งค่าไม่ถูกต้อง: ' + key });
        settings[key] = body[key].trim();
      }
      db.prepare("INSERT INTO system_settings (key,value) VALUES ('hub_defaults',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(JSON.stringify(settings));
      logAudit('Admin', 'UPDATE', 'HUB_SETTINGS', 'การตั้งค่าคลังแบบฟอร์ม');
      return sendJson(res, 200, { ok: true });
    }

    // --- 6. USERS CRUD ---
    if (pathname === '/api/users' && req.method === 'POST') {
      const body = await parseBody(req);
      if (!body.emp_code || !body.full_name) {
        return sendJson(res, 400, { ok: false, error: 'กรุณาระบุรหัสพนักงานและชื่อ-นามสกุล' });
      }
      db.prepare(`
        INSERT INTO users (emp_code, full_name, position, department_id, role, phone, email)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        body.emp_code.trim().toUpperCase(),
        body.full_name.trim(),
        body.position || '',
        body.department_id ? Number(body.department_id) : null,
        body.role || 'inspector',
        body.phone || '',
        body.email || ''
      );
      logAudit('Admin', 'CREATE', 'USER', `${body.emp_code} - ${body.full_name}`);
      return sendJson(res, 201, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/users/') && req.method === 'PUT') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      db.prepare(`
        UPDATE users
        SET emp_code = ?, full_name = ?, position = ?, department_id = ?, role = ?, phone = ?, email = ?
        WHERE id = ?
      `).run(
        body.emp_code.trim().toUpperCase(),
        body.full_name.trim(),
        body.position || '',
        body.department_id ? Number(body.department_id) : null,
        body.role || 'inspector',
        body.phone || '',
        body.email || '',
        id
      );
      logAudit('Admin', 'UPDATE', 'USER', `${body.emp_code} - ${body.full_name}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/users/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[3]);
      db.prepare('UPDATE users SET is_active=0 WHERE id = ?').run(id);
      logAudit('Admin', 'DELETE', 'USER', `#${id}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    // --- 6B. WALKING ROUTES & MULTI-INSPECTOR TEAM ROUNDS (v2.0) ---
    if (pathname === '/api/routes' && req.method === 'POST') {
      const body = await parseBody(req);
      db.prepare(`
        INSERT INTO inspection_routes (route_code, name, department_id, description, shift_schedules_json, stops_json, estimated_minutes, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, 1)
      `).run(
        (body.route_code || `RT-${Date.now()}`).trim().toUpperCase(),
        (body.name || 'สายเดินตรวจใหม่').trim(),
        Number(body.department_id || 1),
        body.description || '',
        JSON.stringify(body.shift_schedules || []),
        JSON.stringify(body.stops || []),
        Number(body.estimated_minutes || 35)
      );
      logAudit(body.actor || 'Admin', 'CREATE', 'ROUTE', `${body.route_code} - ${body.name}`);
      return sendJson(res, 201, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/routes/') && req.method === 'PUT') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      db.prepare(`
        UPDATE inspection_routes
        SET route_code = ?, name = ?, department_id = ?, description = ?,
            shift_schedules_json = ?, stops_json = ?, estimated_minutes = ?
        WHERE id = ?
      `).run(
        (body.route_code || '').trim().toUpperCase(),
        (body.name || '').trim(),
        Number(body.department_id || 1),
        body.description || '',
        JSON.stringify(body.shift_schedules || []),
        JSON.stringify(body.stops || []),
        Number(body.estimated_minutes || 35),
        id
      );
      logAudit(body.actor || 'Admin', 'UPDATE', 'ROUTE', `${body.route_code} - ${body.name}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/routes/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[3]);
      db.prepare('DELETE FROM inspection_routes WHERE id = ?').run(id);
      logAudit('Admin', 'DELETE', 'ROUTE', `#${id}`);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname === '/api/route-rounds' && req.method === 'POST') {
      const body = await parseBody(req);
      const rt = db.prepare('SELECT * FROM inspection_routes WHERE id = ?').get(Number(body.route_id));
      if (!rt) return sendJson(res, 404, { ok: false, error: 'ไม่พบสายเดินตรวจ' });

      const stops = JSON.parse(rt.stops_json || '[]');
      const stopsProgress = stops.map((st, idx) => ({
        stop_order: st.stop_order || idx + 1,
        machine_id: Number(st.machine_id),
        form_id: Number(st.form_id || 1),
        status: 'pending',
        inspection_id: null,
        doc_no: '',
        overall_result: '',
        checked_by: '',
        co_inspectors: [],
        shared_draft_answers: {},
        checked_at: ''
      }));

      const roundCode = `RND-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(100 + Math.random() * 900))}`;
      const info = db.prepare(`
        INSERT INTO route_rounds (
          round_code, route_id, route_code, route_name, department_id,
          shift, time_window, status, assigned_inspectors_json, stops_progress_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'in_progress', ?, ?)
      `).run(
        roundCode,
        rt.id,
        rt.route_code,
        rt.name,
        rt.department_id,
        body.shift || 'กะเช้า (07:00-19:00)',
        body.time_window || '07:30 - 09:30',
        JSON.stringify(body.assigned_inspectors || []),
        JSON.stringify(stopsProgress)
      );

      logAudit('Team', 'START_ROUTE_ROUND', 'ROUTE_ROUND', `${roundCode} (${rt.route_code})`);
      const fullData = getFullBootstrapData();
      const createdRound = fullData.routeRounds.find(r => r.id === Number(info.lastInsertRowid));
      return sendJson(res, 201, { ok: true, round: createdRound, data: fullData });
    }

    if (pathname.startsWith('/api/route-rounds/') && req.method === 'PUT') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      const rr = db.prepare('SELECT * FROM route_rounds WHERE id = ?').get(id);
      if (!rr) return sendJson(res, 404, { ok: false, error: 'ไม่พบรอบการเดินตรวจ' });

      const assignedInspectors = JSON.parse(rr.assigned_inspectors_json || '[]');
      const stopsProgress = JSON.parse(rr.stops_progress_json || '[]');

      if (body.join_inspector) {
        const exists = assignedInspectors.some(x => x.inspector_name === body.join_inspector.inspector_name);
        if (!exists) assignedInspectors.push(body.join_inspector);
      }

      if (body.shared_draft_save) {
        const { machine_id, answers, inspector_name, inspector_code, note } = body.shared_draft_save;
        const stop = stopsProgress.find(s => Number(s.machine_id) === Number(machine_id));
        if (stop) {
          stop.shared_draft_answers = { ...(stop.shared_draft_answers || {}), ...(answers || {}) };
          stop.shared_draft_note = note || stop.shared_draft_note || '';
          stop.co_inspectors = Array.isArray(stop.co_inspectors) ? stop.co_inspectors : [];
          if (inspector_name && !stop.co_inspectors.includes(inspector_name)) {
            stop.co_inspectors.push(inspector_name);
          }
          stop.status = 'in_progress_shared';
        }
        if (inspector_name && !assignedInspectors.some(x => x.inspector_name === inspector_name)) {
          assignedInspectors.push({
            inspector_code: inspector_code || 'EMP',
            inspector_name,
            role_note: 'ร่วมตรวจเช็คหน้างาน'
          });
        }
      }

      const allDone = stopsProgress.length > 0 && stopsProgress.every(s => s.status === 'completed');
      db.prepare(`
        UPDATE route_rounds
        SET status = ?, assigned_inspectors_json = ?, stops_progress_json = ?,
            completed_at = CASE WHEN ? = 'completed' THEN datetime('now', '+7 hours') ELSE completed_at END
        WHERE id = ?
      `).run(
        allDone ? 'completed' : rr.status,
        JSON.stringify(assignedInspectors),
        JSON.stringify(stopsProgress),
        allDone ? 'completed' : rr.status,
        id
      );

      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.startsWith('/api/route-rounds/') && req.method === 'DELETE') {
      const id = Number(pathname.split('/')[3]);
      db.prepare('DELETE FROM route_rounds WHERE id = ?').run(id);
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    // --- 7. SETTINGS & TELEGRAM TEST ---
    if (pathname === '/api/settings' && req.method === 'PUT') {
      const body = await parseBody(req);
      const upsert = db.prepare(`
        INSERT INTO system_settings (key, value, updated_at)
        VALUES (?, ?, datetime('now', '+7 hours'))
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `);
      for (const [k, v] of Object.entries(body)) {
        if (typeof v === 'string') upsert.run(k, v);
      }
      logAudit('System Admin', 'UPDATE', 'SETTINGS', 'System & Notification Settings');
      return sendJson(res, 200, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname === '/api/telegram/test' && req.method === 'POST') {
      const result = await sendTelegramNotification(
        `✅ <b>[COMIS Center - ทดสอบระบบแจ้งเตือนสำเร็จ]</b>\n` +
        `ระบบตรวจสอบเครื่องจักรออนไลน์แบบศูนย์กลางเชื่อมต่อกับ Telegram Bot เรียบร้อยแล้ว (ฟรี 100% ไม่จำกัดข้อความ)`
      );
      return sendJson(res, 200, { ok: result.sent, details: result });
    }

    // --- 8. SYSTEM ACTIVITY LOG & UNDO / ROLLBACK ENDPOINTS ---
    if (pathname === '/api/audit-logs/client-event' && req.method === 'POST') {
      const body = await parseBody(req);
      logAudit(
        body.actor_name || 'System Admin',
        body.action_type || 'UPDATE',
        body.target_type || 'SYSTEM',
        body.target_name || '-',
        body.detail || '',
        null
      );
      return sendJson(res, 201, { ok: true, data: getFullBootstrapData() });
    }

    if (pathname.match(/^\/api\/audit-logs\/\d+\/undo$/) && req.method === 'POST') {
      const id = Number(pathname.split('/')[3]);
      const body = await parseBody(req);
      const actor = body.actor || 'System Admin';
      const logRow = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(id);
      if (!logRow) {
        return sendJson(res, 404, { ok: false, error: 'ไม่พบรายการประวัติที่ต้องการย้อนกลับ' });
      }
      if (!logRow.can_undo) {
        return sendJson(res, 400, { ok: false, error: 'รายการนี้ไม่สามารถย้อนข้อมูลกลับได้' });
      }
      if (logRow.reverted) {
        return sendJson(res, 400, { ok: false, error: 'รายการนี้ถูกย้อนข้อมูลกลับไปแล้ว' });
      }

      let undoPayload = {};
      try {
        undoPayload = JSON.parse(logRow.undo_json || '{}');
      } catch (_) {}

      const beforeUndoSnap = captureSqliteRawSnapshot();
      Reliability.undoRows(db, undoPayload.changes);
      db.prepare("UPDATE audit_logs SET reverted=1,reverted_at=?,reverted_by=? WHERE id=?").run(Domain.timestamp(), actor, id);
      logAudit(actor, 'UNDO_ROLLBACK', logRow.target_type, 'ย้อนรายการ: ' + logRow.target_name, 'ย้อนเฉพาะรายการที่ยังไม่ถูกแก้ไขภายหลัง', { mode: 'row_changes', changes: Reliability.changes(beforeUndoSnap, captureSqliteRawSnapshot()) });
      for (const change of undoPayload.changes) {
        const type = {form_templates:'forms',defect_tickets:'defects',inspection_routes:'routes',route_rounds:'route-rounds'}[change.table] || change.table;
        db.prepare('INSERT INTO entity_versions VALUES (?,1) ON CONFLICT(entity) DO UPDATE SET revision=revision+1').run('/api/' + type + '/' + change.id);
      }

      return sendJson(res, 200, {
        ok: true,
        undone_log_id: id,
        undo_payload: undoPayload,
        data: getFullBootstrapData()
      });
    }

    // ====================================================
    // 3D MACHINE PLACEMENTS (Server-Synced with Revision Check - P0-3)
    // ====================================================
    const placementMatch = pathname.match(/^\/api\/machine-placements\/([^/]+)$/);
    if (placementMatch && req.method === 'PUT') {
      const machineCode = decodeURIComponent(placementMatch[1]).trim();
      const body = await parseBody(req);
      const existing = db.prepare('SELECT * FROM machine_placements WHERE machine_code = ?').get(machineCode);
      const expectedRev = body.expectedRevision ?? body.expected_revision;
      if (existing && expectedRev !== undefined && Number(expectedRev) !== Number(existing.revision)) {
        return sendJson(res, 409, {
          ok: false,
          conflict: true,
          error: `พิกัดของ ${machineCode} ถูกแก้ไขโดยผู้ใช้อื่นแล้ว (Revision ปัจจุบัน: ${existing.revision}) กรุณารีเฟรชข้อมูล`,
          currentPlacement: existing
        });
      }
      const beforeSnap = captureSqliteRawSnapshot();
      const nextRev = existing ? Number(existing.revision || 1) + 1 : 1;
      const zoneId = String(body.zoneId ?? body.zone_id ?? existing?.zone_id ?? 'production-west').trim();
      const bayLabel = String(body.bayLabel ?? body.bay_label ?? existing?.bay_label ?? '').trim();
      const offsetObj = body.anchorOffset || body.anchor_offset || {
        x: Number(body.x ?? existing?.x ?? 0),
        y: Number(body.y ?? existing?.y ?? 0),
        z: Number(body.z ?? existing?.z ?? 0)
      };
      const x = Number(offsetObj.x ?? body.x ?? existing?.x ?? 0);
      const y = Number(offsetObj.y ?? body.y ?? existing?.y ?? 0);
      const z = Number(offsetObj.z ?? body.z ?? existing?.z ?? 0);
      const anchorOffsetJson = JSON.stringify({ x, y, z });
      const isVerified = body.locationVerified !== undefined ? Boolean(body.locationVerified) : Boolean(body.location_verified);
      const locationVerified = isVerified ? 1 : 0;
      const actor = body.actor || 'System Admin';
      const verifiedBy = locationVerified ? actor : (existing?.verified_by || '');
      const verifiedAt = locationVerified ? new Date().toISOString().replace('T', ' ').slice(0, 19) : (existing?.verified_at || '');
      const note = String(body.note ?? existing?.note ?? '');

      db.prepare(`
        INSERT INTO machine_placements (
          machine_code, zone_id, bay_label, anchor_offset_json, x, y, z, location_verified, verified_by, verified_at, note, revision, updated_by, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '+7 hours'))
        ON CONFLICT(machine_code) DO UPDATE SET
          zone_id = excluded.zone_id,
          bay_label = excluded.bay_label,
          anchor_offset_json = excluded.anchor_offset_json,
          x = excluded.x,
          y = excluded.y,
          z = excluded.z,
          location_verified = excluded.location_verified,
          verified_by = excluded.verified_by,
          verified_at = excluded.verified_at,
          note = excluded.note,
          revision = excluded.revision,
          updated_by = excluded.updated_by,
          updated_at = datetime('now', '+7 hours')
      `).run(machineCode, zoneId, bayLabel, anchorOffsetJson, x, y, z, locationVerified, verifiedBy, verifiedAt, note, nextRev, actor);

      logAudit(
        actor,
        'UPDATE_3D_PLACEMENT',
        '3D_PLACEMENT',
        `${machineCode} -> ${zoneId}`,
        `อัปเดตพิกัด 3D โซน ${zoneId} (${bayLabel || '-'}) Rev #${nextRev} ${locationVerified ? '[ยืนยันหน้างานแล้ว]' : ''}`,
        { mode: 'sqlite_snapshot', snapshot_before: beforeSnap }
      );

      return sendJson(res, 200, { ok: true, revision: nextRev, data: getFullBootstrapData() });
    }

    // ====================================================
    // CSV BULK IMPORT API (POST /api/csv-import)
    // ====================================================
    if (pathname === '/api/csv-import' && req.method === 'POST') {
      const body = await parseBody(req);
      const entityType = String(body.entity_type || 'machines').trim();
      const rows = Array.isArray(body.rows) ? body.rows : [];
      const actor = body.actor || 'System Admin';
      if (!rows.length) {
        return sendJson(res, 400, { ok: false, error: 'ไม่มีข้อมูลแถว CSV สำหรับนำเข้า' });
      }

      const counts = require('./src/csv-import').importRows(db, entityType, rows);
      logAudit(actor, 'BULK_IMPORT_CSV', entityType.toUpperCase(), 'นำเข้าข้อมูล CSV', 'เพิ่ม ' + counts.inserted_count + ' แก้ไข ' + counts.updated_count);
      return sendJson(res, 200, { ok: true, ...counts, insertedCount: counts.inserted_count, updatedCount: counts.updated_count, data: getFullBootstrapData() });
    }

    if (pathname === '/api/system/purge-mockup' && req.method === 'POST') {
      const body = await parseBody(req);
      const actor = body?.actor || 'System Admin';
      const beforeSnap = captureSqliteRawSnapshot();
      const purged=purgeMockupDataFromSqlite(true);
      if(purged?.error)throw new Error(purged.error);
      logAudit(
        actor,
        'PURGE_MOCKUP',
        'DATABASE',
        'ล้างข้อมูลจำลอง (Mockup Data)',
        'ลบรายการจำลองเริ่มต้นออกทั้งหมด คงเหลือเฉพาะข้อมูลจริง',
        { mode: 'sqlite_snapshot', snapshot_before: beforeSnap }
      );
      return sendJson(res, 200, {
        ok: true,
        data: getFullBootstrapData()
      });
    }

    // ====================================================
    // STATIC FILES (FRONTEND SPA)
    // ====================================================
    if (pathname.startsWith('/api/')) return sendJson(res, 404, { ok: false, error: 'ไม่พบ API นี้' });
    const decodedPath = decodeURIComponent(pathname);
    if (pathname.startsWith('/inspection-forms/') || decodedPath.startsWith('/เอกสารตรวจเครื่องจักร/')) {
      const root = path.join(__dirname, 'เอกสารตรวจเครื่องจักร');
      const relative = pathname.startsWith('/inspection-forms/')
        ? decodeURIComponent(pathname.slice('/inspection-forms/'.length))
        : decodedPath.slice('/เอกสารตรวจเครื่องจักร/'.length);
      const target = path.resolve(root, relative);
      if (!target.startsWith(root + path.sep) || !/\.(html|js|png|jpg|ttf|woff2?)$/i.test(target)) { res.writeHead(403); return res.end('Forbidden'); }
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404); return res.end('Not found'); }
      res.writeHead(200, { 'Content-Type': MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      return fs.createReadStream(target).pipe(res);
    }
    // Dedicated technician portal: support both the extensionless shared URL
    // and the explicit HTML URL without routing either request into the SPA.
    if ((pathname === '/technician' || pathname === '/technician.html') && req.method === 'GET') {
      const technicianHtml = [path.join(PUBLIC_DIR, 'technician.html'), path.join(__dirname, 'technician.html')].find(candidate => fs.existsSync(candidate));
      if (!technicianHtml) { res.writeHead(404); return res.end('Technician portal not found'); }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      return fs.createReadStream(technicianHtml).pipe(res);
    }
    const relativePath = pathname.startsWith('/public/') ? pathname.slice('/public'.length) : pathname;
    let filePath = relativePath === '/' ? path.join(PUBLIC_DIR, 'index.html') : path.join(PUBLIC_DIR, relativePath);
    if (!filePath.startsWith(PUBLIC_DIR)) {
      res.writeHead(403);
      return res.end('Forbidden');
    }

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
      return fs.createReadStream(filePath).pipe(res);
    } else {
      // Fallback to index.html for SPA
      const indexHtml = path.join(PUBLIC_DIR, 'index.html');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return fs.createReadStream(indexHtml).pipe(res);
    }
  } catch (err) {
    console.error('Server error:', err);
    return sendJson(res, err.status || (/UNIQUE constraint/.test(err.message) ? 409 : /FOREIGN KEY/.test(err.message) ? 422 : 500), { ok: false, error: err.message || 'Internal Server Error' });
  }
}

const listener = Gateway.createGateway({ db, handler: handleRequest, bootstrap: getFullBootstrapData, parseBody, sendJson, setAuditActor });
const server = process.env.COMIS_TLS_CERT && process.env.COMIS_TLS_KEY
  ? require('node:https').createServer({ cert: fs.readFileSync(process.env.COMIS_TLS_CERT), key: fs.readFileSync(process.env.COMIS_TLS_KEY) }, listener)
  : http.createServer(listener);
server.requestTimeout = 30000;
server.headersTimeout = 10000;
const backupTimer=setInterval(()=>{try{if(!fs.readdirSync(backupDir).some(n=>n.startsWith(`comis-${Domain.day()}-`)))Reliability.backup(db,backupDir);}catch(err){console.error('Daily backup:',err.message);}},3600000);
backupTimer.unref();

server.listen(PORT, process.env.COMIS_HOST || '0.0.0.0', () => {
  console.log(`======================================================================`);
  console.log(`🏭 COMIS (Centralized Online Machine Inspection System) is running!`);
  console.log(`🌐 URL: http://localhost:${server.address().port}`);
  console.log(`🗄️  Database: SQLite (data/comis.db) - 100% Free & Open-Source`);
  console.log(`======================================================================`);
});
