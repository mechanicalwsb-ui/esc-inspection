// ============================================================================
// COMIS Center — Views, Dynamic Form Builder, CRUD Modals & Print Engine
// ============================================================================

// ============================================================================
// RESIZABLE TABLE COLUMNS ENGINE WITH LOCALSTORAGE PERSISTENCE (v2.12.0)
// ============================================================================
function debounce(fn, delay = 180) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

let _debounceMachineSearchTimer = null;
function onMachineSearchInput(val) {
  state.machineSearch = val;
  clearTimeout(_debounceMachineSearchTimer);
  _debounceMachineSearchTimer = setTimeout(() => {
    renderCurrentTab();
    const el = document.getElementById('m-search-input');
    if (el) {
      el.focus();
      const len = el.value.length;
      el.setSelectionRange(len, len);
    }
  }, 180);
}

// ============================================================================
// 3. DEFECT & F-TAG TRACKING CENTER (CRUD)
// ============================================================================
function renderDefects(container) {
  let defects = filterByGlobalDept(state.data.defects, 'assigned_dept_id');
  if (state.defectStatusFilter !== 'ALL') {
    defects = defects.filter(d => d.status === state.defectStatusFilter);
  }
  if (state.defectMachineFilter && state.defectMachineFilter !== 'ALL') {
    defects = defects.filter(d => Number(d.machine_id) === Number(state.defectMachineFilter));
  }

  const statusMap = {
    open: { label: '🔴 รอรับเรื่อง (Open)', cls: 'bg-rose-100 text-rose-700 border-rose-300' },
    pending_repair: { label: '⏳ รอซ่อม (Pending Repair)', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
    under_repair: { label: '🛠️ อยู่ระหว่างการซ่อม (Under Repair)', cls: 'bg-orange-100 text-orange-800 border-orange-300' },
    in_progress: { label: '🛠️ กำลังดำเนินการซ่อม (In Progress)', cls: 'bg-orange-100 text-orange-800 border-orange-300' },
    waiting_parts: { label: '📦 รออะไหล่ (Waiting Parts)', cls: 'bg-purple-100 text-purple-800 border-purple-300' },
    resolved: { label: '✅ ซ่อมเสร็จแล้ว (Resolved)', cls: 'bg-emerald-100 text-emerald-700 border-emerald-300' },
    closed: { label: '🔒 ปิดงานสมบูรณ์ (Closed)', cls: 'bg-slate-100 text-slate-600 border-slate-300' }
  };

  container.innerHTML = `
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-rose-600"></i>
            กระดานติดตามความผิดปกติและใบแจ้งซ่อม (Defect & F-Tag Tracking Board)
          </h2>
          <p class="text-xs text-slate-500">ติดตามงานซ่อมตั้งแต่ตรวจพบความผิดปกติ จนกระทั่งแก้ไขเสร็จและปิดงาน (Closed-Loop Maintenance)</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select onchange="state.defectMachineFilter = this.value === 'ALL' ? 'ALL' : Number(this.value); renderCurrentTab();" class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="ALL" ${!state.defectMachineFilter || state.defectMachineFilter === 'ALL' ? 'selected' : ''}>⚙️ ทุกเครื่องจักร</option>
            ${state.data.machines.map(m => `<option value="${m.id}" ${Number(state.defectMachineFilter) === Number(m.id) ? 'selected' : ''}>[${m.machine_code}] ${m.name.slice(0, 30)}</option>`).join('')}
          </select>
          <select onchange="state.defectStatusFilter = this.value; renderCurrentTab();" class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="ALL" ${state.defectStatusFilter === 'ALL' ? 'selected' : ''}>ทุกสถานะ (${state.data.defects.length})</option>
            <option value="open" ${state.defectStatusFilter === 'open' ? 'selected' : ''}>🔴 รอรับเรื่อง (Open)</option>
            <option value="pending_repair" ${state.defectStatusFilter === 'pending_repair' ? 'selected' : ''}>⏳ รอซ่อม (Pending Repair)</option>
            <option value="under_repair" ${state.defectStatusFilter === 'under_repair' ? 'selected' : ''}>🛠️ อยู่ระหว่างการซ่อม</option>
            <option value="in_progress" ${state.defectStatusFilter === 'in_progress' ? 'selected' : ''}>🛠️ กำลังดำเนินการซ่อม</option>
            <option value="waiting_parts" ${state.defectStatusFilter === 'waiting_parts' ? 'selected' : ''}>📦 รออะไหล่</option>
            <option value="resolved" ${state.defectStatusFilter === 'resolved' ? 'selected' : ''}>✅ ซ่อมเสร็จแล้ว</option>
            <option value="closed" ${state.defectStatusFilter === 'closed' ? 'selected' : ''}>🔒 ปิดงานสมบูรณ์</option>
          </select>
          <button onclick="openDefectModal(null)" class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs">
            <i data-lucide="plus" class="w-4 h-4"></i> + เปิดใบแจ้งซ่อม / F-Tag ใหม่
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-4">
        ${defects.length === 0 ? `<div class="p-8 text-center text-slate-400 text-sm">ไม่พบรายการใบแจ้งซ่อมในตัวกรองนี้</div>` : ''}
        ${defects.map(dt => {
          const st = statusMap[dt.status] || statusMap.open;
          return `
            <div class="rounded-2xl border ${dt.status === 'open' ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 bg-white'} p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div class="space-y-2 flex-1">
                <div class="flex flex-wrap items-center gap-2">
                  <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white">${dt.ticket_no}</span>
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.cls}">${st.label}</span>
                  <span class="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">${dt.machine_code}: ${dt.machine_name}</span>
                  <span class="text-xs text-slate-500">แผนกซ่อม: <strong style="color:${dt.assigned_dept_color || '#2563eb'}">${dt.assigned_dept_name || '-'}</strong></span>
                </div>
                <h3 class="font-bold text-slate-800 text-sm">${dt.defect_title}</h3>
                <p class="text-xs text-slate-600 whitespace-pre-line">${dt.defect_detail || ''}</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 text-xs">
                  <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span class="text-slate-400 font-semibold">🔍 สาเหตุ (Root Cause):</span>
                    <span class="text-slate-700 font-medium">${dt.root_cause || 'รอระบุสาเหตุ...'}</span>
                  </div>
                  <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <span class="text-slate-400 font-semibold">🔧 การแก้ไข (Corrective Action):</span>
                    <span class="text-slate-700 font-medium">${dt.corrective_action || 'รอดำเนินการแก้ไข...'}</span>
                  </div>
                </div>
                <div class="text-[11px] text-slate-400 flex flex-wrap items-center gap-4 pt-1">
                  <span>👤 แจ้งโดย: ${dt.reported_by}</span>
                  <span>👷 ผู้รับผิดชอบซ่อม: <strong>${dt.assigned_to || 'ยังไม่ระบุ'}</strong></span>
                  <span>⏱️ เวลาหยุดเครื่อง: <strong>${dt.downtime_hours || 0} ชม.</strong></span>
                  <span>📅 วันที่แจ้ง: ${dt.created_at}</span>
                </div>
              </div>

              <div class="flex flex-wrap lg:flex-col items-center gap-2 self-end lg:self-center">
                <button onclick="openDefectModal(${dt.id})" class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5">
                  <i data-lucide="wrench" class="w-3.5 h-3.5"></i> อัปเดตงานซ่อม / ปิดงาน
                </button>
                <button onclick="deleteDefectTicket(${dt.id})" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-700 text-xs font-medium flex items-center gap-1">
                  <i data-lucide="trash-2" class="w-3.5 h-3.5"></i> ลบ
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function openDefectModal(defectId) {
  if (defectId) ComisSync.captureRevision('/api/defects/' + defectId);
  const dt = defectId ? state.data.defects.find(x => x.id === Number(defectId)) : null;
  const title = dt ? `🛠️ อัปเดตใบแจ้งซ่อม / F-Tag: ${dt.ticket_no}` : '🚨 เปิดใบแจ้งความผิดปกติ / ใบแจ้งซ่อมใหม่ (F-Tag)';

  const html = `
    <form onsubmit="saveDefectTicket(event, ${dt ? dt.id : 'null'})" class="space-y-4 text-xs">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">เครื่องจักรที่พบปัญหา *</label>
          <select id="def-machine-id" required class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            ${state.data.machines.map(m => `<option value="${m.id}" ${dt && dt.machine_id === m.id ? 'selected' : ''}>[${m.machine_code}] ${m.name}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชิ้นส่วนย่อย / จุดที่เสีย (Component)</label>
          <input type="text" id="def-component" value="${dt?.component_name || 'ชุดลูกปืน / จุดหมุนหลัก'}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">หัวข้ออาการผิดปกติที่พบ *</label>
          <input type="text" id="def-title" required value="${dt?.defect_title || ''}" placeholder="เช่น อุณหภูมิลูกปืนสูงเกิน 80°C / พบรอยรั่วที่ซีลปั๊ม" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">รายละเอียดเพิ่มเติม</label>
          <textarea id="def-detail" rows="2" class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5">${dt?.defect_detail || ''}</textarea>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">แผนกที่รับผิดชอบเข้าซ่อม (ฝ่าย &gt;&gt; แผนก)</label>
          <select id="def-dept-id" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            ${renderDepartmentSelectOptions(dt?.assigned_dept_id)}
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ช่าง/ทีมผู้รับผิดชอบซ่อม</label>
          <input type="text" id="def-assigned-to" value="${dt?.assigned_to || ''}" placeholder="เช่น ทีมซ่อมบำรุงเครื่องกลชุดที่ 1" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ระดับความรุนแรง (Severity)</label>
          <select id="def-severity" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="critical" ${dt?.severity === 'critical' ? 'selected' : ''}>🔴 Critical (หยุดเครื่องฉุกเฉิน)</option>
            <option value="high" ${!dt || dt?.severity === 'high' ? 'selected' : ''}>🟠 High (ต้องซ่อมภายในวันนี้)</option>
            <option value="medium" ${dt?.severity === 'medium' ? 'selected' : ''}>🟡 Medium (วางแผนซ่อมในรอบสัปดาห์)</option>
            <option value="low" ${dt?.severity === 'low' ? 'selected' : ''}>🟢 Low (ซ่อมตามรอบ PM)</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สถานะการดำเนินการซ่อม *</label>
          <select id="def-status" class="w-full bg-blue-50 border border-blue-300 rounded-xl px-3 py-2 font-bold text-blue-900">
            <option value="open" ${dt?.status === 'open' ? 'selected' : ''}>🔴 รอรับเรื่อง (Open)</option>
            <option value="pending_repair" ${dt?.status === 'pending_repair' ? 'selected' : ''}>⏳ รอซ่อม (Pending Repair)</option>
            <option value="under_repair" ${dt?.status === 'under_repair' ? 'selected' : ''}>🛠️ อยู่ระหว่างการซ่อม (Under Repair)</option>
            <option value="in_progress" ${dt?.status === 'in_progress' ? 'selected' : ''}>🛠️ กำลังดำเนินการซ่อม (In Progress)</option>
            <option value="waiting_parts" ${dt?.status === 'waiting_parts' ? 'selected' : ''}>📦 รออะไหล่ (Waiting Parts)</option>
            <option value="resolved" ${dt?.status === 'resolved' ? 'selected' : ''}>✅ ซ่อมเสร็จเรียบร้อย (Resolved -> คืนสถานะเครื่องปกติ)</option>
            <option value="closed" ${dt?.status === 'closed' ? 'selected' : ''}>🔒 ปิดงานสมบูรณ์ (Closed)</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">🔍 สาเหตุของปัญหา (Root Cause Analysis)</label>
          <input type="text" id="def-root-cause" value="${dt?.root_cause || ''}" placeholder="ระบุสาเหตุที่แท้จริงที่ทำให้เกิดความผิดปกติ..." class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">🔧 วิธีการแก้ไขและซ่อมบำรุง (Corrective Action)</label>
          <textarea id="def-action" rows="2" placeholder="ระบุรายละเอียดการซ่อม การเปลี่ยนอะไหล่ และการทดสอบหลังซ่อม..." class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5">${dt?.corrective_action || ''}</textarea>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">⏱️ ชั่วโมงเครื่องจักรหยุดเสีย (Downtime Hours)</label>
          <input type="number" step="0.5" id="def-downtime" value="${dt?.downtime_hours || 0}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
      </div>

      <div class="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">ยกเลิก</button>
        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">💾 บันทึกข้อมูลใบแจ้งซ่อม</button>
      </div>
    </form>
  `;
  openModal(title, html);
}

async function saveDefectTicket(e, id) {
  e.preventDefault();
  const payload = {
    machine_id: Number(document.getElementById('def-machine-id').value),
    component_name: document.getElementById('def-component').value,
    defect_title: document.getElementById('def-title').value,
    defect_detail: document.getElementById('def-detail').value,
    assigned_dept_id: Number(document.getElementById('def-dept-id').value),
    assigned_to: document.getElementById('def-assigned-to').value,
    severity: document.getElementById('def-severity').value,
    status: document.getElementById('def-status').value,
    root_cause: document.getElementById('def-root-cause').value,
    corrective_action: document.getElementById('def-action').value,
    downtime_hours: Number(document.getElementById('def-downtime').value),
    reported_by: state.activeUser?.full_name || 'System Admin',
    actor: state.activeUser?.full_name || 'System Admin'
  };

  try {
    const res = id
      ? await apiRequest(`/api/defects/${id}`, 'PUT', payload)
      : await apiRequest('/api/defects', 'POST', payload);
    closeModal();
    updateStateData(res.data);
    showToast('บันทึกข้อมูลใบแจ้งซ่อมเรียบร้อยแล้ว', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteDefectTicket(id) {
  if (!confirm('ยืนยันการลบใบแจ้งซ่อมนี้?')) return;
  try {
    const res = await apiRequest(`/api/defects/${id}`, 'DELETE');
    updateStateData(res.data);
    showToast('ลบใบแจ้งซ่อมเรียบร้อยแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// 4. INSPECTION HISTORY, APPROVAL & OFFICIAL PRINTABLE REPORT
// ============================================================================
function renderHistory(container) {
  let list = filterByGlobalDept(state.data.inspections);
  if (state.historyResultFilter !== 'ALL') {
    list = list.filter(i => i.overall_result === state.historyResultFilter);
  }
  if (state.historyMachineFilter && state.historyMachineFilter !== 'ALL') {
    list = list.filter(i => Number(i.machine_id) === Number(state.historyMachineFilter));
  }

  container.innerHTML = `
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <i data-lucide="file-spreadsheet" class="w-5 h-5 text-blue-600"></i>
            ประวัติผลการตรวจเช็คเครื่องจักร & การอนุมัติใบงาน (Inspection Records)
          </h2>
          <p class="text-xs text-slate-500">ตรวจสอบย้อนหลัง อนุมัติผลตรวจโดยหัวหน้าแผนก พิมพ์ใบรายงาน PDF สำหรับ ISO Audit หรือส่งออก Excel</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <select onchange="state.historyMachineFilter = this.value === 'ALL' ? 'ALL' : Number(this.value); renderCurrentTab();" class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="ALL" ${!state.historyMachineFilter || state.historyMachineFilter === 'ALL' ? 'selected' : ''}>⚙️ ทุกเครื่องจักร</option>
            ${state.data.machines.map(m => `<option value="${m.id}" ${Number(state.historyMachineFilter) === Number(m.id) ? 'selected' : ''}>[${m.machine_code}] ${m.name.slice(0, 30)}</option>`).join('')}
          </select>
          <select onchange="state.historyResultFilter = this.value; renderCurrentTab();" class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="ALL" ${state.historyResultFilter === 'ALL' ? 'selected' : ''}>ผลการตรวจทั้งหมด (${state.data.inspections.length})</option>
            <option value="normal" ${state.historyResultFilter === 'normal' ? 'selected' : ''}>🟢 ปกติ (Normal)</option>
            <option value="warning" ${state.historyResultFilter === 'warning' ? 'selected' : ''}>🟡 เฝ้าระวัง (Warning)</option>
            <option value="abnormal" ${state.historyResultFilter === 'abnormal' ? 'selected' : ''}>🔴 ผิดปกติ (Abnormal)</option>
          </select>
          <button onclick="resetTableColumnWidths('inspection_history')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer" title="คืนค่าความกว้างคอลัมน์ตารางเป็นค่าเริ่มต้น">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> คืนค่าขนาดคอลัมน์
          </button>
          <button onclick="exportInspectionsCSV()" class="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="download" class="w-4 h-4"></i> ส่งออก Excel (CSV)
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table id="tbl-inspections-history" data-resizable-key="inspection_history" class="w-full text-left border-collapse text-xs table-resizable">
          <thead>
            <tr class="bg-slate-100 text-slate-600 border-b border-slate-200">
              <th style="width: 170px;" class="py-3 px-3 font-bold">เลขที่ใบตรวจ / วันเวลา</th>
              <th style="width: 180px;" class="py-3 px-3 font-bold">เครื่องจักร</th>
              <th style="width: 160px;" class="py-3 px-3 font-bold">ฝ่าย (Division)</th>
              <th style="width: 220px;" class="py-3 px-3 font-bold">แบบฟอร์ม / แผนก</th>
              <th style="width: 160px;" class="py-3 px-3 font-bold">ผู้ตรวจ / กะ</th>
              <th style="width: 110px;" class="py-3 px-3 font-bold">ผลรวม</th>
              <th style="width: 110px;" class="py-3 px-3 font-bold">การอนุมัติ</th>
              <th style="width: 150px;" class="py-3 px-3 font-bold text-right">จัดการ / พิมพ์</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${list.map(ins => {
              const divName = ins.division_name || (state.data.departments.find(d => Number(d.id) === Number(ins.department_id))?.plant_name) || 'ฝ่ายปฏิบัติการ';
              return `
              <tr class="hover:bg-slate-50/80 ${ins.inspection_type === 'emergency_quick' ? 'bg-rose-50/30' : ''}">
                <td class="py-3 px-3">
                  <div class="flex items-center gap-1.5">
                    <span class="font-mono font-bold text-blue-700">${ins.doc_no}</span>
                    ${ins.inspection_type === 'emergency_quick' ? `<span class="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[10px] font-extrabold">⚡ ฉุกเฉิน/เฉพาะจุด</span>` : ''}
                  </div>
                  <div class="text-[11px] text-slate-400">${ins.inspected_at}</div>
                </td>
                <td class="py-3 px-3">
                  <div class="font-bold text-slate-800">${ins.machine_code}</div>
                  <div class="text-[11px] text-slate-500">${ins.machine_name}</div>
                </td>
                <td class="py-3 px-3">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px]">📂 ${divName}</span>
                </td>
                <td class="py-3 px-3">
                  <div class="font-medium text-slate-700">${ins.form_title}</div>
                  <span class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100" style="color:${ins.department_color || '#2563eb'}">[${ins.department_code || '-'}] ${ins.department_name || ''}</span>
                </td>
                <td class="py-3 px-3">
                  <div class="font-semibold text-slate-700">${ins.inspector_name}</div>
                  ${Array.isArray(ins.co_inspectors) && ins.co_inspectors.length > 1
                    ? `<div class="text-[10px] text-emerald-700 font-semibold">🤝 ร่วมตรวจ (${ins.co_inspectors.length}): ${ins.co_inspectors.join(', ')}</div>`
                    : ''
                  }
                  <div class="text-[11px] text-slate-400">${ins.shift}</div>
                </td>
                <td class="py-3 px-3">
                  ${getHealthBadge(ins.overall_result)}
                  <div class="text-[10px] text-slate-400 mt-1">ปกติ ${ins.normal_count} | เตือน ${ins.warning_count} | เสีย ${ins.abnormal_count}</div>
                </td>
                <td class="py-3 px-3">
                  ${ins.approval_status === 'approved'
                    ? `<span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">✅ อนุมัติแล้ว (${ins.approved_by.split(' ')[0]})</span>`
                    : `<button onclick="approveInspectionRecord(${ins.id})" class="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs">⏳ กดอนุมัติผล</button>`
                  }
                </td>
                <td class="py-3 px-3 text-right">
                  <div class="inline-flex items-center gap-1.5">
                    <button onclick="openInspectionReportModal(${ins.id})" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold flex items-center gap-1">
                      <i data-lucide="printer" class="w-3.5 h-3.5"></i> ดูใบงาน/พิมพ์
                    </button>
                    <button onclick="deleteInspectionRecord(${ins.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function approveInspectionRecord(id) {
  try {
    const res = await apiRequest(`/api/inspections/${id}/approve`, 'PUT', {
      approval_status: 'approved',
      approved_by: state.activeUser?.full_name || 'หัวหน้าแผนกวิศวกรรม'
    });
    updateStateData(res.data);
    showToast('อนุมัติใบตรวจเช็คเรียบร้อยแล้ว', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteInspectionRecord(id) {
  if (!confirm('ยืนยันการลบประวัติใบตรวจเช็คนี้?')) return;
  try {
    const res = await apiRequest(`/api/inspections/${id}`, 'DELETE');
    updateStateData(res.data);
    showToast('ลบประวัติใบตรวจเช็คแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openInspectionReportModal(inspectionId) {
  const ins = state.data.inspections.find(x => x.id === Number(inspectionId));
  if (!ins) return;
  const divName = ins.division_name || (state.data.departments.find(d => Number(d.id) === Number(ins.department_id))?.plant_name) || 'ฝ่ายปฏิบัติการ';

  const html = `
    <div class="border-2 border-[#1f760e] p-6 rounded-xl space-y-5 text-xs text-slate-900">
      <div class="flex items-start justify-between border-b-2 border-[#1f760e] pb-4">
        <div class="flex items-center gap-3">
          <img src="${ComisDomain.isStandalone() ? 'public/' : ''}assets/brand/logo.png" onerror="this.style.display='none'" alt="ESC Logo" class="h-12 w-auto object-contain" />
          <div>
            <div class="text-xs font-bold text-[#1f760e] uppercase">EASTERN SUGAR & CANE GROUP — OFFICIAL INSPECTION REPORT</div>
            <h2 class="text-lg font-extrabold text-slate-900 mt-0.5">${esc(state.data.settings.organization_name || 'บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน)')}</h2>
            <p class="text-xs text-slate-600">
              แบบฟอร์ม: <strong>[${esc(ins.form_code)}] ${esc(ins.form_title)}</strong>
              ${ins.inspection_type === 'emergency_quick' ? `<span class="ml-2 px-2 py-0.5 rounded bg-rose-600 text-white font-bold text-[10px]">⚡ บันทึกฉุกเฉินเฉพาะจุด (Ad-Hoc Quick Log)</span>` : ''}
            </p>
          </div>
        </div>
        <div class="text-right">
          <div class="font-mono font-bold text-sm bg-[#1f760e] text-white px-3 py-1 rounded inline-block">${esc(ins.doc_no)}</div>
          <div class="text-xs text-slate-600 mt-1">วันที่ตรวจ: <strong>${esc(ins.inspected_at)}</strong></div>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <div><span class="text-slate-400 block">รหัสเครื่องจักร:</span><strong class="text-sm">${esc(ins.machine_code)}</strong></div>
        <div><span class="text-slate-400 block">ชื่อเครื่องจักร:</span><strong>${esc(ins.machine_name)}</strong></div>
        <div><span class="text-slate-400 block">ฝ่าย (Division):</span><strong>${esc(divName)}</strong></div>
        <div><span class="text-slate-400 block">แผนกผู้ตรวจ:</span><strong>[${esc(ins.department_code || '-')}] ${esc(ins.department_name || '-')}</strong></div>
        <div><span class="text-slate-400 block">ผลการประเมินรวม:</span><strong class="uppercase">${esc(ins.overall_result)}</strong></div>
      </div>

      ${Array.isArray(ins.co_inspectors) && ins.co_inspectors.length > 1 ? `
        <div class="bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-emerald-900">
          🤝 <strong>ทีมช่างผู้ร่วมตรวจเช็คในใบงานนี้ (${ins.co_inspectors.length} คน):</strong> ${esc(ins.co_inspectors.join(', '))}
        </div>
      ` : ''}

      <table class="w-full border-collapse border border-slate-300 text-xs">
        <thead>
          <tr class="bg-slate-800 text-white">
            <th class="border border-slate-300 py-2 px-3 text-left w-10">#</th>
            <th class="border border-slate-300 py-2 px-3 text-left">หัวข้อการตรวจสอบ (Inspection Item)</th>
            <th class="border border-slate-300 py-2 px-3 text-center w-36">ค่าที่วัดได้ / คำตอบ</th>
            <th class="border border-slate-300 py-2 px-3 text-center w-28">สถานะ</th>
            <th class="border border-slate-300 py-2 px-3 text-left">หมายเหตุ / ผู้ตรวจ</th>
          </tr>
        </thead>
        <tbody>
          ${(ins.answers || []).map((a, idx) => `
            <tr>
              <td class="border border-slate-300 py-2 px-3 font-bold">${idx + 1}</td>
              <td class="border border-slate-300 py-2 px-3 font-medium">${esc(a.label)}</td>
              <td class="border border-slate-300 py-2 px-3 text-center font-mono font-bold">${esc(a.value)} ${esc(a.unit || '')}</td>
              <td class="border border-slate-300 py-2 px-3 text-center font-bold ${a.status === 'abnormal' ? 'text-rose-600' : a.status === 'warning' ? 'text-amber-600' : 'text-emerald-700'}">
                ${a.status === 'abnormal' ? '🔴 ผิดปกติ' : a.status === 'warning' ? '🟡 เฝ้าระวัง' : '🟢 ปกติ'}
              </td>
              <td class="border border-slate-300 py-2 px-3 text-slate-600">
                ${esc(a.remark || '-')}
                ${a.checked_by ? `<div class="text-[10px] text-slate-400">👤 ตรวจโดย: ${esc(a.checked_by)}</div>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <strong>📝 สรุปผลการตรวจเช็ค / ข้อเสนอแนะจากผู้ตรวจ:</strong>
        <p class="mt-1 text-slate-700">${esc(ins.inspector_note || '-')}</p>
        <p class="mt-1 text-slate-700">Supervisor comments: ${esc(ins.approval_note || '-')}</p>
      </div>

      <div class="grid grid-cols-2 gap-6 pt-4 border-t border-slate-300">
        <div class="text-center space-y-1">
          <div class="text-slate-500">ลงชื่อผู้ตรวจเช็ค (Inspector)</div>
          ${ins.signature_data ? `<img src="${esc(ins.signature_data)}" class="h-14 mx-auto object-contain" />` : `<div class="h-10 flex items-center justify-center font-bold text-blue-800">${esc(ins.inspector_name)}</div>`}
          <div class="font-bold">(${esc(ins.inspector_name)})</div>
          <div class="text-[11px] text-slate-500">${esc(ins.shift)}</div>
        </div>
        <div class="text-center space-y-1">
          <div class="text-slate-500">ลงชื่อหัวหน้าแผนก / ผู้อนุมัติ (Supervisor)</div>
          <div class="h-14 flex items-center justify-center font-bold text-emerald-700">
            ${ins.approval_status === 'approved' ? `✅ อนุมัติแล้วโดย ${esc(ins.approved_by)}` : '⏳ รอการอนุมัติ'}
          </div>
          <div class="font-bold">(${esc(ins.approved_by || '............................................')})</div>
          <div class="text-[11px] text-slate-500">วันที่อนุมัติ: ${esc(ins.approved_at || '-')}</div>
        </div>
      </div>
    </div>
  `;

  openPrintModal(`ใบรายงานผลการตรวจสอบเครื่องจักร: ${ins.doc_no}`, html);
}

// ============================================================================
// 5. MACHINE MASTER DATA CRUD & QR CODE GENERATOR
// ============================================================================
function renderMachines(container) {
  let machines = filterByGlobalDept(state.data.machines);
  const divisions = Array.from(new Set((state.data.departments || []).map(d => d.plant_name).filter(Boolean)));

  if (state.machineDivisionFilter && state.machineDivisionFilter !== 'ALL') {
    machines = machines.filter(m => {
      const divName = m.division_name || (state.data.departments.find(d => Number(d.id) === Number(m.department_id))?.plant_name) || '';
      return divName === state.machineDivisionFilter;
    });
  }
  if (state.machineOperatingFilter && state.machineOperatingFilter !== 'ALL') {
    machines = machines.filter(m => {
      if (state.machineOperatingFilter === 'under_repair') {
        return m.operating_state === 'under_repair' || m.operating_state === 'maintenance';
      }
      return m.operating_state === state.machineOperatingFilter;
    });
  }
  if (state.machineStatusFilter !== 'ALL') {
    machines = machines.filter(m => m.health_status === state.machineStatusFilter);
  }
  if (state.machineSearch.trim() !== '') {
    const q = state.machineSearch.toLowerCase();
    machines = machines.filter(m => {
      const divName = m.division_name || (state.data.departments.find(d => Number(d.id) === Number(m.department_id))?.plant_name) || '';
      return (
        m.machine_code.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        (m.plant_area || '').toLowerCase().includes(q) ||
        (m.department_code || '').toLowerCase().includes(q) ||
        (m.department_name || '').toLowerCase().includes(q) ||
        divName.toLowerCase().includes(q)
      );
    });
  }

  container.innerHTML = `
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <i data-lucide="cog" class="w-5 h-5 text-blue-600"></i>
            ทะเบียนเครื่องจักรหลักและชิ้นส่วนย่อย (Machine Master Data - CRUD)
          </h2>
          <p class="text-xs text-slate-500">สามารถ เพิ่ม แก้ไข คัดลอก ลบ เครื่องจักร แยกตามฝ่ายและแผนก พร้อมสั่งพิมพ์ป้ายสติ๊กเกอร์ QR Code ประจำเครื่องได้ทันที</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <input id="m-search-input" type="text" value="${state.machineSearch}" oninput="onMachineSearchInput(this.value)" placeholder="🔍 ค้นหารหัส/ชื่อ/ฝ่าย/แผนก..." class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 w-52 focus:outline-none focus:border-blue-600 focus:bg-white shadow-xs" />
          <select onchange="state.machineDivisionFilter = this.value; renderCurrentTab();" class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="ALL" ${!state.machineDivisionFilter || state.machineDivisionFilter === 'ALL' ? 'selected' : ''}>📂 ทุกฝ่าย (All Divisions)</option>
            ${divisions.map(div => `<option value="${div}" ${state.machineDivisionFilter === div ? 'selected' : ''}>📂 ${div}</option>`).join('')}
          </select>
          <select onchange="state.machineStatusFilter = this.value; renderCurrentTab();" class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="ALL" ${state.machineStatusFilter === 'ALL' ? 'selected' : ''}>ทุกสถานะสุขภาพ</option>
            <option value="normal" ${state.machineStatusFilter === 'normal' ? 'selected' : ''}>🟢 ปกติ (Normal)</option>
            <option value="warning" ${state.machineStatusFilter === 'warning' ? 'selected' : ''}>🟡 เฝ้าระวัง (Warning)</option>
            <option value="abnormal" ${state.machineStatusFilter === 'abnormal' ? 'selected' : ''}>🔴 ผิดปกติ (Abnormal)</option>
          </select>
          <select onchange="state.machineOperatingFilter = this.value; renderCurrentTab();" class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="ALL" ${!state.machineOperatingFilter || state.machineOperatingFilter === 'ALL' ? 'selected' : ''}>ทุกการเดินเครื่อง</option>
            <option value="running" ${state.machineOperatingFilter === 'running' ? 'selected' : ''}>🟢 เดินเครื่อง</option>
            <option value="standby" ${state.machineOperatingFilter === 'standby' ? 'selected' : ''}>⚪ หยุดสำรอง</option>
            <option value="pending_repair" ${state.machineOperatingFilter === 'pending_repair' ? 'selected' : ''}>⏳ รอซ่อม</option>
            <option value="under_repair" ${state.machineOperatingFilter === 'under_repair' ? 'selected' : ''}>🛠️ ระหว่างซ่อม</option>
          </select>
          <button onclick="autoFitTableColumns('machines_master', 'tbl-machines-master')" class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer" title="ปรับความกว้างคอลัมน์ให้พอดีกับเนื้อหาและหน้าจออัตโนมัติ">
            <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i> 📐 ปรับตารางพอดี
          </button>
          <button onclick="resetTableColumnWidths('machines_master')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer" title="คืนค่าความกว้างคอลัมน์ตารางเป็นค่าเริ่มต้น">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> คืนค่าขนาดคอลัมน์
          </button>
          <button onclick="downloadCsvTemplate('machines')" class="bg-emerald-50 hover:bg-emerald-100 text-[#1f760e] border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
            <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i> 📥 เทมเพลต CSV
          </button>
          <button onclick="openCsvImportModal('machines')" class="bg-[#1f760e] hover:bg-[#154c0c] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs">
            <i data-lucide="upload" class="w-3.5 h-3.5"></i> 📤 นำเข้า CSV
          </button>
          <button onclick="exportMachinesCSV()" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Export CSV
          </button>
          <button onclick="openMachineModal(null)" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i> + เพิ่มเครื่องจักรใหม่
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table id="tbl-machines-master" data-resizable-key="machines_master" class="w-full text-left border-collapse text-xs table-resizable">
          <thead>
            <tr class="bg-slate-100 text-slate-600 border-b border-slate-200">
              <th style="width: 130px;" class="py-3 px-3 font-bold">รหัสเครื่องจักร</th>
              <th style="width: 260px;" class="py-3 px-3 font-bold">ชื่อเครื่องจักร / รุ่น</th>
              <th style="width: 170px;" class="py-3 px-3 font-bold">ฝ่าย (Division)</th>
              <th style="width: 220px;" class="py-3 px-3 font-bold">แผนกที่ดูแล / พื้นที่ติดตั้ง</th>
              <th style="width: 70px;" class="py-3 px-3 font-bold">Class</th>
              <th style="width: 120px;" class="py-3 px-3 font-bold">การเดินเครื่อง</th>
              <th style="width: 120px;" class="py-3 px-3 font-bold">สุขภาพเครื่อง</th>
              <th style="width: 250px;" class="py-3 px-3 font-bold">แบบฟอร์มตรวจที่เชื่อมโยง (Linked Form)</th>
              <th style="width: 230px;" class="py-3 px-3 font-bold text-right">จัดการ (CRUD & QR)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${machines.map(m => {
              const divName = m.division_name || (state.data.departments.find(d => Number(d.id) === Number(m.department_id))?.plant_name) || 'ฝ่ายปฏิบัติการ';
              const linkedForm = typeof getMachineLinkedForm === 'function' ? getMachineLinkedForm(m, state) : null;
              return `
              <tr class="hover:bg-slate-50/90">
                <td class="py-3 px-3 font-mono font-bold text-slate-900">${m.machine_code}</td>
                <td class="py-3 px-3">
                  <div class="font-bold text-slate-800">${m.name}</div>
                  <div class="text-[11px] text-slate-400">${m.brand || '-'} ${m.model || ''} • ${Number(m.running_hours || 0).toLocaleString()} ชม.</div>
                </td>
                <td class="py-3 px-3">
                  <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px]">📂 ${divName}</span>
                </td>
                <td class="py-3 px-3">
                  <span class="font-semibold" style="color:${m.department_color || '#2563eb'}">[${m.department_code || '-'}] ${m.department_name || '-'}</span>
                  <div class="text-[11px] text-slate-500">📍 ${m.plant_area}</div>
                </td>
                <td class="py-3 px-3">
                  <span class="font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-800">${m.criticality}</span>
                </td>
                <td class="py-3 px-3">${getOperatingBadge(m.operating_state)}</td>
                <td class="py-3 px-3">${getHealthBadge(m.health_status)}</td>
                <td class="py-3 px-3">
                  ${linkedForm ? `<div class="space-y-1.5"><span class="inline-flex px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-mono font-bold">${linkedForm.code}</span><div class="flex gap-1"><button onclick="openLinkedFormForMachine(${m.id})" class="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold">📝 เปิดฟอร์ม</button><button onclick="openLinkedFormForMachine(${m.id}, 'print')" class="px-2 py-1 rounded-lg bg-slate-700 text-white font-bold">🖨 พิมพ์</button></div></div>` : '<span class="text-slate-400">ยังไม่พบฟอร์ม</span>'}
                </td>
                <td class="py-3 px-3 text-right">
                  <div class="inline-flex items-center gap-1">
                    <button onclick="openMachineDashboard(${m.id})" class="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold flex items-center gap-1" title="ดูแดชบอร์ดเฉพาะเครื่องนี้">
                      <i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-emerald-600"></i> แดชบอร์ด
                    </button>
                    <button onclick="openEmergencyQuickEntryModal(${m.id})" class="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold" title="ลงค่าฉุกเฉินเฉพาะจุด">⚡ ด่วน</button>
                    <button onclick="startInspectionForMachine(${m.id})" class="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold" title="ตรวจเช็คเครื่องนี้">ตรวจ</button>
                    <button onclick="openLinkedFormForMachine(${m.id})" class="px-2 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" title="เปิดแบบฟอร์มที่เชื่อมโยง">📝 ฟอร์ม</button>
                    <button onclick="openMachineQRModal(${m.id})" class="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold flex items-center gap-1" title="พิมพ์ป้าย QR">
                      <i data-lucide="qr-code" class="w-3.5 h-3.5"></i> QR
                    </button>
                    <button onclick="openMachineModal(${m.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700" title="แก้ไข">
                      <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="cloneMachine(${m.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700" title="คัดลอกเครื่องจักร">
                      <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="deleteMachine(${m.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600" title="ลบเครื่องจักร">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function openMachineModal(machineId) {
  if (machineId) ComisSync.captureRevision('/api/machines/' + machineId);
  const m = machineId ? state.data.machines.find(x => x.id === Number(machineId)) : null;
  const specs = m?.specs || {};
  const componentsStr = Array.isArray(specs.components) ? specs.components.join(', ') : 'มอเตอร์ขับหลัก, ชุดเกียร์ทด, ตลับลูกปืน DE/NDE';
  const defaultDept = m
    ? state.data.departments.find(d => Number(d.id) === Number(m.department_id))
    : (state.selectedDeptId !== 'ALL'
      ? state.data.departments.find(d => Number(d.id) === Number(state.selectedDeptId))
      : state.data.departments[0]);
  const currentDivision = m?.division_name || defaultDept?.plant_name || 'ฝ่ายปฏิบัติการ';
  const selectedLinkedForm = m?.specs?.linked_form_code || m?.linked_form_code || '';
  const builtinFormOptions = (window.ESC_BUILTIN_FORMS || []).map(form => `<option value="${form.code}" ${selectedLinkedForm === form.code ? 'selected' : ''}>[${form.code}] ${form.title}</option>`).join('');
  const templateFormOptions = (state.data.forms || []).map(form => {
    const value = form.form_code || form.code || form.id;
    return `<option value="${value}" ${String(selectedLinkedForm) === String(value) ? 'selected' : ''}>[${form.form_code || form.code || form.id}] ${form.title} (Template)</option>`;
  }).join('');

  const html = `
    <form onsubmit="saveMachine(event, ${m ? m.id : 'null'})" class="space-y-4 text-xs">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">รหัสเครื่องจักร (Machine Code) *</label>
          <input type="text" id="m-code" required value="${m?.machine_code || ''}" placeholder="เช่น ML-01" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold uppercase" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">ชื่อเครื่องจักร (Machine Name) *</label>
          <input type="text" id="m-name" required value="${m?.name || ''}" placeholder="เช่น ไฮดรอลิคยกดั๊มพ์ เบอร์ 1 (Hydraulic Truck Tipper No.1)" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">แผนกผู้รับผิดชอบหลัก (ฝ่าย &gt;&gt; แผนก) *</label>
          <select id="m-dept" onchange="const d = state.data.departments.find(x => Number(x.id) === Number(this.value)); const el = document.getElementById('m-division-badge'); if(el && d) el.textContent = '📂 ' + (d.plant_name || 'ฝ่ายปฏิบัติการ');" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            ${renderDepartmentSelectOptions(m?.department_id || defaultDept?.id)}
          </select>
          <div class="mt-1 text-[11px] text-slate-500">สังกัดฝ่าย: <strong id="m-division-badge" class="text-slate-700">📂 ${currentDivision}</strong></div>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">อาคาร / พื้นที่ติดตั้ง (Plant Area) *</label>
          <input type="text" id="m-area" required value="${m?.plant_area || 'อาคารลูกหีบ (Milling Plant)'}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">หมวดหมู่เครื่องจักร (Category)</label>
          <input type="text" id="m-category" value="${m?.category || 'Milling & Cane Prep'}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>

        <div class="md:col-span-3">
          <label class="block font-bold text-slate-700 mb-1">แบบฟอร์มตรวจที่เชื่อมโยง (Linked Inspection Form)</label>
          <select id="m-linked-form" class="w-full bg-indigo-50 border border-indigo-300 rounded-xl px-3 py-2 font-semibold">
            <option value="">เลือกอัตโนมัติตามรหัส/ชื่อ/หมวดหมู่เครื่องจักร</option>
            <optgroup label="แบบฟอร์มมาตรฐาน ESC 13 แบบ">${builtinFormOptions}</optgroup>
            <optgroup label="แบบฟอร์ม Template ที่สร้างเอง">${templateFormOptions}</optgroup>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">ยี่ห้อ (Brand)</label>
          <input type="text" id="m-brand" value="${m?.brand || ''}" placeholder="เช่น KSB, Siemens, ABB" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">รุ่น (Model)</label>
          <input type="text" id="m-model" value="${m?.model || ''}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชั่วโมงเดินเครื่องสะสม (Running Hrs)</label>
          <input type="number" id="m-hours" value="${m?.running_hours || 0}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">ระดับความสำคัญ (Criticality)</label>
          <select id="m-crit" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold">
            <option value="A" ${m?.criticality === 'A' ? 'selected' : ''}>Class A (Critical - หยุดแล้วกระทบสายผลิตหลัก)</option>
            <option value="B" ${!m || m?.criticality === 'B' ? 'selected' : ''}>Class B (Essential - มีเครื่องสำรอง)</option>
            <option value="C" ${m?.criticality === 'C' ? 'selected' : ''}>Class C (General - เครื่องจักรทั่วไป)</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สถานะการเดินเครื่อง</label>
          <select id="m-opstate" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="running" ${m?.operating_state === 'running' ? 'selected' : ''}>🟢 กำลังเดินเครื่อง (Running)</option>
            <option value="standby" ${m?.operating_state === 'standby' ? 'selected' : ''}>⚪ หยุดสำรอง (Standby)</option>
            <option value="pending_repair" ${m?.operating_state === 'pending_repair' ? 'selected' : ''}>⏳ รอซ่อม (Pending Repair)</option>
            <option value="under_repair" ${m?.operating_state === 'under_repair' || m?.operating_state === 'maintenance' ? 'selected' : ''}>🛠️ อยู่ระหว่างการซ่อม (Under Repair)</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สถานะสุขภาพเครื่องจักร</label>
          <select id="m-health" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="normal" ${m?.health_status === 'normal' ? 'selected' : ''}>🟢 ปกติ (Normal)</option>
            <option value="warning" ${m?.health_status === 'warning' ? 'selected' : ''}>🟡 เฝ้าระวัง (Warning)</option>
            <option value="abnormal" ${m?.health_status === 'abnormal' ? 'selected' : ''}>🔴 ผิดปกติ (Abnormal)</option>
          </select>
        </div>
      </div>

      <!-- Technical Specs Section -->
      <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
        <div class="font-bold text-slate-800">🔩 ข้อมูลทางเทคนิคและอะไหล่สำคัญ (Technical Specifications & Sub-Components)</div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label class="block text-slate-600 mb-1">พิกัดกำลัง / มอเตอร์</label>
            <input type="text" id="m-spec-kw" value="${specs.power_kw || '160 kW / 380V'}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5" />
          </div>
          <div>
            <label class="block text-slate-600 mb-1">เบอร์ลูกปืน (Bearing DE/NDE)</label>
            <input type="text" id="m-spec-brg" value="${specs.bearing_de || 'SKF 6316 C3'}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5" />
          </div>
          <div>
            <label class="block text-slate-600 mb-1">ชนิดน้ำมันหล่อลื่น / จาระบี</label>
            <input type="text" id="m-spec-lube" value="${specs.lube_oil || 'ISO VG 68'}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5" />
          </div>
          <div class="md:col-span-3">
            <label class="block text-slate-600 mb-1">ชุดประกอบย่อย (คั่นด้วยเครื่องหมายจุลภาค ,)</label>
            <input type="text" id="m-spec-comp" value="${componentsStr}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5" />
          </div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">ยกเลิก</button>
        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">💾 บันทึกข้อมูลเครื่องจักร</button>
      </div>
    </form>
  `;
  openModal(m ? `⚙️ แก้ไขข้อมูลเครื่องจักร: ${m.machine_code}` : '➕ เพิ่มเครื่องจักรใหม่เข้าสู่ระบบ Center', html);
}

async function saveMachine(e, id) {
  e.preventDefault();
  const comps = document.getElementById('m-spec-comp').value.split(',').map(s => s.trim()).filter(Boolean);
  const existingSpecs = id ? (state.data.machines.find(machine => Number(machine.id) === Number(id))?.specs || {}) : {};
  const payload = {
    machine_code: document.getElementById('m-code').value,
    name: document.getElementById('m-name').value,
    department_id: Number(document.getElementById('m-dept').value),
    plant_area: document.getElementById('m-area').value,
    category: document.getElementById('m-category').value,
    brand: document.getElementById('m-brand').value,
    model: document.getElementById('m-model').value,
    running_hours: Number(document.getElementById('m-hours').value),
    criticality: document.getElementById('m-crit').value,
    operating_state: document.getElementById('m-opstate').value,
    health_status: document.getElementById('m-health').value,
    specs: {
      ...existingSpecs,
      power_kw: document.getElementById('m-spec-kw').value,
      bearing_de: document.getElementById('m-spec-brg').value,
      lube_oil: document.getElementById('m-spec-lube').value,
      components: comps,
      linked_form_code: document.getElementById('m-linked-form')?.value || ''
    },
    actor: state.activeUser?.full_name || 'Admin'
  };

  try {
    const res = id
      ? await apiRequest(`/api/machines/${id}`, 'PUT', payload)
      : await apiRequest('/api/machines', 'POST', payload);
    closeModal();
    updateStateData(res.data);
    showToast('บันทึกข้อมูลเครื่องจักรเรียบร้อยแล้ว', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function cloneMachine(id) {
  try {
    const res = await apiRequest(`/api/machines/${id}/clone`, 'POST');
    updateStateData(res.data);
    showToast('คัดลอกข้อมูลเครื่องจักรเรียบร้อยแล้ว', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteMachine(id) {
  if (!confirm('ยืนยันการลบเครื่องจักรนี้?')) return;
  try {
    const res = await apiRequest(`/api/machines/${id}`, 'DELETE');
    updateStateData(res.data);
    showToast('ลบเครื่องจักรเรียบร้อยแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openMachineQRModal(machineId) {
  const m = state.data.machines.find(x => x.id === Number(machineId));
  if (!m) return;
  const divName = m.division_name || (state.data.departments.find(d => Number(d.id) === Number(m.department_id))?.plant_name) || 'ฝ่ายปฏิบัติการ';

  const qrUrl = 'ESC:MACHINE:' + m.machine_code;
  const html = `
    <div class="max-w-md mx-auto border-4 border-[#1f760e] rounded-2xl p-6 text-center space-y-4 bg-white">
      <div class="flex items-center justify-center gap-2 pb-1">
        <img src="${ComisDomain.isStandalone() ? 'public/' : ''}assets/brand/logo.png" onerror="this.style.display='none'" alt="ESC Logo" class="h-10 w-auto object-contain" />
      </div>
      <div class="bg-[#1f760e] text-white py-2.5 px-4 rounded-xl">
        <div class="text-[10px] uppercase tracking-widest text-[#8ce617] font-bold">EASTERN SUGAR & CANE — MACHINE TAG</div>
        <div class="text-lg font-mono font-extrabold">${esc(m.machine_code)}</div>
      </div>
      <div class="font-bold text-slate-900 text-base leading-snug">${esc(m.name)}</div>
      <div id="qrcode-box" class="flex justify-center py-3"></div>
      <div class="text-xs text-slate-600 bg-[#f0f9eb] p-3 rounded-xl border border-[#b7e1a1] space-y-1 text-left">
        <div><strong>📂 ฝ่ายต้นสังกัด:</strong> ${esc(divName)}</div>
        <div><strong>🏢 แผนกดูแล:</strong> [${esc(m.department_code || '-')}] ${esc(m.department_name || '-')}</div>
        <div><strong>📍 สถานที่ติดตั้ง:</strong> ${esc(m.plant_area)}</div>
        <div><strong>⚡ ความสำคัญ:</strong> Class ${esc(m.criticality)} (${esc(m.brand || '-')} ${esc(m.model || '')})</div>
      </div>
      <div class="text-[11px] text-slate-500 font-medium">📱 สแกน QR Code นี้ด้วยมือถือเพื่อเปิดฟอร์มตรวจเช็คเครื่องจักรออนไลน์</div>
    </div>
  `;

  openPrintModal(`ป้ายสติ๊กเกอร์ QR Code ประจำเครื่องจักร: ${m.machine_code}`, html);
  setTimeout(() => {
    const box = document.getElementById('qrcode-box');
    if (box && window.QRCode) {
      box.innerHTML = '';
      new QRCode(box, {
        text: qrUrl,
        width: 180,
        height: 180,
        colorDark: '#0f172a',
        colorLight: '#ffffff'
      });
    }
  }, 60);
}

// ============================================================================
// 6. DYNAMIC FORM BUILDER VIEW (CREATE / EDIT / CLONE / DELETE FORMS)
// ============================================================================
function renderForms(container) {
  if (state.builderMode && state.builderForm) {
    renderFormBuilderEditor(container);
    return;
  }

  const forms = getScopedFormsForActiveUser();

  container.innerHTML = `
    <div class="space-y-4">
      ${renderUserScopeFilterBar('แบบฟอร์มในการตรวจเช็คที่เกี่ยวข้องกับยูเซอร์ของคุณ')}
      <a href="${ComisDomain.isStandalone() ? 'public/' : ''}source-forms.html" class="block bg-emerald-50 border border-emerald-300 p-4 rounded-xl text-emerald-900 font-bold">📚 ฟอร์มจากเอกสารจริงแผนกลูกหีบ — เปิดต้นฉบับ 59 ไฟล์ / กรอกแบบบันทึก 39 แบบ →</a>
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <i data-lucide="file-plus-2" class="w-5 h-5 text-blue-600"></i>
            คลังแบบฟอร์มตรวจเช็ค & ระบบสร้างฟอร์มเอง (Custom Dynamic Form Builder)
          </h2>
          <p class="text-xs text-slate-500">แสดงเฉพาะแบบฟอร์มที่เกี่ยวข้องกับยูเซอร์ของคุณ (${forms.length} ฟอร์ม) หรือกดสลับด้านบนเพื่อดูทุกแผนก</p>
        </div>
        <button onclick="startFormBuilder(null)" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs cursor-pointer">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> + สร้างแบบฟอร์มตรวจเช็คใหม่เอง
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${forms.map(f => {
          const totalFields = (f.sections || []).reduce((acc, s) => acc + (s.fields ? s.fields.length : 0), 0);
          return `
            <div class="rounded-2xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-md transition bg-white">
              <div class="space-y-2.5">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-slate-900 text-white">${f.form_code}</span>
                  <div class="flex items-center gap-1.5">
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">Version ${f.version}</span>
                    <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100" style="color:${f.department_color || '#2563eb'}">[${f.department_code || 'ALL'}] ${f.department_name || 'ทุกแผนก'}</span>
                  </div>
                </div>
                <h3 class="font-bold text-slate-800 text-sm">${f.title}</h3>
                <p class="text-xs text-slate-500">${f.description || '-'}</p>
                <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs flex flex-wrap items-center justify-between gap-2">
                  <span>📂 หมวดหมู่: <strong>${(f.sections || []).length} หมวด</strong></span>
                  <span>📝 ข้อคำถามรวม: <strong>${totalFields} ข้อ</strong></span>
                  <span>🔄 ความถี่: <strong class="uppercase text-blue-700">${f.frequency}</strong></span>
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <button onclick="startFormBuilder(${f.id})" class="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold flex items-center gap-1">
                    <i data-lucide="sliders" class="w-3.5 h-3.5"></i> แก้ไขโครงสร้างฟอร์ม
                  </button>
                  <button onclick="cloneFormTemplate(${f.id})" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1">
                    <i data-lucide="copy" class="w-3.5 h-3.5"></i> คัดลอก
                  </button>
                  <button onclick="deleteFormTemplate(${f.id})" class="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600">
                    <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                  </button>
                </div>
                <button onclick="state.inspectSession.form_id = ${f.id}; switchTab('inspect');" class="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold">
                  ทดลองกรอกฟอร์ม →
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
      </div>
    </div>
  `;
}

function startFormBuilder(formId) {
  if (formId) ComisSync.captureRevision('/api/forms/' + formId);
  if (formId) {
    const existing = state.data.forms.find(f => f.id === Number(formId));
    state.builderForm = JSON.parse(JSON.stringify(existing));
  } else {
    state.builderForm = {
      id: null,
      form_code: `FRM-CUSTOM-${Math.floor(100 + Math.random() * 900)}`,
      title: 'แบบฟอร์มตรวจเช็คเครื่องจักร (สร้างใหม่)',
      description: 'ระบุคำอธิบายวัตถุประสงค์ของแบบฟอร์มนี้',
      department_id: state.data.departments[0]?.id || 1,
      frequency: 'daily',
      estimated_minutes: 15,
      sections: [
        {
          id: 'sec_' + Date.now(),
          title: 'หมวดที่ 1: ตรวจสอบสภาพทั่วไปและจุดหมุน',
          fields: [
            {
              id: 'fld_' + Date.now() + '_1',
              label: 'สภาพความสะอาดและรอยรั่วซึมรอบตัวเครื่อง',
              field_type: 'pass_fail',
              tpm_tag: 'C',
              tool_method: 'สายตา (Visual Check)',
              standard_opl: 'ไม่มีคราบน้ำมันรั่วซึมและไม่มีสิ่งสกปรกสะสม',
              running_only: false,
              required: true
            },
            {
              id: 'fld_' + Date.now() + '_2',
              label: 'อุณหภูมิลูกปืนหลักขณะทำงาน (Bearing Temperature)',
              field_type: 'number_range',
              tpm_tag: 'I',
              tool_method: 'ปืนวัดอุณหภูมิอินฟราเรด (IR Gun)',
              standard_opl: 'ปกติไม่เกิน 70 °C | ห้ามเกิน 80 °C',
              unit: '°C',
              min_normal: 25,
              max_normal: 70,
              max_warning: 80,
              running_only: true,
              required: true
            }
          ]
        }
      ]
    };
  }
  state.builderMode = true;
  renderCurrentTab();
}

function renderFormBuilderEditor(container) {
  const bf = state.builderForm;

  container.innerHTML = `
    <div class="max-w-5xl mx-auto space-y-6">
      <!-- Top Action Bar -->
      <div class="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div class="flex items-center gap-3">
          <button onclick="state.builderMode = false; renderCurrentTab();" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1">
            ← กลับหน้ารายการฟอร์ม
          </button>
          <div>
            <h2 class="font-bold text-base">🛠️ เครื่องมือออกแบบฟอร์มตรวจเช็ค (Dynamic Form Builder)</h2>
            <p class="text-xs text-slate-400">เพิ่มหมวดหมู่ เพิ่มข้อคำถาม ตั้งค่าเกณฑ์ตัวเลข Min/Max และป้ายกำกับงาน TPM ได้ตามต้องการ</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="saveFormBuilder()" class="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-md">
            <i data-lucide="save" class="w-4 h-4"></i> บันทึกแบบฟอร์มเข้าสู่ระบบ Center
          </button>
        </div>
      </div>

      <!-- Form Metadata Card -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="block font-bold text-slate-700 mb-1">รหัสแบบฟอร์ม (Form Code) *</label>
          <input type="text" value="${bf.form_code}" oninput="state.builderForm.form_code = this.value" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold uppercase" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">ชื่อแบบฟอร์มการตรวจเช็ค *</label>
          <input type="text" value="${bf.title}" oninput="state.builderForm.title = this.value" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold text-slate-800" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">แผนกผู้รับผิดชอบตรวจ (ฝ่าย &gt;&gt; แผนก) *</label>
          <select onchange="state.builderForm.department_id = Number(this.value)" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            ${renderDepartmentSelectOptions(bf.department_id)}
          </select>
        </div>
        <div class="md:col-span-3">
          <label class="block font-bold text-slate-700 mb-1">คำอธิบายรายละเอียดฟอร์ม</label>
          <input type="text" value="${bf.description || ''}" oninput="state.builderForm.description = this.value" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">รอบความถี่การตรวจ</label>
          <select onchange="state.builderForm.frequency = this.value" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            <option value="per_shift" ${bf.frequency === 'per_shift' ? 'selected' : ''}>ทุกกะ (Per Shift)</option>
            <option value="daily" ${bf.frequency === 'daily' ? 'selected' : ''}>รายวัน (Daily)</option>
            <option value="weekly" ${bf.frequency === 'weekly' ? 'selected' : ''}>รายสัปดาห์ (Weekly)</option>
            <option value="monthly" ${bf.frequency === 'monthly' ? 'selected' : ''}>รายเดือน (Monthly)</option>
          </select>
        </div>
      </div>

      <!-- Dynamic Sections List -->
      <div class="space-y-5">
        ${(bf.sections || []).map((sec, sIdx) => `
          <div class="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
            <div class="bg-slate-100 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2 flex-1">
                <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold">หมวดที่ ${sIdx + 1}</span>
                <input type="text" value="${sec.title}" oninput="state.builderForm.sections[${sIdx}].title = this.value" class="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 flex-1 max-w-xl" />
              </div>
              <div class="flex items-center gap-2">
                <button onclick="addBuilderField(${sIdx})" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1">
                  + เพิ่มข้อคำถามในหมวดนี้
                </button>
                <button onclick="removeBuilderSection(${sIdx})" class="bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg">
                  ลบหมวดหมู่
                </button>
              </div>
            </div>

            <div class="p-5 space-y-4">
              ${(sec.fields || []).map((fld, fIdx) => `
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="font-bold text-blue-700">ข้อที่ ${sIdx + 1}.${fIdx + 1}</span>
                    <button onclick="removeBuilderField(${sIdx}, ${fIdx})" class="text-rose-600 hover:underline font-semibold">🗑️ ลบข้อคำถามนี้</button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div class="md:col-span-2">
                      <label class="block text-slate-600 font-semibold mb-1">หัวข้อคำถาม / จุดตรวจสอบ *</label>
                      <input type="text" value="${fld.label}" oninput="state.builderForm.sections[${sIdx}].fields[${fIdx}].label = this.value" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800" />
                    </div>

                    <div>
                      <label class="block text-slate-600 font-semibold mb-1">ประเภทช่องคำตอบ (Field Type)</label>
                      <select onchange="onChangeBuilderFieldType(${sIdx}, ${fIdx}, this.value)" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-bold text-blue-800">
                        <option value="pass_fail" ${fld.field_type === 'pass_fail' ? 'selected' : ''}>✅ ปกติ / ผิดปกติ (Pass/Fail)</option>
                        <option value="three_state" ${fld.field_type === 'three_state' ? 'selected' : ''}>🚦 3 ระดับ (ปกติ/เฝ้าระวัง/ผิดปกติ)</option>
                        <option value="number_range" ${fld.field_type === 'number_range' ? 'selected' : ''}>🔢 ตัวเลข + เกณฑ์ Min/Warn/Max</option>
                        <option value="checkbox" ${fld.field_type === 'checkbox' ? 'selected' : ''}>☑️ เลือกได้หลายข้อ (Checkbox)</option>
                        <option value="text" ${fld.field_type === 'text' ? 'selected' : ''}>📝 ข้อความบันทึก (Text)</option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-slate-600 font-semibold mb-1">หมวดงาน TPM (CLIT)</label>
                      <select onchange="state.builderForm.sections[${sIdx}].fields[${fIdx}].tpm_tag = this.value" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-2 font-semibold">
                        <option value="C" ${fld.tpm_tag === 'C' ? 'selected' : ''}>🧹 C: ทำความสะอาด (Clean)</option>
                        <option value="L" ${fld.tpm_tag === 'L' ? 'selected' : ''}>🛢️ L: หล่อลื่น (Lubricate)</option>
                        <option value="I" ${!fld.tpm_tag || fld.tpm_tag === 'I' ? 'selected' : ''}>🔍 I: ตรวจเช็ค/วัดค่า (Inspect)</option>
                        <option value="T" ${fld.tpm_tag === 'T' ? 'selected' : ''}>🔧 T: ขันแน่น (Tighten)</option>
                      </select>
                    </div>
                  </div>

                  <!-- Extra settings for number_range -->
                  ${fld.field_type === 'number_range' ? `
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 bg-blue-50/70 p-3 rounded-xl border border-blue-200">
                      <div>
                        <label class="block text-blue-900 font-bold mb-1">หน่วยนับ (Unit)</label>
                        <input type="text" value="${fld.unit || '°C'}" oninput="state.builderForm.sections[${sIdx}].fields[${fIdx}].unit = this.value" placeholder="°C, mm/s, Bar, A" class="w-full bg-white border border-blue-300 rounded-lg px-2.5 py-1.5 font-bold" />
                      </div>
                      <div>
                        <label class="block text-emerald-800 font-bold mb-1">🟢 ค่าต่ำสุดปกติ (Min)</label>
                        <input type="number" step="0.1" value="${fld.min_normal ?? 0}" oninput="state.builderForm.sections[${sIdx}].fields[${fIdx}].min_normal = parseFloat(this.value)" class="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-bold" />
                      </div>
                      <div>
                        <label class="block text-emerald-800 font-bold mb-1">🟢 ค่าสูงสุดปกติ (Max Normal)</label>
                        <input type="number" step="0.1" value="${fld.max_normal ?? 70}" oninput="state.builderForm.sections[${sIdx}].fields[${fIdx}].max_normal = parseFloat(this.value)" class="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 font-bold" />
                      </div>
                      <div>
                        <label class="block text-rose-800 font-bold mb-1">🔴 เกินค่านี้ = ผิดปกติ (Max Warn)</label>
                        <input type="number" step="0.1" value="${fld.max_warning ?? 80}" oninput="state.builderForm.sections[${sIdx}].fields[${fIdx}].max_warning = parseFloat(this.value)" class="w-full bg-white border border-rose-300 rounded-lg px-2.5 py-1.5 font-bold" />
                      </div>
                    </div>
                  ` : ''}

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label class="block text-slate-500 mb-1">🛠️ เครื่องมือ/วิธีการตรวจ</label>
                      <input type="text" value="${fld.tool_method || 'สายตา (Visual)'}" oninput="state.builderForm.sections[${sIdx}].fields[${fIdx}].tool_method = this.value" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5" />
                    </div>
                    <div>
                      <label class="block text-slate-500 mb-1">📖 เกณฑ์มาตรฐานหน้างาน (Standard OPL)</label>
                      <input type="text" value="${fld.standard_opl || ''}" oninput="state.builderForm.sections[${sIdx}].fields[${fIdx}].standard_opl = this.value" placeholder="ระบุเกณฑ์ให้ช่างดูหน้างาน..." class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5" />
                    </div>
                    <div class="flex items-center gap-4 pt-5">
                      <label class="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input type="checkbox" ${fld.running_only ? 'checked' : ''} onchange="state.builderForm.sections[${sIdx}].fields[${fIdx}].running_only = this.checked" class="rounded text-blue-600" />
                        <span>วัดเฉพาะตอนเครื่องเดิน</span>
                      </label>
                      <label class="inline-flex items-center gap-1.5 cursor-pointer font-medium text-slate-700">
                        <input type="checkbox" ${fld.required !== false ? 'checked' : ''} onchange="state.builderForm.sections[${sIdx}].fields[${fIdx}].required = this.checked" class="rounded text-blue-600" />
                        <span>บังคับตอบ (*)</span>
                      </label>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <button onclick="addBuilderSection()" class="w-full py-3.5 rounded-2xl border-2 border-dashed border-blue-400 text-blue-700 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-2 transition">
          + เพิ่มหมวดหมู่การตรวจเช็คใหม่ (Add Section)
        </button>
      </div>
    </div>
  `;
}

function addBuilderSection() {
  state.builderForm.sections.push({
    id: 'sec_' + Date.now(),
    title: `หมวดที่ ${state.builderForm.sections.length + 1}: หมวดการตรวจสอบใหม่`,
    fields: [
      {
        id: 'fld_' + Date.now(),
        label: 'หัวข้อการตรวจเช็คใหม่',
        field_type: 'pass_fail',
        tpm_tag: 'I',
        tool_method: 'สายตา (Visual Check)',
        standard_opl: 'อยู่ในสภาพปกติพร้อมใช้งาน',
        running_only: false,
        required: true
      }
    ]
  });
  renderCurrentTab();
}

function removeBuilderSection(sIdx) {
  if (state.builderForm.sections.length <= 1) {
    showToast('ต้องมีอย่างน้อย 1 หมวดหมู่ในแบบฟอร์ม', 'warning');
    return;
  }
  state.builderForm.sections.splice(sIdx, 1);
  renderCurrentTab();
}

function addBuilderField(sIdx) {
  state.builderForm.sections[sIdx].fields.push({
    id: 'fld_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    label: 'หัวข้อคำถามตรวจเช็คใหม่',
    field_type: 'pass_fail',
    tpm_tag: 'I',
    tool_method: 'สายตา (Visual Check)',
    standard_opl: '',
    unit: '°C',
    min_normal: 0,
    max_normal: 70,
    max_warning: 80,
    running_only: false,
    required: true
  });
  renderCurrentTab();
}

function removeBuilderField(sIdx, fIdx) {
  state.builderForm.sections[sIdx].fields.splice(fIdx, 1);
  renderCurrentTab();
}

function onChangeBuilderFieldType(sIdx, fIdx, newType) {
  const fld = state.builderForm.sections[sIdx].fields[fIdx];
  fld.field_type = newType;
  if (newType === 'number_range' && fld.max_normal === undefined) {
    fld.unit = '°C';
    fld.min_normal = 20;
    fld.max_normal = 70;
    fld.max_warning = 80;
  }
  renderCurrentTab();
}

async function saveFormBuilder() {
  const bf = state.builderForm;
  if (!bf.form_code || !bf.title) {
    showToast('กรุณาระบุรหัสแบบฟอร์มและชื่อแบบฟอร์ม', 'warning');
    return;
  }
  try {
    const payload = {
      ...bf,
      actor: state.activeUser?.full_name || 'Admin'
    };
    const res = bf.id
      ? await apiRequest(`/api/forms/${bf.id}`, 'PUT', payload)
      : await apiRequest('/api/forms', 'POST', payload);
    state.builderMode = false;
    updateStateData(res.data);
    showToast('บันทึกโครงสร้างแบบฟอร์มสำเร็จ!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function cloneFormTemplate(id) {
  try {
    const res = await apiRequest(`/api/forms/${id}/clone`, 'POST');
    updateStateData(res.data);
    showToast('คัดลอกแบบฟอร์มเรียบร้อยแล้ว', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteFormTemplate(id) {
  if (!confirm('ยืนยันการลบแบบฟอร์มนี้?')) return;
  try {
    const res = await apiRequest(`/api/forms/${id}`, 'DELETE');
    updateStateData(res.data);
    showToast('ลบแบบฟอร์มเรียบร้อยแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// 7. MULTI-DEPARTMENT MANAGEMENT VIEW (CRUD)
// ============================================================================
function renderDepartments(container) {
  const depts = state.data.departments || [];
  const divisionGroups = groupDepartmentsByDivision(depts);

  container.innerHTML = `
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <i data-lucide="building-2" class="w-5 h-5 text-blue-600"></i>
            จัดการแผนกแยกตามกลุ่มฝ่าย (${divisionGroups.length} กลุ่มฝ่าย &gt;&gt; ${depts.length} แผนกปฏิบัติการ)
          </h2>
          <p class="text-xs text-slate-500">แยกเฉพาะรายชื่อ <strong>แผนก</strong> (EP, VP, CF, WP, ML, MA, EBL, EM, ME, EPP) และจัดหมวดหมู่เป็น <strong>กลุ่มฝ่าย &gt;&gt; แผนก</strong></p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="downloadCsvTemplate('departments')" class="bg-emerald-50 hover:bg-emerald-100 text-[#1f760e] border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> 📥 เทมเพลต CSV
          </button>
          <button onclick="openCsvImportModal('departments')" class="bg-[#1f760e] hover:bg-[#154c0c] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
            <i data-lucide="upload" class="w-3.5 h-3.5"></i> 📤 นำเข้า CSV
          </button>
          <button onclick="openDepartmentModal(null)" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i> + เพิ่มแผนกใหม่
          </button>
        </div>
      </div>

      <!-- Division Groups Summary Pills -->
      <div class="flex flex-wrap items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
        <span class="font-extrabold text-slate-700 mr-1">📂 กลุ่มฝ่ายทั้งหมด:</span>
        ${divisionGroups.map(grp => `
          <button type="button" onclick="state.globalDeptId = 'GROUP:${grp.division.replace(/'/g, "\\'")}'; syncHeaderAndSidebar(); switchTab('dashboard');"
            class="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 text-slate-800 font-bold flex items-center gap-1.5 shadow-2xs transition cursor-pointer">
            <span>${grp.division}</span>
            <span class="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">&gt;&gt; ${grp.departments.length} แผนก</span>
          </button>
        `).join('')}
      </div>

      <!-- Grouped Sections: ฝ่าย >> แผนก -->
      <div class="space-y-6">
        ${divisionGroups.map((grp, gIdx) => {
          const totalMachines = grp.departments.reduce((sum, d) => sum + (Number(d.machine_count) || 0), 0);
          const totalForms = grp.departments.reduce((sum, d) => sum + (Number(d.form_count) || 0), 0);
          const totalUsers = grp.departments.reduce((sum, d) => sum + (Number(d.user_count) || 0), 0);
          const deptCodesList = grp.departments.map(d => d.code).join(', ');
          return `
            <div class="rounded-2xl border-2 border-slate-200 overflow-hidden bg-slate-50/50">
              <!-- Division Group Header -->
              <div class="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
                <div class="flex flex-wrap items-center gap-2.5">
                  <span class="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-xs">กลุ่มที่ ${gIdx + 1}</span>
                  <h3 class="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
                    <span>📂 ${grp.division}</span>
                    <span class="text-amber-300 font-mono">&gt;&gt;</span>
                    <span class="text-emerald-300 text-xs sm:text-sm font-bold">${grp.departments.length} แผนก (${deptCodesList})</span>
                  </h3>
                </div>
                <div class="flex flex-wrap items-center gap-3 text-xs">
                  <span class="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">⚙️ เครื่องจักรรวม: <strong class="text-white">${totalMachines}</strong></span>
                  <span class="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">📝 แบบฟอร์มรวม: <strong class="text-amber-300">${totalForms}</strong></span>
                  <span class="px-2.5 py-1 rounded-lg bg-white/10 text-slate-200">👥 บุคลากรรวม: <strong class="text-emerald-300">${totalUsers}</strong></span>
                  <button type="button" onclick="state.globalDeptId = 'GROUP:${grp.division.replace(/'/g, "\\'")}'; syncHeaderAndSidebar(); switchTab('dashboard');"
                    class="px-3 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold cursor-pointer transition">
                    ดูทั้งกลุ่มฝ่ายนี้ →
                  </button>
                </div>
              </div>

              <!-- Departments Grid inside this Division -->
              <div class="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${grp.departments.map(d => `
                  <div class="rounded-2xl border border-slate-200 p-5 flex flex-col justify-between bg-white hover:shadow-md transition">
                    <div class="space-y-2.5">
                      <div class="flex items-center justify-between gap-2">
                        <span class="px-3 py-1 rounded-lg text-white font-mono font-bold text-xs" style="background:${d.color || '#2563eb'}">${d.code}</span>
                        <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">${grp.division} &gt;&gt; ${d.code}</span>
                      </div>
                      <div>
                        <div class="text-[11px] font-semibold text-slate-400">${grp.division} &gt;&gt;</div>
                        <h4 class="font-bold text-slate-800 text-base">${d.name}</h4>
                      </div>
                      <p class="text-xs text-slate-500">${d.description || '-'}</p>
                      <div class="text-xs text-slate-600 pt-1">👤 หัวหน้าแผนก: <strong>${d.manager_name || '-'}</strong></div>
                      <div class="grid grid-cols-3 gap-2 pt-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div><div class="font-extrabold text-slate-800 text-sm">${d.machine_count}</div><div class="text-[10px] text-slate-400">เครื่องจักร</div></div>
                        <div><div class="font-extrabold text-blue-600 text-sm">${d.form_count}</div><div class="text-[10px] text-slate-400">แบบฟอร์ม</div></div>
                        <div><div class="font-extrabold text-emerald-600 text-sm">${d.user_count}</div><div class="text-[10px] text-slate-400">บุคลากร</div></div>
                      </div>
                    </div>

                    <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button onclick="state.globalDeptId = '${d.id}'; syncHeaderAndSidebar(); switchTab('dashboard');" class="text-xs font-semibold text-blue-600 hover:underline cursor-pointer">
                        ดูเฉพาะแผนก [${d.code}] →
                      </button>
                      <div class="flex items-center gap-1.5">
                        <button onclick="openDepartmentModal(${d.id})" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer">แก้ไข</button>
                        <button onclick="deleteDepartment(${d.id})" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 text-xs font-semibold cursor-pointer">ลบ</button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function openDepartmentModal(deptId) {
  if (deptId) ComisSync.captureRevision('/api/departments/' + deptId);
  const d = deptId ? state.data.departments.find(x => x.id === Number(deptId)) : null;
  const standardDivisions = [
    'ฝ่ายผลิต (PD)',
    'ฝ่ายวิศวกรรมจักรกล (EN)',
    'ฝ่ายวิศวกรรมไฟฟ้า (EE)',
    'ฝ่ายระบบมาตรฐานและคุณภาพ',
    'ฝ่ายจัดการสิ่งแวดล้อมและความปลอดภัย',
    'ฝ่ายคลังสินค้า'
  ];
  const html = `
    <form onsubmit="saveDepartment(event, ${d ? d.id : 'null'})" class="space-y-4 text-xs">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">รหัสย่อแผนก (Dept Code) *</label>
          <input type="text" id="dept-code" required value="${d?.code || ''}" placeholder="เช่น EP, VP, CF, WP, ML, MA, EBL, EM, ME, EPP" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold uppercase" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สีประจำแผนก (Color Tag)</label>
          <input type="color" id="dept-color" value="${d?.color || '#2563eb'}" class="w-full h-9 bg-slate-50 border border-slate-300 rounded-xl px-2 py-1" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">ชื่อแผนก (Department Name) *</label>
          <input type="text" id="dept-name" required value="${d?.name || ''}" placeholder="เช่น แผนกลูกหีบ, แผนกเครื่องกลซ่อมบำรุง" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">กลุ่มฝ่ายต้นสังกัด (กลุ่มฝ่าย &gt;&gt; แผนก) *</label>
          <input type="text" id="dept-plant" list="division-group-list" required value="${d?.plant_name || 'ฝ่ายวิศวกรรมจักรกล (EN)'}" placeholder="เลือกหรือพิมพ์ชื่อกลุ่มฝ่าย..." class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold" />
          <datalist id="division-group-list">
            ${standardDivisions.map(div => `<option value="${div}"></option>`).join('')}
          </datalist>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่อหัวหน้าแผนก (Manager)</label>
          <input type="text" id="dept-manager" value="${d?.manager_name || ''}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">รายละเอียดหน้าที่รับผิดชอบ</label>
          <textarea id="dept-desc" rows="2" class="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5">${d?.description || ''}</textarea>
        </div>
      </div>
      <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">ยกเลิก</button>
        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">💾 บันทึกข้อมูลแผนก</button>
      </div>
    </form>
  `;
  openModal(d ? `🏢 แก้ไขข้อมูลแผนก: ${d.plant_name || ''} >> [${d.code}] ${d.name}` : '➕ เพิ่มแผนกใหม่ (กำหนดกลุ่มฝ่าย >> แผนก)', html);
}

async function saveDepartment(e, id) {
  e.preventDefault();
  const payload = {
    code: document.getElementById('dept-code').value,
    name: document.getElementById('dept-name').value,
    color: document.getElementById('dept-color').value,
    plant_name: document.getElementById('dept-plant').value,
    manager_name: document.getElementById('dept-manager').value,
    description: document.getElementById('dept-desc').value,
    actor: state.activeUser?.full_name || 'Admin'
  };
  try {
    const res = id
      ? await apiRequest(`/api/departments/${id}`, 'PUT', payload)
      : await apiRequest('/api/departments', 'POST', payload);
    closeModal();
    updateStateData(res.data);
    showToast('บันทึกข้อมูลแผนกสำเร็จ', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteDepartment(id) {
  if (!confirm('ยืนยันการลบแผนกนี้?')) return;
  try {
    const res = await apiRequest(`/api/departments/${id}`, 'DELETE');
    updateStateData(res.data);
    showToast('ลบแผนกเรียบร้อยแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// 8. USERS CRUD, FREE TELEGRAM BOT SETTINGS & AUDIT LOGS
// ============================================================================
function escapeUserAssignmentHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function selectUserAssignedForms(button, group) {
  button.closest('form').querySelectorAll('input[name="assigned_forms"]').forEach(input => {
    input.checked = group === 'all' || (group !== 'none' && input.value.startsWith(`FM-${group}`));
  });
}

function renderUsersAndSettings(container) {
  const users = state.data.users;
  const s = state.data.settings || {};

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Users Management (Full width for clear, spacious table view) -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="font-bold text-slate-800 text-base">👥 จัดการผู้ใช้งานและสิทธิ์ (Users & RBAC CRUD)</h2>
            <p class="text-xs text-slate-500">เพิ่ม/แก้ไข/ลบ พนักงาน และกำหนดสิทธิ์ตามแผนก หรือนำเข้ารายชื่อผ่าน CSV</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="autoFitTableColumns('users_list', 'tbl-users-list')" class="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer" title="ปรับความกว้างคอลัมน์ให้พอดีกับเนื้อหาและหน้าจออัตโนมัติ">
              <i data-lucide="maximize-2" class="w-3.5 h-3.5"></i> 📐 ปรับตารางพอดี
            </button>
            <button onclick="resetTableColumnWidths('users_list')" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer" title="คืนค่าความกว้างคอลัมน์ตารางเป็นค่าเริ่มต้น">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> คืนค่าขนาด
            </button>
            <button onclick="downloadCsvTemplate('users')" class="bg-emerald-50 hover:bg-emerald-100 text-[#1f760e] border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
              <i data-lucide="file-spreadsheet" class="w-3.5 h-3.5"></i> 📥 เทมเพลต CSV
            </button>
            <button onclick="openCsvImportModal('users')" class="bg-[#1f760e] hover:bg-[#154c0c] text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-2xs">
              <i data-lucide="upload" class="w-3.5 h-3.5"></i> 📤 นำเข้า CSV
            </button>
            <button onclick="openUserModal(null)" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer shadow-xs">
              <i data-lucide="plus" class="w-4 h-4"></i> + เพิ่มผู้ใช้งาน
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table id="tbl-users-list" data-resizable-key="users_list" class="w-full text-left border-collapse text-xs table-resizable">
            <thead>
              <tr class="bg-slate-100 text-slate-600 border-b border-slate-200">
                <th style="width: 130px;" class="py-2.5 px-3 font-bold">รหัสพนักงาน</th>
                <th style="width: 250px;" class="py-2.5 px-3 font-bold">ชื่อ-นามสกุล / ตำแหน่ง</th>
                <th style="width: 180px;" class="py-2.5 px-3 font-bold">ฝ่าย (Division)</th>
                <th style="width: 220px;" class="py-2.5 px-3 font-bold">แผนก</th>
                <th style="width: 260px;" class="py-2.5 px-3 font-bold">กลุ่มงาน & แบบฟอร์มที่ได้รับมอบหมาย</th>
                <th style="width: 150px;" class="py-2.5 px-3 font-bold">ระดับสิทธิ์ (Role)</th>
                <th style="width: 140px;" class="py-2.5 px-3 text-right font-bold">จัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              ${users.map(u => {
                const divName = u.division_name || (state.data.departments.find(d => Number(d.id) === Number(u.department_id))?.plant_name) || 'ฝ่ายปฏิบัติการ';
                return `
                <tr class="hover:bg-slate-50/80">
                  <td class="py-2.5 px-3 font-mono font-bold text-slate-900">${u.emp_code}</td>
                  <td class="py-2.5 px-3">
                    <div class="font-bold text-slate-800">${u.full_name}</div>
                    <div class="text-[11px] text-slate-400">${u.position || '-'}</div>
                  </td>
                  <td class="py-2.5 px-3">
                    <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[11px]">📂 ${divName}</span>
                  </td>
                  <td class="py-2.5 px-3 font-semibold" style="color:${u.department_color || '#2563eb'}">[${u.department_code || 'ALL'}] ${u.department_name || ''}</td>
                  <td class="py-2.5 px-3">
                    <span class="inline-block px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">👥 ${escapeUserAssignmentHtml(u.work_group || 'ยังไม่กำหนดกลุ่มงาน')}</span>
                    <div class="mt-1 text-slate-500">📋 ${Array.isArray(u.assigned_forms) ? u.assigned_forms.length : 0} แบบฟอร์ม</div>
                    <div class="mt-1 text-[10px] text-slate-400">${escapeUserAssignmentHtml(Array.isArray(u.assigned_forms) ? u.assigned_forms.join(', ') : '')}</div>
                  </td>
                  <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded bg-slate-100 font-bold uppercase text-[10px] text-slate-700">${u.role}</span></td>
                  <td class="py-2.5 px-3 text-right">
                    <button onclick="openUserModal(${u.id})" class="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium mr-1">แก้ไข</button>
                    <button onclick="deleteUser(${u.id})" class="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-medium">ลบ</button>
                  </td>
                </tr>
              `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Free Telegram Bot & Center Settings Card -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4 text-xs">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-bold text-slate-800 text-base">🔔 ตั้งค่าระบบกลาง & Telegram แจ้งเตือนฟรี 100%</h3>
            <p class="text-slate-500 mt-0.5">ส่งแจ้งเตือนเข้ากลุ่มแผนกผ่าน Telegram Bot API ฟรีไม่จำกัดข้อความ (แทน LINE Notify ที่ยกเลิกไปแล้ว)</p>
          </div>
          <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] border border-emerald-200">
            ✅ Telegram API Active
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block font-bold text-slate-700 mb-1">ชื่อหน่วยงาน/โรงงานบนหัวรายงาน</label>
            <input type="text" id="set-org-name" value="${s.organization_name || ''}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Telegram Bot Token (จาก @BotFather ฟรี)</label>
            <input type="text" id="set-tg-token" value="${s.telegram_bot_token || ''}" placeholder="เช่น 123456789:ABCdefGHIjklMNO..." class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Telegram Chat ID กลุ่มแจ้งเตือนกลาง</label>
            <input type="text" id="set-tg-chat" value="${s.telegram_default_chat_id || ''}" placeholder="เช่น -1001234567890" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono" />
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <button onclick="resetStandaloneDemoData()" class="bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-semibold px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer">
            🧹 ล้างข้อมูลจำลอง (Mockup) ออกทั้งหมด (คงเหลือเฉพาะข้อมูลจริง)
          </button>
          <div class="flex items-center gap-2">
            <button onclick="testTelegramAlert()" class="bg-slate-800 hover:bg-slate-900 text-white font-semibold px-4 py-2.5 rounded-xl cursor-pointer">📲 ทดสอบแจ้งเตือน</button>
            <button onclick="saveSystemSettings()" class="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-xs">💾 บันทึกตั้งค่า</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Audit Logs -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
      <h3 class="font-bold text-slate-800 text-sm">📜 ประวัติการเปลี่ยนแปลงข้อมูลในระบบ (System Audit Trail)</h3>
      <div class="max-h-60 overflow-y-auto divide-y divide-slate-100 text-xs">
        ${state.data.auditLogs.map(log => `
          <div class="py-2 flex flex-wrap items-center justify-between gap-2">
            <div>
              <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700">${log.action_type}</span>
              <strong class="ml-1 text-slate-800">[${log.target_type}] ${log.target_name}</strong>
              <span class="text-slate-500 ml-1">${log.detail || ''}</span>
            </div>
            <div class="text-slate-400 text-[11px]">โดย ${log.actor_name} • ${log.created_at}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function openUserModal(userId) {
  if (userId) ComisSync.captureRevision('/api/users/' + userId);
  const u = userId ? state.data.users.find(x => x.id === Number(userId)) : null;
  const workGroups = ['ทีมตรวจเช็ค กะ 1 (กลางวัน)', 'ทีมตรวจเช็ค กะ 2 (กลางคืน)', 'ทีมตรวจเช็ค กะ 3 (สำรอง)', 'ทีมซ่อมบำรุงเครื่องจักร', 'ทีมควบคุมเครื่องจักร & DCS', 'ทีมฝ่ายผลิต', 'ทีมวิศวกรรม & จป.'];
  const assignedForms = Array.isArray(u?.assigned_forms) ? u.assigned_forms : [];
  const builtinForms = window.ESC_BUILTIN_FORMS || [];
  const html = `
    ${u && !ComisDomain.isStandalone() ? `<button type="button" onclick="ComisSync.password(${u.id})" class="px-4 py-2 bg-emerald-700 text-white rounded-lg">ตั้งรหัสผ่านชั่วคราว</button>` : ''}
    <form onsubmit="saveUser(event, ${u ? u.id : 'null'})" class="space-y-4 text-xs">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">รหัสพนักงาน (Employee Code) *</label>
          <input type="text" id="u-code" required value="${u?.emp_code || ''}" placeholder="เช่น EMP-1005" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold uppercase" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
          <input type="text" id="u-name" required value="${u?.full_name || ''}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">ตำแหน่งงาน</label>
          <input type="text" id="u-pos" value="${u?.position || 'ช่างเทคนิค'}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สังกัดแผนก (ฝ่าย &gt;&gt; แผนก)</label>
          <select id="u-dept" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            ${renderDepartmentSelectOptions(u?.department_id)}
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">สิทธิ์การใช้งาน (Role)</label>
          <select id="u-role" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold">
            <option value="inspector" ${u?.role === 'inspector' ? 'selected' : ''}>Inspector (ช่างตรวจเช็คหน้างาน)</option>
            <option value="dept_admin" ${u?.role === 'dept_admin' ? 'selected' : ''}>Dept Admin (หัวหน้าแผนก/ผู้อนุมัติ)</option>
            <option value="super_admin" ${u?.role === 'super_admin' ? 'selected' : ''}>Super Admin (ผู้ดูแลระบบกลาง)</option>
            <option value="viewer" ${u?.role === 'viewer' ? 'selected' : ''}>Viewer (ผู้บริหาร/Auditor ดูรายงาน)</option>
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
          <input type="text" id="u-phone" value="${u?.phone || ''}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
      </div>
      <div>
        <label for="u-work-group" class="block font-bold text-slate-700 mb-1">กลุ่มงาน (Work Group / Shift Team)</label>
        <input type="text" id="u-work-group" list="u-work-groups" value="${escapeUserAssignmentHtml(u?.work_group || '')}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        <datalist id="u-work-groups">${workGroups.map(group => `<option value="${escapeUserAssignmentHtml(group)}"></option>`).join('')}</datalist>
      </div>
      <fieldset class="space-y-2">
        <legend class="font-bold text-slate-700">แบบฟอร์มที่ได้รับมอบหมาย (Assigned Forms)</legend>
        <div class="flex flex-wrap gap-2">
          ${[['all', 'เลือกทั้งหมด'], ['none', 'ล้างทั้งหมด'], ['ML', 'เลือกเฉพาะ ML'], ['PD', 'เลือกเฉพาะ PD']].map(([group, label]) => `<button type="button" onclick="selectUserAssignedForms(this, '${group}')" class="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-semibold">${label}</button>`).join('')}
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto p-2 border border-slate-200 rounded-xl">
          ${builtinForms.map(form => `<label class="flex items-start gap-2 p-2 rounded-lg hover:bg-slate-50"><input type="checkbox" name="assigned_forms" value="${escapeUserAssignmentHtml(form.code)}" ${assignedForms.includes(form.code) ? 'checked' : ''} class="mt-0.5" /><span><strong>${escapeUserAssignmentHtml(form.code)}</strong><br>${escapeUserAssignmentHtml(form.title)}</span></label>`).join('')}
        </div>
      </fieldset>
      <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">ยกเลิก</button>
        <button type="submit" class="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold">💾 บันทึกผู้ใช้งาน</button>
      </div>
    </form>
  `;
  openModal(u ? `👤 แก้ไขผู้ใช้งาน: ${u.full_name}` : '➕ เพิ่มผู้ใช้งานใหม่', html);
}

async function saveUser(e, id) {
  e.preventDefault();
  const payload = {
    emp_code: document.getElementById('u-code').value,
    full_name: document.getElementById('u-name').value,
    position: document.getElementById('u-pos').value,
    department_id: Number(document.getElementById('u-dept').value),
    role: document.getElementById('u-role').value,
    phone: document.getElementById('u-phone').value,
    work_group: document.getElementById('u-work-group').value.trim(),
    assigned_forms: Array.from(e.target.querySelectorAll('input[name="assigned_forms"]:checked'), input => input.value)
  };
  try {
    const res = id
      ? await apiRequest(`/api/users/${id}`, 'PUT', payload)
      : await apiRequest('/api/users', 'POST', payload);
    closeModal();
    updateStateData(res.data);
    window.syncUsersToSignerDirectory?.(state.data.users);
    showToast('บันทึกข้อมูลผู้ใช้งานสำเร็จ', 'success');
    if (!id && !ComisDomain.isStandalone()) { const user=res.data.users.find(u=>u.emp_code===payload.emp_code.trim().toUpperCase()); if(user) ComisSync.password(user.id); }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUser(id) {
  if (!confirm('ยืนยันการลบผู้ใช้งานนี้?')) return;
  try {
    const res = await apiRequest(`/api/users/${id}`, 'DELETE');
    updateStateData(res.data);
    window.syncUsersToSignerDirectory?.(state.data.users);
    showToast('ลบผู้ใช้งานเรียบร้อยแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function saveSystemSettings() {
  const payload = {
    organization_name: document.getElementById('set-org-name').value,
    telegram_bot_token: document.getElementById('set-tg-token').value,
    telegram_default_chat_id: document.getElementById('set-tg-chat').value
  };
  try {
    const res = await apiRequest('/api/settings', 'PUT', payload);
    updateStateData(res.data);
    showToast('บันทึกการตั้งค่าระบบเรียบร้อยแล้ว', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function testTelegramAlert() {
  await saveSystemSettings();
  try {
    const res = await apiRequest('/api/telegram/test', 'POST');
    if (res.ok) {
      showToast('ส่งข้อความทดสอบเข้า Telegram สำเร็จ!', 'success');
    } else {
      showToast(`ไม่สามารถส่งได้: ${res.details?.reason || 'โปรดตรวจสอบ Bot Token และ Chat ID'}`, 'warning');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// QUICK QR SCANNER CHECK-IN MODAL & CSV EXPORT UTILITIES
// ============================================================================
function openQuickQRScannerModal() {
  return ComisQR.open();
  const html = `
    <div class="space-y-4 text-xs">
      <div class="bg-slate-900 text-white p-4 rounded-2xl flex items-center justify-between">
        <div>
          <div class="text-sky-400 font-bold uppercase">QR CODE CHECK-IN VERIFICATION</div>
          <div class="text-sm font-bold mt-0.5">เลือกหรือสแกนรหัสเครื่องจักรเพื่อเปิดหน้าตรวจเช็คทันที</div>
        </div>
        <i data-lucide="qr-code" class="w-10 h-10 text-sky-400"></i>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        ${state.data.machines.map(m => `
          <button onclick="closeModal(); startInspectionForMachine(${m.id}); showToast('สแกน QR เข้าตรวจเครื่อง ${m.machine_code} สำเร็จ!', 'info');"
            class="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-left transition flex items-center justify-between">
            <div>
              <div class="font-mono font-bold text-blue-700">${m.machine_code}</div>
              <div class="font-semibold text-slate-800">${m.name.slice(0, 35)}</div>
              <div class="text-[11px] text-slate-400">📍 ${m.plant_area}</div>
            </div>
            <span class="text-xs font-bold text-blue-600">เลือก →</span>
          </button>
        `).join('')}
      </div>
    </div>
  `;
  openModal('📱 สแกน QR Code ประจำเครื่องจักร (Quick Check-In)', html);
}

function openModal(title, bodyHtml) {
  setText('modal-title', title);
  const body = document.getElementById('modal-body');
  if (body) body.innerHTML = bodyHtml;
  const modal = document.getElementById('app-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  if (window.lucide) window.lucide.createIcons();
}

function closeModal() {
  if (window.ComisQR) ComisQR.stop();
  const modal = document.getElementById('app-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openPrintModal(title, htmlContent) {
  setText('print-modal-title', title);
  const area = document.getElementById('printable-area');
  // Callers supply report markup with dynamic values escaped using esc().
  if (area) area.innerHTML = htmlContent;
  const modal = document.getElementById('print-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  if (window.lucide) window.lucide.createIcons();
}

function closePrintModal() {
  const modal = document.getElementById('print-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function downloadCSV(filename, rows) {
  const bom = '\uFEFF';
  const csvContent = bom + rows.map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

function exportMachinesCSV() {
  const rows = [
    ['รหัสเครื่องจักร', 'ชื่อเครื่องจักร', 'หมวดหมู่', 'ฝ่าย', 'แผนก', 'พื้นที่ติดตั้ง', 'ยี่ห้อ', 'รุ่น', 'Class', 'สถานะเดินเครื่อง', 'สุขภาพเครื่อง', 'ชั่วโมงสะสม']
  ];
  for (const m of state.data.machines) {
    const divName = m.division_name || (state.data.departments.find(d => Number(d.id) === Number(m.department_id))?.plant_name) || 'ฝ่ายปฏิบัติการ';
    rows.push([m.machine_code, m.name, m.category, divName, m.department_name, m.plant_area, m.brand, m.model, m.criticality, m.operating_state, m.health_status, m.running_hours]);
  }
  downloadCSV('COMIS_Machines_Master.csv', rows);
}

function exportInspectionsCSV() {
  const rows = [
    ['เลขที่ใบตรวจ', 'วันที่-เวลา', 'รหัสเครื่องจักร', 'ชื่อเครื่องจักร', 'แบบฟอร์ม', 'ฝ่าย', 'แผนก', 'ผู้ตรวจ', 'กะ', 'ผลประเมินรวม', 'จำนวนข้อผิดปกติ', 'สถานะอนุมัติ', 'หมายเหตุสรุป']
  ];
  for (const i of state.data.inspections) {
    const divName = i.division_name || (state.data.departments.find(d => Number(d.id) === Number(i.department_id))?.plant_name) || 'ฝ่ายปฏิบัติการ';
    rows.push([i.doc_no, i.inspected_at, i.machine_code, i.machine_name, i.form_title, divName, i.department_name, i.inspector_name, i.shift, i.overall_result, i.abnormal_count, i.approval_status, i.inspector_note]);
  }
  downloadCSV('COMIS_Inspection_History.csv', rows);
}

async function resetStandaloneDemoData() {
  if (!confirm('ยืนยันการล้างข้อมูลจำลอง (Mockup) ออกทั้งหมด?\n\nหมายเหตุ: ข้อมูลเครื่องจักร การตรวจเช็ค หรือสายเดินตรวจที่คุณสร้างขึ้นจริงจะยังคงอยู่ครบถ้วน')) return;
  try {
    const res = await apiRequest('/api/system/purge-mockup', 'POST', {
      actor: state.activeUser?.full_name || 'System Admin'
    });
    if (typeof getLocalDb === 'function') {
      getLocalDb();
    }
    if (res && res.data) {
      updateStateData(res.data);
    } else {
      await loadBootstrap();
    }
    showToast('🧹 ล้างข้อมูลจำลอง (Mockup) ออกทั้งหมดเรียบร้อยแล้ว! พร้อมแสดงเฉพาะข้อมูลจริง', 'success');
  } catch (e) {
    showToast(e.message, 'error');
  }
}

// ============================================================================
// 9. WALKING ROUTES, SHIFT SCHEDULES & MULTI-INSPECTOR TEAM COLLABORATION
// ============================================================================
let routeModalDraftStops = [];

function renderRoutes(container) {
  const routes = getScopedRoutesForActiveUser();
  const rounds = getScopedRouteRoundsForActiveUser(false);
  const activeRounds = rounds.filter(r => r.status === 'in_progress');
  const completedRounds = rounds.filter(r => r.status === 'completed');

  container.innerHTML = `
    <div class="space-y-6">
      ${renderUserScopeFilterBar('รอบการเดินตรวจที่กำลังดำเนินการในกะนี้ & สายเดินตรวจตามลำดับเครื่องจักร')}

      <!-- Top Summary & Action Banner -->
      <div class="bg-gradient-to-r from-[#0c2e07] via-[#154c0c] to-[#1f760e] rounded-2xl p-6 text-white shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">🗺️ ROUTE & TEAM INSPECTION CENTER</span>
              <span class="text-xs text-emerald-200">รองรับแบ่งทีมช่วยกันตรวจหลายเครื่อง หรือช่วยกันตรวจเครื่องเดียวกัน</span>
            </div>
            <h2 class="text-lg font-extrabold">ระบบสายเดินตรวจตามลำดับเครื่องจักร & แบ่งงานทีมช่างช่วยกันตรวจในแผนก</h2>
            <p class="text-xs text-emerald-100/85">
              ใน 1 แผนก ช่างหลายคนสามารถกด <strong>"เข้าร่วมทีมตรวจ"</strong> เพื่อช่วยกันเดินตรวจคนละจุดในสายเดียวกัน หรือช่วยกันตรวจคนละหมวดในเครื่องจักรเดียวกันได้ทันที
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2.5">
            <button onclick="downloadCsvTemplate('routes')" class="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="download" class="w-4 h-4"></i> 📥 เทมเพลตสายตรวจ CSV
            </button>
            <button onclick="openCsvImportModal('routes')" class="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="upload" class="w-4 h-4"></i> 📤 นำเข้าสายตรวจ CSV
            </button>
            <button onclick="openEmergencyQuickEntryModal(null)" class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer">
              <i data-lucide="zap" class="w-4 h-4 text-amber-300"></i> ⚡ ลงค่าฉุกเฉินเฉพาะจุด
            </button>
            <button onclick="openRouteModal(null)" class="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer">
              <i data-lucide="plus-circle" class="w-4 h-4"></i> + สร้างสายเดินตรวจ & ตั้งเวลาใหม่
            </button>
          </div>
        </div>
      </div>

      <!-- PART 1: Active Team Inspection Rounds in Current Shift -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
              <i data-lucide="users" class="w-5 h-5 text-emerald-700"></i>
              รอบการเดินตรวจที่กำลังดำเนินการในกะนี้ (${state.userScopeOnly ? `เฉพาะยูเซอร์ ${state.activeUser?.full_name || '-'}: ` : 'ทั้งหมด: '}${activeRounds.length} รอบ)
            </h3>
            <p class="text-xs text-slate-500">คลิกที่จุดเครื่องจักรเพื่อเข้าตรวจต่อจากเพื่อนร่วมทีม หรือกด "+ เข้าร่วมทีมตรวจ" เพื่อลงชื่อช่วยตรวจในรอบนี้</p>
          </div>
          <button onclick="toggleUserScopeFilter()" class="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1f760e] border border-emerald-200 text-xs font-bold cursor-pointer">
            ${state.userScopeOnly ? '🌐 สลับดูทุกรอบของโรงงาน' : '👤 กรองเฉพาะรอบที่เกี่ยวข้องกับฉัน'}
          </button>
        </div>

        ${activeRounds.length === 0 ? `
          <div class="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
            <div class="text-sm font-bold text-slate-700">ไม่มีรอบการเดินตรวจที่กำลังเปิดอยู่สำหรับผู้ใช้งานนี้ในขณะนี้</div>
            <p class="text-xs text-slate-500">คลิกปุ่ม <strong>"🚀 เปิดรอบเดินตรวจกะนี้"</strong> ด้านล่าง หรือกด <button onclick="toggleUserScopeFilter()" class="underline font-bold text-emerald-700 cursor-pointer">สลับดูรอบของแผนกอื่นทั้งหมด</button></p>
          </div>
        ` : `
          <div class="space-y-5">
            ${activeRounds.map(rr => renderRouteRoundCard(rr, true)).join('')}
          </div>
        `}
      </div>

      <!-- PART 2: Master Walking Routes & Shift Time Schedules (CRUD) -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
              <i data-lucide="map" class="w-5 h-5 text-blue-600"></i>
              แม่แบบสายเดินตรวจมาตรฐาน & ตารางเวลาเดินตรวจประจำกะ (Master Inspection Routes: ${routes.length} เส้นทาง)
            </h3>
            <p class="text-xs text-slate-500">กำหนดลำดับเครื่องจักร ก่อน-หลัง (จุดที่ 1 → 2 → 3) และกำหนดช่วงเวลาที่ต้องเข้าตรวจในแต่ละกะ</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button onclick="openCsvImportModal('routes')" class="bg-[#1f760e] hover:bg-[#154c0c] text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1 cursor-pointer">
              📤 นำเข้าสายตรวจ CSV
            </button>
            <button onclick="openRouteModal(null)" class="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
              <i data-lucide="plus" class="w-4 h-4"></i> + เพิ่มสายเดินตรวจใหม่
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-5">
          ${routes.map(rt => `
            <div class="rounded-2xl border-2 border-slate-200 hover:border-emerald-600/50 bg-white p-5 flex flex-col justify-between space-y-4 transition shadow-2xs">
              <div class="space-y-3">
                <div class="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-slate-900 text-white">${rt.route_code}</span>
                      <span class="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100" style="color:${rt.department_color || '#1f760e'}">[${rt.department_code}] ${rt.department_name}</span>
                      <span class="text-xs text-slate-500 font-semibold">⏱️ ~${rt.estimated_minutes || 35} นาที</span>
                    </div>
                    <h4 class="font-bold text-slate-800 text-base mt-1.5">${rt.name}</h4>
                    <p class="text-xs text-slate-500 mt-0.5">${rt.description || '-'}</p>
                  </div>
                </div>

                <!-- Shift Time Windows -->
                <div class="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1.5">
                  <div class="text-[11px] font-extrabold text-amber-900 flex items-center gap-1.5">
                    <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-700"></i> ตารางเวลาเดินตรวจตามกะ (Scheduled Shift Windows):
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    ${(rt.shift_schedules || []).map(sch => `
                      <span class="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-xs font-bold text-slate-800">
                        ⏰ ${sch.shift}: <strong class="text-emerald-700">${sch.time_window}</strong>
                        ${sch.note ? `<span class="text-[10px] text-slate-500">(${sch.note})</span>` : ''}
                      </span>
                    `).join('')}
                  </div>
                </div>

                <!-- Ordered Machine Stops Sequence -->
                <div class="space-y-2">
                  <div class="text-xs font-bold text-slate-700">📍 ลำดับเครื่องจักรในเส้นทาง (${(rt.stops || []).length} จุดตรวจ):</div>
                  <div class="space-y-1.5">
                    ${(rt.stops || []).map((st, idx) => `
                      <div class="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                        <div class="flex items-center gap-2.5">
                          <span class="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-[11px] shrink-0">${idx + 1}</span>
                          <div>
                            <span class="font-mono font-bold text-slate-900">${st.machine_code}</span>
                            <span class="font-semibold text-slate-700 ml-1">${st.machine_name}</span>
                            <div class="text-[10px] text-slate-500">📍 ${st.plant_area} ${st.stop_note ? `• 💡 ${st.stop_note}` : ''}</div>
                          </div>
                        </div>
                        ${getHealthBadge(st.health_status || 'normal')}
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>

              <div class="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div class="flex items-center gap-1.5">
                  <button onclick="openRouteModal(${rt.id})" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer">
                    <i data-lucide="sliders" class="w-3.5 h-3.5"></i> แก้ไขเส้นทาง/เวลา
                  </button>
                  <button onclick="deleteRoute(${rt.id})" class="p-2 rounded-xl bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 cursor-pointer" title="ลบสายเดินตรวจ">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                  </button>
                </div>
                <button onclick="openStartRouteRoundModal(${rt.id})" class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer">
                  <i data-lucide="play" class="w-4 h-4"></i> 🚀 เปิดรอบเดินตรวจกะนี้ (เริ่มทีมตรวจ)
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- PART 3: Completed Route Rounds History -->
      ${completedRounds.length > 0 ? `
        <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600"></i>
            ประวัติรอบการเดินตรวจที่ตรวจครบทุกจุดแล้ว (${completedRounds.length} รอบ)
          </h3>
          <div class="space-y-3">
            ${completedRounds.map(rr => renderRouteRoundCard(rr, false)).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

function renderRouteRoundCard(rr, isActive) {
  const isMember = (rr.assigned_inspectors || []).some(x => x.inspector_name === state.activeUser?.full_name);

  return `
    <div class="rounded-2xl border-2 ${isActive ? 'border-emerald-600/40 bg-emerald-50/20' : 'border-slate-200 bg-slate-50/60'} p-5 space-y-4">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded bg-slate-900 text-white">${rr.round_code}</span>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-bold ${isActive ? 'bg-amber-100 text-amber-800 border border-amber-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}">
              ${isActive ? '🏃 กำลังเดินตรวจในกะนี้' : '✅ เดินตรวจครบทุกจุดแล้ว'}
            </span>
            <span class="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg">
              ⏰ ช่วงเวลา: ${rr.time_window || rr.shift}
            </span>
            <span class="text-xs text-slate-500">เริ่มเมื่อ: ${rr.started_at}</span>
          </div>
          <h4 class="font-extrabold text-slate-900 text-base">${rr.route_name}</h4>
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span class="text-xs font-bold text-slate-600">👥 ทีมช่างผู้ร่วมตรวจในรอบนี้ (${(rr.assigned_inspectors || []).length} คน):</span>
            ${(rr.assigned_inspectors || []).map(ins => `
              <span class="px-2.5 py-0.5 rounded-full bg-white border border-emerald-300 text-xs font-bold text-emerald-900 shadow-2xs">
                👷 ${ins.inspector_name} <span class="text-[10px] text-slate-400">(${ins.role_note || 'ร่วมตรวจ'})</span>
              </span>
            `).join('')}
            ${isActive && !isMember ? `
              <button onclick="joinRouteRound(${rr.id})" class="px-3 py-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer">
                + ลงชื่อเข้าร่วมช่วยตรวจรอบนี้ (${state.activeUser?.full_name || 'ช่าง'})
              </button>
            ` : ''}
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-xs font-extrabold text-emerald-800">ความคืบหน้าสายตรวจ: ${rr.completed_stops} / ${rr.total_stops} เครื่อง (${rr.progress_pct}%)</div>
            <div class="w-40 h-2.5 bg-slate-200 rounded-full overflow-hidden mt-1 ml-auto">
              <div class="h-full bg-emerald-600 rounded-full transition-all" style="width:${rr.progress_pct}%"></div>
            </div>
          </div>
          <button onclick="deleteRouteRound(${rr.id})" class="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 cursor-pointer" title="ลบรอบเดินตรวจนี้">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Visual Route Stop Sequence Stepper -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        ${(rr.stops_progress || []).map(st => {
          const isDone = st.status === 'completed';
          const isSharedDraft = st.status === 'in_progress_shared';
          const draftCount = st.shared_draft_answers ? Object.keys(st.shared_draft_answers).length : 0;
          return `
            <div class="rounded-2xl border-2 p-4 flex flex-col justify-between transition ${
              isDone
                ? 'border-emerald-500/50 bg-white'
                : isSharedDraft
                ? 'border-amber-400 bg-amber-50/40 shadow-xs'
                : 'border-slate-200 bg-white hover:border-blue-400'
            }">
              <div class="space-y-2">
                <div class="flex items-center justify-between gap-2">
                  <span class="px-2.5 py-0.5 rounded-lg font-extrabold text-xs ${
                    isDone ? 'bg-emerald-600 text-white' : isSharedDraft ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-white'
                  }">
                    จุดที่ ${st.stop_order}
                  </span>
                  ${isDone
                    ? getHealthBadge(st.overall_result || 'normal')
                    : isSharedDraft
                    ? `<span class="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">⏳ กำลังช่วยกันตรวจ (${draftCount} ข้อ)</span>`
                    : `<span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">⚪ รอเข้าตรวจ</span>`
                  }
                </div>

                <div>
                  <div class="font-mono font-extrabold text-sm text-slate-900">${st.machine_code}</div>
                  <div class="font-bold text-xs text-slate-800 leading-snug">${st.machine_name}</div>
                  <div class="text-[11px] text-slate-500 mt-0.5">📍 ${st.plant_area}</div>
                </div>

                ${st.stop_note ? `
                  <div class="text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-600">
                    💡 <strong>จุดเน้น:</strong> ${st.stop_note}
                  </div>
                ` : ''}

                ${isDone ? `
                  <div class="text-[11px] bg-emerald-50 p-2 rounded-lg border border-emerald-200 text-emerald-900 space-y-0.5">
                    <div>✅ <strong>ตรวจเสร็จโดย:</strong> ${st.checked_by || '-'}</div>
                    ${Array.isArray(st.co_inspectors) && st.co_inspectors.length > 1 ? `<div>🤝 <strong>ร่วมตรวจ:</strong> ${st.co_inspectors.join(', ')}</div>` : ''}
                    <div>🕒 <strong>เวลา:</strong> ${st.checked_at || '-'} (${st.doc_no || ''})</div>
                  </div>
                ` : isSharedDraft ? `
                  <div class="text-[11px] bg-amber-100/70 p-2 rounded-lg border border-amber-300 text-amber-950 space-y-0.5">
                    <div>🤝 <strong>ผู้เริ่มตรวจ:</strong> ${(st.co_inspectors || []).join(', ')}</div>
                    <div>บันทึกค้างไว้ <strong>${draftCount} ข้อ</strong> — กดปุ่มด้านล่างเพื่อเข้าช่วยตรวจต่อได้ทันที</div>
                  </div>
                ` : ''}
              </div>

              <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button onclick="openEmergencyQuickEntryModal(${st.machine_id})" class="px-2.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer" title="ลงค่าฉุกเฉินเฉพาะจุด">
                  ⚡ ลงค่าด่วน
                </button>
                ${isDone && st.inspection_id ? `
                  <div class="flex items-center gap-1">
                    <button onclick="openInspectionReportModal(${st.inspection_id})" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer">
                      📄 ดูใบงาน
                    </button>
                    <button onclick="startInspectionForMachine(${st.machine_id}, ${rr.route_id}, ${rr.id})" class="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer">
                      ตรวจซ้ำ
                    </button>
                  </div>
                ` : `
                  <button onclick="startInspectionForMachine(${st.machine_id}, ${rr.route_id}, ${rr.id})" class="flex-1 py-2 px-3 rounded-xl ${
                    isSharedDraft ? 'bg-amber-500 hover:bg-amber-400 text-slate-950' : 'bg-blue-600 hover:bg-blue-700 text-white'
                  } text-xs font-extrabold flex items-center justify-center gap-1 shadow-xs cursor-pointer">
                    <i data-lucide="clipboard-check" class="w-3.5 h-3.5"></i>
                    ${isSharedDraft ? '🤝 เข้าช่วยตรวจต่อทันที' : '🔍 เข้าตรวจจุดนี้'}
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function openStartRouteRoundModal(routeId) {
  const rt = (state.data.routes || []).find(r => r.id === Number(routeId));
  if (!rt) return;

  const deptUsers = (state.data.users || []).filter(u => Number(u.department_id) === Number(rt.department_id));
  const allUsers = state.data.users || [];
  const candidateUsers = deptUsers.length > 0 ? deptUsers : allUsers;

  const html = `
    <form onsubmit="submitStartRouteRound(event, ${rt.id})" class="space-y-4 text-xs">
      <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-1">
        <div class="font-mono font-bold text-emerald-800">${rt.route_code} • ${rt.department_name}</div>
        <div class="text-sm font-extrabold text-slate-900">${rt.name}</div>
        <div class="text-slate-600">จำนวนจุดตรวจทั้งหมด: <strong>${(rt.stops || []).length} เครื่องจักร</strong></div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">1. เลือกกะและช่วงเวลาเดินตรวจ (Shift Time Window) *</label>
          <select id="rr-schedule-select" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-bold text-slate-800">
            ${(rt.shift_schedules || []).map(s => `
              <option value="${s.shift}|${s.time_window}">⏰ ${s.shift} — เวลา ${s.time_window} (${s.note || 'ตามรอบปกติ'})</option>
            `).join('')}
            <option value="กะพิเศษ / นอกเวลา|ไม่ระบุช่วงเวลา">⚡ รอบเดินตรวจพิเศษ / เฉพาะกิจ</option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">2. การแบ่งงานภายในทีมตรวจ</label>
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[11px] text-slate-600">
            ผู้ที่ถูกเลือกด้านล่างจะอยู่ในทีมตรวจรอบนี้ สามารถแยกกันตรวจคนละเครื่อง หรือกดแชร์ช่วยกันตรวจเครื่องเดียวกันได้
          </div>
        </div>
      </div>

      <div>
        <label class="block font-bold text-slate-700 mb-2">3. เลือกทีมช่างผู้ร่วมเดินตรวจในรอบนี้ (เลือกได้หลายคนในแผนก) *</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${allUsers.map(u => {
            const isActiveUser = state.activeUser && u.id === state.activeUser.id;
            const isSameDept = Number(u.department_id) === Number(rt.department_id);
            return `
              <label class="flex items-center justify-between gap-2 p-3 rounded-xl border cursor-pointer ${
                isActiveUser || isSameDept ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
              }">
                <div class="flex items-center gap-2.5">
                  <input type="checkbox" name="rr-inspector" value="${u.emp_code}|${u.full_name}" ${isActiveUser || isSameDept ? 'checked' : ''} class="rounded text-emerald-600 w-4 h-4" />
                  <div>
                    <div class="font-bold text-slate-800">${u.full_name} <span class="font-mono text-[10px] text-slate-500">(${u.emp_code})</span></div>
                    <div class="text-[11px] text-slate-500">${u.position || ''} • [${u.department_code || ''}]</div>
                  </div>
                </div>
                ${isSameDept ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">แผนกนี้</span>` : ''}
              </label>
            `;
          }).join('')}
        </div>
      </div>

      <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">ยกเลิก</button>
        <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold flex items-center gap-1.5 cursor-pointer">
          🚀 เริ่มรอบเดินตรวจพร้อมทีมช่าง
        </button>
      </div>
    </form>
  `;

  openModal(`🚀 เปิดรอบการเดินตรวจประจำกะ: ${rt.route_code}`, html);
}

async function submitStartRouteRound(e, routeId) {
  e.preventDefault();
  const schedVal = document.getElementById('rr-schedule-select').value || 'กะเช้า (07:00-19:00)|07:30 - 09:30';
  const [shift, time_window] = schedVal.split('|');

  const checkedBoxes = Array.from(document.querySelectorAll('input[name="rr-inspector"]:checked'));
  const assigned_inspectors = checkedBoxes.map((cb, idx) => {
    const [inspector_code, inspector_name] = cb.value.split('|');
    return {
      inspector_code,
      inspector_name,
      role_note: idx === 0 ? 'หัวหน้าชุดเดินตรวจ' : 'ผู้ร่วมตรวจเช็ค'
    };
  });

  if (assigned_inspectors.length === 0) {
    assigned_inspectors.push({
      inspector_code: state.activeUser?.emp_code || 'EMP-1002',
      inspector_name: state.activeUser?.full_name || 'สมชาย ใจเพชร',
      role_note: 'ผู้เปิดรอบตรวจ'
    });
  }

  try {
    const res = await apiRequest('/api/route-rounds', 'POST', {
      route_id: Number(routeId),
      shift,
      time_window,
      assigned_inspectors
    });
    closeModal();
    updateStateData(res.data);
    showToast(`เปิดรอบเดินตรวจ ${res.round.round_code} สำเร็จ! เริ่มเดินตรวจจุดที่ 1 ได้เลย`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function joinRouteRound(roundId) {
  try {
    const res = await apiRequest(`/api/route-rounds/${roundId}`, 'PUT', {
      join_inspector: {
        inspector_code: state.activeUser?.emp_code || 'EMP-1002',
        inspector_name: state.activeUser?.full_name || 'ช่างตรวจเช็ค',
        role_note: 'เข้าร่วมช่วยตรวจระหว่างกะ'
      }
    });
    updateStateData(res.data);
    showToast(`ลงชื่อ ${state.activeUser?.full_name} เข้าร่วมทีมตรวจเรียบร้อยแล้ว!`, 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteRouteRound(roundId) {
  if (!confirm('ยืนยันการลบรอบการเดินตรวจนี้?')) return;
  try {
    const res = await apiRequest(`/api/route-rounds/${roundId}`, 'DELETE');
    updateStateData(res.data);
    showToast('ลบรอบการเดินตรวจเรียบร้อยแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function openRouteModal(routeId) {
  if (routeId) ComisSync.captureRevision('/api/routes/' + routeId);
  const rt = routeId ? (state.data.routes || []).find(r => r.id === Number(routeId)) : null;
  routeModalDraftStops = rt && Array.isArray(rt.stops)
    ? JSON.parse(JSON.stringify(rt.stops))
    : [
        {
          stop_order: 1,
          machine_id: state.data.machines[0]?.id || 1,
          form_id: state.data.forms[0]?.id || 1,
          stop_note: 'จุดตรวจที่ 1 เริ่มต้นสายเดินตรวจ'
        }
      ];

  const schedMorning = rt?.shift_schedules?.find(s => s.shift.includes('เช้า'))?.time_window || '07:30 - 09:30';
  const schedNight = rt?.shift_schedules?.find(s => s.shift.includes('ดึก'))?.time_window || '19:30 - 21:30';

  const html = `
    <form onsubmit="saveRouteModal(event, ${rt ? rt.id : 'null'})" class="space-y-4 text-xs">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block font-bold text-slate-700 mb-1">รหัสสายเดินตรวจ (Route Code) *</label>
          <input type="text" id="rt-code" required value="${rt?.route_code || `RT-ESC-0${(state.data.routes?.length || 2) + 1}`}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold uppercase" />
        </div>
        <div class="md:col-span-2">
          <label class="block font-bold text-slate-700 mb-1">ชื่อสายเดินตรวจ (Route Name) *</label>
          <input type="text" id="rt-name" required value="${rt?.name || ''}" placeholder="เช่น สายตรวจลูกหีบ & กังหันไอน้ำ (กะเช้า/กะดึก)" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">แผนกที่รับผิดชอบหลัก (ฝ่าย &gt;&gt; แผนก) *</label>
          <select id="rt-dept" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold">
            ${renderDepartmentSelectOptions(rt?.department_id)}
          </select>
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">เวลาเดินตรวจโดยประมาณ (นาที)</label>
          <input type="number" id="rt-mins" value="${rt?.estimated_minutes || 35}" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-bold" />
        </div>
        <div>
          <label class="block font-bold text-slate-700 mb-1">คำอธิบายเส้นทางเดิน</label>
          <input type="text" id="rt-desc" value="${rt?.description || ''}" placeholder="เช่น เดินจากสะพานเครนรางอ้อย -> ลูกหีบที่ 1 -> เกียร์ขับ" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2" />
        </div>
      </div>

      <!-- Shift Time Windows Configuration -->
      <div class="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 space-y-3">
        <div class="font-bold text-amber-950 flex items-center justify-between">
          <span class="flex items-center gap-1.5">⏰ กำหนดช่วงเวลาเดินตรวจในแต่ละกะ (2 กะการทำงาน: กะเช้า 07:00-19:00 / กะดึก 19:00-07:00)</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-700 mb-1">☀️ กะเช้า (07:00 - 19:00 น.) — ช่วงเวลาเดินตรวจ</label>
            <input type="text" id="rt-sched-morning" value="${schedMorning}" placeholder="เช่น 07:30 - 09:30" class="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 font-bold" />
          </div>
          <div>
            <label class="block font-semibold text-slate-700 mb-1">🌙 กะดึก (19:00 - 07:00 น.) — ช่วงเวลาเดินตรวจ</label>
            <input type="text" id="rt-sched-night" value="${schedNight}" placeholder="เช่น 19:30 - 21:30" class="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 font-bold" />
          </div>
        </div>
      </div>

      <!-- Ordered Machine Stops Editor -->
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-bold text-slate-800">📍 ลำดับเครื่องจักรในสายเดินตรวจ (จัดลำดับจุดที่ 1 → 2 → 3 ได้)</div>
            <div class="text-[11px] text-slate-500">เลือกเครื่องจักร แบบฟอร์มที่ใช้ตรวจ และจุดเน้นย้ำในแต่ละจุด</div>
          </div>
          <button type="button" onclick="addStopToRouteDraft()" class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer">
            + เพิ่มจุดแวะตรวจเครื่องจักร
          </button>
        </div>

        <div id="route-draft-stops-container" class="space-y-2.5"></div>
      </div>

      <div class="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
        <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold">ยกเลิก</button>
        <button type="submit" class="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold cursor-pointer">
          💾 บันทึกสายเดินตรวจและตารางเวลา
        </button>
      </div>
    </form>
  `;

  openModal(rt ? `🗺️ แก้ไขสายเดินตรวจ: ${rt.route_code}` : '➕ สร้างสายเดินตรวจและตารางเวลาใหม่', html);
  renderRouteDraftStopsList();
}

function renderRouteDraftStopsList() {
  const box = document.getElementById('route-draft-stops-container');
  if (!box) return;

  box.innerHTML = routeModalDraftStops.map((st, idx) => `
    <div class="bg-white p-3 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
      <div class="md:col-span-1 flex items-center gap-1">
        <span class="w-6 h-6 rounded-full bg-emerald-700 text-white font-extrabold flex items-center justify-center text-xs">${idx + 1}</span>
        <div class="flex flex-col">
          <button type="button" onclick="moveStopInRouteDraft(${idx}, -1)" class="text-[10px] text-slate-500 hover:text-slate-900">▲</button>
          <button type="button" onclick="moveStopInRouteDraft(${idx}, 1)" class="text-[10px] text-slate-500 hover:text-slate-900">▼</button>
        </div>
      </div>
      <div class="md:col-span-4">
        <label class="block text-[10px] text-slate-400 font-semibold">เครื่องจักรจุดที่ ${idx + 1}</label>
        <select onchange="routeModalDraftStops[${idx}].machine_id = Number(this.value)" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 font-bold">
          ${state.data.machines.map(m => `<option value="${m.id}" ${Number(st.machine_id) === m.id ? 'selected' : ''}>[${m.machine_code}] ${m.name}</option>`).join('')}
        </select>
      </div>
      <div class="md:col-span-3">
        <label class="block text-[10px] text-slate-400 font-semibold">แบบฟอร์มที่ใช้ตรวจ</label>
        <select onchange="routeModalDraftStops[${idx}].form_id = Number(this.value)" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5">
          ${state.data.forms.map(f => `<option value="${f.id}" ${Number(st.form_id) === f.id ? 'selected' : ''}>[${f.form_code}] ${f.title}</option>`).join('')}
        </select>
      </div>
      <div class="md:col-span-3">
        <label class="block text-[10px] text-slate-400 font-semibold">จุดเน้นย้ำประจำเครื่อง</label>
        <input type="text" value="${st.stop_note || ''}" oninput="routeModalDraftStops[${idx}].stop_note = this.value" placeholder="เช่น วัดอุณหภูมิลูกปืน + ฟังเสียงเกียร์" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5" />
      </div>
      <div class="md:col-span-1 text-right pt-3">
        <button type="button" onclick="removeStopFromRouteDraft(${idx})" class="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold">ลบ</button>
      </div>
    </div>
  `).join('');
}

function addStopToRouteDraft() {
  routeModalDraftStops.push({
    stop_order: routeModalDraftStops.length + 1,
    machine_id: state.data.machines[0]?.id || 1,
    form_id: state.data.forms[0]?.id || 1,
    stop_note: ''
  });
  renderRouteDraftStopsList();
}

function removeStopFromRouteDraft(idx) {
  if (routeModalDraftStops.length <= 1) {
    showToast('ในสายเดินตรวจต้องมีอย่างน้อย 1 จุดตรวจเครื่องจักร', 'warning');
    return;
  }
  routeModalDraftStops.splice(idx, 1);
  routeModalDraftStops.forEach((s, i) => { s.stop_order = i + 1; });
  renderRouteDraftStopsList();
}

function moveStopInRouteDraft(idx, dir) {
  const target = idx + dir;
  if (target < 0 || target >= routeModalDraftStops.length) return;
  const temp = routeModalDraftStops[idx];
  routeModalDraftStops[idx] = routeModalDraftStops[target];
  routeModalDraftStops[target] = temp;
  routeModalDraftStops.forEach((s, i) => { s.stop_order = i + 1; });
  renderRouteDraftStopsList();
}

async function saveRouteModal(e, routeId) {
  e.preventDefault();
  const shift_schedules = [
    { shift: 'กะเช้า (07:00-19:00)', time_window: document.getElementById('rt-sched-morning').value || '07:30 - 09:30', note: 'ตรวจรอบเช้า (07:00 - 19:00 น.)' },
    { shift: 'กะดึก (19:00-07:00)', time_window: document.getElementById('rt-sched-night').value || '19:30 - 21:30', note: 'ตรวจรอบดึก (19:00 - 07:00 น.)' }
  ];

  const payload = {
    route_code: document.getElementById('rt-code').value,
    name: document.getElementById('rt-name').value,
    department_id: Number(document.getElementById('rt-dept').value),
    estimated_minutes: Number(document.getElementById('rt-mins').value || 35),
    description: document.getElementById('rt-desc').value,
    shift_schedules,
    stops: routeModalDraftStops.map((s, i) => ({
      stop_order: i + 1,
      machine_id: Number(s.machine_id),
      form_id: Number(s.form_id),
      stop_note: s.stop_note || ''
    })),
    actor: state.activeUser?.full_name || 'Admin'
  };

  try {
    const res = routeId
      ? await apiRequest(`/api/routes/${routeId}`, 'PUT', payload)
      : await apiRequest('/api/routes', 'POST', payload);
    closeModal();
    updateStateData(res.data);
    showToast('บันทึกสายเดินตรวจและตารางเวลาเรียบร้อยแล้ว!', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteRoute(routeId) {
  if (!confirm('ยืนยันการลบสายเดินตรวจมาตรฐานนี้?')) return;
  try {
    const res = await apiRequest(`/api/routes/${routeId}`, 'DELETE');
    updateStateData(res.data);
    showToast('ลบสายเดินตรวจเรียบร้อยแล้ว', 'info');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// 10. EMERGENCY / AD-HOC SELECTIVE PARAMETER QUICK ENTRY MODAL (10-SECOND LOG)
// ============================================================================
let emergencyQuickDraft = {
  machine_id: null,
  selected_fields: {},
  custom_label: '',
  custom_value: '',
  custom_status: 'abnormal',
  symptom_note: '',
  photo_data: '',
  force_open_defect: true
};

function openEmergencyQuickEntryModal(preselectedMachineId = null) {
  const machines = state.data.machines || [];
  if (machines.length === 0) return;

  const targetMachine = preselectedMachineId
    ? machines.find(m => m.id === Number(preselectedMachineId)) || machines[0]
    : machines.find(m => m.id === Number(state.inspectSession.machine_id)) || machines[0];

  emergencyQuickDraft = {
    machine_id: targetMachine.id,
    selected_fields: {},
    custom_label: '',
    custom_value: '',
    custom_status: 'abnormal',
    symptom_note: '',
    photo_data: '',
    force_open_defect: true
  };

  const html = `
    <form onsubmit="submitEmergencyQuickEntry(event)" class="space-y-4 text-xs">
      <!-- Emergency Alert Header -->
      <div class="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div class="space-y-0.5">
          <div class="text-[11px] font-extrabold uppercase tracking-wider text-amber-200">⚡ EMERGENCY / AD-HOC SELECTIVE PARAMETER ENTRY</div>
          <div class="text-sm font-extrabold">ลงข้อมูลเฉพาะจุด / บันทึกค่าผิดปกติฉุกเฉิน (ไม่ต้องกรอกครบทั้งฟอร์ม)</div>
          <div class="text-[11px] text-rose-100">เลือกเฉพาะค่าที่วัดได้จริงเพียง 1–2 รายการ หรือระบุอาการผิดปกติที่พบหน้างาน ระบบจะพล็อตกราฟ CBM และเปิดใบแจ้งซ่อม F-Tag ทันที</div>
        </div>
      </div>

      <!-- Step 1: Select Machine -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block font-bold text-slate-800 mb-1">1. เลือกเครื่องจักรที่ต้องการลงค่าด่วน *</label>
          <select id="emg-machine-select" onchange="onChangeEmergencyMachine(this.value)" class="w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3 py-2.5 text-sm font-extrabold text-slate-900 focus:border-rose-600 focus:outline-none">
            ${machines.map(m => `<option value="${m.id}" ${m.id === targetMachine.id ? 'selected' : ''}>[${m.machine_code}] ${m.name} (${m.plant_area})</option>`).join('')}
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-800 mb-1">2. กะการทำงาน / ผู้รายงานหน้างาน</label>
          <div class="bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
            <span>👷 <strong>${state.activeUser?.full_name || 'ช่างตรวจเช็ค'}</strong> (${state.activeUser?.emp_code || '-'})</span>
            <span class="font-bold text-emerald-800">${state.inspectSession.shift}</span>
          </div>
        </div>
      </div>

      <!-- Step 2: Check ONLY the parameter(s) you want to record -->
      <div class="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div class="font-extrabold text-slate-800 text-sm">3. ติ๊กเลือกเฉพาะพารามิเตอร์ที่ต้องการลงค่า (เลือกเพียง 1 ข้อก็บันทึกได้ทันที)</div>
            <div class="text-[11px] text-slate-500">ข้อที่ไม่ได้ติ๊กจะถูกข้ามโดยอัตโนมัติ ไม่บังคับกรอกทั้งฟอร์ม</div>
          </div>
        </div>

        <div id="emg-parameters-list" class="space-y-2.5 max-h-72 overflow-y-auto pr-1"></div>

        <!-- Optional Custom Ad-Hoc Observation Row -->
        <div class="bg-white p-3.5 rounded-xl border-2 border-dashed border-rose-300 space-y-2">
          <div class="font-bold text-rose-800 flex items-center gap-1.5">
            ➕ หรือระบุหัวข้อผิดปกติเร่งด่วนอื่นๆ นอกเหนือจากในฟอร์ม (Optional Ad-Hoc Item)
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <input type="text" id="emg-custom-label" placeholder="เช่น เสียงดังผิดปกติที่เกียร์ / กลิ่นไหม้สายพาน" class="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold" />
            <input type="text" id="emg-custom-val" placeholder="ค่าที่วัดได้ หรืออาการที่พบ..." class="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 font-semibold" />
            <select id="emg-custom-status" class="bg-rose-50 border border-rose-300 rounded-lg px-3 py-2 font-bold text-rose-800">
              <option value="abnormal">🔴 ผิดปกติรุนแรง (Abnormal)</option>
              <option value="warning">🟡 เฝ้าระวัง (Warning)</option>
              <option value="normal">🟢 ปกติ (Normal)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Step 3: Symptom Note, Photo & Auto F-Tag Toggle -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 bg-rose-50/50 border border-rose-200 rounded-2xl p-4">
        <div class="space-y-2">
          <label class="block font-bold text-slate-800">4. รายละเอียดอาการที่พบหน้างาน / การแก้ไขเบื้องต้น *</label>
          <textarea id="emg-symptom-note" rows="3" placeholder="เช่น วัดอุณหภูมิลูกปืนได้ 84.5 °C สูงเกินพิกัด เบื้องต้นอัดจาระบีเพิ่มและแจ้งทีมช่างกลเข้าตรวจสอบด่วน..." class="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none focus:border-rose-600"></textarea>
        </div>

        <div class="space-y-3 flex flex-col justify-between">
          <div class="space-y-2">
            <label class="block font-bold text-slate-800">5. แนบรูปถ่ายจุดที่ผิดปกติ & การแจ้งซ่อม</label>
            <div class="flex items-center gap-2">
              <label class="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl inline-flex items-center gap-1.5">
                <i data-lucide="camera" class="w-4 h-4 text-amber-300"></i> ถ่ายรูป / แนบรูปหน้างาน
                <input type="file" accept="image/*" capture="environment" class="hidden" onchange="onEmergencyPhotoUpload(this)" />
              </label>
              <span id="emg-photo-status" class="text-xs font-bold text-emerald-700"></span>
            </div>

            <label class="flex items-center gap-2 pt-2 cursor-pointer font-extrabold text-rose-800">
              <input type="checkbox" id="emg-open-defect" checked class="rounded text-rose-600 w-4 h-4" />
              <span>🚨 เปิดใบแจ้งซ่อมด่วน (Urgent F-Tag) เข้ากระดานกลางทันที</span>
            </label>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold cursor-pointer">ยกเลิก</button>
            <button type="submit" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer">
              <i data-lucide="zap" class="w-4 h-4 text-amber-300"></i> ⚡ บันทึกข้อมูลฉุกเฉินทันที
            </button>
          </div>
        </div>
      </div>
    </form>
  `;

  openModal('⚡ ลงข้อมูลฉุกเฉิน / บันทึกค่าเฉพาะจุด (Emergency Quick Entry)', html);
  renderEmergencyParameterList(targetMachine.id);
}

function onChangeEmergencyMachine(machineId) {
  emergencyQuickDraft.machine_id = Number(machineId);
  emergencyQuickDraft.selected_fields = {};
  renderEmergencyParameterList(Number(machineId));
}

function renderEmergencyParameterList(machineId) {
  const container = document.getElementById('emg-parameters-list');
  if (!container) return;

  const machine = state.data.machines.find(m => m.id === Number(machineId)) || state.data.machines[0];
  const form = state.data.forms.find(f => f.department_id === machine.department_id) || state.data.forms[0];
  if (!form) {
    container.innerHTML = `<div class="text-slate-400 p-3">ไม่พบแบบฟอร์มสำหรับเครื่องจักรนี้</div>`;
    return;
  }

  const allFields = [];
  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) {
      allFields.push({ ...f, section_title: sec.title });
    }
  }

  // Sort numeric CBM fields first because emergency entries are most often temperature / vibration / pressure / current
  allFields.sort((a, b) => (a.field_type === 'number_range' ? -1 : 1) - (b.field_type === 'number_range' ? -1 : 1));

  container.innerHTML = allFields.map(f => {
    const isNumeric = f.field_type === 'number_range';
    const minN = f.min_normal ?? 0;
    const maxN = f.max_normal ?? 100;
    const maxW = f.max_warning ?? 120;
    const unit = f.unit || '';
    const lastRec = getLastRecordedValueForField(machine.id, f.id);

    return `
      <div id="emg-row-${f.id}" class="p-3 rounded-xl bg-white border border-slate-200 hover:border-rose-400 transition space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <label class="flex items-center gap-2.5 cursor-pointer flex-1">
            <input type="checkbox" id="emg-chk-${f.id}" onchange="toggleEmergencyParamRow('${f.id}', this.checked)" class="rounded text-rose-600 w-4 h-4" />
            <div>
              <span class="font-bold text-slate-900">${f.label}</span>
              ${isNumeric ? `<span class="ml-1.5 px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">🔢 ตัวเลข CBM (${unit})</span>` : ''}
              <div class="text-[10px] text-slate-400">
                ${isNumeric ? `เกณฑ์ปกติ: ${minN}–${maxN} ${unit} | เกิน ${maxW} ${unit} = ผิดปกติ` : (f.standard_opl || f.section_title)}
                ${lastRec ? ` • ค่าล่าสุด: <strong>${lastRec.value} ${unit}</strong>` : ''}
              </div>
            </div>
          </label>

          <div class="flex flex-wrap items-center gap-2">
            ${isNumeric ? `
              <div class="flex items-center gap-1">
                <input type="number" step="0.1" id="emg-val-${f.id}" placeholder="กรอกค่า (${unit})..."
                  oninput="onEmergencyNumericInput('${f.id}', this.value, ${minN}, ${maxN}, ${maxW}, '${unit}', '${f.label.replace(/'/g, "\\'")}')"
                  class="w-32 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 font-extrabold text-slate-900 focus:border-rose-600 focus:outline-none" />
                <button type="button" onclick="stepEmergencyNumeric('${f.id}', 1, ${minN}, ${maxN}, ${maxW}, '${unit}', '${f.label.replace(/'/g, "\\'")}')" class="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-slate-700">+1</button>
              </div>
            ` : `
              <div class="flex items-center gap-1">
                <button type="button" onclick="setEmergencyVisualStatus('${f.id}', '${f.label.replace(/'/g, "\\'")}', 'ผิดปกติ (Fail)', 'abnormal')" id="emg-btn-abn-${f.id}" class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 border border-rose-200 font-bold">
                  🔴 ผิดปกติ
                </button>
                <button type="button" onclick="setEmergencyVisualStatus('${f.id}', '${f.label.replace(/'/g, "\\'")}', 'เฝ้าระวัง (Warning)', 'warning')" id="emg-btn-warn-${f.id}" class="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-500 hover:text-white text-amber-800 border border-amber-200 font-bold">
                  🟡 เฝ้าระวัง
                </button>
              </div>
            `}
            <span id="emg-badge-${f.id}"></span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleEmergencyParamRow(fieldId, checked) {
  const row = document.getElementById(`emg-row-${fieldId}`);
  if (row) {
    row.classList.toggle('border-rose-500', checked);
    row.classList.toggle('bg-rose-50/30', checked);
  }
  if (!checked) {
    delete emergencyQuickDraft.selected_fields[fieldId];
    const badge = document.getElementById(`emg-badge-${fieldId}`);
    if (badge) badge.innerHTML = '';
  }
}

function onEmergencyNumericInput(fieldId, rawVal, minNorm, maxNorm, maxWarn, unit, label) {
  const chk = document.getElementById(`emg-chk-${fieldId}`);
  if (rawVal === '') {
    if (chk) chk.checked = false;
    toggleEmergencyParamRow(fieldId, false);
    return;
  }
  if (chk && !chk.checked) {
    chk.checked = true;
    toggleEmergencyParamRow(fieldId, true);
  }
  const num = parseFloat(rawVal);
  let status = 'normal';
  if (!isNaN(num)) {
    if (num < minNorm || num > maxWarn) status = 'abnormal';
    else if (num > maxNorm) status = 'warning';
  }
  emergencyQuickDraft.selected_fields[fieldId] = {
    field_id: fieldId,
    label,
    value: rawVal,
    status,
    unit,
    checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
  };
  const badge = document.getElementById(`emg-badge-${fieldId}`);
  if (badge) badge.innerHTML = getHealthBadge(status);
}

function stepEmergencyNumeric(fieldId, delta, minNorm, maxNorm, maxWarn, unit, label) {
  const input = document.getElementById(`emg-val-${fieldId}`);
  if (!input) return;
  const cur = input.value !== '' ? parseFloat(input.value) : maxWarn;
  const next = Number((cur + delta).toFixed(1));
  input.value = next;
  onEmergencyNumericInput(fieldId, String(next), minNorm, maxNorm, maxWarn, unit, label);
}

function setEmergencyVisualStatus(fieldId, label, valueText, status) {
  const chk = document.getElementById(`emg-chk-${fieldId}`);
  if (chk) {
    chk.checked = true;
    toggleEmergencyParamRow(fieldId, true);
  }
  emergencyQuickDraft.selected_fields[fieldId] = {
    field_id: fieldId,
    label,
    value: valueText,
    status,
    unit: '',
    checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
  };
  const badge = document.getElementById(`emg-badge-${fieldId}`);
  if (badge) badge.innerHTML = getHealthBadge(status);
}

async function onEmergencyPhotoUpload(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  try { emergencyQuickDraft.photo_data = await compressImageFile(file); const st = document.getElementById('emg-photo-status'); if (st) st.textContent = 'แนบรูปแล้ว'; } catch (err) { showToast(err.message, 'error'); }
}

async function submitEmergencyQuickEntry(e) {
  e.preventDefault();
  const machineId = Number(document.getElementById('emg-machine-select').value);
  const machine = state.data.machines.find(m => m.id === machineId) || state.data.machines[0];
  const form = state.data.forms.find(f => f.department_id === machine.department_id) || state.data.forms[0];

  const customLabel = document.getElementById('emg-custom-label').value.trim();
  const customVal = document.getElementById('emg-custom-val').value.trim();
  const customStatus = document.getElementById('emg-custom-status').value;
  const symptomNote = document.getElementById('emg-symptom-note').value.trim();
  const forceOpenDefect = document.getElementById('emg-open-defect').checked;

  const answersArray = Object.values(emergencyQuickDraft.selected_fields).map(a => ({
    ...a,
    remark: symptomNote || a.remark || 'บันทึกค่าด่วนเฉพาะจุด',
    photo: emergencyQuickDraft.photo_data || ''
  }));

  if (customLabel || customVal) {
    answersArray.push({
      field_id: 'f_adhoc_' + Date.now(),
      label: customLabel || 'รายการตรวจสอบฉุกเฉินหน้างาน',
      value: customVal || 'พบอาการผิดปกติหน้างาน',
      status: customStatus,
      unit: '',
      remark: symptomNote,
      photo: emergencyQuickDraft.photo_data || '',
      checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
    });
  }

  if (answersArray.length === 0 && symptomNote) {
    answersArray.push({
      field_id: 'f_emergency_note',
      label: 'แจ้งเหตุผิดปกติเร่งด่วนหน้างาน (Emergency Observation)',
      value: symptomNote,
      status: forceOpenDefect ? 'abnormal' : 'warning',
      unit: '',
      remark: symptomNote,
      photo: emergencyQuickDraft.photo_data || '',
      checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
    });
  }

  if (answersArray.length === 0) {
    showToast('กรุณาเลือกกรอกอย่างน้อย 1 ค่าพารามิเตอร์ หรือระบุอาการผิดปกติที่พบ', 'warning');
    return;
  }

  try {
    const res = await apiRequest('/api/inspections', 'POST', {
      machine_id: machine.id,
      form_id: form ? form.id : 1,
      department_id: machine.department_id,
      inspection_type: 'emergency_quick',
      co_inspectors: [state.activeUser?.full_name || 'สมชาย ใจเพชร'],
      inspector_name: state.activeUser?.full_name || 'สมชาย ใจเพชร',
      inspector_code: state.activeUser?.emp_code || 'EMP-1002',
      shift: state.inspectSession.shift,
      machine_state_at_check: machine.operating_state || 'running',
      checkin_method: 'emergency_quick_entry',
      answers: answersArray,
      inspector_note: `[⚡ บันทึกฉุกเฉินเฉพาะจุด] ${symptomNote || 'ลงค่าพารามิเตอร์เร่งด่วนหน้างาน'}`,
      force_open_defect: forceOpenDefect
    });

    closeModal();
    updateStateData(res.data);

    if (res.queued) { showToast('เก็บรายการฉุกเฉินในเครื่องแล้ว รอส่งฐานกลาง ยังไม่ได้เปิดใบซ่อมกลาง', 'warning'); return; }
    if (emergencyQuickDraft.queuedReviewId) { await ComisStore.remove('queue', emergencyQuickDraft.queuedReviewId); emergencyQuickDraft.queuedReviewId=null; }
    if (res.created_ticket_no) {
      showToast(`⚡ บันทึกค่าฉุกเฉิน ${res.doc_no} และเปิดใบแจ้งซ่อมด่วน ${res.created_ticket_no} ทันที!`, 'warning');
    } else {
      showToast(`⚡ บันทึกค่าเฉพาะจุด ${res.doc_no} เข้าสู่ระบบและกราฟแนวโน้มสำเร็จ!`, 'success');
    }
    renderCurrentTab();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// ============================================================================
// 8. SYSTEM ACTIVITY LOG & POINT-IN-TIME UNDO / ROLLBACK CENTER (v2.1.0)
// ============================================================================
window.recordSystemAuditLog = async function (meta = {}) {
  try {
    const res = await apiRequest('/api/audit-logs/client-event', 'POST', {
      actor_name: state.activeUser?.full_name || 'System Admin',
      action_type: meta.action || 'UPDATE',
      target_type: meta.entity === 'machinePlacements' ? '3D_PLACEMENT' : (meta.entity || 'SYSTEM'),
      target_name: meta.target_id || '-',
      detail: meta.details || '',
      undo_payload: {
        entity: meta.entity || 'custom',
        target_id: meta.target_id,
        before_data: meta.before_data,
        after_data: meta.after_data
      }
    });
    if (res && res.data) {
      state.data = res.data;
      syncHeaderAndSidebar();
    }
  } catch (e) {
    console.warn('Failed to record client audit log:', e);
  }
};

window.undoSystemAuditLog = async function (logId) {
  const logItem = (state.data.auditLogs || []).find(x => Number(x.id) === Number(logId));
  if (!logItem) {
    showToast('ไม่พบรายการประวัติที่ต้องการย้อนข้อมูลกลับ', 'error');
    return;
  }

  const confirmMsg =
    `ยืนยันการย้อนข้อมูลกลับ (Undo / Rollback)?\n\n` +
    `• รายการ: [${logItem.action_type}] ${logItem.target_name}\n` +
    `• ผู้ทำรายการเดิม: ${logItem.actor_name} (${logItem.created_at})\n\n` +
    `ระบบจะกู้คืนฐานข้อมูลกลับไปสู่สถานะก่อนทำรายการนี้ทันที (และสามารถกดยกเลิกการย้อนกลับได้ภายหลัง)`;

  if (!confirm(confirmMsg)) return;

  try {
    const res = await apiRequest(`/api/audit-logs/${logId}/undo`, 'POST', {
      actor: state.activeUser?.full_name || 'System Admin'
    });

    // If this was a 3D machine placement update, also restore the placement in localStorage
    const undoPayload = res.undo_payload || logItem.undo_payload;
    if (undoPayload && undoPayload.entity === 'machinePlacements' && undoPayload.target_id) {
      try {
        const key = 'esc_machine_placements_v21';
        const raw = localStorage.getItem(key);
        const list = raw ? JSON.parse(raw) : [];
        const filtered = Array.isArray(list) ? list.filter(x => x.machineCode !== undoPayload.target_id) : [];
        if (undoPayload.before_data) {
          filtered.push(undoPayload.before_data);
        }
        localStorage.setItem(key, JSON.stringify(filtered));
      } catch (_) {}
    }

    updateStateData(res.data);
    showToast(`⏪ ย้อนข้อมูลกลับรายการ "${logItem.target_name}" สำเร็จเรียบร้อยแล้ว!`, 'success');
  } catch (err) {
    showToast(err.message || 'ไม่สามารถย้อนข้อมูลกลับได้', 'error');
  }
};

function openAuditSnapshotDetailModal(logId) {
  const logItem = (state.data.auditLogs || []).find(x => Number(x.id) === Number(logId));
  if (!logItem) return;

  const undoPayload = logItem.undo_payload || {};
  if (Array.isArray(undoPayload.changes)) {
    openModal('รายละเอียดการเปลี่ยนข้อมูลเฉพาะรายการ', '<p>การย้อนจะตรวจว่ารายการต่อไปนี้ยังไม่ถูกแก้ไขภายหลัง และรักษารายการอื่นไว้</p><pre id="comis-audit-changes" style="white-space:pre-wrap;overflow-wrap:anywhere"></pre>');
    document.getElementById('comis-audit-changes').textContent=JSON.stringify(undoPayload.changes,null,2);
    return;
  }
  const snap = undoPayload.snapshot_before;

  let summaryHtml = '';
  if (snap) {
    const mCount = (snap.machines || []).length;
    const iCount = (snap.inspections || []).length;
    const dCount = (snap.defects || snap.defect_tickets || []).length;
    const fCount = (snap.forms || snap.form_templates || []).length;
    const rCount = (snap.routes || snap.inspection_routes || []).length;
    summaryHtml = `
      <div class="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
          <div class="text-[11px] text-slate-500">เครื่องจักร</div>
          <div class="text-base font-extrabold text-slate-800">${mCount} เครื่อง</div>
        </div>
        <div class="p-3 rounded-xl bg-blue-50 border border-blue-200 text-center">
          <div class="text-[11px] text-blue-700">ใบตรวจเช็ค</div>
          <div class="text-base font-extrabold text-blue-800">${iCount} ใบ</div>
        </div>
        <div class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
          <div class="text-[11px] text-rose-700">ใบแจ้งซ่อม</div>
          <div class="text-base font-extrabold text-rose-800">${dCount} ใบ</div>
        </div>
        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
          <div class="text-[11px] text-emerald-700">แม่แบบฟอร์ม</div>
          <div class="text-base font-extrabold text-emerald-800">${fCount} ฟอร์ม</div>
        </div>
        <div class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
          <div class="text-[11px] text-amber-800">สายเดินตรวจ</div>
          <div class="text-base font-extrabold text-amber-900">${rCount} สาย</div>
        </div>
      </div>
    `;
  } else if (undoPayload.entity === 'machinePlacements') {
    summaryHtml = `
      <div class="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
        <div><strong>ก่อนแก้ไข:</strong> โซน <code>${undoPayload.before_data?.zoneId || 'ยังไม่ระบุพื้นที่'}</code> (${undoPayload.before_data?.bayLabel || '-'})</div>
        <div><strong>หลังแก้ไข:</strong> โซน <code>${undoPayload.after_data?.zoneId || 'ยังไม่ระบุพื้นที่'}</code> (${undoPayload.after_data?.bayLabel || '-'})</div>
      </div>
    `;
  }

  openModal(
    `🔍 รายละเอียดประวัติ & จุดย้อนข้อมูล (Log #${logItem.id})`,
    `
      <div class="space-y-4 text-xs">
        <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <span class="font-mono font-bold text-slate-800">ประเภทคำสั่ง: ${logItem.action_type} (${logItem.target_type})</span>
            <span class="text-slate-500">🕒 ${logItem.created_at}</span>
          </div>
          <div class="text-sm font-bold text-slate-900">${logItem.target_name}</div>
          <div class="text-slate-600">${logItem.detail || '-'}</div>
          <div class="text-slate-500 pt-1">👤 ผู้ดำเนินการ: <strong>${logItem.actor_name}</strong></div>
        </div>

        ${summaryHtml ? `
          <div>
            <h4 class="font-bold text-slate-700 mb-2">📦 สถานะข้อมูลที่บันทึกไว้ก่อนทำรายการนี้ (Snapshot Before Action):</h4>
            ${summaryHtml}
          </div>
        ` : ''}

        <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
          <button type="button" onclick="closeModal()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold">ปิดหน้าต่าง</button>
          ${logItem.can_undo && !logItem.reverted ? `
            <button type="button" onclick="closeModal(); window.undoSystemAuditLog(${logItem.id});" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer">
              <i class="fa-solid fa-rotate-left"></i> ⏪ ย้อนข้อมูลกลับไปจุดนี้ทันที
            </button>
          ` : ''}
        </div>
      </div>
    `
  );
}

function renderAuditLogCenter(container) {
  const allLogs = state.data.auditLogs || [];
  const typeFilter = state.auditTypeFilter || 'ALL';
  const searchQ = (state.auditSearch || '').trim().toLowerCase();

  const filteredLogs = allLogs.filter(item => {
    if (typeFilter !== 'ALL') {
      if (typeFilter === 'UNDOABLE' && (!item.can_undo || item.reverted)) return false;
      if (typeFilter === 'REVERTED' && !item.reverted) return false;
      if (typeFilter !== 'UNDOABLE' && typeFilter !== 'REVERTED' && item.target_type !== typeFilter && item.action_type !== typeFilter) {
        return false;
      }
    }
    if (searchQ) {
      const hay = `${item.actor_name || ''} ${item.action_type || ''} ${item.target_type || ''} ${item.target_name || ''} ${item.detail || ''}`.toLowerCase();
      if (!hay.includes(searchQ)) return false;
    }
    return true;
  });

  const undoableCount = allLogs.filter(x => x.can_undo && !x.reverted).length;
  const revertedCount = allLogs.filter(x => x.reverted).length;

  const actionBadgeMap = {
    CREATE: { label: '➕ เพิ่มข้อมูล (CREATE)', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    UPDATE: { label: '✏️ แก้ไขข้อมูล (UPDATE)', cls: 'bg-blue-100 text-blue-800 border-blue-300' },
    DELETE: { label: '🗑️ ลบข้อมูล (DELETE)', cls: 'bg-rose-100 text-rose-800 border-rose-300' },
    CLONE: { label: '📑 คัดลอก (CLONE)', cls: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    SUBMIT_INSPECTION: { label: '📋 บันทึกผลตรวจเช็ค', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    EMERGENCY_QUICK_LOG: { label: '⚡ ลงค่าด่วนฉุกเฉิน', cls: 'bg-amber-100 text-amber-900 border-amber-300' },
    APPROVE: { label: '✅ อนุมัติใบตรวจเช็ค', cls: 'bg-teal-100 text-teal-800 border-teal-300' },
    START_ROUTE_ROUND: { label: '🚩 เริ่มรอบสายเดินตรวจ', cls: 'bg-sky-100 text-sky-800 border-sky-300' },
    JOIN_TEAM_ROUND: { label: '🤝 เข้าร่วมทีมตรวจ', cls: 'bg-purple-100 text-purple-800 border-purple-300' },
    SAVE_SHARED_PROGRESS: { label: '💾 พักบันทึกค่าร่วมตรวจ', cls: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
    UPDATE_3D_PLACEMENT: { label: '🗺️ อัปเดตพิกัดโซน 3D', cls: 'bg-amber-100 text-amber-800 border-amber-300' },
    BULK_IMPORT_CSV: { label: '📥 นำเข้าไฟล์ CSV (BULK IMPORT)', cls: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    UNDO_ROLLBACK: { label: '⏪ ย้อนข้อมูลกลับ (UNDO)', cls: 'bg-slate-800 text-amber-300 border-slate-700' },
    INIT_SYSTEM: { label: '🚀 เริ่มต้นระบบ', cls: 'bg-slate-100 text-slate-700 border-slate-300' }
  };

  container.innerHTML = `
    <div class="space-y-5">
      <!-- Top Explanation & KPI Cards -->
      <div class="bg-gradient-to-r from-[#0c2e07] via-[#154c0c] to-[#1f760e] rounded-2xl p-5 text-white shadow-md">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 text-xs font-bold">
              <i class="fa-solid fa-clock-rotate-left"></i> ระบบตรวจสอบประวัติการทำงานและย้อนข้อมูลกลับ (Audit Trail & Point-in-Time Recovery)
            </div>
            <h2 class="text-lg font-extrabold mt-1">บันทึกทุกการกระทำในระบบ พร้อมปุ่มกู้คืนข้อมูลเมื่อทำผิดพลาด (1-Click Undo)</h2>
            <p class="text-xs text-emerald-100/90 max-w-3xl">
              ไม่ว่าจะเป็นการลงผลตรวจเช็คผิดเครื่อง การเผลอลบเครื่องจักร การแก้ไขแบบฟอร์ม การอัปเดตงานซ่อม หรือการย้ายพิกัดโซน 3D ระบบจะเก็บ Snapshot ก่อนทำรายการไว้ทั้งหมด สามารถกดปุ่ม <strong>"⏪ ย้อนข้อมูลกลับ"</strong> เพื่อคืนค่าเดิมได้ทันที
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-3">
            <div class="bg-black/25 px-4 py-2.5 rounded-xl border border-white/15 text-center">
              <div class="text-[11px] text-emerald-200">ประวัติทั้งหมด</div>
              <div class="text-xl font-black text-white">${allLogs.length}</div>
            </div>
            <div class="bg-amber-400/20 px-4 py-2.5 rounded-xl border border-amber-300/30 text-center">
              <div class="text-[11px] text-amber-200">พร้อมย้อนกลับได้</div>
              <div class="text-xl font-black text-amber-300">${undoableCount}</div>
            </div>
            <div class="bg-black/25 px-4 py-2.5 rounded-xl border border-white/15 text-center">
              <div class="text-[11px] text-emerald-200">ย้อนกลับแล้ว</div>
              <div class="text-xl font-black text-emerald-300">${revertedCount}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter & Search Bar -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="relative flex-1 min-w-[240px]">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input type="text" value="${(state.auditSearch || '').replace(/"/g, '&quot;')}"
              oninput="state.auditSearch = this.value; renderCurrentTab();"
              placeholder="ค้นหาชื่อผู้ทำรายการ, รหัสเครื่องจักร, เลขที่ใบตรวจ, รายละเอียดการแก้ไข..."
              class="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-[#1f760e] focus:bg-white" />
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <select onchange="state.auditTypeFilter = this.value; renderCurrentTab();"
              class="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-bold text-slate-700">
              <option value="ALL" ${typeFilter === 'ALL' ? 'selected' : ''}>📋 แสดงทุกประเภทกิจกรรม (${allLogs.length})</option>
              <option value="UNDOABLE" ${typeFilter === 'UNDOABLE' ? 'selected' : ''}>⏪ เฉพาะรายการที่ย้อนข้อมูลกลับได้ (${undoableCount})</option>
              <option value="REVERTED" ${typeFilter === 'REVERTED' ? 'selected' : ''}>✅ รายการที่ย้อนกลับไปแล้ว (${revertedCount})</option>
              <option value="INSPECTION" ${typeFilter === 'INSPECTION' ? 'selected' : ''}>📋 การตรวจเช็คเครื่องจักร (INSPECTION)</option>
              <option value="MACHINE" ${typeFilter === 'MACHINE' ? 'selected' : ''}>⚙️ ทะเบียนเครื่องจักร (MACHINE)</option>
              <option value="DEFECT_TICKET" ${typeFilter === 'DEFECT_TICKET' ? 'selected' : ''}>🚨 ใบแจ้งซ่อม / F-Tag (DEFECT)</option>
              <option value="FORM_TEMPLATE" ${typeFilter === 'FORM_TEMPLATE' ? 'selected' : ''}>📝 แม่แบบฟอร์ม (FORM)</option>
              <option value="INSPECTION_ROUTE" ${typeFilter === 'INSPECTION_ROUTE' ? 'selected' : ''}>🗺️ สายเดินตรวจ (ROUTE)</option>
              <option value="ROUTE_ROUND" ${typeFilter === 'ROUTE_ROUND' ? 'selected' : ''}>🚩 รอบเดินตรวจของทีม (ROUND)</option>
              <option value="3D_PLACEMENT" ${typeFilter === '3D_PLACEMENT' ? 'selected' : ''}>🏭 พิกัดโซนโรงงาน 3D</option>
              <option value="DEPARTMENT" ${typeFilter === 'DEPARTMENT' ? 'selected' : ''}>🏢 แผนก (DEPARTMENT)</option>
              <option value="USER" ${typeFilter === 'USER' ? 'selected' : ''}>👥 ผู้ใช้งาน (USER)</option>
            </select>
          </div>
        </div>

        <!-- Activity Timeline Table -->
        <div class="space-y-3">
          ${filteredLogs.length === 0 ? `
            <div class="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-sm">
              ไม่พบรายการประวัติการทำงานที่ตรงกับตัวกรอง
            </div>
          ` : filteredLogs.map((log, idx) => {
            const badge = actionBadgeMap[log.action_type] || {
              label: log.action_type,
              cls: 'bg-slate-100 text-slate-700 border-slate-300'
            };
            const canUndoNow = Boolean(log.can_undo) && !log.reverted;

            return `
              <div class="rounded-2xl border ${log.reverted ? 'border-slate-200 bg-slate-50/70 opacity-80' : canUndoNow ? 'border-slate-200 hover:border-emerald-400 bg-white' : 'border-slate-200 bg-white'} p-4 transition shadow-2xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div class="space-y-1.5 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="font-mono text-[11px] font-bold text-slate-400">#${allLogs.length - idx}</span>
                    <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border ${badge.cls}">${badge.label}</span>
                    <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200">${log.target_type}</span>
                    <span class="font-bold text-sm text-slate-900">${log.target_name}</span>
                    ${log.reverted ? `
                      <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold">
                        ✅ ย้อนข้อมูลกลับแล้ว (${log.reverted_at || ''})
                      </span>
                    ` : ''}
                  </div>

                  <p class="text-xs text-slate-600">${log.detail || `ดำเนินการ ${log.action_type} บน ${log.target_name}`}</p>

                  <div class="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                    <span>👤 ผู้ทำรายการ: <strong class="text-slate-700">${log.actor_name || 'System Admin'}</strong></span>
                    <span>🕒 เวลา: <strong class="text-slate-600">${log.created_at}</strong></span>
                    ${log.reverted_by ? `<span>⏪ ย้อนกลับโดย: <strong class="text-emerald-700">${log.reverted_by}</strong></span>` : ''}
                  </div>
                </div>

                <div class="flex flex-wrap items-center gap-2 self-end lg:self-center shrink-0">
                  <button type="button" onclick="openAuditSnapshotDetailModal(${log.id})"
                    class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition">
                    <i class="fa-solid fa-eye"></i> ดูรายละเอียด
                  </button>
                  ${canUndoNow ? `
                    <button type="button" onclick="window.undoSystemAuditLog(${log.id})"
                      class="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 border border-amber-500 text-xs font-extrabold flex items-center gap-1.5 shadow-xs cursor-pointer transition">
                      <i class="fa-solid fa-rotate-left"></i> ⏪ ย้อนข้อมูลกลับ (Undo)
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// 11. CSV BULK IMPORT & TEMPLATE DOWNLOAD CENTER (v2.2.0)
// ============================================================================
const CSV_TEMPLATE_CONFIGS = {
  machines: {
    title: '⚙️ ทะเบียนเครื่องจักร (Machines Master CSV)',
    filename: 'ESC_Template_Machines.csv',
    keyCol: 'machine_code',
    headers: ['machine_code', 'name', 'department_code', 'plant_area', 'category', 'brand', 'model', 'criticality', 'operating_state', 'health_status', 'running_hours'],
    sampleRows: [
      ['ML-TTP-01', 'ดั๊มพ์ เบอร์ 1 (Hydraulic Truck Tipper No.1)', 'ML', 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', 'Hydraulic System', '', '', 'A', 'running', 'normal', '0'],
      ['ML-SHR-01', 'เครื่องเชร็ดเดอร์ (Heavy Duty Shredder)', 'ML', 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', 'Heavy Duty Shredder', '', '', 'A', 'running', 'normal', '0'],
      ['ML-MIL-02', 'ลูกหีบ ชุดที่ 2 (Mill No.2)', 'ML', 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', 'Milling Tandem Unit', '', '', 'A', 'pending_repair', 'warning', '0']
    ],
    desc: 'เพิ่มหรืออัปเดตเครื่องจักรทีละหลายเครื่อง (รหัสแผนก department_code เฉพาะ 10 แผนก: EP, VP, CF, WP, ML, MA, EBL, EM, ME, EPP; operating_state: running, standby, pending_repair, under_repair)'
  },
  routes: {
    title: '🗺️ สายเดินตรวจตามลำดับเครื่องจักร (Inspection Routes CSV)',
    filename: 'ESC_Template_Routes.csv',
    keyCol: 'route_code',
    headers: ['route_code', 'name', 'department_code', 'shift_name', 'shift_window', 'estimated_minutes', 'machine_codes', 'team_inspectors', 'description'],
    sampleRows: [
      ['RT-ML-01', 'สายเดินตรวจเครื่องจักรแผนกลูกหีบตามลำดับการผลิต', 'ML', 'กะเช้า (07:00-19:00)', '07:30 - 09:30 น.', '90', 'ML-TTP-01|ML-CAR-01|ML-MCC-01|ML-TUR-01|ML-SHR-01|ML-MIL-02', 'วศ.ประจักษ์ (System Center Admin)', 'เดินตรวจตามลำดับจากรางดั๊มพ์ สะพานเมน เชร็ดเดอร์ เข้าสู่ชุดลูกหีบ']
    ],
    desc: 'คั่นรหัสเครื่องจักรตามลำดับด้วยเครื่องหมาย | (เช่น ML-01|ML-06|ML-12|ML-19|ML-29) และคั่นรายชื่อทีมช่างด้วย |'
  },
  departments: {
    title: '🏢 แผนกและกลุ่มฝ่ายต้นสังกัด (Departments CSV: กลุ่มฝ่าย >> แผนก)',
    filename: 'ESC_Template_Departments.csv',
    keyCol: 'code',
    headers: ['code', 'name', 'plant_name', 'manager_name', 'color', 'description'],
    sampleRows: [
      ['ML', 'แผนกลูกหีบ', 'ฝ่ายวิศวกรรมจักรกล (EN)', 'หัวหน้าแผนกลูกหีบ', '#15803d', 'ดูแลเครื่องจักรชุดลูกหีบสกัดน้ำอ้อย สะพานลำเลียงอ้อย มีดสับอ้อย และเชร็ดเดอร์'],
      ['MA', 'แผนกเครื่องกลซ่อมบำรุง', 'ฝ่ายวิศวกรรมจักรกล (EN)', 'หัวหน้าแผนกเครื่องกลซ่อมบำรุง', '#2563eb', 'ดูแลงานซ่อมบำรุงเครื่องกล ปั๊ม ชุดเกียร์ ระบบไฮดรอลิก และการตรวจสอบสภาพเครื่องจักร (CBM/PM)'],
      ['EM', 'แผนกไฟฟ้าซ่อมบำรุง', 'ฝ่ายวิศวกรรมไฟฟ้า (EE)', 'หัวหน้าแผนกไฟฟ้าซ่อมบำรุง', '#ea580c', 'ดูแลบำรุงรักษามอเตอร์ไฟฟ้า ตู้ควบคุม MCC/MDB อินเวอร์เตอร์ (VFD) และระบบไฟฟ้ากำลัง']
    ],
    desc: 'แยกเฉพาะ 10 แผนกปฏิบัติการ (EP, VP, CF, WP, ML, MA, EBL, EM, ME, EPP) โดยระบุกลุ่มฝ่ายในคอลัมน์ plant_name (ฝ่ายผลิต (PD), ฝ่ายวิศวกรรมจักรกล (EN), ฝ่ายวิศวกรรมไฟฟ้า (EE))'
  },
  users: {
    title: '👥 ผู้ใช้งานและทีมช่างตรวจเช็ค (Users & Inspectors CSV)',
    filename: 'ESC_Template_Users.csv',
    keyCol: 'emp_code',
    headers: ['emp_code', 'full_name', 'role', 'department_code', 'position', 'phone', 'email'],
    sampleRows: [
      ['EMP-1006', 'วีระพงศ์ ชำนาญกล', 'inspector', 'MA', 'ช่างเทคนิคเครื่องกล อาวุโส', '081-555-0106', 'weerapong@esgroup.co.th'],
      ['EMP-1007', 'ธนกร ดูแลหม้อน้ำ', 'inspector', 'EBL', 'ช่างเดินเครื่องหม้อไอน้ำ', '081-555-0107', 'thanakorn@esgroup.co.th']
    ],
    desc: 'สิทธิ์ role ที่รองรับ: inspector, dept_admin, super_admin, viewer • รหัสแผนก department_code เฉพาะ 10 แผนก (EP, VP, CF, WP, ML, MA, EBL, EM, ME, EPP)'
  }
};

function downloadCsvTemplate(type = 'machines') {
  const cfg = CSV_TEMPLATE_CONFIGS[type] || CSV_TEMPLATE_CONFIGS.machines;
  downloadCSV(cfg.filename, [cfg.headers, ...cfg.sampleRows]);
  showToast(`📥 ดาวน์โหลดไฟล์เทมเพลต ${cfg.filename} สำเร็จ! เปิดแก้ไขใน Excel แล้วอัปโหลดกลับมาได้เลย`, 'success');
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCsvToObjects(rawText) {
  const cleaned = String(rawText || '').replace(/^\uFEFF/, '').trim();
  if (!cleaned) return [];
  const records = ComisDomain.csvRows(cleaned); if (records.length < 2) return [];
  const headers = records.shift().map(h => h.trim());
  if (new Set(headers).size !== headers.length) throw new Error('ชื่อคอลัมน์ CSV ซ้ำ');
  return records.map((cols, i) => { if(cols.length !== headers.length) throw new Error('จำนวนคอลัมน์ CSV แถว ' + (i + 2) + ' ไม่ตรงหัวตาราง'); return Object.fromEntries(headers.map((h,j) => [h,cols[j]])); });
}

function checkCsvRowExists(type, row) {
  if (type === 'machines') {
    const code = String(row.machine_code || row['รหัสเครื่องจักร'] || '').trim().toUpperCase();
    return (state.data.machines || []).some(m => m.machine_code.toUpperCase() === code);
  }
  if (type === 'routes') {
    const code = String(row.route_code || row['รหัสสายตรวจ'] || '').trim().toUpperCase();
    return (state.data.routes || []).some(r => r.route_code.toUpperCase() === code);
  }
  if (type === 'departments') {
    const code = String(row.code || row.department_code || row['รหัสแผนก'] || '').trim().toUpperCase();
    return (state.data.departments || []).some(d => d.code.toUpperCase() === code);
  }
  if (type === 'users') {
    const code = String(row.emp_code || row['รหัสพนักงาน'] || '').trim().toUpperCase();
    return (state.data.users || []).some(u => u.emp_code.toUpperCase() === code);
  }
  return false;
}

function loadSampleCsvIntoEditor(type) {
  const cfg = CSV_TEMPLATE_CONFIGS[type || state.csvImportType] || CSV_TEMPLATE_CONFIGS.machines;
  const text = [cfg.headers, ...cfg.sampleRows]
    .map(r => r.map(c => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n');
  state.csvImportType = type || state.csvImportType;
  state.csvRawText = text;
  state.csvPreviewRows = parseCsvToObjects(text);
  const txtEl = document.getElementById('csv-raw-textarea');
  if (txtEl) txtEl.value = text;
  renderCsvPreviewTable();
  showToast('📋 โหลดข้อมูลตัวอย่างลงช่องตรวจสอบแล้ว สามารถแก้ไขหรือกดนำเข้าได้ทันที', 'info');
}

function onChangeCsvEntityType(newType) {
  state.csvImportType = newType;
  state.csvRawText = '';
  state.csvPreviewRows = [];
  if (state.activeTab === 'csvimport') {
    renderCurrentTab();
  } else {
    openCsvImportModal(newType);
  }
}

function handleCsvFileUpload(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const content = e.target.result || '';
    state.csvRawText = content;
    state.csvPreviewRows = parseCsvToObjects(content);
    const txtEl = document.getElementById('csv-raw-textarea');
    if (txtEl) txtEl.value = content;
    renderCsvPreviewTable();
    showToast(`📂 อ่านไฟล์ "${file.name}" สำเร็จ (${state.csvPreviewRows.length} รายการ)`, 'success');
  };
  reader.readAsText(file, 'utf-8');
}

function onCsvTextareaInput(val) {
  state.csvRawText = val;
  try { state.csvPreviewRows = parseCsvToObjects(val); } catch (err) { state.csvPreviewRows = []; showToast(err.message, 'error'); }
  renderCsvPreviewTable();
}

function renderCsvPreviewTable() {
  const box = document.getElementById('csv-preview-box');
  if (!box) return;
  const type = state.csvImportType || 'machines';
  const rows = state.csvPreviewRows || [];

  if (rows.length === 0) {
    box.innerHTML = `
      <div class="p-6 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-400">
        ยังไม่มีข้อมูลพรีวิว — กรุณาอัปโหลดไฟล์ <code>.csv</code> หรือกดปุ่ม <strong>"✨ ทดลองโหลดข้อมูลตัวอย่าง"</strong> ด้านบน
      </div>
    `;
    return;
  }

  const headers = Object.keys(rows[0]);
  let insertCount = 0;
  let updateCount = 0;
  rows.forEach(r => {
    if (checkCsvRowExists(type, r)) updateCount++;
    else insertCount++;
  });

  box.innerHTML = `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 text-xs">
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-extrabold text-slate-800">🔍 พรีวิวข้อมูลก่อนนำเข้า: ทั้งหมด <strong>${rows.length}</strong> แถว</span>
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold">➕ เพิ่มใหม่ (INSERT): ${insertCount}</span>
          <span class="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold">🔄 อัปเดตข้อมูลเดิม (UPDATE): ${updateCount}</span>
        </div>
        <button type="button" onclick="confirmCsvBulkImport()" class="px-4 py-2 rounded-xl bg-[#1f760e] hover:bg-[#154c0c] text-white font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer">
          ✅ ยืนยันนำเข้าข้อมูลทั้ง ${rows.length} รายการเข้าสู่ระบบ
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-slate-200 max-h-72">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-slate-800 text-white">
              <th class="py-2 px-3">#</th>
              <th class="py-2 px-3">สถานะ</th>
              ${headers.map(h => `<th class="py-2 px-3 font-mono">${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 bg-white">
            ${rows.map((r, i) => {
              const isUpd = checkCsvRowExists(type, r);
              return `
                <tr class="hover:bg-slate-50">
                  <td class="py-2 px-3 font-bold text-slate-400">${i + 1}</td>
                  <td class="py-2 px-3">
                    ${isUpd
                      ? `<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">UPDATE</span>`
                      : `<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">NEW</span>`
                    }
                  </td>
                  ${headers.map(h => `<td class="py-2 px-3 font-medium text-slate-700">${r[h] || '-'}</td>`).join('')}
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function confirmCsvBulkImport() {
  const type = state.csvImportType || 'machines';
  const rows = state.csvPreviewRows || [];
  if (rows.length === 0) {
    showToast('กรุณาเลือกไฟล์ CSV หรือวางข้อมูล CSV ก่อนกดนำเข้า', 'warning');
    return;
  }

  try {
    const res = await apiRequest('/api/csv-import', 'POST', {
      type,
      rows,
      actor: state.activeUser?.full_name || 'System Admin'
    });
    closeModal();
    state.csvRawText = '';
    state.csvPreviewRows = [];
    updateStateData(res.data);
    showToast(
      `🎉 นำเข้าข้อมูล CSV (${type}) สำเร็จ! เพิ่มใหม่ ${res.insertedCount || 0} รายการ • อัปเดต ${res.updatedCount || 0} รายการ (ย้อนกลับได้ในหน้า Log)`,
      'success'
    );
  } catch (err) {
    showToast(err.message || 'เกิดข้อผิดพลาดในการนำเข้า CSV', 'error');
  }
}

function buildCsvImporterHtml(type) {
  const cfg = CSV_TEMPLATE_CONFIGS[type] || CSV_TEMPLATE_CONFIGS.machines;
  return `
    <div class="space-y-5 text-xs">
      <!-- Step 1: Select Entity Type & Download Template -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
        ${Object.entries(CSV_TEMPLATE_CONFIGS).map(([k, item]) => {
          const active = k === type;
          return `
            <div onclick="onChangeCsvEntityType('${k}')"
              class="cursor-pointer rounded-2xl p-4 border-2 transition flex flex-col justify-between ${
                active ? 'border-[#1f760e] bg-emerald-50/70 shadow-xs' : 'border-slate-200 bg-white hover:border-emerald-300'
              }">
              <div>
                <div class="flex items-center justify-between gap-2">
                  <span class="font-extrabold text-sm text-slate-900">${item.title.split('(')[0]}</span>
                  ${active ? `<span class="px-2 py-0.5 rounded-full bg-[#1f760e] text-white text-[10px] font-bold">เลือกอยู่</span>` : ''}
                </div>
                <p class="text-[11px] text-slate-500 mt-1">${item.desc}</p>
              </div>
              <div class="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between">
                <span class="font-mono text-[10px] text-slate-400">Key: ${item.keyCol}</span>
                <button type="button" onclick="event.stopPropagation(); downloadCsvTemplate('${k}');"
                  class="px-2.5 py-1 rounded-lg bg-[#1f760e] hover:bg-[#154c0c] text-white font-bold text-[11px] cursor-pointer">
                  📥 โหลดเทมเพลต
                </button>
              </div>
            </div>
          `;
        }).join('')}
      </div>

      <!-- Step 2: Template Column Guide & Upload Box -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 class="font-extrabold text-slate-800 text-sm">${cfg.title}</h3>
            <p class="text-xs text-slate-500">คอลัมน์มาตรฐานในไฟล์เทมเพลต: <code class="px-2 py-0.5 rounded bg-slate-100 text-emerald-800 font-bold">${cfg.headers.join(', ')}</code></p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="downloadCsvTemplate('${type}')" class="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer">
              📥 1. ดาวน์โหลดไฟล์เทมเพลต (${cfg.filename})
            </button>
            <button type="button" onclick="loadSampleCsvIntoEditor('${type}')" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer">
              ✨ ทดลองโหลดข้อมูลตัวอย่าง
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <!-- File Upload Dropzone -->
          <label class="border-2 border-dashed border-emerald-400 hover:border-[#1f760e] bg-emerald-50/40 rounded-2xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition space-y-2">
            <div class="w-12 h-12 rounded-2xl bg-[#1f760e] text-white flex items-center justify-center text-lg font-bold shadow-sm">
              📤
            </div>
            <div class="font-extrabold text-slate-800 text-sm">2. คลิกเลือกไฟล์ .CSV ที่กรอกข้อมูลแล้วเพื่ออัปโหลด</div>
            <p class="text-[11px] text-slate-500">รองรับไฟล์ CSV (UTF-8) จาก Microsoft Excel, Google Sheets หรือ Notepad</p>
            <input type="file" accept=".csv,text/csv" class="hidden" onchange="handleCsvFileUpload(this)" />
          </label>

          <!-- Direct Paste / Edit CSV Textarea -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="font-bold text-slate-700">หรือวางข้อมูลจาก Excel / แก้ไข CSV โดยตรงด้านล่าง:</label>
              <span class="text-[11px] text-slate-400">บรรทัดแรกต้องเป็นหัวคอลัมน์ (Header)</span>
            </div>
            <textarea id="csv-raw-textarea" rows="5" oninput="onCsvTextareaInput(this.value)"
              placeholder="${cfg.headers.join(',')}\n${cfg.sampleRows[0].join(',')}"
              class="w-full font-mono text-[11px] bg-slate-50 border border-slate-300 rounded-xl p-3 focus:outline-none focus:border-[#1f760e]">${state.csvRawText || ''}</textarea>
          </div>
        </div>

        <!-- Step 3: Live Preview & Confirm Button -->
        <div id="csv-preview-box" class="pt-2"></div>
      </div>
    </div>
  `;
}

function renderCsvImportCenter(container) {
  const type = state.csvImportType || 'machines';
  container.innerHTML = `
    <div class="space-y-5">
      <div class="bg-gradient-to-r from-[#0c2e07] via-[#154c0c] to-[#1f760e] rounded-2xl p-5 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold">
            📥 CSV BULK IMPORT & TEMPLATE CENTER
          </div>
          <h2 class="text-lg font-extrabold mt-1">ศูนย์เพิ่มและอัปเดตข้อมูลจำนวนมากด้วยไฟล์ CSV (พร้อมดาวน์โหลดเทมเพลตมาตรฐาน)</h2>
          <p class="text-xs text-emerald-100/90">
            ดาวน์โหลดเทมเพลต CSV ไปกรอกใน Excel แล้วอัปโหลดกลับมาเพื่อเพิ่ม เครื่องจักร, สายเดินตรวจ, แผนก หรือผู้ใช้งาน ทีละหลายรายการ (บันทึก Snapshot ย้อนกลับได้ 100%)
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="downloadCsvTemplate('${type}')" class="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm cursor-pointer">
            📥 ดาวน์โหลดเทมเพลต CSV ปัจจุบัน
          </button>
          <button onclick="switchTab('auditlog')" class="px-3.5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold cursor-pointer">
            ⏪ ดูประวัติการนำเข้า / ย้อนข้อมูลกลับ
          </button>
        </div>
      </div>

      ${buildCsvImporterHtml(type)}
    </div>
  `;
  renderCsvPreviewTable();
}

function openCsvImportModal(defaultType = 'machines') {
  state.csvImportType = defaultType;
  openModal('📥 ดาวน์โหลดเทมเพลต & อัปโหลดข้อมูลด้วยไฟล์ CSV (Bulk CSV Import)', buildCsvImporterHtml(defaultType));
  renderCsvPreviewTable();
}
