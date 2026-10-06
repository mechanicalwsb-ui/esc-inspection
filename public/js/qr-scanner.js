(function () {
  let stream = null, timer = null;
  function stop() { if (timer) clearTimeout(timer); timer = null; stream?.getTracks().forEach(t => t.stop()); stream = null; }
  function select(raw) {
    let code = String(raw || '').trim();
    if (code.startsWith('ESC:MACHINE:')) code = code.slice(12);
    else { try { code = new URL(code).searchParams.get('inspect_machine') || code; } catch (_) {} }
    const machine = state.data.machines.find(m => m.machine_code.toUpperCase() === code.toUpperCase());
    if (!machine) { showToast('ไม่พบรหัสเครื่องจักรนี้', 'warning'); return false; }
    stop(); closeModal(); startInspectionForMachine(machine.id); state.inspectSession.checkin_method = 'qr_scan'; renderCurrentTab(); return true;
  }
  async function camera() {
    const message = document.getElementById('comis-qr-message');
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { message.textContent = 'กล้องต้องใช้ HTTPS หรือ localhost สามารถกรอกรหัสหรือเลือกเครื่องด้านล่างได้'; return; }
    stop();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false });
      if (!document.getElementById('comis-qr-video')) { stop(); return; }
      const video = document.getElementById('comis-qr-video'); video.srcObject = stream; await video.play();
      const canvas = document.createElement('canvas'); const context = canvas.getContext('2d', { willReadFrequently: true });
      message.textContent = 'วาง QR ให้อยู่ตรงกลางภาพ';
      async function frame() {
        if (!stream || !document.getElementById('comis-qr-video')) { stop(); return; }
        if (video.readyState >= 2 && video.videoWidth) {
          canvas.width = Math.min(video.videoWidth, 640); canvas.height = Math.round(video.videoHeight * canvas.width / video.videoWidth);
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const image = context.getImageData(0, 0, canvas.width, canvas.height);
          const result = window.jsQR?.(image.data, image.width, image.height, { inversionAttempts: 'attemptBoth' });
          if (result && select(result.data)) return;
        }
        timer = setTimeout(frame, 200);
      }
      frame();
    } catch (err) { stop(); message.textContent = 'เปิดกล้องไม่ได้ กรุณาอนุญาตกล้อง หรือกรอกรหัสเครื่องจักร'; }
  }
  function open() {
    openModal('สแกน QR หรือกรอกรหัสเครื่องจักร', '<video id="comis-qr-video" muted playsinline></video><p id="comis-qr-message" role="status"></p><button onclick="ComisQR.camera()" class="px-4 py-2 bg-emerald-700 text-white rounded-lg">เปิดกล้อง</button><form id="comis-qr-manual"><label>รหัสเครื่องจักร<input id="comis-qr-code" required class="border rounded p-2 w-full" placeholder="เช่น ML-MIL-02"></label><button class="px-4 py-2 bg-emerald-700 text-white rounded-lg">เปิดหน้าตรวจ</button></form><select id="comis-qr-select" class="border rounded p-2 w-full"><option value="">หรือเลือกเครื่องจักร</option></select>');
    const options = document.getElementById('comis-qr-select');
    for (const m of state.data.machines) { const option=document.createElement('option'); option.value=m.machine_code; option.textContent=`${m.machine_code} — ${m.name}`; options.append(option); }
    options.onchange = () => { if (options.value) select(options.value); };
    document.getElementById('comis-qr-manual').onsubmit = e => { e.preventDefault(); select(document.getElementById('comis-qr-code').value); };
    camera();
  }
  window.ComisQR = { open, camera, stop, select };
})();
