/* ESC Machine Inspection System — original inspection forms hub. */
(function () {
  'use strict';

  const ESC_BUILTIN_FORMS = [
    { code: 'FM-ML01-ML-09', title: 'แบบบันทึกเครื่องจักรดั๊มพ์ยกรถอ้อย (ดั๊มพ์ 1, 2, 3)', dept: 'ลูกหีบ', file: 'FM-ML01-ML-09.html', category: 'milling', icon: 'truck', desc: 'ตรวจความสะอาด อุณหภูมิ และแรงดัน ดั๊มพ์ 1, 2, 3' },
    { code: 'FM-ML01-ML-10', title: 'แบบบันทึกเครื่องจักรสะพานดั๊มพ์และสะพานเมน', dept: 'ลูกหีบ', file: 'FM-ML01-ML-10.html', category: 'milling', icon: 'conveyor', desc: 'ตรวจระบบขับเคลื่อนสะพานดั๊มพ์และสะพานเมน' },
    { code: 'FM-ML01-ML-02', title: 'รายงานสภาพการทำงานของเครื่องเทอร์ไบน์ ชุดลูกหีบ', dept: 'ลูกหีบ', file: 'FM-ML01-ML-02.html', category: 'milling', icon: 'turbine', desc: 'ตรวจแรงดันไอน้ำ อุณหภูมิ และรอบเทอร์ไบน์ลูกหีบ' },
    { code: 'FM-ML01-ML-11', title: 'แบบบันทึกเครื่องจักร High speed belt และสะพานข้ามชุดลูกหีบ', dept: 'ลูกหีบ', file: 'FM-ML01-ML-11.html', category: 'milling', icon: 'conveyor', desc: 'ตรวจมอเตอร์ ลูกปืน และสายพาน High Speed Belt' },
    { code: 'FM-ML01-ML-05', title: 'แบบบันทึกการลดรอบลูกหีบ', dept: 'ลูกหีบ', file: 'FM-ML01-ML-05.html', category: 'milling', icon: 'gauge', desc: 'บันทึกรอบลูกหีบ ปริมาณน้ำอ้อย และน้ำพรม' },
    { code: 'FM-ML01-ML-06', title: 'แบบบันทึกการหยุดหีบ (ฝ่ายวิศวกรรม)', dept: 'ลูกหีบ', file: 'FM-ML01-ML-06.html', category: 'milling', icon: 'clock', desc: 'บันทึกเวลาหยุดหีบและแผนกที่เกี่ยวข้อง' },
    { code: 'FM-PD01-PD-01', title: 'บันทึกรายงานการหยุดหีบ (ฝ่ายผลิต)', dept: 'ฝ่ายผลิต', file: 'FM-PD01-PD-01.html', category: 'prod', icon: 'factory', desc: 'บันทึกเวลาหยุดหีบและปริมาณอ้อยของฝ่ายผลิต' },
    { code: 'FM-ML01-ML-13', title: 'แบบบันทึกการเก็บน้ำหนักเหล็กรางเท', dept: 'ลูกหีบ', file: 'FM-ML01-ML-13.html', category: 'milling', icon: 'scale', desc: 'บันทึกเวลาและน้ำหนักเหล็กรางเท' },
    { code: 'FM-ML01-ML-18', title: 'แบบบันทึกการตรวจสอบรถบรรทุกอ้อย', dept: 'ลูกหีบ', file: 'FM-ML01-ML-18.html', category: 'milling', icon: 'check-square', desc: 'ตรวจความปลอดภัยรถบรรทุกอ้อยและการแก้ไข' },
    { code: 'FM-MR10-MR-01', title: 'แบบฟอร์มการตรวจสอบสัตว์พาหะนำเชื้อ', dept: 'ซ่อมบำรุง / ทั่วไป', file: 'FM-MR10-MR-01.html', category: 'maintenance', icon: 'shield-alert', desc: 'ตรวจจุดวางกับดักสัตว์พาหะและบันทึกความผิดปกติ' },
    { code: 'FM-PD01-PD-02', title: 'แบบฟอร์มการมอบหมาย ส่งต่องาน เครื่องจักรขัดข้อง และการเปลี่ยนกะงาน', dept: 'ฝ่ายผลิต/ลูกหีบ', file: 'FM-PD01-PD-02.html', category: 'prod', icon: 'users', desc: 'ส่งมอบงานระหว่างกะและบันทึกเครื่องจักรขัดข้อง' },
    { code: 'FM-ML01-ML-12', title: 'แบบบันทึกเครื่องจักรและอุปกรณ์ ในฝ่ายหีบอ้อยกะทำงาน (DCS)', dept: 'ลูกหีบ', file: 'FM-ML01-ML-12.html', category: 'milling', icon: 'cpu', desc: 'บันทึกค่าการทำงานเครื่องจักรจาก DCS ทุก 2 ชั่วโมง' },
    { code: 'FM-PD02-PD-02', title: 'บันทึกการตรวจสอบวัสดุที่สามารถแตกหักได้ แผนกลูกหีบ', dept: 'ฝ่ายผลิต/ลูกหีบ', file: 'FM-PD02-PD-02.html', category: 'prod', icon: 'alert-octagon', desc: 'ตรวจหลอดไฟ เกจวัด และวัสดุที่แตกหักได้' }
  ];

  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let viewer = null;
  let returnFocus = null;
  let previousOverflow = '';

  function getFormUrl(file) {
    if (typeof window === 'undefined') return 'เอกสารตรวจเครื่องจักร/' + file;
    if (window.location.protocol === 'file:') {
      return (/\/public(?:\/|$)/i.test(window.location.pathname) ? '../' : '') + 'เอกสารตรวจเครื่องจักร/' + file;
    }
    // Calculate application base path (e.g. /esc-inspection/ on GitHub Pages, or / on localhost)
    let basePath = window.location.pathname.replace(/\/public(?:\/.*)?$/i, '');
    if (/\.html?$/i.test(basePath)) {
      basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
    } else if (!basePath.endsWith('/')) {
      basePath += '/';
    }
    return basePath + 'เอกสารตรวจเครื่องจักร/' + file;
  }

  function ensureStyles() {
    if (document.getElementById('esc-forms-hub-styles')) return;
    const link = document.createElement('link');
    link.id = 'esc-forms-hub-styles';
    link.rel = 'stylesheet';
    let basePath = '';
    if (typeof window !== 'undefined' && window.location.protocol === 'file:') {
      basePath = (/\/public(?:\/|$)/i.test(window.location.pathname) ? '' : 'public/');
    } else if (typeof window !== 'undefined') {
      basePath = window.location.pathname.replace(/\/public(?:\/.*)?$/i, '');
      if (/\.html?$/i.test(basePath)) basePath = basePath.substring(0, basePath.lastIndexOf('/') + 1);
      else if (!basePath.endsWith('/')) basePath += '/';
    }
    link.href = basePath + 'css/forms-hub.css';
    document.head.appendChild(link);
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
    if (values.length === 0 && (user?.role === 'inspector' || String(user?.position || '').includes('ช่าง'))) {
      values = ['FM-ML01-ML-09', 'FM-ML01-ML-10', 'FM-ML01-ML-02', 'FM-ML01-ML-11', 'FM-ML01-ML-12'];
    }
    return new Set(values.map(value => {
      const id = typeof value === 'object' && value ? value.code || value.form_code || value.file || value.id : value;
      return String(id ?? '').trim().replace(/\.html$/i, '');
    }).filter(Boolean));
  }

  function getMachineLinkedForm(machine, appState) {
    if (!machine) return null;
    const currentState = appState || (typeof state !== 'undefined' ? state : window.state) || {};
    const templates = currentState?.data?.forms || [];
    const requestedCode = String(machine.specs?.linked_form_code || machine.linked_form_code || '').trim();
    const builtinByCode = code => ESC_BUILTIN_FORMS.find(form => form.code.toUpperCase() === String(code).toUpperCase());
    const templateByCode = code => templates.find(form => String(form.form_code || form.code || form.id).toUpperCase() === String(code).toUpperCase());
    const normalizeBuiltin = form => form ? { code: form.code, title: form.title, dept: form.dept, file: form.file, type: 'builtin', formId: null, desc: form.desc } : null;
    const normalizeTemplate = form => form ? {
      code: form.form_code || form.code || String(form.id), title: form.title || form.name || 'แบบฟอร์มตรวจเช็ค',
      dept: form.department_name || form.department_code || 'แบบฟอร์มที่สร้างเอง', file: null,
      type: 'template', formId: form.id, desc: form.description || form.desc || ''
    } : null;

    if (requestedCode) {
      const exactBuiltin = builtinByCode(requestedCode);
      if (exactBuiltin) return normalizeBuiltin(exactBuiltin);
      const exactTemplate = templateByCode(requestedCode);
      if (exactTemplate) return normalizeTemplate(exactTemplate);
    }

    const haystack = [machine.machine_code, machine.name, machine.category].filter(Boolean).join(' ').toLowerCase();
    const smartRules = [
      [/ml-(?:tip|ttp)|ดั๊มพ์|ดั้มพ์|tipper/i, 'FM-ML01-ML-09'],
      [/ml-(?:fcv|mcv|scc|mcc)|สะพานดั๊มพ์|สะพานดั้มพ์|สะพานเมน/i, 'FM-ML01-ML-10'],
      [/ml-tur|turbine|เทอร์ไบน์/i, 'FM-ML01-ML-02'],
      [/ml-(?:hsb|int)|high\s*speed|สายพานความเร็วสูง|สะพานข้ามชุด/i, 'FM-ML01-ML-11'],
      [/ml-mil|ลูกหีบ|mill(?:ing)?/i, 'FM-ML01-ML-05'],
      [/ml-(?:scy|rsc)|รางเท|รางสั่น|ตาชั่ง|กากอ้อย/i, 'FM-ML01-ML-13']
    ];
    const smartCode = smartRules.find(([pattern]) => pattern.test(haystack))?.[1];
    if (smartCode) return normalizeBuiltin(builtinByCode(smartCode));

    const category = String(machine.category || '').toLowerCase();
    const matchingTemplate = templates.find(form => Number(form.target_machine_id) === Number(machine.id))
      || templates.find(form => {
        const formCategory = String(form.machine_category || '').toLowerCase();
        return formCategory && formCategory !== 'all' && (category.includes(formCategory) || haystack.includes(formCategory));
      });
    if (matchingTemplate) return normalizeTemplate(matchingTemplate);

    if (Number(machine.department_id) === 5 || /แผนก\s*5|department\s*5/.test(haystack)) {
      return normalizeBuiltin(builtinByCode('FM-ML01-ML-12'));
    }
    return normalizeTemplate(templates.find(form => Number(form.department_id) === Number(machine.department_id)));
  }

  function openLinkedFormForMachine(machineId, action = 'open') {
    const appState = typeof state !== 'undefined' ? state : window.state;
    const machine = appState?.data?.machines?.find(item => String(item.id) === String(machineId));
    if (!machine) return null;
    const linked = getMachineLinkedForm(machine, appState);
    if (!linked) return null;
    if (linked.type === 'builtin' && linked.file) {
      return openEmbeddedForm(getFormUrl(linked.file), `${linked.code} · ${linked.title}`, { printOnLoad: action === 'print', machine, formCode: linked.code });
    }
    if (linked.formId && appState.inspectSession) appState.inspectSession.form_id = linked.formId;
    return typeof window.startInspectionForMachine === 'function' ? window.startInspectionForMachine(machineId) : null;
  }

  function renderFormsHub(container) {
    if (typeof container === 'string') container = document.querySelector(container);
    if (!container || typeof container.replaceChildren !== 'function') throw new TypeError('renderFormsHub requires a container element.');
    ensureStyles();
    const user = getUser();
    const assigned = assignedCodes(user);
    const showMine = assigned.size > 0 || ['technician', 'inspector'].includes(user?.role);
    const assignedCount = ESC_BUILTIN_FORMS.filter(form => assigned.has(form.code)).length;
    const appState = typeof state !== 'undefined' ? state : window.state;
    const department = appState?.data?.departments?.find(item => String(item.id) === String(user?.department_id));
    const departmentLabel = [user?.department_name || department?.name, user?.department_code || department?.code || user?.dept_code].filter(Boolean).join(' / ') || 'ยังไม่ระบุแผนก';
    let filter = showMine ? 'mine' : 'all';
    const filters = [['mine', '⭐ แบบฟอร์มของฉัน', assignedCount], ['all', '📋 แบบฟอร์มทั้งหมด', ESC_BUILTIN_FORMS.length], ['milling', '⚙ ลูกหีบ (ML)', 9], ['prod', '🏭 ฝ่ายผลิต (PD)', 3], ['maintenance', '🛠 ซ่อมบำรุง / ทั่วไป (MR)', 1]];
    const root = document.createElement('section');
    root.className = 'esc-fh';
    root.setAttribute('aria-label', 'ศูนย์แบบฟอร์มตรวจเครื่องจักร');
    root.lang = 'th';
    root.innerHTML = `<header class="esc-fh-banner"><span class="esc-fh-eyebrow">EASTERN SUGAR AND CANE · ESC</span><h2>👋 สวัสดี คุณ${escapeHtml(user?.full_name || 'ช่างเทคนิค')} (${escapeHtml(user?.emp_code || 'ไม่ระบุรหัส')}) · ${escapeHtml(user?.position || 'ช่างเทคนิคตรวจเช็ค')}</h2><div class="esc-fh-context"><span>👷 กลุ่มงาน: <strong>${escapeHtml(user?.work_group || 'ทีมช่างตรวจเช็คเครื่องจักร')}</strong></span><span>🏢 แผนก: <strong>${escapeHtml(departmentLabel)}</strong></span><span>⭐ แบบฟอร์มที่ได้รับมอบหมาย: <strong>${assignedCount} รายการ</strong></span></div><p class="esc-fh-tip">เลือกแบบฟอร์มของฉัน แล้วกด “เริ่มกรอกแบบฟอร์ม” เพื่อบันทึกผลตรวจเครื่องจักร เมื่อต้องการเอกสาร ให้กด “พิมพ์ / PDF” และกลับมาหน้านี้ได้ด้วยปุ่มสีแดง</p></header><input class="esc-fh-search" type="search" aria-label="ค้นหาแบบฟอร์ม" placeholder="ค้นหารหัส ชื่อเครื่องจักร หรือแผนก เช่น ML-09, ดั๊มพ์..."><nav class="esc-fh-filters" aria-label="หมวดแบบฟอร์ม">${filters.map(([key, label, count]) => `<button type="button" class="esc-fh-filter ${key === 'mine' ? 'esc-fh-mine' : ''}" data-filter="${key}" aria-pressed="${key === filter}">${label} <span class="esc-fh-filter-count">${count}</span></button>`).join('')}</nav><div class="esc-fh-view-bar"><span class="esc-fh-count esc-fh-muted" role="status" aria-live="polite"></span><div class="esc-fh-view-toggles" role="group" aria-label="ปรับรูปแบบการแสดงผล"><button type="button" class="esc-fh-view-btn" data-view="large" title="การ์ดใหญ่">🗂 การ์ดใหญ่</button><button type="button" class="esc-fh-view-btn" data-view="small" title="การ์ดเล็ก">▦ การ์ดเล็ก</button><button type="button" class="esc-fh-view-btn" data-view="list" title="รายการ">☰ รายการ</button></div></div><div class="esc-fh-grid view-large"></div>`;
    container.replaceChildren(root);
    const search = root.querySelector('input');
    const grid = root.querySelector('.esc-fh-grid');
    const iconFallbacks = { truck: '🚛', conveyor: '↔', turbine: '⚙', gauge: '◴', clock: '◷', factory: '🏭', scale: '⚖', 'check-square': '☑', 'shield-alert': '⛨', users: '♟', cpu: '▦', 'alert-octagon': '⚠' };
    let viewMode = 'large';
    try { viewMode = localStorage.getItem('ESC_FORMS_VIEW_MODE') || 'large'; } catch (_) {}
    root.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === viewMode));

    function update() {
      const query = search.value.trim().toLocaleLowerCase('th');
      const forms = ESC_BUILTIN_FORMS.filter(form => (filter === 'all' || (filter === 'mine' ? assigned.has(form.code) : form.category === filter)) && [form.code, form.title, form.dept, form.desc].join(' ').toLocaleLowerCase('th').includes(query));
      root.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
      root.querySelector('.esc-fh-count').textContent = `แสดง ${forms.length} จาก ${ESC_BUILTIN_FORMS.length} แบบฟอร์ม`;
      grid.className = 'esc-fh-grid view-' + viewMode;
      grid.innerHTML = forms.map(form => {
        const linkedMachines = (appState?.data?.machines || []).filter(machine => getMachineLinkedForm(machine, appState)?.code === form.code);
        const linkedTags = linkedMachines.length ? `<p class="esc-fh-muted"><strong>🔗 เครื่องจักรที่เชื่อมโยง:</strong> ${linkedMachines.map(machine => escapeHtml(machine.machine_code)).join(', ')}</p>` : '';
        const machinePicker = linkedMachines.length ? `<div class="esc-fh-machine-picker" style="margin-top:6px;margin-bottom:8px;"><label style="font-size:12px;font-weight:bold;color:#1e3a24;display:block;margin-bottom:2px;">เลือกเครื่องจักรที่ต้องการตรวจสอบ:</label><select class="esc-fh-machine-select" data-card-form="${form.code}" style="width:100%;padding:6px 10px;border:1px solid #b7cdbd;border-radius:8px;font-size:13px;background:#f8fbf8;color:#18311e;">${linkedMachines.map(machine => `<option value="${escapeHtml(machine.id)}">${escapeHtml(machine.machine_code)} — ${escapeHtml(machine.name)}</option>`).join('')}</select></div>` : '';
        const cardBody = viewMode === 'list'
          ? `<div class="esc-fh-card-body"><div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;"><span class="esc-fh-category">${escapeHtml(form.dept)}</span>${assigned.has(form.code) ? '<span class="esc-fh-badge">⭐ มอบหมาย</span>' : ''}</div><h3>${escapeHtml(form.title)}</h3><p class="esc-fh-muted">${escapeHtml(form.desc)}</p></div>`
          : `${assigned.has(form.code) ? '<span class="esc-fh-badge">⭐ แบบฟอร์มที่ได้รับมอบหมาย</span>' : ''}<span class="esc-fh-category">${escapeHtml(form.dept)}</span><h3>${escapeHtml(form.title)}</h3><p class="esc-fh-muted">${escapeHtml(form.desc)}</p>${linkedTags}`;
        return `<article class="esc-fh-card ${assigned.has(form.code) ? 'is-assigned' : ''}"><div class="esc-fh-card-head"><span class="esc-fh-icon" aria-hidden="true" data-icon="${form.icon}">${iconFallbacks[form.icon]}</span><span class="esc-fh-code">${form.code}</span></div>${cardBody}${machinePicker}<div class="esc-fh-actions"><button type="button" class="esc-fh-primary" data-open="${form.code}">📝 เริ่มกรอกแบบฟอร์ม (ตรวจเครื่องจักร)</button><button type="button" class="esc-fh-secondary" data-print="${form.code}">🖨 พิมพ์เอกสาร / PDF</button><a class="esc-fh-secondary" href="${escapeHtml(getFormUrl(form.file))}" target="_blank" rel="noopener noreferrer">↗ เปิดในหน้าต่างใหม่</a></div></article>`;
      }).join('') || `<div class="esc-fh-empty">${filter === 'mine' && !assignedCount ? 'ยังไม่มีแบบฟอร์มที่ได้รับมอบหมาย กรุณาติดต่อหัวหน้างาน หรือเลือกดูแบบฟอร์มทั้งหมด' : 'ไม่พบแบบฟอร์ม ลองเปลี่ยนคำค้นหรือเลือกหมวดอื่น'}<br><button type="button" class="esc-fh-secondary" data-reset>ดูแบบฟอร์มทั้งหมด</button></div>`;
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
      if (button.dataset.view) {
        viewMode = button.dataset.view;
        try { localStorage.setItem('ESC_FORMS_VIEW_MODE', viewMode); } catch (_) {}
        root.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === viewMode));
        grid.className = 'esc-fh-grid view-' + viewMode;
        update();
        return;
      }
      if (button.hasAttribute('data-reset')) { filter = 'all'; search.value = ''; update(); return; }
      if (button.dataset.filter) { filter = button.dataset.filter; update(); return; }
      const form = ESC_BUILTIN_FORMS.find(item => item.code === (button.dataset.open || button.dataset.print));
      if (form) {
        const machineId = button.closest('.esc-fh-card')?.querySelector(`[data-card-form="${form.code}"]`)?.value;
        const selectedMachine = (appState?.data?.machines || []).find(machine => String(machine.id) === String(machineId));
        openEmbeddedForm(getFormUrl(form.file), `${form.code} · ${form.title}`, { printOnLoad: Boolean(button.dataset.print), machine: selectedMachine, formCode: form.code });
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

  function openEmbeddedForm(url, title, options = {}) {
    const resolved = new URL(url, window.location.href);
    if (!['http:', 'https:', 'file:'].includes(resolved.protocol) || resolved.origin !== window.location.origin) throw new TypeError('The embedded form must use a same-origin URL.');
    closeEmbeddedForm();
    ensureStyles();
    returnFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    const parts = String(title || 'แบบฟอร์มตรวจเครื่องจักร').split(' · ');
    const heading = parts.length > 1 ? `<span class="esc-fh-viewer-code">${escapeHtml(parts.shift())}</span>${escapeHtml(parts.join(' · '))}` : escapeHtml(parts[0]);
    const overlay = document.createElement('div');
    overlay.className = 'esc-fh-modal';
    overlay.innerHTML = `<section class="esc-fh-dialog" role="dialog" aria-modal="true" aria-label="${escapeHtml(title || 'แบบฟอร์มตรวจเครื่องจักร')}"><header class="esc-fh-toolbar"><h2>${heading}</h2><button type="button" class="esc-fh-print" data-viewer-print disabled>🖨 พิมพ์เอกสาร / บันทึก PDF</button><a href="${escapeHtml(resolved.href)}" target="_blank" rel="noopener noreferrer">เปิดในหน้าต่างใหม่ ↗</a><button type="button" class="esc-fh-close" data-viewer-close aria-label="ปิดแบบฟอร์มและกลับหน้ารายการ">✕ ปิดและกลับหน้ารายการ</button></header><p class="esc-fh-status" role="status" aria-live="polite">กำลังโหลดแบบฟอร์ม…</p><iframe title="${escapeHtml(title || 'แบบฟอร์มตรวจเครื่องจักร')}"></iframe></section>`;
    const frame = overlay.querySelector('iframe');
    const status = overlay.querySelector('.esc-fh-status');
    viewer = { overlay, frame, status };
    const printControl = overlay.querySelector('[data-viewer-print]');
    frame.addEventListener('load', () => {
      if (viewer?.frame !== frame) return;
      status.textContent = '';
      printControl.disabled = false;
      try { frame.contentWindow.addEventListener('keydown', event => { if (event.key === 'Escape') closeEmbeddedForm(); }); } catch (_) { /* Header controls remain available. */ }
      try {
        const appState = (typeof state !== 'undefined' ? state : window.state) || {};
        const targetFormCode = String(options.formCode || String(title || '').match(/FM-[A-Z0-9]+-[A-Z]+-\d+/i)?.[0] || '').toUpperCase();
        const activeUser = appState.activeUser;
        const eligibleUsers = (appState.data?.users || []).filter(user => {
          const forms = Array.isArray(user.assigned_forms) ? user.assigned_forms.map(value => String(value).trim().toUpperCase()) : [];
          const sameDepartment = activeUser && String(user.department_id ?? '') === String(activeUser.department_id ?? '');
          return user.role === 'super_admin'
            || forms.includes(targetFormCode)
            || forms.includes('ALL')
            || (targetFormCode.startsWith('FM-ML') && forms.includes('ML'))
            || (targetFormCode.startsWith('FM-PD') && forms.includes('PD'))
            || (targetFormCode.startsWith('FM-MR') && forms.includes('MR'))
            || sameDepartment;
        });
        if (activeUser && !eligibleUsers.some(u => String(u.id) === String(activeUser.id))) {
          eligibleUsers.unshift(activeUser);
        }
        if (eligibleUsers.length && frame.contentWindow) {
          frame.contentWindow.signerDirectory = eligibleUsers.map(user => ({ name: user.full_name, position: user.position || 'ผู้ตรวจสอบเครื่องจักร' }));
          frame.contentWindow.restoreSignerSelections?.();
        }
        const recorder = frame.contentDocument.getElementById('recorder1') || frame.contentDocument.getElementById('recorder') || frame.contentDocument.getElementById('name_recorder');
        if (activeUser && recorder) {
          if (recorder.tagName === 'SELECT' && !Array.from(recorder.options).some(o => o.value === activeUser.full_name)) {
            recorder.append(new Option(activeUser.full_name, activeUser.full_name));
          }
          recorder.value = activeUser.full_name || '';
          const position = frame.contentDocument.getElementById('position_recorder1') || frame.contentDocument.getElementById('position_recorder');
          if (position) {
            if (position.tagName === 'SELECT' && !Array.from(position.options).some(o => o.value === activeUser.position)) {
              position.append(new Option(activeUser.position, activeUser.position));
            }
            position.value = activeUser.position || '';
          }
          recorder.dispatchEvent(new Event('change', { bubbles: true }));
        }

        if (options.machine) {
          const setField = (id, value, onlyIfEmpty = false) => {
            const field = frame.contentDocument.getElementById(id);
            if (!field || !value || (onlyIfEmpty && field.value && field.value !== field.defaultValue)) return;
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
          };
          const mLabel = options.machine.id === 'all'
            ? `ชุดสถานี ${options.machine.name} (${options.machine.machine_code})`
            : `${options.machine.name} (${options.machine.machine_code})`;
          setField('machine', mLabel);
          setField('department', options.machine.division_name || 'ฝ่ายวิศวกรรม', true);
          setField('section', options.machine.department_name || 'แผนกซ่อมบำรุง', true);
          const today = new Date();
          const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
          setField('date', localDate, true);
          frame.contentWindow.refreshPrintTemplate?.().catch?.(() => {});
        }

        // ====================================================
        // AUTO-SAVE PDF WHEN ALL SIGNATURES ARE COMPLETE
        // ====================================================
        let autoPdfTriggered = false;
        const checkAndTriggerAutoPdf = () => {
          if (autoPdfTriggered) return;
          try {
            const frameWin = frame.contentWindow;
            const frameDoc = frame.contentDocument;
            if (!frameWin || !frameDoc) return;

            let isComplete = false;
            // Case 1: isLocked() function (Type A: FM-ML01-02, 05, 06, 09, 10, 11, PD-01)
            if (typeof frameWin.isLocked === 'function') {
              isComplete = Boolean(frameWin.isLocked());
            }
            // Case 2: roles & signatureData check
            else if (frameWin.roles && frameWin.signatureData) {
              const roleKeys = Object.keys(frameWin.roles);
              isComplete = roleKeys.length > 0 && roleKeys.every(id => Boolean(frameWin.signatureData[id]));
            }
            // Case 3: sigCanvases check (Type B: FM-ML01-12, 13, 18, MR-01, PD-02)
            else if (frameWin.sigCanvases) {
              const keys = Object.keys(frameWin.sigCanvases);
              if (keys.length > 0) {
                isComplete = keys.every(id => {
                  const cv = frameWin.sigCanvases[id];
                  return cv && (cv._isSigned || cv.dataset.isSigned === 'true');
                });
              }
            }

            if (isComplete) {
              autoPdfTriggered = true;
              status.innerHTML = '<span style="color:#15803d;font-weight:bold;background:#ecfdf5;padding:6px 14px;border-radius:10px;border:1px solid #a7f3d0;display:inline-block;">✅ เซ็นชื่อครบทุกคนแล้ว! กำลังบันทึกเอกสารเป็น PDF อัตโนมัติ...</span>';
              setTimeout(() => {
                try {
                  const pdfBtn = frameDoc.getElementById('savePDF');
                  if (pdfBtn) {
                    pdfBtn.click();
                    status.innerHTML = '<span style="color:#15803d;font-weight:bold;">✅ บันทึกไฟล์ PDF อัตโนมัติเรียบร้อยแล้ว</span>';
                    return;
                  }
                  const printBtn = frameDoc.getElementById('print');
                  if (printBtn) {
                    printBtn.click();
                    status.innerHTML = '<span style="color:#15803d;font-weight:bold;">✅ เปิดหน้าต่างพิมพ์/บันทึก PDF เรียบร้อยแล้ว</span>';
                    return;
                  }
                  if (typeof frameWin.printDoc === 'function') {
                    frameWin.renderCanvasPrint?.();
                    frameWin.printDoc();
                    return;
                  }
                  frameWin.print();
                } catch (err) {
                  console.warn('Auto PDF trigger error:', err);
                  status.textContent = 'กรุณากดปุ่ม พิมพ์เอกสาร / บันทึก PDF ด้านบน';
                }
              }, 600);
            }
          } catch (_) {}
        };

        const frameWin = frame.contentWindow;
        const frameDoc = frame.contentDocument;
        if (frameWin && frameDoc) {
          if (typeof frameWin.updateLock === 'function') {
            const origLock = frameWin.updateLock;
            frameWin.updateLock = function() {
              const res = origLock.apply(this, arguments);
              setTimeout(checkAndTriggerAutoPdf, 250);
              return res;
            };
          }
          
          const markCanvasSigned = (e) => {
            if (e.target && e.target.tagName === 'CANVAS') {
              e.target._isSigned = true;
              e.target.dataset.isSigned = 'true';
            }
          };
          frameDoc.addEventListener('pointerdown', markCanvasSigned, { passive: true });
          frameDoc.addEventListener('pointermove', markCanvasSigned, { passive: true });
          frameDoc.addEventListener('touchstart', markCanvasSigned, { passive: true });

          frameDoc.addEventListener('click', (e) => {
            if (e.target && e.target.tagName === 'BUTTON' && (e.target.textContent.includes('Clear') || e.target.textContent.includes('ล้าง'))) {
               const cv = e.target.parentElement.querySelector('canvas') || e.target.closest('div')?.querySelector('canvas');
               if (cv) {
                 cv._isSigned = false;
                 cv.dataset.isSigned = 'false';
                 autoPdfTriggered = false;
               }
            }
            setTimeout(checkAndTriggerAutoPdf, 400);
          });
          frameDoc.addEventListener('mouseup', () => setTimeout(checkAndTriggerAutoPdf, 400));
          frameDoc.addEventListener('touchend', () => setTimeout(checkAndTriggerAutoPdf, 400));
          setTimeout(checkAndTriggerAutoPdf, 1200);
        }
      } catch (_) { /* Some legacy forms may not expose same-origin fields. */ }
      if (options.printOnLoad) { options.printOnLoad = false; printEmbeddedForm(); }
    });
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
  window.getMachineLinkedForm = getMachineLinkedForm;
  window.openLinkedFormForMachine = openLinkedFormForMachine;
})();
