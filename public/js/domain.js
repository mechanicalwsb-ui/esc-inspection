/* Shared rules used by SQLite, standalone storage and the offline queue. */
(function (root) {
  const version = '3.0.1';
  const dateParts = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()).reduce((o, p) => (o[p.type] = p.value, o), {});
  function day() { const p = dateParts(); return `${p.year}-${p.month}-${p.day}`; }
  function timestamp() { return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).format(new Date()); }
  function number(prefix, sequence) { return `${prefix}-${day().slice(0, 7).replace('-', '')}-${String(sequence).padStart(6, '0')}`; }
  function assert(condition, message) { if (!condition) { const e = new Error(message); e.status = 422; throw e; } }
  function classify(value, field) {
    const n = Number(value); assert(value !== '' && value !== null && Number.isFinite(n), `ค่าตัวเลขไม่ถูกต้อง: ${field.label}`);
    if (n >= Number(field.min_normal ?? -Infinity) && n <= Number(field.max_normal ?? Infinity)) return 'normal';
    return n > Number(field.max_warning ?? field.max_normal ?? Infinity) || n < Number(field.min_normal ?? -Infinity) ? 'abnormal' : 'warning';
  }
  function validateInspection(body, machine, form) {
    assert(machine && machine.is_active !== 0, 'ไม่พบเครื่องจักรที่เปิดใช้งาน');
    assert(form && form.is_active !== 0, 'ไม่พบแบบฟอร์มที่เปิดใช้งาน');
    const quick = body.inspection_type === 'emergency_quick';
    if (!quick) {
      assert(!form.target_machine_id || Number(form.target_machine_id) === Number(machine.id), 'แบบฟอร์มไม่ตรงกับเครื่องจักร');
      assert(!form.machine_category || form.machine_category === 'ALL' || form.machine_category === machine.category || Number(form.target_machine_id) === Number(machine.id), 'หมวดเครื่องจักรไม่ตรงกับฟอร์ม');
    }
    assert(['running', 'standby', 'maintenance', 'pending_repair', 'under_repair'].includes(body.machine_state_at_check || 'running'), 'สถานะเครื่องไม่ถูกต้อง');
    assert(Array.isArray(body.answers) && body.answers.length > 0, 'กรุณากรอกผลตรวจอย่างน้อยหนึ่งข้อ');
    const fields = (form.sections || JSON.parse(form.sections_json || '[]')).flatMap(s => s.fields || []);
    const seen = new Set();
    for (const a of body.answers) {
      assert(a && typeof a === 'object' && a.field_id && !seen.has(a.field_id), 'รหัสข้อคำถามซ้ำหรือไม่ถูกต้อง'); seen.add(a.field_id);
      const f = fields.find(f => f.id === a.field_id);
      assert(quick || f, 'มีข้อคำถามที่ไม่ได้อยู่ในแบบฟอร์ม');
      assert(['normal', 'warning', 'abnormal', 'na'].includes(a.status), 'สถานะคำตอบไม่ถูกต้อง');
      if (f) { a.label = f.label; a.unit = f.unit || ''; }
      if (f?.field_type === 'number_range' && a.status !== 'na') a.status = classify(a.value, f);
      if (a.status === 'na') assert(f?.running_only && body.machine_state_at_check !== 'running', 'ข้อนี้ไม่สามารถข้ามได้');
    }
    if (!quick) {
      for (const f of fields.filter(f => f.required)) {
        const a = body.answers.find(a => a.field_id === f.id);
        assert((f.running_only && body.machine_state_at_check !== 'running') || (a && a.value !== '' && a.value !== null && a.value !== undefined && a.status !== 'na'), `กรุณากรอกข้อ: ${f.label}`);
      }
      assert(!form.require_signature || /^data:image\/png;base64,/.test(body.signature_data || ''), 'กรุณาลงลายเซ็นก่อนบันทึก');
    }
    body.department_id = machine.department_id;
    body.force_open_defect = Boolean(body.force_open_defect || body.force_create_urgent_ticket);
    return body;
  }
  function csvRows(text) {
    const rows = []; let row = [], cell = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; }
      else if (c === ',' && !quoted) { row.push(cell); cell = ''; }
      else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some(c => c.trim())) rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    assert(!quoted, 'CSV มีเครื่องหมายคำพูดที่ไม่ปิด'); row.push(cell); if (row.some(c => c.trim())) rows.push(row);
    return rows;
  }
  function localChanges(before, after) {
    const result = [];
    for (const name of Object.keys(before || {})) {
      if (Array.isArray(before[name]) && Array.isArray(after[name])) {
        const a = new Map(before[name].map(r => [String(r.id ?? r.machine_code ?? r.machineCode), r]));
        const b = new Map(after[name].map(r => [String(r.id ?? r.machine_code ?? r.machineCode), r]));
        for (const id of new Set([...a.keys(), ...b.keys()])) if (JSON.stringify(a.get(id)) !== JSON.stringify(b.get(id))) result.push({ name, id, before: a.get(id) || null, after: b.get(id) || null });
      } else if (JSON.stringify(before[name]) !== JSON.stringify(after[name])) result.push({ name, before: before[name], after: after[name] });
    }
    return result;
  }
  function validateCsv(body, departments, machines) {
    const keys={machines:['machine_code','name'],departments:['code','name'],users:['emp_code','full_name'],routes:['route_code','name']};
    assert(keys[body.entity_type] && Array.isArray(body.rows) && body.rows.length>0 && body.rows.length<=5000,'ประเภทหรือจำนวนแถว CSV ไม่ถูกต้อง');const codes=new Set();
    for(const [i,row] of body.rows.entries()) {
      for(const k of keys[body.entity_type])assert(String(row[k]||'').trim(),`CSV แถว ${i+2}: ขาด ${k}`);
      const code=String(row[keys[body.entity_type][0]]).trim().toUpperCase();assert(!codes.has(code),`CSV มีรหัสซ้ำ: ${code}`);codes.add(code);
      if(row.department_code)assert(departments.some(d=>d.code===row.department_code.trim().toUpperCase()),`CSV แถว ${i+2}: ไม่พบแผนก`);
      if(row.machine_codes)for(const code of row.machine_codes.split('|').filter(Boolean))assert(machines.some(m=>m.machine_code===code.trim().toUpperCase()),`CSV: ไม่พบเครื่อง ${code}`);
      if(row.role)assert(['super_admin','dept_admin','inspector','viewer'].includes(row.role),'สิทธิ์ใน CSV ไม่ถูกต้อง');
      if(row.operating_state)assert(['running','standby','maintenance','pending_repair','under_repair'].includes(row.operating_state),'สถานะเครื่องใน CSV ไม่ถูกต้อง');
      if(row.health_status)assert(['normal','warning','abnormal'].includes(row.health_status),'ผลสุขภาพเครื่องใน CSV ไม่ถูกต้อง');
      if(row.criticality)assert(['A','B','C'].includes(row.criticality),'ระดับความสำคัญใน CSV ไม่ถูกต้อง');
      for(const k of ['running_hours','estimated_minutes'])if(row[k])assert(Number.isFinite(Number(row[k]))&&Number(row[k])>=0,`CSV: ${k} ไม่ถูกต้อง`);
    }
  }
  function localUndo(raw, changes) {
    assert(Array.isArray(changes) && changes.length, 'รายการเก่าไม่มีข้อมูลเปรียบเทียบที่ปลอดภัย');
    const rowId = r => String(r.id ?? r.machine_code ?? r.machineCode);
    for (const c of changes) { const current = c.id !== undefined ? raw[c.name].find(r => rowId(r) === c.id) || null : raw[c.name]; assert(JSON.stringify(current) === JSON.stringify(c.after), 'รายการนี้ถูกแก้ไขภายหลัง จึงไม่สามารถย้อนทับข้อมูลได้'); }
    for (const c of [...changes].reverse()) { if (c.id !== undefined) { raw[c.name] = raw[c.name].filter(r => rowId(r) !== c.id); if (c.before) raw[c.name].push(c.before); } else raw[c.name] = c.before; }
  }
  const api = { version, day, timestamp, number, assert, classify, validateInspection, validateCsv, csvRows, localChanges, localUndo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.ComisDomain = api;
})(typeof window === 'undefined' ? globalThis : window);
