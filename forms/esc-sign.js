/* ESC shared signature module — same behaviour as the ML-02/09/10/11 signing system:
 * full-screen pointer signing (finger / pen / mouse), signer directory (name + position),
 * signed time + GPS, enforced signing order, lock when every role has signed, unlock with code.
 * Usage: ESCSign.init({ formId, mount, roles:[{id,title,after:[]}], ready(), onChange(), lockScope, lockControls })
 */
(function () {
  'use strict';
  const DIRECTORY_KEY = 'ESC_TURBINE_SIGNER_DIRECTORY_V1'; // shared with ML-02/09/10/11
  const UNLOCK_CODE = '1234';
  const INK = '#173724';
  const FONT = 'Sarabun, "Sarabun Web", "TH Sarabun", sans-serif';

  let cfg = null, roles = [], byId = {}, signatures = {}, signers = {}, directory = [];
  let signingRole = null, draft = [], activePointer = null, locatingGPS = false, wasLocked = false;
  const el = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); kids.forEach(k => e.append(k)); return e; };
  const q = id => document.getElementById(id);

  /* ---------- directory ---------- */
  function loadDirectory() {
    try {
      const d = JSON.parse(localStorage.getItem(DIRECTORY_KEY) || '[]');
      if (Array.isArray(d)) directory = d.filter(i => i && typeof i.name === 'string' && typeof i.position === 'string')
        .map(i => ({ ...i, formScope: Array.isArray(i.formScope) && i.formScope.length ? i.formScope : ['ALL'] }));
    } catch { directory = []; }
  }
  function storeDirectory() { try { localStorage.setItem(DIRECTORY_KEY, JSON.stringify(directory)); return true; } catch { return false; } }
  function addDirectory(name, position) {
    if (name && position && !directory.some(i => i.name === name && i.position === position)) directory.push({ name, position, formScope: ['ALL'] });
  }
  function allowedHere(s) {
    if (!s.formScope || s.formScope.includes('ALL')) return true;
    const ctx = cfg.formId + ' ' + document.title;
    return s.formScope.some(sc => (sc === 'milling' && /ML|ลูกหีบ/i.test(ctx)) || (sc === 'prod' && /PD|ผลิต/i.test(ctx)) ||
      (sc === 'maintenance' && /MR|ซ่อมบำรุง/i.test(ctx)) || ctx.includes(sc));
  }

  /* ---------- state helpers ---------- */
  const isLocked = () => roles.every(r => Boolean(signatures[r.id]));
  const priorComplete = id => (byId[id].after || []).every(a => Boolean(signatures[a]));
  function waitingText(id) {
    const missing = (byId[id].after || []).filter(a => !signatures[a]).map(a => byId[a].title);
    return missing.length ? 'รอ ' + missing.join(', ') + ' เซ็นก่อน' : '';
  }
  function dependents(id) { // every role that (transitively) must sign after `id`
    const out = new Set(), walk = x => roles.forEach(r => { if ((r.after || []).includes(x) && !out.has(r.id)) { out.add(r.id); walk(r.id); } });
    walk(id); return [...out];
  }
  function readiness() {
    try { const r = cfg.ready ? cfg.ready() : true; return r === true || r === undefined ? { ok: true } : r === false ? { ok: false, msg: '' } : r; }
    catch { return { ok: true }; }
  }
  function changed() { render(); updateLock(); if (cfg.onChange) cfg.onChange(); }

  /* ---------- drawing ---------- */
  function grid(ctx, w, h) {
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#e4ebe6'; ctx.lineWidth = 1;
    const step = Math.max(18, Math.min(w, h) / 12); ctx.beginPath();
    for (let x = step; x < w; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
    for (let y = step; y < h; y += step) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
    ctx.stroke();
  }
  function ink(ctx, strokes, x, y, w, h, lw) {
    ctx.save(); ctx.strokeStyle = INK; ctx.fillStyle = INK; ctx.lineWidth = lw || Math.max(1.5, Math.min(7, Math.min(w, h) / 30));
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const s of strokes) {
      ctx.beginPath(); s.forEach((p, i) => i ? ctx.lineTo(x + p[0] * w, y + p[1] * h) : ctx.moveTo(x + p[0] * w, y + p[1] * h)); ctx.stroke();
      if (s.length === 1) { ctx.beginPath(); ctx.arc(x + s[0][0] * w, y + s[0][1] * h, ctx.lineWidth / 2, 0, Math.PI * 2); ctx.fill(); }
    }
    ctx.restore();
  }
  // Fit the signature ink, keeping its aspect ratio, centred inside the box.
  function fitInk(ctx, sig, x, y, w, h, lw) {
    const pts = sig.strokes.flat(); if (!pts.length) return;
    const minX = Math.min(...pts.map(p => p[0])), maxX = Math.max(...pts.map(p => p[0]));
    const minY = Math.min(...pts.map(p => p[1])), maxY = Math.max(...pts.map(p => p[1]));
    const dx = Math.max(.02, maxX - minX), dy = Math.max(.02, maxY - minY), aspect = sig.aspect || 1200 / 450;
    const scale = Math.min(w / (dx * aspect), h / dy), iw = dx * aspect * scale, ih = dy * scale;
    const norm = sig.strokes.map(s => s.map(p => [(p[0] - minX) / dx, (p[1] - minY) / dy]));
    ink(ctx, norm, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih, lw);
  }
  const thaiTime = iso => new Date(iso).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false }) + ' น.';
  function gpsText(gps) {
    if (gps?.status === 'ok') return 'GPS ' + gps.latitude.toFixed(6) + ', ' + gps.longitude.toFixed(6) + (Number.isFinite(gps.accuracy) ? ' • ±' + Math.round(gps.accuracy) + ' ม.' : '');
    return 'GPS: ' + ({ denied: 'ไม่ได้รับอนุญาต', timeout: 'หมดเวลาค้นหาตำแหน่ง', unavailable: 'ไม่พบตำแหน่ง', unsupported: 'อุปกรณ์ไม่รองรับ' }[gps?.status] || 'ไม่ได้บันทึก');
  }
  function getGPS() {
    return new Promise(resolve => {
      if (!navigator.geolocation) { resolve({ status: 'unsupported' }); return; }
      navigator.geolocation.getCurrentPosition(
        p => resolve({ status: 'ok', latitude: p.coords.latitude, longitude: p.coords.longitude, accuracy: p.coords.accuracy, capturedAt: new Date(p.timestamp).toISOString() }),
        e => resolve({ status: e.code === 1 ? 'denied' : e.code === 3 ? 'timeout' : 'unavailable' }),
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
    });
  }

  /* ---------- UI ---------- */
  function injectStyle() {
    if (q('escSignStyle')) return;
    document.head.append(el('style', { id: 'escSignStyle', textContent: `
.esc-sign{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px}
.esc-sign-note{grid-column:1/-1;margin:0;font-size:13px;color:#456a50}
.esc-sigcard{background:#fff;border:1px solid #ccdace;border-radius:8px;padding:12px;min-width:0;text-align:left}
.esc-sigcard h3{font-size:15px;margin:0 0 8px;text-align:center;color:#173724}
.esc-sigcard label{display:block;font-size:13px;margin:0 0 6px;color:#536257}
.esc-sigcard select{display:block;width:100%;margin-top:4px;font:inherit;font-size:16px;padding:8px;min-height:44px;box-sizing:border-box}
.esc-sigpreview{position:relative;height:150px;border:1px dashed #a5bba9;border-radius:6px;background:#fbfdfb;overflow:hidden;display:flex;align-items:center;justify-content:center;margin:8px 0;user-select:none;-webkit-user-select:none}
.esc-sigpreview canvas{width:100%;height:100%;display:block}
.esc-sigpreview span{font-size:13px;color:#718474;text-align:center;padding:0 8px}
.esc-sigpreview span strong{display:block;color:#b42318;margin-top:6px}
.esc-sigbuttons{display:flex;gap:8px}.esc-sigbuttons button{flex:1;min-height:44px;font:inherit;font-size:14px;cursor:pointer}
.esc-sigdialog{position:fixed;inset:0;margin:0;width:100vw;max-width:none;height:100vh;height:100dvh;max-height:none;border:0;border-radius:0;padding:max(16px,env(safe-area-inset-top)) 16px max(16px,env(safe-area-inset-bottom));box-sizing:border-box;overflow:hidden;font-family:${FONT}}
.esc-sigdialog[open]{display:flex;flex-direction:column;gap:8px}
.esc-sigdialog h2{margin:0;font-size:20px;color:#173724}.esc-sigdialog p{margin:2px 0;font-size:14px}
.esc-sigdialog canvas{flex:1;min-height:80px;width:100%;border:1px solid #a5bba9;border-radius:6px;touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none}
.esc-sigdialog .esc-actions{display:flex;gap:10px;flex-wrap:wrap}.esc-sigdialog button{min-height:44px;padding:8px 16px;font:inherit;font-size:15px;cursor:pointer}
.esc-primary{background:#185929;color:#fff;border:1px solid #185929;border-radius:6px}
.esc-lock-notice{padding:12px 14px;border:1px solid #8bb499;background:#e6f2e8;border-radius:8px;margin:0 0 12px;font-weight:bold;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.esc-lock-notice[hidden]{display:none}
.esc-modal{width:min(900px,96vw);max-height:90vh;overflow:auto;border:1px solid #c5d5c9;border-radius:10px;padding:22px;font-family:${FONT}}
.esc-modal table{width:100%;min-width:520px;border-collapse:collapse;font-size:14px}.esc-modal th,.esc-modal td{border:1px solid #c8d8cd;padding:6px;text-align:left}
.esc-modal th{background:#eaf3ec}.esc-modal input{width:100%;box-sizing:border-box;font-size:16px;padding:8px;min-height:40px}
.esc-modal button{min-height:40px;padding:6px 12px;margin:4px 4px 4px 0;font:inherit;font-size:14px;cursor:pointer}
.esc-locked-field{opacity:.85}
@media print{.esc-sigbuttons,.esc-sigcard label,.esc-lock-notice,.esc-sign-note,.esc-sigdialog,.esc-modal{display:none!important}}
` }));
  }

  function buildDialogs() {
    const d = el('dialog', { className: 'esc-sigdialog', id: 'escSigDialog' });
    d.innerHTML = '<h2 id="escSigTitle">ลงลายเซ็น</h2><p>ใช้นิ้ว ปากกา หรือเมาส์เซ็นภายในกรอบ แล้วกดยืนยัน วันที่ เวลา และพิกัด GPS จะบันทึกเมื่อยืนยัน</p>' +
      '<canvas id="escSigCanvas" width="1200" height="450" aria-label="พื้นที่เขียนลายเซ็น"></canvas>' +
      '<div class="esc-actions"><button type="button" class="esc-primary" id="escConfirmSig">ยืนยันลายเซ็น</button><button type="button" id="escClearDraft">ล้างแล้วเซ็นใหม่</button><button type="button" id="escCancelSig">ยกเลิก</button></div><p id="escSigMessage" role="status" style="color:#a13b22"></p>';
    document.body.append(d);
    const c = q('escSigCanvas');
    const point = e => { const r = c.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; };
    c.onpointerdown = e => { if (activePointer !== null) return; e.preventDefault(); activePointer = e.pointerId; c.setPointerCapture(e.pointerId); draft.push([point(e)]); drawDraft(); };
    c.onpointermove = e => { if (e.pointerId !== activePointer) return; e.preventDefault(); draft[draft.length - 1].push(point(e)); drawDraft(); };
    c.onpointerup = c.onpointercancel = e => { if (e.pointerId === activePointer) activePointer = null; };
    c.oncontextmenu = e => e.preventDefault();
    q('escClearDraft').onclick = () => { draft = []; activePointer = null; drawDraft(); };
    q('escCancelSig').onclick = () => d.close();
    d.addEventListener('cancel', e => { if (locatingGPS) e.preventDefault(); });
    q('escConfirmSig').onclick = confirmSignature;
    window.addEventListener('resize', () => { if (d.open) drawDraft(); });

    const u = el('dialog', { className: 'esc-modal', id: 'escUnlockDialog' });
    u.style.width = 'min(420px,92vw)';
    u.innerHTML = '<h2 style="font-size:20px;margin-top:0">ปลดล็อกเพื่อแก้ไข</h2><p style="font-size:14px">หลังปลดล็อก ลายเซ็นเดิมทุกช่องจะถูกล้าง ต้องเซ็นรับรองข้อมูลใหม่อีกครั้ง</p>' +
      '<label>รหัสปลดล็อก<input type="password" inputmode="numeric" id="escUnlockPassword" autocomplete="off"></label><p id="escUnlockError" role="alert" style="color:#a53620"></p>' +
      '<div><button type="button" class="esc-primary" id="escUnlockConfirm">ปลดล็อก</button><button type="button" id="escUnlockCancel">ยกเลิก</button></div>';
    document.body.append(u);
    q('escUnlockCancel').onclick = () => u.close();
    q('escUnlockConfirm').onclick = () => {
      if (q('escUnlockPassword').value !== UNLOCK_CODE) { q('escUnlockError').textContent = 'รหัสไม่ถูกต้อง'; return; }
      signatures = {}; u.close(); changed();
    };
    q('escUnlockPassword').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); q('escUnlockConfirm').click(); } });

    const m = el('dialog', { className: 'esc-modal', id: 'escSignerDialog' });
    m.innerHTML = '<h2 style="margin-top:0">จัดการรายชื่อผู้เซ็น</h2><p style="font-size:13px">รายชื่อเก็บในเบราว์เซอร์นี้ และใช้ร่วมกันทุกแบบฟอร์ม เพิ่ม แก้ไข หรือลบ แล้วกดบันทึกทั้งหมด</p>' +
      '<button type="button" class="esc-primary" id="escAddSignerRow">＋ เพิ่มแถว</button><div style="overflow:auto;margin:12px 0"><table><thead><tr><th style="width:50px">ลำดับ</th><th>ชื่อผู้เซ็น</th><th>ตำแหน่ง</th><th style="width:70px">ลบ</th></tr></thead><tbody id="escSignerRows"></tbody></table></div>' +
      '<p id="escSignerMessage" role="status" style="color:#a13b22;font-size:14px"></p><button type="button" class="esc-primary" id="escSaveSigners">บันทึกทั้งหมด</button><button type="button" id="escCloseSigners">ปิด</button>';
    document.body.append(m);
    let rows = [];
    const drawRows = () => {
      const body = q('escSignerRows'); body.replaceChildren();
      rows.forEach((r, i) => {
        const tr = el('tr', {}, el('td', { textContent: i + 1 }));
        for (const f of ['name', 'position']) { const inp = el('input', { value: r[f], maxLength: 180, placeholder: f === 'name' ? 'ชื่อผู้เซ็น' : 'ตำแหน่ง' }); inp.oninput = () => { r[f] = inp.value; }; tr.append(el('td', {}, inp)); }
        const del = el('button', { type: 'button', textContent: 'ลบ' }); del.onclick = () => { rows.splice(i, 1); drawRows(); };
        tr.append(el('td', {}, del)); body.append(tr);
      });
      if (!rows.length) body.append(el('tr', {}, el('td', { colSpan: 4, textContent: 'ยังไม่มีรายชื่อ กดเพิ่มแถวเพื่อเริ่ม' })));
    };
    q('escAddSignerRow').onclick = () => { rows.push({ name: '', position: '' }); drawRows(); q('escSignerRows').querySelector('tr:last-child input')?.focus(); };
    q('escCloseSigners').onclick = () => m.close();
    q('escSaveSigners').onclick = () => {
      const clean = rows.map(r => ({ name: r.name.trim(), position: r.position.trim(), formScope: r.formScope || ['ALL'] })).filter(r => r.name || r.position);
      if (clean.some(r => !r.name || !r.position)) { q('escSignerMessage').textContent = 'กรอกชื่อและตำแหน่งให้ครบทุกแถว หรือลบแถวที่ไม่ใช้'; return; }
      const unique = []; clean.forEach(r => { if (!unique.some(u2 => u2.name === r.name && u2.position === r.position)) unique.push(r); });
      directory = unique;
      if (!storeDirectory()) { q('escSignerMessage').textContent = 'บันทึกไม่สำเร็จ กรุณาตรวจพื้นที่เก็บข้อมูล'; return; }
      q('escSignerMessage').textContent = 'บันทึกแล้ว ' + unique.length + ' รายการ'; render();
    };
    m.openEditor = () => { loadDirectory(); rows = directory.map(i => ({ ...i })); q('escSignerMessage').textContent = ''; drawRows(); m.showModal(); };
  }

  function drawDraft() {
    const c = q('escSigCanvas'), r = c.getBoundingClientRect(), ratio = Math.min(2, devicePixelRatio || 1);
    if (r.width > 0 && r.height > 0) { c.width = Math.round(r.width * ratio); c.height = Math.round(r.height * ratio); }
    const ctx = c.getContext('2d'); grid(ctx, c.width, c.height); ink(ctx, draft, 0, 0, c.width, c.height, Math.max(2.5, 3 * ratio));
  }

  function openSigning(id) {
    if (isLocked()) return;
    const ready = readiness();
    if (!ready.ok) { alert(ready.msg || 'กรอกข้อมูลแบบฟอร์มให้ครบก่อนเซ็น'); return; }
    if (!priorComplete(id)) { alert(waitingText(id)); return; }
    if (!signers[id]?.name || !signers[id]?.position) { alert('เลือกชื่อและตำแหน่งผู้เซ็นก่อน'); return; }
    signingRole = id; draft = []; activePointer = null;
    q('escSigTitle').textContent = 'ลงลายเซ็น • ' + byId[id].title + ' • ' + signers[id].name;
    q('escSigMessage').textContent = '';
    q('escSigDialog').showModal(); requestAnimationFrame(drawDraft);
  }

  async function confirmSignature() {
    if (locatingGPS || isLocked()) return;
    if (!draft.some(s => s.length > 1)) { q('escSigMessage').textContent = 'กรุณาเขียนลายเซ็นก่อนยืนยัน'; return; }
    const role = signingRole, r = q('escSigCanvas').getBoundingClientRect();
    if (!priorComplete(role)) { q('escSigMessage').textContent = waitingText(role); return; }
    const record = { strokes: draft.map(s => s.map(p => p.slice())), signedAt: new Date().toISOString(), name: signers[role].name, position: signers[role].position, aspect: r.width / r.height };
    locatingGPS = true;
    ['escConfirmSig', 'escClearDraft', 'escCancelSig'].forEach(id => q(id).disabled = true);
    q('escSigCanvas').style.pointerEvents = 'none';
    q('escSigMessage').textContent = 'กำลังหาพิกัด GPS กรุณาอนุญาตตำแหน่งบนอุปกรณ์…';
    try {
      record.gps = await getGPS();
      if (record.gps.status !== 'ok' && !confirm(gpsText(record.gps) + ' ต้องการยืนยันลายเซ็นโดยบันทึกสถานะนี้แทนพิกัดหรือไม่?')) { q('escSigMessage').textContent = 'ยังไม่ยืนยันลายเซ็น สามารถลองใหม่ได้'; return; }
      const previous = signatures[role];
      signatures[role] = record;
      if (previous) dependents(role).forEach(x => delete signatures[x]); // re-signing invalidates later approvals
      q('escSigDialog').close(); changed();
    } finally {
      locatingGPS = false;
      ['escConfirmSig', 'escClearDraft', 'escCancelSig'].forEach(id => q(id).disabled = false);
      q('escSigCanvas').style.pointerEvents = '';
    }
  }

  function removeSignature(id) {
    if (isLocked() || !signatures[id]) return;
    const deps = dependents(id).filter(x => signatures[x]);
    if (!confirm('ลบลายเซ็นช่องนี้?' + (deps.length ? ' ลายเซ็นที่ต่อจากช่องนี้ (' + deps.map(x => byId[x].title).join(', ') + ') จะถูกล้างด้วย' : ''))) return;
    delete signatures[id]; deps.forEach(x => delete signatures[x]); changed();
  }

  function populate(id) {
    const n = q('escName_' + id), p = q('escPos_' + id), cur = signers[id] || { name: '', position: '' };
    const allowed = directory.filter(allowedHere);
    n.replaceChildren(new Option('เลือกชื่อผู้เซ็น', ''));
    [...new Set(allowed.map(i => i.name).concat(cur.name || []))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'th')).forEach(x => n.append(new Option(x, x)));
    p.replaceChildren(new Option('เลือกตำแหน่ง', ''));
    [...new Set(directory.filter(i => i.name === cur.name).map(i => i.position).concat(cur.position || []))].filter(Boolean).sort((a, b) => a.localeCompare(b, 'th')).forEach(x => p.append(new Option(x, x)));
    n.value = cur.name || ''; p.value = cur.position || '';
    n.disabled = p.disabled = isLocked() || Boolean(signatures[id]);
  }

  function buildCards() {
    const mount = cfg.mount;
    for (const m of new Set([mount, ...roles.map(r => r.mount).filter(Boolean)])) {
      m.replaceChildren(); m.classList.add('esc-sign'); m.append(el('p', { className: 'esc-sign-note' }));
      m.addEventListener('click', e => {
        const s = e.target.closest('[data-esc-sign]'), rm = e.target.closest('[data-esc-remove]');
        if (s) openSigning(s.dataset.escSign);
        if (rm) removeSignature(rm.dataset.escRemove);
      });
    }
    for (const r of roles) {
      const card = el('section', { className: 'esc-sigcard' });
      card.innerHTML = '<h3></h3><label>ชื่อผู้เซ็น<select id="escName_' + r.id + '"></select></label><label>ตำแหน่ง<select id="escPos_' + r.id + '"></select></label>' +
        '<div class="esc-sigpreview" id="escPreview_' + r.id + '"></div><div class="esc-sigbuttons"><button type="button" class="esc-primary" data-esc-sign="' + r.id + '">เซ็นชื่อ</button><button type="button" data-esc-remove="' + r.id + '">ลบลายเซ็น</button></div>';
      card.querySelector('h3').textContent = r.title;
      (r.mount || mount).append(card);
      q('escName_' + r.id).onchange = () => {
        const name = q('escName_' + r.id).value, ps = [...new Set(directory.filter(i => i.name === name).map(i => i.position))];
        signers[r.id] = { name, position: ps.length === 1 ? ps[0] : '' }; populate(r.id); changed();
      };
      q('escPos_' + r.id).onchange = () => { signers[r.id] = { name: q('escName_' + r.id).value, position: q('escPos_' + r.id).value }; changed(); };
    }
    const manage = el('button', { type: 'button', textContent: 'จัดการรายชื่อผู้เซ็น' });
    manage.onclick = () => q('escSignerDialog').openEditor();
    (cfg.toolbar || document.querySelector('.toolbar') || mount).append(manage);

    const notice = el('div', { className: 'esc-lock-notice', id: 'escLockNotice', hidden: true });
    notice.append(el('span', { textContent: '🔒 เซ็นครบทุกช่องแล้ว เอกสารนี้ล็อกข้อมูล ดู พิมพ์ และส่งออกได้' }));
    const unlock = el('button', { type: 'button', className: 'esc-primary', textContent: 'ปลดล็อกเพื่อแก้ไข' });
    unlock.style.minHeight = '40px';
    unlock.onclick = () => { q('escUnlockPassword').value = ''; q('escUnlockError').textContent = ''; q('escUnlockDialog').showModal(); q('escUnlockPassword').focus(); };
    notice.append(unlock);
    (cfg.noticeTarget || mount).prepend(notice);
  }

  function render() {
    if (!cfg) return;
    const ready = readiness(), locked = isLocked();
    const note = locked ? '' : !ready.ok ? '⚠️ ' + (ready.msg || 'กรอกข้อมูลแบบฟอร์มให้ครบก่อนเซ็น') : 'ลำดับการเซ็น: ' + (cfg.orderText || roles.map(r => r.title).join(' → '));
    document.querySelectorAll('.esc-sign-note').forEach(n => { n.textContent = note; });
    for (const r of roles) {
      populate(r.id);
      const sig = signatures[r.id], prev = q('escPreview_' + r.id), prior = priorComplete(r.id);
      prev.replaceChildren();
      if (sig) {
        const c = el('canvas', { width: 1000, height: 480 }); prev.append(c);
        const ctx = c.getContext('2d'); grid(ctx, 1000, 480); fitInk(ctx, sig, 40, 20, 920, 280, 6);
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 320, 1000, 160); ctx.fillStyle = INK; ctx.textAlign = 'center';
        ctx.font = 'bold 32px ' + FONT; ctx.fillText(sig.name + ' • ' + (sig.position || 'ไม่ระบุตำแหน่ง'), 500, 356, 960);
        ctx.font = '28px ' + FONT; ctx.fillText('เซ็นเมื่อ ' + thaiTime(sig.signedAt) + ' (เวลาไทย)', 500, 400, 960);
        ctx.font = '22px ' + FONT; ctx.fillText(gpsText(sig.gps), 500, 446, 960);
      } else {
        const span = el('span', { textContent: 'ยังไม่ได้เซ็นชื่อ' });
        if (!prior) span.append(el('strong', { textContent: waitingText(r.id) }));
        prev.append(span);
      }
      prev.oncontextmenu = e => e.preventDefault();
      const b = document.querySelector('[data-esc-sign="' + r.id + '"]'), rm = document.querySelector('[data-esc-remove="' + r.id + '"]');
      b.textContent = sig ? 'เซ็นใหม่' : prior ? 'เซ็นชื่อ' : 'รอลำดับก่อนหน้า';
      b.disabled = locked || !ready.ok || !prior || !signers[r.id]?.name || !signers[r.id]?.position;
      b.title = !prior ? waitingText(r.id) : 'เลือกชื่อและตำแหน่งก่อนเซ็น';
      rm.disabled = locked || !sig;
    }
  }

  /* ---------- locking ---------- */
  function scopeEls() { return (cfg.lockScope || ['.sheet']).flatMap(s => [...document.querySelectorAll(s)]); }
  const excluded = t => t.closest('.esc-sign,.esc-lock-notice,dialog') || (cfg.lockExclude && t.closest(cfg.lockExclude));
  function inScope(t) { return t && t.closest && !excluded(t) && (scopeEls().some(s => s.contains(t)) || (cfg.lockControls && t.closest(cfg.lockControls))); }
  function applyLockToFields() {
    const locked = isLocked();
    const fields = scopeEls().flatMap(s => [...s.querySelectorAll('input,select,textarea,button')]).filter(f => !excluded(f));
    if (cfg.lockControls) document.querySelectorAll(cfg.lockControls).forEach(f => fields.push(...(f.matches('input,select,textarea,button') ? [f] : f.querySelectorAll('input,button'))));
    for (const f of fields) {
      if (locked && !f.dataset.escLocked) { f.dataset.escLocked = f.disabled ? 'was' : 'yes'; f.disabled = true; f.classList.add('esc-locked-field'); }
      else if (!locked && f.dataset.escLocked) { if (f.dataset.escLocked === 'yes') f.disabled = false; delete f.dataset.escLocked; f.classList.remove('esc-locked-field'); }
    }
  }
  function updateLock() {
    const locked = isLocked();
    q('escLockNotice').hidden = !locked;
    applyLockToFields();
    if (locked !== wasLocked) { wasLocked = locked; if (cfg.onLockChange) cfg.onLockChange(locked); }
  }
  function guardEvents() {
    const block = e => { if (e.isTrusted && isLocked() && inScope(e.target)) { e.preventDefault(); e.stopImmediatePropagation(); } };
    ['click', 'dblclick', 'input', 'change', 'keydown', 'pointerdown', 'mousedown', 'touchstart', 'paste', 'drop'].forEach(t => document.addEventListener(t, block, true));
    let pending = false;
    new MutationObserver(() => { if (!isLocked() || pending) return; pending = true; requestAnimationFrame(() => { pending = false; applyLockToFields(); }); })
      .observe(document.body, { childList: true, subtree: true });
    // Re-check readiness whenever the form changes (outside the signature area).
    let t = 0; const refresh = e => { if (e.target.closest && e.target.closest('.esc-sign')) return; clearTimeout(t); t = setTimeout(render, 150); };
    document.addEventListener('input', refresh); document.addEventListener('change', refresh); document.addEventListener('click', refresh);
  }

  /* ---------- data ---------- */
  function validGPS(g) {
    if (!g || typeof g !== 'object') return undefined;
    if (g.status === 'ok' || (Number.isFinite(g.lat) && Number.isFinite(g.lng))) {
      const lat = Number.isFinite(g.latitude) ? g.latitude : g.lat, lng = Number.isFinite(g.longitude) ? g.longitude : g.lng;
      if (!Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) return { status: 'unavailable' };
      return { status: 'ok', latitude: lat, longitude: lng, accuracy: Number.isFinite(g.accuracy) ? g.accuracy : undefined, capturedAt: g.capturedAt };
    }
    return { status: ['denied', 'timeout', 'unavailable', 'unsupported'].includes(g.status) ? g.status : 'unavailable' };
  }
  function validSig(s) {
    if (!s || !Number.isFinite(Date.parse(s.signedAt)) || !Array.isArray(s.strokes) || !s.strokes.length || s.strokes.length > 500) return null;
    if (s.strokes.some(st => !Array.isArray(st) || !st.length || st.length > 20000 || st.some(p => !Array.isArray(p) || p.length !== 2 || p.some(n => !Number.isFinite(n) || n < 0 || n > 1)))) return null;
    return { signedAt: s.signedAt, strokes: s.strokes, name: typeof s.name === 'string' ? s.name : '', position: typeof s.position === 'string' ? s.position : '', aspect: Number.isFinite(s.aspect) && s.aspect > 0 && s.aspect < 20 ? s.aspect : 1200 / 450, gps: validGPS(s.gps) };
  }
  function exportData() { return { version: 1, signers: JSON.parse(JSON.stringify(signers)), signatures: JSON.parse(JSON.stringify(signatures)) }; }
  function importData(d) {
    signatures = {}; signers = {};
    if (d && typeof d === 'object') {
      for (const r of roles) {
        const s = d.signers?.[r.id]; if (s && typeof s.name === 'string') signers[r.id] = { name: s.name, position: typeof s.position === 'string' ? s.position : '' };
        const sig = validSig(d.signatures?.[r.id]);
        if (sig) { signatures[r.id] = sig; if (!signers[r.id]?.name) signers[r.id] = { name: sig.name, position: sig.position }; }
        if (signers[r.id]) addDirectory(signers[r.id].name, signers[r.id].position);
      }
    }
    storeDirectory(); render(); updateLock();
  }
  // Print helper: draws the signature ink fitted into the box, plus optional caption lines below it.
  function drawSignature(ctx, id, x, y, w, h, opt = {}) {
    const sig = signatures[id]; if (!sig) return false;
    fitInk(ctx, sig, x, y, w, h, opt.lineWidth);
    if (opt.caption === 'right') { // name/position + time beside the ink, vertically centred in the box
      const size = opt.fontSize || Math.max(12, Math.round(h / 3.2)), tx = x + w + (opt.gap ?? 12), cw = opt.captionWidth || w;
      ctx.save(); ctx.fillStyle = opt.color || INK; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = size + 'px ' + FONT; ctx.fillText(sig.name + (sig.position ? ' • ' + sig.position : ''), tx, y + h / 2 - size * .6, cw);
      ctx.font = Math.round(size * .85) + 'px ' + FONT; ctx.fillText('เซ็นเมื่อ ' + thaiTime(sig.signedAt), tx, y + h / 2 + size * .6, cw);
      ctx.restore();
    } else if (opt.caption) {
      const size = opt.fontSize || Math.max(12, Math.round(h / 4));
      ctx.save(); ctx.fillStyle = opt.color || INK; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      ctx.font = size + 'px ' + FONT;
      const cx = x + w / 2, cw = opt.captionWidth || w;
      if (opt.caption !== 'time') ctx.fillText(sig.name + (sig.position ? ' • ' + sig.position : ''), cx, y + h + 2, cw);
      ctx.font = Math.round(size * .85) + 'px ' + FONT;
      ctx.fillText(thaiTime(sig.signedAt), cx, y + h + 2 + (opt.caption !== 'time' ? size * 1.15 : 0), cw);
      ctx.restore();
    }
    return true;
  }

  window.ESCSign = {
    init(options) {
      cfg = options; roles = options.roles; byId = Object.fromEntries(roles.map(r => [r.id, r]));
      loadDirectory(); injectStyle(); buildDialogs(); buildCards(); guardEvents();
      render(); updateLock();
    },
    isLocked, exportData, importData, drawSignature, refresh: () => { render(); updateLock(); },
    get: id => signatures[id] ? { ...signatures[id] } : null,
    signerName: id => signatures[id]?.name || signers[id]?.name || '',
    signerPosition: id => signatures[id]?.position || signers[id]?.position || '',
    signedTime: id => signatures[id] ? thaiTime(signatures[id].signedAt) : ''
  };
})();
