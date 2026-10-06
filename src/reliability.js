const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const Domain = require('../public/js/domain');
const KEYS = { departments: 'id', users: 'id', machines: 'id', form_templates: 'id', inspections: 'id', defect_tickets: 'id', system_settings: 'key', inspection_routes: 'id', route_rounds: 'id', machine_placements: 'machine_code' };
function initialize(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS document_sequences (prefix TEXT, period TEXT, value INTEGER NOT NULL, PRIMARY KEY(prefix,period));
    CREATE TABLE IF NOT EXISTS api_requests (request_id TEXT PRIMARY KEY, user_id INTEGER NOT NULL, fingerprint TEXT NOT NULL, response TEXT NOT NULL, status INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS entity_versions (entity TEXT PRIMARY KEY, revision INTEGER NOT NULL DEFAULT 0);`);
}
function nextDocument(db, prefix) {
  const period = Domain.day().slice(0, 7).replace('-', '');
  const table = prefix === 'DEF' ? 'defect_tickets' : 'inspections';
  const column = prefix === 'DEF' ? 'ticket_no' : 'doc_no';
  const old = db.prepare(`SELECT ${column} AS n FROM ${table} WHERE ${column} LIKE ?`).all(`${prefix}-${period}-%`).reduce((n, r) => Math.max(n, Number(r.n.split('-').at(-1)) || 0), 0);
  db.prepare('INSERT INTO document_sequences VALUES (?, ?, ?) ON CONFLICT(prefix,period) DO UPDATE SET value = MAX(value, excluded.value) + 1').run(prefix, period, old + 1);
  return Domain.number(prefix, db.prepare('SELECT value FROM document_sequences WHERE prefix=? AND period=?').get(prefix, period).value);
}
function changes(before, after) {
  const result = [];
  for (const [table, key] of Object.entries(KEYS)) {
    const a = new Map((before[table] || []).map(r => [String(r[key]), r]));
    const b = new Map((after[table] || []).map(r => [String(r[key]), r]));
    for (const id of new Set([...a.keys(), ...b.keys()])) if (JSON.stringify(a.get(id)) !== JSON.stringify(b.get(id))) result.push({ table, key, id, before: a.get(id) || null, after: b.get(id) || null });
  }
  return result;
}
function normalizeInsertedTimes(db, before) {
  for (const [table,key] of Object.entries(KEYS)) {
    const known=new Set((before[table]||[]).map(r=>String(r[key])));
    for (const row of db.prepare(`SELECT * FROM ${table}`).all()) {
      if(known.has(String(row[key])))continue;
      const fields=['created_at','inspected_at','started_at'].filter(k=>Object.hasOwn(row,k));
      if(fields.length)db.prepare(`UPDATE ${table} SET ${fields.map(k=>`${k}=?`).join(',')} WHERE ${key}=?`).run(...fields.map(()=>Domain.timestamp()),row[key]);
    }
  }
}
function undoRows(db, delta) {
  Domain.assert(Array.isArray(delta) && delta.length, 'รายการเก่าไม่มีข้อมูลเปรียบเทียบที่ปลอดภัย จึงไม่สามารถย้อนกลับได้');
  for (const c of delta) {
    Domain.assert(KEYS[c.table] === c.key, 'ข้อมูลย้อนกลับไม่ถูกต้อง');
    if (c.table === 'users' && !c.before && db.prepare('SELECT 1 FROM credentials WHERE user_id=?').get(c.id)) { const e = new Error('บัญชีนี้ตั้งรหัสผ่านแล้ว ไม่สามารถย้อนการสร้างบัญชีได้ กรุณาปิดใช้งานแทน'); e.status = 409; throw e; }
    const current = db.prepare(`SELECT * FROM ${c.table} WHERE ${c.key}=?`).get(c.id) || null;
    if (JSON.stringify(current) !== JSON.stringify(c.after)) { const e = new Error('มีผู้แก้ไขรายการนี้ภายหลัง กรุณาตรวจข้อมูลล่าสุดก่อนย้อนกลับ'); e.status = 409; throw e; }
  }
  // Defer relationship checks until the entire set has been restored.
  db.exec('PRAGMA defer_foreign_keys = ON');
  for (const c of [...delta].reverse()) {
    if (!c.before) db.prepare(`DELETE FROM ${c.table} WHERE ${c.key}=?`).run(c.id);
    else {
      const cols = Object.keys(c.before); const assignments = cols.filter(k => k !== c.key).map(k => `${k}=excluded.${k}`).join(',');
      db.prepare(`INSERT INTO ${c.table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) ON CONFLICT(${c.key}) DO UPDATE SET ${assignments}`).run(...cols.map(k => c.before[k]));
    }
  }
}
function backup(db, dir = path.join(__dirname, '..', 'data', 'backups')) {
  fs.mkdirSync(dir, { recursive: true });
  const target = path.join(dir, `comis-${Domain.day()}-${randomUUID()}.db`);
  db.prepare('VACUUM INTO ?').run(target);
  const { DatabaseSync } = require('node:sqlite'); const check = new DatabaseSync(target, { readOnly: true });
  try { if (check.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok') throw new Error('Backup integrity failed'); } finally { check.close(); }
  return target;
}
module.exports = { initialize, nextDocument, changes, undoRows, backup, normalizeInsertedTimes, KEYS };
