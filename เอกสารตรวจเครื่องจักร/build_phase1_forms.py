import pymupdf, sys
sys.stdout.reconfigure(encoding="utf-8")
import base64
import re
import json
from pathlib import Path

root = Path(r"C:\Users\autocad06\OneDrive - easternsugar.co.th\02.OneDriver วิศวกรรมจักรกล\06.AI Projects\260925 ตรวจเช็คเครื่องจักรออนไลน์\เอกสารตรวจเครื่องจักร")
base_folder = root / "แบบฟอร์มหลัก"
fonts_folder = root / "fonts"

# 1. Preload fonts as base64
print("Loading offline fonts...")
font_payloads = {}
for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
    font_path = fonts_folder / font
    if font_path.exists():
        font_payloads[font] = base64.b64encode(font_path.read_bytes()).decode('ascii')
print("All fonts loaded successfully.")

# 2. Preload vendor jsQR
jsqr_path = (root / "../public/assets/vendor/jsQR.js").resolve()
jsqr_code = jsqr_path.read_text(encoding='utf-8') if jsqr_path.exists() else ""

def get_pdf_artwork(pdf_name):
    pdf_path = base_folder / pdf_name
    doc = pymupdf.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=260)
    png_bytes = pix.tobytes("png")
    return "data:image/png;base64," + base64.b64encode(png_bytes).decode("ascii")

html_base = (root / "FM-ML01-ML-02.html").read_text(encoding='utf-8-sig')

# ==============================================================================
# 3. BUILD FM-ML01-ML-09
# ==============================================================================
print("\nBuilding FM-ML01-ML-09 (แบบบันทึกเครื่องจักรดั๊มพ์ยกรถอ้อย)...")
art_09 = get_pdf_artwork("FM-ML01-ML-09 Rev.00 แบบบันทึกเครื่องจักรดั๊มพ์ยกรถอ้.pdf")

fields_09 = [
    ['ตรวจเช็คความสะอาด มอเตอร์ยกรถดั๊มพ์', 'เบอร์ 1', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด มอเตอร์ยกรถดั๊มพ์', 'เบอร์ 2', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด มอเตอร์ล็อคดั๊มพ์', 'เบอร์ 1', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด มอเตอร์ล็อคดั๊มพ์', 'เบอร์ 2', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด กระบอกดั๊มพ์', '1-1', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด กระบอกดั๊มพ์', '1-2', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด กระบอกดั๊มพ์', '2-1', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด กระบอกดั๊มพ์', '2-2', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด กระบอกดั๊มพ์', '3-1', '', 'สะอาด', None, None, False],
    ['ตรวจเช็คความสะอาด กระบอกดั๊มพ์', '3-2', '', 'สะอาด', None, None, False],
    ['ระดับน้ำมัน', 'ระดับน้ำมันในถัง', '%', '>80', 80, None, False],
    ['อุณหภูมิ น้ำหล่อเย็น', 'เข้า', '°C', '18-30', 18, 30, False],
    ['อุณหภูมิ น้ำหล่อเย็น', 'ออก', '°C', '-', None, None, False],
    ['อุณหภูมิ น้ำมันไฮดรอลิค', 'เข้า', '°C', '35-45', 35, 45, False],
    ['อุณหภูมิ น้ำมันไฮดรอลิค', 'ออก', '°C', '-', None, None, False],
    ['อุณหภูมิ มอเตอร์ยกรถดั๊มพ์', 'เบอร์ 1', '°C', '<80', None, 80, True],
    ['อุณหภูมิ มอเตอร์ยกรถดั๊มพ์', 'เบอร์ 2', '°C', '<80', None, 80, True],
    ['อุณหภูมิ มอเตอร์ล็อคดั๊มพ์', 'เบอร์ 1', '°C', '<80', None, 80, True],
    ['อุณหภูมิ มอเตอร์ล็อคดั๊มพ์', 'เบอร์ 2', '°C', '<80', None, 80, True],
    ['แรงดัน', 'Main', 'kg/cm²', '130-150', 130, 150, False],
    ['แรงดัน', 'Offline Filter', 'kg/cm²', '0-3', 0, 3, False]
]

xs_09 = [
    60.80, 88.25, 115.70, 143.15, 170.60, 198.05, 225.50, 252.95, 280.40, 307.85, 335.33,
    370.03, 404.71, 439.40, 474.09, 508.78, 543.46, 578.14, 612.83, 647.51, 682.20, 716.88
]

html_09 = html_base
html_09 = html_09.replace("<title>รายงานสภาพการทำงานของเครื่องเทอร์ไบน์</title>", "<title>แบบบันทึกเครื่องจักรดั๊มพ์ยกรถอ้อย</title>")
html_09 = html_09.replace("FM-ML01-ML-02 • Rev.01 • แผนก ลูกหีบ", "FM-ML01-ML-09 • Rev.00 • แผนก ลูกหีบ")
html_09 = html_09.replace("บันทึกคุณภาพ รายงานสภาพการทำงานของเครื่องเทอร์ไบน์", "แบบบันทึกเครื่องจักรดั๊มพ์ยกรถอ้อย")
html_09 = html_09.replace("FM-ML01-ML-02 (Rev.01) 20/02/2564", "FM-ML01-ML-09 (Rev.00) 04/01/2564")
html_09 = html_09.replace("ESC_TURBINE_FM_ML01_ML02_V1", "ESC_DUMP_TRUCK_FM_ML01_ML09_V1")
html_09 = html_09.replace("ESC_TURBINE_PRODUCTION_YEAR_DEFAULT_V1", "ESC_DUMP_TRUCK_YEAR_DEFAULT_V1")
html_09 = html_09.replace("DEMO-TURBINE-01", "DEMO-DUMP-01")
html_09 = html_09.replace("624", "504").replace("26", "21")

core_match_09 = re.search(r'<script>\s*\n(.*?)</script>', html_09, re.S)
core_09 = core_match_09.group(1)
core_09 = re.sub(r'const fields=\[.*?\];', 'const fields=' + json.dumps(fields_09, ensure_ascii=False) + ';', core_09, flags=re.S)
core_09 = core_09.replace("26", "21").replace("624", "504")

# Update tbody row generation to support text input for cleanliness checks
old_tbody = "document.querySelector('tbody').innerHTML=times.map((t,r)=>'<tr><th>'+t+'</th>'+fields.map((f,c)=>'<td><input type=\"number\" step=\"any\" id=\"v'+r+'_'+c+'\" aria-label=\"'+t+' '+f[0]+' '+f[1]+' '+f[2]+'\"></td>').join('')+'<td><textarea id=\"note'+r+'\" aria-label=\"หมายเหตุ '+t+'\"></textarea></td></tr>').join('');"
new_tbody = "document.querySelector('tbody').innerHTML=times.map((t,r)=>'<tr><th>'+t+'</th>'+fields.map((f,c)=>c<10?'<td><input type=\"text\" id=\"v'+r+'_'+c+'\" style=\"font-size:16px;text-align:center\" aria-label=\"'+t+' '+f[0]+' '+f[1]+'\"></td>':'<td><input type=\"number\" step=\"any\" id=\"v'+r+'_'+c+'\" aria-label=\"'+t+' '+f[0]+' '+f[1]+' '+f[2]+'\"></td>').join('')+'<td><textarea id=\"note'+r+'\" aria-label=\"หมายเหตุ '+t+'\"></textarea></td></tr>').join('');"
core_09 = core_09.replace(old_tbody, new_tbody)

# Update check(input) to handle cleanliness 'X' as bad
old_check = "input.parentElement.classList.toggle('bad',input.value!==''&&((f[4]!==null&&n<f[4])||(f[5]!==null&&(f[6]?n>=f[5]:n>f[5]))));"
new_check = "if(Number(input.id.split('_')[1])<10){input.parentElement.classList.toggle('bad',input.value==='X');}else{" + old_check + "}"
core_09 = core_09.replace(old_check, new_check)

# Update renderHour for Cleanliness selects in entry form
old_render_field = "fields.map((f,c)=>f[0]===group?'<label>'+f[1]+'<input data-editor=\"true\" type=\"number\" inputmode=\"decimal\" step=\"any\" id=\"edit_'+c+'\" aria-label=\"'+f[0]+' '+f[1]+'\"><span></span></label>':'').join('')"
new_render_field = "fields.map((f,c)=>f[0]===group?'<label>'+f[1]+(c<10?'<select data-editor=\"true\" id=\"edit_'+c+'\" style=\"margin-top:7px;padding:8px;font-size:17px\"><option value=\"\">--</option><option value=\"✓\">✓ ปกติ</option><option value=\"X\">X รั่ว/ตกหล่น</option><option value=\"⊗\">⊗ ปรับปรุงแก้ไขแล้ว</option></select>':'<input data-editor=\"true\" type=\"number\" inputmode=\"decimal\" step=\"any\" id=\"edit_'+c+'\" aria-label=\"'+f[0]+' '+f[1]+'\">')+'<span></span></label>':'').join('')"
core_09 = core_09.replace(old_render_field, new_render_field)

html_09 = html_09[:core_match_09.start()] + '<script>\n' + core_09 + '\n</script>' + html_09[core_match_09.end():]

def bundle_09(match):
    src = match.group(1)
    if 'jsQR.js' in src: return '<script>' + jsqr_code + '</script>'
    if src == 'template-artwork.js': return '<script>const sourceTemplateData = ' + repr(art_09) + ';</script>'
    path = (root / src).resolve()
    content = path.read_text(encoding='utf-8-sig')
    
    if src == 'turbine-demo.js':
        content = content.replace('624', '504')
        centers_code = 'const centers = ["✓","✓","✓","✓","✓","✓","✓","✓","✓","✓", 88, 24, 28, 40, 42, 52, 54, 48, 50, 140, 1.5];'
        content = re.sub(r'const centers=\[.*?\];', centers_code, content)
        content = content.replace("const change=c===5?.01:c===22?.001:c>=20?.01:c===0?10:1;", "const change=c<10?0:c===20?0.2:1;")
        content = content.replace("$('v'+r+'_'+c).value=String(Number(value.toFixed(3)));", "$('v'+r+'_'+c).value=c<10?base:String(Number(value.toFixed(1)));")
        content = content.replace("DEMO-TURBINE-01", "DEMO-DUMP-01")
        content = re.sub(r"else if\(!localStorage.getItem\('ESC_TURBINE_DEMO_INITIALIZED'\)\).*?\}\}catch", '}catch', content)
        content = content.replace(
            "document.querySelectorAll('#table input[type=number]').forEach(el=>{if(el.value===''||!el.validity.valid||!Number.isFinite(Number(el.value)))count++;});",
            "document.querySelectorAll('#table td input').forEach(el=>{if(!el.value.trim())count++;});"
        )
    if src == 'turbine-template.js':
        content = re.sub(r'const xs=\[.*?\];', f'const xs={json.dumps(xs_09)};', content)
        content = content.replace('144.38+r*(368.72/24)', '156.56+r*(345.38/24)').replace('height=368.72/24', 'height=345.38/24')
        content = content.replace('723,top+6', '722,top+5.5').replace('>99', '>98').replace('5.5,99', '5.2,98')
        content = content.replace("ctx.fillRect(440,68,106,9);ctx.fillRect(579,68,48,9);", "ctx.fillRect(395,66,128,11);ctx.fillRect(568,66,52,11);")
        content = content.replace("text(date,493,75,6.5,102);text($('year').value,603,75,6.5,46);", "text(date,459,74.5,6.8,120);text($('year').value,594,74.5,6.8,48);")
        content = content.replace("ctx.fillRect(16,518,812,77);", "ctx.fillRect(16,516,812,75);")
        content = content.replace("FM-ML01-ML-02 (Rev.01) 20/02/2564", "FM-ML01-ML-09 (Rev.00) 04/01/2564")
        content = content.replace("FM-ML01-ML-02_", "FM-ML01-ML-09_")
    if src == 'turbine-header.js':
        content += "\nconst definitions=document.createElement('p');definitions.className='hint';definitions.textContent='คำอธิบาย: ✓ = สะอาด ไม่มีจุดรั่ว ไหล หก ตก หล่น • X = มีจุดรั่ว ไหล หก ตก หล่น • ⊗ = ปรับปรุงแก้ไขแล้ว';document.getElementById('groups').before(definitions);\n"
    if src == 'turbine-pdf.js':
        content = content.replace("FM-ML01-ML-02", "FM-ML01-ML-09")
    return '<script>\n' + content.replace('</script', '<\\/script') + '\n</script>'

html_09 = re.sub(r'<script src="([^"]+)"></script>', bundle_09, html_09)

for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
    html_09 = html_09.replace('fonts/' + font, 'data:font/ttf;base64,' + font_payloads[font])

out_09 = root / "FM-ML01-ML-09.html"
out_09.write_text(html_09, encoding='utf-8')
print(f"Generated {out_09.name} ({len(html_09)} bytes)")

# ==============================================================================
# 4. BUILD FM-ML01-ML-10
# ==============================================================================
print("\nBuilding FM-ML01-ML-10 (แบบบันทึกเครื่องจักรสะพานดั๊มพ์และสะพานเมน)...")
art_10 = get_pdf_artwork("FM-ML01-ML-10 Rev.00 แบบบันทึกเครื่องจักรสะพานดั๊มพ์แ.pdf")

groups_10 = [
    ('ใบเกลี่ยสะพานดั๊มพ์', ['MT', 'G', 'DE', 'NDE']),
    ('ใบเตะสะพานดั๊มพ์ เบอร์ 1', ['MT', 'G', 'DE', 'NDE']),
    ('ใบเตะสะพานดั๊มพ์ เบอร์ 2', ['MT', 'G', 'DE', 'NDE']),
    ('Pre-cutter', ['MT', 'G', 'DE', 'NDE']),
    ('ใบมีดสะพานเมน เบอร์ 1', ['MT', 'DE', 'NDE']),
    ('ใบมีดสะพานเมน เบอร์ 2', ['MT', 'DE', 'NDE']),
    ('ใบเกลี่ยสะพานเมน', ['MT', 'G', 'DE', 'NDE']),
    ('ใบเตะสะพานเมน เบอร์ 3', ['MT', 'G', 'DE', 'NDE']),
    ('เกียร์ขับสะพานดั๊มพ์ เบอร์ 1', ['MT', 'G', 'DE', 'NDE']),
    ('เกียร์ขับสะพานดั๊มพ์ เบอร์ 2', ['MT', 'G', 'DE', 'NDE']),
    ('เกียร์ขับสะพานเมน', ['MT', 'G', 'DE', 'NDE'])
]

fields_10 = []
for grp, subcols in groups_10:
    for sub in subcols:
        fields_10.append([grp, sub, '°C', '<80', None, 80, True])

xs_10 = [
    60.26, 76.85, 93.40, 109.95, 126.50,
    143.10, 159.65, 176.24, 192.77,
    209.35, 225.90, 242.48, 259.01,
    275.60, 292.15, 308.70, 325.25,
    341.85, 358.42, 374.95,
    391.55, 408.10, 424.63,
    441.20, 457.78, 474.34, 490.87,
    507.50, 524.05, 540.60, 557.14,
    573.73, 590.29, 606.85, 623.38,
    639.97, 656.53, 673.10, 689.64,
    706.23, 722.80, 739.35, 755.88
]

html_10 = html_base
html_10 = html_10.replace("<title>รายงานสภาพการทำงานของเครื่องเทอร์ไบน์</title>", "<title>แบบบันทึกเครื่องจักรสะพานดั๊มพ์และสะพานเมน</title>")
html_10 = html_10.replace("FM-ML01-ML-02 • Rev.01 • แผนก ลูกหีบ", "FM-ML01-ML-10 • Rev.00 • แผนก ลูกหีบ")
html_10 = html_10.replace("บันทึกคุณภาพ รายงานสภาพการทำงานของเครื่องเทอร์ไบน์", "แบบบันทึกเครื่องจักรสะพานดั๊มพ์และสะพานเมน")
html_10 = html_10.replace("FM-ML01-ML-02 (Rev.01) 20/02/2564", "FM-ML01-ML-10 (Rev.00) 04/01/2564")
html_10 = html_10.replace("ESC_TURBINE_FM_ML01_ML02_V1", "ESC_BRIDGE_MAIN_FM_ML01_ML10_V1")
html_10 = html_10.replace("ESC_TURBINE_PRODUCTION_YEAR_DEFAULT_V1", "ESC_BRIDGE_MAIN_YEAR_DEFAULT_V1")
html_10 = html_10.replace("DEMO-TURBINE-01", "DEMO-BRIDGE-02")
html_10 = html_10.replace("624", "1032").replace("26", "43")

core_match_10 = re.search(r'<script>\s*\n(.*?)</script>', html_10, re.S)
core_10 = core_match_10.group(1)
core_10 = re.sub(r'const fields=\[.*?\];', 'const fields=' + json.dumps(fields_10, ensure_ascii=False) + ';', core_10, flags=re.S)
core_10 = core_10.replace("26", "43").replace("624", "1032")
html_10 = html_10[:core_match_10.start()] + '<script>\n' + core_10 + '\n</script>' + html_10[core_match_10.end():]

def bundle_10(match):
    src = match.group(1)
    if 'jsQR.js' in src: return '<script>' + jsqr_code + '</script>'
    if src == 'template-artwork.js': return '<script>const sourceTemplateData = ' + repr(art_10) + ';</script>'
    path = (root / src).resolve()
    content = path.read_text(encoding='utf-8-sig')
    
    if src == 'turbine-demo.js':
        content = content.replace('624', '1032')
        content = re.sub(r'const centers=\[.*?\];', f'const centers=Array.from({{length:43}},(_,i)=>45+(i%5)*3);', content)
        content = content.replace("const change=c===5?.01:c===22?.001:c>=20?.01:c===0?10:1;", "const change=1;")
        content = content.replace("DEMO-TURBINE-01", "DEMO-BRIDGE-02")
        content = re.sub(r"else if\(!localStorage.getItem\('ESC_TURBINE_DEMO_INITIALIZED'\)\).*?\}\}catch", '}catch', content)
    if src == 'turbine-template.js':
        content = re.sub(r'const xs=\[.*?\];', f'const xs={json.dumps(xs_10)};', content)
        content = content.replace('144.38+r*(368.72/24)', '158.60+r*(310.82/24)').replace('height=368.72/24', 'height=310.82/24')
        content = content.replace('723,top+6', '758,top+4.5').replace('>99', '>58').replace('5.5,99', '4.8,58')
        content = content.replace("ctx.fillRect(440,68,106,9);ctx.fillRect(579,68,48,9);", "ctx.fillRect(393,62,112,11);ctx.fillRect(546,62,45,11);")
        content = content.replace("text(date,493,75,6.5,102);text($('year').value,603,75,6.5,46);", "text(date,449,70.5,6.8,105);text($('year').value,568,70.5,6.8,42);")
        content = content.replace("ctx.fillRect(16,518,812,77);", "ctx.fillRect(16,502,812,75);")
        content = content.replace("y=520;", "y=504;")
        content = content.replace("FM-ML01-ML-02 (Rev.01) 20/02/2564", "FM-ML01-ML-10 (Rev.00) 04/01/2564")
        content = content.replace("FM-ML01-ML-02_", "FM-ML01-ML-10_")
    if src == 'turbine-header.js':
        content += "\nconst definitions=document.createElement('p');definitions.className='hint';definitions.textContent='คำอธิบาย: MT = Motor (มอเตอร์) • G = Gear Box (เกียร์บล็อค) • DE = Drive end (ตุ๊กตาด้านมอเตอร์ขับ) • NDE = Non Drive end (ตุ๊กตาตรงข้ามมอเตอร์ขับ) • ค่าควบคุมอุณหภูมิ < 80 °C';document.getElementById('groups').before(definitions);\n"
    if src == 'turbine-pdf.js':
        content = content.replace("FM-ML01-ML-02", "FM-ML01-ML-10")
    return '<script>\n' + content.replace('</script', '<\\/script') + '\n</script>'

html_10 = re.sub(r'<script src="([^"]+)"></script>', bundle_10, html_10)

for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
    html_10 = html_10.replace('fonts/' + font, 'data:font/ttf;base64,' + font_payloads[font])

out_10 = root / "FM-ML01-ML-10.html"
out_10.write_text(html_10, encoding='utf-8')
print(f"Generated {out_10.name} ({len(html_10)} bytes)")

print("\nPhase 1 Form Rebuilding Completed Successfully!")
