const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs'); const os = require('node:os'); const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');
const Domain = require('../public/js/domain');
const Reliability = require('../src/reliability');
let proc, folder, base, adminCookie, machine, form, logs = '';
async function call(url, method='GET', body, cookie=adminCookie, headers={}) {
  const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json', ...(cookie?{Cookie:cookie}:{}),...headers},body:body===undefined?undefined:JSON.stringify(body)});
  const json=await r.json();return {status:r.status,json,cookie:r.headers.get('set-cookie')?.split(';')[0]};
}
const id = () => require('node:crypto').randomUUID().replaceAll('-','');
before(async()=>{
  folder=fs.mkdtempSync(path.join(os.tmpdir(),'comis-test-'));
  proc=spawn(process.execPath,['--no-warnings',path.resolve('server.js')],{env:{...process.env,PORT:'0',COMIS_HOST:'127.0.0.1',COMIS_DB_PATH:path.join(folder,'test.db'),COMIS_BACKUP_DIR:path.join(folder,'backups')},stdio:['ignore','pipe','pipe']});
  proc.stdout.on('data',x=>{logs+=x;});proc.stderr.on('data',x=>{logs+=x;});
  // Server prints its assigned port, so tests never collide with a real server.
  for(let i=0;i<100;i++){const m=logs.match(/URL: http:\/\/localhost:(\d+)/);if(m && Number(m[1])){base='http://127.0.0.1:'+m[1];break;}if(proc.exitCode!==null)throw Error(logs);await new Promise(r=>setTimeout(r,50));}
  assert.ok(base,logs);
  const setup=await call('/api/auth/setup','POST',{password:'Admin-test-password!'},null);assert.equal(setup.status,200);adminCookie=setup.cookie;
  const m=await call('/api/machines','POST',{machine_code:'TEST-01',name:'Test machine',department_id:5,category:'TEST'});assert.equal(m.status,201);machine=m.json.data.machines.find(m=>m.machine_code==='TEST-01');
  const f=await call('/api/forms','POST',{form_code:'TEST-FORM',title:'Test form',department_id:5,machine_category:'ALL',target_machine_id:machine.id,require_signature:false,sections:[{title:'Measurements',fields:[{id:'temperature',label:'Temperature',field_type:'number_range',min_normal:0,max_normal:70,max_warning:80,required:true}]}]});assert.equal(f.status,201);form=f.json.data.forms.find(f=>f.form_code==='TEST-FORM');
});
after(async()=>{if(proc && proc.exitCode===null){proc.kill();await new Promise(resolve=>proc.once('exit',resolve));} /* Retain fixture for inspection; never touches data/comis.db. */});
function inspection(value=60){return {machine_id:machine.id,form_id:form.id,machine_state_at_check:'running',answers:[{field_id:'temperature',value,status:'normal'}],inspector_name:'Impersonated user',inspector_code:'FAKE'};}
test('Authentication, role enforcement and trusted audit actor',async()=>{
  assert.equal((await call('/api/bootstrap','GET',undefined,null)).status,401);
  const u=await call('/api/users','POST',{emp_code:'TEST-VIEWER',full_name:'Viewer',role:'viewer',department_id:5});assert.equal(u.status,201);const user=u.json.data.users.find(u=>u.emp_code==='TEST-VIEWER');
  assert.equal((await call('/api/auth/password','POST',{user_id:user.id,password:'Viewer-temp-password!'})).status,200);
  let login=await call('/api/auth/login','POST',{emp_code:user.emp_code,password:'Viewer-temp-password!'},null);assert.equal(login.status,200);
  const changed=await call('/api/auth/password','POST',{current_password:'Viewer-temp-password!',password:'Viewer-final-password!'},login.cookie);assert.equal(changed.status,200);
  assert.equal((await call('/api/machines','POST',{machine_code:'FORBIDDEN',name:'No'},changed.cookie)).status,403);
  const data=(await call('/api/bootstrap','GET',undefined,changed.cookie)).json.data;assert.equal(data.settings.telegram_bot_token,undefined);assert.equal(data.auditLogs[0].undo_payload,undefined);
});
test('Inspection thresholds, monthly numbering and retry idempotency',async()=>{
  const requestId=id(), payload=inspection(90);
  const first=await call('/api/inspections','POST',payload,adminCookie,{'Idempotency-Key':requestId});assert.equal(first.status,201,JSON.stringify(first.json));assert.equal(first.json.overall_result,'abnormal');assert.match(first.json.doc_no,new RegExp('^INS-'+Domain.day().slice(0,7).replace('-','')+'-'));assert.ok(first.json.created_ticket_no);
  assert.ok(first.json.data.inspections.some(i=>i.doc_no===first.json.doc_no),'Successful write returns current data');
  const second=await call('/api/inspections','POST',payload,adminCookie,{'Idempotency-Key':requestId});assert.equal(second.status,201);assert.equal(second.json.doc_no,first.json.doc_no);assert.equal(second.json.replayed,true);
  const record=second.json.data.inspections.find(i=>i.doc_no===first.json.doc_no);assert.notEqual(record.inspector_name,'Impersonated user');
  assert.equal((await call('/api/inspections','POST',inspection(55),adminCookie,{'Idempotency-Key':requestId})).status,409);
});
test('Validation fails without partial records; normal result preserves open repair',async()=>{
  const before=(await call('/api/bootstrap')).json.data;
  const bad=inspection('not a number');assert.equal((await call('/api/inspections','POST',bad)).status,422);
  const after=(await call('/api/bootstrap')).json.data;assert.equal(after.inspections.length,before.inspections.length);
  const normal=await call('/api/inspections','POST',inspection(50));assert.equal(normal.status,201);assert.equal(normal.json.data.machines.find(m=>m.id===machine.id).health_status,'normal');assert.ok(normal.json.data.defects.some(d=>d.machine_id===machine.id&&d.status==='open'));
});
test('CSV import is atomic and preserves multiline quoted data',async()=>{
  const parsed=Domain.csvRows('code,name\r\n"A","line 1\nline 2, quoted ""text"""');assert.equal(parsed[1][1],'line 1\nline 2, quoted "text"');
  const good=await call('/api/csv-import','POST',{entity_type:'machines',rows:[{machine_code:'CSV-OK',name:'CSV machine',department_code:'ML'}]});assert.equal(good.status,200,JSON.stringify(good.json));
  const bad=await call('/api/csv-import','POST',{entity_type:'machines',rows:[{machine_code:'CSV-ROLLBACK',name:'Should rollback',department_code:'ML'},{machine_code:'CSV-BAD',name:'Bad dept',department_code:'UNKNOWN'}]});assert.equal(bad.status,422);assert.ok(!(await call('/api/bootstrap')).json.data.machines.some(m=>m.machine_code==='CSV-ROLLBACK'));
});
test('Placement revision conflicts do not fall back to local success',async()=>{
  const url='/api/machine-placements/TEST-01';
  const first=await call(url,'PUT',{zone_id:'production-center',bay_label:'Test',anchor_offset:{x:1,y:0,z:2},expected_revision:0});assert.equal(first.status,200,JSON.stringify(first.json));
  const conflict=await call(url,'PUT',{zone_id:'production-center',expected_revision:0});assert.equal(conflict.status,409);
});
test('Entity revisions reject stale edits and undo preserves unrelated newer rows',async()=>{
  const created=await call('/api/machines','POST',{machine_code:'UNDO-01',name:'Original',department_id:5});const m=created.json.data.machines.find(x=>x.machine_code==='UNDO-01');
  const payload={...m,name:'Changed'};
  const edit=await call('/api/machines/'+m.id,'PUT',payload,adminCookie,{'If-Match':'0'});assert.equal(edit.status,200);const log=edit.json.data.auditLogs.find(l=>l.action_type==='UPDATE'&&l.target_name.startsWith('UNDO-01'));
  assert.equal((await call('/api/machines/'+m.id,'PUT',payload,adminCookie,{'If-Match':'0'})).status,409);
  await call('/api/machines','POST',{machine_code:'UNRELATED-NEW',name:'Newer row',department_id:5});
  const undo=await call('/api/audit-logs/'+log.id+'/undo','POST',{});assert.equal(undo.status,200,JSON.stringify(undo.json));assert.equal(undo.json.data.machines.find(x=>x.id===m.id).name,'Original');assert.ok(undo.json.data.machines.some(x=>x.machine_code==='UNRELATED-NEW'));
});
test('Undo blocks overwriting rows changed after the original operation',async()=>{
  const created=await call('/api/machines','POST',{machine_code:'UNDO-CONFLICT',name:'One',department_id:5});const m=created.json.data.machines.find(x=>x.machine_code==='UNDO-CONFLICT');
  const edit=await call('/api/machines/'+m.id,'PUT',{...m,name:'Two'},adminCookie,{'If-Match':'0'});const log=edit.json.data.auditLogs.find(l=>l.action_type==='UPDATE'&&l.target_name.startsWith('UNDO-CONFLICT'));
  await call('/api/machines/'+m.id,'PUT',{...m,name:'Three'},adminCookie,{'If-Match':'1'});
  const undo=await call('/api/audit-logs/'+log.id+'/undo','POST',{});assert.equal(undo.status,409);assert.equal((await call('/api/bootstrap')).json.data.machines.find(x=>x.id===m.id).name,'Three');
});
test('Verified backup can be restored into a separate database',async()=>{
  const db=new DatabaseSync(path.join(folder,'test.db'),{readOnly:true});const backup=Reliability.backup(db,path.join(folder,'restore-check'));db.close();const restored=path.join(folder,'restored.db');fs.copyFileSync(backup,restored);const check=new DatabaseSync(restored,{readOnly:true});assert.equal(check.prepare('PRAGMA integrity_check').get().integrity_check,'ok');assert.equal(check.prepare('PRAGMA foreign_key_check').all().length,0);assert.ok(check.prepare('SELECT COUNT(*) AS n FROM machines').get().n);check.close();
  const edited=new DatabaseSync(restored);edited.prepare("UPDATE machines SET name='Before restore test' WHERE machine_code='TEST-01'").run();edited.close();
  const restore=spawnSync(process.execPath,['--no-warnings',path.resolve('src/backup-cli.js'),'restore',backup,'--server-stopped'],{windowsHide:true,env:{...process.env,COMIS_DB_PATH:restored},encoding:'utf8'});assert.equal(restore.status,0,restore.stderr);const actual=new DatabaseSync(restored,{readOnly:true});assert.equal(actual.prepare("SELECT name FROM machines WHERE machine_code='TEST-01'").get().name,machine.name);actual.close();
});
test('Database failure rolls back inspection, health, ticket and document sequence together',async()=>{
  const db=new DatabaseSync(path.join(folder,'test.db'));const before=(await call('/api/bootstrap')).json.data;const health=before.machines.find(m=>m.id===machine.id).health_status;
  db.exec("CREATE TRIGGER force_ticket_failure BEFORE INSERT ON defect_tickets BEGIN SELECT RAISE(ABORT, 'test failure'); END");
  try { const failed=await call('/api/inspections','POST',inspection(100));assert.equal(failed.status,500);const after=(await call('/api/bootstrap')).json.data;assert.equal(after.inspections.length,before.inspections.length);assert.equal(after.defects.length,before.defects.length);assert.equal(after.machines.find(m=>m.id===machine.id).health_status,health); }
  finally { db.exec('DROP TRIGGER force_ticket_failure');db.close(); }
});
test('Shared drafts use revisions and emergency checks do not complete route stops',async()=>{
  const route=await call('/api/routes','POST',{route_code:'TEST-ROUTE',name:'Test route',department_id:5,stops:[{machine_id:machine.id,form_id:form.id,stop_order:1}],shift_schedules:[]});assert.equal(route.status,201);const rt=route.json.data.routes.find(r=>r.route_code==='TEST-ROUTE');
  const round=await call('/api/route-rounds','POST',{route_id:rt.id,assigned_inspectors:[]});assert.equal(round.status,201);const rr=round.json.data.routeRounds.find(r=>r.route_id===rt.id);
  const url='/api/route-rounds/'+rr.id;const body={shared_draft_save:{machine_id:machine.id,answers:{temperature:{field_id:'temperature',label:'Temperature',value:45,status:'normal',checked_by:'Forged'}}}};
  const saved=await call(url,'PUT',body,adminCookie,{'If-Match':'0'});assert.equal(saved.status,200);assert.notEqual(saved.json.data.routeRounds.find(r=>r.id===rr.id).stops_progress[0].shared_draft_answers.temperature.checked_by,'Forged');
  assert.equal((await call(url,'PUT',body,adminCookie,{'If-Match':'0'})).status,409);
  const quick=await call('/api/inspections','POST',{...inspection(90),inspection_type:'emergency_quick',route_round_id:rr.id,route_revision:1});assert.equal(quick.status,201);assert.notEqual(quick.json.data.routeRounds.find(r=>r.id===rr.id).stops_progress[0].status,'completed');
  const latest=quick.json.data.revisions[url];const complete=await call('/api/inspections','POST',{...inspection(50),route_round_id:rr.id,route_revision:latest});assert.equal(complete.status,201);assert.equal(complete.json.data.routeRounds.find(r=>r.id===rr.id).status,'completed');
});
test('Existing production database upgrades on a copy without changing business records',async()=>{
  const original=new DatabaseSync(path.resolve('data/comis.db'),{readOnly:true});const copy=path.join(folder,'upgrade-copy.db');original.prepare('VACUUM INTO ?').run(copy);
  const tables=original.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all().map(r=>r.name);const before=Object.fromEntries(tables.map(t=>[t,original.prepare(`SELECT * FROM ${t}`).all()]));original.close();
  let output='';const upgrade=spawn(process.execPath,['--no-warnings',path.resolve('server.js')],{windowsHide:true,env:{...process.env,PORT:'0',COMIS_HOST:'127.0.0.1',COMIS_DB_PATH:copy,COMIS_BACKUP_DIR:path.join(folder,'upgrade-backups')},stdio:['ignore','pipe','pipe']});upgrade.stdout.on('data',x=>output+=x);upgrade.stderr.on('data',x=>output+=x);
  try {for(let i=0;i<100&&!output.includes('URL:');i++){if(upgrade.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,50));}assert.match(output,/URL:/);const upgraded=new DatabaseSync(copy,{readOnly:true});for(const table of tables)assert.deepEqual(upgraded.prepare(`SELECT * FROM ${table}`).all(),before[table],table);assert.equal(upgraded.prepare('PRAGMA foreign_key_check').all().length,0);assert.ok(upgraded.prepare("SELECT name FROM sqlite_master WHERE name='credentials'").get());upgraded.close();}
  finally {upgrade.kill();await new Promise(resolve=>upgrade.once('exit',resolve));}
});
test('Stopped machines can skip running-only numbers without reporting measured normal values',()=>{
  const template={machine_category:'ALL',require_signature:0,sections:[{fields:[{id:'speed',label:'Speed',field_type:'number_range',min_normal:0,max_normal:100,max_warning:120,running_only:true,required:true}]}]};
  const body={machine_state_at_check:'standby',answers:[{field_id:'speed',value:'Not measured while stopped',status:'na'}]};
  assert.doesNotThrow(()=>Domain.validateInspection(body,{id:1,category:'TEST'},template));
  assert.throws(()=>Domain.validateInspection({...body,machine_state_at_check:'running'},{id:1,category:'TEST'},template));
});
