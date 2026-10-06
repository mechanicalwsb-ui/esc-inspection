from pathlib import Path
import re, base64, io
import pymupdf

root = Path(__file__).resolve().parent
source = Path(r'C:\Users\autocad06\OneDrive - easternsugar.co.th\02.OneDriver วิศวกรรมจักรกล\02.ลูกหีบ-SP\03.เอกสาร\18.เอกสารบันทึก\FM-ML01-ML-11 Rev.00 แบบบันทึกเครื่องจักรสะพานข้ามชุด.pdf')
doc = pymupdf.open(source)
page = doc[0]
pix = page.get_pixmap(dpi=260)
buff = io.BytesIO(pix.tobytes('png'))
art = 'data:image/png;base64,' + base64.b64encode(buff.getvalue()).decode()

html = (root / 'FM-ML01-ML-02.html').read_text(encoding='utf-8-sig')
groups = ['สะพานเชรดเดอร์', 'High speed belt', 'สะพานข้ามชุด 3', 'สะพานข้ามชุด 4', 'สะพานข้ามชุด 5']
config = "const fields=" + str([[g, l, '°C', '<80', None, 80, True] for g in groups for l in ['MT', 'G', 'DE', 'NDE']]).replace('None', 'null').replace('True', 'true') + ';'
core_match = re.search(r'<script>\s*\n(.*?)</script>', html, re.S)
core = core_match.group(1)
core = re.sub(r'const fields=\[.*?\];', config, core, flags=re.S)
core = core.replace('26', '20').replace('624', '480')

# Enhance entryfield labels to show descriptive Thai machinery names
core = core.replace(
    "fields.map((f,c)=>f[0]===group?'<label>'+f[1]+'<input",
    "fields.map((f,c)=>f[0]===group?'<label>'+({'MT':'MT (มอเตอร์ขับ)','G':'G (เกียร์บล๊อค)','DE':'DE (ตุ๊กตาด้านขับ)','NDE':'NDE (ตุ๊กตาตรงข้ามด้านขับ)'}[f[1]]||f[1])+'<input"
)
core = core.replace(
    "'<section class=\"group\"><h2>'+group+'</h2>",
    "'<section class=\"group\"><h2>'+group+'<small style=\"font-size:12px;font-weight:normal;color:#4f6d54;background:#eef5ed;padding:2px 8px;border-radius:4px\">4 จุดตรวจ • &lt;80°C</small></h2>"
)

html = html[:core_match.start()] + '<script>\n' + core + '\n</script>' + html[core_match.end():]

# Bundle all executable modules and QR decoder for a portable single-file form.
def bundle(match):
    src = match.group(1)
    if src == 'template-artwork.js':
        return '<script>const sourceTemplateData=' + repr(art) + ';</script>'
    path = (root / src).resolve()
    content = path.read_text(encoding='utf-8-sig')
    if src == 'turbine-demo.js':
        content = content.replace('624', '480')
        content = re.sub(r'const centers=\[.*?\];', 'const centers=Array.from({length:20},(_,i)=>45+(i%4)*3);', content)
        content = content.replace("const change=c===5?.01:c===22?.001:c>=20?.01:c===0?10:1;", "const change=1;")
        # Enable auto-demo seeding on initial load so FM-ML01-ML-11 has the same interactive feel as FM-ML01-ML-02
        content = content.replace('ESC_TURBINE_DEMO_INITIALIZED', 'ESC_BRIDGE_DEMO_INITIALIZED')
    if src == 'turbine-template.js':
        content = re.sub(r'const xs=\[.*?\];', 'const xs=[59,91.55,124.05,156.55,189.1,221.65,254.15,286.65,319.2,351.75,384.25,416.75,449.3,481.85,514.35,546.85,579.4,611.95,644.45,676.95,709.5];', content)
        content = content.replace('144.38+r*(368.72/24)', '154.2+r*(351.4/24)').replace('height=368.72/24', 'height=351.4/24')
        content = content.replace('723,top+6', '712,top+6').replace('>99', '>108').replace('5.5,99', '5.5,108')
        content = content.replace('ctx.fillRect(440,68,106,9);ctx.fillRect(579,68,48,9);', 'ctx.fillRect(454,65,134,10);ctx.fillRect(626,65,63,10);')
        content = content.replace('text(date,493,75,6.5,102);text($(\'year\').value,603,75,6.5,46);', 'text(date,520,72,7,130);text($(\'year\').value,657,72,7,61);')
    if src == 'turbine-header.js':
        def_card_js = """
const bridgeDefCard = document.createElement('div');
bridgeDefCard.className = 'bridgeDefCard';
bridgeDefCard.innerHTML = `
  <div class="defHeader"><strong>ℹ คำอธิบายสัญลักษณ์ย่อจุดวัดอุณหภูมิ</strong> (เกณฑ์มาตรฐานความร้อน &lt; 80 °C ทุกจุดตรวจ)</div>
  <div class="defBadges">
    <span class="defBadge"><b>MT</b> มอเตอร์ขับ (Motor)</span>
    <span class="defBadge"><b>G</b> เกียร์บล๊อค (Gear Box)</span>
    <span class="defBadge"><b>DE</b> แบริ่งตุ๊กตาด้านมอเตอร์ขับ (Drive End)</span>
    <span class="defBadge"><b>NDE</b> แบริ่งตุ๊กตาตรงข้ามด้านขับ (Non-Drive End)</span>
  </div>
`;
document.getElementById('groups').before(bridgeDefCard);

const bridgeStyle = document.createElement('style');
bridgeStyle.textContent = `
.bridgeDefCard{background:#eef6f0;border:1px solid #c2dec8;border-left:5px solid #236b38;border-radius:9px;padding:12px 18px;margin:14px 0 18px;box-shadow:0 2px 6px #00000008}
.defHeader{font-size:14px;color:#184224;margin-bottom:8px}
.defBadges{display:flex;flex-wrap:wrap;gap:10px 16px;font-size:13px;color:#203827}
.defBadge b{display:inline-block;background:#236b38;color:white;padding:2px 8px;border-radius:4px;font-size:12px;margin-right:6px}
@media (min-width: 900px){
  .groups .group:last-child{grid-column:1 / -1;background:#fcfdfc;border-color:#b5ccba}
  .groups .group:last-child .entryfields{grid-template-columns:repeat(4,minmax(0,1fr))}
}
.group h2{display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e1ece3;padding-bottom:8px}
`;
document.head.append(bridgeStyle);
"""
        content += "\n" + def_card_js + "\n"
    return '<script>\n' + content.replace('</script', '<\\/script') + '\n</script>'

html = re.sub(r'<script src="([^"]+)"></script>', bundle, html)
html = html.replace('FM-ML01-ML-02', 'FM-ML01-ML-11').replace('Rev.01', 'Rev.00').replace('20/02/2564', '04/01/2564')
html = html.replace('บันทึกคุณภาพ รายงานสภาพการทำงานของเครื่องเทอร์ไบน์', 'แบบบันทึกเครื่องจักร High speed belt และสะพานข้ามชุด')
html = html.replace('รายงานสภาพการทำงานของเครื่องเทอร์ไบน์', 'แบบบันทึกเครื่องจักร High speed belt และสะพานข้ามชุด')
html = html.replace('ESC_TURBINE', 'ESC_BRIDGE').replace('FM_ML01_ML02', 'FM_ML01_ML11').replace('DEMO-TURBINE-01', 'DEMO-BRIDGE-01')
# Independent record/preferences, but shared signer directory across forms.
html = html.replace('ESC_BRIDGE_SIGNER_DIRECTORY_V1', 'ESC_TURBINE_SIGNER_DIRECTORY_V1')
for font in ['THSarabun.ttf', 'THSarabun-Bold.ttf', 'Sarabun-Regular.ttf', 'Sarabun-Bold.ttf']:
    payload = base64.b64encode((root / 'fonts' / font).read_bytes()).decode()
    html = html.replace('fonts/' + font, 'data:font/ttf;base64,' + payload)

(root / 'FM-ML01-ML-11.html').write_text(html, encoding='utf-8')
print('Created FM-ML01-ML-11.html', len(html), 'characters')
