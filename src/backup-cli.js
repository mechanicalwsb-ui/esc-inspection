// Run against a stopped server when restoring. The existing database is retained.
const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');
const { backup } = require('./reliability');
const target = process.env.COMIS_DB_PATH || path.join(__dirname, '..', 'data', 'comis.db');
const [command = 'backup', source] = process.argv.slice(2);
function check(file) { const db = new DatabaseSync(path.resolve(file), { readOnly: true }); try { if (db.prepare('PRAGMA integrity_check').get().integrity_check !== 'ok' || db.prepare('PRAGMA foreign_key_check').all().length) throw new Error('ฐานข้อมูลไม่ผ่านการตรวจ'); for(const name of ['machines','users','inspections','audit_logs']) db.prepare(`SELECT COUNT(*) FROM ${name}`).get(); } finally { db.close(); } }
if (command === 'backup') { const db = new DatabaseSync(target, { readOnly: true }); try { console.log(backup(db, path.join(path.dirname(target),'backups'))); } finally { db.close(); } }
else if (command === 'check' && source) { check(source); console.log('Backup integrity and foreign keys: OK'); }
else if (command === 'restore' && source) {
  if (!process.argv.includes('--server-stopped')) throw new Error('หยุดเซิร์ฟเวอร์ก่อน แล้วเพิ่ม --server-stopped');
  check(source);
  const db = new DatabaseSync(target, { readOnly: true }); try { console.log('Retained:', backup(db, path.join(path.dirname(target),'backups'))); } finally { db.close(); }
  const temp = target + '.restore-' + Date.now(); fs.copyFileSync(path.resolve(source), temp); check(temp); fs.renameSync(temp, target); console.log('Restored:', target);
} else throw new Error('Usage: node src/backup-cli.js backup | check <backup.db> | restore <backup.db> --server-stopped');
