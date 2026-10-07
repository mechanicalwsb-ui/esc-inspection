/* ESC Machine Inspection System — original inspection forms hub. */
(function () {
  'use strict';

  const ESC_BUILTIN_FORMS = [
    { code: 'FM-ML01-ML-09', title: 'แบบบันทึกเครื่องจักรดั๊มพ์ยกรถอ้อย (ดั๊มพ์ 1, 2, 3)', dept: 'ลูกหีบ', file: 'FM-ML01-ML-09.html', category: 'milling', icon: 'truck', desc: '21 คอลัมน์ · ตรวจความสะอาด + อุณหภูมิ/แรงดัน 24 ชม. · พิมพ์ Canvas 260 DPI' },
    { code: 'FM-ML01-ML-10', title: 'แบบบันทึกเครื่องจักรสะพานดั๊มพ์และสะพานเมน', dept: 'ลูกหีบ', file: 'FM-ML01-ML-10.html', category: 'milling', icon: 'conveyor', desc: '43 คอลัมน์ · ตรวจระบบขับเคลื่อนสะพานดั๊มพ์และสะพานเมน 24 ชม.' },
    { code: 'FM-ML01-ML-02', title: 'รายงานสภาพการทำงานของเครื่องเทอร์ไบน์ ชุดลูกหีบ', dept: 'ลูกหีบ', file: 'FM-ML01-ML-02.html', category: 'milling', icon: 'turbine', desc: 'เทอร์ไบน์ขับลูกหีบ 1-5 และ Crusher · วัดแรงดันไอน้ำ อุณหภูมิ รอบความเร็ว' },
    { code: 'FM-ML01-ML-11', title: 'แบบบันทึกเครื่องจักร High speed belt และสะพานข้ามชุดลูกหีบ', dept: 'ลูกหีบ', file: 'FM-ML01-ML-11.html', category: 'milling', icon: 'conveyor', desc: 'ตรวจระบบขับเคลื่อน High Speed Belt มอเตอร์ ลูกปืน และสายพานลำเลียง' },
    { code: 'FM-ML01-ML-05', title: 'แบบบันทึกการลดรอบลูกหีบ', dept: 'ลูกหีบ', file: 'FM-ML01-ML-05.html', category: 'milling', icon: 'gauge', desc: '13 คอลัมน์ · 29 แถว · คำนวณความเร็วเฉลี่ยและปริมาณน้ำอ้อย/น้ำพรมอัตโนมัติ' },
    { code: 'FM-ML01-ML-06', title: 'แบบบันทึกการหยุดหีบ (ฝ่ายวิศวกรรม)', dept: 'ลูกหีบ', file: 'FM-ML01-ML-06.html', category: 'milling', icon: 'clock', desc: '10 คอลัมน์ · 22 แถว · สรุป Downtime รวมและแผนกที่หยุดนานที่สุด' },
    { code: 'FM-PD01-PD-01', title: 'บันทึกรายงานการหยุดหีบ (ฝ่ายผลิต)', dept: 'ฝ่ายผลิต', file: 'FM-PD01-PD-01.html', category: 'prod', icon: 'factory', desc: '10 คอลัมน์ · ขั้นตอนเวลา 7 สเต็ป · คำนวณเวลาหยุดหีบและปริมาณอ้อย' },
    { code: 'FM-ML01-ML-13', title: 'แบบบันทึกการเก็บน้ำหนักเหล็กรางเท', dept: 'ลูกหีบ', file: 'FM-ML01-ML-13.html', category: 'milling', icon: 'scale', desc: '15 คอลัมน์ · 27 แถว · เชรดเดอร์ & High Speed Belt คำนวณเวลานาทีและน้ำหนักรวม กก.' },
    { code: 'FM-ML01-ML-18', title: 'แบบบันทึกการตรวจสอบรถบรรทุกอ้อย', dept: 'ลูกหีบ', file: 'FM-ML01-ML-18.html', category: 'milling', icon: 'check-square', desc: '12 คอลัมน์ · 38 แถว · 🗸 ผ่าน | ✗ ไม่ผ่าน | ☒ แก้ไขแล้ว · Safety Compliance %' },
    { code: 'FM-MR10-MR-01', title: 'แบบฟอร์มการตรวจสอบสัตว์พาหะนำเชื้อ', dept: 'ซ่อมบำรุง / ทั่วไป', file: 'FM-MR10-MR-01.html', category: 'maintenance', icon: 'shield-alert', desc: '33 คอลัมน์ · 20 จุดวาง x 31 วัน · บันทึก R ปกติ / S ผิดปกติ + ตาราง Action Log' },
    { code: 'FM-PD01-PD-02', title: 'แบบฟอร์มการมอบหมาย ส่งต่องาน เครื่องจักรขัดข้อง และการเปลี่ยนกะงาน', dept: 'ฝ่ายผลิต/ลูกหีบ', file: 'FM-PD01-PD-02.html', category: 'prod', icon: 'users', desc: 'บันทึกส่งมอบงาน 2 กะ (เช้า-เย็น) · สรุป Downtime 7 หมวดเครื่องจักร · พิมพ์ชุด 2 หน้า 260 DPI' },
    { code: 'FM-ML01-ML-12', title: 'แบบบันทึกเครื่องจักรและอุปกรณ์ ในฝ่ายหีบอ้อยกะทำงาน (DCS)', dept: 'ลูกหีบ', file: 'FM-ML01-ML-12.html', category: 'milling', icon: 'cpu', desc: 'บันทึกพารามิเตอร์ 24 ชม. ทุก 2 ชม. (12 ช่วงเวลา) · ตรวจสอบเกณฑ์อัตโนมัติ · พิมพ์ A3 Portrait 260 DPI' },
    { code: 'FM-PD02-PD-02', title: 'บันทึกการตรวจสอบวัสดุที่สามารถแตกหักได้ แผนกลูกหีบ', dept: 'ฝ่ายผลิต/ลูกหีบ', file: 'FM-PD02-PD-02.html', category: 'prod', icon: 'alert-octagon', desc: 'สารบัญอุปกรณ์ 357 รายการ (17 หน้า) · หลอดไฟ/สปอตไลต์/เกจวัด · ตรวจเช็คประจำวัน 1-31 วัน' }
  ];

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let viewer = null;
  let returnFocus = null;
  let previousOverflow = '';

  function getFormUrl(file) {
    return (/\/public(?:\/|$)/i.test(window.location.pathname) ? '../' : '') + 'เอกสารตรวจเครื่องจักร/' + file;
  }

  function ensureStyles() {
    if (document.getElementById('esc-forms-hub-styles')) return;
    const style = document.createElement('style');
    style.id = 'esc-forms-hub-styles';
    style.textContent = `
      .esc-fh,.esc-fh-modal{font-family:inherit;color:#e8f5ee;box-sizing:border-box}
      .esc-fh *,.esc-fh-modal *{box-sizing:border-box}
      .esc-fh{background:#0c1915;padding:clamp(16px,3vw,32px);border-radius:24px}
      .esc-fh-banner{padding:24px;border:1px solid #2d5946;border-radius:18px;background:linear-gradient(125deg,#164c36,#10261e)}
      .esc-fh-eyebrow{color:#a3e4bf;font-size:12px;letter-spacing:.14em;font-weight:700}
      .esc-fh h2{font-size:clamp(23px,3vw,32px);margin:10px 0}.esc-fh p{line-height:1.7}
      .esc-fh-muted{color:#afc7ba}.esc-fh-search{display:block;width:100%;margin-top:20px;padding:13px 16px;background:#0b2017;color:#fff;border:1px solid #498164;border-radius:12px;font:inherit}
      .esc-fh-filters{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0}
      .esc-fh button,.esc-fh-modal button,.esc-fh a,.esc-fh-modal a{font:inherit;cursor:pointer}
      .esc-fh-filter,.esc-fh-secondary,.esc-fh-modal button,.esc-fh-modal a{border:1px solid #416250;border-radius:10px;background:#1a3026;color:#e8f5ee;padding:10px 14px;text-decoration:none}
      .esc-fh-filter[aria-pressed=true]{background:#238452;border-color:#80e4ac;color:white}
      .esc-fh-filter.esc-fh-mine{border:2px solid #f6ce62;color:#ffe5a0;box-shadow:0 0 18px #f6ce621a;font-weight:700}
      .esc-fh-filter.esc-fh-mine[aria-pressed=true]{background:#ffe099;color:#30230b}
      .esc-fh-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,310px),1fr));gap:18px}
      .esc-fh-card{display:flex;flex-direction:column;gap:12px;background:#14271e;border:1px solid #304e3e;padding:22px;border-radius:16px;transition:border-color .2s,transform .2s}
      .esc-fh-card:hover{border-color:#78bb92;transform:translateY(-2px)}.esc-fh-card.is-assigned{border-color:#edca63}
      .esc-fh-card h3{margin:0;font-size:18px;line-height:1.6}.esc-fh-card p{margin:0;font-size:14px}
      .esc-fh-code{font-size:13px;font-weight:700;letter-spacing:.05em;color:#93e2b1}.esc-fh-card-head{display:flex;align-items:center;gap:12px}
      .esc-fh-icon{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#244d36;font-size:22px;flex-shrink:0}.esc-fh-icon svg{width:22px;height:22px}
      .esc-fh-badge{align-self:flex-start;background:#ffe08a;color:#392805;font-size:12px;font-weight:800;padding:7px 10px;border-radius:8px}
      .esc-fh-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:auto;padding-top:12px}.esc-fh-primary{background:#86e0a9;color:#0c2e1b;border:0;border-radius:10px;padding:11px 14px;font-weight:700!important}
      .esc-fh-external{color:#b7e8ca;font-size:13px;text-underline-offset:4px}.esc-fh-count{margin:0 0 16px;font-size:13px}.esc-fh-empty{padding:32px;text-align:center;border:1px dashed #54715f;border-radius:16px;grid-column:1/-1}
      .esc-fh :focus-visible,.esc-fh-modal :focus-visible{outline:3px solid #ffe08a;outline-offset:3px}
      .esc-fh-modal{position:fixed;inset:0;z-index:10000;background:#000b;padding:20px;display:flex;align-items:center;justify-content:center}
      .esc-fh-dialog{display:flex;flex-direction:column;width:100%;height:100%;max-width:1600px;background:#10271c;border:1px solid #476f56;border-radius:16px;overflow:hidden;box-shadow:0 24px 80px #0009}
      .esc-fh-toolbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px}.esc-fh-toolbar h2{flex:1;min-width:150px;margin:0;font-size:17px}.esc-fh-modal iframe{flex:1;min-height:0;width:100%;border:0;background:white}
      .esc-fh-status{margin:0;padding:8px 18px;font-size:13px;color:#ffe099}.esc-fh-status:empty{display:none}
      @media(max-width:640px){.esc-fh-banner{padding:18px}.esc-fh-modal{padding:0}.esc-fh-dialog{border-radius:0}.esc-fh-toolbar{padding:12px}.esc-fh-toolbar h2{flex-basis:100%}}
      @media(prefers-reduced-motion:reduce){.esc-fh-card{transition:none}.esc-fh-card:hover{transform:none}}
    `;
    document.head.appendChild(style);
  }

  function getUser() {
    // app.js declares state as a global lexical binding, rather than window.state.
    if (typeof state !== 'undefined' && state.activeUser) return state.activeUser;
    return window.state?.activeUser || window.currentUser || window.activeUser || null;
  }

  function assignedCodes(user) {
    let values = user?.assigned_forms || [];
    if (typeof values === 'string') {
      try { values = JSON.parse(values); } catch (_) { values = values.split(/[,;\n]/); }
    }
    if (!Array.isArray(values)) values = [values];
    return new Set(values.map(value => {
      const id = typeof value === 'object' && value ? value.code || value.form_code || value.file || value.id : value;
      return String(id ?? '').trim().replace(/\.html$/i, '');
    }).filter(Boolean));
  }

  function renderFormsHub(container) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container || typeof container.replaceChildren !== 'function') throw new TypeError('renderFormsHub requires a container element.');
    ensureStyles();
    const user = getUser();
    const assigned = assignedCodes(user);
    const showMine = assigned.size > 0 || ['technician', 'inspector'].includes(user?.role);
    let filter = showMine ? 'mine' : 'all';
    const filters = [['all', 'All'], ...(showMine ? [['mine', '⭐ แบบฟอร์มของฉัน']] : []), ['milling', 'Milling'], ['prod', 'Production'], ['maintenance', 'Maintenance']];
    const root = document.createElement('section');
    root.className = 'esc-fh';
    root.setAttribute('aria-label', 'ศูนย์แบบฟอร์มตรวจเครื่องจักร');
    root.innerHTML = `<header class="esc-fh-banner"><span class="esc-fh-eyebrow">ESC · MACHINE INSPECTION SYSTEM</span><h2>ศูนย์แบบฟอร์มตรวจเครื่องจักร</h2><p class="esc-fh-muted">แบบฟอร์มมาตรฐาน ${ESC_BUILTIN_FORMS.length} รายการ · เลือกกรอก ตรวจสอบ และพิมพ์เอกสาร</p><input class="esc-fh-search" type="search" aria-label="ค้นหาแบบฟอร์ม" placeholder="ค้นหารหัสแบบฟอร์ม ชื่อ หรือแผนก…"></header><nav class="esc-fh-filters" aria-label="หมวดแบบฟอร์ม">${filters.map(([key, label]) => `<button type="button" class="esc-fh-filter ${key === 'mine' ? 'esc-fh-mine' : ''}" data-filter="${key}" aria-pressed="${key === filter}">${label}</button>`).join('')}</nav><p class="esc-fh-count esc-fh-muted" role="status" aria-live="polite"></p><div class="esc-fh-grid"></div>`;
    container.replaceChildren(root);
    const search = root.querySelector('input');
    const grid = root.querySelector('.esc-fh-grid');
    const iconFallbacks = { truck: '🚛', conveyor: '↔', turbine: '⚙', gauge: '◴', clock: '◷', factory: '🏭', scale: '⚖', 'check-square': '☑', 'shield-alert': '⛨', users: '♟', cpu: '▦', 'alert-octagon': '⚠' };
    function update() {
      const query = search.value.trim().toLocaleLowerCase('th');
      const forms = ESC_BUILTIN_FORMS.filter(form => (filter === 'all' || (filter === 'mine' ? assigned.has(form.code) : form.category === filter)) && [form.code, form.title, form.dept, form.desc].join(' ').toLocaleLowerCase('th').includes(query));
      root.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
      root.querySelector('.esc-fh-count').textContent = `แสดง ${forms.length} จาก ${ESC_BUILTIN_FORMS.length} แบบฟอร์ม`;
      grid.innerHTML = forms.map(form => `<article class="esc-fh-card ${assigned.has(form.code) ? 'is-assigned' : ''}"><div class="esc-fh-card-head"><span class="esc-fh-icon" aria-hidden="true" data-icon="${form.icon}">${iconFallbacks[form.icon]}</span><span class="esc-fh-code">${form.code}</span></div>${assigned.has(form.code) ? '<span class="esc-fh-badge">⭐ แบบฟอร์มที่ได้รับมอบหมาย</span>' : ''}<h3>${escapeHtml(form.title)}</h3><p class="esc-fh-muted">แผนก: ${escapeHtml(form.dept)}</p><p class="esc-fh-muted">${escapeHtml(form.desc)}</p><div class="esc-fh-actions"><button type="button" class="esc-fh-primary" data-open="${form.code}">เปิดกรอกฟอร์ม</button><button type="button" class="esc-fh-secondary" data-print="${form.code}">พิมพ์ PDF</button></div><a class="esc-fh-external" href="${escapeHtml(getFormUrl(form.file))}" target="_blank" rel="noopener noreferrer">เปิดในหน้าต่างใหม่ ↗</a></article>`).join('') || `<div class="esc-fh-empty">${filter === 'mine' && !assigned.size ? 'ยังไม่มีแบบฟอร์มที่ได้รับมอบหมาย เลือก All เพื่อดูแบบฟอร์มทั้งหมด' : 'ไม่พบแบบฟอร์มที่ตรงกับการค้นหา'}</div>`;
      // Keep a visible fallback for custom icons absent from the installed Lucide version.
      if (window.lucide?.icons && window.lucide.createIcons) {
        grid.querySelectorAll('[data-icon]').forEach(element => {
          const name = element.dataset.icon;
          const pascal = name.replace(/(^|-)(\w)/g, (_, separator, letter) => letter.toUpperCase());
          if (window.lucide.icons[pascal]) element.innerHTML = `<i data-lucide="${name}"></i>`;
        });
        window.lucide.createIcons({ root: grid });
      }
    }
    search.addEventListener('input', update);
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button || !root.contains(button)) return;
      if (button.dataset.filter) { filter = button.dataset.filter; update(); return; }
      const form = ESC_BUILTIN_FORMS.find(item => item.code === (button.dataset.open || button.dataset.print));
      if (form) {
        openEmbeddedForm(getFormUrl(form.file), `${form.code} · ${form.title}`);
        if (button.dataset.print) viewer.frame.addEventListener('load', printEmbeddedForm, { once: true });
      }
    });
    update();
    return root;
  }

  function printEmbeddedForm() {
    if (!viewer) return;
    try {
      const frameWindow = viewer.frame.contentWindow;
      const printButton = frameWindow.document.getElementById('print');
      // Original forms prepare their canvas/PDF templates in their print handler.
      if (printButton) printButton.click();
      else { frameWindow.focus(); frameWindow.print(); }
    } catch (_) {
      viewer.status.textContent = 'กรุณาเปิดในหน้าต่างใหม่ แล้วเลือกพิมพ์จากแบบฟอร์ม';
    }
  }

  function openEmbeddedForm(url, title) {
    const resolved = new URL(url, window.location.href);
    if (!['http:', 'https:', 'file:'].includes(resolved.protocol) || resolved.origin !== window.location.origin) throw new TypeError('The embedded form must use a same-origin URL.');
    closeEmbeddedForm();
    ensureStyles();
    returnFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    const overlay = document.createElement('div');
    overlay.className = 'esc-fh-modal';
    overlay.innerHTML = `<section class="esc-fh-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title || 'แบบฟอร์มตรวจเครื่องจักร')}"><header class="esc-fh-toolbar"><h2>${escapeHtml(title || 'แบบฟอร์มตรวจเครื่องจักร')}</h2><button type="button" data-viewer-print>พิมพ์ PDF</button><a href="${escapeHtml(resolved.href)}" target="_blank" rel="noopener noreferrer">เปิดในหน้าต่างใหม่ ↗</a><button type="button" data-viewer-close aria-label="ปิดแบบฟอร์ม">ปิด ✕</button></header><p class="esc-fh-status" role="status" aria-live="polite">กำลังโหลดแบบฟอร์ม…</p><iframe title="${escapeHtml(title || 'แบบฟอร์มตรวจเครื่องจักร')}"></iframe></section>`;
    const frame = overlay.querySelector('iframe');
    const status = overlay.querySelector('.esc-fh-status');
    viewer = { overlay, frame, status };
    frame.addEventListener('load', () => { status.textContent = ''; });
    frame.addEventListener('error', () => { status.textContent = 'โหลดแบบฟอร์มไม่สำเร็จ กรุณาเปิดในหน้าต่างใหม่'; });
    overlay.querySelector('[data-viewer-close]').addEventListener('click', closeEmbeddedForm);
    overlay.querySelector('[data-viewer-print]').addEventListener('click', printEmbeddedForm);
    overlay.addEventListener('click', event => { if (event.target === overlay) closeEmbeddedForm(); });
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') { event.preventDefault(); closeEmbeddedForm(); }
      if (event.key === 'Tab') {
        const focusable = Array.from(overlay.querySelectorAll('button,a,iframe'));
        const first = focusable[0], last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    });
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    frame.src = resolved.href;
    overlay.querySelector('[data-viewer-close]').focus();
    return frame;
  }

  function closeEmbeddedForm() {
    if (!viewer) return;
    viewer.overlay.remove();
    viewer = null;
    document.body.style.overflow = previousOverflow;
    if (returnFocus?.isConnected) returnFocus.focus();
    returnFocus = null;
  }

  window.getFormUrl = getFormUrl;
  window.renderFormsHub = renderFormsHub;
  window.openEmbeddedForm = openEmbeddedForm;
  window.closeEmbeddedForm = closeEmbeddedForm;
  window.ESC_BUILTIN_FORMS = ESC_BUILTIN_FORMS;
})();
