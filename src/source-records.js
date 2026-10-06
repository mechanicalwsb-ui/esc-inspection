const fs = require('node:fs');
const path = require('node:path');
require('../public/assets/source-forms/catalogue');
const catalogue = globalThis.SourceCatalogue;
const sourceRoot = process.env.COMIS_SOURCE_DOCUMENTS || 'C:\\Users\\autocad06\\OneDrive - easternsugar.co.th\\02.OneDriver วิศวกรรมจักรกล\\02.ลูกหีบ-SP\\03.เอกสาร\\18.เอกสารบันทึก';
const assert = require('../public/js/domain').assert;
function initialize(db) {
  db.exec(`CREATE TABLE IF NOT EXISTS source_form_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT, request_id TEXT NOT NULL UNIQUE,
    source_id TEXT NOT NULL, source_hash TEXT NOT NULL, department_id INTEGER REFERENCES departments(id),
    user_id INTEGER NOT NULL REFERENCES users(id), author TEXT NOT NULL, created_at TEXT NOT NULL,
    payload_json TEXT NOT NULL
  )`);
}
function validate(body) {
  const doc = catalogue.find(d=>d.id===body.source_id && d.mode==='form');
  assert(doc, 'ไม่พบแบบฟอร์มบันทึก');
  assert(body.source_hash===doc.sha256, 'ต้นแบบเปลี่ยน กรุณาโหลดใหม่');
  assert(typeof body.request_id==='string' && /^[a-f0-9-]{36}$/.test(body.request_id), 'รหัสบันทึกไม่ถูกต้อง');
  assert(typeof body.date==='string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date) && !Number.isNaN(Date.parse(body.date)) && new Date(body.date).toISOString().slice(0,10)===body.date, 'วันที่ไม่ถูกต้อง');
  assert(typeof body.machine==='string' && body.machine.trim() && body.machine.length<=200, 'ระบุเครื่องจักร/พื้นที่');
  for(const key of ['shift','production_year','note']) assert(body[key]===undefined || typeof body[key]==='string' && body[key].length<=4000, 'ข้อความยาวเกินกำหนด');
  assert(Array.isArray(body.rows) && body.rows.length>0 && body.rows.length<=200, 'จำนวนรายการต้องเป็น 1–200');
  for(const row of body.rows) {
    assert(row && typeof row==='object' && !Array.isArray(row), 'รายการไม่ถูกต้อง');
    assert(typeof row.time==='string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(row.time), 'ระบุเวลาของทุกรายการ');
    assert(Array.isArray(row.values) && row.values.length===doc.fields.length, 'ช่องบันทึกไม่ตรงต้นแบบ');
    assert(row.values.some(v=>v!==''), 'รายการว่าง');
    for(const [i,v] of row.values.entries()) {
      assert(typeof v==='string' && v.length<=1000, 'ค่าบันทึกไม่ถูกต้อง');
      const f=doc.fields[i];
      if(f.kind==='check') assert(['normal','abnormal','corrected','na'].includes(v), 'ต้องเลือกผลตรวจทุกข้อ');
      if(f.kind==='number' && v!=='') assert(v.trim() && Number.isFinite(Number(v)), 'ค่าที่วัดต้องเป็นตัวเลข');
    }
    assert(typeof row.remark==='string' && row.remark.length<=4000, 'หมายเหตุไม่ถูกต้อง');
    if(row.values.some(v=>['abnormal','corrected','na'].includes(v))) assert(row.remark.trim(), 'ผลผิดปกติ/แก้ไขแล้ว/ไม่ได้ตรวจต้องระบุปัญหา การแก้ไข หรือเหตุผล');
  }
  return doc;
}
async function handle({db,req,res,pathname,body,sendJson,logAudit}) {
  if(!pathname.startsWith('/api/source-')) return false;
  const user=res._user;
  if(pathname==='/api/source-catalogue' && req.method==='GET') {sendJson(res,200,{ok:true,documents:catalogue});return true;}
  if(pathname.startsWith('/api/source-documents/') && req.method==='GET') {
    const doc=catalogue.find(d=>d.id===pathname.split('/')[3]);
    if(!doc) {sendJson(res,404,{ok:false,error:'ไม่พบเอกสาร'});return true;}
    const target=path.resolve(sourceRoot,doc.path);
    if(!target.startsWith(path.resolve(sourceRoot)+path.sep)) throw new Error('Invalid source path');
    try {
      const bytes=fs.readFileSync(target); // Only file operation: read. No write API exists.
      res.writeHead(200,{'Content-Type':doc.extension==='.pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','Content-Disposition':`inline; filename*=UTF-8''${encodeURIComponent(path.basename(target))}`,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(bytes);
    } catch(e) {sendJson(res,404,{ok:false,error:'ต้นฉบับไม่พร้อมใช้งานบนเซิร์ฟเวอร์นี้'});}
    return true;
  }
  if(pathname==='/api/source-records' && req.method==='GET') {
    const rows=user.role==='super_admin'?db.prepare('SELECT * FROM source_form_records ORDER BY id DESC LIMIT 1000').all():db.prepare('SELECT * FROM source_form_records WHERE department_id=? ORDER BY id DESC LIMIT 1000').all(user.department_id);
    sendJson(res,200,{ok:true,records:rows.map(r=>({...r,payload:JSON.parse(r.payload_json),payload_json:undefined}))});return true;
  }
  if(pathname==='/api/source-records' && req.method==='POST') {
    const doc=validate(body);
    const old=db.prepare('SELECT * FROM source_form_records WHERE request_id=?').get(body.request_id);
    const clean={source_id:body.source_id,source_hash:body.source_hash,date:body.date,machine:body.machine,shift:body.shift||'',production_year:body.production_year||'',note:body.note||'',rows:body.rows,template:{code:doc.code,title:doc.title,revision:doc.revision,fields:doc.fields}};
    if(old) {assert(old.user_id===user.id && old.payload_json===JSON.stringify(clean),'รหัสบันทึกนี้ใช้กับข้อมูลอื่นแล้ว');sendJson(res,200,{ok:true,id:old.id,replayed:true});return true;}
    const id=db.prepare('INSERT INTO source_form_records(request_id,source_id,source_hash,department_id,user_id,author,created_at,payload_json) VALUES(?,?,?,?,?,?,?,?)').run(body.request_id,doc.id,doc.sha256,user.department_id,user.id,user.full_name,require('../public/js/domain').timestamp(),JSON.stringify(clean)).lastInsertRowid;
    logAudit(user.full_name,'CREATE','SOURCE_FORM_RECORD',`${doc.code} #${id}`);
    sendJson(res,201,{ok:true,id:Number(id)});return true;
  }
  sendJson(res,405,{ok:false,error:'เอกสารต้นฉบับอ่านได้อย่างเดียว; ผลบันทึกเพิ่มได้เท่านั้น'});return true;
}
module.exports={initialize,handle,validate,catalogue};
