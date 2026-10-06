if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(reg => {
      function announce() {
        if (!reg.waiting || !navigator.serviceWorker.controller || document.getElementById('comis-update-banner')) return;
        const bar=document.createElement('div'); bar.id='comis-update-banner'; bar.className='comis-session-controls';
        const label=document.createElement('span'); label.textContent='มีระบบเวอร์ชันใหม่ ';
        const button=document.createElement('button'); button.textContent='โหลดเวอร์ชันใหม่';
        button.onclick=()=>{if(state.activeTab==='inspect'&&!confirm('มีฟอร์มกำลังกรอก กรุณาบันทึกก่อนโหลดใหม่ หรือยืนยันเพื่อโหลดใหม่'))return;reg.waiting.postMessage({type:'ACTIVATE_UPDATE'});};
        bar.append(label,button);document.querySelector('header').after(bar);
      }
      reg.addEventListener('updatefound',()=>reg.installing?.addEventListener('statechange',announce)); announce();
      let controlled=Boolean(navigator.serviceWorker.controller);
      navigator.serviceWorker.addEventListener('controllerchange',()=>{if(controlled)location.reload();controlled=true;});
    }).catch(err=>console.warn('Offline registration:',err));
  });
}
