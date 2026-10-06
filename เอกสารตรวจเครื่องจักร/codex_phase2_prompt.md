# Objective: Create build_phase2_runner.py to build Phase 2 Standalone HTML Forms

> **Lock Authorization**: The lock in `_lock/current.md` is held by Antigravity & Codex for this task: `Task: Converting Phase 2 Downtime Logsheets`. You are authorized to write and execute files in `เอกสารตรวจเครื่องจักร/`.

You are the Senior Specialist on our team. Your task is to write a clean, high-performance Python script `build_phase2_runner.py` that generates three production-ready HTML forms:
1. `FM-ML01-ML-05.html` (แบบบันทึกการลดรอบลูกหีบ)
2. `FM-ML01-ML-06.html` (แบบบันทึกการหยุดหีบ)
3. `FM-PD01-PD-01.html` (บันทึกรายงานการหยุดหีบ)

## Key Technical Specifications:
1. **Zero External Dependencies / Standalone**:
   - Convert original PDF page 0 to base64 PNG using PyMuPDF (dpi=260).
     - `FM-ML01-ML-05`: `แบบฟอร์มหลัก/FM-ML01-ML-05 Rev.00 แบบบันทึกการลดรอบลูกหีบ.pdf`
     - `FM-ML01-ML-06`: `แบบฟอร์มหลัก/FM-ML01-ML-06 Rev.00 แบบบันทึกการหยุดหีบ.pdf`
     - `FM-PD01-PD-01`: `แบบฟอร์มหลัก/FM-PD01-PD-01 Rev.00 บันทึกการหยุดหีบ.pdf`
   - Embed base64 fonts (`fonts/THSarabun.ttf`, `fonts/THSarabun-Bold.ttf`, `fonts/Sarabun-Regular.ttf`, `fonts/Sarabun-Bold.ttf`).
   - Embed vendor jsQR code from `../public/assets/vendor/jsQR.js`.
   - Embed client-side binary `makePDF(jpeg, w, h)` function so clicking 'บันทึก PDF' downloads a real PDF blob immediately.

2. **Avoiding Python Template String Bracing Bugs**:
   - When generating JavaScript code inside Python, DO NOT use f-strings containing unescaped `{}` or empty `{}` blocks. Use template placeholders (e.g. `__ARTWORK__`, `__FONTS__`, `__COLUMNS__`, `__TITLE__`) and standard string `.replace()`.

3. **Core Features for each form**:
   - Header with factory title: บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) สาขาวังสมบูรณ์.
   - Toolbar: 💾 บันทึกในเครื่อง, ➕ บันทึกเหตุการณ์, 🧪 ตัวอย่างข้อมูล (Demo), 📥 ดาวน์โหลด JSON, 📤 นำเข้า JSON, 📊 ส่งออก CSV, 📄 บันทึก PDF, 🖨️ พิมพ์, 🔄 เริ่มใหม่.
   - Lock Notice & PIN Unlock modal (PIN: 1234).
   - KPI Summary Cards (Total incidents, total downtime duration, etc.).
   - Interactive table with duration calculation badge, inline cell editing, delete button.
   - Modal dialog for adding events with automatic current time pre-fill and standard reason datalist options.
   - 3-step offline digital signatures with Canvas drawing, Thai timestamp, GPS coords (lat/lng).
   - Pixel-Accurate Background Canvas print engine (`buildTemplate()`) overlaying text at exact calibrated coordinates on the 260 DPI original PDF artwork.

4. **Calibrated Geometry**:
   - **FM-ML01-ML-05**:
     Canvas: 3368 x 2381 (Scale: 841.68 x 595.2)
     xs = `[48.8, 84.0, 141.8, 181.1, 220.3, 433.4, 477.8, 531.4, 584.9, 638.4, 675.1, 711.7, 748.3, 793.1]`
     yStart = 110.84, yEnd = 546.5, totalRows = 29, rowH = (546.5 - 110.84)/29
     Header Date: X=365, Y=72; Season: X=477, Y=72
   - **FM-ML01-ML-06**:
     Canvas: 3368 x 2381 (Scale: 841.68 x 595.2)
     xs = `[37.3, 80.4, 120.9, 161.3, 201.8, 412.0, 476.5, 540.5, 604.4, 668.4, 806.3]`
     yStart = 134.18, yEnd = 540.5, totalRows = 22, rowH = (540.5 - 134.18)/22
     Header Date: X=370, Y=87; Season: X=502, Y=87
   - **FM-PD01-PD-01**:
     Canvas: 3368 x 2381 (Scale: 841.92 x 595.32)
     xs = `[28.8, 92.8, 163.9, 238.0, 309.2, 374.9, 457.4, 518.5, 597.9, 664.3, 813.1]`
     yStart = 127.82, yEnd = 544.2, totalRows = 22, rowH = (544.2 - 127.82)/22
     Header Dept: X=750, Y=72
     Footer Auditor: X=450, Y=552

5. **Execution & Validation**:
   - Write `build_phase2_runner.py` and run `python build_phase2_runner.py` to ensure `FM-ML01-ML-05.html`, `FM-ML01-ML-06.html`, and `FM-PD01-PD-01.html` are created properly and non-empty.
