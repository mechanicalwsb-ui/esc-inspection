// Standalone adapter for the same API contract; persistence is handled by ComisStore.
function handleLocalApiRequest(url, method, body) {
  const raw = getLocalDb();
  if (!Array.isArray(raw.auditLogs)) raw.auditLogs = [];

  if (url === '/api/bootstrap' && method === 'GET') {
    return { ok: true, data: enrichRawData(raw) };
  }

  const preMutationSnapshot = ['POST', 'PUT', 'DELETE'].includes(method) && !url.startsWith('/api/audit-logs/')
    ? cloneDataSnapshot(raw)
    : null;

  const addAudit = (actor, action, targetType, targetName, detail = '', extraUndo = {}) => {
    raw.auditLogs.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      actor_name: actor || state?.activeUser?.full_name || 'System Admin',
      action_type: action,
      target_type: targetType,
      target_name: targetName,
      detail: detail || `ดำเนินการ ${action} บน ${targetType}: ${targetName}`,
      can_undo: true,
      reverted: false,
      reverted_at: '',
      reverted_by: '',
      undo_payload: {
        mode: 'local_snapshot',
        snapshot_before: preMutationSnapshot,
        finalize_current: true,
        ...extraUndo
      },
      created_at: nowStr()
    });
  };

  // Departments
  if (url === '/api/departments' && method === 'POST') {
    const nextId = Math.max(0, ...raw.departments.map(x => x.id)) + 1;
    raw.departments.push({ id: nextId, ...body, code: body.code.toUpperCase() });
    addAudit(body.actor, 'CREATE', 'DEPARTMENT', `${body.code} - ${body.name}`, `เพิ่มแผนกใหม่ [${body.code.toUpperCase()}] ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/departments/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.departments.findIndex(x => x.id === id);
    const oldDept = idx >= 0 ? raw.departments[idx] : null;
    if (idx >= 0) raw.departments[idx] = { ...raw.departments[idx], ...body, code: body.code.toUpperCase() };
    addAudit(body.actor, 'UPDATE', 'DEPARTMENT', `${body.code} - ${body.name}`, `แก้ไขข้อมูลแผนก (เดิม: ${oldDept ? oldDept.name : id})`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/departments/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldDept = raw.departments.find(x => x.id === id);
    raw.departments = raw.departments.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'DEPARTMENT', oldDept ? `${oldDept.code} - ${oldDept.name}` : `#${id}`, `ลบแผนกออกจากระบบ`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Machines
  if (url === '/api/machines' && method === 'POST') {
    const nextId = Math.max(0, ...raw.machines.map(x => x.id)) + 1;
    raw.machines.push({ id: nextId, ...body, machine_code: body.machine_code.toUpperCase() });
    addAudit(body.actor, 'CREATE', 'MACHINE', `${body.machine_code} - ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/machines\/\d+\/clone$/) && method === 'POST') {
    const id = Number(url.split('/')[3]);
    const orig = raw.machines.find(x => x.id === id);
    if (orig) {
      const nextId = Math.max(0, ...raw.machines.map(x => x.id)) + 1;
      const newCode = `${orig.machine_code}-COPY${Math.floor(10 + Math.random() * 90)}`;
      raw.machines.push({ ...JSON.parse(JSON.stringify(orig)), id: nextId, machine_code: newCode, name: `${orig.name} (สำเนา)`, health_status: 'normal' });
      addAudit('Admin', 'CLONE', 'MACHINE', newCode);
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/machines/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.machines.findIndex(x => x.id === id);
    if (idx >= 0) raw.machines[idx] = { ...raw.machines[idx], ...body, machine_code: body.machine_code.toUpperCase() };
    addAudit(body.actor, 'UPDATE', 'MACHINE', `${body.machine_code} - ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/machines/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    raw.machines = raw.machines.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'MACHINE', `#${id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Forms
  if (url === '/api/forms' && method === 'POST') {
    const nextId = Math.max(0, ...raw.forms.map(x => x.id)) + 1;
    raw.forms.unshift({ id: nextId, ...body, version: 1, form_code: body.form_code.toUpperCase() });
    addAudit(body.actor, 'CREATE', 'FORM_TEMPLATE', `${body.form_code} - ${body.title}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/forms\/\d+\/clone$/) && method === 'POST') {
    const id = Number(url.split('/')[3]);
    const orig = raw.forms.find(x => x.id === id);
    if (orig) {
      const nextId = Math.max(0, ...raw.forms.map(x => x.id)) + 1;
      const newCode = `${orig.form_code}-COPY${Math.floor(10 + Math.random() * 90)}`;
      raw.forms.unshift({ ...JSON.parse(JSON.stringify(orig)), id: nextId, form_code: newCode, title: `${orig.title} (สำเนา)`, version: 1 });
      addAudit('Admin', 'CLONE', 'FORM_TEMPLATE', newCode);
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/forms/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.forms.findIndex(x => x.id === id);
    if (idx >= 0) {
      const nextVer = (raw.forms[idx].version || 1) + 1;
      raw.forms[idx] = { ...raw.forms[idx], ...body, version: nextVer, form_code: body.form_code.toUpperCase() };
    }
    addAudit(body.actor, 'UPDATE', 'FORM_TEMPLATE', `${body.form_code} - ${body.title}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/forms/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    raw.forms = raw.forms.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'FORM_TEMPLATE', `#${id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Inspections
  if (url === '/api/inspections' && method === 'POST') {
    const nextId = Math.max(0, ...raw.inspections.map(x => x.id)) + 1;
    const isEmergency = body.inspection_type === 'emergency_quick';
    raw.documentSequence = (raw.documentSequence || 0) + 1;
    const docNo = ComisDomain.number(isEmergency ? 'EMG' : 'INS', raw.documentSequence);
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const normalCount = answers.filter(a => a.status === 'normal').length;
    const warningCount = answers.filter(a => a.status === 'warning').length;
    const abnormalItems = answers.filter(a => a.status === 'abnormal');
    const abnormalCount = abnormalItems.length;

    let overallResult = body.override_overall_result || 'normal';
    if (!body.override_overall_result) {
      if (abnormalCount > 0) overallResult = 'abnormal';
      else if (warningCount > 0) overallResult = 'warning';
    }

    // Collect all unique co-inspectors from item-level checks + main inspector
    const coSet = new Set();
    if (body.inspector_name) coSet.add(body.inspector_name);
    if (Array.isArray(body.co_inspectors)) body.co_inspectors.forEach(n => n && coSet.add(n));
    answers.forEach(a => { if (a.checked_by) coSet.add(a.checked_by); });
    const coInspectors = Array.from(coSet);

    raw.inspections.unshift({
      id: nextId,
      doc_no: docNo,
      machine_id: Number(body.machine_id),
      form_id: Number(body.form_id) || 1,
      department_id: Number(body.department_id) || 1,
      inspector_name: body.inspector_name,
      inspector_code: body.inspector_code,
      co_inspectors: coInspectors,
      inspection_type: body.inspection_type || 'routine',
      route_round_id: body.route_round_id ? Number(body.route_round_id) : null,
      shift: body.shift,
      machine_state_at_check: body.machine_state_at_check || 'running',
      checkin_method: body.checkin_method || (isEmergency ? 'emergency_log' : 'qr_scan'),
      overall_result: overallResult,
      normal_count: normalCount,
      warning_count: warningCount,
      abnormal_count: abnormalCount,
      answers,
      inspector_note: body.inspector_note || '',
      signature_data: body.signature_data || '',
      approval_status: 'pending',
      approved_by: '',
      approved_at: '',
      inspected_at: nowStr()
    });

    const mIdx = raw.machines.findIndex(m => m.id === Number(body.machine_id));
    if (mIdx >= 0) {
      raw.machines[mIdx].health_status = overallResult;
      if (body.machine_state_at_check) {
        raw.machines[mIdx].operating_state = body.machine_state_at_check;
      }
    }

    // Update Route Round progress ONLY for routine (full) inspections (P0-1: emergency partial check does not mark full route stop completed)
    if (!isEmergency) {
      if (!Array.isArray(raw.routeRounds)) raw.routeRounds = [];
      const targetRound = body.route_round_id
        ? raw.routeRounds.find(rr => rr.id === Number(body.route_round_id))
        : raw.routeRounds.find(rr => rr.status === 'in_progress' && rr.stop_statuses && rr.stop_statuses[String(body.machine_id)]);
      if (targetRound) {
        if (!targetRound.stop_statuses) targetRound.stop_statuses = {};
        const prevStop = targetRound.stop_statuses[String(body.machine_id)] || {};
        const mergedCo = Array.from(new Set([...(prevStop.co_inspectors || []), ...coInspectors]));
        targetRound.stop_statuses[String(body.machine_id)] = {
          status: 'done',
          inspector_name: body.inspector_name,
          co_inspectors: mergedCo,
          inspection_id: nextId,
          doc_no: docNo,
          overall_result: overallResult,
          updated_at: nowStr().slice(11, 16),
          draft_answers: {}
        };
        if (!Array.isArray(targetRound.team_members)) targetRound.team_members = [];
        mergedCo.forEach(name => {
          if (name && !targetRound.team_members.includes(name)) targetRound.team_members.push(name);
        });
      }
    }

    let createdTicketNo = null;
    if (abnormalCount > 0 || body.force_create_urgent_ticket || body.force_open_defect) {
      const nextDefId = Math.max(0, ...raw.defects.map(x => x.id)) + 1;
      createdTicketNo = ComisDomain.number('DEF', ++raw.documentSequence || (raw.documentSequence = 1));
      const summaryTitle = abnormalItems.length > 0
        ? abnormalItems.map(a => `${a.label}: ${a.value}${a.unit ? ' ' + a.unit : ''}`).join(', ')
        : (body.emergency_title || body.inspector_note || 'แจ้งเหตุผิดปกติฉุกเฉินหน้างาน');
      const detailText = abnormalItems.length > 0
        ? abnormalItems.map(a => `• ${a.label} = ${a.value}${a.unit ? ' ' + a.unit : ''} ${a.remark ? '(' + a.remark + ')' : ''}`).join('\n')
        : (body.inspector_note || 'บันทึกด่วนจากโหมดฉุกเฉิน');
      raw.defects.unshift({
        id: nextDefId,
        ticket_no: createdTicketNo,
        inspection_id: nextId,
        machine_id: Number(body.machine_id),
        component_name: body.component_name || (isEmergency ? '⚡ แจ้งด่วนโหมดฉุกเฉิน ' + docNo : 'ตรวจพบจากใบตรวจเช็ค ' + docNo),
        defect_title: (isEmergency ? '[⚡ ด่วนฉุกเฉิน] ' : '') + summaryTitle.slice(0, 170),
        defect_detail: detailText + (body.inspector_note && abnormalItems.length > 0 ? `\nหมายเหตุเพิ่มเติม: ${body.inspector_note}` : ''),
        reported_by: coInspectors.join(', '),
        assigned_dept_id: Number(body.department_id) || 1,
        assigned_to: isEmergency ? 'ทีมซ่อมบำรุงฉุกเฉิน (Rapid Response)' : '',
        severity: isEmergency ? 'critical' : 'high',
        status: 'open',
        root_cause: '',
        corrective_action: '',
        downtime_hours: 0,
        created_at: nowStr()
      });
    }

    addAudit(body.inspector_name, isEmergency ? 'EMERGENCY_QUICK_LOG' : 'SUBMIT_INSPECTION', 'INSPECTION', `${docNo} -> ${overallResult.toUpperCase()}`);
    saveLocalDb(raw);
    return { ok: true, doc_no: docNo, overall_result: overallResult, created_ticket_no: createdTicketNo, data: enrichRawData(raw) };
  }

  // Inspection Routes CRUD
  if (url === '/api/routes' && method === 'POST') {
    if (!Array.isArray(raw.routes)) raw.routes = [];
    const nextId = Math.max(0, ...raw.routes.map(x => x.id)) + 1;
    const shiftSchedules = Array.isArray(body.shift_schedules) ? body.shift_schedules : [];
    const timeWindows = Array.isArray(body.time_windows)
      ? body.time_windows
      : (shiftSchedules.length ? shiftSchedules.map(s => s.time_window) : ['08:30-10:00', '13:30-15:00']);
    raw.routes.push({
      id: nextId,
      route_code: (body.route_code || `RT-0${nextId}`).toUpperCase(),
      name: body.name,
      department_id: Number(body.department_id) || 1,
      estimated_minutes: Number(body.estimated_minutes) || 30,
      time_windows: timeWindows,
      shift_schedules: shiftSchedules,
      team_inspectors: Array.isArray(body.team_inspectors) ? body.team_inspectors : [],
      description: body.description || '',
      stops: Array.isArray(body.stops) ? body.stops : []
    });
    addAudit(body.actor, 'CREATE', 'INSPECTION_ROUTE', `${body.route_code} - ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/routes/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = (raw.routes || []).findIndex(x => x.id === id);
    if (idx >= 0) {
      const shiftSchedules = Array.isArray(body.shift_schedules) ? body.shift_schedules : (raw.routes[idx].shift_schedules || []);
      const timeWindows = Array.isArray(body.time_windows)
        ? body.time_windows
        : (shiftSchedules.length ? shiftSchedules.map(s => s.time_window) : (raw.routes[idx].time_windows || ['08:30-10:00']));
      raw.routes[idx] = {
        ...raw.routes[idx],
        ...body,
        id,
        route_code: (body.route_code || raw.routes[idx].route_code).toUpperCase(),
        department_id: Number(body.department_id) || raw.routes[idx].department_id,
        shift_schedules: shiftSchedules,
        time_windows: timeWindows
      };
    }
    addAudit(body.actor, 'UPDATE', 'INSPECTION_ROUTE', `${body.route_code} - ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/routes/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    raw.routes = (raw.routes || []).filter(x => x.id !== id);
    raw.routeRounds = (raw.routeRounds || []).filter(x => x.route_id !== id);
    addAudit('Admin', 'DELETE', 'INSPECTION_ROUTE', `#${id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Route Rounds (Multi-Inspector Shared Round & Co-Inspection Drafts)
  if (url === '/api/route-rounds' && method === 'POST') {
    if (!Array.isArray(raw.routeRounds)) raw.routeRounds = [];
    const nextId = Math.max(0, ...raw.routeRounds.map(x => x.id)) + 1;
    const rt = (raw.routes || []).find(r => r.id === Number(body.route_id));
    const stopStatuses = {};
    if (rt && Array.isArray(rt.stops)) {
      rt.stops.forEach(st => {
        stopStatuses[String(st.machine_id)] = { status: 'pending', inspector_name: '', co_inspectors: [], updated_at: '', draft_answers: {} };
      });
    }
    const roundNo = `RND-${nowStr().slice(0, 10).replace(/-/g, '')}-0${nextId}`;
    const assignedInspectors = Array.isArray(body.assigned_inspectors) ? body.assigned_inspectors : [];
    const teamMembers = assignedInspectors.length > 0
      ? assignedInspectors.map(x => x.inspector_name || x).filter(Boolean)
      : (body.inspector_name ? [body.inspector_name] : [state?.activeUser?.full_name || 'สมชาย ใจเพชร']);
    raw.routeRounds.unshift({
      id: nextId,
      round_no: roundNo,
      round_code: roundNo,
      route_id: Number(body.route_id),
      department_id: rt ? rt.department_id : (Number(body.department_id) || 1),
      shift_window: body.time_window || body.shift_window || (rt?.time_windows?.[0] || '07:30 - 09:30'),
      shift_name: body.shift || body.shift_name || 'กะเช้า (07:00-19:00)',
      status: 'in_progress',
      assigned_inspectors: assignedInspectors,
      team_members: teamMembers,
      stop_statuses: stopStatuses,
      started_at: nowStr(),
      completed_at: ''
    });
    addAudit(teamMembers[0] || body.inspector_name, 'START_ROUTE_ROUND', 'ROUTE_ROUND', `${roundNo} (${rt?.route_code || ''})`);
    saveLocalDb(raw);
    return { ok: true, round_id: nextId, round: { id: nextId, round_code: roundNo }, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/route-rounds\/\d+$/) && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const rr = (raw.routeRounds || []).find(x => x.id === id);
    if (rr) {
      if (body.join_inspector) {
        const jName = body.join_inspector.inspector_name || body.inspector_name;
        if (!Array.isArray(rr.team_members)) rr.team_members = [];
        if (jName && !rr.team_members.includes(jName)) rr.team_members.push(jName);
        if (Array.isArray(rr.assigned_inspectors)) {
          if (!rr.assigned_inspectors.some(x => x.inspector_name === jName)) {
            rr.assigned_inspectors.push(body.join_inspector);
          }
        }
        addAudit(jName, 'JOIN_TEAM_ROUND', 'ROUTE_ROUND', rr.round_code || rr.round_no);
      }
      if (body.shared_draft_save) {
        const sd = body.shared_draft_save;
        if (!rr.stop_statuses) rr.stop_statuses = {};
        const key = String(sd.machine_id);
        const prev = rr.stop_statuses[key] || { co_inspectors: [] };
        const coList = Array.from(new Set([...(prev.co_inspectors || []), sd.inspector_name].filter(Boolean)));
        rr.stop_statuses[key] = {
          ...prev,
          status: 'checking',
          inspector_name: sd.inspector_name || prev.inspector_name,
          co_inspectors: coList,
          updated_at: nowStr().slice(11, 16),
          draft_answers: sd.answers || {},
          inspector_note: sd.note || ''
        };
        if (!Array.isArray(rr.team_members)) rr.team_members = [];
        if (sd.inspector_name && !rr.team_members.includes(sd.inspector_name)) {
          rr.team_members.push(sd.inspector_name);
        }
        addAudit(sd.inspector_name, 'SAVE_SHARED_PROGRESS', 'ROUTE_ROUND', `${rr.round_code || rr.round_no} เครื่อง #${sd.machine_id}`);
      }
      if (body.status) {
        rr.status = body.status;
        if (body.status === 'completed') rr.completed_at = nowStr();
      }
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/route-rounds\/\d+\/join$/) && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const rr = (raw.routeRounds || []).find(x => x.id === id);
    if (rr && body.inspector_name) {
      if (!Array.isArray(rr.team_members)) rr.team_members = [];
      if (!rr.team_members.includes(body.inspector_name)) {
        rr.team_members.push(body.inspector_name);
      }
      addAudit(body.inspector_name, 'JOIN_TEAM_ROUND', 'ROUTE_ROUND', rr.round_no);
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/route-rounds\/\d+\/draft$/) && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const rr = (raw.routeRounds || []).find(x => x.id === id);
    if (rr && body.machine_id) {
      if (!rr.stop_statuses) rr.stop_statuses = {};
      const key = String(body.machine_id);
      const prev = rr.stop_statuses[key] || { co_inspectors: [] };
      const coList = Array.from(new Set([...(prev.co_inspectors || []), body.inspector_name].filter(Boolean)));
      rr.stop_statuses[key] = {
        ...prev,
        status: 'checking',
        inspector_name: body.inspector_name || prev.inspector_name,
        co_inspectors: coList,
        updated_at: nowStr().slice(11, 16),
        draft_answers: body.draft_answers || {},
        inspector_note: body.inspector_note || ''
      };
      if (!Array.isArray(rr.team_members)) rr.team_members = [];
      if (body.inspector_name && !rr.team_members.includes(body.inspector_name)) {
        rr.team_members.push(body.inspector_name);
      }
      addAudit(body.inspector_name, 'SAVE_SHARED_PROGRESS', 'ROUTE_ROUND', `${rr.round_no} เครื่อง #${body.machine_id}`);
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/route-rounds/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldRr = (raw.routeRounds || []).find(x => x.id === id);
    raw.routeRounds = (raw.routeRounds || []).filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'ROUTE_ROUND', oldRr ? oldRr.round_no : `#${id}`, `ลบรอบการเดินตรวจเช็ค`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  if (url.match(/^\/api\/inspections\/\d+\/approve$/) && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.inspections.findIndex(x => x.id === id);
    const docNo = idx >= 0 ? raw.inspections[idx].doc_no : `#${id}`;
    if (idx >= 0) {
      raw.inspections[idx].approval_status = body.approval_status || 'approved';
      raw.inspections[idx].approved_by = body.approved_by || 'หัวหน้าแผนก';
      raw.inspections[idx].approved_at = nowStr();
    }
    addAudit(body.approved_by, 'APPROVE', 'INSPECTION', docNo, `อนุมัติใบตรวจเช็ค ${docNo} สถานะ: ${body.approval_status || 'approved'}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  if (url.startsWith('/api/inspections/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldIns = raw.inspections.find(x => x.id === id);
    raw.inspections = raw.inspections.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'INSPECTION', oldIns ? oldIns.doc_no : `#${id}`, `ลบประวัติใบตรวจเช็ค ${oldIns ? oldIns.doc_no : '#' + id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Defects
  if (url === '/api/defects' && method === 'POST') {
    const nextId = Math.max(0, ...raw.defects.map(x => x.id)) + 1;
    raw.documentSequence = (raw.documentSequence || 0) + 1;
    const ticketNo = ComisDomain.number('DEF', raw.documentSequence);
    raw.defects.unshift({ id: nextId, ticket_no: ticketNo, ...body, created_at: nowStr() });
    addAudit(body.reported_by, 'CREATE', 'DEFECT_TICKET', ticketNo, `เปิดใบแจ้งซ่อม ${ticketNo}: ${body.defect_title || ''}`);
    saveLocalDb(raw);
    return { ok: true, ticket_no: ticketNo, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/defects/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.defects.findIndex(x => x.id === id);
    const oldTicket = idx >= 0 ? raw.defects[idx] : null;
    if (idx >= 0) {
      raw.defects[idx] = { ...raw.defects[idx], ...body };

    }
    addAudit(body.actor, 'UPDATE', 'DEFECT_TICKET', `${oldTicket ? oldTicket.ticket_no : '#' + id} -> ${body.status}`, `อัปเดตสถานะงานซ่อมเป็น ${body.status}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/defects/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldTicket = raw.defects.find(x => x.id === id);
    raw.defects = raw.defects.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'DEFECT_TICKET', oldTicket ? oldTicket.ticket_no : `#${id}`, `ลบใบแจ้งซ่อม ${oldTicket ? oldTicket.ticket_no : '#' + id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Users
  if (url === '/api/users' && method === 'POST') {
    const nextId = Math.max(0, ...raw.users.map(x => x.id)) + 1;
    raw.users.push({ id: nextId, ...body, emp_code: body.emp_code.toUpperCase() });
    addAudit(body.actor, 'CREATE', 'USER', `${body.emp_code} - ${body.full_name}`, `เพิ่มผู้ใช้งานใหม่ ${body.full_name} (${body.role})`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/users/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.users.findIndex(x => x.id === id);
    if (idx >= 0) raw.users[idx] = { ...raw.users[idx], ...body, emp_code: body.emp_code.toUpperCase() };
    addAudit(body.actor, 'UPDATE', 'USER', `${body.emp_code} - ${body.full_name}`, `แก้ไขข้อมูลผู้ใช้งาน ${body.full_name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/users/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldUser = raw.users.find(x => x.id === id);
    raw.users = raw.users.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'USER', oldUser ? `${oldUser.emp_code} - ${oldUser.full_name}` : `#${id}`, `ลบผู้ใช้งานออกจากระบบ`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Settings
  if (url === '/api/settings' && method === 'PUT') {
    raw.settings = { ...raw.settings, ...body };
    addAudit(body.actor, 'UPDATE', 'SETTINGS', 'ตั้งค่าระบบและแจ้งเตือน Telegram', `บันทึกการตั้งค่าองค์กรและการแจ้งเตือน`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // 3D Machine Placements (P0-3 Server/Local Sync with Revision Check)
  const placementMatch = url.match(/^\/api\/machine-placements\/([^/]+)$/);
  if (placementMatch && method === 'PUT') {
    const machineCode = decodeURIComponent(placementMatch[1]).trim();
    if (!raw.machinePlacements || typeof raw.machinePlacements !== 'object' || Array.isArray(raw.machinePlacements)) {
      const nextMap = {};
      if (Array.isArray(raw.machinePlacements)) {
        raw.machinePlacements.forEach(item => {
          const c = item?.machineCode || item?.machine_code;
          if (c) nextMap[c] = item;
        });
      }
      raw.machinePlacements = nextMap;
    }
    const existing = raw.machinePlacements[machineCode] || null;
    const expectedRev = body.expectedRevision ?? body.expected_revision;
    if (existing && expectedRev !== undefined && Number(expectedRev) !== Number(existing.revision || 1)) {
      throw new Error(`พิกัดของ ${machineCode} ถูกแก้ไขไปแล้ว (Rev #${existing.revision}) กรุณารีเฟรช`);
    }
    const nextRev = existing ? Number(existing.revision || 1) + 1 : 1;
    const zoneId = String(body.zoneId ?? body.zone_id ?? existing?.zoneId ?? existing?.zone_id ?? 'production-west');
    const bayLabel = String(body.bayLabel ?? body.bay_label ?? existing?.bayLabel ?? existing?.bay_label ?? '');
    const anchorOffset = body.anchorOffset || body.anchor_offset || existing?.anchorOffset || {
      x: Number(body.x ?? existing?.x ?? 0),
      y: Number(body.y ?? existing?.y ?? 0),
      z: Number(body.z ?? existing?.z ?? 0)
    };
    const isVerified = body.locationVerified !== undefined ? Boolean(body.locationVerified) : Boolean(body.location_verified);
    raw.machinePlacements[machineCode] = {
      machineCode,
      zoneId,
      bayLabel,
      anchorOffset,
      x: Number(anchorOffset.x ?? 0),
      y: Number(anchorOffset.y ?? 0),
      z: Number(anchorOffset.z ?? 0),
      locationVerified: isVerified,
      verifiedBy: isVerified ? (body.actor || state?.activeUser?.full_name || 'System Admin') : (existing?.verifiedBy || ''),
      verifiedAt: isVerified ? nowStr() : (existing?.verifiedAt || ''),
      note: String(body.note ?? existing?.note ?? ''),
      revision: nextRev,
      updatedAt: nowStr()
    };
    addAudit(
      body.actor || state?.activeUser?.full_name || 'System Admin',
      'UPDATE_3D_PLACEMENT',
      '3D_PLACEMENT',
      `${machineCode} -> ${zoneId}`,
      `อัปเดตพิกัด 3D โซน ${zoneId} (${bayLabel || '-'}) Rev #${nextRev}`
    );
    saveLocalDb(raw);
    return { ok: true, revision: nextRev, data: enrichRawData(raw) };
  }

  // CSV Bulk Import (POST /api/csv-import)
  if (url === '/api/csv-import' && method === 'POST') {
    const entityType = String(body.entity_type || 'machines').trim();
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const actor = body.actor || state?.activeUser?.full_name || 'System Admin';
    let inserted = 0;
    let updated = 0;

    if (entityType === 'machines') {
      for (const r of rows) {
        const code = String(r.machine_code || '').trim().toUpperCase();
        const name = String(r.name || '').trim();
        if (!code || !name) continue;
        const deptCode = String(r.department_code || 'MECH').trim().toUpperCase();
        const deptObj = raw.departments.find(d => String(d.code).toUpperCase() === deptCode) || raw.departments[0];
        const deptId = deptObj ? deptObj.id : 1;
        const idx = raw.machines.findIndex(m => String(m.machine_code).toUpperCase() === code);
        const specs = {
          ...(idx >= 0 ? (raw.machines[idx].specs || {}) : {}),
          ...(r.motor_kw ? { motor_kw: r.motor_kw } : {}),
          ...(r.rpm ? { rpm: r.rpm } : {}),
          ...(r.max_temp_c ? { max_temp_c: r.max_temp_c } : {}),
          ...(r.max_vib_mms ? { max_vib_mms: r.max_vib_mms } : {})
        };
        if (idx >= 0) {
          raw.machines[idx] = {
            ...raw.machines[idx],
            name,
            category: r.category || raw.machines[idx].category || 'Rotating Equipment',
            department_id: deptId,
            plant_area: r.plant_area || raw.machines[idx].plant_area || 'อาคารผลิตหลัก',
            building: r.building || raw.machines[idx].building || 'Building A',
            line_zone: r.line_zone || raw.machines[idx].line_zone || 'Line 1',
            model_brand: r.model_brand || raw.machines[idx].model_brand || '-',
            serial_no: r.serial_no || raw.machines[idx].serial_no || '-',
            criticality: r.criticality || raw.machines[idx].criticality || 'B',
            operating_state: r.operating_status || r.operating_state || raw.machines[idx].operating_state || 'running',
            health_status: r.health_status || raw.machines[idx].health_status || 'normal',
            specs
          };
          updated++;
        } else {
          const nextId = Math.max(0, ...raw.machines.map(x => x.id)) + 1;
          raw.machines.push({
            id: nextId,
            machine_code: code,
            name,
            category: r.category || 'Rotating Equipment',
            department_id: deptId,
            plant_area: r.plant_area || 'อาคารผลิตหลัก',
            building: r.building || 'Building A',
            line_zone: r.line_zone || 'Line 1',
            model_brand: r.model_brand || '-',
            serial_no: r.serial_no || '-',
            criticality: r.criticality || 'B',
            operating_state: r.operating_status || r.operating_state || 'running',
            health_status: r.health_status || 'normal',
            running_hours: Number(r.running_hours || 1200),
            install_date: r.install_date || '2026-09-25',
            specs
          });
          inserted++;
        }
      }
    } else if (entityType === 'departments') {
      for (const r of rows) {
        const code = String(r.code || '').trim().toUpperCase();
        const name = String(r.name || '').trim();
        if (!code || !name) continue;
        const idx = raw.departments.findIndex(d => String(d.code).toUpperCase() === code);
        if (idx >= 0) {
          raw.departments[idx] = {
            ...raw.departments[idx],
            name,
            plant_name: r.plant_name || raw.departments[idx].plant_name || 'โรงงานหลัก',
            manager_name: r.manager_name || raw.departments[idx].manager_name || '-',
            color: r.color || raw.departments[idx].color || '#1f760e',
            description: r.description || raw.departments[idx].description || ''
          };
          updated++;
        } else {
          const nextId = Math.max(0, ...raw.departments.map(x => x.id)) + 1;
          raw.departments.push({
            id: nextId,
            code,
            name,
            plant_name: r.plant_name || 'โรงงานหลัก',
            manager_name: r.manager_name || '-',
            color: r.color || '#1f760e',
            icon: 'cog',
            description: r.description || ''
          });
          inserted++;
        }
      }
    } else if (entityType === 'users') {
      for (const r of rows) {
        const empCode = String(r.emp_code || '').trim().toUpperCase();
        const fullName = String(r.full_name || '').trim();
        if (!empCode || !fullName) continue;
        const deptCode = String(r.department_code || 'MECH').trim().toUpperCase();
        const deptObj = raw.departments.find(d => String(d.code).toUpperCase() === deptCode) || raw.departments[0];
        const deptId = deptObj ? deptObj.id : 1;
        const idx = raw.users.findIndex(u => String(u.emp_code).toUpperCase() === empCode);
        if (idx >= 0) {
          raw.users[idx] = {
            ...raw.users[idx],
            full_name: fullName,
            role: r.role || raw.users[idx].role || 'inspector',
            position: r.position_title || r.position || raw.users[idx].position || 'ช่างเทคนิคตรวจเช็ค',
            department_id: deptId,
            shift_group: r.shift_group || raw.users[idx].shift_group || 'กะ A',
            phone: r.phone || raw.users[idx].phone || ''
          };
          updated++;
        } else {
          const nextId = Math.max(0, ...raw.users.map(x => x.id)) + 1;
          raw.users.push({
            id: nextId,
            emp_code: empCode,
            full_name: fullName,
            role: r.role || 'inspector',
            position: r.position_title || r.position || 'ช่างเทคนิคตรวจเช็ค',
            department_id: deptId,
            shift_group: r.shift_group || 'กะ A',
            phone: r.phone || ''
          });
          inserted++;
        }
      }
    } else if (entityType === 'routes') {
      for (const r of rows) {
        const routeCode = String(r.route_code || '').trim().toUpperCase();
        const name = String(r.name || '').trim();
        if (!routeCode || !name) continue;
        const deptCode = String(r.department_code || 'MECH').trim().toUpperCase();
        const deptObj = raw.departments.find(d => String(d.code).toUpperCase() === deptCode) || raw.departments[0];
        const deptId = deptObj ? deptObj.id : 1;
        const defaultForm = raw.forms.find(f => Number(f.department_id) === Number(deptId)) || raw.forms[0];
        const machineCodes = String(r.machine_codes || '').split(/[;|,]/).map(s => s.trim()).filter(Boolean);
        const stops = [];
        machineCodes.forEach((mc, sIdx) => {
          const mObj = raw.machines.find(m => String(m.machine_code).toUpperCase() === mc.toUpperCase());
          if (mObj) {
            stops.push({
              stop_order: sIdx + 1,
              machine_id: mObj.id,
              form_id: defaultForm ? defaultForm.id : 1,
              stop_note: `จุดที่ ${sIdx + 1}: ตรวจเช็ค ${mObj.machine_code}`
            });
          }
        });
        const timeWindows = String(r.time_windows || '08:30-10:00|13:30-15:00').split('|').map(s => s.trim()).filter(Boolean);
        const shiftSchedules = timeWindows.map((tw, i) => ({
          shift: i === 0 ? 'กะเช้า' : i === 1 ? 'กะบ่าย' : 'กะดึก',
          time_window: tw,
          note: `รอบเดินตรวจที่ ${i + 1}`
        }));
        const teamInspectors = String(r.team_inspectors || '').split(/[;|,]/).map(s => s.trim()).filter(Boolean);
        const idx = (raw.routes || []).findIndex(rt => String(rt.route_code).toUpperCase() === routeCode);
        if (idx >= 0) {
          raw.routes[idx] = {
            ...raw.routes[idx],
            name,
            department_id: deptId,
            estimated_minutes: Number(r.estimated_minutes || raw.routes[idx].estimated_minutes || 35),
            time_windows: timeWindows,
            shift_schedules: shiftSchedules,
            team_inspectors: teamInspectors.length ? teamInspectors : (raw.routes[idx].team_inspectors || []),
            description: r.description || raw.routes[idx].description || '',
            stops: stops.length ? stops : (raw.routes[idx].stops || [])
          };
          updated++;
        } else {
          const nextId = Math.max(0, ...(raw.routes || []).map(x => x.id)) + 1;
          raw.routes.push({
            id: nextId,
            route_code: routeCode,
            name,
            department_id: deptId,
            estimated_minutes: Number(r.estimated_minutes || 35),
            time_windows: timeWindows,
            shift_schedules: shiftSchedules,
            team_inspectors: teamInspectors,
            description: r.description || '',
            stops
          });
          inserted++;
        }
      }
    }

    addAudit(
      actor,
      'BULK_IMPORT_CSV',
      entityType.toUpperCase(),
      `นำเข้า CSV (${entityType})`,
      `เพิ่มใหม่ ${inserted} รายการ, อัปเดต ${updated} รายการ (รวม ${inserted + updated} แถว)`
    );
    saveLocalDb(raw);
    return { ok: true, inserted, updated, data: enrichRawData(raw) };
  }

  // Client-Side Activity Log Event (e.g. 3D Placement Change)
  if (url === '/api/audit-logs/client-event' && method === 'POST') {
    raw.auditLogs.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      actor_name: body.actor_name || state?.activeUser?.full_name || 'System Admin',
      action_type: body.action_type || 'UPDATE',
      target_type: body.target_type || '3D_PLACEMENT',
      target_name: body.target_name || '-',
      detail: body.detail || '',
      can_undo: true,
      reverted: false,
      reverted_at: '',
      reverted_by: '',
      undo_payload: body.undo_payload || null,
      created_at: nowStr()
    });
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Undo / Rollback System Activity Log Entry
  if (url.match(/^\/api\/audit-logs\/\d+\/undo$/) && method === 'POST') {
    const id = Number(url.split('/')[3]);
    const actor = body?.actor || state?.activeUser?.full_name || 'System Admin';
    const logItem = (raw.auditLogs || []).find(x => Number(x.id) === id);
    if (!logItem) {
      throw new Error('ไม่พบรายการประวัติที่ต้องการย้อนกลับ');
    }
    if (!logItem.can_undo || !logItem.undo_payload) {
      throw new Error('รายการนี้ไม่มี Snapshot สำหรับย้อนข้อมูลกลับ');
    }
    if (logItem.reverted) {
      throw new Error('รายการนี้ถูกย้อนข้อมูลกลับไปแล้ว');
    }

    const undoPayload = logItem.undo_payload;
    const beforeUndoSnap = cloneDataSnapshot(raw);

    ComisDomain.localUndo(raw, undoPayload.changes);

    logItem.reverted = true;
    logItem.reverted_at = nowStr();
    logItem.reverted_by = actor;

    raw.auditLogs.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      actor_name: actor,
      action_type: 'UNDO_ROLLBACK',
      target_type: logItem.target_type,
      target_name: `ย้อนข้อมูลกลับ: ${logItem.target_name}`,
      detail: `กู้คืนข้อมูลกลับไปก่อนรายการ "${logItem.action_type} — ${logItem.target_name}"`,
      can_undo: true,
      reverted: false,
      reverted_at: '',
      reverted_by: '',
      undo_payload: {
        mode: 'local_snapshot',
        changes: ComisDomain.localChanges(beforeUndoSnap, cloneDataSnapshot(raw))
      },
      created_at: nowStr()
    });

    saveLocalDb(raw);
    return {
      ok: true,
      undone_log_id: id,
      undo_payload: undoPayload,
      data: enrichRawData(raw)
    };
  }

  // Purge Mockup Data (Preserve real user-entered records)
  if (url === '/api/system/purge-mockup' && method === 'POST') {
    purgeMockupRecordsFromRaw(raw, true);
    addAudit(
      body?.actor || state?.activeUser?.full_name || 'System Admin',
      'PURGE_MOCKUP',
      'DATABASE',
      'ล้างข้อมูลจำลอง (Mockup Data)',
      'ลบรายการจำลองเริ่มต้นออกทั้งหมด คงเหลือเฉพาะข้อมูลจริง'
    );
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  return { ok: true, data: enrichRawData(raw) };
}
