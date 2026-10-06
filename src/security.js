const { randomBytes, scryptSync, timingSafeEqual, createHash } = require('node:crypto');
const Domain = require('../public/js/domain');
const hashToken = token => createHash('sha256').update(token).digest('hex');
function initialize(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS credentials (user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE, salt TEXT NOT NULL, hash TEXT NOT NULL, must_change INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, expires_at INTEGER NOT NULL);`);
}
function setPassword(db, userId, password, temporary = false) {
  Domain.assert(typeof password === 'string' && password.length >= 10 && password.length <= 128, 'รหัสผ่านต้องยาว 10–128 ตัวอักษร');
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  db.prepare('INSERT INTO credentials VALUES (?, ?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET salt=excluded.salt,hash=excluded.hash,must_change=excluded.must_change').run(userId, salt, hash, temporary ? 1 : 0);
  db.prepare('DELETE FROM sessions WHERE user_id=?').run(userId);
}
function verify(db, userId, password) {
  const c = db.prepare('SELECT * FROM credentials WHERE user_id=?').get(userId);
  if (!c || typeof password !== 'string' || password.length > 128) return false;
  return timingSafeEqual(Buffer.from(c.hash, 'hex'), scryptSync(password, c.salt, 64));
}
function issue(db, res, userId, secure) {
  const token = randomBytes(32).toString('hex');
  db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());
  db.prepare('INSERT INTO sessions VALUES (?, ?, ?)').run(hashToken(token), userId, Date.now() + 8 * 3600000);
  res.setHeader('Set-Cookie', `comis_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${secure ? '; Secure' : ''}`);
}
function current(db, req) {
  const token = /(?:^|;\s*)comis_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1];
  if (!token) return null;
  return db.prepare('SELECT u.*, c.must_change FROM sessions s JOIN users u ON u.id=s.user_id JOIN credentials c ON c.user_id=u.id WHERE s.token_hash=? AND s.expires_at>? AND u.is_active=1').get(hashToken(token), Date.now()) || null;
}
function logout(db, req, res) {
  const token = /comis_session=([a-f0-9]{64})/.exec(req.headers.cookie || '')?.[1];
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hashToken(token));
  res.setHeader('Set-Cookie', 'comis_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
}
function allowed(role, url, method) {
  if (role === 'super_admin') return true;
  if (method === 'GET') return !url.startsWith('/api/system/') && url !== '/api/settings';
  if (role === 'viewer') return false;
  if (url === '/api/source-records' && method === 'POST') return true;
  if (url === '/api/inspections' && method === 'POST') return true;
  if (url === '/api/route-rounds' && method === 'POST' || /^\/api\/route-rounds\/\d+(?:\/join|\/draft)?$/.test(url) && method === 'PUT') return true;
  if (url === '/api/defects' && method === 'POST') return true;
  return role === 'dept_admin' && (/^\/api\/inspections\/\d+\/approve$/.test(url) || /^\/api\/defects\/\d+$/.test(url)) && method === 'PUT';
}
function publicUser(user) { if (!user) return null; const { id, emp_code, full_name, role, department_id, must_change } = user; return { id, emp_code, full_name, role, department_id, must_change: Boolean(must_change) }; }
module.exports = { initialize, setPassword, verify, issue, current, logout, allowed, publicUser };
