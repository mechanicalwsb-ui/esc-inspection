const pageHeader=document.querySelector('body>header');
const headerIdentity=document.createElement('div');headerIdentity.className='headerIdentity';while(pageHeader.firstChild)headerIdentity.append(pageHeader.firstChild);
const headerControls=document.createElement('section');headerControls.className='headerControls';headerControls.setAttribute('aria-label','เครื่องมือและข้อมูลเอกสาร');
pageHeader.append(headerIdentity,headerControls);
headerControls.append(document.querySelector('.toolbar'));
if(typeof demoNotice!=='undefined')headerControls.append(demoNotice);
headerControls.append(document.querySelector('.meta'),$('status'),document.querySelector('.timebar'));
const initialHint=document.querySelector('.sheet>.hint');if(initialHint)initialHint.remove();
const style=document.createElement('style');style.textContent=`
@media screen{
body>header{display:grid;grid-template-columns:minmax(280px,360px) minmax(0,1fr);gap:24px;align-items:start;padding:22px 24px}
.headerIdentity{padding:12px 0}.headerIdentity h1{font-size:24px;line-height:1.5}.headerIdentity p{font-size:13px;line-height:1.6}
.headerControls{min-width:0;background:#f8fbf8;color:#18311e;padding:16px;border:1px solid #b7cdbd;border-radius:12px;box-shadow:0 5px 18px #06210f20}
.headerControls .toolbar{padding:0;gap:7px;margin-bottom:10px;display:flex;flex-wrap:wrap}.headerControls .toolbar button,.headerControls .toolbar .import{font-size:13px;padding:9px 11px;min-height:40px}
.headerControls .demoNotice{font-size:12px;margin:0 0 10px;padding:8px!important}
.headerControls .meta{grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px;margin:8px 0}.headerControls label{font-size:12px}.headerControls input{font-size:14px;padding:8px;margin-top:4px}.headerControls .meta small{font-size:10px;line-height:1.5}
.headerControls .status{font-size:12px;margin:8px 0}.headerControls .timebar{padding:10px;gap:8px;margin-top:8px}.headerControls .timebar strong{font-size:15px}.headerControls .timebar select{font-size:14px;padding:8px}.headerControls .timebar button{font-size:13px;min-height:38px;padding:7px 10px}.headerControls .progress{font-size:11px}
main{padding-top:18px}.entry{margin-top:0}
}
@media screen and (max-width:1200px){body>header{grid-template-columns:1fr;gap:12px}.headerIdentity{padding:0}.headerIdentity h1{margin:4px 0}.headerControls .meta{grid-template-columns:repeat(3,minmax(0,1fr))!important}}
@media screen and (max-width:600px){body>header{padding:16px 12px}.headerIdentity h1{font-size:20px}.headerControls{padding:12px}.headerControls .meta{grid-template-columns:repeat(2,minmax(0,1fr))!important}.headerControls .meta label:last-child{grid-column:1/-1}.headerControls input{font-size:16px}.headerControls .toolbar{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}.headerControls .toolbar button,.headerControls .toolbar .import{min-height:44px}.headerControls .timebar strong{width:100%}.headerControls .timebar .progress{width:100%;margin-left:0}}
`;document.head.append(style);
