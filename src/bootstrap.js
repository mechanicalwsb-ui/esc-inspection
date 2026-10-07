// Read models for the API; kept separate from request handlers.
function createBootstrap(db, Gateway) {
function getFullBootstrapData() {
  const departments = db.prepare(`
    SELECT d.*,
      (SELECT COUNT(*) FROM machines m WHERE m.department_id = d.id AND m.is_active = 1) as machine_count,
      (SELECT COUNT(*) FROM form_templates f WHERE f.department_id = d.id) as form_count,
      (SELECT COUNT(*) FROM users u WHERE u.department_id = d.id) as user_count
    FROM departments d
    ORDER BY d.id ASC
  `).all();

  const machines = db.prepare(`
    SELECT m.*, d.name as department_name, d.code as department_code, d.color as department_color, d.plant_name as division_name
    FROM machines m
    LEFT JOIN departments d ON m.department_id = d.id
    WHERE m.is_active = 1
    ORDER BY m.criticality ASC, m.machine_code ASC
  `).all().map(m => ({
    ...m,
    specs: JSON.parse(m.specs_json || '{}')
  }));

  const forms = db.prepare(`
    SELECT f.*, d.name as department_name, d.code as department_code, d.color as department_color, d.plant_name as division_name,
      m.machine_code as target_machine_code, m.name as target_machine_name
    FROM form_templates f
    LEFT JOIN departments d ON f.department_id = d.id
    LEFT JOIN machines m ON f.target_machine_id = m.id
    ORDER BY f.id DESC
  `).all().map(f => ({
    ...f,
    sections: JSON.parse(f.sections_json || '[]')
  }));

  const inspections = db.prepare(`
    SELECT i.*,
      m.machine_code, m.name as machine_name, m.plant_area, m.criticality,
      f.form_code, f.title as form_title,
      d.name as department_name, d.code as department_code, d.color as department_color, d.plant_name as division_name
    FROM inspections i
    LEFT JOIN machines m ON i.machine_id = m.id
    LEFT JOIN form_templates f ON i.form_id = f.id
    LEFT JOIN departments d ON i.department_id = d.id
    ORDER BY i.inspected_at DESC, i.id DESC
  `).all().map(i => ({
    ...i,
    answers: JSON.parse(i.answers_json || '[]'),
    co_inspectors: JSON.parse(i.co_inspectors_json || '[]')
  }));

  const defects = db.prepare(`
    SELECT dt.*,
      m.machine_code, m.name as machine_name, m.plant_area,
      d.name as assigned_dept_name, d.code as assigned_dept_code, d.color as assigned_dept_color, d.plant_name as assigned_division_name,
      i.doc_no as inspection_doc_no
    FROM defect_tickets dt
    LEFT JOIN machines m ON dt.machine_id = m.id
    LEFT JOIN departments d ON dt.assigned_dept_id = d.id
    LEFT JOIN inspections i ON dt.inspection_id = i.id
    ORDER BY
      CASE dt.status WHEN 'open' THEN 1 WHEN 'in_progress' THEN 2 WHEN 'waiting_parts' THEN 3 ELSE 4 END ASC,
      dt.id DESC
  `).all();

  const users = db.prepare(`
    SELECT u.*, d.name as department_name, d.code as department_code, d.color as department_color, d.plant_name as division_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    ORDER BY u.id ASC
  `).all();

  const routes = db.prepare(`
    SELECT r.*, d.name as department_name, d.code as department_code, d.color as department_color, d.plant_name as division_name
    FROM inspection_routes r
    LEFT JOIN departments d ON r.department_id = d.id
    ORDER BY r.id ASC
  `).all().map(r => {
    const rawStops = JSON.parse(r.stops_json || '[]');
    const enrichedStops = rawStops.map((st, idx) => {
      const m = machines.find(x => x.id === Number(st.machine_id));
      const f = forms.find(x => x.id === Number(st.form_id));
      return {
        ...st,
        stop_order: st.stop_order || idx + 1,
        machine_code: m ? m.machine_code : '-',
        machine_name: m ? m.name : '-',
        plant_area: m ? m.plant_area : '-',
        health_status: m ? m.health_status : 'normal',
        form_code: f ? f.form_code : '-',
        form_title: f ? f.title : '-'
      };
    });
    return {
      ...r,
      shift_schedules: JSON.parse(r.shift_schedules_json || '[]'),
      stops: enrichedStops
    };
  });

  const routeRounds = db.prepare(`
    SELECT rr.*, d.name as department_name, d.code as department_code, d.color as department_color
    FROM route_rounds rr
    LEFT JOIN departments d ON rr.department_id = d.id
    ORDER BY rr.id DESC
  `).all().map(rr => {
    const parentRoute = routes.find(x => x.id === Number(rr.route_id));
    const rawProgress = JSON.parse(rr.stops_progress_json || '[]');
    const stopsProgress = rawProgress.map((sp, idx) => {
      const m = machines.find(x => x.id === Number(sp.machine_id));
      const f = forms.find(x => x.id === Number(sp.form_id));
      const rtStop = (parentRoute?.stops || []).find(s => Number(s.machine_id) === Number(sp.machine_id));
      return {
        ...sp,
        stop_order: sp.stop_order || idx + 1,
        machine_code: m ? m.machine_code : '-',
        machine_name: m ? m.name : '-',
        plant_area: m ? m.plant_area : '-',
        stop_note: sp.stop_note || (rtStop ? rtStop.stop_note : ''),
        form_code: f ? f.form_code : '-',
        form_title: f ? f.title : '-'
      };
    });
    const completedCount = stopsProgress.filter(s => s.status === 'completed').length;
    const totalCount = stopsProgress.length || 1;
    return {
      ...rr,
      assigned_inspectors: JSON.parse(rr.assigned_inspectors_json || '[]'),
      stops_progress: stopsProgress,
      completed_stops: completedCount,
      total_stops: stopsProgress.length,
      progress_pct: Math.round((completedCount / totalCount) * 100)
    };
  });

  const settingsRows = db.prepare('SELECT key, value FROM system_settings').all();
  const settings = {};
  for (const r of settingsRows) settings[r.key] = r.value;

  const auditLogs = db.prepare('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 120').all().map(row => {
    let undoPayload = null;
    try { undoPayload = row.undo_json ? JSON.parse(row.undo_json) : null; } catch (_) {}
    return {
      ...row,
      can_undo: Boolean(row.can_undo && undoPayload?.changes?.length),
      reverted: Boolean(row.reverted),
      undo_payload: undoPayload
    };
  });

  const placementRows = db.prepare('SELECT * FROM machine_placements').all();
  const machinePlacements = placementRows.map(p => {
    let parsedOffset = { x: Number(p.x || 0), y: Number(p.y || 0), z: Number(p.z || 0) };
    if (p.anchor_offset_json && p.anchor_offset_json !== '{}') {
      try { parsedOffset = JSON.parse(p.anchor_offset_json); } catch (_) {}
    }
    return {
      machineCode: p.machine_code,
      machine_code: p.machine_code,
      zoneId: p.zone_id || null,
      zone_id: p.zone_id || null,
      bayLabel: p.bay_label || '',
      bay_label: p.bay_label || '',
      anchorOffset: parsedOffset,
      anchor_offset_json: p.anchor_offset_json || JSON.stringify(parsedOffset),
      x: Number(parsedOffset.x || p.x || 0),
      y: Number(parsedOffset.y || p.y || 0),
      z: Number(parsedOffset.z || p.z || 0),
      locationVerified: Boolean(p.location_verified),
      location_verified: Boolean(p.location_verified),
      verifiedBy: p.verified_by || '',
      verifiedAt: p.verified_at || '',
      note: p.note || '',
      revision: Number(p.revision || 1),
      updated_at: p.updated_at || ''
    };
  });

  return {
    revisions: Gateway.revisions(db),
    dataRevision: db.prepare('SELECT COALESCE(SUM(revision),0) AS n FROM entity_versions').get().n,
    departments,
    machines,
    forms,
    routes,
    routeRounds,
    inspections,
    defects,
    users,
    settings,
    auditLogs,
    machinePlacements
  };
}

return getFullBootstrapData;
}
module.exports = {createBootstrap};
