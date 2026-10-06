const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process'),{createHash,randomUUID}=require('node:crypto'),{chromium}=require('playwright');
require('../public/assets/source-forms/catalogue');
(async()=>{
const docs=globalThis.SourceCatalogue;assert.equal(docs.length,59);assert.equal(docs.filter(d=>d.mode==='form').length,39);
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'comis-source-forms-'));let output='',browser;
const child=spawn(process.execPath,['--no-warnings',path.resolve('server.js')],{windowsHide:true,env:{...process.env,PORT:'0',COMIS_HOST:'127.0.0.1',COMIS_DB_PATH:path.join(folder,'test.db'),COMIS_BACKUP_DIR:path.join(folder,'backups')},stdio:['ignore','pipe','pipe']});child.stdout.on('data',b=>output+=b);child.stderr.on('data',b=>output+=b);
try{
let port;for(let i=0;i<100;i++){port=output.match(/URL: http:\/\/localhost:(\d+)/)?.[1];if(port)break;await new Promise(r=>setTimeout(r,50));}assert.ok(port,output);const base=`http://127.0.0.1:${port}`;
assert.equal((await fetch(base+'/api/source-records')).status,401);
assert.equal((await fetch(base+'/api/source-catalogue')).status,401);
assert.equal((await fetch(base+'/assets/source-forms/catalogue.js')).status,401);
const setup=await fetch(base+'/api/auth/setup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:'Source-form-admin-password!'})});assert.equal(setup.status,200);const cookie=setup.headers.get('set-cookie').split(';')[0];
async function call(url,method='GET',body){return fetch(base+url,{method,headers:{Cookie:cookie,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});}
const doc=docs.find(d=>d.code==='FM-SF04-SF-06');const body={request_id:randomUUID(),source_id:doc.id,source_hash:doc.sha256,date:'2026-10-01',machine:'TEST-GRINDER',shift:'1',production_year:'2569/70',note:'test',rows:[{time:'07:00',values:doc.fields.map(()=> 'normal'),remark:''}]};
let r=await call('/api/source-records','POST',body);assert.equal(r.status,201,await r.clone().text());const id=(await r.json()).id;
r=await call('/api/source-records','POST',body);assert.equal(r.status,200);assert.equal((await r.json()).id,id);assert.equal((await (await call('/api/source-records')).json()).records.length,1);
assert.equal((await call('/api/source-records','POST',{...body,machine:'OTHER'})).status,422);
assert.equal((await call('/api/source-records','POST',{...body,request_id:randomUUID(),rows:[{time:'25:00',values:body.rows[0].values,remark:''}]})).status,422);
assert.equal((await call('/api/source-records','POST',{...body,request_id:randomUUID(),rows:[{time:'07:00',values:doc.fields.map(()=> 'abnormal'),remark:''}]})).status,422);
assert.equal((await call('/api/source-documents/'+doc.id,'PUT',{})).status,405);
assert.equal((await call('/api/source-documents/%2e%2e%2fserver.js')).status,404);
r=await call('/api/source-documents/'+doc.id);assert.equal(r.status,200);assert.equal(createHash('sha256').update(Buffer.from(await r.arrayBuffer())).digest('hex'),doc.sha256);
browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',args:['--disable-gpu']});const context=await browser.newContext({viewport:{width:1024,height:768}});await context.addCookies([{name:'comis_session',value:cookie.split('=')[1],url:base}]);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base+'/source-forms.html');await page.waitForSelector('#record-form');
for(const d of docs.filter(d=>d.mode==='form')){await page.evaluate(id=>choose(id),d.id);assert.equal(await page.locator('[data-value]').count(),d.fields.length,d.code);}
await page.evaluate(id=>choose(id),doc.id);await page.locator('[data-name=machine]').fill('BROWSER-GRINDER');await page.locator('select[data-value]').evaluateAll(els=>els.forEach(e=>{e.value='normal';e.dispatchEvent(new Event('change',{bubbles:true}));}));await page.locator('#draft').click();await page.reload();await page.waitForSelector('#record-form');await page.evaluate(id=>choose(id),doc.id);assert.equal(await page.locator('[data-name=machine]').inputValue(),'BROWSER-GRINDER');await page.locator('#save').click();await page.waitForFunction(()=>document.getElementById('message').textContent.includes('สำเร็จ #'));
assert.equal((await (await call('/api/source-records')).json()).records.length,2);await page.locator('#history').click();await page.waitForSelector('[data-record]');await page.locator('[data-record]').first().click();assert.equal(await page.locator('[data-name=machine]').isDisabled(),true);assert.equal(await page.locator('#save').count(),0);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:path.join(folder,'source-form-tablet.png'),fullPage:true});
const local=await browser.newContext();const lp=await local.newPage();await lp.goto(require('node:url').pathToFileURL(path.resolve('public/source-forms.html')).href);await lp.waitForSelector('#record-form');await lp.evaluate(id=>choose(id),doc.id);await lp.locator('[data-name=machine]').fill('LOCAL-GRINDER');await lp.locator('select[data-value]').evaluateAll(els=>els.forEach(e=>{e.value='normal';e.dispatchEvent(new Event('change',{bubbles:true}));}));await lp.locator('#save').click();await lp.waitForFunction(()=>document.getElementById('message').textContent.includes('สำเร็จ #'));await lp.reload();await lp.waitForSelector('#history');await lp.locator('#history').click();await lp.waitForSelector('[data-record]');assert.equal(await lp.locator('[data-record]').count(),1);
assert.deepEqual(errors,[]);console.log('PASS: 59 docs, all 39 forms render, source hash/read-only, authentication, immutable records, validation, deduplicated retries, draft persistence, tablet and standalone saving. Artifacts: '+folder);
}finally{if(browser)await browser.close();child.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
