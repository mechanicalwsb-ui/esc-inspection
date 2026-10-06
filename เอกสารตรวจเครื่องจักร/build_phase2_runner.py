import pymupdf
import sys
import base64
import json
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

root = Path(r"C:\Users\autocad06\OneDrive - easternsugar.co.th\02.OneDriver วิศวกรรมจักรกล\06.AI Projects\260925 ตรวจเช็คเครื่องจักรออนไลน์\เอกสารตรวจเครื่องจักร")
base_folder = root / "แบบฟอร์มหลัก"
fonts_folder = root / "fonts"

print("1. Preloading fonts as base64...")
font_payloads = {}
for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
    font_path = fonts_folder / font
    if font_path.exists():
        font_payloads[font] = base64.b64encode(font_path.read_bytes()).decode('ascii')
print(f"Loaded {len(font_payloads)} fonts.")

print("2. Preloading vendor jsQR...")
jsqr_path = (root / "../public/assets/vendor/jsQR.js").resolve()
jsqr_code = jsqr_path.read_text(encoding='utf-8') if jsqr_path.exists() else ""

def get_pdf_artwork(pdf_name):
    pdf_path = base_folder / pdf_name
    doc = pymupdf.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=260)
    png_bytes = pix.tobytes("png")
    return "data:image/png;base64," + base64.b64encode(png_bytes).decode("ascii")

# Common CSS Template
CSS_TEMPLATE = """
@font-face {
  font-family: 'TH Sarabun';
  src: url('data:font/ttf;base64,__FONT_TH_SARABUN__') format('truetype');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'TH Sarabun';
  src: url('data:font/ttf;base64,__FONT_TH_SARABUN_BOLD__') format('truetype');
  font-weight: 700;
  font-display: swap;
}
@font-face {
  font-family: 'Sarabun Web';
  src: url('data:font/ttf;base64,__FONT_SARABUN_REGULAR__') format('truetype');
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: 'Sarabun Web';
  src: url('data:font/ttf;base64,__FONT_SARABUN_BOLD__') format('truetype');
  font-weight: 700;
  font-display: swap;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  background: #f4f7f4;
  color: #173722;
  font-family: 'Sarabun Web', sans-serif;
  font-size: 15px;
  line-height: 1.5;
}
header {
  background: #143d25;
  color: white;
  padding: 22px 28px;
}
header small {
  display: block;
  font-size: 13px;
  color: #a8cfb2;
  letter-spacing: .5px;
}
header h1 {
  font-size: 24px;
  margin: 6px 0 4px;
  font-weight: 700;
}
header p {
  margin: 0;
  font-size: 14px;
  color: #d2e6d6;
}
main {
  padding: 0 20px 24px;
  max-width: 1440px;
  margin: 0 auto;
}
.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px 0;
}
button, .import-btn {
  font-family: inherit;
  font-size: 14px;
  border: 1px solid #bfd0c1;
  border-radius: 7px;
  background: white;
  padding: 9px 15px;
  cursor: pointer;
  color: #173c24;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all .15s ease;
  user-select: none;
}
button:hover, .import-btn:hover {
  background: #eaf2eb;
  border-color: #8da992;
}
button.primary {
  background: #236b38;
  color: white;
  border-color: #1d582e;
  font-weight: 600;
}
button.primary:hover {
  background: #1a562c;
}
button:disabled, .import-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.sheet {
  background: white;
  border: 1px solid #dce5dc;
  border-radius: 10px;
  padding: 22px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.03);
}
.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 18px;
  background: #f8faf8;
  border: 1px solid #e1ebe2;
  padding: 14px 18px;
  border-radius: 8px;
}
label {
  display: block;
  font-size: 13px;
  color: #4b6650;
}
input, select, textarea {
  font-family: inherit;
  font-size: 15px;
  border: 1px solid #ccd6ce;
  border-radius: 5px;
  padding: 8px 10px;
  width: 100%;
  background: white;
  color: #173c24;
  margin-top: 5px;
}
input:focus, select:focus, textarea:focus {
  outline: 2px solid #3e9b55;
  border-color: #3e9b55;
}
.kpi-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin: 16px 0;
}
.kpi-card {
  background: #f0f6f1;
  border: 1px solid #cfe0d2;
  border-radius: 8px;
  padding: 12px 16px;
}
.kpi-title {
  font-size: 12px;
  color: #55755b;
  text-transform: uppercase;
  font-weight: bold;
}
.kpi-value {
  font-size: 22px;
  font-weight: bold;
  color: #164625;
  margin-top: 4px;
}
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin: 16px 0 12px;
}
.table-wrap {
  overflow-x: auto;
  border: 1px solid #d0dcd2;
  border-radius: 8px;
  background: white;
}
table.event-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  min-width: 950px;
}
table.event-table th {
  background: #e9f1ea;
  color: #163d24;
  padding: 10px 8px;
  border: 1px solid #c2d5c6;
  text-align: center;
  font-weight: 600;
  white-space: nowrap;
}
table.event-table td {
  padding: 6px 8px;
  border: 1px solid #d7e4da;
  text-align: center;
  vertical-align: middle;
}
table.event-table tbody tr:nth-child(even) {
  background: #fbfdfb;
}
table.event-table tbody tr:hover {
  background: #f1f7f2;
}
table.event-table td input {
  margin: 0;
  padding: 5px 6px;
  font-size: 13px;
  border: 1px solid transparent;
  background: transparent;
  text-align: center;
}
table.event-table td input:hover {
  border-color: #ccd6ce;
  background: white;
}
table.event-table td input:focus {
  background: white;
  border-color: #236b38;
}
.badge-duration {
  display: inline-block;
  background: #e6f3ea;
  color: #1f6434;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
.btn-del {
  color: #b73824;
  background: transparent;
  border: 0;
  padding: 4px 8px;
  font-size: 14px;
  cursor: pointer;
  border-radius: 4px;
}
.btn-del:hover {
  background: #faeae8;
}
.signatures {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin: 24px 0 16px;
}
.sigcard {
  border: 1px solid #ccdace;
  border-radius: 8px;
  padding: 14px;
  background: #fdfefd;
}
.sigcard h3 {
  margin: 0 0 10px;
  font-size: 14px;
  color: #1e4a2d;
  text-align: center;
  font-weight: bold;
}
.sigpreview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 110px;
  border: 1px dashed #a5bba9;
  margin: 10px 0;
  background: white;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
.sigpreview canvas {
  width: 100%;
  height: 100%;
}
.sigpreview span {
  font-size: 12px;
  color: #718474;
}
.sigbuttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}
.sigbuttons button {
  flex: 1;
  padding: 8px 4px;
  font-size: 13px;
}
footer {
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  color: #5d7563;
  border-top: 1px solid #e1ebe2;
  padding-top: 14px;
}
dialog {
  border: 0;
  border-radius: 12px;
  padding: 22px;
  max-width: min(540px, 94vw);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}
dialog::backdrop {
  background: rgba(10, 40, 20, 0.65);
}
dialog h2 {
  margin: 0 0 14px;
  font-size: 19px;
  color: #173c24;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin: 14px 0;
}
.form-grid.full {
  grid-column: 1 / -1;
}
.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
#templatePrint {
  display: none;
}
@page {
  size: A4 landscape;
  margin: 0;
}
@media print {
  body > * {
    display: none !important;
  }
  body > #templatePrint {
    display: block !important;
    width: 297mm !important;
    height: 210mm !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  html, body {
    width: 297mm !important;
    height: 210mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: white !important;
  }
}
"""

def inject_fonts(css):
    return (css
        .replace("__FONT_TH_SARABUN__", font_payloads.get("THSarabun.ttf", ""))
        .replace("__FONT_TH_SARABUN_BOLD__", font_payloads.get("THSarabun-Bold.ttf", ""))
        .replace("__FONT_SARABUN_REGULAR__", font_payloads.get("Sarabun-Regular.ttf", ""))
        .replace("__FONT_SARABUN_BOLD__", font_payloads.get("Sarabun-Bold.ttf", ""))
    )

COMMON_MAKEPDF_JS = """
function makePDF(jpeg, w, h) {
  const enc = new TextEncoder(), chunks = [];
  let size = 0;
  const offsets = [0];
  const put = s => {
    const bytes = typeof s === 'string' ? enc.encode(s) : s;
    chunks.push(bytes);
    size += bytes.length;
  };
  put('%PDF-1.4\\n');
  const obj = (id, body) => {
    offsets[id] = size;
    put(id + ' 0 obj\\n' + body + '\\nendobj\\n');
  };
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 841.89 595.28] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
  offsets[4] = size;
  put('4 0 obj\\n<< /Type /XObject /Subtype /Image /Width ' + w + ' /Height ' + h + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>\\nstream\\n');
  put(jpeg);
  put('\\nendstream\\nendobj\\n');
  const content = 'q 841.89 0 0 595.28 0 0 cm /Im0 Do Q';
  obj(5, '<< /Length ' + enc.encode(content).length + ' >>\\nstream\\n' + content + '\\nendstream');
  const xref = size;
  put('xref\\n0 6\\n0000000000 65535 f \\n');
  for (let i = 1; i <= 5; i++) put(String(offsets[i]).padStart(10, '0') + ' 00000 n \\n');
  put('trailer\\n<< /Size 6 /Root 1 0 R >>\\nstartxref\\n' + xref + '\\n%%EOF');
  return new Blob(chunks, { type: 'application/pdf' });
}
"""

COMMON_SIG_JS = """
let signatureData = {};

function isLocked() {
  return Boolean(signatureData.auditor && signatureData.recorder);
}

function updateLock() {
  const locked = isLocked();
  const notice = $('lockNotice');
  const unlockBtn = $('unlockBtn');
  if (notice) notice.hidden = !locked;
  if (unlockBtn) unlockBtn.hidden = !locked;
  document.querySelectorAll('input:not([type=file]):not(#unlockPassword), select, textarea').forEach(el => {
    el.readOnly = locked;
    if (el.tagName === 'SELECT') el.disabled = locked;
  });
  if ($('import')) $('import').disabled = locked;
  if ($('addEventBtn')) $('addEventBtn').disabled = locked;
  document.querySelectorAll('.btn-del').forEach(b => b.disabled = locked);
  document.querySelectorAll('[data-sign], [data-remove-sign]').forEach(b => b.disabled = locked);
}

function renderSignatures() {
  for (const id of Object.keys(roles)) {
    const sig = signatureData[id];
    const preview = $('preview_' + id);
    if (!preview) continue;
    preview.replaceChildren();
    const c = document.createElement('canvas');
    c.width = 600;
    c.height = 250;
    preview.append(c);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    if (sig) {
      const points = sig.strokes.flat();
      const minX = Math.min(...points.map(p => p[0]));
      const maxX = Math.max(...points.map(p => p[0]));
      const minY = Math.min(...points.map(p => p[1]));
      const maxY = Math.max(...points.map(p => p[1]));
      const dx = Math.max(0.02, maxX - minX);
      const dy = Math.max(0.02, maxY - minY);
      const aspect = sig.aspect || 1200 / 450;
      const scale = Math.min(540 / (dx * aspect), 160 / dy);
      const w = dx * aspect * scale, h = dy * scale;
      const ox = (600 - w) / 2, oy = 15 + (160 - h) / 2;
      
      ctx.strokeStyle = '#153e24';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      for (const stroke of sig.strokes) {
        ctx.beginPath();
        stroke.forEach((p, j) => {
          const sx = ox + ((p[0] - minX) / dx) * w;
          const sy = oy + ((p[1] - minY) / dy) * h;
          if (j) ctx.lineTo(sx, sy); else ctx.moveTo(sx, sy);
        });
        ctx.stroke();
      }
      ctx.fillStyle = '#153e24';
      ctx.textAlign = 'center';
      ctx.font = 'bold 15px "Sarabun Web"';
      const name = ($('name_' + id)?.value.trim() || sig.name || roles[id]);
      ctx.fillText(name, 300, 195);
      ctx.font = '13px "Sarabun Web"';
      const timeStr = 'เซ็นเมื่อ ' + new Date(sig.signedAt).toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok', day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }) + ' น.';
      ctx.fillText(timeStr, 300, 218);
      if (sig.gps) {
        ctx.font = '11px "Sarabun Web"';
        ctx.fillStyle = '#56755e';
        ctx.fillText(`GPS: ${sig.gps.lat.toFixed(5)}, ${sig.gps.lng.toFixed(5)}`, 300, 236);
      }
    } else {
      const span = document.createElement('span');
      span.textContent = 'ยังไม่ได้ลงลายเซ็น';
      preview.replaceChildren(span);
    }
  }
}

let signingRole = null, draft = [], activePointer = null;
function drawDraft() {
  const c = $('sigCanvas'), r = c.getBoundingClientRect(), ratio = Math.min(2, devicePixelRatio || 1);
  if (r.width > 0 && r.height > 0) {
    c.width = Math.round(r.width * ratio);
    c.height = Math.round(r.height * ratio);
  }
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.strokeStyle = '#e2ebe4';
  ctx.lineWidth = 1;
  const step = 25;
  ctx.beginPath();
  for (let x = step; x < c.width; x += step) { ctx.moveTo(x, 0); ctx.lineTo(x, c.height); }
  for (let y = step; y < c.height; y += step) { ctx.moveTo(0, y); ctx.lineTo(c.width, y); }
  ctx.stroke();
  
  ctx.strokeStyle = '#153e24';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const stroke of draft) {
    ctx.beginPath();
    stroke.forEach((p, i) => {
      const px = p[0] * c.width, py = p[1] * c.height;
      if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py);
    });
    ctx.stroke();
  }
}

function point(e) {
  const r = $('sigCanvas').getBoundingClientRect();
  return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))];
}

$('sigCanvas').onpointerdown = e => {
  if (activePointer !== null) return;
  e.preventDefault();
  activePointer = e.pointerId;
  $('sigCanvas').setPointerCapture(e.pointerId);
  draft.push([point(e)]);
  drawDraft();
};
$('sigCanvas').onpointermove = e => {
  if (e.pointerId !== activePointer) return;
  e.preventDefault();
  draft[draft.length - 1].push(point(e));
  drawDraft();
};
$('sigCanvas').onpointerup = $('sigCanvas').onpointercancel = e => {
  if (e.pointerId === activePointer) activePointer = null;
};

document.addEventListener('click', e => {
  const signTarget = e.target.closest('[data-sign]');
  if (signTarget) {
    signingRole = signTarget.dataset.sign;
    $('sigTitle').textContent = 'ลงลายเซ็น: ' + roles[signingRole];
    draft = [];
    $('sigDialog').showModal();
    requestAnimationFrame(drawDraft);
    return;
  }
  const removeTarget = e.target.closest('[data-remove-sign]');
  if (removeTarget) {
    const role = removeTarget.dataset.removeSign;
    if (confirm('ต้องการลบลายเซ็น ' + roles[role] + ' หรือไม่?')) {
      delete signatureData[role];
      renderSignatures();
      updateLock();
      save();
    }
  }
});

$('confirmSig').onclick = async () => {
  if (!draft.length || draft.every(s => !s.length)) {
    alert('กรุณาเซ็นชื่อก่อนกดยืนยัน');
    return;
  }
  let gps = null;
  try {
    if (navigator.geolocation) {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 }));
      gps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    }
  } catch (err) {}
  
  signatureData[signingRole] = {
    signedAt: new Date().toISOString(),
    strokes: draft,
    name: $('name_' + signingRole)?.value.trim() || '',
    aspect: 1200 / 450,
    gps: gps
  };
  $('sigDialog').close();
  renderSignatures();
  updateLock();
  save();
};

$('clearDraft').onclick = () => { draft = []; drawDraft(); };
$('cancelSig').onclick = () => $('sigDialog').close();

// Unlock Dialog
$('unlockBtn').onclick = () => {
  $('unlockPassword').value = '';
  $('unlockError').textContent = '';
  $('unlockDialog').showModal();
  $('unlockPassword').focus();
};
$('unlockConfirm').onclick = () => {
  if ($('unlockPassword').value !== '1234') {
    $('unlockError').textContent = 'รหัสผ่านไม่ถูกต้อง (รหัสมาตรฐาน: 1234)';
    return;
  }
  signatureData = {};
  $('unlockDialog').close();
  renderSignatures();
  updateLock();
  save();
};
$('unlockCancel').onclick = () => $('unlockDialog').close();
"""

print("Generating FM-ML01-ML-05...")
art_05 = get_pdf_artwork("FM-ML01-ML-05 Rev.00 แบบบันทึกการลดรอบลูกหีบ.pdf")

html_05 = f"""<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FM-ML01-ML-05 แบบบันทึกการลดรอบลูกหีบ</title>
<style>
{inject_fonts(CSS_TEMPLATE)}
</style>
</head>
<body>
<header>
  <small>FM-ML01-ML-05 • Rev.00 • ฝ่าย วิศวกรรมจักรกล • แผนก ลูกหีบ</small>
  <h1>แบบบันทึกการลดรอบลูกหีบ</h1>
  <p>บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) สาขาวังสมบูรณ์</p>
</header>

<main>
  <div class="toolbar">
    <button class="primary" id="saveBtn">💾 บันทึกในเครื่อง</button>
    <button id="addEventBtn">➕ บันทึกเหตุการณ์ลดรอบ</button>
    <button id="demoBtn">🧪 ตัวอย่างข้อมูล (Demo)</button>
    <button id="exportBtn">📥 ดาวน์โหลด JSON</button>
    <label class="import-btn">📤 นำเข้า JSON<input id="import" type="file" accept=".json" hidden></label>
    <button id="csvBtn">📊 ส่งออก CSV</button>
    <button id="pdfBtn">📄 บันทึก PDF</button>
    <button id="printBtn">🖨️ พิมพ์</button>
    <button id="resetBtn">🔄 เริ่มใหม่</button>
  </div>

  <div id="lockNotice" class="sheet" style="background:#eaf5ec;border-color:#7bb587;margin-bottom:14px;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;" hidden>
    <div style="font-weight:bold;color:#185929;">🔒 เอกสารได้รับการรับรองและลงลายเซ็นครบถ้วนแล้ว — ข้อมูลถูกล็อกเพื่อป้องกันการแก้ไข</div>
    <button id="unlockBtn" class="primary" style="padding:6px 14px;font-size:13px;">ปลดล็อกเพื่อแก้ไข</button>
  </div>

  <div class="sheet">
    <div class="meta">
      <label>วันที่บันทึก<input type="date" id="date"></label>
      <label>ปีการผลิต<input type="text" id="year" placeholder="เช่น 2567/2568" value="2567/2568"></label>
      <label>ฝ่าย<input type="text" id="department" value="วิศวกรรมจักรกล" readonly></label>
      <label>แผนก<input type="text" id="section" value="ลูกหีบ" readonly></label>
    </div>

    <div class="kpi-bar">
      <div class="kpi-card">
        <div class="kpi-title">จำนวนครั้งที่ลดรอบ</div>
        <div class="kpi-value" id="kpiCount">0 ครั้ง</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">เวลารวมที่ลดรอบ</div>
        <div class="kpi-value" id="kpiDuration">0 นาที</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">ความเร็วรอบเฉลี่ย (ชุด 1)</div>
        <div class="kpi-value" id="kpiAvgSpeed">- rpm</div>
      </div>
    </div>

    <div class="action-bar">
      <div style="font-weight:bold;font-size:16px;color:#184424;">รายการบันทึกเหตุการณ์การลดรอบลูกหีบ (29 รายการต่อแผ่น)</div>
      <div style="font-size:13px;color:#55705b;">* คลิกที่ช่องในตารางเพื่อพิมพ์แก้ไขได้โดยตรง</div>
    </div>

    <div class="table-wrap">
      <table class="event-table" id="eventTable">
        <thead>
          <tr>
            <th style="width:40px;">ลำดับ</th>
            <th style="width:85px;">วันที่</th>
            <th style="width:70px;">เวลาเริ่ม</th>
            <th style="width:70px;">เวลาสิ้นสุด</th>
            <th style="width:75px;">ระยะเวลา</th>
            <th>สาเหตุการลดรอบ</th>
            <th style="width:85px;">แผนกที่สั่ง</th>
            <th style="width:80px;">ความเร็ว (rpm)</th>
            <th style="width:85px;">น้ำอ้อยรวม (m³/h)</th>
            <th style="width:85px;">น้ำพรม (m³/h)</th>
            <th style="width:85px;">ผู้บันทึก</th>
            <th style="width:85px;">ผู้ทวนสอบ</th>
            <th style="width:85px;">ผู้ตรวจสอบ</th>
            <th style="width:110px;">หมายเหตุ</th>
            <th style="width:45px;">ลบ</th>
          </tr>
        </thead>
        <tbody id="eventBody"></tbody>
      </table>
    </div>

    <div class="signatures">
      <div class="sigcard">
        <h3>ผู้บันทึก (พนักงาน)</h3>
        <label>ชื่อผู้บันทึก<input id="name_recorder" placeholder="ระบุชื่อ-นามสกุล"></label>
        <div class="sigpreview" id="preview_recorder"><span>ยังไม่ได้ลงลายเซ็น</span></div>
        <div class="sigbuttons">
          <button data-sign="recorder">✍️ เซ็นชื่อ</button>
          <button data-remove-sign="recorder">ลบ</button>
        </div>
      </div>
      <div class="sigcard">
        <h3>ผู้ทวนสอบ (หัวหน้ากะ)</h3>
        <label>ชื่อหัวหน้ากะ<input id="name_supervisor" placeholder="ระบุชื่อ-นามสกุล"></label>
        <div class="sigpreview" id="preview_supervisor"><span>ยังไม่ได้ลงลายเซ็น</span></div>
        <div class="sigbuttons">
          <button data-sign="supervisor">✍️ เซ็นชื่อ</button>
          <button data-remove-sign="supervisor">ลบ</button>
        </div>
      </div>
      <div class="sigcard">
        <h3>ผู้ตรวจสอบ (วิศวกร)</h3>
        <label>ชื่อวิศวกร<input id="name_auditor" placeholder="ระบุชื่อ-นามสกุล"></label>
        <div class="sigpreview" id="preview_auditor"><span>ยังไม่ได้ลงลายเซ็น</span></div>
        <div class="sigbuttons">
          <button data-sign="auditor">✍️ เซ็นชื่อ</button>
          <button data-remove-sign="auditor">ลบ</button>
        </div>
      </div>
    </div>

    <footer>
      <span>โรงงาน: 1573 หมู่ 1 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250 • โทรศัพท์ 092-2573931, 086-3951210</span>
      <span>FM-ML01-ML-05 (Rev.00) 04/01/2564</span>
    </footer>
  </div>
</main>

<img id="templatePrint" alt="Printed Artwork">

<!-- Modal Add Event -->
<dialog id="eventModal">
  <h2>➕ บันทึกเหตุการณ์ลดรอบลูกหีบ</h2>
  <form id="eventForm" method="dialog">
    <div class="form-grid">
      <label>วันที่<input type="date" id="m_date" required></label>
      <label>แผนกที่สั่งลดรอบ
        <select id="m_dept">
          <option value="ลูกหีบ">ลูกหีบ</option>
          <option value="หม้อต้ม">หม้อต้ม</option>
          <option value="ลานอ้อย">ลานอ้อย</option>
          <option value="ไฟฟ้า/ไอน้ำ">ไฟฟ้า/ไอน้ำ</option>
          <option value="ควบคุมคุณภาพ">ควบคุมคุณภาพ</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
      </label>
      <label>เวลาเริ่ม<input type="time" id="m_start" required></label>
      <label>เวลาสิ้นสุด<input type="time" id="m_end" required></label>
      <label class="form-grid full">สาเหตุการลดรอบ
        <input type="text" id="m_reason" list="reasons_list" placeholder="ระบุสาเหตุ เช่น รออ้อย, หม้อต้มเร่งไม่ทัน" required>
        <datalist id="reasons_list">
          <option value="รออ้อยเข้าดั้มพ์">
          <option value="หม้อต้มรองรับน้ำอ้อยไม่ทัน">
          <option value="ความร้อนหม้อต้มตก">
          <option value="แรงดันไอน้ำลดลง">
          <option value="มอเตอร์สะพานดั้มพ์อุณหภูมิสูง">
          <option value="รางเทอ้อยอัดแน่น">
          <option value="ปรับแต่งรอบเครื่องจักร">
        </datalist>
      </label>
      <label>ความเร็วลูกหีบ ชุด 1 (rpm)<input type="number" step="0.1" id="m_speed" placeholder="เช่น 4.5"></label>
      <label>ปริมาณน้ำอ้อยรวม (m³/hr)<input type="number" step="0.1" id="m_juice" placeholder="เช่น 180"></label>
      <label>ปริมาณน้ำพรม (m³/hr)<input type="number" step="0.1" id="m_water" placeholder="เช่น 45"></label>
      <label>หมายเหตุ<input type="text" id="m_remark" placeholder="ข้อความเพิ่มเติม"></label>
    </div>
    <div class="dialog-actions">
      <button type="button" id="m_cancel">ยกเลิก</button>
      <button type="submit" class="primary">บันทึกรายการ</button>
    </div>
  </form>
</dialog>

<!-- Signature Modal -->
<dialog id="sigDialog">
  <h2 id="sigTitle">ลงลายเซ็น</h2>
  <canvas id="sigCanvas" width="600" height="250"></canvas>
  <div class="dialog-actions">
    <button type="button" id="clearDraft">ล้าง</button>
    <button type="button" id="cancelSig">ยกเลิก</button>
    <button type="button" class="primary" id="confirmSig">ยืนยันลายเซ็น</button>
  </div>
</dialog>

<!-- Unlock Dialog -->
<dialog id="unlockDialog">
  <h2>ปลดล็อกเอกสารเพื่อแก้ไข</h2>
  <p style="font-size:13px;color:#55705b;">การปลดล็อกจะลบลายเซ็นที่มีอยู่ทั้งหมด และต้องให้ผู้มีอำนาจลงลายเซ็นรับรองใหม่อีกครั้ง</p>
  <label>รหัสผ่านปลดล็อก (ค่าเริ่มต้น: 1234)<input type="password" id="unlockPassword" autocomplete="off"></label>
  <p id="unlockError" style="color:#ba2918;font-size:13px;margin:4px 0 0;"></p>
  <div class="dialog-actions">
    <button type="button" id="unlockCancel">ยกเลิก</button>
    <button type="button" class="primary" id="unlockConfirm">ปลดล็อก</button>
  </div>
</dialog>

<script>
const sourceTemplateData = {json.dumps(art_05)};
{COMMON_MAKEPDF_JS}

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'ESC_FORM_FM_ML01_ML_05_V1';
let events = [];

function calcDuration(start, end) {{
  if (!start || !end) return '';
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60;
  return diff;
}}

function renderTable() {{
  const body = $('eventBody');
  body.replaceChildren();
  let totalDur = 0, totalSpeed = 0, countSpeed = 0;
  
  events.forEach((ev, idx) => {{
    const dur = calcDuration(ev.start, ev.end);
    if (dur !== '') totalDur += dur;
    if (ev.speed && Number(ev.speed)) {{ totalSpeed += Number(ev.speed); countSpeed++; }}
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${{idx + 1}}</td>
      <td><input type="date" value="${{ev.date || ''}}" data-field="date" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.start || ''}}" data-field="start" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.end || ''}}" data-field="end" data-idx="${{idx}}"></td>
      <td><span class="badge-duration">${{dur !== '' ? dur + ' น.' : '-'}}</span></td>
      <td><input type="text" style="text-align:left;" value="${{ev.reason || ''}}" data-field="reason" data-idx="${{idx}}"></td>
      <td><input type="text" value="${{ev.dept || ''}}" data-field="dept" data-idx="${{idx}}"></td>
      <td><input type="number" step="0.1" value="${{ev.speed || ''}}" data-field="speed" data-idx="${{idx}}"></td>
      <td><input type="number" step="0.1" value="${{ev.juice || ''}}" data-field="juice" data-idx="${{idx}}"></td>
      <td><input type="number" step="0.1" value="${{ev.water || ''}}" data-field="water" data-idx="${{idx}}"></td>
      <td><input type="text" value="${{ev.recorder || ''}}" data-field="recorder" data-idx="${{idx}}"></td>
      <td><input type="text" value="${{ev.supervisor || ''}}" data-field="supervisor" data-idx="${{idx}}"></td>
      <td><input type="text" value="${{ev.auditor || ''}}" data-field="auditor" data-idx="${{idx}}"></td>
      <td><input type="text" style="text-align:left;" value="${{ev.remark || ''}}" data-field="remark" data-idx="${{idx}}"></td>
      <td><button class="btn-del" data-del="${{idx}}">🗑️</button></td>
    `;
    body.appendChild(tr);
  }});

  $('kpiCount').textContent = events.length + ' ครั้ง';
  const hours = Math.floor(totalDur / 60);
  const mins = totalDur % 60;
  $('kpiDuration').textContent = `${{totalDur}} นาที` + (hours > 0 ? ` (${{hours}} ชม. ${{mins}} น.)` : '');
  $('kpiAvgSpeed').textContent = countSpeed > 0 ? (totalSpeed / countSpeed).toFixed(1) + ' rpm' : '- rpm';
}}

$('eventBody').addEventListener('change', e => {{
  const input = e.target;
  const idx = Number(input.dataset.idx);
  const field = input.dataset.field;
  if (!isNaN(idx) && field && events[idx]) {{
    events[idx][field] = input.value;
    if (field === 'start' || field === 'end') renderTable();
    save();
  }}
}});

$('eventBody').addEventListener('click', e => {{
  const delBtn = e.target.closest('[data-del]');
  if (delBtn) {{
    const idx = Number(delBtn.dataset.del);
    if (confirm(`ต้องการลบรายการลำดับที่ ${{idx + 1}} หรือไม่?`)) {{
      events.splice(idx, 1);
      renderTable();
      save();
    }}
  }}
}});

$('addEventBtn').onclick = () => {{
  $('m_date').value = $('date').value || new Date().toISOString().slice(0, 10);
  const now = new Date();
  $('m_start').value = now.toTimeString().slice(0, 5);
  now.setMinutes(now.getMinutes() + 30);
  $('m_end').value = now.toTimeString().slice(0, 5);
  $('m_reason').value = '';
  $('m_speed').value = '4.5';
  $('m_juice').value = '180';
  $('m_water').value = '45';
  $('m_remark').value = '';
  $('eventModal').showModal();
}};
$('m_cancel').onclick = () => $('eventModal').close();

$('eventForm').onsubmit = e => {{
  e.preventDefault();
  events.push({{
    date: $('m_date').value,
    start: $('m_start').value,
    end: $('m_end').value,
    reason: $('m_reason').value,
    dept: $('m_dept').value,
    speed: $('m_speed').value,
    juice: $('m_juice').value,
    water: $('m_water').value,
    recorder: $('name_recorder').value.trim() || '',
    supervisor: $('name_supervisor').value.trim() || '',
    auditor: $('name_auditor').value.trim() || '',
    remark: $('m_remark').value
  }});
  $('eventModal').close();
  renderTable();
  save();
}};

const roles = {{
  recorder: 'ผู้บันทึก (พนักงาน)',
  supervisor: 'ผู้ทวนสอบ (หัวหน้ากะ)',
  auditor: 'ผู้ตรวจสอบ (วิศวกร)'
}};

{COMMON_SIG_JS}

function save() {{
  const payload = {{
    date: $('date').value,
    year: $('year').value,
    names: {{
      recorder: $('name_recorder').value,
      supervisor: $('name_supervisor').value,
      auditor: $('name_auditor').value
    }},
    events: events,
    signatures: signatureData,
    savedAt: new Date().toISOString()
  }};
  try {{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }} catch(e) {{}}
  refreshPrint();
}}

function load() {{
  try {{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {{
      const d = JSON.parse(raw);
      if (d.date) $('date').value = d.date;
      if (d.year) $('year').value = d.year;
      if (d.names) {{
        $('name_recorder').value = d.names.recorder || '';
        $('name_supervisor').value = d.names.supervisor || '';
        $('name_auditor').value = d.names.auditor || '';
      }}
      if (Array.isArray(d.events)) events = d.events;
      if (d.signatures) signatureData = d.signatures;
    }} else {{
      $('date').value = new Date().toISOString().slice(0, 10);
    }}
  }} catch(e) {{}}
  renderTable();
  renderSignatures();
  updateLock();
  refreshPrint();
}}

$('saveBtn').onclick = () => {{
  save();
  alert('บันทึกข้อมูลในเครื่องเรียบร้อยแล้ว');
}};

$('resetBtn').onclick = () => {{
  if (confirm('ต้องการล้างข้อมูลทั้งหมดเพื่อเริ่มบันทึกใหม่หรือไม่?')) {{
    localStorage.removeItem(STORAGE_KEY);
    events = [];
    signatureData = {{}};
    $('name_recorder').value = '';
    $('name_supervisor').value = '';
    $('name_auditor').value = '';
    load();
  }}
}};

$('demoBtn').onclick = () => {{
  events = [
    {{ date: $('date').value, start: '08:15', end: '08:45', reason: 'รออ้อยเข้าดั้มพ์ ลานอ้อยชะลอส่ง', dept: 'ลานอ้อย', speed: '3.5', juice: '140', water: '35', recorder: 'นายสมชาย ก.', supervisor: 'นายประเสริฐ ช.', auditor: 'นายวิศวกร ม.', remark: 'ลดรอบตามสั่ง' }},
    {{ date: $('date').value, start: '11:20', end: '11:50', reason: 'หม้อต้ม 3 แรงดันตก รอเร่งความร้อน', dept: 'หม้อต้ม', speed: '4.0', juice: '160', water: '40', recorder: 'นายสมชาย ก.', supervisor: 'นายประเสริฐ ช.', auditor: 'นายวิศวกร ม.', remark: 'เดินรอบเบา' }},
    {{ date: $('date').value, start: '14:00', end: '14:30', reason: 'มอเตอร์สายพานลูกหีบ 1 อุณหภูมิขึ้นสูง 78°C', dept: 'ลูกหีบ', speed: '3.8', juice: '150', water: '38', recorder: 'นายสมชาย ก.', supervisor: 'นายประเสริฐ ช.', auditor: 'นายวิศวกร ม.', remark: 'ฉีดลมระบายความร้อน' }},
    {{ date: $('date').value, start: '19:10', end: '19:35', reason: 'เปลี่ยนมีดสับอ้อยชุด 1', dept: 'ลูกหีบ', speed: '4.2', juice: '170', water: '42', recorder: 'นายวันชัย พ.', supervisor: 'นายณรงค์ ร.', auditor: 'นายวิศวกร ม.', remark: 'ปกติ' }}
  ];
  $('name_recorder').value = 'นายสมชาย มั่นคง';
  $('name_supervisor').value = 'นายประเสริฐ กะดึก';
  $('name_auditor').value = 'นายช่างวิศวกร โรงงาน';
  renderTable();
  save();
  alert('โหลดตัวอย่างข้อมูลจำลอง 4 รายการเรียบร้อย');
}};

$('exportBtn').onclick = () => {{
  const blob = new Blob([localStorage.getItem(STORAGE_KEY) || '{{}}'], {{ type: 'application/json' }});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `FM-ML01-ML-05_${{$('date').value || 'record'}}.json`;
  a.click();
}};

$('import').onchange = e => {{
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {{
    try {{
      localStorage.setItem(STORAGE_KEY, evt.target.result);
      load();
      alert('นำเข้าข้อมูลสำเร็จ');
    }} catch(err) {{
      alert('ไฟล์ไม่ถูกต้อง');
    }}
  }};
  reader.readAsText(file);
}};

$('csvBtn').onclick = () => {{
  const headers = ['ลำดับ', 'วันที่', 'เวลาเริ่ม', 'เวลาสิ้นสุด', 'ระยะเวลา(นาที)', 'สาเหตุการลดรอบ', 'แผนกที่สั่ง', 'ความเร็ว(rpm)', 'น้ำอ้อยรวม(m3/h)', 'น้ำพรม(m3/h)', 'ผู้บันทึก', 'ผู้ทวนสอบ', 'ผู้ตรวจสอบ', 'หมายเหตุ'];
  const rows = events.map((ev, i) => [
    i + 1, ev.date, ev.start, ev.end, calcDuration(ev.start, ev.end),
    `"${{(ev.reason || '').replace(/"/g, '""')}}"`, ev.dept, ev.speed, ev.juice, ev.water,
    ev.recorder, ev.supervisor, ev.auditor, `"${{(ev.remark || '').replace(/"/g, '""')}}"`
  ]);
  const csvContent = '\\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
  const blob = new Blob([csvContent], {{ type: 'text/csv;charset=utf-8;' }});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `FM-ML01-ML-05_${{$('date').value || 'record'}}.csv`;
  a.click();
}};

const templateImg = new Image();
templateImg.src = sourceTemplateData;
const templateReady = new Promise(r => templateImg.onload = r);

async function buildTemplate() {{
  await Promise.all([templateReady, document.fonts.ready]);
  const c = document.createElement('canvas');
  c.width = 3368;
  c.height = 2381;
  const ctx = c.getContext('2d');
  ctx.drawImage(templateImg, 0, 0, c.width, c.height);
  ctx.scale(c.width / 841.68, c.height / 595.2);

  function text(s, x, y, size, max, align = 'center', bold = false) {{
    if (!s) return;
    ctx.fillStyle = '#111';
    ctx.textAlign = align;
    ctx.font = (bold ? 'bold ' : '') + size + 'px "Sarabun Web"';
    ctx.fillText(String(s), x, y, max);
  }}

  ctx.fillStyle = 'white';
  ctx.fillRect(320, 64, 95, 10);
  ctx.fillRect(455, 64, 45, 10);
  const dateStr = $('date').value ? new Date($('date').value + 'T12:00:00').toLocaleDateString('th-TH') : '';
  text(dateStr, 365, 72, 6.8, 90, 'center');
  text($('year').value, 477, 72, 6.8, 42, 'center');

  const xs = [48.8, 84.0, 141.8, 181.1, 220.3, 433.4, 477.8, 531.4, 584.9, 638.4, 675.1, 711.7, 748.3, 793.1];
  const yStart = 110.84;
  const yEnd = 546.5;
  const totalRows = 29;
  const rowH = (yEnd - yStart) / totalRows;

  events.slice(0, totalRows).forEach((ev, r) => {{
    const cy = yStart + r * rowH + rowH * 0.70;
    text(r + 1, (xs[0] + xs[1]) / 2, cy, 6.0, xs[1] - xs[0] - 2);
    text(ev.date || '', (xs[1] + xs[2]) / 2, cy, 5.8, xs[2] - xs[1] - 2);
    text(ev.start || '', (xs[2] + xs[3]) / 2, cy, 6.0, xs[3] - xs[2] - 2);
    text(ev.end || '', (xs[3] + xs[4]) / 2, cy, 6.0, xs[4] - xs[3] - 2);
    text(ev.reason || '', xs[4] + 3, cy, 5.7, xs[5] - xs[4] - 6, 'left');
    text(ev.dept || '', (xs[5] + xs[6]) / 2, cy, 5.8, xs[6] - xs[5] - 2);
    text(ev.speed || '', (xs[6] + xs[7]) / 2, cy, 6.0, xs[7] - xs[6] - 2);
    text(ev.juice || '', (xs[7] + xs[8]) / 2, cy, 6.0, xs[8] - xs[7] - 2);
    text(ev.water || '', (xs[8] + xs[9]) / 2, cy, 6.0, xs[9] - xs[8] - 2);
    
    const recName = ev.recorder || $('name_recorder').value.split(' ')[0];
    const supName = ev.supervisor || $('name_supervisor').value.split(' ')[0];
    const audName = ev.auditor || $('name_auditor').value.split(' ')[0];
    text(recName, (xs[9] + xs[10]) / 2, cy, 5.5, xs[10] - xs[9] - 2);
    text(supName, (xs[10] + xs[11]) / 2, cy, 5.5, xs[11] - xs[10] - 2);
    text(audName, (xs[11] + xs[12]) / 2, cy, 5.5, xs[12] - xs[11] - 2);
    text(ev.remark || '', xs[12] + 3, cy, 5.5, xs[13] - xs[12] - 6, 'left');
  }});

  return c;
}}

async function refreshPrint() {{
  const c = await buildTemplate();
  $('templatePrint').src = c.toDataURL('image/png');
  return c;
}}

$('printBtn').onclick = async () => {{
  await refreshPrint();
  window.print();
}};

$('pdfBtn').onclick = async () => {{
  $('pdfBtn').disabled = true;
  try {{
    const c = await refreshPrint();
    const raw = atob(c.toDataURL('image/jpeg', 0.96).split(',')[1]);
    const bytes = Uint8Array.from(raw, ch => ch.charCodeAt(0));
    const url = URL.createObjectURL(makePDF(bytes, c.width, c.height));
    const a = document.createElement('a');
    a.href = url;
    a.download = `FM-ML01-ML-05_${{$('date').value || 'record'}}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }} catch(err) {{
    alert('สร้าง PDF ไม่สำเร็จ: ' + err.message);
  }} finally {{
    $('pdfBtn').disabled = false;
  }}
}};

window.addEventListener('beforeprint', refreshPrint);
window.addEventListener('DOMContentLoaded', load);
</script>
</body>
</html>
"""

out_05 = root / "FM-ML01-ML-05.html"
out_05.write_text(html_05, encoding='utf-8')
print(f"Generated {out_05.name} ({len(html_05)} bytes)")

print("\nGenerating FM-ML01-ML-06...")
art_06 = get_pdf_artwork("FM-ML01-ML-06 Rev.00 แบบบันทึกการหยุดหีบ.pdf")

html_06 = f"""<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FM-ML01-ML-06 แบบบันทึกการหยุดหีบ</title>
<style>
{inject_fonts(CSS_TEMPLATE)}
</style>
</head>
<body>
<header>
  <small>FM-ML01-ML-06 • Rev.00 • ฝ่าย วิศวกรรมจักรกล • แผนก ลูกหีบ</small>
  <h1>แบบบันทึกการหยุดหีบ</h1>
  <p>บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) สาขาวังสมบูรณ์</p>
</header>

<main>
  <div class="toolbar">
    <button class="primary" id="saveBtn">💾 บันทึกในเครื่อง</button>
    <button id="addEventBtn">➕ บันทึกเหตุการณ์หยุดหีบ</button>
    <button id="demoBtn">🧪 ตัวอย่างข้อมูล (Demo)</button>
    <button id="exportBtn">📥 ดาวน์โหลด JSON</button>
    <label class="import-btn">📤 นำเข้า JSON<input id="import" type="file" accept=".json" hidden></label>
    <button id="csvBtn">📊 ส่งออก CSV</button>
    <button id="pdfBtn">📄 บันทึก PDF</button>
    <button id="printBtn">🖨️ พิมพ์</button>
    <button id="resetBtn">🔄 เริ่มใหม่</button>
  </div>

  <div id="lockNotice" class="sheet" style="background:#eaf5ec;border-color:#7bb587;margin-bottom:14px;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;" hidden>
    <div style="font-weight:bold;color:#185929;">🔒 เอกสารได้รับการรับรองและลงลายเซ็นครบถ้วนแล้ว — ข้อมูลถูกล็อกเพื่อป้องกันการแก้ไข</div>
    <button id="unlockBtn" class="primary" style="padding:6px 14px;font-size:13px;">ปลดล็อกเพื่อแก้ไข</button>
  </div>

  <div class="sheet">
    <div class="meta">
      <label>วันที่บันทึก<input type="date" id="date"></label>
      <label>ปีการผลิต<input type="text" id="year" placeholder="เช่น 2567/2568" value="2567/2568"></label>
      <label>ฝ่าย<input type="text" id="department" value="วิศวกรรมจักรกล" readonly></label>
      <label>แผนก<input type="text" id="section" value="ลูกหีบ" readonly></label>
    </div>

    <div class="kpi-bar">
      <div class="kpi-card">
        <div class="kpi-title">จำนวนครั้งที่หยุดหีบ</div>
        <div class="kpi-value" id="kpiCount">0 ครั้ง</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">เวลารวมที่หยุดหีบ (Downtime)</div>
        <div class="kpi-value" id="kpiDuration">0 นาที</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">แผนกที่หยุดนานที่สุด</div>
        <div class="kpi-value" id="kpiTopDept">-</div>
      </div>
    </div>

    <div class="action-bar">
      <div style="font-weight:bold;font-size:16px;color:#184424;">รายการบันทึกเหตุการณ์การหยุดหีบ (22 รายการต่อแผ่น)</div>
      <div style="font-size:13px;color:#55705b;">* คลิกที่ช่องในตารางเพื่อพิมพ์แก้ไขได้โดยตรง</div>
    </div>

    <div class="table-wrap">
      <table class="event-table" id="eventTable">
        <thead>
          <tr>
            <th style="width:45px;">ลำดับ</th>
            <th style="width:90px;">วันที่</th>
            <th style="width:75px;">เวลาเริ่ม</th>
            <th style="width:75px;">เวลาสิ้นสุด</th>
            <th style="width:80px;">ระยะเวลา</th>
            <th>สาเหตุการหยุดหีบ</th>
            <th style="width:95px;">แผนกที่หยุดหีบ</th>
            <th style="width:95px;">ผู้บันทึก</th>
            <th style="width:95px;">ผู้ทวนสอบ</th>
            <th style="width:95px;">ผู้ตรวจสอบ</th>
            <th style="width:140px;">หมายเหตุ</th>
            <th style="width:45px;">ลบ</th>
          </tr>
        </thead>
        <tbody id="eventBody"></tbody>
      </table>
    </div>

    <div class="signatures">
      <div class="sigcard">
        <h3>ผู้บันทึก (พนักงาน)</h3>
        <label>ชื่อผู้บันทึก<input id="name_recorder" placeholder="ระบุชื่อ-นามสกุล"></label>
        <div class="sigpreview" id="preview_recorder"><span>ยังไม่ได้ลงลายเซ็น</span></div>
        <div class="sigbuttons">
          <button data-sign="recorder">✍️ เซ็นชื่อ</button>
          <button data-remove-sign="recorder">ลบ</button>
        </div>
      </div>
      <div class="sigcard">
        <h3>ผู้ทวนสอบ (หัวหน้ากะ)</h3>
        <label>ชื่อหัวหน้ากะ<input id="name_supervisor" placeholder="ระบุชื่อ-นามสกุล"></label>
        <div class="sigpreview" id="preview_supervisor"><span>ยังไม่ได้ลงลายเซ็น</span></div>
        <div class="sigbuttons">
          <button data-sign="supervisor">✍️ เซ็นชื่อ</button>
          <button data-remove-sign="supervisor">ลบ</button>
        </div>
      </div>
      <div class="sigcard">
        <h3>ผู้ตรวจสอบ (วิศวกร)</h3>
        <label>ชื่อวิศวกร<input id="name_auditor" placeholder="ระบุชื่อ-นามสกุล"></label>
        <div class="sigpreview" id="preview_auditor"><span>ยังไม่ได้ลงลายเซ็น</span></div>
        <div class="sigbuttons">
          <button data-sign="auditor">✍️ เซ็นชื่อ</button>
          <button data-remove-sign="auditor">ลบ</button>
        </div>
      </div>
    </div>

    <footer>
      <span>โรงงาน: 1573 หมู่ 1 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250 • โทรศัพท์ 092-2573931, 086-3951210</span>
      <span>FM-ML01-ML-06 (Rev.00) 04/01/2564</span>
    </footer>
  </div>
</main>

<img id="templatePrint" alt="Printed Artwork">

<!-- Modal Add Event -->
<dialog id="eventModal">
  <h2>➕ บันทึกเหตุการณ์หยุดหีบ</h2>
  <form id="eventForm" method="dialog">
    <div class="form-grid">
      <label>วันที่<input type="date" id="m_date" required></label>
      <label>แผนกที่หยุดหีบ
        <select id="m_dept">
          <option value="ลูกหีบ">ลูกหีบ</option>
          <option value="ลานอ้อย">ลานอ้อย</option>
          <option value="หม้อต้ม">หม้อต้ม</option>
          <option value="ไฟฟ้า/หม้อไอน้ำ">ไฟฟ้า/หม้อไอน้ำ</option>
          <option value="สะพานดั้มพ์">สะพานดั้มพ์</option>
          <option value="ระบบสายพาน">ระบบสายพาน</option>
          <option value="ฝนตก/ภัยธรรมชาติ">ฝนตก/ภัยธรรมชาติ</option>
          <option value="อื่นๆ">อื่นๆ</option>
        </select>
      </label>
      <label>เวลาเริ่ม<input type="time" id="m_start" required></label>
      <label>เวลาสิ้นสุด<input type="time" id="m_end" required></label>
      <label class="form-grid full">สาเหตุการหยุดหีบ
        <input type="text" id="m_reason" list="reasons_list" placeholder="ระบุสาเหตุ เช่น อ้อยหมดลาน, โซ่ขาด, ซ่อมบำรุงฉุกเฉิน" required>
        <datalist id="reasons_list">
          <option value="อ้อยหมดลาน รอรถบรรทุกส่งอ้อย">
          <option value="โซ่ลำเลียงสะพานเมนขาด">
          <option value="เศษเหล็กติดใบมีดสับอ้อย">
          <option value="แบริ่งลูกหีบชุด 1 อุณหภูมิเกินพิกัด">
          <option value="ระบบไฟฟ้าขัดข้อง ดับชั่วคราว">
          <option value="แรงดันไอน้ำหลักตก ไม่พอขับเทอร์ไบน์">
          <option value="ล้างลูกหีบ / เปลี่ยนใบหวี">
          <option value="ฝนตกหนัก ลานอ้อยหยุดลำเลียง">
        </datalist>
      </label>
      <label class="form-grid full">หมายเหตุ / การดำเนินการแก้ไข
        <input type="text" id="m_remark" placeholder="ข้อความเพิ่มเติม เช่น ทำการเชื่อมต่อโซ่ใหม่เสร็จเวลา 11.20">
      </label>
    </div>
    <div class="dialog-actions">
      <button type="button" id="m_cancel">ยกเลิก</button>
      <button type="submit" class="primary">บันทึกรายการ</button>
    </div>
  </form>
</dialog>

<!-- Signature Modal -->
<dialog id="sigDialog">
  <h2 id="sigTitle">ลงลายเซ็น</h2>
  <canvas id="sigCanvas" width="600" height="250"></canvas>
  <div class="dialog-actions">
    <button type="button" id="clearDraft">ล้าง</button>
    <button type="button" id="cancelSig">ยกเลิก</button>
    <button type="button" class="primary" id="confirmSig">ยืนยันลายเซ็น</button>
  </div>
</dialog>

<!-- Unlock Dialog -->
<dialog id="unlockDialog">
  <h2>ปลดล็อกเอกสารเพื่อแก้ไข</h2>
  <p style="font-size:13px;color:#55705b;">การปลดล็อกจะลบลายเซ็นที่มีอยู่ทั้งหมด และต้องให้ผู้มีอำนาจลงลายเซ็นรับรองใหม่อีกครั้ง</p>
  <label>รหัสผ่านปลดล็อก (ค่าเริ่มต้น: 1234)<input type="password" id="unlockPassword" autocomplete="off"></label>
  <p id="unlockError" style="color:#ba2918;font-size:13px;margin:4px 0 0;"></p>
  <div class="dialog-actions">
    <button type="button" id="unlockCancel">ยกเลิก</button>
    <button type="button" class="primary" id="unlockConfirm">ปลดล็อก</button>
  </div>
</dialog>

<script>
const sourceTemplateData = {json.dumps(art_06)};
{COMMON_MAKEPDF_JS}

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'ESC_FORM_FM_ML01_ML_06_V1';
let events = [];

function calcDuration(start, end) {{
  if (!start || !end) return '';
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60;
  return diff;
}}

function renderTable() {{
  const body = $('eventBody');
  body.replaceChildren();
  let totalDur = 0;
  const deptDurs = {{}};
  
  events.forEach((ev, idx) => {{
    const dur = calcDuration(ev.start, ev.end);
    if (dur !== '') {{
      totalDur += dur;
      deptDurs[ev.dept || 'อื่นๆ'] = (deptDurs[ev.dept || 'อื่นๆ'] || 0) + dur;
    }}
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${{idx + 1}}</td>
      <td><input type="date" value="${{ev.date || ''}}" data-field="date" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.start || ''}}" data-field="start" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.end || ''}}" data-field="end" data-idx="${{idx}}"></td>
      <td><span class="badge-duration">${{dur !== '' ? dur + ' น.' : '-'}}</span></td>
      <td><input type="text" style="text-align:left;" value="${{ev.reason || ''}}" data-field="reason" data-idx="${{idx}}"></td>
      <td><input type="text" value="${{ev.dept || ''}}" data-field="dept" data-idx="${{idx}}"></td>
      <td><input type="text" value="${{ev.recorder || ''}}" data-field="recorder" data-idx="${{idx}}"></td>
      <td><input type="text" value="${{ev.supervisor || ''}}" data-field="supervisor" data-idx="${{idx}}"></td>
      <td><input type="text" value="${{ev.auditor || ''}}" data-field="auditor" data-idx="${{idx}}"></td>
      <td><input type="text" style="text-align:left;" value="${{ev.remark || ''}}" data-field="remark" data-idx="${{idx}}"></td>
      <td><button class="btn-del" data-del="${{idx}}">🗑️</button></td>
    `;
    body.appendChild(tr);
  }});

  $('kpiCount').textContent = events.length + ' ครั้ง';
  const hours = Math.floor(totalDur / 60);
  const mins = totalDur % 60;
  $('kpiDuration').textContent = `${{totalDur}} นาที` + (hours > 0 ? ` (${{hours}} ชม. ${{mins}} น.)` : '');
  
  let topDept = '-', maxD = 0;
  for (const [d, v] of Object.entries(deptDurs)) {{
    if (v > maxD) {{ maxD = v; topDept = `${{d}} (${{v}} นาที)`; }}
  }}
  $('kpiTopDept').textContent = topDept;
}}

$('eventBody').addEventListener('change', e => {{
  const input = e.target;
  const idx = Number(input.dataset.idx);
  const field = input.dataset.field;
  if (!isNaN(idx) && field && events[idx]) {{
    events[idx][field] = input.value;
    if (field === 'start' || field === 'end') renderTable();
    save();
  }}
}});

$('eventBody').addEventListener('click', e => {{
  const delBtn = e.target.closest('[data-del]');
  if (delBtn) {{
    const idx = Number(delBtn.dataset.del);
    if (confirm(`ต้องการลบรายการลำดับที่ ${{idx + 1}} หรือไม่?`)) {{
      events.splice(idx, 1);
      renderTable();
      save();
    }}
  }}
}});

$('addEventBtn').onclick = () => {{
  $('m_date').value = $('date').value || new Date().toISOString().slice(0, 10);
  const now = new Date();
  $('m_start').value = now.toTimeString().slice(0, 5);
  now.setMinutes(now.getMinutes() + 45);
  $('m_end').value = now.toTimeString().slice(0, 5);
  $('m_reason').value = '';
  $('m_remark').value = '';
  $('eventModal').showModal();
}};
$('m_cancel').onclick = () => $('eventModal').close();

$('eventForm').onsubmit = e => {{
  e.preventDefault();
  events.push({{
    date: $('m_date').value,
    start: $('m_start').value,
    end: $('m_end').value,
    reason: $('m_reason').value,
    dept: $('m_dept').value,
    recorder: $('name_recorder').value.trim() || '',
    supervisor: $('name_supervisor').value.trim() || '',
    auditor: $('name_auditor').value.trim() || '',
    remark: $('m_remark').value
  }});
  $('eventModal').close();
  renderTable();
  save();
}};

const roles = {{
  recorder: 'ผู้บันทึก (พนักงาน)',
  supervisor: 'ผู้ทวนสอบ (หัวหน้ากะ)',
  auditor: 'ผู้ตรวจสอบ (วิศวกร)'
}};

{COMMON_SIG_JS}

function save() {{
  const payload = {{
    date: $('date').value,
    year: $('year').value,
    names: {{
      recorder: $('name_recorder').value,
      supervisor: $('name_supervisor').value,
      auditor: $('name_auditor').value
    }},
    events: events,
    signatures: signatureData,
    savedAt: new Date().toISOString()
  }};
  try {{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }} catch(e) {{}}
  refreshPrint();
}}

function load() {{
  try {{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {{
      const d = JSON.parse(raw);
      if (d.date) $('date').value = d.date;
      if (d.year) $('year').value = d.year;
      if (d.names) {{
        $('name_recorder').value = d.names.recorder || '';
        $('name_supervisor').value = d.names.supervisor || '';
        $('name_auditor').value = d.names.auditor || '';
      }}
      if (Array.isArray(d.events)) events = d.events;
      if (d.signatures) signatureData = d.signatures;
    }} else {{
      $('date').value = new Date().toISOString().slice(0, 10);
    }}
  }} catch(e) {{}}
  renderTable();
  renderSignatures();
  updateLock();
  refreshPrint();
}}

$('saveBtn').onclick = () => {{
  save();
  alert('บันทึกข้อมูลในเครื่องเรียบร้อยแล้ว');
}};

$('resetBtn').onclick = () => {{
  if (confirm('ต้องการล้างข้อมูลทั้งหมดเพื่อเริ่มบันทึกใหม่หรือไม่?')) {{
    localStorage.removeItem(STORAGE_KEY);
    events = [];
    signatureData = {{}};
    $('name_recorder').value = '';
    $('name_supervisor').value = '';
    $('name_auditor').value = '';
    load();
  }}
}};

$('demoBtn').onclick = () => {{
  events = [
    {{ date: $('date').value, start: '09:10', end: '09:40', reason: 'โซ่ลำเลียงสะพานเมนขาด ซ่อมต่อข้อโซ่', dept: 'ลูกหีบ', recorder: 'นายสมชาย ก.', supervisor: 'นายประเสริฐ ช.', auditor: 'นายวิศวกร ม.', remark: 'ซ่อมแซมเสร็จสิ้น เดินหีบปกติ' }},
    {{ date: $('date').value, start: '13:15', end: '14:00', reason: 'อ้อยหมดลาน รอรถบรรทุกทยอยเข้าชั่ง', dept: 'ลานอ้อย', recorder: 'นายสมชาย ก.', supervisor: 'นายประเสริฐ ช.', auditor: 'นายวิศวกร ม.', remark: 'รถอ้อยเข้าครบเริ่มหีบต่อ' }},
    {{ date: $('date').value, start: '17:30', end: '18:15', reason: 'แบริ่งใบมีดสับอ้อยชุด 2 ร้อนผิดปกติ อัดจารบีและตรวจเช็ค', dept: 'ลูกหีบ', recorder: 'นายวันชัย พ.', supervisor: 'นายณรงค์ ร.', auditor: 'นายวิศวกร ม.', remark: 'อุณหภูมิลดลงปกติ' }}
  ];
  $('name_recorder').value = 'นายสมชาย มั่นคง';
  $('name_supervisor').value = 'นายประเสริฐ กะดึก';
  $('name_auditor').value = 'นายช่างวิศวกร โรงงาน';
  renderTable();
  save();
  alert('โหลดตัวอย่างข้อมูลหยุดหีบ 3 รายการเรียบร้อย');
}};

$('exportBtn').onclick = () => {{
  const blob = new Blob([localStorage.getItem(STORAGE_KEY) || '{{}}'], {{ type: 'application/json' }});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `FM-ML01-ML-06_${{$('date').value || 'record'}}.json`;
  a.click();
}};

$('import').onchange = e => {{
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {{
    try {{
      localStorage.setItem(STORAGE_KEY, evt.target.result);
      load();
      alert('นำเข้าข้อมูลสำเร็จ');
    }} catch(err) {{
      alert('ไฟล์ไม่ถูกต้อง');
    }}
  }};
  reader.readAsText(file);
}};

$('csvBtn').onclick = () => {{
  const headers = ['ลำดับ', 'วันที่', 'เวลาเริ่ม', 'เวลาสิ้นสุด', 'ระยะเวลา(นาที)', 'สาเหตุการหยุดหีบ', 'แผนกที่หยุดหีบ', 'ผู้บันทึก', 'ผู้ทวนสอบ', 'ผู้ตรวจสอบ', 'หมายเหตุ'];
  const rows = events.map((ev, i) => [
    i + 1, ev.date, ev.start, ev.end, calcDuration(ev.start, ev.end),
    `"${{(ev.reason || '').replace(/"/g, '""')}}"`, ev.dept,
    ev.recorder, ev.supervisor, ev.auditor, `"${{(ev.remark || '').replace(/"/g, '""')}}"`
  ]);
  const csvContent = '\\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
  const blob = new Blob([csvContent], {{ type: 'text/csv;charset=utf-8;' }});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `FM-ML01-ML-06_${{$('date').value || 'record'}}.csv`;
  a.click();
}};

const templateImg = new Image();
templateImg.src = sourceTemplateData;
const templateReady = new Promise(r => templateImg.onload = r);

async function buildTemplate() {{
  await Promise.all([templateReady, document.fonts.ready]);
  const c = document.createElement('canvas');
  c.width = 3368;
  c.height = 2381;
  const ctx = c.getContext('2d');
  ctx.drawImage(templateImg, 0, 0, c.width, c.height);
  ctx.scale(c.width / 841.68, c.height / 595.2);

  function text(s, x, y, size, max, align = 'center', bold = false) {{
    if (!s) return;
    ctx.fillStyle = '#111';
    ctx.textAlign = align;
    ctx.font = (bold ? 'bold ' : '') + size + 'px "Sarabun Web"';
    ctx.fillText(String(s), x, y, max);
  }}

  ctx.fillStyle = 'white';
  ctx.fillRect(320, 78, 105, 12);
  ctx.fillRect(475, 78, 55, 12);
  const dateStr = $('date').value ? new Date($('date').value + 'T12:00:00').toLocaleDateString('th-TH') : '';
  text(dateStr, 370, 87, 7.2, 100, 'center');
  text($('year').value, 502, 87, 7.2, 50, 'center');

  const xs = [37.3, 80.4, 120.9, 161.3, 201.8, 412.0, 476.5, 540.5, 604.4, 668.4, 806.3];
  const yStart = 134.18;
  const yEnd = 540.5;
  const totalRows = 22;
  const rowH = (yEnd - yStart) / totalRows;

  events.slice(0, totalRows).forEach((ev, r) => {{
    const cy = yStart + r * rowH + rowH * 0.68;
    text(r + 1, (xs[0] + xs[1]) / 2, cy, 7.0, xs[1] - xs[0] - 2);
    text(ev.date || '', (xs[1] + xs[2]) / 2, cy, 6.8, xs[2] - xs[1] - 2);
    text(ev.start || '', (xs[2] + xs[3]) / 2, cy, 7.0, xs[3] - xs[2] - 2);
    text(ev.end || '', (xs[3] + xs[4]) / 2, cy, 7.0, xs[4] - xs[3] - 2);
    text(ev.reason || '', xs[4] + 4, cy, 6.8, xs[5] - xs[4] - 8, 'left');
    text(ev.dept || '', (xs[5] + xs[6]) / 2, cy, 7.0, xs[6] - xs[5] - 2);
    
    const recName = ev.recorder || $('name_recorder').value.split(' ')[0];
    const supName = ev.supervisor || $('name_supervisor').value.split(' ')[0];
    const audName = ev.auditor || $('name_auditor').value.split(' ')[0];
    text(recName, (xs[6] + xs[7]) / 2, cy, 6.5, xs[7] - xs[6] - 2);
    text(supName, (xs[7] + xs[8]) / 2, cy, 6.5, xs[8] - xs[7] - 2);
    text(audName, (xs[8] + xs[9]) / 2, cy, 6.5, xs[9] - xs[8] - 2);
    text(ev.remark || '', xs[9] + 4, cy, 6.5, xs[10] - xs[9] - 8, 'left');
  }});

  return c;
}}

async function refreshPrint() {{
  const c = await buildTemplate();
  $('templatePrint').src = c.toDataURL('image/png');
  return c;
}}

$('printBtn').onclick = async () => {{
  await refreshPrint();
  window.print();
}};

$('pdfBtn').onclick = async () => {{
  $('pdfBtn').disabled = true;
  try {{
    const c = await refreshPrint();
    const raw = atob(c.toDataURL('image/jpeg', 0.96).split(',')[1]);
    const bytes = Uint8Array.from(raw, ch => ch.charCodeAt(0));
    const url = URL.createObjectURL(makePDF(bytes, c.width, c.height));
    const a = document.createElement('a');
    a.href = url;
    a.download = `FM-ML01-ML-06_${{$('date').value || 'record'}}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }} catch(err) {{
    alert('สร้าง PDF ไม่สำเร็จ: ' + err.message);
  }} finally {{
    $('pdfBtn').disabled = false;
  }}
}};

window.addEventListener('beforeprint', refreshPrint);
window.addEventListener('DOMContentLoaded', load);
</script>
</body>
</html>
"""

out_06 = root / "FM-ML01-ML-06.html"
out_06.write_text(html_06, encoding='utf-8')
print(f"Generated {out_06.name} ({len(html_06)} bytes)")

print("\nGenerating FM-PD01-PD-01...")
art_pd01 = get_pdf_artwork("FM-PD01-PD-01 Rev.00 บันทึกการหยุดหีบ.pdf")

html_pd01 = f"""<!doctype html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>FM-PD01-PD-01 บันทึกรายงานการหยุดหีบ</title>
<style>
{inject_fonts(CSS_TEMPLATE)}
</style>
</head>
<body>
<header>
  <small>FM-PD01-PD-01 • Rev.00 • ฝ่าย ผลิต</small>
  <h1>บันทึกรายงานการหยุดหีบ</h1>
  <p>บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) สาขาวังสมบูรณ์</p>
</header>

<main>
  <div class="toolbar">
    <button class="primary" id="saveBtn">💾 บันทึกในเครื่อง</button>
    <button id="addEventBtn">➕ บันทึกขั้นตอนหยุดหีบ</button>
    <button id="demoBtn">🧪 ตัวอย่างข้อมูล (Demo)</button>
    <button id="exportBtn">📥 ดาวน์โหลด JSON</button>
    <label class="import-btn">📤 นำเข้า JSON<input id="import" type="file" accept=".json" hidden></label>
    <button id="csvBtn">📊 ส่งออก CSV</button>
    <button id="pdfBtn">📄 บันทึก PDF</button>
    <button id="printBtn">🖨️ พิมพ์</button>
    <button id="resetBtn">🔄 เริ่มใหม่</button>
  </div>

  <div id="lockNotice" class="sheet" style="background:#eaf5ec;border-color:#7bb587;margin-bottom:14px;padding:12px 18px;display:flex;justify-content:space-between;align-items:center;" hidden>
    <div style="font-weight:bold;color:#185929;">🔒 เอกสารได้รับการรับรองและลงลายเซ็นครบถ้วนแล้ว — ข้อมูลถูกล็อกเพื่อป้องกันการแก้ไข</div>
    <button id="unlockBtn" class="primary" style="padding:6px 14px;font-size:13px;">ปลดล็อกเพื่อแก้ไข</button>
  </div>

  <div class="sheet">
    <div class="meta">
      <label>วันที่บันทึก<input type="date" id="date"></label>
      <label>แผนก<input type="text" id="section" value="ผลิต" placeholder="เช่น ผลิต"></label>
    </div>

    <div class="kpi-bar">
      <div class="kpi-card">
        <div class="kpi-title">จำนวนครั้งที่หยุดหีบ</div>
        <div class="kpi-value" id="kpiCount">0 ครั้ง</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">เวลาหยุดถึงเริ่มหีบเฉลี่ย</div>
        <div class="kpi-value" id="kpiAvgDuration">0 นาที</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">ผู้ตรวจสอบล่าสุด</div>
        <div class="kpi-value" id="kpiAuditor">-</div>
      </div>
    </div>

    <div class="action-bar">
      <div style="font-weight:bold;font-size:16px;color:#184424;">ตารางบันทึกรายงานขั้นตอนการหยุดหีบและเริ่มหีบ (22 รายการต่อแผ่น)</div>
      <div style="font-size:13px;color:#55705b;">* คลิกที่ช่องในตารางเพื่อพิมพ์แก้ไขได้โดยตรง</div>
    </div>

    <div class="table-wrap">
      <table class="event-table" id="eventTable">
        <thead>
          <tr>
            <th rowspan="2" style="width:40px;">ลำดับ</th>
            <th rowspan="2" style="width:90px;">ผู้บันทึก</th>
            <th rowspan="2" style="width:90px;">วันที่</th>
            <th colspan="7" style="background:#dfebe1;color:#154423;">เวลาในการดำเนินการ</th>
            <th rowspan="2">หมายเหตุ</th>
            <th rowspan="2" style="width:45px;">ลบ</th>
          </tr>
          <tr>
            <th style="width:75px;">เริ่มหยุดหีบ</th>
            <th style="width:80px;">เริ่มลดโฟล</th>
            <th style="width:75px;">หม้อต้มพร้อม</th>
            <th style="width:75px;">ลูกหีบพร้อม</th>
            <th style="width:85px;">เรียกรถอ้อยเข้า</th>
            <th style="width:75px;">เริ่มหีบ</th>
            <th style="width:80px;">เริ่มเพิ่มโฟล</th>
          </tr>
        </thead>
        <tbody id="eventBody"></tbody>
      </table>
    </div>

    <div class="signatures" style="grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
      <div class="sigcard">
        <h3>ผู้บันทึก (พนักงานเดินเครื่อง)</h3>
        <label>ชื่อผู้บันทึก<input id="name_recorder" placeholder="ระบุชื่อ-นามสกุล"></label>
        <div class="sigpreview" id="preview_recorder"><span>ยังไม่ได้ลงลายเซ็น</span></div>
        <div class="sigbuttons">
          <button data-sign="recorder">✍️ เซ็นชื่อ</button>
          <button data-remove-sign="recorder">ลบ</button>
        </div>
      </div>
      <div class="sigcard">
        <h3>ผู้ตรวจสอบ (หัวหน้าแผนกผลิต / วิศวกร)</h3>
        <label>ชื่อผู้ตรวจสอบ<input id="name_auditor" placeholder="ระบุชื่อ-นามสกุล"></label>
        <div class="sigpreview" id="preview_auditor"><span>ยังไม่ได้ลงลายเซ็น</span></div>
        <div class="sigbuttons">
          <button data-sign="auditor">✍️ เซ็นชื่อ</button>
          <button data-remove-sign="auditor">ลบ</button>
        </div>
      </div>
    </div>

    <footer>
      <span>โรงงาน: 1573 หมู่ 1 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250 • โทรศัพท์ 092-2573931, 086-3951210</span>
      <span>FM-PD01-PD-01 (Rev.00) 04/01/2564</span>
    </footer>
  </div>
</main>

<img id="templatePrint" alt="Printed Artwork">

<!-- Modal Add Event -->
<dialog id="eventModal">
  <h2>➕ บันทึกขั้นตอนการหยุดหีบ</h2>
  <form id="eventForm" method="dialog">
    <div class="form-grid">
      <label>วันที่<input type="date" id="m_date" required></label>
      <label>ผู้บันทึก<input type="text" id="m_recorder" placeholder="ชื่อผู้บันทึก" required></label>
      <label>เริ่มหยุดหีบ<input type="time" id="m_t_stop" required></label>
      <label>เริ่มลดโฟล/ปริมาณ<input type="time" id="m_t_reduce_flow"></label>
      <label>หม้อต้มพร้อม<input type="time" id="m_t_boiler_ready"></label>
      <label>ลูกหีบพร้อม<input type="time" id="m_t_mill_ready"></label>
      <label>เรียกรถอ้อยเข้าดั้มพ์<input type="time" id="m_t_call_truck"></label>
      <label>เริ่มหีบ<input type="time" id="m_t_start_mill"></label>
      <label>เริ่มเพิ่มโฟล/ปริมาณ<input type="time" id="m_t_increase_flow"></label>
      <label class="form-grid full">หมายเหตุ
        <input type="text" id="m_remark" placeholder="ข้อความเพิ่มเติม เช่น หยุดซ่อมสะพานดั้มพ์ 30 นาที">
      </label>
    </div>
    <div class="dialog-actions">
      <button type="button" id="m_cancel">ยกเลิก</button>
      <button type="submit" class="primary">บันทึกรายการ</button>
    </div>
  </form>
</dialog>

<!-- Signature Modal -->
<dialog id="sigDialog">
  <h2 id="sigTitle">ลงลายเซ็น</h2>
  <canvas id="sigCanvas" width="600" height="250"></canvas>
  <div class="dialog-actions">
    <button type="button" id="clearDraft">ล้าง</button>
    <button type="button" id="cancelSig">ยกเลิก</button>
    <button type="button" class="primary" id="confirmSig">ยืนยันลายเซ็น</button>
  </div>
</dialog>

<!-- Unlock Dialog -->
<dialog id="unlockDialog">
  <h2>ปลดล็อกเอกสารเพื่อแก้ไข</h2>
  <p style="font-size:13px;color:#55705b;">การปลดล็อกจะลบลายเซ็นที่มีอยู่ทั้งหมด และต้องให้ผู้มีอำนาจลงลายเซ็นรับรองใหม่อีกครั้ง</p>
  <label>รหัสผ่านปลดล็อก (ค่าเริ่มต้น: 1234)<input type="password" id="unlockPassword" autocomplete="off"></label>
  <p id="unlockError" style="color:#ba2918;font-size:13px;margin:4px 0 0;"></p>
  <div class="dialog-actions">
    <button type="button" id="unlockCancel">ยกเลิก</button>
    <button type="button" class="primary" id="unlockConfirm">ปลดล็อก</button>
  </div>
</dialog>

<script>
const sourceTemplateData = {json.dumps(art_pd01)};
{COMMON_MAKEPDF_JS}

const $ = id => document.getElementById(id);
const STORAGE_KEY = 'ESC_FORM_FM_PD01_PD_01_V1';
let events = [];

function calcDuration(start, end) {{
  if (!start || !end) return 0;
  const [h1, m1] = start.split(':').map(Number);
  const [h2, m2] = end.split(':').map(Number);
  let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
  if (diff < 0) diff += 24 * 60;
  return diff;
}}

function renderTable() {{
  const body = $('eventBody');
  body.replaceChildren();
  let totalDur = 0, countDur = 0;
  
  events.forEach((ev, idx) => {{
    if (ev.t_stop && ev.t_start_mill) {{
      const d = calcDuration(ev.t_stop, ev.t_start_mill);
      totalDur += d;
      countDur++;
    }}
    
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${{idx + 1}}</td>
      <td><input type="text" value="${{ev.recorder || ''}}" data-field="recorder" data-idx="${{idx}}"></td>
      <td><input type="date" value="${{ev.date || ''}}" data-field="date" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.t_stop || ''}}" data-field="t_stop" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.t_reduce_flow || ''}}" data-field="t_reduce_flow" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.t_boiler_ready || ''}}" data-field="t_boiler_ready" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.t_mill_ready || ''}}" data-field="t_mill_ready" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.t_call_truck || ''}}" data-field="t_call_truck" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.t_start_mill || ''}}" data-field="t_start_mill" data-idx="${{idx}}"></td>
      <td><input type="time" value="${{ev.t_increase_flow || ''}}" data-field="t_increase_flow" data-idx="${{idx}}"></td>
      <td><input type="text" style="text-align:left;" value="${{ev.remark || ''}}" data-field="remark" data-idx="${{idx}}"></td>
      <td><button class="btn-del" data-del="${{idx}}">🗑️</button></td>
    `;
    body.appendChild(tr);
  }});

  $('kpiCount').textContent = events.length + ' ครั้ง';
  const avg = countDur > 0 ? Math.round(totalDur / countDur) : 0;
  $('kpiAvgDuration').textContent = `${{avg}} นาที`;
  $('kpiAuditor').textContent = $('name_auditor').value || '-';
}}

$('eventBody').addEventListener('change', e => {{
  const input = e.target;
  const idx = Number(input.dataset.idx);
  const field = input.dataset.field;
  if (!isNaN(idx) && field && events[idx]) {{
    events[idx][field] = input.value;
    save();
  }}
}});

$('eventBody').addEventListener('click', e => {{
  const delBtn = e.target.closest('[data-del]');
  if (delBtn) {{
    const idx = Number(delBtn.dataset.del);
    if (confirm(`ต้องการลบรายการลำดับที่ ${{idx + 1}} หรือไม่?`)) {{
      events.splice(idx, 1);
      renderTable();
      save();
    }}
  }}
}});

$('addEventBtn').onclick = () => {{
  $('m_date').value = $('date').value || new Date().toISOString().slice(0, 10);
  $('m_recorder').value = $('name_recorder').value || '';
  const now = new Date();
  $('m_t_stop').value = now.toTimeString().slice(0, 5);
  now.setMinutes(now.getMinutes() + 5);
  $('m_t_reduce_flow').value = now.toTimeString().slice(0, 5);
  now.setMinutes(now.getMinutes() + 15);
  $('m_t_boiler_ready').value = now.toTimeString().slice(0, 5);
  now.setMinutes(now.getMinutes() + 5);
  $('m_t_mill_ready').value = now.toTimeString().slice(0, 5);
  now.setMinutes(now.getMinutes() + 3);
  $('m_t_call_truck').value = now.toTimeString().slice(0, 5);
  now.setMinutes(now.getMinutes() + 7);
  $('m_t_start_mill').value = now.toTimeString().slice(0, 5);
  now.setMinutes(now.getMinutes() + 5);
  $('m_t_increase_flow').value = now.toTimeString().slice(0, 5);
  $('m_remark').value = '';
  $('eventModal').showModal();
}};
$('m_cancel').onclick = () => $('eventModal').close();

$('eventForm').onsubmit = e => {{
  e.preventDefault();
  events.push({{
    recorder: $('m_recorder').value,
    date: $('m_date').value,
    t_stop: $('m_t_stop').value,
    t_reduce_flow: $('m_t_reduce_flow').value,
    t_boiler_ready: $('m_t_boiler_ready').value,
    t_mill_ready: $('m_t_mill_ready').value,
    t_call_truck: $('m_t_call_truck').value,
    t_start_mill: $('m_t_start_mill').value,
    t_increase_flow: $('m_t_increase_flow').value,
    remark: $('m_remark').value
  }});
  $('eventModal').close();
  renderTable();
  save();
}};

const roles = {{
  recorder: 'ผู้บันทึก',
  auditor: 'ผู้ตรวจสอบ'
}};

{COMMON_SIG_JS}

function save() {{
  const payload = {{
    date: $('date').value,
    section: $('section').value,
    names: {{
      recorder: $('name_recorder').value,
      auditor: $('name_auditor').value
    }},
    events: events,
    signatures: signatureData,
    savedAt: new Date().toISOString()
  }};
  try {{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }} catch(e) {{}}
  refreshPrint();
}}

function load() {{
  try {{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {{
      const d = JSON.parse(raw);
      if (d.date) $('date').value = d.date;
      if (d.section) $('section').value = d.section;
      if (d.names) {{
        $('name_recorder').value = d.names.recorder || '';
        $('name_auditor').value = d.names.auditor || '';
      }}
      if (Array.isArray(d.events)) events = d.events;
      if (d.signatures) signatureData = d.signatures;
    }} else {{
      $('date').value = new Date().toISOString().slice(0, 10);
    }}
  }} catch(e) {{}}
  renderTable();
  renderSignatures();
  updateLock();
  refreshPrint();
}}

$('saveBtn').onclick = () => {{
  save();
  alert('บันทึกข้อมูลในเครื่องเรียบร้อยแล้ว');
}};

$('resetBtn').onclick = () => {{
  if (confirm('ต้องการล้างข้อมูลทั้งหมดเพื่อเริ่มบันทึกใหม่หรือไม่?')) {{
    localStorage.removeItem(STORAGE_KEY);
    events = [];
    signatureData = {{}};
    $('name_recorder').value = '';
    $('name_auditor').value = '';
    load();
  }}
}};

$('demoBtn').onclick = () => {{
  events = [
    {{ recorder: 'นายสมชาย ก.', date: $('date').value, t_stop: '09:00', t_reduce_flow: '09:05', t_boiler_ready: '09:20', t_mill_ready: '09:25', t_call_truck: '09:28', t_start_mill: '09:35', t_increase_flow: '09:40', remark: 'หยุดซ่อมโซ่สะพานดั้มพ์ 35 นาที' }},
    {{ recorder: 'นายสมชาย ก.', date: $('date').value, t_stop: '13:00', t_reduce_flow: '13:04', t_boiler_ready: '13:30', t_mill_ready: '13:35', t_call_truck: '13:40', t_start_mill: '13:50', t_increase_flow: '13:55', remark: 'อ้อยหมดลาน รออ้อย 50 นาที' }},
    {{ recorder: 'นายวันชัย พ.', date: $('date').value, t_stop: '19:15', t_reduce_flow: '19:20', t_boiler_ready: '19:40', t_mill_ready: '19:45', t_call_truck: '19:48', t_start_mill: '19:55', t_increase_flow: '20:00', remark: 'เปลี่ยนมีดสับอ้อยชุด 1 40 นาที' }}
  ];
  $('name_recorder').value = 'นายประสิทธิ์ ผลิตดี';
  $('name_auditor').value = 'นายหัวหน้ากะ วิชัย';
  renderTable();
  save();
  alert('โหลดตัวอย่างขั้นตอนหยุดหีบ 3 รายการเรียบร้อย');
}};

$('exportBtn').onclick = () => {{
  const blob = new Blob([localStorage.getItem(STORAGE_KEY) || '{{}}'], {{ type: 'application/json' }});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `FM-PD01-PD-01_${{$('date').value || 'record'}}.json`;
  a.click();
}};

$('import').onchange = e => {{
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {{
    try {{
      localStorage.setItem(STORAGE_KEY, evt.target.result);
      load();
      alert('นำเข้าข้อมูลสำเร็จ');
    }} catch(err) {{
      alert('ไฟล์ไม่ถูกต้อง');
    }}
  }};
  reader.readAsText(file);
}};

$('csvBtn').onclick = () => {{
  const headers = ['ลำดับ', 'ผู้บันทึก', 'วันที่', 'เริ่มหยุดหีบ', 'เริ่มลดโฟล/ปริมาณ', 'หม้อต้มพร้อม', 'ลูกหีบพร้อม', 'เรียกรถอ้อยเข้าดั้มพ์', 'เริ่มหีบ', 'เริ่มเพิ่มโฟล/ปริมาณ', 'หมายเหตุ'];
  const rows = events.map((ev, i) => [
    i + 1, ev.recorder, ev.date, ev.t_stop, ev.t_reduce_flow, ev.t_boiler_ready,
    ev.t_mill_ready, ev.t_call_truck, ev.t_start_mill, ev.t_increase_flow,
    `"${{(ev.remark || '').replace(/"/g, '""')}}"`
  ]);
  const csvContent = '\\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\\n');
  const blob = new Blob([csvContent], {{ type: 'text/csv;charset=utf-8;' }});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `FM-PD01-PD-01_${{$('date').value || 'record'}}.csv`;
  a.click();
}};

const templateImg = new Image();
templateImg.src = sourceTemplateData;
const templateReady = new Promise(r => templateImg.onload = r);

async function buildTemplate() {{
  await Promise.all([templateReady, document.fonts.ready]);
  const c = document.createElement('canvas');
  c.width = 3368;
  c.height = 2381;
  const ctx = c.getContext('2d');
  ctx.drawImage(templateImg, 0, 0, c.width, c.height);
  ctx.scale(c.width / 841.92, c.height / 595.32);

  function text(s, x, y, size, max, align = 'center', bold = false) {{
    if (!s) return;
    ctx.fillStyle = '#111';
    ctx.textAlign = align;
    ctx.font = (bold ? 'bold ' : '') + size + 'px "Sarabun Web"';
    ctx.fillText(String(s), x, y, max);
  }}

  ctx.fillStyle = 'white';
  ctx.fillRect(725, 64, 55, 12);
  text($('section').value, 750, 72, 7.2, 50, 'center');

  const xs = [28.8, 92.8, 163.9, 238.0, 309.2, 374.9, 457.4, 518.5, 597.9, 664.3, 813.1];
  const yStart = 127.82;
  const yEnd = 544.2;
  const totalRows = 22;
  const rowH = (yEnd - yStart) / totalRows;

  events.slice(0, totalRows).forEach((ev, r) => {{
    const cy = yStart + r * rowH + rowH * 0.68;
    text(ev.date || '', (xs[0] + xs[1]) / 2, cy, 6.8, xs[1] - xs[0] - 2);
    text(ev.t_stop || '', (xs[1] + xs[2]) / 2, cy, 7.0, xs[2] - xs[1] - 2);
    text(ev.t_reduce_flow || '', (xs[2] + xs[3]) / 2, cy, 7.0, xs[3] - xs[2] - 2);
    text(ev.t_boiler_ready || '', (xs[3] + xs[4]) / 2, cy, 7.0, xs[4] - xs[3] - 2);
    text(ev.t_mill_ready || '', (xs[4] + xs[5]) / 2, cy, 7.0, xs[5] - xs[4] - 2);
    text(ev.t_call_truck || '', (xs[5] + xs[6]) / 2, cy, 7.0, xs[6] - xs[5] - 2);
    text(ev.t_start_mill || '', (xs[6] + xs[7]) / 2, cy, 7.0, xs[7] - xs[6] - 2);
    text(ev.t_increase_flow || '', (xs[7] + xs[8]) / 2, cy, 7.0, xs[8] - xs[7] - 2);
    text(ev.recorder || '', (xs[8] + xs[9]) / 2, cy, 6.8, xs[9] - xs[8] - 2);
    text(ev.remark || '', xs[9] + 4, cy, 6.5, xs[10] - xs[9] - 8, 'left');
  }});

  ctx.fillStyle = 'white';
  ctx.fillRect(415, 544, 70, 12);
  const audText = $('name_auditor').value || (signatureData.auditor?.name) || '';
  text(audText, 450, 552, 7.2, 65, 'center');

  return c;
}}

async function refreshPrint() {{
  const c = await buildTemplate();
  $('templatePrint').src = c.toDataURL('image/png');
  return c;
}}

$('printBtn').onclick = async () => {{
  await refreshPrint();
  window.print();
}};

$('pdfBtn').onclick = async () => {{
  $('pdfBtn').disabled = true;
  try {{
    const c = await refreshPrint();
    const raw = atob(c.toDataURL('image/jpeg', 0.96).split(',')[1]);
    const bytes = Uint8Array.from(raw, ch => ch.charCodeAt(0));
    const url = URL.createObjectURL(makePDF(bytes, c.width, c.height));
    const a = document.createElement('a');
    a.href = url;
    a.download = `FM-PD01-PD-01_${{$('date').value || 'record'}}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }} catch(err) {{
    alert('สร้าง PDF ไม่สำเร็จ: ' + err.message);
  }} finally {{
    $('pdfBtn').disabled = false;
  }}
}};

window.addEventListener('beforeprint', refreshPrint);
window.addEventListener('DOMContentLoaded', load);
</script>
</body>
</html>
"""

out_pd01 = root / "FM-PD01-PD-01.html"
out_pd01.write_text(html_pd01, encoding='utf-8')
print(f"Generated {out_pd01.name} ({len(html_pd01)} bytes)")

print("\nAll Phase 2 forms generated successfully!")
