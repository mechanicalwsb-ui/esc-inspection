// API boundary: authentication, validation, serialized transactions and retry safety.
const { createHash } = require('node:crypto');
const Domain = require('../public/js/domain');
const Security = require('./security');
const Reliability = require('./reliability');
function failure(message, status = 422) { const e = new Error(message); e.status = status; throw e; }
function entityKey(url) { return url.replace(/\/(clone|approve|join|draft)$/, ''); }
function revision(db, key) { return db.prepare('SELECT revision FROM entity_versions WHERE entity=?').get(key)?.revision || 0; }
function revisions(db) { return Object.fromEntries(db.prepare('SELECT * FROM entity_versions').all().map(r => [r.entity, r.revision])); }
function validate(db, url, method, b, user) {
  const need = (field) => Domain.assert(typeof b[field] === 'string' && b[field].trim(), `กรุณาระบุ ${field}`);
  const find = (table, id) => db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(Number(id));
  const id = /^\/api\/[^/]+\/(\d+)/.exec(url)?.[1];
  const table = { machines: 'machines', forms: 'form_templates', departments: 'departments', users: 'users', inspections: 'inspections', defects: 'defect_tickets', routes: 'inspection_routes', 'route-rounds': 'route_rounds' }[url.split('/')[2]];
  const existing = id && table ? find(table, id) : null;
  if (id && table && !existing) failure('ไม่พบรายการที่ต้องการแก้ไข', 404);
  if (user.role !== 'super_admin') {
    const department = existing?.assigned_dept_id ?? existing?.department_id ?? b.department_id;
    if (department && Number(department) !== Number(user.department_id)) failure('ไม่มีสิทธิ์แก้ไขข้อมูลของแผนกอื่น', 403);
    const machine = b.machine_id ? find('machines', b.machine_id) : null;
    if (machine && Number(machine.department_id) !== Number(user.department_id)) failure('ไม่มีสิทธิ์ตรวจเครื่องของแผนกอื่น', 403);
    const route = b.route_id ? find('inspection_routes', b.route_id) : null;
    if (route && Number(route.department_id) !== Number(user.department_id)) failure('ไม่มีสิทธิ์เปิดสายตรวจของแผนกอื่น', 403);
  }
  if (['POST', 'PUT'].includes(method) && /^\/api\/(machines|departments|users|forms|routes)$|^\/api\/(machines|departments|users|forms|routes)\/\d+$/.test(url)) {
    const names = { machines: ['machine_code', 'name'], departments: ['code', 'name'], users: ['emp_code', 'full_name'], forms: ['form_code', 'title'], routes: ['route_code', 'name'] };
    for (const f of names[url.split('/')[2]]) need(f);
  }
  if (b.department_id) Domain.assert(find('departments', b.department_id), 'ไม่พบแผนกที่ระบุ');
  if (b.assigned_dept_id) Domain.assert(find('departments', b.assigned_dept_id), 'ไม่พบแผนกรับงาน');
  if (b.machine_id) Domain.assert(find('machines', b.machine_id), 'ไม่พบเครื่องจักร');
  for (const f of ['running_hours', 'downtime_hours', 'estimated_minutes', 'install_year']) if (b[f] !== undefined) Domain.assert(Number.isFinite(Number(b[f])) && Number(b[f]) >= 0, `${f} ต้องเป็นตัวเลขที่ไม่ติดลบ`);
  if (b.role) Domain.assert(['super_admin', 'dept_admin', 'inspector', 'viewer'].includes(b.role), 'สิทธิ์ผู้ใช้ไม่ถูกต้อง');
  if (b.health_status) Domain.assert(['normal', 'warning', 'abnormal'].includes(b.health_status), 'สถานะสุขภาพไม่ถูกต้อง');
  if (b.operating_state) Domain.assert(['running', 'standby', 'maintenance', 'pending_repair', 'under_repair'].includes(b.operating_state), 'สถานะเครื่องไม่ถูกต้อง');
  if (b.approval_status) Domain.assert(['approved', 'rejected'].includes(b.approval_status), 'ผลอนุมัติไม่ถูกต้อง');
  if (url.startsWith('/api/defects') && method !== 'DELETE') {
    need('defect_title');
    if (b.status) Domain.assert(['open', 'in_progress', 'waiting_parts', 'resolved', 'closed'].includes(b.status), 'สถานะใบซ่อมไม่ถูกต้อง');
    if (b.severity) Domain.assert(['critical', 'high', 'medium', 'low'].includes(b.severity), 'ระดับความรุนแรงไม่ถูกต้อง');
    if (['closed', 'resolved'].includes(b.status)) {
      Domain.assert(user.role === 'super_admin' || user.role === 'dept_admin', 'หัวหน้าต้องยืนยันการปิดงานซ่อม');
      need('root_cause'); need('corrective_action');
    }
    // Repair tickets must never rewrite the latest measured health result.
  }
  if (url === '/api/inspections' && method === 'POST') {
    Domain.validateInspection(b, find('machines', b.machine_id), find('form_templates', b.form_id));
    if (b.route_round_id) {
      const rr = find('route_rounds', b.route_round_id);
      Domain.assert(rr && rr.status === 'in_progress', 'รอบตรวจปิดไปแล้วหรือไม่พบรอบตรวจ');
      if (b.route_revision === undefined) failure('ต้องโหลดรอบตรวจล่าสุดก่อนบันทึก', 428);
      if (Number(b.route_revision) !== revision(db, `/api/route-rounds/${b.route_round_id}`)) failure('ทีมช่างแก้ไขรอบตรวจนี้แล้ว กรุณาเปิดแบบร่างล่าสุดและรวมคำตอบก่อนบันทึก', 409);
      Domain.assert(JSON.parse(rr.stops_progress_json).some(s => Number(s.machine_id) === Number(b.machine_id)), 'เครื่องนี้ไม่อยู่ในรอบตรวจ');
    }
  }
  if (url === '/api/route-rounds' && method === 'POST') Domain.assert(find('inspection_routes', b.route_id), 'ไม่พบสายเดินตรวจ');
  if (b.shared_draft_save) {
    const draft=b.shared_draft_save; const stop=JSON.parse(existing?.stops_progress_json || '[]').find(s=>Number(s.machine_id)===Number(draft.machine_id));
    Domain.assert(existing?.status==='in_progress' && stop, 'เครื่องนี้ไม่อยู่ในรอบตรวจที่เปิดอยู่');
    const template=find('form_templates',stop.form_id);const fields=JSON.parse(template.sections_json).flatMap(s=>s.fields||[]);
    Domain.assert(draft.answers && typeof draft.answers==='object' && !Array.isArray(draft.answers), 'แบบร่างไม่ถูกต้อง');
    for (const [id,a] of Object.entries(draft.answers)) { const f=fields.find(f=>f.id===id);Domain.assert(f && a && typeof a==='object' && a.field_id===id,'ข้อคำถามในแบบร่างไม่ถูกต้อง');if(a.value!==''&&a.status){Domain.assert(['normal','warning','abnormal','na'].includes(a.status),'สถานะคำตอบไม่ถูกต้อง');if(f.field_type==='number_range'&&a.status!=='na')a.status=Domain.classify(a.value,f);} }
  }
  if (url.startsWith('/api/machine-placements/')) {
    Domain.assert(db.prepare('SELECT id FROM machines WHERE machine_code=?').get(decodeURIComponent(url.split('/')[3])), 'ไม่พบเครื่องสำหรับพิกัด');
    for (const n of Object.values(b.anchor_offset || b.anchorOffset || {})) Domain.assert(Number.isFinite(Number(n)), 'พิกัดต้องเป็นตัวเลข');
  }
  if (url === '/api/csv-import') Domain.validateCsv(b, db.prepare('SELECT code FROM departments').all(), db.prepare('SELECT machine_code FROM machines').all());
  if (url === '/api/users/' + user.id && (method === 'DELETE' || b.role && b.role !== 'super_admin') && user.role === 'super_admin') failure('ไม่สามารถลบหรือลดสิทธิ์บัญชีผู้ดูแลที่กำลังใช้งาน');
  if (b.sections) {
    Domain.assert(Array.isArray(b.sections) && b.sections.length, 'แบบฟอร์มต้องมีหมวดคำถาม');
    const seen = new Set();
    for (const f of b.sections.flatMap(s => s.fields || [])) { Domain.assert(f.id && f.label && !seen.has(f.id), 'รหัสหรือชื่อคำถามไม่ถูกต้อง/ซ้ำ'); seen.add(f.id); if (f.field_type === 'number_range') Domain.assert(Number.isFinite(Number(f.min_normal)) && Number(f.min_normal) <= Number(f.max_normal) && Number(f.max_normal) <= Number(f.max_warning), 'ช่วงค่าตัวเลขไม่ถูกต้อง'); }
  }
}
function createGateway({ db, handler, bootstrap, parseBody, sendJson, setAuditActor }) {
  const attempts = new Map(); let tail = Promise.resolve();
  async function dispatch(req, res) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
    if (!url.startsWith('/api/')) return handler(req, res);
    const mutate = ['POST', 'PUT', 'DELETE'].includes(req.method);
    let active = false;
    try {
      res.setHeader('Cache-Control', 'no-store');
      if (mutate) {
        if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) failure('ต้นทางคำขอไม่ได้รับอนุญาต', 403);
        if (!(req.headers['content-type'] || '').startsWith('application/json')) failure('ต้องส่งข้อมูล JSON', 415);
        req._body = await parseBody(req);
      }
      let user = Security.current(db, req); const b = req._body || {};
      const originalFingerprint = createHash('sha256').update(JSON.stringify([req.method, url, b])).digest('hex');
      if (url === '/api/auth/status' && req.method === 'GET') return sendJson(res, 200, { ok: true, setupRequired: !db.prepare('SELECT 1 FROM credentials LIMIT 1').get(), user: Security.publicUser(user), version: Domain.version });
      if (url === '/api/auth/setup' && req.method === 'POST') {
        if (db.prepare('SELECT 1 FROM credentials LIMIT 1').get()) failure('ระบบตั้งค่าบัญชีแล้ว', 409);
        if (!['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress)) failure('ตั้งค่าบัญชีผู้ดูแลครั้งแรกจากเครื่องเซิร์ฟเวอร์เท่านั้น', 403);
        const admin = db.prepare("SELECT * FROM users WHERE role='super_admin' AND is_active=1 ORDER BY id LIMIT 1").get();
        Domain.assert(admin, 'ไม่พบบัญชีผู้ดูแล'); Security.setPassword(db, admin.id, b.password); Security.issue(db, res, admin.id, req.socket.encrypted);
        return sendJson(res, 200, { ok: true, user: Security.publicUser(admin) });
      }
      if (url === '/api/auth/login' && req.method === 'POST') {
        const key = req.socket.remoteAddress; const history = (attempts.get(key) || []).filter(t => t > Date.now() - 900000);
        if (history.length >= 10) failure('ลองเข้าสู่ระบบหลายครั้ง กรุณารอ 15 นาที', 429);
        const u = db.prepare('SELECT * FROM users WHERE emp_code=? AND is_active=1').get(String(b.emp_code || '').trim().toUpperCase());
        if (!u || !Security.verify(db, u.id, b.password)) { history.push(Date.now()); attempts.set(key, history); failure('รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง', 401); }
        attempts.delete(key); Security.issue(db, res, u.id, req.socket.encrypted); return sendJson(res, 200, { ok: true, user: Security.publicUser({ ...u, must_change: db.prepare('SELECT must_change FROM credentials WHERE user_id=?').get(u.id).must_change }) });
      }
      if (!user) failure('กรุณาเข้าสู่ระบบ', 401);
      if (url === '/api/auth/logout' && req.method === 'POST') { Security.logout(db, req, res); return sendJson(res, 200, { ok: true }); }
      if (url === '/api/auth/password' && req.method === 'POST') {
        if (b.user_id && Number(b.user_id) !== user.id) {
          if (user.role !== 'super_admin') failure('ไม่มีสิทธิ์ตั้งรหัสผ่านให้ผู้อื่น', 403);
          Domain.assert(db.prepare('SELECT id FROM users WHERE id=?').get(Number(b.user_id)), 'ไม่พบบัญชี'); Security.setPassword(db, Number(b.user_id), b.password, true);
        } else { Domain.assert(Security.verify(db, user.id, b.current_password), 'รหัสผ่านปัจจุบันไม่ถูกต้อง'); Security.setPassword(db, user.id, b.password); Security.issue(db, res, user.id, req.socket.encrypted); }
        return sendJson(res, 200, { ok: true });
      }
      if (user.must_change) failure('กรุณาเปลี่ยนรหัสผ่านชั่วคราวก่อนใช้งาน', 403);
      if (!Security.allowed(user.role, url, req.method)) failure('ไม่มีสิทธิ์ทำรายการนี้', 403);
      res._user = user;
      if (url === '/api/system/backup' && req.method === 'POST') { const target = Reliability.backup(db); return sendJson(res, 200, { ok: true, filename: require('node:path').basename(target) }); }
      if (mutate) {
        b.actor = b.actor_name = b.created_by = b.reported_by = b.approved_by = user.full_name;
        const roundId=b.route_round_id || (/^\/api\/route-rounds\/\d+/.test(url) ? Number(url.split('/')[3]) : null);
        const round=roundId ? db.prepare('SELECT * FROM route_rounds WHERE id=?').get(Number(roundId)) : null;
        const stop=round ? JSON.parse(round.stops_progress_json).find(s=>Number(s.machine_id)===Number(b.machine_id || b.shared_draft_save?.machine_id)) : null;
        const attribute=a=>{const old=stop?.shared_draft_answers?.[a.field_id];const same=old && ['value','status','remark','photo'].every(k=>JSON.stringify(old[k])===JSON.stringify(a[k]));a.checked_by=same ? old.checked_by : user.full_name;a.checked_at=same ? old.checked_at : Domain.timestamp();};
        if (url === '/api/inspections') { b.inspector_name = user.full_name; b.inspector_code = user.emp_code; b.answers?.forEach(attribute); b.co_inspectors=[...new Set([user.full_name,...(b.answers||[]).map(a=>a.checked_by)])]; }
        if (b.join_inspector) b.join_inspector = { inspector_code: user.emp_code, inspector_name: user.full_name, role_note: 'ร่วมตรวจ' };
        if (b.shared_draft_save) { b.shared_draft_save.inspector_name = user.full_name; b.shared_draft_save.inspector_code = user.emp_code; Object.values(b.shared_draft_save.answers || {}).forEach(attribute); }
        const key = entityKey(url); const fingerprint = originalFingerprint;
        const requestId = req.headers['idempotency-key'];
        if (requestId) {
          Domain.assert(/^[A-Za-z0-9_-]{16,100}$/.test(requestId), 'รหัสคำขอไม่ถูกต้อง');
          const prior = db.prepare('SELECT * FROM api_requests WHERE request_id=?').get(requestId);
          if (prior) { if (prior.user_id !== user.id || prior.fingerprint !== fingerprint) failure('รหัสคำขอนี้ใช้กับข้อมูลอื่นแล้ว', 409); return sendJson(res, prior.status, { ...JSON.parse(prior.response), replayed: true, data: bootstrap() }); }
        }
        if (['PUT', 'DELETE'].includes(req.method) && tablePath(url)) {
          const expected = req.headers['if-match'];
          if (expected === undefined) failure('ต้องโหลดข้อมูลล่าสุดก่อนแก้ไข', 428);
          if (Number(expected) !== revision(db, key)) failure('ข้อมูลถูกแก้ไขโดยผู้อื่นแล้ว กรุณารีเฟรชและตรวจข้อมูลก่อนบันทึก', 409);
        }
        validate(db, url, req.method, b, user);
        setAuditActor(user.full_name);
        db.exec('BEGIN IMMEDIATE'); active = true;
        const end = res.end.bind(res);
        res.end = function (chunk, encoding, cb) {
          try {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              db.prepare('INSERT INTO entity_versions VALUES (?, 1) ON CONFLICT(entity) DO UPDATE SET revision=revision+1').run(key);
              if (url === '/api/inspections' && b.route_round_id) db.prepare('INSERT INTO entity_versions VALUES (?, 1) ON CONFLICT(entity) DO UPDATE SET revision=revision+1').run(`/api/route-rounds/${b.route_round_id}`);
              let response = typeof chunk === 'string' ? JSON.parse(chunk) : null;
              if (response?.data) response.data = bootstrap();
              if (response && requestId) { const { data, ...receipt } = response; db.prepare('INSERT INTO api_requests VALUES (?, ?, ?, ?, ?)').run(requestId, user.id, fingerprint, JSON.stringify(receipt), res.statusCode); }
              db.exec('COMMIT'); active = false;
              if (response) chunk = JSON.stringify(sanitize(response, user));
              for (const send of req._afterCommit || []) { try { send(); } catch (err) { console.error('Notification:', err.message); } }
            } else { db.exec('ROLLBACK'); active = false; }
          } catch (e) {
            if (active) { db.exec('ROLLBACK'); active = false; }
            res.statusCode = e.status || 500; chunk = JSON.stringify({ ok: false, error: e.message });
          }
          return end(chunk, encoding, cb);
        };
      }
      await handler(req, res);
    } catch (e) { if (active) db.exec('ROLLBACK'); sendJson(res, e.status || 500, { ok: false, error: e.message }); }
    finally { setAuditActor(null); }
  }
  return (req, res) => { if (!req.url.startsWith('/api/')) { handler(req, res); return; } tail = tail.then(() => dispatch(req, res)).catch(e => { console.error(e); if (!res.writableEnded) sendJson(res, 500, { ok: false, error: 'เกิดข้อผิดพลาดในระบบ' }); }); };
}
function tablePath(url) { return /^\/api\/(machines|departments|users|forms|routes|route-rounds|inspections|defects)\/\d+/.test(url); }
function sanitize(result, user) {
  if (!result.data) return result;
  const data = { ...result.data, currentUser: Security.publicUser(user), appVersion: Domain.version };
  data.users = data.users.map(u => ({ ...u, password: undefined }));
  if (user?.role !== 'super_admin') {
    data.settings = { organization_name: data.settings.organization_name };
    data.auditLogs = data.auditLogs.map(({ undo_json, undo_payload, ...log }) => ({ ...log, can_undo: false }));
  }
  return { ...result, data };
}
module.exports = { createGateway, revisions, sanitize, validate };
