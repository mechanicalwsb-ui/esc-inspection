// Escape dynamic text and quoted attributes before inserting report HTML.
function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

// Inspection form, measurement rules, photos and signatures.
function startInspectionForMachine(machineId, routeId = null, routeRoundId = null) {
  state.inspectSession.queuedReviewId = null;
  if (machineId) {
    state.inspectSession.machine_id = Number(machineId);
    const machine = state.data.machines.find(m => m.id === Number(machineId));
    if (machine) {
      state.inspectSession.machine_state_at_check = machine.operating_state || 'running';
      const matchingForm = state.data.forms.find(f => f.department_id === machine.department_id) || state.data.forms[0];
      if (matchingForm) state.inspectSession.form_id = matchingForm.id;
    }
  }
  state.inspectSession.route_id = routeId ? Number(routeId) : null;
  state.inspectSession.route_round_id = routeRoundId ? Number(routeRoundId) : null;
  state.inspectSession.route_revision = state.data.revisions?.[`/api/route-rounds/${routeRoundId}`] || 0;
  state.inspectSession.answers = {};
  state.inspectSession.inspector_note = '';
  state.inspectSession.co_inspectors = [];

  // Load shared draft answers if inspecting as part of a multi-inspector route round
  if (state.inspectSession.route_round_id) {
    const round = (state.data.routeRounds || []).find(r => r.id === state.inspectSession.route_round_id);
    if (round) {
      state.inspectSession.route_id = round.route_id;
      state.inspectSession.shift = round.shift || state.inspectSession.shift;
      const stopProgress = (round.stops_progress || []).find(s => Number(s.machine_id) === Number(state.inspectSession.machine_id));
      if (stopProgress && stopProgress.form_id) {
        state.inspectSession.form_id = Number(stopProgress.form_id);
      }
      if (stopProgress && stopProgress.shared_draft_answers && typeof stopProgress.shared_draft_answers === 'object') {
        state.inspectSession.answers = JSON.parse(JSON.stringify(stopProgress.shared_draft_answers));
      }
      if (stopProgress && stopProgress.shared_draft_note) {
        state.inspectSession.inspector_note = stopProgress.shared_draft_note;
      }
      if (stopProgress && Array.isArray(stopProgress.co_inspectors)) {
        state.inspectSession.co_inspectors = [...stopProgress.co_inspectors];
      }
    }
  }

  switchTab('inspect');
}

function getLastRecordedValueForField(machineId, fieldId) {
  const inspections = (state.data.inspections || []).filter(i => Number(i.machine_id) === Number(machineId));
  for (const ins of inspections) {
    const found = (ins.answers || []).find(a => a.field_id === fieldId && a.value !== '' && a.value !== undefined);
    if (found) {
      return {
        value: found.value,
        status: found.status,
        unit: found.unit || '',
        inspected_at: ins.inspected_at,
        inspector_name: ins.inspector_name
      };
    }
  }
  return null;
}

function setInspectFieldFilter(filterMode) {
  const noteEl = document.getElementById('inspect-overall-note');
  if (noteEl) state.inspectSession.inspector_note = noteEl.value;
  state.inspectSession.fieldFilter = filterMode;
  renderCurrentTab();
}

function quickPassAllVisualItems() {
  const form = state.data.forms.find(f => f.id === Number(state.inspectSession.form_id));
  if (!form) return;
  const noteEl = document.getElementById('inspect-overall-note');
  if (noteEl) state.inspectSession.inspector_note = noteEl.value;

  const isRunning = state.inspectSession.machine_state_at_check === 'running';
  let passedCount = 0;
  let numericRemaining = 0;

  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) {
      if (f.running_only && !isRunning) continue;
      const existing = state.inspectSession.answers[f.id];
      if (f.field_type === 'number_range') {
        if (!existing || existing.value === '' || !existing.status) numericRemaining++;
        continue;
      }
      if (!existing || !existing.status) {
        let defaultVal = 'ปกติ (Pass)';
        if (f.field_type === 'three_state') {
          defaultVal = (Array.isArray(f.options) && f.options[0]) ? f.options[0] : 'ปกติ (Normal)';
        } else if (f.field_type === 'checkbox') {
          defaultVal = (Array.isArray(f.options) && f.options[0]) ? f.options[0] : 'ไม่พบสิ่งผิดปกติ';
        }
        state.inspectSession.answers[f.id] = {
          field_id: f.id,
          label: f.label,
          value: defaultVal,
          status: 'normal',
          unit: f.unit || '',
          remark: '',
          photo: '',
          checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
        };
        passedCount++;
      }
    }
  }

  renderCurrentTab();
  showToast(`กดผ่านหมวดสายตา ${passedCount} รายการแล้ว (เหลือกรอกค่าตัวเลขวัดจริง ${numericRemaining} รายการ)`, 'info');
}

function markAllItemsNormal() {
  const form = state.data.forms.find(f => f.id === Number(state.inspectSession.form_id));
  if (!form) return;
  const noteEl = document.getElementById('inspect-overall-note');
  if (noteEl) state.inspectSession.inspector_note = noteEl.value;

  const isRunning = state.inspectSession.machine_state_at_check === 'running';
  let markedCount = 0;

  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) {
      if (f.running_only && !isRunning) continue;
      if (f.field_type === 'number_range') continue;
      {
        let defaultVal = 'ปกติ (Pass)';
        if (f.field_type === 'three_state') {
          defaultVal = (Array.isArray(f.options) && f.options[0]) ? f.options[0] : 'ปกติ (Normal)';
        } else if (f.field_type === 'checkbox') {
          defaultVal = (Array.isArray(f.options) && f.options[0]) ? f.options[0] : 'ไม่พบสิ่งผิดปกติ';
        }
        state.inspectSession.answers[f.id] = {
          field_id: f.id,
          label: f.label,
          value: defaultVal,
          status: 'normal',
          unit: f.unit || '',
          remark: '',
          photo: '',
          checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
        };
        markedCount++;
      }
    }
  }

  renderCurrentTab();
  showToast(`🟢 ตั้งค่าตรวจผ่านข้อสังเกตทั้งหมด ${markedCount} ข้อ เรียบร้อยแล้ว`, 'success');
}

function resetInspectionAnswers() {
  if (confirm('คุณต้องการล้างคำตอบที่บันทึกไว้ในแบบฟอร์มนี้ทั้งหมดเพื่อเริ่มตรวจใหม่หรือไม่?')) {
    state.inspectSession.answers = {};
    state.inspectSession.inspector_note = '';
    renderCurrentTab();
    showToast('↺ ล้างคำตอบในแบบฟอร์มทั้งหมดเรียบร้อยแล้ว', 'info');
  }
}

function stepNumericFieldValue(fieldId, delta, minNorm, maxNorm, maxWarn, unit) {
  const inputEl = document.getElementById(`num-input-${fieldId}`);
  const existing = state.inspectSession.answers[fieldId];
  let currentNum = inputEl && inputEl.value !== '' ? parseFloat(inputEl.value) : (existing && existing.value !== '' ? parseFloat(existing.value) : NaN);
  if (isNaN(currentNum)) {
    const lastRec = getLastRecordedValueForField(state.inspectSession.machine_id, fieldId);
    currentNum = (lastRec && !isNaN(parseFloat(lastRec.value))) ? parseFloat(lastRec.value) : Number(((minNorm + maxNorm) / 2).toFixed(1));
  }
  const nextVal = Number((currentNum + delta).toFixed(1));
  if (inputEl) inputEl.value = nextVal;
  onNumericFieldInput(fieldId, String(nextVal), minNorm, maxNorm, maxWarn, unit);
}

function setNumericFieldToLastValue(fieldId, rawVal, minNorm, maxNorm, maxWarn, unit) {
  const inputEl = document.getElementById(`num-input-${fieldId}`);
  if (inputEl) inputEl.value = rawVal;
  onNumericFieldInput(fieldId, String(rawVal), minNorm, maxNorm, maxWarn, unit);
}

async function saveSharedCoInspectionDraft() {
  if (!state.inspectSession.route_round_id) {
    showToast('กรุณาเลือกเดินตรวจจาก "สายเดินตรวจ & ทีมตรวจ" เพื่อแชร์ความคืบหน้าร่วมกับทีม', 'warning');
    return;
  }
  const noteEl = document.getElementById('inspect-overall-note');
  const noteVal = noteEl ? noteEl.value.trim() : (state.inspectSession.inspector_note || '');
  try {
    const res = await apiRequest(`/api/route-rounds/${state.inspectSession.route_round_id}`, 'PUT', {
      shared_draft_save: {
        machine_id: state.inspectSession.machine_id,
        answers: state.inspectSession.answers,
        note: noteVal,
        inspector_name: state.activeUser?.full_name || 'ช่างตรวจเช็ค',
        inspector_code: state.activeUser?.emp_code || 'EMP-1002'
      }
    });
    updateStateData(res.data);
    showToast(res.queued ? 'เก็บแบบร่างในเครื่องแล้ว รอส่งเข้ารอบตรวจกลาง' : 'บันทึกความคืบหน้าลงรอบตรวจกลางแล้ว! เพื่อนร่วมทีมสามารถเปิดตรวจต่อได้ทันที', res.queued ? 'warning' : 'success');
    if (!res.queued && state.inspectSession.queuedReviewId) { await ComisStore.remove('queue', state.inspectSession.queuedReviewId); state.inspectSession.queuedReviewId=null; }
    if (!res.queued) state.inspectSession.route_revision = state.data.revisions?.[`/api/route-rounds/${state.inspectSession.route_round_id}`] || 0;
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderInspect(container) {
  const allMachines = state.data.machines;
  const allForms = state.data.forms;
  if (allMachines.length === 0 || allForms.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-10 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto">
        <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="clipboard-check" class="w-6 h-6"></i>
        </div>
        <h3 class="font-bold text-slate-800 text-base">ยังไม่มีรายการเครื่องจักรจริงสำหรับตรวจเช็ค</h3>
        <p class="text-xs text-slate-500 mt-1">ระบบได้ลบข้อมูลจำลอง (Mockup) ออกแล้ว กรุณาเพิ่มเครื่องจักรจริง หรือนำเข้าจากไฟล์ CSV ก่อนเริ่มบันทึกผลตรวจเช็ค</p>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button onclick="openMachineModal(null)" class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i> เพิ่มเครื่องจักรจริง
          </button>
          <button onclick="switchTab('csv-import')" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i> นำเข้าข้อมูลจาก CSV
          </button>
        </div>
      </div>
    `;
    return;
  }

  const scopedMachines = getScopedMachinesForActiveUser();
  const scopedForms = getScopedFormsForActiveUser();
  const scopedActiveRounds = getScopedRouteRoundsForActiveUser(true);

  const selectedMachine = scopedMachines.find(m => m.id === Number(state.inspectSession.machine_id))
    || allMachines.find(m => m.id === Number(state.inspectSession.machine_id))
    || scopedMachines[0]
    || allMachines[0];
  state.inspectSession.machine_id = selectedMachine.id;

  const selectedForm = scopedForms.find(f => f.id === Number(state.inspectSession.form_id))
    || scopedForms.find(f => Number(f.department_id) === Number(selectedMachine.department_id))
    || scopedForms[0]
    || allForms[0];
  state.inspectSession.form_id = selectedForm.id;

  // Ensure selectedMachine and selectedForm are in the dropdown lists
  const machines = scopedMachines.some(m => m.id === selectedMachine.id) ? scopedMachines : [selectedMachine, ...scopedMachines];
  const forms = scopedForms.some(f => f.id === selectedForm.id) ? scopedForms : [selectedForm, ...scopedForms];

  const isRunning = state.inspectSession.machine_state_at_check === 'running';
  const fieldFilter = state.inspectSession.fieldFilter || 'all';
  const linkedInspectionForm = typeof getMachineLinkedForm === 'function' ? getMachineLinkedForm(selectedMachine, state) : null;
  const hubFormOptions = (window.ESC_BUILTIN_FORMS || []).map(form => `<option value="${form.code}" ${linkedInspectionForm?.code === form.code ? 'selected' : ''}>[${form.code}] ${form.title}</option>`).join('');

  // Calculate form completion progress & co-inspectors
  let totalFieldsCount = 0;
  let answeredFieldsCount = 0;
  const coInspectorSet = new Set(state.inspectSession.co_inspectors || []);
  if (state.activeUser?.full_name) coInspectorSet.add(state.activeUser.full_name);

  for (const sec of selectedForm.sections || []) {
    for (const f of sec.fields || []) {
      totalFieldsCount++;
      const skippedByStopped = f.running_only && !isRunning;
      const ans = state.inspectSession.answers[f.id];
      if (skippedByStopped || (ans && ans.value !== '' && ans.status)) {
        answeredFieldsCount++;
      }
      if (ans && ans.checked_by) coInspectorSet.add(ans.checked_by);
    }
  }
  const progressPct = totalFieldsCount > 0 ? Math.round((answeredFieldsCount / totalFieldsCount) * 100) : 0;

  let activeRound = state.inspectSession.route_round_id
    ? (state.data.routeRounds || []).find(r => r.id === Number(state.inspectSession.machine_id ? state.inspectSession.route_round_id : 0))
    : null;
  if (activeRound && state.userScopeOnly && !isRouteRoundScopedToActiveUser(activeRound, state.activeUser)) {
    activeRound = scopedActiveRounds[0] || null;
    state.inspectSession.route_round_id = activeRound ? activeRound.id : null;
  }
  if (!activeRound && scopedActiveRounds.length > 0) {
    activeRound = scopedActiveRounds[0];
  }

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-5">
      ${renderUserScopeFilterBar('แบบฟอร์มในการตรวจเช็ค & รอบการเดินตรวจที่กำลังดำเนินการในกะนี้')}

      ${scopedActiveRounds.length > 1 ? `
        <div class="bg-white rounded-2xl p-3.5 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
          <span class="text-xs font-bold text-slate-700">🗺️ รอบการเดินตรวจที่กำลังดำเนินการในกะนี้ของคุณ (${scopedActiveRounds.length} รอบ):</span>
          <div class="flex flex-wrap items-center gap-1.5">
            ${scopedActiveRounds.map(rr => {
              const firstPending = (rr.stops_progress || []).find(s => s.status !== 'completed') || (rr.stops_progress || [])[0];
              const isSelectedRound = activeRound && Number(activeRound.id) === Number(rr.id);
              return `
                <button type="button" onclick="startInspectionForMachine(${firstPending ? firstPending.machine_id : selectedMachine.id}, ${rr.route_id}, ${rr.id})"
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                    isSelectedRound ? 'bg-[#1f760e] text-white border-[#1f760e]' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-emerald-50'
                  }">
                  ${rr.round_code}: ${rr.route_name} (${rr.completed_stops}/${rr.total_stops})
                </button>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      ${activeRound ? `
        <!-- Active Route Round & Co-Inspection Bar -->
        <div class="bg-gradient-to-r from-[#0c2e07] to-[#1f760e] text-white rounded-2xl p-4 shadow-md border border-emerald-700">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">🗺️ ${activeRound.round_code}</span>
                <span class="font-bold text-sm">${activeRound.route_name}</span>
                <span class="text-xs text-emerald-200">(${activeRound.time_window || activeRound.shift})</span>
              </div>
              <p class="text-xs text-emerald-100 mt-1">
                🤝 <strong>ผู้ร่วมตรวจเครื่องนี้:</strong> ${Array.from(coInspectorSet).join(', ')}
                — สามารถตรวจเฉพาะหมวดที่รับผิดชอบแล้วกด <strong>"พัก/แชร์ให้เพื่อนตรวจต่อ"</strong> ได้
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="saveSharedCoInspectionDraft()" class="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
                <i data-lucide="share-2" class="w-4 h-4"></i> 💾 พัก/แชร์ความคืบหน้าให้เพื่อนตรวจต่อ
              </button>
              <button type="button" onclick="switchTab('routes')" class="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs cursor-pointer">
                ดูภาพรวมสายตรวจ (${activeRound.completed_stops}/${activeRound.total_stops})
              </button>
            </div>
          </div>
          <!-- Route Stop Switcher Pills -->
          <div class="mt-3 pt-3 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1">
            ${(activeRound.stops_progress || []).map(st => {
              const isCurrent = Number(st.machine_id) === Number(selectedMachine.id);
              const isDone = st.status === 'completed';
              const hasDraft = st.status === 'in_progress_shared';
              return `
                <button type="button" onclick="startInspectionForMachine(${st.machine_id}, ${activeRound.route_id}, ${activeRound.id})"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-slate-900 border-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-800/80 text-emerald-200 border-emerald-600'
                      : hasDraft
                      ? 'bg-amber-500/30 text-amber-200 border-amber-400/50'
                      : 'bg-black/25 text-white/80 border-white/15 hover:bg-white/10'
                  }">
                  <span>จุดที่ ${st.stop_order}: ${st.machine_code}</span>
                  ${isDone ? '<span>✅</span>' : hasDraft ? '<span>⏳(กำลังช่วยกันตรวจ)</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Top Selection Header Card -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <i data-lucide="clipboard-check" class="w-6 h-6"></i>
            </div>
            <div>
              <h2 class="font-bold text-slate-800 text-base">ใบบันทึกผลการตรวจสอบเครื่องจักรออนไลน์ (Digital E-Checksheet)</h2>
              <p class="text-xs text-slate-500">
                ผู้ตรวจปัจจุบัน: <strong class="text-blue-700">${state.activeUser?.full_name || 'ช่างตรวจเช็ค'}</strong> (${state.activeUser?.emp_code || '-'})
                ${coInspectorSet.size > 1 ? ` | 🤝 ทีมร่วมตรวจ: <strong class="text-emerald-700">${Array.from(coInspectorSet).join(', ')}</strong>` : ''}
              </p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="if(state.activeRound){switchTab('routes')}else{switchTab('dashboard')}" class="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs border border-slate-300 transition cursor-pointer" title="ย้อนกลับหน้าหลัก">
              <i data-lucide="arrow-left" class="w-4 h-4 text-slate-600"></i> ย้อนกลับหน้าหลัก
            </button>
            <button type="button" onclick="openEmergencyQuickEntryModal(${selectedMachine.id})" class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
              <i data-lucide="zap" class="w-4 h-4 text-amber-300"></i> ⚡ ลงค่าฉุกเฉินเฉพาะจุด
            </button>
            <button type="button" onclick="openQuickQRScannerModal()" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer">
              <i data-lucide="qr-code" class="w-4 h-4 text-sky-400"></i> จำลองสแกน QR หน้าเครื่อง
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">1. เลือกเครื่องจักรที่ต้องการตรวจเช็ค ${state.userScopeOnly ? `<span class="text-emerald-700 font-semibold">(กรองเฉพาะผู้ใช้ ${machines.length}/${allMachines.length})</span>` : ''}</label>
            <select onchange="onChangeInspectMachine(this.value)" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600">
              ${machines.map(m => `<option value="${m.id}" ${m.id === selectedMachine.id ? 'selected' : ''}>[${m.machine_code}] ${m.name} (${m.plant_area})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">2. เลือกแบบฟอร์มการตรวจเช็ค ${state.userScopeOnly ? `<span class="text-emerald-700 font-semibold">(กรองเฉพาะผู้ใช้ ${forms.length}/${allForms.length})</span>` : ''}</label>
            <select onchange="onChangeInspectForm(this.value)" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600">
              ${forms.map(f => `<option value="${f.id}" ${f.id === selectedForm.id ? 'selected' : ''}>[${f.department_code || 'ALL'}] ${f.title} (v${f.version})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">3. กะการทำงาน (Working Shift) *</label>
            <select onchange="state.inspectSession.shift = this.value" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
              <option value="กะเช้า (07:00-19:00)" ${state.inspectSession.shift.includes('กะเช้า') || state.inspectSession.shift.includes('เช้า') ? 'selected' : ''}>☀️ กะเช้า (07:00 - 19:00 น.)</option>
              <option value="กะดึก (19:00-07:00)" ${state.inspectSession.shift.includes('กะดึก') || state.inspectSession.shift.includes('ดึก') ? 'selected' : ''}>🌙 กะดึก (19:00 - 07:00 น.)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">4. สถานะเครื่องจักรขณะเข้าตรวจ (Operating State) *</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button type="button" onclick="onChangeInspectOperatingState('running')" class="touch-target-btn py-2 px-2 rounded-xl text-xs font-bold border transition ${state.inspectSession.machine_state_at_check === 'running' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                🟢 เดินเครื่อง
              </button>
              <button type="button" onclick="onChangeInspectOperatingState('standby')" class="touch-target-btn py-2 px-2 rounded-xl text-xs font-bold border transition ${state.inspectSession.machine_state_at_check === 'standby' ? 'bg-slate-700 text-white border-slate-700 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                ⚪ หยุดสำรอง
              </button>
              <button type="button" onclick="onChangeInspectOperatingState('pending_repair')" class="touch-target-btn py-2 px-2 rounded-xl text-xs font-bold border transition ${state.inspectSession.machine_state_at_check === 'pending_repair' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                ⏳ รอซ่อม
              </button>
              <button type="button" onclick="onChangeInspectOperatingState('under_repair')" class="touch-target-btn py-2 px-2 rounded-xl text-xs font-bold border transition ${state.inspectSession.machine_state_at_check === 'under_repair' || state.inspectSession.machine_state_at_check === 'maintenance' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                🛠️ ระหว่างซ่อม
              </button>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-slate-950 to-indigo-950 text-white p-5 shadow-lg">
          <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div class="min-w-0">
              <div class="text-amber-300 text-xs font-black tracking-wide">📋 ศูนย์แบบฟอร์มตรวจเครื่องจักรหน้างาน (Inspection Forms Hub)</div>
              <div class="mt-1 text-base font-extrabold">${linkedInspectionForm ? `${linkedInspectionForm.code} · ${linkedInspectionForm.title}` : 'ยังไม่พบแบบฟอร์มที่เชื่อมโยง'}</div>
              <div class="mt-2">
                <label class="block text-[11px] text-slate-300 mb-1">สลับไปยังแบบฟอร์มมาตรฐานอื่น</label>
                <select onchange="const f=window.ESC_BUILTIN_FORMS.find(x=>x.code===this.value); if(f) openEmbeddedForm(getFormUrl(f.file), f.code + ' · ' + f.title)" class="w-full max-w-xl bg-white text-slate-900 border-2 border-white rounded-xl px-3 py-2 text-xs font-bold">
                  ${hubFormOptions}
                </select>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row gap-2 shrink-0">
              <button type="button" onclick="openLinkedFormForMachine(${selectedMachine.id})" class="min-h-12 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-md">📝 เปิดแบบฟอร์มตรวจ ${linkedInspectionForm?.code || ''}</button>
              <button type="button" onclick="openLinkedFormForMachine(${selectedMachine.id}, 'print')" class="min-h-12 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm">🖨 พิมพ์เอกสาร / PDF</button>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 text-slate-200 rounded-xl p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="text-slate-400">เครื่องจักร:</span> <strong class="text-white">${selectedMachine.machine_code}</strong> |
            <span class="text-slate-400">รุ่น:</span> <strong>${selectedMachine.brand} ${selectedMachine.model}</strong> |
            <span class="text-slate-400">ความสำคัญ:</span> <strong class="text-amber-400">Class ${selectedMachine.criticality}</strong>
          </div>
          <div class="text-sky-300 font-medium">
            📋 ฟอร์ม: ${selectedForm.form_code} (${selectedForm.department_name || 'ส่วนกลาง'})
          </div>
        </div>
      </div>

      <!-- iPad / Field Inspector Speed Toolbar -->
      <div class="bg-white rounded-2xl p-4 border-2 border-emerald-600/30 shadow-xs space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1">
              📱 แถบช่วยช่างหน้างาน (iPad Speed Bar)
            </span>
            <span class="text-xs font-bold text-slate-700">
              ความคืบหน้า: <strong class="text-emerald-700">${answeredFieldsCount}/${totalFieldsCount} ข้อ (${progressPct}%)</strong>
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="markAllItemsNormal()" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer" title="ตั้งผ่านเฉพาะข้อสังเกต ค่าตัวเลขต้องกรอกจากการวัดจริง">
              <i data-lucide="check-check" class="w-4 h-4"></i> 🟢 ผ่านปกติทุกข้อ (Mark All Normal)
            </button>
            <button type="button" onclick="quickPassAllVisualItems()" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition cursor-pointer" title="ผ่านเฉพาะข้อสายตา/กายภาพ โดยเว้นให้กรอกค่าตัวเลข CBM เอง">
              👁️ เฉพาะสายตา
            </button>
            <button type="button" onclick="resetInspectionAnswers()" class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 transition cursor-pointer" title="ล้างค่าที่กรอกไว้ในฟอร์มนี้ทั้งหมดเพื่อเริ่มตรวจใหม่">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> ล้างคำตอบ
            </button>
          </div>
        </div>

        <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-600 transition-all duration-300 rounded-full" style="width:${progressPct}%"></div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs text-slate-500 font-semibold mr-1">กรองหัวข้อตรวจ:</span>
            <button type="button" onclick="setInspectFieldFilter('all')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${fieldFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              📋 ทั้งหมด (${totalFieldsCount})
            </button>
            <button type="button" onclick="setInspectFieldFilter('unchecked')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${fieldFilter === 'unchecked' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              ⏳ ยังไม่กรอก (${totalFieldsCount - answeredFieldsCount})
            </button>
            <button type="button" onclick="setInspectFieldFilter('numeric')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${fieldFilter === 'numeric' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              🔢 เฉพาะวัดค่าตัวเลข CBM
            </button>
          </div>
          <div class="text-[11px] text-slate-500">
            💡 ทิปสำหรับไอแพด: กดปุ่ม <strong>"-0.1 / = ค่าเดิม / +0.1"</strong> เพื่อปรับตัวเลขเร็วโดยไม่ต้องพิมพ์คีย์บอร์ด
          </div>
        </div>
      </div>

      <!-- Dynamic Sections & Questions -->
      ${(selectedForm.sections || []).map((sec, sIdx) => {
        const filteredFields = (sec.fields || []).filter(f => {
          if (fieldFilter === 'numeric') return f.field_type === 'number_range';
          if (fieldFilter === 'unchecked') {
            const skipped = f.running_only && !isRunning;
            if (skipped) return false;
            const ans = state.inspectSession.answers[f.id];
            return !ans || ans.value === '' || !ans.status;
          }
          return true;
        });
        if (filteredFields.length === 0) return '';
        return `
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="bg-slate-800 text-white px-6 py-3.5 flex items-center justify-between">
              <h3 class="font-bold text-sm">${sec.title || `หมวดที่ ${sIdx + 1}`}</h3>
              <span class="text-xs text-slate-300">แสดง ${filteredFields.length} / ${(sec.fields || []).length} รายการ</span>
            </div>

            <div class="divide-y divide-slate-200">
              ${filteredFields.map((field, fIdx) => renderInspectionFieldInput(field, fIdx, isRunning, selectedMachine.id)).join('')}
            </div>
          </div>
        `;
      }).join('')}

      <!-- Summary Note & Digital Signature -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">📝 บันทึกสรุปผลการตรวจเช็ค / ข้อเสนอแนะเพิ่มเติม</label>
          <textarea id="inspect-overall-note" rows="3" placeholder="ระบุข้อสังเกตเพิ่มเติม หรือสิ่งที่ได้ดำเนินการแก้ไขเบื้องต้นหน้างาน..." class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-600">${state.inspectSession.inspector_note || ''}</textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2 border-t border-slate-100">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-700">✍️ ลายเซ็นดิจิทัลผู้ตรวจเช็ค (วาดด้วยนิ้วหรือ Apple Pencil)</label>
              <button type="button" onclick="clearSignaturePad()" class="text-xs text-rose-600 hover:underline font-medium">ล้างลายเซ็น</button>
            </div>
            <div class="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
              <canvas id="signature-canvas" width="420" height="130" class="w-full h-[130px]"></canvas>
            </div>
          </div>

          <div class="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
            <div class="text-xs text-slate-700 space-y-1">
              <div class="font-bold text-blue-900 text-sm">⚡ ระบบอัตโนมัติเมื่อกดส่งผลตรวจ:</div>
              <p>1. คำนวณสถานะเครื่องจักร (<span class="text-emerald-700 font-semibold">ปกติ</span> / <span class="text-amber-700 font-semibold">เฝ้าระวัง</span> / <span class="text-rose-700 font-semibold">ผิดปกติ</span>) ทันที</p>
              <p>2. หากมีข้อที่ <strong>ผิดปกติ (Abnormal)</strong> ระบบจะเปิด <strong>ใบแจ้งซ่อม (F-Tag)</strong> เข้ากระดานกลางให้อัตโนมัติ</p>
              <p>3. บันทึกรายชื่อผู้ร่วมตรวจทุกคนและอัปเดตความคืบหน้าสายเดินตรวจทันที</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              ${activeRound ? `
                <button type="button" onclick="saveSharedCoInspectionDraft()" class="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer">
                  <i data-lucide="share-2" class="w-4 h-4"></i> พัก/แชร์ให้เพื่อนตรวจต่อ
                </button>
              ` : ''}
              <button type="button" onclick="submitInspectionForm()" class="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer">
                <i data-lucide="send" class="w-4 h-4"></i> บันทึกและส่งผลการตรวจเช็คเข้าศูนย์กลาง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initSignaturePad();
  }, 50);
}

function renderInspectionFieldInput(field, fIdx, isRunning, machineId) {
  const skippedByStopped = field.running_only && !isRunning;
  const currentAns = state.inspectSession.answers[field.id] || {
    field_id: field.id,
    label: field.label,
    value: '',
    status: skippedByStopped ? 'na' : '',
    unit: field.unit || '',
    remark: '',
    photo: '',
    checked_by: ''
  };

  if (skippedByStopped) {
    currentAns.value = 'ข้ามการวัด (เครื่องหยุดเดิน)';
    currentAns.status = 'na';
    state.inspectSession.answers[field.id] = currentAns;
  }

  let controlHtml = '';
  if (skippedByStopped) {
    controlHtml = `
      <div class="bg-slate-100 text-slate-500 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200">
        ⚪ ข้ามข้อนี้โดยอัตโนมัติ เนื่องจากสถานะเครื่องจักรคือ <strong>หยุดเดินเครื่อง</strong> (หัวข้อนี้วัดเฉพาะขณะเดินเครื่อง)
      </div>
    `;
  } else if (field.field_type === 'pass_fail') {
    controlHtml = `
      <div class="grid grid-cols-2 gap-3 max-w-lg">
        <button type="button" onclick="setFieldAnswer('${field.id}', 'ปกติ (Pass)', 'normal')" class="touch-target-btn py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${currentAns.status === 'normal' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-emerald-50'}">
          🟢 ปกติ / ผ่าน (Pass)
        </button>
        <button type="button" onclick="setFieldAnswer('${field.id}', 'ผิดปกติ (Fail)', 'abnormal')" class="touch-target-btn py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${currentAns.status === 'abnormal' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-rose-50'}">
          🔴 ผิดปกติ / ไม่ผ่าน (Fail)
        </button>
      </div>
    `;
  } else if (field.field_type === 'three_state') {
    const opts = Array.isArray(field.options) && field.options.length >= 3
      ? field.options
      : ['ปกติ (Normal)', 'เฝ้าระวัง (Warning)', 'ผิดปกติ (Abnormal)'];
    controlHtml = `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button type="button" onclick="setFieldAnswer('${field.id}', '${opts[0]}', 'normal')" class="touch-target-btn py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${currentAns.status === 'normal' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300'}">
          🟢 ${opts[0]}
        </button>
        <button type="button" onclick="setFieldAnswer('${field.id}', '${opts[1]}', 'warning')" class="touch-target-btn py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${currentAns.status === 'warning' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300'}">
          🟡 ${opts[1]}
        </button>
        <button type="button" onclick="setFieldAnswer('${field.id}', '${opts[2]}', 'abnormal')" class="touch-target-btn py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${currentAns.status === 'abnormal' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300'}">
          🔴 ${opts[2]}
        </button>
      </div>
    `;
  } else if (field.field_type === 'number_range') {
    const minN = field.min_normal ?? 0;
    const maxN = field.max_normal ?? 100;
    const maxW = field.max_warning ?? 120;
    const unitStr = field.unit || '';
    const lastRec = getLastRecordedValueForField(machineId || state.inspectSession.machine_id, field.id);
    const hasLastNumeric = lastRec && !isNaN(parseFloat(lastRec.value));

    controlHtml = `
      <div class="space-y-2.5">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative w-48">
            <input id="num-input-${field.id}" type="number" step="0.1" value="${currentAns.value}" placeholder="กรอกตัวเลข..."
              oninput="onNumericFieldInput('${field.id}', this.value, ${minN}, ${maxN}, ${maxW}, '${unitStr}')"
              class="touch-num-input w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600" />
            <span class="absolute right-3 top-2.5 text-xs font-bold text-slate-400">${unitStr}</span>
          </div>

          <!-- iPad Touch Stepper Buttons -->
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" onclick="stepNumericFieldValue('${field.id}', -1, ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-300 cursor-pointer">-1</button>
            <button type="button" onclick="stepNumericFieldValue('${field.id}', -0.1, ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-300 cursor-pointer">-0.1</button>
            ${hasLastNumeric ? `
              <button type="button" onclick="setNumericFieldToLastValue('${field.id}', '${lastRec.value}', ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 cursor-pointer" title="ใช้ค่าเดิมจากรอบตรวจล่าสุด">
                = ค่าเดิม (${lastRec.value})
              </button>
            ` : ''}
            <button type="button" onclick="stepNumericFieldValue('${field.id}', 0.1, ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-300 cursor-pointer">+0.1</button>
            <button type="button" onclick="stepNumericFieldValue('${field.id}', 1, ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-300 cursor-pointer">+1</button>
          </div>

          <div id="num-status-${field.id}">
            ${currentAns.status ? getHealthBadge(currentAns.status) : `<span class="text-xs text-slate-500">เกณฑ์ปกติ: <strong>${minN} - ${maxN} ${unitStr}</strong> (เฝ้าระวัง ≤ ${maxW})</span>`}
          </div>
        </div>
        ${hasLastNumeric ? `
          <div class="text-[11px] text-slate-500 flex items-center gap-2">
            <span>🕒 ค่าที่วัดได้ครั้งล่าสุด: <strong class="text-slate-700">${lastRec.value} ${unitStr}</strong> (${lastRec.inspected_at} โดย ${lastRec.inspector_name})</span>
          </div>
        ` : ''}
      </div>
    `;
  } else if (field.field_type === 'checkbox') {
    const opts = Array.isArray(field.options) ? field.options : ['ไม่พบสิ่งผิดปกติ', 'พบรอยรั่วซึม', 'เสียงดังผิดปกติ'];
    const selectedArr = Array.isArray(currentAns.value) ? currentAns.value : (currentAns.value ? String(currentAns.value).split(', ') : []);
    controlHtml = `
      <div class="flex flex-wrap gap-2">
        ${opts.map(opt => {
          const checked = selectedArr.includes(opt);
          return `
            <label class="touch-target-btn inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${checked ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-700'}">
              <input type="checkbox" ${checked ? 'checked' : ''} onchange="onToggleCheckboxField('${field.id}', '${opt}', this.checked)" class="rounded text-blue-600 w-4 h-4" />
              <span>${opt}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  } else {
    controlHtml = `
      <input type="text" value="${currentAns.value || ''}" placeholder="ระบุผลการตรวจสอบ..."
        oninput="setFieldAnswer('${field.id}', this.value, 'normal', false)"
        class="w-full max-w-lg bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-600" />
    `;
  }

  const showAbnormalBox = currentAns.status === 'abnormal' || currentAns.status === 'warning';

  return `
    <div class="inspect-field-card p-5 space-y-3 ${currentAns.status === 'abnormal' ? 'bg-rose-50/40' : currentAns.status === 'warning' ? 'bg-amber-50/30' : ''}">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-sm text-slate-800">${fIdx + 1}. ${field.label}</span>
            ${getTpmBadge(field.tpm_tag)}
            ${field.running_only ? `<span class="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">วัดขณะเดินเครื่อง</span>` : ''}
            ${currentAns.checked_by ? `<span class="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">👤 ตรวจโดย: ${currentAns.checked_by}</span>` : ''}
          </div>
          <div class="text-xs text-slate-500 flex flex-wrap items-center gap-3">
            <span>🛠️ <strong>วิธี/เครื่องมือ:</strong> ${field.tool_method || 'สายตา (Visual)'}</span>
            ${field.standard_opl ? `<span class="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">📖 <strong>เกณฑ์ OPL:</strong> ${field.standard_opl}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="pt-1">
        ${controlHtml}
      </div>

      <div id="abnormal-box-${field.id}" class="${showAbnormalBox ? 'block' : 'hidden'} pt-2">
        <div class="p-3.5 rounded-xl bg-white border ${currentAns.status === 'abnormal' ? 'border-rose-300' : 'border-amber-300'} space-y-2.5">
          <div class="text-xs font-bold ${currentAns.status === 'abnormal' ? 'text-rose-700' : 'text-amber-700'} flex items-center gap-1.5">
            ⚠️ พบค่า ${currentAns.status === 'abnormal' ? 'ผิดปกติ (Abnormal) — กรุณาระบุสาเหตุและแนบรูปถ่ายหน้างาน' : 'เฝ้าระวัง (Warning) — สามารถบันทึกหมายเหตุเพิ่มเติมได้'}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value="${currentAns.remark || ''}" placeholder="ระบุอาการผิดปกติ / สาเหตุเบื้องต้น..."
              oninput="onFieldRemarkChange('${field.id}', this.value)"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs" />
            <div class="flex items-center gap-2">
              <label class="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5">
                <i data-lucide="camera" class="w-3.5 h-3.5 text-sky-400"></i> แนบรูปถ่ายจุดเสีย
                <input type="file" accept="image/*" capture="environment" class="hidden" onchange="onFieldPhotoUpload('${field.id}', this)" />
              </label>
              <div id="photo-preview-${field.id}" class="inline-flex items-center gap-1.5">
                ${currentAns.photo ? `
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    ✅ แนบรูปแล้ว
                  </span>
                  <button type="button" onclick="previewAnswerPhoto('${field.id}')" class="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">🔍 ดูรูป</button>
                  <button type="button" onclick="removeAnswerPhoto('${field.id}')" class="text-xs text-rose-600 hover:underline font-semibold cursor-pointer">✕ ลบ</button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function onChangeInspectMachine(machineId) {
  state.inspectSession.machine_id = Number(machineId);
  const machine = state.data.machines.find(m => m.id === Number(machineId));
  if (machine) {
    state.inspectSession.machine_state_at_check = machine.operating_state || 'running';
  }
  state.inspectSession.answers = {};
  renderCurrentTab();
}

function onChangeInspectForm(formId) {
  state.inspectSession.form_id = Number(formId);
  state.inspectSession.answers = {};
  renderCurrentTab();
}

function onChangeInspectOperatingState(opState) {
  state.inspectSession.machine_state_at_check = opState;
  renderCurrentTab();
}

function getFieldDefById(fieldId) {
  const form = state.data.forms.find(f => f.id === Number(state.inspectSession.form_id));
  if (!form) return null;
  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) {
      if (f.id === fieldId) return f;
    }
  }
  return null;
}

function setFieldAnswer(fieldId, value, status, rerender = true) {
  const f = getFieldDefById(fieldId);
  const existing = state.inspectSession.answers[fieldId] || {};
  state.inspectSession.answers[fieldId] = {
    ...existing,
    field_id: fieldId,
    label: f ? f.label : fieldId,
    value,
    status,
    unit: f?.unit || '',
    checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
  };
  if (rerender) {
    const noteEl = document.getElementById('inspect-overall-note');
    if (noteEl) state.inspectSession.inspector_note = noteEl.value;
    renderCurrentTab();
  }
}

function onNumericFieldInput(fieldId, rawVal, minNorm, maxNorm, maxWarn, unit) {
  const f = getFieldDefById(fieldId);
  const num = parseFloat(rawVal);
  let status = 'normal';
  if (!isNaN(num)) {
    if (num < minNorm || num > maxWarn) {
      status = 'abnormal';
    } else if (num > maxNorm) {
      status = 'warning';
    }
  }
  const existing = state.inspectSession.answers[fieldId] || {};
  state.inspectSession.answers[fieldId] = {
    ...existing,
    field_id: fieldId,
    label: f ? f.label : fieldId,
    value: rawVal,
    status: isNaN(num) ? '' : status,
    unit,
    checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
  };

  const badgeContainer = document.getElementById(`num-status-${fieldId}`);
  if (badgeContainer && !isNaN(num)) {
    badgeContainer.innerHTML = getHealthBadge(status);
  }
  const abnBox = document.getElementById(`abnormal-box-${fieldId}`);
  if (abnBox) {
    abnBox.classList.toggle('hidden', !(status === 'abnormal' || status === 'warning'));
  }
}

function onToggleCheckboxField(fieldId, optionText, isChecked) {
  const f = getFieldDefById(fieldId);
  const existing = state.inspectSession.answers[fieldId] || {};
  let arr = existing.value ? String(existing.value).split(', ').filter(Boolean) : [];
  if (isChecked) {
    if (!arr.includes(optionText)) arr.push(optionText);
  } else {
    arr = arr.filter(x => x !== optionText);
  }
  const hasDefect = arr.some(x => !x.includes('ไม่พบ'));
  state.inspectSession.answers[fieldId] = {
    ...existing,
    field_id: fieldId,
    label: f ? f.label : fieldId,
    value: arr.join(', '),
    status: hasDefect ? 'warning' : 'normal',
    unit: '',
    checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
  };
  renderCurrentTab();
}

function onFieldRemarkChange(fieldId, remark) {
  if (!state.inspectSession.answers[fieldId]) return;
  state.inspectSession.answers[fieldId].remark = remark;
}

function compressImageFile(file, maxWidth = 1280, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round((dataUrl.length * 3) / 4)
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function onFieldPhotoUpload(fieldId, inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const prev = document.getElementById(`photo-preview-${fieldId}`);
  if (prev) prev.innerHTML = `<span class="text-xs text-amber-600 font-bold animate-pulse">⏳ กำลังบีบอัดรูปภาพ...</span>`;
  try {
    const res = await compressImageFile(file, 1280, 0.75);
    if (!state.inspectSession.answers[fieldId]) {
      state.inspectSession.answers[fieldId] = { field_id: fieldId };
    }
    state.inspectSession.answers[fieldId].photo = res.dataUrl;
    const kb = Math.round(res.compressedSize / 1024);
    if (prev) {
      prev.innerHTML = `
        <div class="inline-flex items-center gap-1.5">
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
            ✅ แนบรูปแล้ว (${kb} KB)
          </span>
          <button type="button" onclick="previewAnswerPhoto('${fieldId}')" class="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">🔍 ดูรูป</button>
          <button type="button" onclick="removeAnswerPhoto('${fieldId}')" class="text-xs text-rose-600 hover:underline font-semibold cursor-pointer">✕ ลบ</button>
        </div>
      `;
    }
    showToast(`แนบรูปถ่ายหลักฐานสำเร็จ (บีบอัดเหลือ ${kb} KB ป้องกันหน่วยความจำเต็ม)`, 'success');
  } catch (err) {
    console.error('Image compression error:', err);
    showToast('ไม่สามารถประมวลผลรูปภาพได้: ' + (err.message || 'เกิดข้อผิดพลาด'), 'error');
  }
}

function removeAnswerPhoto(fieldId) {
  if (state.inspectSession.answers[fieldId]) {
    delete state.inspectSession.answers[fieldId].photo;
  }
  const prev = document.getElementById(`photo-preview-${fieldId}`);
  if (prev) prev.innerHTML = '';
  showToast('ลบรูปภาพที่แนบเรียบร้อย', 'info');
}

function previewAnswerPhoto(fieldId) {
  const photo = state.inspectSession.answers[fieldId]?.photo;
  if (!photo) return;
  openModal('📷 รูปถ่ายหลักฐานหน้างาน', `
    <div class="space-y-4 text-center">
      <div class="overflow-hidden rounded-2xl border border-slate-300 shadow-md bg-slate-950 flex items-center justify-center p-2">
        <img src="${photo}" class="max-h-[65vh] w-auto max-w-full rounded-xl object-contain mx-auto" alt="Inspection proof" />
      </div>
      <div class="flex items-center justify-center gap-3">
        <a href="${photo}" download="inspect_${fieldId}_${Date.now()}.jpg" class="px-4 py-2 bg-[#1f760e] hover:bg-[#154c0c] text-white text-xs font-bold rounded-xl shadow-xs transition">
          📥 บันทึกรูปภาพลงเครื่อง
        </a>
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer">
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  `);
}

function initSignaturePad() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  signatureCtx = canvas.getContext('2d');
  signatureCtx.strokeStyle = '#1e3a8a';
  signatureCtx.lineWidth = 2.2;
  signatureCtx.lineCap = 'round';
  hasSignatureStroke = false;

  const getPos = e => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const start = e => {
    isDrawingSignature = true;
    hasSignatureStroke = true;
    const pos = getPos(e);
    signatureCtx.beginPath();
    signatureCtx.moveTo(pos.x, pos.y);
  };
  const move = e => {
    if (!isDrawingSignature) return;
    e.preventDefault();
    const pos = getPos(e);
    signatureCtx.lineTo(pos.x, pos.y);
    signatureCtx.stroke();
  };
  const end = () => { isDrawingSignature = false; };

  canvas.onmousedown = start;
  canvas.onmousemove = move;
  window.addEventListener('mouseup', end);
  canvas.ontouchstart = start;
  canvas.ontouchmove = move;
  canvas.ontouchend = end;
}

function clearSignaturePad() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas || !signatureCtx) return;
  signatureCtx.clearRect(0, 0, canvas.width, canvas.height);
  hasSignatureStroke = false;
}

async function submitInspectionForm() {
  const form = state.data.forms.find(f => f.id === Number(state.inspectSession.form_id));
  if (!form) return;

  const noteEl = document.getElementById('inspect-overall-note');
  const inspectorNote = noteEl ? noteEl.value.trim() : '';

  const allFields = [];
  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) allFields.push(f);
  }

  const answersArray = [];
  const coInspectorSet = new Set(state.inspectSession.co_inspectors || []);
  if (state.activeUser?.full_name) coInspectorSet.add(state.activeUser.full_name);

  for (const f of allFields) {
    const ans = state.inspectSession.answers[f.id];
    if ((!ans || ans.value === '' || !ans.status) && f.required) {
      showToast(`กรุณากรอกข้อมูลข้อ: "${f.label}" ให้ครบถ้วน (หรือใช้ปุ่ม ⚡ ลงค่าฉุกเฉินเฉพาะจุด)`, 'warning');
      return;
    }
    if (ans && ans.value !== '') {
      if (ans.checked_by) coInspectorSet.add(ans.checked_by);
      answersArray.push(ans);
    }
  }

  const canvas = document.getElementById('signature-canvas');
  const sigData = (canvas && hasSignatureStroke) ? canvas.toDataURL('image/png') : '';
  const wasInRouteRound = state.inspectSession.route_round_id;

  try {
    const res = await apiRequest('/api/inspections', 'POST', {
      machine_id: state.inspectSession.machine_id,
      form_id: form.id,
      department_id: form.department_id,
      route_id: state.inspectSession.route_id || null,
      route_round_id: state.inspectSession.route_round_id || null,
      route_revision: state.inspectSession.route_revision,
      inspection_type: 'routine',
      co_inspectors: Array.from(coInspectorSet),
      inspector_name: state.activeUser?.full_name || 'สมชาย ใจเพชร',
      inspector_code: state.activeUser?.emp_code || 'EMP-1002',
      shift: state.inspectSession.shift,
      machine_state_at_check: state.inspectSession.machine_state_at_check,
      checkin_method: state.inspectSession.checkin_method,
      answers: answersArray,
      inspector_note: inspectorNote,
      signature_data: sigData
    });

    updateStateData(res.data);

    if (res.queued) { showToast('เก็บใบตรวจในเครื่องแล้ว ยังไม่เข้าฐานกลาง ดูได้ที่รายการรอส่ง', 'warning'); switchTab('routes'); return; }
    if (state.inspectSession.queuedReviewId) { await ComisStore.remove('queue', state.inspectSession.queuedReviewId); state.inspectSession.queuedReviewId = null; }
    if (res.created_ticket_no) {
      showToast(`บันทึกใบตรวจ ${res.doc_no} และเปิดใบแจ้งซ่อมอัตโนมัติ ${res.created_ticket_no} เรียบร้อย!`, 'warning');
    } else {
      showToast(`บันทึกผลการตรวจเช็ค ${res.doc_no} สำเร็จ!`, 'success');
    }

    if (wasInRouteRound) {
      switchTab('routes');
    } else {
      switchTab('history');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}
