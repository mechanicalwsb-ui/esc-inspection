/* Session UI, reliable HTTP requests and reviewable offline operations. */
(function () {
  let syncing = false; let currentUser = null; let requestLocks = new Set(); let refreshTimer; let bootstrapCache = null;
  const editRevisions = new Map();
  let localTail = Promise.resolve();
  function captureRevision(url) { editRevisions.set(url, state.data.revisions?.[url] || 0); }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  async function http(url, method = 'GET', body = null, headers = {}) {
    let response;
    try { response = await fetch(url, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined, signal: AbortSignal.timeout(20000), cache: 'no-store' }); }
    catch (cause) { const e = new Error('ไม่สามารถเชื่อมต่อฐานข้อมูลกลาง'); e.network = true; e.cause = cause; throw e; }
    let result; try { result = await response.json(); } catch (_) { throw new Error('คำตอบจากเซิร์ฟเวอร์ไม่ถูกต้อง กรุณาตรวจที่อยู่เซิร์ฟเวอร์'); }
    if (!response.ok || result.ok === false) { const e = new Error(result.error || 'ทำรายการไม่สำเร็จ'); e.status = response.status; throw e; }
    return result;
  }
  async function authenticate() {
    const status = await http('/api/auth/status');
    if (status.user && !status.user.must_change) { currentUser = status.user; return; }
    return new Promise(resolve => {
      const overlay = document.createElement('div'); overlay.id = 'comis-login'; overlay.className = 'comis-login';
      overlay.innerHTML = `<form class="comis-login-card"><h2>${status.setupRequired ? 'ตั้งรหัสผ่านผู้ดูแลครั้งแรก' : status.user?.must_change ? 'เปลี่ยนรหัสผ่านชั่วคราว' : 'เข้าสู่ระบบ ESC Machine Center'}</h2><p>${status.setupRequired ? 'ทำรายการนี้จากเครื่องเซิร์ฟเวอร์ รหัสผ่านอย่างน้อย 10 ตัวอักษร' : 'ใช้รหัสพนักงานและรหัสผ่านที่ผู้ดูแลกำหนด'}</p>${!status.setupRequired && !status.user ? '<label>รหัสพนักงาน<input name="emp_code" required autocomplete="username"></label>' : ''}${status.user?.must_change ? '<label>รหัสผ่านปัจจุบัน<input name="current_password" type="password" required autocomplete="current-password"></label>' : ''}<label>${status.setupRequired || status.user ? 'รหัสผ่านใหม่' : 'รหัสผ่าน'}<input name="password" type="password" required ${status.setupRequired || status.user ? 'minlength="10"' : ''} maxlength="128" autocomplete="${status.setupRequired || status.user ? 'new-password' : 'current-password'}"></label><p class="comis-auth-error" role="alert"></p><button type="submit">${status.setupRequired ? 'ตั้งค่าและเข้าสู่ระบบ' : 'เข้าสู่ระบบ'}</button></form>`;
      document.body.append(overlay);
      overlay.querySelector('form').onsubmit = async e => {
        e.preventDefault(); const button = overlay.querySelector('button'); button.disabled = true;
        try {
          const payload = Object.fromEntries(new FormData(e.target));
          await http(status.setupRequired ? '/api/auth/setup' : status.user ? '/api/auth/password' : '/api/auth/login', 'POST', payload);
          const next = await http('/api/auth/status');
          if (next.user?.must_change) { overlay.remove(); await authenticate(); resolve(); return; }
          currentUser = next.user; overlay.remove(); resolve();
        } catch (err) { overlay.querySelector('[role="alert"]').textContent = err.message; }
        finally { button.disabled = false; }
      };
    });
  }
  async function initialize() {
    await ComisStore.initialize();
    if (ComisDomain.isStandalone()) return;
    bootstrapCache = await ComisStore.get('cache', 'bootstrap');
    try { await authenticate(); }
    catch (err) {
      window.ESC_FORCE_STANDALONE = true;
      currentUser = null;
      state.connectionMode = 'local_file';
      return;
    }
    const controls = document.createElement('div'); controls.id = 'comis-session-controls'; controls.className = 'comis-session-controls no-print';
    controls.innerHTML = '<span id="comis-sync-status"></span><button onclick="ComisSync.showQueue()">รายการรอส่ง</button><button onclick="ComisSync.password()">รหัสผ่าน</button><button onclick="ComisSync.logout()">ออกจากระบบ</button><span>v' + ComisDomain.version + '</span>';
    document.querySelector('header').after(controls);
    await updateQueueBadge();
    addEventListener('online', () => syncQueue());
    refreshTimer = setInterval(async () => {
      if (document.hidden || !currentUser || syncing || document.querySelector('#comis-login')) return;
      try {
        const result = await http('/api/bootstrap'); await remember(result.data); state.connectionMode = 'server';
        const changed=result.data.dataRevision !== state.data.dataRevision;
        if ((result.data.dataRevision ?? 0) >= (state.data.dataRevision ?? 0)) state.data = result.data;
        state.activeUser = result.data.users.find(u => u.id === currentUser.id) || currentUser;
        syncHeaderAndSidebar();
        // Preserve entered fields and scroll; only re-render live overview screens.
        if (changed && !document.querySelector('#app-modal:not(.hidden)') && ['routes', 'factory3d', 'dashboard'].includes(state.activeTab)) renderCurrentTab();
        await syncQueue();
      } catch (err) { if (err.status === 401) { currentUser = null; showToast('เซสชันหมดอายุ กรุณาเข้าสู่ระบบอีกครั้ง', 'warning'); } }
    }, 15000);
  }
  async function remember(data) { if ((data.dataRevision ?? 0) < (bootstrapCache?.data?.dataRevision ?? 0)) return; bootstrapCache = { id: 'bootstrap', data, savedAt: ComisDomain.timestamp() }; await ComisStore.put('cache', bootstrapCache); if (data.currentUser) currentUser = data.currentUser; }
  async function request(url, method = 'GET', body = null) {
    if (ComisDomain.isStandalone()) {
      const job = localTail.catch(() => {}).then(async () => {
        if (url === '/api/inspections' && method === 'POST') { const raw = getLocalDb(); ComisDomain.validateInspection(body, raw.machines.find(m => m.id === Number(body.machine_id)), raw.forms.find(f => f.id === Number(body.form_id))); }
        if (url === '/api/csv-import') { const raw=getLocalDb();ComisDomain.validateCsv(body,raw.departments,raw.machines); }
        const result = handleLocalApiRequest(url, method, body); await ComisStore.pending; updateServerStatusBanner('local_file'); return result;
      }); localTail = job; return job;
    }
    const mutation = method !== 'GET';
    const lock = mutation ? JSON.stringify([url, method, body]) : null;
    if (lock && requestLocks.has(lock)) throw new Error('กำลังบันทึกรายการนี้ กรุณารอ');
    if (lock) requestLocks.add(lock);
    const id = mutation ? ComisStore.requestId() : null;
    const entity = url.replace(/\/(clone|approve|join|draft)$/, '');
    const headers = mutation ? { 'Idempotency-Key': id } : {};
    if (['PUT', 'DELETE'].includes(method)) headers['If-Match'] = String(editRevisions.get(entity) ?? state.data.revisions?.[entity] ?? 0);
    if (body?.shared_draft_save && state.inspectSession.route_round_id) headers['If-Match'] = String(state.inspectSession.route_revision ?? state.data.revisions?.[entity] ?? 0);
    try {
      const result = await http(url, method, body, headers);
      if (mutation) editRevisions.delete(entity);
      if (result.data) await remember(result.data);
      updateServerStatusBanner('server'); return result;
    } catch (err) {
      if (!err.network) {
        if (err.status === 401) { await authenticate(); showToast('เข้าสู่ระบบแล้ว กรุณาตรวจข้อมูลและกดบันทึกอีกครั้ง', 'info'); }
        throw err;
      }
      updateServerStatusBanner('server_offline_fallback', 'ใช้ข้อมูลล่าสุดที่เก็บไว้ในเครื่อง รายการตรวจใหม่จะเข้าคิวรอส่ง');
      if (method === 'GET' && url === '/api/bootstrap' && bootstrapCache) return { ok: true, cached: true, data: bootstrapCache.data };
      const canQueue = url === '/api/inspections' && method === 'POST' || /^\/api\/route-rounds\/\d+$/.test(url) && method === 'PUT' && body?.shared_draft_save;
      if (!canQueue || !currentUser) throw new Error('ขาดการเชื่อมต่อ: รายการนี้ต้องบันทึกผ่านฐานกลาง กรุณาลองใหม่เมื่อเชื่อมต่อได้');
      if (url === '/api/inspections') ComisDomain.validateInspection(body, state.data.machines.find(m => m.id === Number(body.machine_id)), state.data.forms.find(f => f.id === Number(body.form_id)));
      await ComisStore.put('queue', { id, userId: currentUser.id, url, method, body, headers, status: 'pending', createdAt: ComisDomain.timestamp() });
      await updateQueueBadge();
      return { ok: true, queued: true, request_id: id, data: state.data };
    } finally { if (lock) requestLocks.delete(lock); }
  }
  let syncPromise = null;
  async function syncQueue() {
    if (syncPromise) return syncPromise;
    syncPromise = performSync();
    try { return await syncPromise; } finally { syncPromise = null; }
  }
  async function performSync() {
    if (syncing || !currentUser || ComisDomain.isStandalone()) return;
    syncing = true;
    try {
      for (const item of (await ComisStore.list('queue')).sort((a,b) => a.createdAt.localeCompare(b.createdAt))) {
        if (item.userId !== currentUser.id || item.status !== 'pending') continue;
        try { const result = await http(item.url, item.method, item.body, item.headers); if (result.data) { await remember(result.data); state.data = result.data; } await ComisStore.remove('queue', item.id); updateServerStatusBanner('server'); showToast('ส่งรายการตรวจเข้าฐานกลางแล้ว', 'success'); }
        catch (err) { if (err.network || err.status === 401) break; item.status = 'needs_review'; item.error = err.message; await ComisStore.put('queue', item); showToast('มีรายการรอส่งที่ต้องตรวจแก้ กรุณาเปิดรายการรอส่ง', 'warning'); }
      }
      try { const latest = await http('/api/bootstrap'); await remember(latest.data); if ((latest.data.dataRevision ?? 0) >= (state.data.dataRevision ?? 0)) state.data = latest.data; syncHeaderAndSidebar(); } catch (_) { /* Retain the last committed cache when offline. */ }
    } finally { syncing = false; await updateQueueBadge(); }
  }
  async function updateQueueBadge() {
    const items = (await ComisStore.list('queue')).filter(x => x.userId === currentUser?.id); const label = document.getElementById('comis-sync-status');
    if (label) label.textContent = `${currentUser?.full_name || ''} · รอส่ง ${items.filter(x => x.status === 'pending').length} · ต้องตรวจแก้ ${items.filter(x => x.status === 'needs_review').length}`;
  }
  async function showQueue() {
    const items = (await ComisStore.list('queue')).filter(x => x.userId === currentUser?.id);
    openModal('รายการที่เก็บในเครื่องและรอส่งฐานกลาง', `<p>ข้อมูลยังไม่เข้าฐานกลางจนกว่าจะส่งสำเร็จ รายการของบัญชีอื่นจะส่งเมื่อเจ้าของเข้าสู่ระบบ</p>${items.map(x => `<div class="comis-queue-item"><strong>${escape(x.createdAt)} · ${escape(x.body.machine_id || x.url)}</strong><p>${escape(x.error || 'รอเชื่อมต่อเพื่อส่ง')}</p><button onclick="ComisSync.exportItem('${x.id}')">ดาวน์โหลดข้อมูล</button>${x.status === 'needs_review' ? `<button onclick="ComisSync.review('${x.id}')">ตรวจและแก้รายการ</button>` : ''}<button onclick="ComisSync.discard('${x.id}')">ลบรายการรอส่ง</button></div>`).join('') || '<p>ไม่มีรายการรอส่ง</p>'}<button onclick="ComisSync.syncQueue()">ลองส่งรายการอีกครั้ง</button>`);
  }
  async function exportItem(id) { const item = await ComisStore.get('queue', id); if (!item || item.userId !== currentUser?.id) return; const a = document.createElement('a'); const u = URL.createObjectURL(new Blob([JSON.stringify(item, null, 2)], {type:'application/json'})); a.href=u; a.download=`ESC-pending-${id}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(u), 1000); }
  async function review(id) {
    const item = await ComisStore.get('queue', id); if (!item || item.userId !== currentUser?.id) return;
    const result = await http('/api/bootstrap'); await remember(result.data); updateStateData(result.data); closeModal();
    if (item.body.shared_draft_save) {
      const draft=item.body.shared_draft_save; const roundId=Number(item.url.split('/')[3]);
      startInspectionForMachine(draft.machine_id, null, roundId);
      const current={...state.inspectSession.answers};
      for (const [field,answer] of Object.entries(draft.answers || {})) {
        if (current[field] && JSON.stringify(current[field])!==JSON.stringify(answer) && !confirm(`ข้อ ${answer.label || field}: ค่าล่าสุด ${current[field].value} โดย ${current[field].checked_by || '-'} เทียบกับค่าที่รอส่ง ${answer.value}\nใช้ค่าที่รอส่งแทนค่าล่าสุดหรือไม่?`)) continue;
        current[field]=answer;
      }
      state.inspectSession.answers=current;state.inspectSession.queuedReviewId=id;renderCurrentTab();showToast('ตรวจคำตอบที่รวมแล้ว ก่อนกดบันทึกแบบร่างร่วม', 'info');return;
    }
    if (item.body.inspection_type==='emergency_quick') {
      openEmergencyQuickEntryModal(item.body.machine_id);
      emergencyQuickDraft.selected_fields=Object.fromEntries(item.body.answers.map(a=>[a.field_id,a])); emergencyQuickDraft.photo_data=item.body.answers.find(a=>a.photo)?.photo||''; emergencyQuickDraft.queuedReviewId=id;
      const note=document.getElementById('emg-symptom-note');if(note)note.value=item.body.inspector_note||'';showToast('ตรวจรายการฉุกเฉินเดิมและกดบันทึกใหม่เมื่อพร้อม', 'info');return;
    }
    startInspectionForMachine(item.body.machine_id, item.body.route_id, item.body.route_round_id);
    state.inspectSession.form_id = item.body.form_id; state.inspectSession.answers = Object.fromEntries(item.body.answers.map(a => [a.field_id, a])); state.inspectSession.inspector_note = item.body.inspector_note || ''; state.inspectSession.queuedReviewId = id; renderCurrentTab();
    showToast('ตรวจคำตอบและลงลายเซ็นใหม่ก่อนบันทึก รายการเดิมจะลบเมื่อบันทึกใหม่สำเร็จ', 'info');
  }
  async function discard(id) { if (!confirm('ลบรายการที่ยังไม่ส่ง? ดาวน์โหลดข้อมูลเก็บไว้ก่อนได้')) return; const item=await ComisStore.get('queue', id); if(item?.userId!==currentUser?.id)return; await ComisStore.remove('queue', id); await updateQueueBadge(); await showQueue(); }
  async function logout() { try { await http('/api/auth/logout','POST',{}); } catch(e) { showToast('ยังออกจากระบบไม่ได้ กรุณาเชื่อมต่อเซิร์ฟเวอร์', 'error'); return; } currentUser=null; await ComisStore.remove('cache','bootstrap'); location.reload(); }
  async function password(userId = null) {
    const adminReset = userId && userId !== currentUser?.id;
    openModal(adminReset ? 'ตั้งรหัสผ่านชั่วคราวให้ผู้ใช้งาน' : 'เปลี่ยนรหัสผ่าน', `<form id="comis-password-form">${!adminReset ? '<label>รหัสผ่านปัจจุบัน<input type="password" name="current_password" required autocomplete="current-password"></label>' : ''}<label>รหัสผ่านใหม่ (10–128 ตัวอักษร)<input type="password" name="password" minlength="10" maxlength="128" required autocomplete="new-password"></label><button type="submit">บันทึก</button></form>`);
    document.getElementById('comis-password-form').onsubmit=async e=>{e.preventDefault();try{await http('/api/auth/password','POST',{...Object.fromEntries(new FormData(e.target)),user_id:userId});closeModal();showToast('ตั้งรหัสผ่านแล้ว','success');}catch(err){showToast(err.message,'error');}};
  }
  function applyPermissions() {
    if (ComisDomain.isStandalone() || !currentUser) return;
    const admin = currentUser.role === 'super_admin'; const lead = admin || currentUser.role === 'dept_admin';
    for (const button of document.querySelectorAll('[onclick]')) {
      const action = button.getAttribute('onclick');
      const manage = /(?:openMachineModal|saveMachine|deleteMachine|cloneMachine|startFormBuilder|cloneFormTemplate|deleteFormTemplate|openDepartmentModal|deleteDepartment|openUserModal|deleteUser|saveSystemSettings|testTelegramAlert|undoSystemAuditLog|resetStandaloneDemoData|openRouteModal|deleteRoute\(|confirmCsvBulkImport|toggleMachinePlacementEditor)/.test(action);
      const approve = /approveInspectionRecord|openDefectModal/.test(action);
      const write = /startInspectionForMachine|openEmergencyQuickEntryModal|openStartRouteRoundModal|joinRouteRound|saveSharedCoInspectionDraft|submitInspectionForm/.test(action);
      if (manage && !admin || approve && !lead || write && currentUser.role === 'viewer') { button.disabled = true; button.classList.add('comis-permission-disabled'); button.title = 'ไม่มีสิทธิ์ทำรายการนี้'; }
    }
    for (const tab of ['users','departments','csvimport']) { const button=document.querySelector(`[data-tab="${tab}"]`); if (button && !admin) button.hidden=true; }
  }
  window.ComisSync = { initialize, request, syncQueue, showQueue, discard, review, exportItem, password, logout, applyPermissions, captureRevision, get user() { return currentUser; } };
})();
