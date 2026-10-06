const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {spawn}=require('node:child_process');
const {chromium}=require('playwright');
(async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'comis-browser-'));let output='';
 const child=spawn(process.execPath,['--no-warnings',path.resolve('server.js')],{windowsHide:true,env:{...process.env,PORT:'0',COMIS_HOST:'127.0.0.1',COMIS_DB_PATH:path.join(folder,'test.db'),COMIS_BACKUP_DIR:path.join(folder,'backups')},stdio:['ignore','pipe','pipe']});
 child.stdout.on('data',x=>output+=x);child.stderr.on('data',x=>output+=x);
 let browser;
 try {
  let port;for(let i=0;i<100;i++){port=output.match(/URL: http:\/\/localhost:(\d+)/)?.[1];if(Number(port))break;if(child.exitCode!==null)throw Error(output);await new Promise(r=>setTimeout(r,50));}assert.ok(Number(port),output);
  browser=await chromium.launch({headless:true,executablePath:process.env.COMIS_BROWSER_PATH||'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',args:['--disable-gpu']});
  const context=await browser.newContext({viewport:{width:1365,height:950}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const network=[];const receipts=[];page.on('response',async response=>{if(response.url().includes('/api/inspections')){try{const r=await response.json();receipts.push({revision:r.data?.dataRevision,n:r.data?.inspections.length,ok:r.ok});}catch(_){}}});page.on('request',req=>{if(/^https?:/.test(req.url())&&!req.url().startsWith(`http://127.0.0.1:${port}`))network.push(req.url());});
  await page.goto(`http://127.0.0.1:${port}`,{waitUntil:'networkidle'});
  assert.ok(await page.locator('#comis-login').isVisible());await page.locator('#comis-login input[name=password]').fill('Browser-admin-password!');await page.locator('#comis-login button').click();
  await page.waitForFunction(()=>typeof state!=='undefined'&&state.data.machines.length>0);
  for(const tab of ['machines','forms','departments','users','routes','defects','history','csvimport','auditlog','factory3d','inspect','dashboard']) {await page.evaluate(tab=>switchTab(tab),tab);await page.waitForTimeout(150);assert.ok((await page.locator('#main-content').innerText()).length>30,tab);}
  await page.screenshot({path:path.join(folder,'dashboard.png'),fullPage:true});
  await page.setViewportSize({width:1024,height:768});await page.evaluate(()=>{toggleTabletFieldMode();switchTab('users');});await page.waitForTimeout(100);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'Tablet layout must not overflow the page');await page.screenshot({path:path.join(folder,'tablet-users.png'),fullPage:true});await page.setViewportSize({width:1365,height:950});
  const fixture=await page.evaluate(async()=>{
    await apiRequest('/api/machines','POST',{machine_code:'BROWSER-01',name:'Browser test',department_id:5,category:'TEST'});const bootstrap=await apiRequest('/api/bootstrap');updateStateData(bootstrap.data);const m=state.data.machines.find(x=>x.machine_code==='BROWSER-01');
    const f=await apiRequest('/api/forms','POST',{form_code:'BROWSER-FORM',title:'Browser form',department_id:5,target_machine_id:m.id,machine_category:'ALL',require_signature:false,sections:[{title:'Test',fields:[{id:'n',label:'Number',field_type:'number_range',min_normal:0,max_normal:70,max_warning:80,required:true}]}]});updateStateData(f.data);
    return {machine_id:m.id,form_id:state.data.forms.find(x=>x.form_code==='BROWSER-FORM').id,machine_state_at_check:'running',answers:[{field_id:'n',value:50,status:'normal'}]};
  });
  const qr=await page.evaluate(()=>{const box=document.createElement('div');document.body.append(box);new QRCode(box,{text:'ESC:MACHINE:BROWSER-01',width:256,height:256});const c=box.querySelector('canvas');const pixels=c.getContext('2d').getImageData(0,0,c.width,c.height);const result=jsQR(pixels.data,pixels.width,pixels.height);box.remove();return result?.data;});assert.equal(qr,'ESC:MACHINE:BROWSER-01');
  await page.evaluate(f=>{startInspectionForMachine(f.machine_id);state.inspectSession.form_id=f.form_id;state.inspectSession.answers={};renderCurrentTab();markAllItemsNormal();},fixture);assert.ok(await page.evaluate(()=>!state.inspectSession.answers.n?.value),'Bulk pass must not fabricate numeric readings');
  await page.evaluate(async()=>{await navigator.serviceWorker.ready;});
  await page.waitForFunction(()=>Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true);
  const queued=await page.evaluate(payload=>apiRequest('/api/inspections','POST',payload),fixture);assert.equal(queued.queued,true);assert.equal(await page.evaluate(async()=>(await ComisStore.list('queue')).length),1);
  await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>typeof state!=='undefined'&&state.data.machines.length>0);assert.equal(await page.evaluate(async()=>(await ComisStore.list('queue')).length),1);
  await context.setOffline(false);await page.evaluate(()=>ComisSync.syncQueue());await page.waitForFunction(async()=>(await ComisStore.list('queue')).length===0);
  const info=await page.evaluate(async()=>({revision:state.data.dataRevision,inspections:state.data.inspections.map(i=>({machine_id:i.machine_id,doc_no:i.doc_no})),cache:(await ComisStore.get('cache','bootstrap'))?.data.inspections.map(i=>({machine_id:i.machine_id,doc_no:i.doc_no})),server:await (await fetch('/api/bootstrap')).json()}));
  assert.ok(info.inspections.some(i=>i.machine_id===fixture.machine_id),JSON.stringify({fixture:fixture.machine_id,revision:info.revision,synced:info.inspections,cache:info.cache,receipts,server:info.server.data?.inspections.map(i=>({machine_id:i.machine_id,doc_no:i.doc_no})),serverRevision:info.server.data?.dataRevision}));
  await page.evaluate(()=>openQuickQRScannerModal());await page.locator('#comis-qr-code').fill('BROWSER-01');await page.locator('#comis-qr-manual button').click();assert.equal(await page.evaluate(()=>state.inspectSession.machine_id),fixture.machine_id);
  assert.deepEqual(network,[],'All libraries/fonts/images must be local');assert.deepEqual(errors,[],'No browser script errors');
  await context.close();
  const local=await browser.newContext();const localPage=await local.newPage();const localErrors=[];localPage.on('pageerror',e=>localErrors.push(e.message));await localPage.goto(require('node:url').pathToFileURL(path.resolve('index.html')).href);await localPage.waitForFunction(()=>typeof state!=='undefined'&&state.data.machines.length>0);const before=await localPage.evaluate(()=>state.data.machines.length);
  await localPage.evaluate(async()=>{const r=await apiRequest('/api/machines','POST',{machine_code:'LOCAL-01',name:'Standalone test',department_id:5,category:'TEST'});updateStateData(r.data);});await localPage.reload();await localPage.waitForFunction(()=>typeof state!=='undefined'&&state.data.machines.some(m=>m.machine_code==='LOCAL-01'));assert.equal(await localPage.evaluate(()=>state.data.machines.length),before+1);assert.deepEqual(localErrors,[]);await local.close();
  console.log('PASS: login, twelve views, tablet layout, local assets, offline reload, IndexedDB queue, reconnect sync, QR decoding/manual fallback and standalone persistence.');console.log('Browser artifacts:',folder);
 } finally {if(browser)await browser.close();child.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
