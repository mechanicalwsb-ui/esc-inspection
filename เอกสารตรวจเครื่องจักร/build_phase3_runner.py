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

def get_pdf_artwork(pdf_name):
    pdf_path = base_folder / pdf_name
    doc = pymupdf.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=260)
    png_bytes = pix.tobytes("png")
    return "data:image/png;base64," + base64.b64encode(png_bytes).decode("ascii")

CSS_BASE = """
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
  font-size: 14px;
  line-height: 1.5;
}
header {
  background: #143d25;
  color: white;
  padding: 18px 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
header small {
  display: block;
  font-size: 13px;
  color: #a8cfb2;
  letter-spacing: .5px;
}
header h1 {
  font-size: 22px;
  margin: 4px 0;
  font-weight: 700;
}
header p {
  margin: 0;
  font-size: 13px;
  color: #d2e6d6;
}
main {
  padding: 16px 20px 28px;
  max-width: 1480px;
  margin: 0 auto;
}
.toolbar {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 0 16px;
  align-items: center;
}
button, .import-btn {
  font-family: inherit;
  font-size: 14px;
  border: 1px solid #bfd0c1;
  border-radius: 7px;
  background: white;
  padding: 8px 14px;
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
button.danger {
  background: #fdf2f2;
  color: #991b1b;
  border-color: #f87171;
}
button.danger:hover {
  background: #fee2e2;
}
button:disabled, .import-btn:disabled {
  opacity: .5;
  cursor: not-allowed;
}
.sheet {
  background: white;
  border: 1px solid #dce5dc;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.03);
}
.meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
  background: #f8faf8;
  border: 1px solid #e1ebe2;
  padding: 12px 16px;
  border-radius: 8px;
}
label {
  display: block;
  font-size: 13px;
  color: #4b6650;
  margin-bottom: 4px;
  font-weight: 500;
}
input, select, textarea {
  font-family: inherit;
  font-size: 14px;
  border: 1px solid #ccd6ce;
  border-radius: 5px;
  padding: 7px 10px;
  width: 100%;
  color: #173722;
  background: white;
}
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #236b38;
  box-shadow: 0 0 0 2px rgba(35,107,56,0.15);
}
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.kpi-card {
  background: #f0f7f1;
  border: 1px solid #c8decb;
  border-radius: 8px;
  padding: 12px 16px;
  text-align: center;
}
.kpi-card .val {
  font-size: 24px;
  font-weight: 700;
  color: #175228;
  margin: 4px 0 0;
}
.kpi-card .lbl {
  font-size: 12px;
  color: #55755b;
}

.table-wrapper {
  overflow-x: auto;
  border: 1px solid #c9d6ca;
  border-radius: 8px;
  background: white;
  margin-bottom: 16px;
  max-height: 720px;
}
table.form-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
  white-space: nowrap;
}
table.form-table th, table.form-table td {
  border: 1px solid #d4ded5;
  padding: 5px 6px;
  text-align: center;
}
table.form-table th {
  background: #e6efe8;
  color: #174224;
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 2;
}
table.form-table tr:hover td {
  background: #f9fbf9;
}
table.form-table input {
  padding: 4px 6px;
  font-size: 13px;
  text-align: center;
}
table.form-table input.num {
  text-align: right;
}
table.form-table td.calc-col {
  font-weight: 600;
  color: #14532d;
  background: #f3f9f4;
}

/* Status toggles for truck checks */
.chk-btn {
  display: inline-block;
  width: 32px;
  height: 28px;
  line-height: 26px;
  border-radius: 4px;
  border: 1px solid #cbd5e1;
  background: #f8fafc;
  cursor: pointer;
  font-weight: bold;
  user-select: none;
  font-size: 15px;
  transition: all .1s;
}
.chk-btn:hover { background: #e2e8f0; }
.chk-btn.pass { background: #dcfce7; color: #166534; border-color: #86efac; }
.chk-btn.fail { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
.chk-btn.rectified { background: #fef3c7; color: #92400e; border-color: #fde047; }

/* Pest grid cell */
.pest-cell {
  width: 30px;
  min-width: 30px;
  height: 28px;
  text-align: center;
  font-weight: bold;
  cursor: pointer;
  border-radius: 3px;
  transition: all .1s;
}
.pest-cell.R { background: #dcfce7; color: #15803d; }
.pest-cell.S { background: #fee2e2; color: #b91c1c; font-weight: 800; }

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}
.status-badge.saved { background: #dcfce7; color: #166534; }
.status-badge.unsaved { background: #fef3c7; color: #92400e; }

.sig-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
  background: #f9fbf9;
  border: 1px solid #dce5dc;
  border-radius: 8px;
  padding: 16px;
}
.sig-box {
  background: white;
  border: 1px solid #c9d6ca;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
}
.sig-box canvas {
  border: 1px dashed #b5c7b7;
  border-radius: 4px;
  background: #fdfdfd;
  cursor: crosshair;
  touch-action: none;
  display: block;
  margin: 8px auto;
}
.sig-box .meta-text {
  font-size: 12px;
  color: #55755b;
}

#preview-modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 999;
  justify-content: center;
  align-items: center;
  padding: 20px;
}
#preview-modal.active { display: flex; }
#preview-content {
  background: white;
  border-radius: 10px;
  max-width: 95vw;
  max-height: 95vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
#preview-body {
  overflow: auto;
  padding: 16px;
  text-align: center;
  background: #525659;
}
#preview-body canvas {
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
  max-width: 100%;
  height: auto;
}
"""

def generate_phase3():
    print("3. Generating FM-ML01-ML-13 (น้ำหนักเหล็กรางเท)...")
    art_ml13 = get_pdf_artwork("FM-ML01-ML-13 Rev.01 แบบบันทึกการเก็บน้ำหนักเหล็ก.pdf")
    html_ml13 = build_html_ml13(art_ml13)
    (root / "FM-ML01-ML-13.html").write_text(html_ml13, encoding="utf-8")
    print(f"Saved FM-ML01-ML-13.html ({len(html_ml13):,} bytes)")

    print("4. Generating FM-ML01-ML-18 (ตรวจเช็ครถบรรทุกส่งอ้อย)...")
    art_ml18 = get_pdf_artwork("FM-ML01-ML-18 Rev.00 แบบบันทึกการตรวจสอบรถบรรทุกอ้อย.pdf")
    html_ml18 = build_html_ml18(art_ml18)
    (root / "FM-ML01-ML-18.html").write_text(html_ml18, encoding="utf-8")
    print(f"Saved FM-ML01-ML-18.html ({len(html_ml18):,} bytes)")

    print("5. Generating FM-MR10-MR-01 (เช็คอุปกรณ์ดักจับสัตว์พาหะ)...")
    art_mr01 = get_pdf_artwork("FM-MR10-MR-01 Rev.00 แบบฟอร์มการตรวจสอบสัตว์พาหะนำเชื.pdf")
    html_mr01 = build_html_mr01(art_mr01)
    (root / "FM-MR10-MR-01.html").write_text(html_mr01, encoding="utf-8")
    print(f"Saved FM-MR10-MR-01.html ({len(html_mr01):,} bytes)")

def build_html_ml13(artwork_b64):
    css = CSS_BASE
    css = css.replace("__FONT_TH_SARABUN__", font_payloads.get('THSarabun.ttf', ''))
    css = css.replace("__FONT_TH_SARABUN_BOLD__", font_payloads.get('THSarabun-Bold.ttf', ''))
    css = css.replace("__FONT_SARABUN_REGULAR__", font_payloads.get('Sarabun-Regular.ttf', ''))
    css = css.replace("__FONT_SARABUN_BOLD__", font_payloads.get('Sarabun-Bold.ttf', ''))

    # Build 27 rows HTML
    rows_html = []
    for i in range(1, 28):
        rows_html.append(f"""
        <tr data-row="{i}">
          <td>{i}</td>
          <td><input type="date" class="f-date" data-col="date"></td>
          <td><input type="time" class="f-time" data-col="start_time" onchange="calcRow({i})"></td>
          <td><input type="time" class="f-time" data-col="end_time" onchange="calcRow({i})"></td>
          <td class="calc-col" id="dur_{i}">-</td>
          <td><input type="number" step="0.1" class="num" data-col="shred_chain" oninput="calcRow({i})"></td>
          <td><input type="number" step="0.1" class="num" data-col="shred_blade" oninput="calcRow({i})"></td>
          <td><input type="number" step="0.1" class="num" data-col="shred_other" oninput="calcRow({i})"></td>
          <td><input type="number" step="0.1" class="num" data-col="hsb_chain" oninput="calcRow({i})"></td>
          <td><input type="number" step="0.1" class="num" data-col="hsb_blade" oninput="calcRow({i})"></td>
          <td><input type="number" step="0.1" class="num" data-col="hsb_other" oninput="calcRow({i})"></td>
          <td class="calc-col" id="tot_{i}">-</td>
          <td><input type="text" data-col="recorder" placeholder="พนักงาน"></td>
          <td><input type="text" data-col="checker" placeholder="หน.กะ"></td>
          <td><input type="text" data-col="reviewer" placeholder="วิศวกร"></td>
          <td><input type="text" data-col="remark"></td>
        </tr>""")
    rows_str = "\n".join(rows_html)

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>FM-ML01-ML-13 แบบบันทึกการเก็บน้ำหนักเหล็กรางเท</title>
  <style>{css}</style>
</head>
<body>
  <header>
    <small>ระบบตรวจเช็คเครื่องจักรออนไลน์ • ฝ่ายวิศวกรรมจักรกล แผนกลูกหีบ</small>
    <h1>FM-ML01-ML-13 แบบบันทึกการเก็บน้ำหนักเหล็กรางเท (Rev.01)</h1>
    <p>เครื่องชั่งน้ำหนักเศษเหล็กแม่เหล็กถาวร (เชรดเดอร์ & High Speed Belt) • บันทึกอัตโนมัติและพิมพ์ PDF 100%</p>
  </header>

  <main>
    <div class="toolbar">
      <button class="primary" onclick="saveData()">💾 บันทึกข้อมูล</button>
      <button onclick="renderCanvasPrint()">🖨️ แสดงตัวอย่าง & พิมพ์ (Canvas 260 DPI)</button>
      <button onclick="exportJSON()">📤 ส่งออก JSON</button>
      <label class="import-btn">📥 นำเข้า JSON <input type="file" accept=".json" onchange="importJSON(event)" style="display:none"></label>
      <button onclick="exportCSV()">📊 ส่งออก CSV</button>
      <button class="danger" onclick="resetForm()">🗑️ ล้างข้อมูล</button>
      <span class="status-badge saved" id="save-status">พร้อมใช้งาน</span>
    </div>

    <div class="sheet">
      <div class="meta">
        <div><label>รุ่นเครื่องชั่ง</label><input type="text" id="scale_model" value="เครื่องชั่งดิจิทัลมาตรฐานโรงงาน" oninput="markUnsaved()"></div>
        <div><label>ปีการผลิต</label><input type="text" id="prod_year" value="2567/2568" oninput="markUnsaved()"></div>
        <div><label>ฝ่าย / แผนก</label><input type="text" value="ฝ่ายวิศวกรรมจักรกล แผนกลูกหีบ" readonly style="background:#f1f5f1"></div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card"><div class="lbl">จำนวนครั้งที่เก็บเหล็ก</div><div class="val" id="kpi_events">0</div></div>
        <div class="kpi-card"><div class="lbl">น้ำหนักรวม เชรดเดอร์ (กก.)</div><div class="val" id="kpi_shredder">0.0</div></div>
        <div class="kpi-card"><div class="lbl">น้ำหนักรวม High Speed Belt (กก.)</div><div class="val" id="kpi_hsb">0.0</div></div>
        <div class="kpi-card"><div class="lbl">น้ำหนักรวมทั้งหมด (กก.)</div><div class="val" id="kpi_grand_total">0.0</div></div>
      </div>

      <div class="table-wrapper">
        <table class="form-table">
          <thead>
            <tr>
              <th rowspan="2">ลำดับ</th>
              <th rowspan="2">วันที่</th>
              <th rowspan="2">เวลาเริ่ม</th>
              <th rowspan="2">เวลาเสร็จ</th>
              <th rowspan="2">รวมเวลา<br>(นาที)</th>
              <th colspan="3">น้ำหนักเหล็ก เชรดเดอร์ (กก.)</th>
              <th colspan="3">น้ำหนักเหล็ก High Speed Belt (กก.)</th>
              <th rowspan="2">รวมน้ำหนัก<br>(กก.)</th>
              <th rowspan="2">ผู้บันทึก<br>(พนักงาน)</th>
              <th rowspan="2">ผู้ตรวจสอบ<br>(หน.กะ)</th>
              <th rowspan="2">ผู้ทวนสอบ<br>(วิศวกร)</th>
              <th rowspan="2">หมายเหตุ</th>
            </tr>
            <tr>
              <th>โซ่,สลิง,เป็ค</th>
              <th>ใบมีด</th>
              <th>อื่นๆ</th>
              <th>โซ่,สลิง,เป็ค</th>
              <th>ใบมีด</th>
              <th>อื่นๆ</th>
            </tr>
          </thead>
          <tbody>
            {rows_str}
          </tbody>
        </table>
      </div>

      <div class="sig-section">
        <div class="sig-box">
          <strong>ผู้บันทึก (พนักงานเก็บเหล็ก)</strong>
          <canvas id="sig_recorder" width="300" height="100"></canvas>
          <div class="meta-text" id="sig_rec_meta">ยังไม่มีลายมือชื่อ</div>
          <button style="font-size:12px;padding:4px 8px;margin-top:4px" onclick="clearSig('sig_recorder')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผู้ตรวจสอบ (หัวหน้ากะ)</strong>
          <canvas id="sig_checker" width="300" height="100"></canvas>
          <div class="meta-text" id="sig_chk_meta">ยังไม่มีลายมือชื่อ</div>
          <button style="font-size:12px;padding:4px 8px;margin-top:4px" onclick="clearSig('sig_checker')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผู้ทวนสอบ (หัวหน้าแผนก/วิศวกร)</strong>
          <canvas id="sig_reviewer" width="300" height="100"></canvas>
          <div class="meta-text" id="sig_rev_meta">ยังไม่มีลายมือชื่อ</div>
          <button style="font-size:12px;padding:4px 8px;margin-top:4px" onclick="clearSig('sig_reviewer')">ล้างลายเซ็น</button>
        </div>
      </div>
    </div>
  </main>

  <div id="preview-modal">
    <div id="preview-content">
      <div style="padding:12px 20px;background:#143d25;color:white;display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">ตัวอย่างเอกสารพิมพ์ (Canvas 260 DPI Pixel-Perfect)</h3>
        <div>
          <button class="primary" onclick="printDoc()">🖨️ สั่งพิมพ์ / บันทึก PDF</button>
          <button onclick="downloadPNG()">💾 ดาวน์โหลดภาพ PNG</button>
          <button style="margin-left:10px" onclick="closePreview()">✕ ปิด</button>
        </div>
      </div>
      <div id="preview-body">
        <canvas id="print_canvas"></canvas>
      </div>
    </div>
  </div>

  <script>
    const FORM_ID = 'FM-ML01-ML-13';
    const ARTWORK_SRC = '{artwork_b64}';
    let artImg = new Image();
    artImg.src = ARTWORK_SRC;

    // Signature handling
    const sigCanvases = {{}};
    ['sig_recorder', 'sig_checker', 'sig_reviewer'].forEach(id => {{
      const cv = document.getElementById(id);
      const ctx = cv.getContext('2d');
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0b2512';
      let drawing = false;
      cv.addEventListener('mousedown', e => {{ drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); }});
      cv.addEventListener('mousemove', e => {{ if(drawing) {{ ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); markUnsaved(); }} }});
      window.addEventListener('mouseup', () => drawing = false);
      sigCanvases[id] = cv;
    }});

    function clearSig(id) {{
      const cv = sigCanvases[id];
      const ctx = cv.getContext('2d');
      ctx.clearRect(0, 0, cv.width, cv.height);
      document.getElementById(id.replace('sig_', 'sig_') + '_meta').innerText = 'ยังไม่มีลายมือชื่อ';
      markUnsaved();
    }}

    function diffMinutes(start, end) {{
      if(!start || !end) return 0;
      const [h1, m1] = start.split(':').map(Number);
      const [h2, m2] = end.split(':').map(Number);
      let mins = (h2 * 60 + m2) - (h1 * 60 + m1);
      if(mins < 0) mins += 1440;
      return mins;
    }}

    function calcRow(rowIdx) {{
      markUnsaved();
      const tr = document.querySelector('tr[data-row="' + rowIdx + '"]');
      if(!tr) return;
      const start = tr.querySelector('[data-col="start_time"]').value;
      const end = tr.querySelector('[data-col="end_time"]').value;
      const durEl = document.getElementById('dur_' + rowIdx);
      if(start && end) {{
        durEl.innerText = diffMinutes(start, end);
      }} else {{
        durEl.innerText = '-';
      }}

      const vals = [
        parseFloat(tr.querySelector('[data-col="shred_chain"]').value) || 0,
        parseFloat(tr.querySelector('[data-col="shred_blade"]').value) || 0,
        parseFloat(tr.querySelector('[data-col="shred_other"]').value) || 0,
        parseFloat(tr.querySelector('[data-col="hsb_chain"]').value) || 0,
        parseFloat(tr.querySelector('[data-col="hsb_blade"]').value) || 0,
        parseFloat(tr.querySelector('[data-col="hsb_other"]').value) || 0,
      ];
      const sum = vals.reduce((a, b) => a + b, 0);
      const totEl = document.getElementById('tot_' + rowIdx);
      totEl.innerText = sum > 0 ? sum.toFixed(1) : '-';

      updateKPIs();
    }}

    function updateKPIs() {{
      let events = 0;
      let shredTotal = 0;
      let hsbTotal = 0;

      for(let i = 1; i <= 27; i++) {{
        const tr = document.querySelector('tr[data-row="' + i + '"]');
        if(!tr) continue;
        const s1 = parseFloat(tr.querySelector('[data-col="shred_chain"]').value) || 0;
        const s2 = parseFloat(tr.querySelector('[data-col="shred_blade"]').value) || 0;
        const s3 = parseFloat(tr.querySelector('[data-col="shred_other"]').value) || 0;
        const h1 = parseFloat(tr.querySelector('[data-col="hsb_chain"]').value) || 0;
        const h2 = parseFloat(tr.querySelector('[data-col="hsb_blade"]').value) || 0;
        const h3 = parseFloat(tr.querySelector('[data-col="hsb_other"]').value) || 0;
        const rowShred = s1 + s2 + s3;
        const rowHsb = h1 + h2 + h3;
        if(rowShred > 0 || rowHsb > 0 || tr.querySelector('[data-col="start_time"]').value) {{
          events++;
          shredTotal += rowShred;
          hsbTotal += rowHsb;
        }}
      }}

      document.getElementById('kpi_events').innerText = events;
      document.getElementById('kpi_shredder').innerText = shredTotal.toFixed(1);
      document.getElementById('kpi_hsb').innerText = hsbTotal.toFixed(1);
      document.getElementById('kpi_grand_total').innerText = (shredTotal + hsbTotal).toFixed(1);
    }}

    function markUnsaved() {{
      const b = document.getElementById('save-status');
      b.className = 'status-badge unsaved';
      b.innerText = 'มีการเปลี่ยนแปลงยังไม่บันทึก';
    }}

    function getFormData() {{
      const data = {{
        scale_model: document.getElementById('scale_model').value,
        prod_year: document.getElementById('prod_year').value,
        rows: []
      }};
      for(let i = 1; i <= 27; i++) {{
        const tr = document.querySelector('tr[data-row="' + i + '"]');
        const row = {{}};
        tr.querySelectorAll('[data-col]').forEach(inp => {{
          row[inp.dataset.col] = inp.value;
        }});
        row.dur = document.getElementById('dur_' + i).innerText;
        row.tot = document.getElementById('tot_' + i).innerText;
        data.rows.push(row);
      }}
      return data;
    }}

    function saveData() {{
      const d = getFormData();
      localStorage.setItem(FORM_ID + '_data', JSON.stringify(d));
      const b = document.getElementById('save-status');
      b.className = 'status-badge saved';
      b.innerText = 'บันทึกแล้ว (' + new Date().toLocaleTimeString('th-TH') + ')';
    }}

    function loadData() {{
      const raw = localStorage.getItem(FORM_ID + '_data');
      if(!raw) return;
      try {{
        const d = JSON.parse(raw);
        if(d.scale_model) document.getElementById('scale_model').value = d.scale_model;
        if(d.prod_year) document.getElementById('prod_year').value = d.prod_year;
        if(Array.isArray(d.rows)) {{
          d.rows.forEach((row, idx) => {{
            const i = idx + 1;
            const tr = document.querySelector('tr[data-row="' + i + '"]');
            if(!tr) return;
            Object.keys(row).forEach(k => {{
              const inp = tr.querySelector('[data-col="' + k + '"]');
              if(inp) inp.value = row[k];
            }});
            calcRow(i);
          }});
        }}
        const b = document.getElementById('save-status');
        b.className = 'status-badge saved';
        b.innerText = 'โหลดข้อมูลสำเร็จ';
      }} catch(e) {{
        console.error(e);
      }}
    }}

    function resetForm() {{
      if(!confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่?')) return;
      localStorage.removeItem(FORM_ID + '_data');
      location.reload();
    }}

    function exportJSON() {{
      const d = getFormData();
      const blob = new Blob([JSON.stringify(d, null, 2)], {{type: 'application/json'}});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = FORM_ID + '_' + new Date().toISOString().slice(0,10) + '.json';
      a.click();
    }}

    function importJSON(e) {{
      const f = e.target.files[0];
      if(!f) return;
      const r = new FileReader();
      r.onload = ev => {{
        localStorage.setItem(FORM_ID + '_data', ev.target.result);
        loadData();
      }};
      r.readAsText(f);
    }}

    function exportCSV() {{
      const d = getFormData();
      let csv = '\\uFEFFลำดับ,วันที่,เวลาเริ่ม,เวลาเสร็จ,รวมเวลา,เชรดเดอร์-โซ่,เชรดเดอร์-ใบมีด,เชรดเดอร์-อื่นๆ,HSB-โซ่,HSB-ใบมีด,HSB-อื่นๆ,รวมน้ำหนัก,ผู้บันทึก,ผู้ตรวจสอบ,ผู้ทวนสอบ,หมายเหตุ\\n';
      d.rows.forEach((r, idx) => {{
        csv += [
          idx + 1, r.date || '', r.start_time || '', r.end_time || '', r.dur || '',
          r.shred_chain || '', r.shred_blade || '', r.shred_other || '',
          r.hsb_chain || '', r.hsb_blade || '', r.hsb_other || '',
          r.tot || '', r.recorder || '', r.checker || '', r.reviewer || '', r.remark || ''
        ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',') + '\\n';
      }});
      const blob = new Blob([csv], {{type: 'text/csv;charset=utf-8;'}});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = FORM_ID + '_' + new Date().toISOString().slice(0,10) + '.csv';
      a.click();
    }}

    // Canvas 260 DPI Pixel Accurate Rendering
    function renderCanvasPrint() {{
      const canvas = document.getElementById('print_canvas');
      canvas.width = 3040;
      canvas.height = 2150;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(artImg, 0, 0, 3040, 2150);

      ctx.fillStyle = '#0a2310';
      ctx.font = 'bold 24px "TH Sarabun", sans-serif';

      // Header info
      const sm = document.getElementById('scale_model').value;
      const py = document.getElementById('prod_year').value;
      if(sm) ctx.fillText(sm, 1360, 236, 450);
      if(py) ctx.fillText(py, 2120, 236, 120);

      // Data Rows: 27 rows. y starts at 426.0, dy ≈ 55.48
      const cols = [63.4, 261.0, 417.8, 573.8, 729.0, 955.2, 1180.6, 1406.0, 1631.3, 1856.8, 2082.1, 2287.5, 2446.2, 2603.9, 2760.8, 2974.0];
      const d = getFormData();
      ctx.font = '26px "TH Sarabun", sans-serif';

      d.rows.forEach((r, idx) => {{
        if(idx >= 27) return;
        const y = 426.0 + idx * 55.48 + 38;

        const drawCenter = (txt, c1, c2) => {{
          if(!txt || txt === '-') return;
          ctx.textAlign = 'center';
          ctx.fillText(txt, (cols[c1] + cols[c2]) / 2, y);
        }};

        drawCenter(r.date, 0, 1);
        drawCenter(r.start_time, 1, 2);
        drawCenter(r.end_time, 2, 3);
        drawCenter(r.dur, 3, 4);
        drawCenter(r.shred_chain, 4, 5);
        drawCenter(r.shred_blade, 5, 6);
        drawCenter(r.shred_other, 6, 7);
        drawCenter(r.hsb_chain, 7, 8);
        drawCenter(r.hsb_blade, 8, 9);
        drawCenter(r.hsb_other, 9, 10);
        drawCenter(r.tot, 10, 11);
        drawCenter(r.recorder, 11, 12);
        drawCenter(r.checker, 12, 13);
        drawCenter(r.reviewer, 13, 14);
        if(r.remark) {{
          ctx.textAlign = 'left';
          ctx.fillText(r.remark, cols[14] + 10, y);
        }}
      }});

      document.getElementById('preview-modal').classList.add('active');
    }}

    function closePreview() {{
      document.getElementById('preview-modal').classList.remove('active');
    }}

    function printDoc() {{
      const canvas = document.getElementById('print_canvas');
      const w = window.open('');
      w.document.write('<html><head><title>พิมพ์เอกสาร</title><style>@page {{ size: landscape; margin: 0; }} body {{ margin: 0; }} img {{ width: 100vw; height: auto; }}</style></head><body><img src="' + canvas.toDataURL('image/png') + '"></body></html>');
      w.document.close();
      setTimeout(() => {{ w.focus(); w.print(); }}, 500);
    }}

    function downloadPNG() {{
      const canvas = document.getElementById('print_canvas');
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = FORM_ID + '_print.png';
      a.click();
    }}

    window.addEventListener('load', loadData);
  </script>
</body>
</html>"""
    return html

def build_html_ml18(artwork_b64):
    css = CSS_BASE
    css = css.replace("__FONT_TH_SARABUN__", font_payloads.get('THSarabun.ttf', ''))
    css = css.replace("__FONT_TH_SARABUN_BOLD__", font_payloads.get('THSarabun-Bold.ttf', ''))
    css = css.replace("__FONT_SARABUN_REGULAR__", font_payloads.get('Sarabun-Regular.ttf', ''))
    css = css.replace("__FONT_SARABUN_BOLD__", font_payloads.get('Sarabun-Bold.ttf', ''))

    rows_html = []
    for i in range(1, 39):
        rows_html.append(f"""
        <tr data-row="{i}">
          <td>{i}</td>
          <td><input type="text" data-col="plate" placeholder="เช่น 82-1234" oninput="updateTruckKPIs()"></td>
          <td><input type="text" data-col="brand" placeholder="ISUZU" style="width:80px"></td>
          <td><input type="text" data-col="model" placeholder="10ล้อ" style="width:70px"></td>
          <td><input type="checkbox" data-col="type_whole" onchange="markUnsaved()"></td>
          <td><input type="checkbox" data-col="type_billet" onchange="markUnsaved()"></td>
          <td><span class="chk-btn" data-col="chk_wheel" onclick="toggleStatus(this)"></span></td>
          <td><span class="chk-btn" data-col="chk_bolt" onclick="toggleStatus(this)"></span></td>
          <td><span class="chk-btn" data-col="chk_tailgate" onclick="toggleStatus(this)"></span></td>
          <td><span class="chk-btn" data-col="chk_guard" onclick="toggleStatus(this)"></span></td>
          <td><span class="chk-btn" data-col="chk_sling" onclick="toggleStatus(this)"></span></td>
          <td><input type="text" data-col="remark" placeholder="หมายเหตุ"></td>
        </tr>""")
    rows_str = "\n".join(rows_html)

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>FM-ML01-ML-18 แบบบันทึกการตรวจสอบรถบรรทุกอ้อย</title>
  <style>{css}</style>
</head>
<body>
  <header>
    <small>ระบบตรวจเช็คเครื่องจักรออนไลน์ • ฝ่ายวิศวกรรมจักรกล แผนกลูกหีบ</small>
    <h1>FM-ML01-ML-18 แบบบันทึกการตรวจสอบรถบรรทุกอ้อย (Rev.00)</h1>
    <p>การตรวจสอบความปลอดภัยรถบรรทุกอ้อยก่อนเข้าดั๊มพ์ยกรถ • 🗸=ผ่าน, ✗=ไม่ผ่าน, ☒=แก้ไขให้ผ่านแล้ว</p>
  </header>

  <main>
    <div class="toolbar">
      <button class="primary" onclick="saveData()">💾 บันทึกข้อมูล</button>
      <button onclick="renderCanvasPrint()">🖨️ แสดงตัวอย่าง & พิมพ์ (Canvas 260 DPI)</button>
      <button onclick="exportJSON()">📤 ส่งออก JSON</button>
      <label class="import-btn">📥 นำเข้า JSON <input type="file" accept=".json" onchange="importJSON(event)" style="display:none"></label>
      <button onclick="exportCSV()">📊 ส่งออก CSV</button>
      <button class="danger" onclick="resetForm()">🗑️ ล้างข้อมูล</button>
      <span class="status-badge saved" id="save-status">พร้อมใช้งาน</span>
    </div>

    <div class="sheet">
      <div class="meta">
        <div><label>วันที่ตรวจสอบ</label><input type="date" id="doc_date" oninput="markUnsaved()"></div>
        <div><label>ปีการผลิต</label><input type="text" id="prod_year" value="2567/2568" oninput="markUnsaved()"></div>
        <div><label>ฝ่าย / แผนก</label><input type="text" value="ฝ่ายวิศวกรรมจักรกล แผนกลูกหีบ" readonly style="background:#f1f5f1"></div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card"><div class="lbl">รถที่บันทึกทั้งหมด</div><div class="val" id="kpi_trucks">0</div></div>
        <div class="kpi-card"><div class="lbl">ผ่านเกณฑ์ (🗸)</div><div class="val" id="kpi_pass" style="color:#15803d">0</div></div>
        <div class="kpi-card"><div class="lbl">ไม่ผ่าน (✗)</div><div class="val" id="kpi_fail" style="color:#b91c1c">0</div></div>
        <div class="kpi-card"><div class="lbl">แก้ไขให้ผ่าน (☒)</div><div class="val" id="kpi_rectified" style="color:#b45309">0</div></div>
        <div class="kpi-card"><div class="lbl">อัตราความปลอดภัย (%)</div><div class="val" id="kpi_compliance">100.0%</div></div>
      </div>

      <div class="table-wrapper">
        <table class="form-table">
          <thead>
            <tr>
              <th rowspan="2">ลำดับ</th>
              <th colspan="3">ข้อมูลรถบรรทุก</th>
              <th colspan="2">ชนิดอ้อย</th>
              <th colspan="5">หัวข้อตรวจสอบ (คลิก: 🗸 ผ่าน | ✗ ไม่ผ่าน | ☒ แก้ไขแล้ว)</th>
              <th rowspan="2">หมายเหตุ</th>
            </tr>
            <tr>
              <th>ทะเบียนรถ</th>
              <th>ยี่ห้อ</th>
              <th>รุ่น</th>
              <th>อ้อยลำ</th>
              <th>อ้อยตัด</th>
              <th>ล้อรถ</th>
              <th>โบลต์ล็อค</th>
              <th>ฝาท้าย</th>
              <th>การ์ดหม้อน้ำ</th>
              <th>โซ่/สลิงผ้า</th>
            </tr>
          </thead>
          <tbody>
            {rows_str}
          </tbody>
        </table>
      </div>

      <div class="sig-section">
        <div class="sig-box">
          <strong>ผู้บันทึก (พนักงานตรวจสอบรถบรรทุก)</strong>
          <canvas id="sig_recorder" width="280" height="90"></canvas>
          <input type="text" id="rec_name" placeholder="ชื่อ-สกุล พนักงาน" style="margin-top:4px">
          <button style="font-size:12px;padding:4px 8px;margin-top:4px" onclick="clearSig('sig_recorder')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผู้ตรวจสอบ (หัวหน้าชุด/หัวหน้ากะ)</strong>
          <canvas id="sig_checker" width="280" height="90"></canvas>
          <input type="text" id="chk_name" placeholder="ชื่อ-สกุล หัวหน้ากะ" style="margin-top:4px">
          <button style="font-size:12px;padding:4px 8px;margin-top:4px" onclick="clearSig('sig_checker')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผู้ทวนสอบ (หัวหน้าแผนก/วิศวกร)</strong>
          <canvas id="sig_reviewer" width="280" height="90"></canvas>
          <input type="text" id="rev_name" placeholder="ชื่อ-สกุล วิศวกร" style="margin-top:4px">
          <button style="font-size:12px;padding:4px 8px;margin-top:4px" onclick="clearSig('sig_reviewer')">ล้างลายเซ็น</button>
        </div>
      </div>
    </div>
  </main>

  <div id="preview-modal">
    <div id="preview-content">
      <div style="padding:12px 20px;background:#143d25;color:white;display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">ตัวอย่างเอกสารพิมพ์ (Canvas 260 DPI Pixel-Perfect)</h3>
        <div>
          <button class="primary" onclick="printDoc()">🖨️ สั่งพิมพ์ / บันทึก PDF</button>
          <button onclick="downloadPNG()">💾 ดาวน์โหลดภาพ PNG</button>
          <button style="margin-left:10px" onclick="closePreview()">✕ ปิด</button>
        </div>
      </div>
      <div id="preview-body">
        <canvas id="print_canvas"></canvas>
      </div>
    </div>
  </div>

  <script>
    const FORM_ID = 'FM-ML01-ML-18';
    const ARTWORK_SRC = '{artwork_b64}';
    let artImg = new Image();
    artImg.src = ARTWORK_SRC;

    const sigCanvases = {{}};
    ['sig_recorder', 'sig_checker', 'sig_reviewer'].forEach(id => {{
      const cv = document.getElementById(id);
      const ctx = cv.getContext('2d');
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0b2512';
      let drawing = false;
      cv.addEventListener('mousedown', e => {{ drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); }});
      cv.addEventListener('mousemove', e => {{ if(drawing) {{ ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); markUnsaved(); }} }});
      window.addEventListener('mouseup', () => drawing = false);
      sigCanvases[id] = cv;
    }});

    function clearSig(id) {{
      const cv = sigCanvases[id];
      cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
      markUnsaved();
    }}

    function toggleStatus(btn) {{
      markUnsaved();
      const cur = btn.innerText;
      if(!cur) {{
        btn.innerText = '🗸';
        btn.className = 'chk-btn pass';
      }} else if(cur === '🗸') {{
        btn.innerText = '✗';
        btn.className = 'chk-btn fail';
      }} else if(cur === '✗') {{
        btn.innerText = '☒';
        btn.className = 'chk-btn rectified';
      }} else {{
        btn.innerText = '';
        btn.className = 'chk-btn';
      }}
      updateTruckKPIs();
    }}

    function updateTruckKPIs() {{
      markUnsaved();
      let trucks = 0, p = 0, f = 0, r = 0;
      for(let i = 1; i <= 38; i++) {{
        const tr = document.querySelector('tr[data-row="' + i + '"]');
        if(!tr) continue;
        const plate = tr.querySelector('[data-col="plate"]').value.trim();
        if(plate) {{
          trucks++;
          ['chk_wheel', 'chk_bolt', 'chk_tailgate', 'chk_guard', 'chk_sling'].forEach(col => {{
            const val = tr.querySelector('[data-col="' + col + '"]').innerText;
            if(val === '🗸') p++;
            else if(val === '✗') f++;
            else if(val === '☒') r++;
          }});
        }}
      }}
      document.getElementById('kpi_trucks').innerText = trucks;
      document.getElementById('kpi_pass').innerText = p;
      document.getElementById('kpi_fail').innerText = f;
      document.getElementById('kpi_rectified').innerText = r;
      const totalChecks = p + f + r;
      const rate = totalChecks > 0 ? (((p + r) / totalChecks) * 100).toFixed(1) : 100.0;
      document.getElementById('kpi_compliance').innerText = rate + '%';
    }}

    function markUnsaved() {{
      const b = document.getElementById('save-status');
      b.className = 'status-badge unsaved';
      b.innerText = 'มีการเปลี่ยนแปลงยังไม่บันทึก';
    }}

    function getFormData() {{
      const data = {{
        doc_date: document.getElementById('doc_date').value,
        prod_year: document.getElementById('prod_year').value,
        rec_name: document.getElementById('rec_name').value,
        chk_name: document.getElementById('chk_name').value,
        rev_name: document.getElementById('rev_name').value,
        rows: []
      }};
      for(let i = 1; i <= 38; i++) {{
        const tr = document.querySelector('tr[data-row="' + i + '"]');
        data.rows.push({{
          plate: tr.querySelector('[data-col="plate"]').value,
          brand: tr.querySelector('[data-col="brand"]').value,
          model: tr.querySelector('[data-col="model"]').value,
          type_whole: tr.querySelector('[data-col="type_whole"]').checked,
          type_billet: tr.querySelector('[data-col="type_billet"]').checked,
          chk_wheel: tr.querySelector('[data-col="chk_wheel"]').innerText,
          chk_bolt: tr.querySelector('[data-col="chk_bolt"]').innerText,
          chk_tailgate: tr.querySelector('[data-col="chk_tailgate"]').innerText,
          chk_guard: tr.querySelector('[data-col="chk_guard"]').innerText,
          chk_sling: tr.querySelector('[data-col="chk_sling"]').innerText,
          remark: tr.querySelector('[data-col="remark"]').value
        }});
      }}
      return data;
    }}

    function saveData() {{
      const d = getFormData();
      localStorage.setItem(FORM_ID + '_data', JSON.stringify(d));
      const b = document.getElementById('save-status');
      b.className = 'status-badge saved';
      b.innerText = 'บันทึกแล้ว (' + new Date().toLocaleTimeString('th-TH') + ')';
    }}

    function loadData() {{
      const raw = localStorage.getItem(FORM_ID + '_data');
      if(!raw) {{
        document.getElementById('doc_date').value = new Date().toISOString().slice(0, 10);
        return;
      }}
      try {{
        const d = JSON.parse(raw);
        if(d.doc_date) document.getElementById('doc_date').value = d.doc_date;
        if(d.prod_year) document.getElementById('prod_year').value = d.prod_year;
        if(d.rec_name) document.getElementById('rec_name').value = d.rec_name;
        if(d.chk_name) document.getElementById('chk_name').value = d.chk_name;
        if(d.rev_name) document.getElementById('rev_name').value = d.rev_name;
        if(Array.isArray(d.rows)) {{
          d.rows.forEach((r, idx) => {{
            const tr = document.querySelector('tr[data-row="' + (idx + 1) + '"]');
            if(!tr) return;
            tr.querySelector('[data-col="plate"]').value = r.plate || '';
            tr.querySelector('[data-col="brand"]').value = r.brand || '';
            tr.querySelector('[data-col="model"]').value = r.model || '';
            tr.querySelector('[data-col="type_whole"]').checked = !!r.type_whole;
            tr.querySelector('[data-col="type_billet"]').checked = !!r.type_billet;
            ['chk_wheel', 'chk_bolt', 'chk_tailgate', 'chk_guard', 'chk_sling'].forEach(col => {{
              const btn = tr.querySelector('[data-col="' + col + '"]');
              const v = r[col] || '';
              btn.innerText = v;
              btn.className = 'chk-btn ' + (v === '🗸' ? 'pass' : v === '✗' ? 'fail' : v === '☒' ? 'rectified' : '');
            }});
            tr.querySelector('[data-col="remark"]').value = r.remark || '';
          }});
        }}
        updateTruckKPIs();
        const b = document.getElementById('save-status');
        b.className = 'status-badge saved';
        b.innerText = 'โหลดข้อมูลสำเร็จ';
      }} catch(e) {{
        console.error(e);
      }}
    }}

    function resetForm() {{
      if(!confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่?')) return;
      localStorage.removeItem(FORM_ID + '_data');
      location.reload();
    }}

    function exportJSON() {{
      const d = getFormData();
      const blob = new Blob([JSON.stringify(d, null, 2)], {{type: 'application/json'}});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = FORM_ID + '_' + new Date().toISOString().slice(0,10) + '.json';
      a.click();
    }}

    function importJSON(e) {{
      const f = e.target.files[0];
      if(!f) return;
      const r = new FileReader();
      r.onload = ev => {{
        localStorage.setItem(FORM_ID + '_data', ev.target.result);
        loadData();
      }};
      r.readAsText(f);
    }}

    function exportCSV() {{
      const d = getFormData();
      let csv = '\\uFEFFลำดับ,ทะเบียนรถ,ยี่ห้อ,รุ่น,อ้อยลำ,อ้อยตัด,ล้อรถ,โบลต์ล็อค,ฝาท้าย,การ์ดหม้อน้ำ,โซ่/สลิงผ้า,หมายเหตุ\\n';
      d.rows.forEach((r, idx) => {{
        csv += [
          idx + 1, r.plate || '', r.brand || '', r.model || '',
          r.type_whole ? 'Y' : '', r.type_billet ? 'Y' : '',
          r.chk_wheel || '', r.chk_bolt || '', r.chk_tailgate || '', r.chk_guard || '', r.chk_sling || '',
          r.remark || ''
        ].map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',') + '\\n';
      }});
      const blob = new Blob([csv], {{type: 'text/csv;charset=utf-8;'}});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = FORM_ID + '_' + new Date().toISOString().slice(0,10) + '.csv';
      a.click();
    }}

    function renderCanvasPrint() {{
      const canvas = document.getElementById('print_canvas');
      canvas.width = 2150;
      canvas.height = 3040;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(artImg, 0, 0, 2150, 3040);

      ctx.fillStyle = '#0a2310';
      ctx.font = 'bold 24px "TH Sarabun", sans-serif';

      // Header meta: วันที่, ปีการผลิต
      const dt = document.getElementById('doc_date').value;
      const py = document.getElementById('prod_year').value;
      if(dt) {{
        const parts = dt.split('-');
        const thDate = parts[2] + '/' + parts[1] + '/' + (parseInt(parts[0]) + 543);
        ctx.fillText(thDate, 1260, 348, 160);
      }}
      if(py) ctx.fillText(py, 1580, 348, 100);

      // 38 rows. y start = 479.3, dy ≈ 54.61
      const cols = [89.3, 170.3, 320.8, 470.2, 618.9, 769.3, 918.0, 1068.3, 1217.9, 1367.4, 1517.0, 1665.7, 2054.9];
      const d = getFormData();
      ctx.font = '24px "TH Sarabun", sans-serif';

      d.rows.forEach((r, idx) => {{
        if(idx >= 38) return;
        const y = 479.3 + idx * 54.61 + 37;

        const drawCenter = (txt, c1, c2) => {{
          if(!txt) return;
          ctx.textAlign = 'center';
          ctx.fillText(txt, (cols[c1] + cols[c2]) / 2, y);
        }};

        drawCenter(r.plate, 1, 2);
        drawCenter(r.brand, 2, 3);
        drawCenter(r.model, 3, 4);
        if(r.type_whole) drawCenter('✓', 4, 5);
        if(r.type_billet) drawCenter('✓', 5, 6);
        drawCenter(r.chk_wheel, 6, 7);
        drawCenter(r.chk_bolt, 7, 8);
        drawCenter(r.chk_tailgate, 8, 9);
        drawCenter(r.chk_guard, 9, 10);
        drawCenter(r.chk_sling, 10, 11);
        if(r.remark) {{
          ctx.textAlign = 'left';
          ctx.fillText(r.remark, cols[11] + 10, y);
        }}
      }});

      // Signatures
      ['sig_recorder', 'sig_checker', 'sig_reviewer'].forEach((id, idx) => {{
        const cv = sigCanvases[id];
        const sx = [300, 720, 1150][idx];
        ctx.drawImage(cv, sx, 2630, 240, 70);
      }});

      document.getElementById('preview-modal').classList.add('active');
    }}

    function closePreview() {{
      document.getElementById('preview-modal').classList.remove('active');
    }}

    function printDoc() {{
      const canvas = document.getElementById('print_canvas');
      const w = window.open('');
      w.document.write('<html><head><title>พิมพ์เอกสาร</title><style>@page {{ size: portrait; margin: 0; }} body {{ margin: 0; }} img {{ width: 100vw; height: auto; }}</style></head><body><img src="' + canvas.toDataURL('image/png') + '"></body></html>');
      w.document.close();
      setTimeout(() => {{ w.focus(); w.print(); }}, 500);
    }}

    function downloadPNG() {{
      const canvas = document.getElementById('print_canvas');
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = FORM_ID + '_print.png';
      a.click();
    }}

    window.addEventListener('load', loadData);
  </script>
</body>
</html>"""
    return html

def build_html_mr01(artwork_b64):
    css = CSS_BASE
    css = css.replace("__FONT_TH_SARABUN__", font_payloads.get('THSarabun.ttf', ''))
    css = css.replace("__FONT_TH_SARABUN_BOLD__", font_payloads.get('THSarabun-Bold.ttf', ''))
    css = css.replace("__FONT_SARABUN_REGULAR__", font_payloads.get('Sarabun-Regular.ttf', ''))
    css = css.replace("__FONT_SARABUN_BOLD__", font_payloads.get('Sarabun-Bold.ttf', ''))

    # Default 20 bait stations around factory
    default_stations = [
      "1. โต๊ะส่งอ้อย ชุดที่ 1",
      "2. โต๊ะส่งอ้อย ชุดที่ 2",
      "3. สายพานลำเลียงอ้อยชุดที่ 1",
      "4. สายพานลำเลียงอ้อยชุดที่ 2",
      "5. ชุดมีดตัดอ้อย ชุดที่ 1",
      "6. ชุดมีดตัดอ้อย ชุดที่ 2",
      "7. บริเวณเครื่องตีอ้อย (เชรดเดอร์)",
      "8. แท่นลูกหีบ ชุดที่ 1",
      "9. แท่นลูกหีบ ชุดที่ 2",
      "10. แท่นลูกหีบ ชุดที่ 3",
      "11. แท่นลูกหีบ ชุดที่ 4",
      "12. แท่นลูกหีบ ชุดที่ 5",
      "13. ตะแกรงกรองน้ำอ้อย (Rotary)",
      "14. บ่อพักน้ำอ้อยผสม",
      "15. ลานกากอ้อย (Bagasse)",
      "16. ใต้สะพานดั๊มพ์ยกรถอ้อย",
      "17. ห้องไฮดรอลิกดั๊มพ์",
      "18. ลานจอดรถบรรทุกอ้อย",
      "19. บริเวณรางเทเศษเหล็ก",
      "20. โรงสูบน้ำและหอหล่อเย็น"
    ]

    # Generate 20 rows x 31 days
    rows_html = []
    for i in range(1, 21):
        station_name = default_stations[i-1]
        days_tds = []
        for d in range(1, 32):
            days_tds.append(f'<td class="pest-cell" data-st="{i}" data-day="{d}" onclick="togglePest(this)"></td>')
        days_str = "".join(days_tds)
        rows_html.append(f"""
        <tr data-station="{i}">
          <td>{i}</td>
          <td><input type="text" data-field="station_desc" value="{station_name}" style="width:230px;text-align:left"></td>
          {days_str}
        </tr>""")
    rows_str = "\n".join(rows_html)

    # 8 Incident log rows
    incidents_html = []
    for i in range(1, 9):
        incidents_html.append(f"""
        <tr>
          <td style="width:50px">{i}</td>
          <td style="width:140px"><input type="date" data-inc="date_{i}"></td>
          <td style="width:180px"><input type="text" data-inc="loc_{i}" placeholder="จุดที่พบ/อุปกรณ์"></td>
          <td><input type="text" data-inc="desc_{i}" placeholder="สาเหตุ / การแก้ไขเบื้องต้น (แนบรูปถ่าย)"></td>
          <td style="width:110px"><input type="text" data-inc="resp_{i}" placeholder="ผู้ดำเนินการ"></td>
        </tr>""")
    inc_rows_str = "\n".join(incidents_html)

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>FM-MR10-MR-01 แบบฟอร์มการตรวจสอบสัตว์พาหะนำเชื้อ</title>
  <style>{css}</style>
</head>
<body>
  <header>
    <small>ระบบตรวจเช็คเครื่องจักรออนไลน์ • แผนกลูกหีบ ฝ่ายวิศวกรรมจักรกล</small>
    <h1>FM-MR10-MR-01 แบบฟอร์มการตรวจสอบสัตว์พาหะนำเชื้อ (Rev.00)</h1>
    <p>การตรวจสอบและควบคุมสัตว์พาหะนำเชื้อประจำเดือน • R = ปกติ, S = ผิดปกติ (พบซาก/รอยกัดแทะ/อุปกรณ์ชำรุด)</p>
  </header>

  <main>
    <div class="toolbar">
      <button class="primary" onclick="saveData()">💾 บันทึกข้อมูล</button>
      <button onclick="renderCanvasPrint()">🖨️ แสดงตัวอย่าง & พิมพ์ (Canvas 260 DPI)</button>
      <button onclick="fillTodayR()">✔️ ติ๊ก 'R' (ปกติ) ทั้งหมดของวันนี้</button>
      <button onclick="clearToday()">🔄 ล้างค่าของวันนี้</button>
      <button onclick="exportJSON()">📤 ส่งออก JSON</button>
      <label class="import-btn">📥 นำเข้า JSON <input type="file" accept=".json" onchange="importJSON(event)" style="display:none"></label>
      <button class="danger" onclick="resetForm()">🗑️ ล้างข้อมูล</button>
      <span class="status-badge saved" id="save-status">พร้อมใช้งาน</span>
    </div>

    <div class="sheet">
      <div class="meta">
        <div><label>แผนก / พื้นที่</label><input type="text" id="area_dept" value="แผนกลูกหีบ / ฝ่ายวิศวกรรมจักรกล" oninput="markUnsaved()"></div>
        <div>
          <label>ประจำเดือน</label>
          <select id="month_str" onchange="markUnsaved()">
            <option value="มกราคม">มกราคม</option>
            <option value="กุมภาพันธ์">กุมภาพันธ์</option>
            <option value="มีนาคม">มีนาคม</option>
            <option value="เมษายน">เมษายน</option>
            <option value="พฤษภาคม">พฤษภาคม</option>
            <option value="มิถุนายน">มิถุนายน</option>
            <option value="กรกฎาคม">กรกฎาคม</option>
            <option value="สิงหาคม">สิงหาคม</option>
            <option value="กันยายน">กันยายน</option>
            <option value="ตุลาคม" selected>ตุลาคม</option>
            <option value="พฤศจิกายน">พฤศจิกายน</option>
            <option value="ธันวาคม">ธันวาคม</option>
          </select>
        </div>
        <div><label>พ.ศ.</label><input type="text" id="year_str" value="2567" oninput="markUnsaved()"></div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card"><div class="lbl">จุดตรวจสอบทั้งหมด</div><div class="val">20 จุด</div></div>
        <div class="kpi-card"><div class="lbl">การตรวจบันทึกรวม</div><div class="val" id="kpi_total">0</div></div>
        <div class="kpi-card"><div class="lbl">ผลปกติ (R)</div><div class="val" id="kpi_r" style="color:#15803d">0</div></div>
        <div class="kpi-card"><div class="lbl">พบสิ่งผิดปกติ (S)</div><div class="val" id="kpi_s" style="color:#b91c1c">0</div></div>
        <div class="kpi-card"><div class="lbl">จุดที่พบปัญหา</div><div class="val" id="kpi_issues" style="font-size:16px;margin-top:8px">ไม่มี</div></div>
      </div>

      <h3 style="margin:8px 0;font-size:16px;color:#174224">ตารางตรวจเช็คจุดวางอุปกรณ์ประจำวัน (วันที่ 1 - 31)</h3>
      <div class="table-wrapper">
        <table class="form-table">
          <thead>
            <tr>
              <th rowspan="2">ลำดับ</th>
              <th rowspan="2">จุดวางอุปกรณ์กำจัดสัตว์พาหะ</th>
              <th colspan="31">วันที่ตรวจเช็ค (คลิก: ว่าง → R ปกติ → S ผิดปกติ)</th>
            </tr>
            <tr>
              {''.join(f'<th>{d}</th>' for d in range(1, 32))}
            </tr>
          </thead>
          <tbody>
            {rows_str}
          </tbody>
        </table>
      </div>

      <h3 style="margin:16px 0 8px;font-size:16px;color:#b91c1c">S ระบุวันที่และจุดที่พบสิ่งผิดปกติ / สาเหตุ / การแก้ไขเบื้องต้น</h3>
      <div class="table-wrapper" style="max-height:300px">
        <table class="form-table">
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>วันที่พบ</th>
              <th>จุดที่พบ / อุปกรณ์</th>
              <th>สาเหตุและแนวทางแก้ไข</th>
              <th>ผู้ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {inc_rows_str}
          </tbody>
        </table>
      </div>

      <div class="sig-section">
        <div class="sig-box">
          <strong>หัวหน้าแผนก / วิศวกร</strong>
          <canvas id="sig_engineer" width="300" height="90"></canvas>
          <input type="text" id="eng_name" placeholder="ชื่อ-สกุล วิศวกร" style="margin-top:4px">
          <input type="date" id="eng_date" style="margin-top:4px">
          <button style="font-size:12px;padding:4px 8px;margin-top:4px" onclick="clearSig('sig_engineer')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผจก.ฝ่าย / ผช.ผจก.ฝ่าย</strong>
          <canvas id="sig_manager" width="300" height="90"></canvas>
          <input type="text" id="mgr_name" placeholder="ชื่อ-สกุล ผู้จัดการฝ่าย" style="margin-top:4px">
          <input type="date" id="mgr_date" style="margin-top:4px">
          <button style="font-size:12px;padding:4px 8px;margin-top:4px" onclick="clearSig('sig_manager')">ล้างลายเซ็น</button>
        </div>
      </div>
    </div>
  </main>

  <div id="preview-modal">
    <div id="preview-content">
      <div style="padding:12px 20px;background:#143d25;color:white;display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">ตัวอย่างเอกสารพิมพ์ (Canvas 260 DPI Pixel-Perfect)</h3>
        <div>
          <button class="primary" onclick="printDoc()">🖨️ สั่งพิมพ์ / บันทึก PDF</button>
          <button onclick="downloadPNG()">💾 ดาวน์โหลดภาพ PNG</button>
          <button style="margin-left:10px" onclick="closePreview()">✕ ปิด</button>
        </div>
      </div>
      <div id="preview-body">
        <canvas id="print_canvas"></canvas>
      </div>
    </div>
  </div>

  <script>
    const FORM_ID = 'FM-MR10-MR-01';
    const ARTWORK_SRC = '{artwork_b64}';
    let artImg = new Image();
    artImg.src = ARTWORK_SRC;

    const sigCanvases = {{}};
    ['sig_engineer', 'sig_manager'].forEach(id => {{
      const cv = document.getElementById(id);
      const ctx = cv.getContext('2d');
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0b2512';
      let drawing = false;
      cv.addEventListener('mousedown', e => {{ drawing = true; ctx.beginPath(); ctx.moveTo(e.offsetX, e.offsetY); }});
      cv.addEventListener('mousemove', e => {{ if(drawing) {{ ctx.lineTo(e.offsetX, e.offsetY); ctx.stroke(); markUnsaved(); }} }});
      window.addEventListener('mouseup', () => drawing = false);
      sigCanvases[id] = cv;
    }});

    function clearSig(id) {{
      const cv = sigCanvases[id];
      cv.getContext('2d').clearRect(0, 0, cv.width, cv.height);
      markUnsaved();
    }}

    function togglePest(cell) {{
      markUnsaved();
      const cur = cell.innerText;
      if(!cur) {{
        cell.innerText = 'R';
        cell.className = 'pest-cell R';
      }} else if(cur === 'R') {{
        cell.innerText = 'S';
        cell.className = 'pest-cell S';
      }} else {{
        cell.innerText = '';
        cell.className = 'pest-cell';
      }}
      updatePestKPIs();
    }}

    function fillTodayR() {{
      const day = new Date().getDate();
      document.querySelectorAll('.pest-cell[data-day="' + day + '"]').forEach(c => {{
        c.innerText = 'R';
        c.className = 'pest-cell R';
      }});
      updatePestKPIs();
    }}

    function clearToday() {{
      const day = new Date().getDate();
      document.querySelectorAll('.pest-cell[data-day="' + day + '"]').forEach(c => {{
        c.innerText = '';
        c.className = 'pest-cell';
      }});
      updatePestKPIs();
    }}

    function updatePestKPIs() {{
      markUnsaved();
      let total = 0, r = 0, s = 0;
      const issues = [];
      for(let st = 1; st <= 20; st++) {{
        let hasS = false;
        for(let d = 1; d <= 31; d++) {{
          const cell = document.querySelector('.pest-cell[data-st="' + st + '"][data-day="' + d + '"]');
          if(!cell) continue;
          const v = cell.innerText;
          if(v === 'R') {{ total++; r++; }}
          else if(v === 'S') {{ total++; s++; hasS = true; }}
        }}
        if(hasS) issues.push('จุดที่ ' + st);
      }}

      document.getElementById('kpi_total').innerText = total;
      document.getElementById('kpi_r').innerText = r;
      document.getElementById('kpi_s').innerText = s;
      document.getElementById('kpi_issues').innerText = issues.length > 0 ? issues.join(', ') : 'ไม่มี';
    }}

    function markUnsaved() {{
      const b = document.getElementById('save-status');
      b.className = 'status-badge unsaved';
      b.innerText = 'มีการเปลี่ยนแปลงยังไม่บันทึก';
    }}

    function getFormData() {{
      const data = {{
        area_dept: document.getElementById('area_dept').value,
        month_str: document.getElementById('month_str').value,
        year_str: document.getElementById('year_str').value,
        eng_name: document.getElementById('eng_name').value,
        eng_date: document.getElementById('eng_date').value,
        mgr_name: document.getElementById('mgr_name').value,
        mgr_date: document.getElementById('mgr_date').value,
        stations: [],
        incidents: []
      }};

      for(let st = 1; st <= 20; st++) {{
        const tr = document.querySelector('tr[data-station="' + st + '"]');
        const stObj = {{
          id: st,
          desc: tr.querySelector('[data-field="station_desc"]').value,
          days: []
        }};
        for(let d = 1; d <= 31; d++) {{
          const cell = tr.querySelector('.pest-cell[data-day="' + d + '"]');
          stObj.days.push(cell ? cell.innerText : '');
        }}
        data.stations.push(stObj);
      }}

      for(let i = 1; i <= 8; i++) {{
        data.incidents.push({{
          date: document.querySelector('[data-inc="date_' + i + '"]').value,
          loc: document.querySelector('[data-inc="loc_' + i + '"]').value,
          desc: document.querySelector('[data-inc="desc_' + i + '"]').value,
          resp: document.querySelector('[data-inc="resp_' + i + '"]').value
        }});
      }}

      return data;
    }}

    function saveData() {{
      const d = getFormData();
      localStorage.setItem(FORM_ID + '_data', JSON.stringify(d));
      const b = document.getElementById('save-status');
      b.className = 'status-badge saved';
      b.innerText = 'บันทึกแล้ว (' + new Date().toLocaleTimeString('th-TH') + ')';
    }}

    function loadData() {{
      const raw = localStorage.getItem(FORM_ID + '_data');
      if(!raw) return;
      try {{
        const d = JSON.parse(raw);
        if(d.area_dept) document.getElementById('area_dept').value = d.area_dept;
        if(d.month_str) document.getElementById('month_str').value = d.month_str;
        if(d.year_str) document.getElementById('year_str').value = d.year_str;
        if(d.eng_name) document.getElementById('eng_name').value = d.eng_name;
        if(d.eng_date) document.getElementById('eng_date').value = d.eng_date;
        if(d.mgr_name) document.getElementById('mgr_name').value = d.mgr_name;
        if(d.mgr_date) document.getElementById('mgr_date').value = d.mgr_date;

        if(Array.isArray(d.stations)) {{
          d.stations.forEach((stObj, idx) => {{
            const st = idx + 1;
            const tr = document.querySelector('tr[data-station="' + st + '"]');
            if(!tr) return;
            if(stObj.desc) tr.querySelector('[data-field="station_desc"]').value = stObj.desc;
            if(Array.isArray(stObj.days)) {{
              stObj.days.forEach((val, dIdx) => {{
                const cell = tr.querySelector('.pest-cell[data-day="' + (dIdx + 1) + '"]');
                if(cell) {{
                  cell.innerText = val || '';
                  cell.className = 'pest-cell ' + (val || '');
                }}
              }});
            }}
          }});
        }}

        if(Array.isArray(d.incidents)) {{
          d.incidents.forEach((inc, idx) => {{
            const i = idx + 1;
            if(i > 8) return;
            const dt = document.querySelector('[data-inc="date_' + i + '"]');
            const lc = document.querySelector('[data-inc="loc_' + i + '"]');
            const ds = document.querySelector('[data-inc="desc_' + i + '"]');
            const rs = document.querySelector('[data-inc="resp_' + i + '"]');
            if(dt && inc.date) dt.value = inc.date;
            if(lc && inc.loc) lc.value = inc.loc;
            if(ds && inc.desc) ds.value = inc.desc;
            if(rs && inc.resp) rs.value = inc.resp;
          }});
        }}

        updatePestKPIs();
        const b = document.getElementById('save-status');
        b.className = 'status-badge saved';
        b.innerText = 'โหลดข้อมูลสำเร็จ';
      }} catch(e) {{
        console.error(e);
      }}
    }}

    function resetForm() {{
      if(!confirm('ต้องการล้างข้อมูลทั้งหมดหรือไม่?')) return;
      localStorage.removeItem(FORM_ID + '_data');
      location.reload();
    }}

    function exportJSON() {{
      const d = getFormData();
      const blob = new Blob([JSON.stringify(d, null, 2)], {{type: 'application/json'}});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = FORM_ID + '_' + new Date().toISOString().slice(0,10) + '.json';
      a.click();
    }}

    function importJSON(e) {{
      const f = e.target.files[0];
      if(!f) return;
      const r = new FileReader();
      r.onload = ev => {{
        localStorage.setItem(FORM_ID + '_data', ev.target.result);
        loadData();
      }};
      r.readAsText(f);
    }}

    function renderCanvasPrint() {{
      const canvas = document.getElementById('print_canvas');
      canvas.width = 2150;
      canvas.height = 3040;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(artImg, 0, 0, 2150, 3040);

      ctx.fillStyle = '#0a2310';
      ctx.font = 'bold 22px "TH Sarabun", sans-serif';

      // Meta header
      const area = document.getElementById('area_dept').value;
      const m = document.getElementById('month_str').value;
      const y = document.getElementById('year_str').value;
      if(area) ctx.fillText(area, 720, 328, 280);
      if(m) ctx.fillText(m, 1220, 328, 160);
      if(y) ctx.fillText(y, 1530, 328, 80);

      // Days x coordinates (31 days)
      const dayXs = [466.3, 513.6, 560.8, 608.0, 655.3, 702.5, 749.8, 797.1, 844.3, 891.5, 938.8, 986.0, 1033.2, 1080.5, 1127.8, 1175.0, 1222.3, 1269.5, 1316.7, 1364.0, 1411.2, 1458.4, 1505.8, 1553.0, 1606.7, 1660.5, 1714.2, 1767.9, 1823.4, 1878.9, 1934.4, 1989.9];
      const d = getFormData();

      // 20 station rows: y start = 491.5, dy ≈ 55.91
      d.stations.forEach((stObj, idx) => {{
        if(idx >= 20) return;
        const rowY = 491.5 + idx * 55.91 + 38;

        // Draw station description in Col 1 (271.3 to 466.3)
        if(stObj.desc) {{
          ctx.textAlign = 'left';
          ctx.font = '20px "TH Sarabun", sans-serif';
          ctx.fillStyle = '#173722';
          ctx.fillText(stObj.desc, 276, rowY, 185);
        }}

        // Days values
        stObj.days.forEach((val, dIdx) => {{
          if(!val || dIdx >= 31) return;
          const cx = (dayXs[dIdx] + dayXs[dIdx + 1]) / 2;
          ctx.textAlign = 'center';
          ctx.font = 'bold 24px "TH Sarabun", sans-serif';
          ctx.fillStyle = val === 'S' ? '#b91c1c' : '#14532d';
          ctx.fillText(val, cx, rowY);
        }});
      }});

      // Incident rows
      const incYs = [1960.4, 2027.6, 2094.7, 2161.9, 2229.1, 2296.2, 2363.4, 2430.6];
      ctx.textAlign = 'left';
      ctx.font = '26px "TH Sarabun", sans-serif';
      ctx.fillStyle = '#0a2310';
      d.incidents.forEach((inc, idx) => {{
        if(idx >= 8) return;
        const lineY = incYs[idx] - 8;
        let lineText = '';
        if(inc.date) lineText += inc.date + ' ';
        if(inc.loc) lineText += '[' + inc.loc + '] ';
        if(inc.desc) lineText += inc.desc + ' ';
        if(inc.resp) lineText += '(ผดน: ' + inc.resp + ')';
        if(lineText.trim()) ctx.fillText(lineText.trim(), 320, lineY);
      }});

      // Signatures
      const engName = document.getElementById('eng_name').value;
      const engDate = document.getElementById('eng_date').value;
      const mgrName = document.getElementById('mgr_name').value;
      const mgrDate = document.getElementById('mgr_date').value;

      if(engName) ctx.fillText(engName, 520, 2840);
      if(engDate) ctx.fillText(engDate, 820, 2840);
      if(mgrName) ctx.fillText(mgrName, 1420, 2840);
      if(mgrDate) ctx.fillText(mgrDate, 1750, 2840);

      const cvEng = sigCanvases['sig_engineer'];
      ctx.drawImage(cvEng, 480, 2740, 220, 60);
      const cvMgr = sigCanvases['sig_manager'];
      ctx.drawImage(cvMgr, 1380, 2740, 220, 60);

      document.getElementById('preview-modal').classList.add('active');
    }}

    function closePreview() {{
      document.getElementById('preview-modal').classList.remove('active');
    }}

    function printDoc() {{
      const canvas = document.getElementById('print_canvas');
      const w = window.open('');
      w.document.write('<html><head><title>พิมพ์เอกสาร</title><style>@page {{ size: portrait; margin: 0; }} body {{ margin: 0; }} img {{ width: 100vw; height: auto; }}</style></head><body><img src="' + canvas.toDataURL('image/png') + '"></body></html>');
      w.document.close();
      setTimeout(() => {{ w.focus(); w.print(); }}, 500);
    }}

    function downloadPNG() {{
      const canvas = document.getElementById('print_canvas');
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = FORM_ID + '_print.png';
      a.click();
    }}

    window.addEventListener('load', loadData);
  </script>
</body>
</html>"""
    return html

if __name__ == "__main__":
    generate_phase3()
