/* Hub accounts use the existing authenticated COMIS API. No browser-stored roles. */
(() => {
  'use strict';
  const el = id => document.getElementById(id);
  const roles = { super_admin: 'Admin', dept_admin: 'ผู้อนุมัติ / หัวหน้าแผนก', inspector: 'ผู้ตรวจ', viewer: 'ผู้ดูข้อมูล' };
  let user = null, data = null, online = false, settingsRevision = 0;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const style = document.createElement('style');
  style.textContent = '.hub-account{margin:16px auto;padding:16px;max-width:1180px;border:1px solid #a7d7bf;border-radius:16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}.hub-account p{flex:1;margin:0}.hub-dialog{width:min(900px,94vw);max-height:90vh;padding:24px;border:1px solid #a7d7bf;border-radius:20px;overflow:auto}.hub-dialog label{display:grid;gap:6px;margin:12px 0}.hub-dialog input,.hub-dialog select{padding:10px;border:1px solid #b9c8c0;border-radius:8px;width:100%;box-sizing:border-box}.hub-dialog button,.hub-account button{padding:9px 14px;border:1px solid #86b59a;border-radius:9px;cursor:pointer}.hub-dialog table{width:100%;border-collapse:collapse}.hub-dialog th,.hub-dialog td{padding:10px;text-align:left;border-bottom:1px solid #ccc}.hub-error{color:#b42318;white-space:pre-wrap}.hub-actions{display:flex;gap:8px;flex-wrap:wrap}[data-hub-admin][hidden]{display:none!important}';
  document.head.append(style);
  const bar = document.createElement('section');
  bar.className = 'hub-account';
  bar.innerHTML = '<p id="hubIdentity" role="status">กำลังตรวจสอบระบบบัญชี…</p><button id="hubLogin">เข้าสู่ระบบ</button><button id="hubUsers" hidden>ผู้ใช้และการมอบหมาย</button><button id="hubPassword" hidden>เปลี่ยนรหัสผ่าน</button><button id="hubLogout" hidden>ออกจากระบบ</button>';
  (document.querySelector('main') || document.body).prepend(bar);
  function dialog(id, title, content) {
    const d = document.createElement('dialog'); d.id = id; d.className = 'hub-dialog';
    d.innerHTML = `<div class="hub-actions"><h2 style="flex:1">${title}</h2><button type="button" data-dismiss>ปิด</button></div>${content}<p class="hub-error" role="alert"></p>`;
    d.querySelector('[data-dismiss]').onclick = () => d.close(); document.body.append(d); return d;
  }
  const loginDialog = dialog('hubLoginDialog', 'เข้าสู่ระบบ', '<form id="hubLoginForm"><label>รหัสพนักงาน<input name="emp_code" required autocomplete="username"></label><label>รหัสผ่าน<input name="password" type="password" required autocomplete="current-password"></label><button>เข้าสู่ระบบ</button></form>');
  const passwordDialog = dialog('hubPasswordDialog', 'เปลี่ยนรหัสผ่าน', '<form id="hubPasswordForm"><label>รหัสผ่านปัจจุบัน<input name="current_password" type="password" required autocomplete="current-password"></label><label>รหัสผ่านใหม่ (10–128 ตัวอักษร)<input name="password" type="password" minlength="10" maxlength="128" required autocomplete="new-password"></label><button>บันทึกรหัสผ่าน</button></form>');
  const usersDialog = dialog('hubUsersDialog', 'ผู้ใช้และการมอบหมาย', '<p>Admin กำหนดสิทธิ์ กลุ่มงาน/แผนก และตำแหน่งงานของแต่ละบัญชี</p><div class="hub-actions"><button id="hubAddUser">เพิ่มผู้ใช้</button><a href="/" target="_blank" rel="noopener">จัดการแผนกในระบบหลัก</a></div><label>ค้นหาผู้ใช้<input id="hubUserSearch" type="search" placeholder="ชื่อ รหัสพนักงาน กลุ่มงาน หรือตำแหน่ง"></label><div style="overflow:auto"><table><thead><tr><th>ผู้ใช้</th><th>กลุ่มงาน / แผนก</th><th>ตำแหน่ง</th><th>สิทธิ์</th><th>จัดการ</th></tr></thead><tbody id="hubUserRows"></tbody></table></div>');
  const editDialog = dialog('hubEditDialog', 'ข้อมูลผู้ใช้', '<form id="hubEditForm"><label>รหัสพนักงาน<input name="emp_code" required maxlength="80"></label><label>ชื่อ-นามสกุล<input name="full_name" required maxlength="160"></label><label>กลุ่มงาน / แผนก<select name="department_id" required></select></label><label>ตำแหน่งงาน<input name="position" required maxlength="160" placeholder="เช่น ช่างประจำกะ หรือหัวหน้ากะ"></label><label>สิทธิ์ใช้งานระบบ<select name="role"></select></label><button>บันทึกการมอบหมาย</button></form>');
  const resetDialog = dialog('hubResetDialog', 'ตั้งรหัสผ่านชั่วคราว', '<p>ผู้ใช้ต้องเปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบ</p><form id="hubResetForm"><label>รหัสผ่านชั่วคราว<input name="password" type="password" minlength="10" maxlength="128" required autocomplete="new-password"></label><button>ตั้งรหัสผ่าน</button></form>');
  async function api(url, method = 'GET', body, revision) {
    const response = await fetch(url, { method, credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...(revision === undefined ? {} : { 'If-Match': String(revision) }) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    if (!(response.headers.get('content-type') || '').includes('application/json')) throw Error('หน้านี้ไม่ได้เชื่อมต่อเซิร์ฟเวอร์ระบบบัญชี');
    const result = await response.json();
    if (!response.ok || result.ok === false) { if (response.status === 401) { user = null; updateAccess(); } throw Error(result.error || 'ทำรายการไม่สำเร็จ'); }
    return result;
  }
  function admin() { return online && user?.role === 'super_admin' && !user.must_change; }
  function updateAccess() {
    el('hubUsers').hidden = !admin(); el('hubLogin').hidden = !online || Boolean(user);
    el('hubLogout').hidden = !user; el('hubPassword').hidden = !user;
    const department = data?.departments?.find(d => Number(d.id) === Number(user?.department_id));
    el('hubIdentity').textContent = user ? `${user.full_name} · ${roles[user.role]} · ${department?.name || 'ยังไม่มอบหมายกลุ่มงาน'} · ${user.position || 'ยังไม่ระบุตำแหน่ง'}` : online ? 'เข้าสู่ระบบเพื่อจัดการบัญชีและการตั้งค่ากลาง' : 'โหมดคลังแบบฟอร์มอิสระ — จัดการบัญชีและสิทธิ์ร่วมกันได้เมื่อเปิดผ่านเซิร์ฟเวอร์ COMIS';
    for (const id of ['btnMenuSettings', 'btnMenuSigners', 'btnMenuAdmin']) { const button = el(id); if (button) { button.dataset.hubAdmin = ''; button.hidden = !admin(); } }
    if (!admin()) for (const d of [usersDialog, editDialog, resetDialog, el('settingsDialog'), el('signerDialog'), el('adminDialog')]) if (d?.open) d.close();
  }
  async function refresh() {
    const status = await api('/api/auth/status'); online = true; user = status.user;
    data = user && !user.must_change ? (await api('/api/bootstrap')).data : null;
    updateAccess();
    if (status.setupRequired) el('hubIdentity').innerHTML = 'ยังไม่ได้ตั้งบัญชี Admin — <a href="/">ตั้งค่าครั้งแรกจากหน้าแรกบนเครื่องเซิร์ฟเวอร์</a>';
    if (user?.must_change) passwordDialog.showModal();
    if (user && !user.must_change) await loadDefaults();
  }
  async function action(d, callback) {
    d.querySelector('.hub-error').textContent = '';
    const buttons = [...d.querySelectorAll('button')]; buttons.forEach(b => b.disabled = true);
    try { await callback(); } catch (e) { d.querySelector('.hub-error').textContent = e.message; }
    finally { buttons.forEach(b => b.disabled = false); }
  }
  el('hubLogin').onclick = () => loginDialog.showModal();
  el('hubPassword').onclick = () => passwordDialog.showModal();
  el('hubLoginForm').onsubmit = e => { e.preventDefault(); action(loginDialog, async () => { await api('/api/auth/login', 'POST', Object.fromEntries(new FormData(e.target))); e.target.reset(); loginDialog.close(); await refresh(); }); };
  el('hubPasswordForm').onsubmit = e => { e.preventDefault(); action(passwordDialog, async () => { await api('/api/auth/password', 'POST', Object.fromEntries(new FormData(e.target))); e.target.reset(); passwordDialog.close(); await refresh(); }); };
  el('hubLogout').onclick = async () => { try { await api('/api/auth/logout', 'POST', {}); user = null; data = null; updateAccess(); } catch (e) { el('hubIdentity').textContent = e.message; } };
  function renderUsers() {
    const search = el('hubUserSearch').value.trim().toLowerCase();
    el('hubUserRows').innerHTML = (data?.users || []).filter(u => u.is_active && [u.full_name,u.emp_code,u.position,u.department_name].join(' ').toLowerCase().includes(search)).map(u => `<tr><td>${escape(u.full_name)}<br><small>${escape(u.emp_code)}</small></td><td>${escape(u.department_name || 'ยังไม่มอบหมาย')}</td><td>${escape(u.position || '—')}</td><td>${escape(roles[u.role])}</td><td><button data-edit="${u.id}">แก้ไข</button> <button data-password="${u.id}">ตั้งรหัสผ่าน</button></td></tr>`).join('');
    el('hubUserRows').querySelectorAll('[data-edit]').forEach(b => b.onclick = () => editUser(Number(b.dataset.edit)));
    el('hubUserRows').querySelectorAll('[data-password]').forEach(b => b.onclick = () => { if (Number(b.dataset.password) === user.id) { passwordDialog.showModal(); return; } resetDialog.dataset.userId = b.dataset.password; el('hubResetForm').reset(); resetDialog.querySelector('.hub-error').textContent = ''; resetDialog.showModal(); });
  }
  el('hubUsers').onclick = () => { usersDialog.showModal(); action(usersDialog, async () => { await refresh(); if (!admin()) throw Error('เฉพาะ Admin เท่านั้น'); renderUsers(); }); };
  el('hubUserSearch').oninput = renderUsers;
  let editing = null, editRevision = 0;
  function editUser(id) {
    if (!admin()) return;
    editing = data.users.find(u => u.id === id) || null;
    editRevision = data.revisions?.['/api/users/' + id] || 0;
    const form = el('hubEditForm'); form.reset();
    form.elements.department_id.innerHTML = '<option value="">เลือกกลุ่มงาน / แผนก</option>' + data.departments.map(d => `<option value="${d.id}">${escape(d.plant_name)} / ${escape(d.name)}</option>`).join('');
    form.elements.role.innerHTML = Object.entries(roles).map(([key, label]) => `<option value="${key}">${label}</option>`).join('');
    for (const name of ['emp_code','full_name','department_id','position','role']) form.elements[name].value = editing?.[name] ?? (name === 'role' ? 'inspector' : '');
    editDialog.querySelector('.hub-error').textContent = ''; editDialog.showModal();
  }
  el('hubAddUser').onclick = () => editUser(null);
  el('hubEditForm').onsubmit = e => {
    e.preventDefault(); action(editDialog, async () => {
      if (!admin()) throw Error('เฉพาะ Admin เท่านั้น');
      const body = { ...(editing || {}), ...Object.fromEntries(new FormData(e.target)) }; body.department_id = Number(body.department_id);
      await api(editing ? '/api/users/' + editing.id : '/api/users', editing ? 'PUT' : 'POST', body, editing ? editRevision : undefined);
      await refresh(); renderUsers(); editDialog.close();
    });
  };
  el('hubResetForm').onsubmit = e => { e.preventDefault(); action(resetDialog, async () => { await api('/api/auth/password','POST',{user_id:Number(resetDialog.dataset.userId),password:e.target.elements.password.value}); e.target.reset(); resetDialog.close(); await refresh(); }); };
  function applyDefaults(settings) {
    localStorage.setItem('ESC_GLOBAL_SETTINGS_V1', JSON.stringify(settings));
    localStorage.setItem('ESC_DUMP_TRUCK_YEAR_DEFAULT_V1', settings.year || '');
    localStorage.setItem('ESC_GLOBAL_PRODUCTION_YEAR', settings.year || '');
    if (typeof loadGlobalSettings === 'function') loadGlobalSettings();
  }
  async function loadDefaults() {
    const result = await api('/api/hub-settings'); settingsRevision = result.revision;
    if (Object.keys(result.settings).length) applyDefaults(result.settings);
  }
  const settingsForm = el('globalSettingsForm');
  if (settingsForm) settingsForm.onsubmit = e => {
    e.preventDefault();
    action(el('settingsDialog'), async () => {
      if (!admin()) throw Error('เฉพาะ Admin เท่านั้น');
      const fields = {year:'cfgYear',shift:'cfgShift',dept:'cfgDept',section:'cfgSection',factory:'cfgFactory',printDpi:'cfgPrintDpi',autoLock:'cfgAutoLock'};
      const settings = Object.fromEntries(Object.entries(fields).map(([key,id]) => [key,el(id).value.trim()]));
      await api('/api/hub-settings','PUT',settings,settingsRevision); applyDefaults(settings); settingsRevision++; el('settingsDialog').close();
    });
  };
  // Existing dialogs need an inline status area for failed saves.
  if (el('settingsDialog')) { const error = document.createElement('p'); error.className = 'hub-error'; error.setAttribute('role','alert'); el('settingsDialog').append(error); }
  const openSettings = el('btnMenuSettings')?.onclick;
  if (openSettings) el('btnMenuSettings').onclick = () => { if (!admin()) return; openSettings(); action(el('settingsDialog'), loadDefaults); };
  updateAccess();
  if (location.protocol === 'http:' || location.protocol === 'https:') refresh().catch(() => { online = false; user = null; updateAccess(); });
})();
