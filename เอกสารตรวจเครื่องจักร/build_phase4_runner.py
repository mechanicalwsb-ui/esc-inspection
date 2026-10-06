import pymupdf
import sys
import base64
import json
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

root = Path(r"C:\Users\autocad06\OneDrive - easternsugar.co.th\02.OneDriver วิศวกรรมจักรกล\06.AI Projects\260925 ตรวจเช็คเครื่องจักรออนไลน์\เอกสารตรวจเครื่องจักร")
scratch = Path(r"C:\Users\autocad06\OneDrive - easternsugar.co.th\02.OneDriver วิศวกรรมจักรกล\06.AI Projects\260925 ตรวจเช็คเครื่องจักรออนไลน์\scratch")
base_folder = root / "แบบฟอร์มหลัก"
fonts_folder = root / "fonts"

print("1. Preloading fonts as base64...")
font_payloads = {}
for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
    font_path = fonts_folder / font
    if font_path.exists():
        font_payloads[font] = base64.b64encode(font_path.read_bytes()).decode('ascii')
print(f"Loaded {len(font_payloads)} fonts.")

def get_pdf_page_artwork(pdf_name, page_idx=0, dpi=260):
    pdf_path = base_folder / pdf_name
    doc = pymupdf.open(pdf_path)
    page = doc[page_idx]
    pix = page.get_pixmap(dpi=dpi)
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
  padding: 16px 24px;
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
  max-width: 1560px;
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
.tab-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
  border-bottom: 2px solid #ccd6ce;
  padding-bottom: 2px;
}
.tab-btn {
  padding: 10px 18px;
  font-size: 15px;
  font-weight: 600;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  background: #e4ebe4;
  color: #3b5940;
  cursor: pointer;
  transition: all .15s;
}
.tab-btn.active {
  background: white;
  color: #143d25;
  border-color: #ccd6ce;
  border-bottom: 2px solid white;
  margin-bottom: -2px;
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
input.out-of-range {
  background: #fee2e2 !important;
  border-color: #ef4444 !important;
  color: #991b1b !important;
  font-weight: bold;
}
.kpi-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
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
}
table.form-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
  white-space: nowrap;
}
table.form-table th, table.form-table td {
  border: 1px solid #d4ded5;
  padding: 6px 7px;
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

.chk-cell {
  width: 32px;
  min-width: 32px;
  height: 28px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 3px;
  user-select: none;
  font-size: 15px;
  transition: all .1s;
}
.chk-cell.pass { background: #dcfce7; color: #166534; }
.chk-cell.fail { background: #fee2e2; color: #991b1b; font-weight: 800; }

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

def generate_phase4():
    print("2. Generating FM-PD01-PD-02 (แบบฟอร์มบันทึกส่งกะ ลูกหีบ)...")
    art_pd02_p1 = get_pdf_page_artwork("FM-PD01-PD-02 Rev.00 แบบฟอร์มบันทึกส่งกะ_ลูกหีบ.pdf", page_idx=0, dpi=260)
    art_pd02_p2 = get_pdf_page_artwork("FM-PD01-PD-02 Rev.00 แบบฟอร์มบันทึกส่งกะ_ลูกหีบ.pdf", page_idx=1, dpi=260)
    html_pd02 = build_html_pd01_pd02(art_pd02_p1, art_pd02_p2)
    (root / "FM-PD01-PD-02.html").write_text(html_pd02, encoding="utf-8")
    print(f"Saved FM-PD01-PD-02.html ({len(html_pd02):,} bytes)")

    print("3. Generating FM-ML01-ML-12 (แบบบันทึกเครื่องจักร DCS A3)...")
    art_ml12 = get_pdf_page_artwork("FM-ML01-ML-12 Rev.02 แบบบันทึกเครื่องจักรและอุปกรณ์ ใน.pdf", page_idx=0, dpi=260)
    html_ml12 = build_html_ml01_ml12(art_ml12)
    (root / "FM-ML01-ML-12.html").write_text(html_ml12, encoding="utf-8")
    print(f"Saved FM-ML01-ML-12.html ({len(html_ml12):,} bytes)")

    print("4. Generating FM-PD02-PD-02 (บันทึกการตรวจสอบวัสดุที่สามารถแตก 17 หน้า)...")
    art_pd02_master = get_pdf_page_artwork("FM-PD02-PD-02 Rev.00 บันทึกการตรวจสอบวัสดุที่สามารถแตก แผนกลูกหีบ.pdf", page_idx=0, dpi=260)
    html_pd02_cat = build_html_pd02_pd02(art_pd02_master)
    (root / "FM-PD02-PD-02.html").write_text(html_pd02_cat, encoding="utf-8")
    print(f"Saved FM-PD02-PD-02.html ({len(html_pd02_cat):,} bytes)")

def build_html_pd01_pd02(art_p1, art_p2):
    css = CSS_BASE
    for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
        tag = "__FONT_" + font.replace('.', '_').replace('-', '_').upper() + "__"
        css = css.replace(tag, font_payloads.get(font, ''))

    machinery_sections = [
        ("1", "ดั๊มพ์ยกรถอ้อยและตะกาว"),
        ("2", "สะพานดั๊มพ์และสะพานเมน"),
        ("3", "เทอร์ไบน์เชรดเดอร์"),
        ("4", "สะพานลำเลียงกากอ้อยและ High Speed Belt"),
        ("5", "ลูกหีบ"),
        ("6", "ปั๊มน้ำ เกียร์บล็อค และทั่วไป")
    ]

    def render_shift_section(shift_key):
        blocks = []
        for code, name in machinery_sections:
            blocks.append(f"""
            <div style="margin-bottom:14px;border:1px solid #dce5dc;border-radius:8px;padding:12px;background:#fbfdfb">
              <h4 style="margin:0 0 8px;color:#143d25;font-size:14px">หมวดที่ {code}: {name}</h4>
              <table class="form-table">
                <thead>
                  <tr>
                    <th style="width:90px">ลด / หยุด</th>
                    <th>สถานที่</th>
                    <th style="width:100px">แผนก</th>
                    <th>ปัญหา / ชำรุด</th>
                    <th>สาเหตุ</th>
                    <th>วิธีการแก้ไข</th>
                    <th style="width:110px">ช่วงเวลา</th>
                    <th style="width:100px">ชม. หยุดหีบ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <select data-shift="{shift_key}" data-sec="{code}" data-field="action">
                        <option value="">-</option>
                        <option value="ลดรอบ">ลดรอบ</option>
                        <option value="หยุดหีบ">หยุดหีบ</option>
                        <option value="ปกติ">ปกติ</option>
                      </select>
                    </td>
                    <td><input type="text" data-shift="{shift_key}" data-sec="{code}" data-field="location" value="{name}"></td>
                    <td><input type="text" data-shift="{shift_key}" data-sec="{code}" data-field="dept" value="ลูกหีบ"></td>
                    <td><input type="text" data-shift="{shift_key}" data-sec="{code}" data-field="problem" placeholder="อาการชำรุด"></td>
                    <td><input type="text" data-shift="{shift_key}" data-sec="{code}" data-field="cause" placeholder="สาเหตุ"></td>
                    <td><input type="text" data-shift="{shift_key}" data-sec="{code}" data-field="solution" placeholder="การแก้ไข"></td>
                    <td><input type="text" data-shift="{shift_key}" data-sec="{code}" data-field="timespan" placeholder="เช่น 10:15-10:45"></td>
                    <td><input type="number" step="0.1" class="num" data-shift="{shift_key}" data-sec="{code}" data-field="downtime_hrs" placeholder="0.0" oninput="updateShiftKPIs()"></td>
                  </tr>
                  <tr>
                    <td colspan="8" style="text-align:left;background:#f8faf8;padding:6px 10px">
                      <strong style="color:#b45309">📌 ปัญหาที่ต้องแก้ไขต่อ และ/หรือเฝ้าสังเกต:</strong>
                      <input type="text" style="width:78%;display:inline-block;margin-left:8px" data-shift="{shift_key}" data-sec="{code}" data-field="followup" placeholder="ระบุสิ่งที่กะถัดไปต้องเฝ้าระวัง">
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>""")
        return "".join(blocks)

    morning_rows = render_shift_section("morning")
    evening_rows = render_shift_section("evening")

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>FM-PD01-PD-02 แบบฟอร์มบันทึกส่งกะ ลูกหีบ (2 หน้า)</title>
  <style>{css}</style>
</head>
<body>
  <header>
    <small>ระบบตรวจเช็คเครื่องจักรออนไลน์ • สายงานการผลิต แผนกลูกหีบ</small>
    <h1>FM-PD01-PD-02 แบบฟอร์มการมอบหมาย ส่งต่องาน เครื่องจักรขัดข้อง และการเปลี่ยนกะงาน (Rev.00)</h1>
    <p>ระบบบันทึกส่งมอบงาน 2 กะ (กะเช้า & กะเย็น) • เชื่อมโยงข้อมูลสองหน้าและพิมพ์ตรงกริด 260 DPI 100%</p>
  </header>

  <main>
    <div class="toolbar">
      <button class="primary" onclick="saveData()">💾 บันทึกข้อมูลทั้ง 2 กะ</button>
      <button onclick="renderCurrentPagePrint()">🖨️ แสดงตัวอย่าง & พิมพ์ (หน้านี้)</button>
      <button onclick="renderBothPagesPrint()">📑 พิมพ์ทั้งชุด 2 หน้า (ครบ 2 กะ)</button>
      <button onclick="exportJSON()">📤 ส่งออก JSON</button>
      <label class="import-btn">📥 นำเข้า JSON <input type="file" accept=".json" onchange="importJSON(event)" style="display:none"></label>
      <button class="danger" onclick="resetForm()">🗑️ ล้างข้อมูล</button>
      <span class="status-badge saved" id="save-status">พร้อมใช้งาน</span>
    </div>

    <div class="sheet">
      <div class="tab-bar">
        <button class="tab-btn active" id="tab_morning" onclick="switchShift('morning')">☀️ กะเช้า (08:00 - 20:00 น.) - หน้า 1/2</button>
        <button class="tab-btn" id="tab_evening" onclick="switchShift('evening')">🌙 กะเย็น (20:00 - 08:00 น.) - หน้า 2/2</button>
      </div>

      <div class="meta">
        <div><label>วันที่</label><input type="date" id="doc_date" oninput="markUnsaved()"></div>
        <div><label>ปีการผลิต</label><input type="text" id="prod_year" value="2567/2568" oninput="markUnsaved()"></div>
        <div><label>ฝ่าย / แผนก</label><input type="text" value="ฝ่ายวิศวกรรมจักรกล แผนกลูกหีบ" readonly style="background:#f1f5f1"></div>
        <div><label>เวลาเปลี่ยนกะ</label><input type="text" id="shift_change_time" value="รับกะ 08.00 น. ออกกะ 20.00 น." oninput="markUnsaved()"></div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card"><div class="lbl">กะทำงานปัจจุบัน</div><div class="val" id="kpi_shift_name">กะเช้า</div></div>
        <div class="kpi-card"><div class="lbl">ชม. หยุดหีบ (กะเช้า)</div><div class="val" id="kpi_m_down">0.0 ชม.</div></div>
        <div class="kpi-card"><div class="lbl">ชม. หยุดหีบ (กะเย็น)</div><div class="val" id="kpi_e_down">0.0 ชม.</div></div>
        <div class="kpi-card"><div class="lbl">ประเด็นต้องเฝ้าระวัง</div><div class="val" id="kpi_followup_cnt">0 จุด</div></div>
      </div>

      <!-- MORNING SHIFT CONTENT -->
      <div id="shift_content_morning">
        <h3 style="margin:4px 0 12px;color:#174224">รายงานเครื่องจักรขัดข้อง & ส่งมอบงาน (กะเช้า 08.00 - 20.00 น.)</h3>
        {morning_rows}
        <div class="sig-section">
          <div class="sig-box">
            <strong>หัวหน้ากะที่ออกกะ (ส่งมอบ)</strong>
            <canvas id="sig_m_out" width="280" height="80"></canvas>
            <input type="text" id="m_out_name" placeholder="ชื่อ-สกุล หน.กะที่ออก">
            <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_m_out')">ล้างลายเซ็น</button>
          </div>
          <div class="sig-box">
            <strong>หัวหน้ากะที่รับกะ (รับมอบ)</strong>
            <canvas id="sig_m_in" width="280" height="80"></canvas>
            <input type="text" id="m_in_name" placeholder="ชื่อ-สกุล หน.กะที่รับ">
            <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_m_in')">ล้างลายเซ็น</button>
          </div>
          <div class="sig-box">
            <strong>ผู้ตรวจสอบ (วิศวกร)</strong>
            <canvas id="sig_m_eng" width="280" height="80"></canvas>
            <input type="text" id="m_eng_name" placeholder="ชื่อ-สกุล วิศวกร">
            <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_m_eng')">ล้างลายเซ็น</button>
          </div>
        </div>
      </div>

      <!-- EVENING SHIFT CONTENT -->
      <div id="shift_content_evening" style="display:none">
        <h3 style="margin:4px 0 12px;color:#174224">รายงานเครื่องจักรขัดข้อง & ส่งมอบงาน (กะเย็น 20.00 - 08.00 น.)</h3>
        {evening_rows}
        <div class="sig-section">
          <div class="sig-box">
            <strong>หัวหน้ากะที่ออกกะ (ส่งมอบ)</strong>
            <canvas id="sig_e_out" width="280" height="80"></canvas>
            <input type="text" id="e_out_name" placeholder="ชื่อ-สกุล หน.กะที่ออก">
            <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_e_out')">ล้างลายเซ็น</button>
          </div>
          <div class="sig-box">
            <strong>หัวหน้ากะที่รับกะ (รับมอบ)</strong>
            <canvas id="sig_e_in" width="280" height="80"></canvas>
            <input type="text" id="e_in_name" placeholder="ชื่อ-สกุล หน.กะที่รับ">
            <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_e_in')">ล้างลายเซ็น</button>
          </div>
          <div class="sig-box">
            <strong>ผู้ตรวจสอบ (วิศวกร)</strong>
            <canvas id="sig_e_eng" width="280" height="80"></canvas>
            <input type="text" id="e_eng_name" placeholder="ชื่อ-สกุล วิศวกร">
            <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_e_eng')">ล้างลายเซ็น</button>
          </div>
        </div>
      </div>
    </div>
  </main>

  <div id="preview-modal">
    <div id="preview-content">
      <div style="padding:12px 20px;background:#143d25;color:white;display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0" id="preview_title">ตัวอย่างเอกสารพิมพ์ (Legal Portrait 260 DPI)</h3>
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
    const FORM_ID = 'FM-PD01-PD-02';
    const ART_P1 = '{art_p1}';
    const ART_P2 = '{art_p2}';
    let imgP1 = new Image(); imgP1.src = ART_P1;
    let imgP2 = new Image(); imgP2.src = ART_P2;

    let activeShift = 'morning';

    // Signatures
    const sigCanvases = {{}};
    ['sig_m_out', 'sig_m_in', 'sig_m_eng', 'sig_e_out', 'sig_e_in', 'sig_e_eng'].forEach(id => {{
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
      sigCanvases[id].getContext('2d').clearRect(0, 0, sigCanvases[id].width, sigCanvases[id].height);
      markUnsaved();
    }}

    function switchShift(shift) {{
      activeShift = shift;
      document.getElementById('shift_content_morning').style.display = shift === 'morning' ? 'block' : 'none';
      document.getElementById('shift_content_evening').style.display = shift === 'evening' ? 'block' : 'none';
      document.getElementById('tab_morning').className = 'tab-btn' + (shift === 'morning' ? ' active' : '');
      document.getElementById('tab_evening').className = 'tab-btn' + (shift === 'evening' ? ' active' : '');
      document.getElementById('kpi_shift_name').innerText = shift === 'morning' ? 'กะเช้า' : 'กะเย็น';
    }}

    function updateShiftKPIs() {{
      markUnsaved();
      let mDown = 0, eDown = 0, followCnt = 0;
      document.querySelectorAll('[data-shift="morning"][data-field="downtime_hrs"]').forEach(inp => {{
        mDown += parseFloat(inp.value) || 0;
      }});
      document.querySelectorAll('[data-shift="evening"][data-field="downtime_hrs"]').forEach(inp => {{
        eDown += parseFloat(inp.value) || 0;
      }});
      document.querySelectorAll('[data-field="followup"]').forEach(inp => {{
        if(inp.value.trim()) followCnt++;
      }});
      document.getElementById('kpi_m_down').innerText = mDown.toFixed(1) + ' ชม.';
      document.getElementById('kpi_e_down').innerText = eDown.toFixed(1) + ' ชม.';
      document.getElementById('kpi_followup_cnt').innerText = followCnt + ' จุด';
    }}

    function markUnsaved() {{
      const b = document.getElementById('save-status');
      b.className = 'status-badge unsaved';
      b.innerText = 'มีการเปลี่ยนแปลงยังไม่บันทึก';
    }}

    function getFormData() {{
      const d = {{
        doc_date: document.getElementById('doc_date').value,
        prod_year: document.getElementById('prod_year').value,
        shift_change_time: document.getElementById('shift_change_time').value,
        names: {{
          m_out: document.getElementById('m_out_name').value,
          m_in: document.getElementById('m_in_name').value,
          m_eng: document.getElementById('m_eng_name').value,
          e_out: document.getElementById('e_out_name').value,
          e_in: document.getElementById('e_in_name').value,
          e_eng: document.getElementById('e_eng_name').value,
        }},
        sections: []
      }};

      ['morning', 'evening'].forEach(shift => {{
        ['1', '2', '3', '4', '5', '6'].forEach(sec => {{
          const getVal = f => (document.querySelector('[data-shift="' + shift + '"][data-sec="' + sec + '"][data-field="' + f + '"]') || {{}}).value || '';
          d.sections.push({{
            shift, sec,
            action: getVal('action'),
            location: getVal('location'),
            dept: getVal('dept'),
            problem: getVal('problem'),
            cause: getVal('cause'),
            solution: getVal('solution'),
            timespan: getVal('timespan'),
            downtime_hrs: getVal('downtime_hrs'),
            followup: getVal('followup')
          }});
        }});
      }});
      return d;
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
        if(d.shift_change_time) document.getElementById('shift_change_time').value = d.shift_change_time;
        if(d.names) {{
          Object.keys(d.names).forEach(k => {{
            const el = document.getElementById(k + '_name');
            if(el) el.value = d.names[k];
          }});
        }}
        if(Array.isArray(d.sections)) {{
          d.sections.forEach(s => {{
            ['action', 'location', 'dept', 'problem', 'cause', 'solution', 'timespan', 'downtime_hrs', 'followup'].forEach(f => {{
              const el = document.querySelector('[data-shift="' + s.shift + '"][data-sec="' + s.sec + '"][data-field="' + f + '"]');
              if(el && s[f]) el.value = s[f];
            }});
          }});
        }}
        updateShiftKPIs();
        const b = document.getElementById('save-status');
        b.className = 'status-badge saved';
        b.innerText = 'โหลดข้อมูลสำเร็จ';
      }} catch(e) {{ console.error(e); }}
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

    function drawPageOnCanvas(canvas, shift) {{
      canvas.width = 2210;
      canvas.height = 3640;
      const ctx = canvas.getContext('2d');
      const img = shift === 'morning' ? imgP1 : imgP2;
      ctx.drawImage(img, 0, 0, 2210, 3640);

      ctx.fillStyle = '#0a2310';
      ctx.font = 'bold 26px "TH Sarabun", sans-serif';

      // Header info
      const dt = document.getElementById('doc_date').value;
      const py = document.getElementById('prod_year').value;
      if(dt) {{
        const parts = dt.split('-');
        ctx.fillText(parts[2] + '/' + parts[1] + '/' + (parseInt(parts[0])+543), 280, 280);
      }}
      if(py) ctx.fillText(py, 700, 280);

      // Machinery sections: 6 rows. y starts around 430, dy ≈ 130 px
      const d = getFormData();
      const secRows = d.sections.filter(s => s.shift === shift);
      ctx.font = '22px "TH Sarabun", sans-serif';

      secRows.forEach((s, idx) => {{
        const baseY = 440 + idx * 140;
        if(s.action) ctx.fillText(s.action, 140, baseY);
        if(s.problem) ctx.fillText(s.problem, 400, baseY, 270);
        if(s.cause) ctx.fillText(s.cause, 700, baseY, 270);
        if(s.solution) ctx.fillText(s.solution, 1000, baseY, 270);
        if(s.timespan) ctx.fillText(s.timespan, 1440, baseY, 140);
        if(s.downtime_hrs) ctx.fillText(s.downtime_hrs, 1610, baseY);
        if(s.followup) {{
          ctx.fillText('ติดตาม: ' + s.followup, 400, baseY + 45, 1000);
        }}
      }});

      // Signatures
      const prefix = shift === 'morning' ? 'sig_m_' : 'sig_e_';
      ['out', 'in', 'eng'].forEach((k, i) => {{
        const cv = sigCanvases[prefix + k];
        const sx = [380, 1050, 1720][i];
        ctx.drawImage(cv, sx, 3350, 240, 70);
      }});
    }}

    function renderCurrentPagePrint() {{
      const cv = document.getElementById('print_canvas');
      drawPageOnCanvas(cv, activeShift);
      document.getElementById('preview_title').innerText = 'ตัวอย่างเอกสารพิมพ์ (หน้า ' + (activeShift==='morning'?'1/2 กะเช้า':'2/2 กะเย็น') + ')';
      document.getElementById('preview-modal').classList.add('active');
    }}

    function renderBothPagesPrint() {{
      const w = window.open('');
      const cv1 = document.createElement('canvas');
      const cv2 = document.createElement('canvas');
      drawPageOnCanvas(cv1, 'morning');
      drawPageOnCanvas(cv2, 'evening');
      w.document.write('<html><head><title>พิมพ์แบบฟอร์ม 2 หน้า</title><style>@page {{ size: portrait; margin: 0; }} body {{ margin: 0; }} .page {{ page-break-after: always; }} img {{ width: 100vw; height: auto; display:block; }}</style></head><body><div class="page"><img src="' + cv1.toDataURL('image/png') + '"></div><div><img src="' + cv2.toDataURL('image/png') + '"></div></body></html>');
      w.document.close();
      setTimeout(() => {{ w.focus(); w.print(); }}, 600);
    }}

    function closePreview() {{
      document.getElementById('preview-modal').classList.remove('active');
    }}

    function printDoc() {{
      const cv = document.getElementById('print_canvas');
      const w = window.open('');
      w.document.write('<html><head><title>พิมพ์เอกสาร</title><style>@page {{ size: portrait; margin: 0; }} body {{ margin: 0; }} img {{ width: 100vw; height: auto; }}</style></head><body><img src="' + cv.toDataURL('image/png') + '"></body></html>');
      w.document.close();
      setTimeout(() => {{ w.focus(); w.print(); }}, 500);
    }}

    function downloadPNG() {{
      const cv = document.getElementById('print_canvas');
      const a = document.createElement('a');
      a.href = cv.toDataURL('image/png');
      a.download = FORM_ID + '_' + activeShift + '.png';
      a.click();
    }}

    window.addEventListener('load', loadData);
  </script>
</body>
</html>"""
    return html

def build_html_ml01_ml12(art_ml12):
    css = CSS_BASE
    for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
        tag = "__FONT_" + font.replace('.', '_').replace('-', '_').upper() + "__"
        css = css.replace(tag, font_payloads.get(font, ''))

    time_slots = ["19:00", "21:00", "23:00", "01:00", "03:00", "05:00", "07:00", "09:00", "11:00", "13:00", "15:00", "17:00"]

    parameters = [
        # Cane Crushing Rate
        {"id": "cane_rate", "group": "อัตราการหีบอ้อย", "tag": "RATE-01", "name": "อัตราการหีบอ้อย (ตัน/ชม.)", "min": 500, "max": 1200, "unit": "ตัน/ชม."},
        {"id": "mill_spd", "group": "อัตราการหีบอ้อย", "tag": "SPD-01", "name": "ความเร็วรอบหีบเฉลี่ย", "min": 3.0, "max": 6.5, "unit": "rpm"},
        # Mill 1 to 5 Lift & Pressure
        {"id": "m1_lift_a", "group": "ลูกหีบชุดที่ 1", "tag": "LIFT-M1-A", "name": "ระยะยก ฝั่ง A (ถนน)", "min": 0, "max": 35, "unit": "mm"},
        {"id": "m1_lift_b", "group": "ลูกหีบชุดที่ 1", "tag": "LIFT-M1-B", "name": "ระยะยก ฝั่ง B (DCS)", "min": 0, "max": 35, "unit": "mm"},
        {"id": "m1_press_a", "group": "ลูกหีบชุดที่ 1", "tag": "PRS-M1-A", "name": "แรงดันน้ำมันกดหัว A", "min": 175, "max": 210, "unit": "kg/cm2"},
        {"id": "m1_press_b", "group": "ลูกหีบชุดที่ 1", "tag": "PRS-M1-B", "name": "แรงดันน้ำมันกดหัว B", "min": 175, "max": 210, "unit": "kg/cm2"},
        {"id": "m1_chute", "group": "ลูกหีบชุดที่ 1", "tag": "LIC-D1-01", "name": "ระดับซองอ้อย (PV)", "min": 0, "max": 50, "unit": "%"},

        {"id": "m3_lift_a", "group": "ลูกหีบชุดที่ 3", "tag": "LIFT-M3-A", "name": "ระยะยก ฝั่ง A (ถนน)", "min": 0, "max": 35, "unit": "mm"},
        {"id": "m3_lift_b", "group": "ลูกหีบชุดที่ 3", "tag": "LIFT-M3-B", "name": "ระยะยก ฝั่ง B (DCS)", "min": 0, "max": 35, "unit": "mm"},
        {"id": "m3_press_a", "group": "ลูกหีบชุดที่ 3", "tag": "PRS-M3-A", "name": "แรงดันน้ำมันกดหัว A", "min": 175, "max": 210, "unit": "kg/cm2"},
        {"id": "m3_press_b", "group": "ลูกหีบชุดที่ 3", "tag": "PRS-M3-B", "name": "แรงดันน้ำมันกดหัว B", "min": 175, "max": 210, "unit": "kg/cm2"},

        {"id": "m5_lift_a", "group": "ลูกหีบชุดที่ 5", "tag": "LIFT-M5-A", "name": "ระยะยก ฝั่ง A (ถนน)", "min": 0, "max": 35, "unit": "mm"},
        {"id": "m5_lift_b", "group": "ลูกหีบชุดที่ 5", "tag": "LIFT-M5-B", "name": "ระยะยก ฝั่ง B (DCS)", "min": 0, "max": 35, "unit": "mm"},
        {"id": "m5_press_a", "group": "ลูกหีบชุดที่ 5", "tag": "PRS-M5-A", "name": "แรงดันน้ำมันกดหัว A", "min": 175, "max": 210, "unit": "kg/cm2"},
        {"id": "m5_press_b", "group": "ลูกหีบชุดที่ 5", "tag": "PRS-M5-B", "name": "แรงดันน้ำมันกดหัว B", "min": 175, "max": 210, "unit": "kg/cm2"},

        # Steam & Cooling
        {"id": "main_steam", "group": "ระบบไอน้ำ", "tag": "PT-STEAM", "name": "แรงดันไอดี Main Steam", "min": 38, "max": 42, "unit": "bar"},
        {"id": "exh_steam", "group": "ระบบไอน้ำ", "tag": "PT-EXH", "name": "แรงดันไอเสีย Exhaust Steam", "min": 1.0, "max": 1.5, "unit": "bar"},
        {"id": "ct_temp", "group": "Cooling Tower", "tag": "TT-CT-02", "name": "อุณหภูมิน้ำหล่อเย็น", "min": 20, "max": 35, "unit": "°C"},
        {"id": "ct_ph", "group": "Cooling Tower", "tag": "AT-PH-02", "name": "ค่ากรด-เบส (pH)", "min": 6.5, "max": 9.5, "unit": "pH"},
        {"id": "cpi_val", "group": "คุณภาพ", "tag": "LAB-CPI", "name": "ดัชนีเตรียมอ้อย (CPI)", "min": 85, "max": 95, "unit": "%"}
    ]

    table_rows = []
    for p in parameters:
        time_inputs = "".join(f'<td><input type="number" step="0.1" data-param="{p["id"]}" data-time="{t}" oninput="checkThreshold(this, {p["min"]}, {p["max"]})"></td>' for t in time_slots)
        table_rows.append(f"""
        <tr>
          <td style="font-weight:600;color:#143d25;text-align:left">{p["group"]}</td>
          <td style="text-align:left">{p["name"]}</td>
          <td style="font-family:monospace;font-size:12px">{p["tag"]}</td>
          <td style="background:#f0f7f1;font-weight:600">{p["min"]}-{p["max"]}</td>
          <td>{p["unit"]}</td>
          {time_inputs}
        </tr>""")
    rows_str = "\n".join(table_rows)

    time_headers = "".join(f'<th>{t} น.</th>' for t in time_slots)

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>FM-ML01-ML-12 บันทึกเครื่องจักร DCS กะทำงาน (A3 Landscape)</title>
  <style>{css}</style>
</head>
<body>
  <header>
    <small>ระบบตรวจเช็คเครื่องจักรออนไลน์ • ฝ่ายวิศวกรรมจักรกล แผนกลูกหีบ</small>
    <h1>FM-ML01-ML-12 แบบบันทึกเครื่องจักรและอุปกรณ์ ในฝ่ายหีบอ้อยกะทำงาน (DCS) (Rev.02)</h1>
    <p>ระบบบันทึกค่าพารามิเตอร์ 24 ชม. ทุก 2 ชม. (12 ช่วงเวลา) • ตรวจสอบค่าผิดปกติอัตโนมัติและพิมพ์ A3 Canvas 260 DPI</p>
  </header>

  <main>
    <div class="toolbar">
      <button class="primary" onclick="saveData()">💾 บันทึกข้อมูล DCS</button>
      <button onclick="renderCanvasPrint()">🖨️ แสดงตัวอย่าง & พิมพ์ (A3 Portrait 260 DPI)</button>
      <button onclick="exportJSON()">📤 ส่งออก JSON</button>
      <label class="import-btn">📥 นำเข้า JSON <input type="file" accept=".json" onchange="importJSON(event)" style="display:none"></label>
      <button class="danger" onclick="resetForm()">🗑️ ล้างข้อมูล</button>
      <span class="status-badge saved" id="save-status">พร้อมใช้งาน</span>
    </div>

    <div class="sheet">
      <div class="meta">
        <div><label>วันที่บันทึก</label><input type="date" id="doc_date" oninput="markUnsaved()"></div>
        <div><label>ปีการผลิต</label><input type="text" id="prod_year" value="2567/2568" oninput="markUnsaved()"></div>
        <div><label>ฝ่าย / แผนก</label><input type="text" value="ฝ่ายวิศวกรรมจักรกล แผนกลูกหีบ" readonly style="background:#f1f5f1"></div>
        <div><label>ห้องควบคุม</label><input type="text" value="ห้องควบคุมส่วนกลาง DCS" readonly style="background:#f1f5f1"></div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card"><div class="lbl">จุดบันทึกทั้งหมด</div><div class="val">{len(parameters)} พารามิเตอร์</div></div>
        <div class="kpi-card"><div class="lbl">ช่วงเวลาบันทึก</div><div class="val">12 รอบ (24 ชม.)</div></div>
        <div class="kpi-card"><div class="lbl">ค่าที่บันทึกแล้ว</div><div class="val" id="kpi_recorded">0</div></div>
        <div class="kpi-card"><div class="lbl">ค่าที่ออกนอกเกณฑ์</div><div class="val" id="kpi_out_range" style="color:#b91c1c">0</div></div>
      </div>

      <div class="table-wrapper">
        <table class="form-table">
          <thead>
            <tr>
              <th rowspan="2">หมวดเครื่องจักร</th>
              <th rowspan="2">รายการพารามิเตอร์</th>
              <th rowspan="2">Tag No.</th>
              <th rowspan="2">ค่ามาตรฐาน</th>
              <th rowspan="2">หน่วย</th>
              <th colspan="6" style="background:#d9ebd9">กะที่ 1 (19.00 - 05.00 น.)</th>
              <th colspan="6" style="background:#d0e6d5">กะที่ 2 (07.00 - 17.00 น.)</th>
            </tr>
            <tr>
              {time_headers}
            </tr>
          </thead>
          <tbody>
            {rows_str}
          </tbody>
        </table>
      </div>

      <div class="sig-section">
        <div class="sig-box">
          <strong>ผู้บันทึก กะ 1 (DCS Operator)</strong>
          <canvas id="sig_op1" width="280" height="80"></canvas>
          <input type="text" id="op1_name" placeholder="ชื่อ-สกุล พนักงาน DCS กะ 1">
          <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_op1')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผู้บันทึก กะ 2 (DCS Operator)</strong>
          <canvas id="sig_op2" width="280" height="80"></canvas>
          <input type="text" id="op2_name" placeholder="ชื่อ-สกุล พนักงาน DCS กะ 2">
          <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_op2')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผู้ตรวจสอบ (หัวหน้ากะ)</strong>
          <canvas id="sig_shift_lead" width="280" height="80"></canvas>
          <input type="text" id="lead_name" placeholder="ชื่อ-สกุล หัวหน้ากะ">
          <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_shift_lead')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผู้ทวนสอบ (วิศวกร/หัวหน้าแผนก)</strong>
          <canvas id="sig_engineer" width="280" height="80"></canvas>
          <input type="text" id="eng_name" placeholder="ชื่อ-สกุล วิศวกร">
          <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_engineer')">ล้างลายเซ็น</button>
        </div>
      </div>
    </div>
  </main>

  <div id="preview-modal">
    <div id="preview-content">
      <div style="padding:12px 20px;background:#143d25;color:white;display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">ตัวอย่างเอกสารพิมพ์ DCS (A3 Portrait 260 DPI)</h3>
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
    const FORM_ID = 'FM-ML01-ML-12';
    const ART_SRC = '{art_ml12}';
    let artImg = new Image();
    artImg.src = ART_SRC;

    const sigCanvases = {{}};
    ['sig_op1', 'sig_op2', 'sig_shift_lead', 'sig_engineer'].forEach(id => {{
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
      sigCanvases[id].getContext('2d').clearRect(0, 0, sigCanvases[id].width, sigCanvases[id].height);
      markUnsaved();
    }}

    function checkThreshold(input, minVal, maxVal) {{
      markUnsaved();
      const val = parseFloat(input.value);
      if(!isNaN(val) && (val < minVal || val > maxVal)) {{
        input.classList.add('out-of-range');
      }} else {{
        input.classList.remove('out-of-range');
      }}
      updateDcsKPIs();
    }}

    function updateDcsKPIs() {{
      let recorded = 0, outRange = 0;
      document.querySelectorAll('input[data-param]').forEach(inp => {{
        if(inp.value.trim()) {{
          recorded++;
          if(inp.classList.contains('out-of-range')) outRange++;
        }}
      }});
      document.getElementById('kpi_recorded').innerText = recorded;
      document.getElementById('kpi_out_range').innerText = outRange;
    }}

    function markUnsaved() {{
      const b = document.getElementById('save-status');
      b.className = 'status-badge unsaved';
      b.innerText = 'มีการเปลี่ยนแปลงยังไม่บันทึก';
    }}

    function getFormData() {{
      const d = {{
        doc_date: document.getElementById('doc_date').value,
        prod_year: document.getElementById('prod_year').value,
        names: {{
          op1: document.getElementById('op1_name').value,
          op2: document.getElementById('op2_name').value,
          lead: document.getElementById('lead_name').value,
          eng: document.getElementById('eng_name').value
        }},
        readings: {{}}
      }};
      document.querySelectorAll('input[data-param]').forEach(inp => {{
        const k = inp.dataset.param + '_' + inp.dataset.time;
        if(inp.value.trim()) d.readings[k] = inp.value.trim();
      }});
      return d;
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
        if(d.names) {{
          Object.keys(d.names).forEach(k => {{
            const el = document.getElementById(k + '_name');
            if(el) el.value = d.names[k];
          }});
        }}
        if(d.readings) {{
          Object.keys(d.readings).forEach(k => {{
            const [param, time] = k.split('_');
            const inp = document.querySelector('input[data-param="' + param + '"][data-time="' + time + '"]');
            if(inp) {{
              inp.value = d.readings[k];
              inp.dispatchEvent(new Event('input'));
            }}
          }});
        }}
        updateDcsKPIs();
        const b = document.getElementById('save-status');
        b.className = 'status-badge saved';
        b.innerText = 'โหลดข้อมูลสำเร็จ';
      }} catch(e) {{ console.error(e); }}
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
      canvas.width = 3040;
      canvas.height = 4300;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(artImg, 0, 0, 3040, 4300);

      ctx.fillStyle = '#0a2310';
      ctx.font = 'bold 28px "TH Sarabun", sans-serif';

      const dt = document.getElementById('doc_date').value;
      const py = document.getElementById('prod_year').value;
      if(dt) ctx.fillText(dt, 500, 280);
      if(py) ctx.fillText(py, 1100, 280);

      // Draw values across the 12 columns
      const timeSlots = ["19:00", "21:00", "23:00", "01:00", "03:00", "05:00", "07:00", "09:00", "11:00", "13:00", "15:00", "17:00"];
      const timeXs = [890, 980, 1070, 1160, 1250, 1340, 1430, 1520, 1610, 1700, 1790, 1880];

      const d = getFormData();
      ctx.font = '24px "TH Sarabun", sans-serif';

      // Loop readings
      document.querySelectorAll('input[data-param]').forEach(inp => {{
        const p = inp.dataset.param;
        const t = inp.dataset.time;
        const v = inp.value.trim();
        if(!v) return;
        const tIdx = timeSlots.indexOf(t);
        if(tIdx === -1) return;
        const cx = timeXs[tIdx];
        // Calculate y from table row
        const rowIdx = inp.closest('tr').rowIndex;
        const cy = 460 + rowIdx * 45;
        ctx.textAlign = 'center';
        ctx.fillStyle = inp.classList.contains('out-of-range') ? '#b91c1c' : '#14532d';
        ctx.fillText(v, cx, cy);
      }});

      // Signatures
      ['sig_op1', 'sig_op2', 'sig_shift_lead', 'sig_engineer'].forEach((id, idx) => {{
        const cv = sigCanvases[id];
        const sx = [380, 1050, 1720, 2390][idx];
        ctx.drawImage(cv, sx, 4120, 240, 70);
      }});

      document.getElementById('preview-modal').classList.add('active');
    }}

    function closePreview() {{
      document.getElementById('preview-modal').classList.remove('active');
    }}

    function printDoc() {{
      const cv = document.getElementById('print_canvas');
      const w = window.open('');
      w.document.write('<html><head><title>พิมพ์เอกสาร DCS</title><style>@page {{ size: portrait; margin: 0; }} body {{ margin: 0; }} img {{ width: 100vw; height: auto; }}</style></head><body><img src="' + cv.toDataURL('image/png') + '"></body></html>');
      w.document.close();
      setTimeout(() => {{ w.focus(); w.print(); }}, 600);
    }}

    function downloadPNG() {{
      const cv = document.getElementById('print_canvas');
      const a = document.createElement('a');
      a.href = cv.toDataURL('image/png');
      a.download = FORM_ID + '_A3.png';
      a.click();
    }}

    window.addEventListener('load', loadData);
  </script>
</body>
</html>"""
    return html

def build_html_pd02_pd02(art_master):
    css = CSS_BASE
    for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
        tag = "__FONT_" + font.replace('.', '_').replace('-', '_').upper() + "__"
        css = css.replace(tag, font_payloads.get(font, ''))

    # Load 357 items JSON
    catalog_items = json.loads((scratch / "pd02_catalog_items.json").read_text(encoding="utf-8"))
    catalog_json_str = json.dumps(catalog_items, ensure_ascii=False)

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <title>FM-PD02-PD-02 ตรวจสอบวัสดุที่แตกหักได้ (357 รายการ 17 หน้า)</title>
  <style>
    {css}
    .pagination-bar {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f1f5f1;
      padding: 10px 16px;
      border-radius: 8px;
      border: 1px solid #d4ded5;
      margin-bottom: 14px;
    }}
    .page-controls {{
      display: flex;
      gap: 6px;
      align-items: center;
    }}
  </style>
</head>
<body>
  <header>
    <small>ระบบตรวจเช็คเครื่องจักรออนไลน์ • แผนกลูกหีบ ฝ่ายวิศวกรรมจักรกล</small>
    <h1>FM-PD02-PD-02 บันทึกการตรวจสอบวัสดุที่สามารถแตกหักได้ (Rev.00)</h1>
    <p>ระบบตรวจสอบหลอดไฟ สปอตไลต์ กระจก และเกจวัดแรงดัน 357 รายการ (17 หน้า) • สารบัญค้นหาและตรวจเช็คประจำวัน 1-31</p>
  </header>

  <main>
    <div class="toolbar">
      <button class="primary" onclick="saveData()">💾 บันทึกข้อมูลทั้ง 17 หน้า</button>
      <button onclick="renderCurrentPagePrint()">🖨️ แสดงตัวอย่าง & พิมพ์ (หน้าที่เลือก 260 DPI)</button>
      <button onclick="fillPageNormal()">✔️ ติ๊กปกติทั้งหน้านี้ (🗸)</button>
      <button onclick="clearPage()">🔄 ล้างค่าหน้านี้</button>
      <button onclick="exportJSON()">📤 ส่งออก JSON</button>
      <label class="import-btn">📥 นำเข้า JSON <input type="file" accept=".json" onchange="importJSON(event)" style="display:none"></label>
      <button class="danger" onclick="resetForm()">🗑️ ล้างข้อมูล</button>
      <span class="status-badge saved" id="save-status">พร้อมใช้งาน</span>
    </div>

    <div class="sheet">
      <div class="meta">
        <div><label>แผนก</label><input type="text" id="dept_name" value="ลูกหีบ" oninput="markUnsaved()"></div>
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
        <div><label>ปี พ.ศ.</label><input type="text" id="year_str" value="2567" oninput="markUnsaved()"></div>
        <div><label>ค้นหา Tag หรือชื่ออุปกรณ์</label><input type="text" id="search_box" placeholder="เช่น ML-SL หรือ สปอตไลต์" oninput="filterCatalog()"></div>
      </div>

      <div class="kpi-row">
        <div class="kpi-card"><div class="lbl">อุปกรณ์ทั้งหมด</div><div class="val">357 รายการ</div></div>
        <div class="kpi-card"><div class="lbl">จำนวนหน้าเอกสาร</div><div class="val">17 หน้า</div></div>
        <div class="kpi-card"><div class="lbl">ตรวจสมบูรณ์ (🗸)</div><div class="val" id="kpi_pass" style="color:#166534">0</div></div>
        <div class="kpi-card"><div class="lbl">พบแตกหัก/ชำรุด (✗)</div><div class="val" id="kpi_defect" style="color:#991b1b">0</div></div>
      </div>

      <div class="pagination-bar">
        <div class="page-controls">
          <button onclick="changePage(1)">« หน้าแรก</button>
          <button onclick="changePage(currentPage - 1)">‹ หน้าก่อนหน้า</button>
          <span style="font-weight:600;margin:0 8px">หน้า</span>
          <select id="page_selector" onchange="changePage(parseInt(this.value))">
            {''.join(f'<option value="{p}">หน้า {p} / 17</option>' for p in range(1, 18))}
          </select>
          <button onclick="changePage(currentPage + 1)">หน้าถัดไป ›</button>
          <button onclick="changePage(17)">หน้าสุดท้าย »</button>
        </div>
        <div id="page_info" style="font-size:13px;color:#4b6650;font-weight:600">แสดง 21 รายการของหน้านี้</div>
      </div>

      <div class="table-wrapper">
        <table class="form-table" id="catalog_table">
          <thead>
            <tr>
              <th rowspan="2" style="width:40px">ลำดับ</th>
              <th rowspan="2" style="width:180px">รายการ</th>
              <th rowspan="2" style="width:110px">รหัสอุปกรณ์ (Tag)</th>
              <th rowspan="2" style="width:60px">จำนวน</th>
              <th rowspan="2" style="width:90px">ความถี่</th>
              <th colspan="31">วันที่ตรวจเช็ค (คลิก: ว่าง → 🗸 ผ่าน → ✗ แตกหัก)</th>
            </tr>
            <tr>
              {''.join(f'<th>{d}</th>' for d in range(1, 32))}
            </tr>
          </thead>
          <tbody id="table_body">
            <!-- Dynamic Page Rows -->
          </tbody>
        </table>
      </div>

      <div class="sig-section">
        <div class="sig-box">
          <strong>ผู้ตรวจเช็ค (พนักงาน)</strong>
          <canvas id="sig_inspector" width="280" height="80"></canvas>
          <input type="text" id="inspector_name" placeholder="ชื่อ-สกุล ผู้ตรวจเช็ค">
          <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_inspector')">ล้างลายเซ็น</button>
        </div>
        <div class="sig-box">
          <strong>ผู้ทวนสอบ (หัวหน้าแผนก/วิศวกร)</strong>
          <canvas id="sig_reviewer" width="280" height="80"></canvas>
          <input type="text" id="reviewer_name" placeholder="ชื่อ-สกุล วิศวกร">
          <button style="font-size:12px;padding:3px 8px;margin-top:4px" onclick="clearSig('sig_reviewer')">ล้างลายเซ็น</button>
        </div>
      </div>
    </div>
  </main>

  <div id="preview-modal">
    <div id="preview-content">
      <div style="padding:12px 20px;background:#143d25;color:white;display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0" id="preview_title">ตัวอย่างเอกสารพิมพ์ (Canvas 260 DPI)</h3>
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
    const FORM_ID = 'FM-PD02-PD-02';
    const CATALOG = {catalog_json_str};
    const ART_MASTER = '{art_master}';
    let artImg = new Image();
    artImg.src = ART_MASTER;

    let currentPage = 1;
    // Map of itemId -> day (1..31) -> '🗸' | '✗' | ''
    let checkState = {{}};

    const sigCanvases = {{}};
    ['sig_inspector', 'sig_reviewer'].forEach(id => {{
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
      sigCanvases[id].getContext('2d').clearRect(0, 0, sigCanvases[id].width, sigCanvases[id].height);
      markUnsaved();
    }}

    function renderPage() {{
      const tb = document.getElementById('table_body');
      tb.innerHTML = '';
      const items = CATALOG.filter(i => i.page === currentPage);
      document.getElementById('page_selector').value = currentPage;
      document.getElementById('page_info').innerText = 'แสดงรายการที่ ' + ((currentPage-1)*21 + 1) + ' ถึง ' + Math.min(currentPage*21, CATALOG.length) + ' จากทั้งหมด ' + CATALOG.length + ' รายการ';

      items.forEach(it => {{
        const tr = document.createElement('tr');
        tr.dataset.id = it.id;
        let daysHtml = '';
        const itChecks = checkState[it.id] || {{}};
        for(let d = 1; d <= 31; d++) {{
          const st = itChecks[d] || '';
          const cls = st === '🗸' ? 'chk-cell pass' : st === '✗' ? 'chk-cell fail' : 'chk-cell';
          daysHtml += '<td class="' + cls + '" data-day="' + d + '" onclick="toggleCheck(' + it.id + ', ' + d + ', this)">' + st + '</td>';
        }}

        tr.innerHTML = '<td>' + it.no + '</td><td style="text-align:left">' + it.name + '</td><td style="font-family:monospace;font-weight:600">' + it.tag + '</td><td>' + it.qty + '</td><td>' + it.freq + '</td>' + daysHtml;
        tb.appendChild(tr);
      }});
      updateCatalogKPIs();
    }}

    function changePage(p) {{
      if(p < 1 || p > 17) return;
      currentPage = p;
      renderPage();
    }}

    function toggleCheck(itemId, day, cell) {{
      markUnsaved();
      if(!checkState[itemId]) checkState[itemId] = {{}};
      const cur = checkState[itemId][day] || '';
      let nxt = '';
      if(!cur) nxt = '🗸';
      else if(cur === '🗸') nxt = '✗';
      else nxt = '';
      checkState[itemId][day] = nxt;
      cell.innerText = nxt;
      cell.className = nxt === '🗸' ? 'chk-cell pass' : nxt === '✗' ? 'chk-cell fail' : 'chk-cell';
      updateCatalogKPIs();
    }}

    function fillPageNormal() {{
      markUnsaved();
      const today = new Date().getDate();
      const items = CATALOG.filter(i => i.page === currentPage);
      items.forEach(it => {{
        if(!checkState[it.id]) checkState[it.id] = {{}};
        checkState[it.id][today] = '🗸';
      }});
      renderPage();
    }}

    function clearPage() {{
      markUnsaved();
      const items = CATALOG.filter(i => i.page === currentPage);
      items.forEach(it => {{
        delete checkState[it.id];
      }});
      renderPage();
    }}

    function updateCatalogKPIs() {{
      let pass = 0, defect = 0;
      Object.keys(checkState).forEach(id => {{
        const days = checkState[id];
        Object.keys(days).forEach(d => {{
          if(days[d] === '🗸') pass++;
          else if(days[d] === '✗') defect++;
        }});
      }});
      document.getElementById('kpi_pass').innerText = pass;
      document.getElementById('kpi_defect').innerText = defect;
    }}

    function filterCatalog() {{
      const kw = document.getElementById('search_box').value.trim().toLowerCase();
      if(!kw) {{
        renderPage();
        return;
      }}
      const found = CATALOG.filter(i => (i.tag && i.tag.toLowerCase().includes(kw)) || (i.name && i.name.toLowerCase().includes(kw)));
      if(found.length > 0) {{
        currentPage = found[0].page;
        renderPage();
      }}
    }}

    function markUnsaved() {{
      const b = document.getElementById('save-status');
      b.className = 'status-badge unsaved';
      b.innerText = 'มีการเปลี่ยนแปลงยังไม่บันทึก';
    }}

    function getFormData() {{
      return {{
        dept_name: document.getElementById('dept_name').value,
        month_str: document.getElementById('month_str').value,
        year_str: document.getElementById('year_str').value,
        inspector_name: document.getElementById('inspector_name').value,
        reviewer_name: document.getElementById('reviewer_name').value,
        checkState: checkState
      }};
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
      if(raw) {{
        try {{
          const d = JSON.parse(raw);
          if(d.dept_name) document.getElementById('dept_name').value = d.dept_name;
          if(d.month_str) document.getElementById('month_str').value = d.month_str;
          if(d.year_str) document.getElementById('year_str').value = d.year_str;
          if(d.inspector_name) document.getElementById('inspector_name').value = d.inspector_name;
          if(d.reviewer_name) document.getElementById('reviewer_name').value = d.reviewer_name;
          if(d.checkState) checkState = d.checkState;
        }} catch(e) {{ console.error(e); }}
      }}
      renderPage();
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

    function renderCurrentPagePrint() {{
      const canvas = document.getElementById('print_canvas');
      canvas.width = 3040;
      canvas.height = 2150;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(artImg, 0, 0, 3040, 2150);

      ctx.fillStyle = '#0a2310';
      ctx.font = 'bold 26px "TH Sarabun", sans-serif';

      // Header meta
      const m = document.getElementById('month_str').value;
      const y = document.getElementById('year_str').value;
      if(m) ctx.fillText(m, 1450, 205);
      if(y) ctx.fillText(y, 1850, 205);

      // Page items (21 items)
      const items = CATALOG.filter(i => i.page === currentPage);
      ctx.font = '22px "TH Sarabun", sans-serif';

      items.forEach((it, idx) => {{
        const rowY = 355 + idx * 55;
        // Text for days 1 to 31
        const itChecks = checkState[it.id] || {{}};
        for(let d = 1; d <= 31; d++) {{
          const val = itChecks[d];
          if(!val) continue;
          const cx = 1045 + (d - 1) * 55.4;
          ctx.textAlign = 'center';
          ctx.fillStyle = val === '✗' ? '#b91c1c' : '#14532d';
          ctx.fillText(val, cx, rowY);
        }}
      }});

      // Signatures
      const cv1 = sigCanvases['sig_inspector'];
      const cv2 = sigCanvases['sig_reviewer'];
      ctx.drawImage(cv1, 650, 1920, 240, 65);
      ctx.drawImage(cv2, 1650, 1920, 240, 65);

      document.getElementById('preview_title').innerText = 'ตัวอย่างเอกสารพิมพ์ หน้าที่ ' + currentPage + ' / 17';
      document.getElementById('preview-modal').classList.add('active');
    }}

    function closePreview() {{
      document.getElementById('preview-modal').classList.remove('active');
    }}

    function printDoc() {{
      const cv = document.getElementById('print_canvas');
      const w = window.open('');
      w.document.write('<html><head><title>พิมพ์เอกสาร</title><style>@page {{ size: landscape; margin: 0; }} body {{ margin: 0; }} img {{ width: 100vw; height: auto; }}</style></head><body><img src="' + cv.toDataURL('image/png') + '"></body></html>');
      w.document.close();
      setTimeout(() => {{ w.focus(); w.print(); }}, 500);
    }}

    function downloadPNG() {{
      const cv = document.getElementById('print_canvas');
      const a = document.createElement('a');
      a.href = cv.toDataURL('image/png');
      a.download = FORM_ID + '_Page_' + currentPage + '.png';
      a.click();
    }}

    window.addEventListener('load', loadData);
  </script>
</body>
</html>"""
    return html

if __name__ == "__main__":
    generate_phase4()
