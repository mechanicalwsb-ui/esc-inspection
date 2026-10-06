const Domain = require('../public/js/domain');
// Uses the gateway's transaction; all rows succeed or all are rolled back.
function importRows(db, type, rows) {
  const tables = { machines: ['machines','machine_code'], departments: ['departments','code'], users: ['users','emp_code'], routes: ['inspection_routes','route_code'] };
  const [table, key] = tables[type]; let inserted=0, updated=0;
  for (const r of rows) {
    const code=String(r[key]).trim().toUpperCase();
    const old=db.prepare(`SELECT * FROM ${table} WHERE ${key}=?`).get(code);
    const dept=r.department_code ? db.prepare('SELECT id FROM departments WHERE code=?').get(r.department_code.trim().toUpperCase()).id : old?.department_id || null;
    let row;
    if(type==='machines') row={machine_code:code,name:r.name.trim(),department_id:dept,category:r.category||old?.category||'General Machinery',plant_area:r.plant_area||old?.plant_area||'อาคารผลิตหลัก',brand:r.brand??old?.brand??'',model:r.model??old?.model??'',criticality:r.criticality||old?.criticality||'B',operating_state:r.operating_state||old?.operating_state||'running',health_status:r.health_status||old?.health_status||'normal',running_hours:r.running_hours!==undefined&&r.running_hours!==''?Number(r.running_hours):old?.running_hours||0};
    if(type==='departments') row={code,name:r.name.trim(),plant_name:r.plant_name||old?.plant_name||'ฝ่ายวิศวกรรมจักรกล (EN)',manager_name:r.manager_name??old?.manager_name??'',color:r.color||old?.color||'#1f760e',description:r.description??old?.description??''};
    if(type==='users') row={emp_code:code,full_name:r.full_name.trim(),department_id:dept,role:r.role||old?.role||'inspector',position:r.position??old?.position??'',phone:r.phone??old?.phone??'',email:r.email??old?.email??''};
    if(type==='routes') {
      const codes=String(r.machine_codes||'').split('|').map(s=>s.trim()).filter(Boolean);
      const stops=codes.map((code,i)=>{const m=db.prepare('SELECT * FROM machines WHERE machine_code=?').get(code.toUpperCase());const f=db.prepare("SELECT id FROM form_templates WHERE is_active=1 AND (target_machine_id=? OR target_machine_id IS NULL AND (machine_category='ALL' OR machine_category=?)) ORDER BY CASE WHEN target_machine_id=? THEN 0 WHEN department_id=? THEN 1 ELSE 2 END,id LIMIT 1").get(m.id,m.category,m.id,dept);Domain.assert(f,`ไม่พบฟอร์มสำหรับ ${code}`);return {machine_id:m.id,form_id:f.id,stop_order:i+1};});
      const schedule=[{shift:r.shift_name||'กะเช้า (07:00-19:00)',time_window:r.shift_window||'07:30 - 09:30 น.',team_inspectors:String(r.team_inspectors||'').split('|').filter(Boolean)}];
      row={route_code:code,name:r.name.trim(),department_id:dept,description:r.description??old?.description??'',estimated_minutes:Number(r.estimated_minutes||old?.estimated_minutes||35),shift_schedules_json:JSON.stringify(schedule),stops_json:codes.length?JSON.stringify(stops):old?.stops_json||'[]'};
    }
    const columns=Object.keys(row);
    if(old){db.prepare(`UPDATE ${table} SET ${columns.map(c=>`${c}=?`).join(',')} WHERE id=?`).run(...columns.map(c=>row[c]),old.id);updated++;db.prepare('INSERT INTO entity_versions VALUES (?,1) ON CONFLICT(entity) DO UPDATE SET revision=revision+1').run(`/api/${type}/${old.id}`);}
    else{db.prepare(`INSERT INTO ${table} (${columns.join(',')}) VALUES (${columns.map(()=>'?').join(',')})`).run(...columns.map(c=>row[c]));inserted++;}
  }
  return {inserted_count:inserted,updated_count:updated};
}
module.exports={importRows};
