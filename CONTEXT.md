# CONTEXT.md — ความจริงล่าสุดของโปรเจกต์ (Single Source of Truth)

> **กฎเหล็ก**: AI และผู้พัฒนาทุกคนต้องอ่านไฟล์นี้ควบคู่กับ `COLLABORATION_RULES.md` และตรวจสอบ `_lock/current.md` ก่อนเริ่มงานทุกครั้ง

---

## 1. ข้อมูลภาพรวมโปรเจกต์ (Project Overview)
- **ชื่อระบบ**: **ESC Machine Inspection Center** (ระบบตรวจสอบเครื่องจักรออนไลน์แบบศูนย์กลาง)
- **องค์กร**: **บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน)** — *Eastern Sugar & Cane Public Company Limited (ES Group)* (`https://www.esgroup.co.th/th/home`)
- **รูปแบบการใช้งาน (Dual-Mode Architecture)**:
  1. **Standalone HTML Mode (ไม่ต้องรัน Server)**: เปิดไฟล์ `index.html` ผ่าน `file://` ข้อมูลเก็บใน IndexedDB (`ESC_COMIS_V3`) ย้าย LocalStorage เดิมโดยเก็บต้นฉบับไว้ และไม่ส่งเข้าฐานกลางอัตโนมัติ
  2. **Full-Stack Server Mode (LAN / Multi-Device)**: ใช้ Node.js 22.13+ (`node server.js` หรือ `node start-comis.js`) และ SQLite ที่ `data/comis.db` ต้องล็อกอินด้วยบัญชีส่วนตัว รองรับคิวใบตรวจ/แบบร่างออฟไลน์และตรวจ revision ก่อนเขียน
- **อัตลักษณ์องค์กร (Corporate Identity - ES Group)**:
  - **Logo**: `https://www.esgroup.co.th/images/logo-v2.png`
  - **Favicon**: `https://www.esgroup.co.th/images/favicon.ico`
  - **Color Palette**:
    - Primary Green: `#1f760e`
    - Secondary Green: `#5c9f06`
    - Accent Lime: `#8ce617`
    - Dark Forest Sidebar: `#0f2e09`
    - Warm Cream Surface: `#f7faf5`
  - **Typography**: Google Fonts `Kanit` + `JetBrains Mono`

---

## 2. โครงสร้างไฟล์และข้อจำกัดด้านเทคนิคบน OneDrive (File Map & Constraints)

### โครงสร้างไฟล์ปัจจุบัน
```text
/project-root
  ├── COLLABORATION_RULES.md      ← กฎเหล็กการทำงานร่วมกันของ AI/ทีม (ห้ามฝ่าฝืน)
  ├── CONTEXT.md                  ← ไฟล์นี้: ความจริงล่าสุด, สถานะระบบ, ประวัติเวอร์ชัน และแผน v2.0
  ├── _lock/
  │   └── current.md              ← สถานะการล็อกไฟล์ก่อนแก้ไข (## LOCKED / ## FREE)
  ├── logs/
  │   ├── 2026-09-25_ai-antigravity.md             ← บันทึกการทำงานแบบ Append-only ของ Antigravity AI
  │   └── 2026-09-25_codex_FACTORY_3D_CONCEPT_FOR_AGY.md ← เอกสารสเปก 3D Factory World
  ├── docs/                       ← เอกสาร Spec / Requirements (อ่านอย่างเดียว ห้าม AI แก้เอง)
  ├── index.html                  ← หน้าเว็บหลัก (เปิดตรงแบบ Standalone ได้ทันที)
  ├── server.js                   ← Backend API Server (Node.js HTTP + REST API + Audit Undo Snapshot)
  ├── start-comis.js              ← สคริปต์ช่วยรัน Server (ใช้แทน .bat เพื่อไม่ให้ติด OneDrive Sync)
  ├── package.json                ← นิยามโปรเจกต์ Node.js (Zero external dependencies)
  ├── src/
  │   └── db.js                   ← โมดูลฐานข้อมูล SQLite (`node:sqlite`) + Seed Data โรงงานน้ำตาล
  ├── data/
  │   └── comis.db                ← ไฟล์ฐานข้อมูล SQLite (Journal Mode = DELETE)
  └── public/
      ├── index.html              ← หน้าเว็บสำหรับโหมดรันผ่าน Server
      ├── assets/
      │   └── factory/
      │       ├── esc-aerial-reference.jpg ← ภาพถ่ายมุมสูงโรงงานจริงสำหรับอ้างอิงโซน 3D
      │       ├── esc-ui-reference.png     ← ภาพต้นแบบ UI 3D Diorama
      │       ├── three.r128.min.js        ← Three.js r128 (Local Offline Bundle)
      │       └── THREE_LICENSE.txt        ← ใบอนุญาต MIT ของ Three.js
      ├── css/
      │   ├── custom.css          ← สไตล์ชีตธีม ES Group, ปุ่มสัมผัส, ลายเซ็น, และ Print Layout
      │   └── factory-overview.css← สไตล์ชีตเฉพาะหน้า 3D Factory World (`.esc-*` / `.f3d-*`)
      └── js/
          ├── factory-map-config.js ← พิกัดโซนโรงงาน 8 โซน, พาเลตสี 3D, และ Machine Placements
          ├── factory-3d-scene.js   ← โมดูล Three.js Orthographic Diorama + 2D Interactive SVG Fallback
          ├── factory-overview.js   ← คอนโทรลเลอร์หน้า "ภาพรวมโรงงาน 3D", ตัวกรอง, Drawer, และแก้ไขพิกัด 3D
          ├── app.js                ← Core Engine, LocalStorage DB (`ESC_COMIS_CENTER_DB_V2`), Dashboard, Inspection Form
          └── views-and-crud.js     ← Defect/F-Tag, History/Approval, Form Builder, Machine/Dept/User CRUD, Audit Log & Undo Center
```

### ⚠️ ข้อจำกัดสำคัญของ OneDrive (ห้ามฝ่าฝืน)
1. **ห้ามสร้างไฟล์ `.bat`, `.cmd`, `.exe`, `.vbs` หรือนามสกุลที่ OneDrive บล็อก**: เคยสร้าง `start-comis.bat` แล้วทำให้ OneDrive ซิงค์ไม่ผ่าน (ขึ้นกากบาทสีแดง) จึงเปลี่ยนมาใช้ `start-comis.js` แทน
2. **SQLite Journal Mode ต้องเป็น `DELETE`**: ใน `src/db.js` ตั้งค่า `PRAGMA journal_mode = DELETE;` แทน `WAL` เพื่อป้องกันไม่ให้เกิดไฟล์ `.db-shm` และ `.db-wal` ค้างระหว่างที่ OneDrive กำลังซิงค์

---

## 3. ประวัติการแก้ไขและปรับปรุงเวอร์ชัน (Version Changelog)

### **v3.0.2** — `2026-10-06` (Data Center Hub Accounts)
- Hub ที่ `/inspection-forms/data-center.html` ใช้บัญชีและ session ของ COMIS เดิม เพิ่มหน้าจัดการผู้ใช้สำหรับ `super_admin` เท่านั้น
- Admin เพิ่ม/แก้ผู้ใช้ มอบหมายกลุ่มงาน (ใช้แผนกเดิม `department_id`) ตำแหน่ง `position` และสิทธิ์ `role` แยกกัน พร้อมตั้งรหัสผ่านชั่วคราว
- การตั้งค่ากลาง Hub เก็บใน SQLite ผ่าน `/api/hub-settings` ตรวจสิทธิ์ฝั่งเซิร์ฟเวอร์และ revision ป้องกันบันทึกทับกัน; สำเนา LocalStorage ใช้กับฟอร์มเดิม
- ตำแหน่งงานเป็นข้อมูลบุคลากร ไม่เพิ่มสิทธิ์อนุมัติอัตโนมัติ; สิทธิ์ยังอิง `role` ของระบบเดิม
- GitHub Pages / เปิดไฟล์ตรงแสดงโหมดอิสระ ไม่มีระบบบัญชีกลางและซ่อนเมนูบริหาร ต้องรัน Node.js เพื่อใช้บัญชีร่วมกัน
- ผลตรวจในฟอร์ม standalone และคลัง HTML ที่เพิ่มเองยังเก็บในเบราว์เซอร์ ไม่ได้เพิ่มการซิงค์ผลตรวจหรือกลไกล็อกสิทธิ์ในไฟล์ฟอร์มอิสระ
- ทดสอบ API 13 กรณี และ browser flow บน Edge (เพิ่ม/แก้ผู้ใช้ ตั้ง/เปลี่ยนรหัสผ่าน ตั้งค่ากลาง สิทธิ์ผู้ใช้ หน้าจอมือถือ และ file mode) โดยใช้ฐานชั่วคราว

### **v3.0.1** — `2026-10-01` (Source Document Recording Forms)
- ผู้ใช้ให้สิทธิ์อ่านโฟลเดอร์ `02.ลูกหีบ-SP/03.เอกสาร/18.เอกสารบันทึก` แต่ห้ามแก้ไขต้นฉบับ ตรวจ SHA-256 ครบ 59 ไฟล์แล้วไม่เปลี่ยน
- เพิ่ม `public/source-forms.html`, `public/js/source-forms.js`, `public/css/source-forms.css` และคลังเอกสาร PDF 56/Excel 3 ไฟล์ มีแบบบันทึก 39 แบบและเอกสารอ้างอิง 20 ไฟล์ เข้าจากเมนูแบบฟอร์ม
- เพิ่ม `src/source-records.js` และตาราง `source_form_records` เก็บผลแบบ append-only แยกจากใบตรวจหลัก พร้อมบัญชีจริง, เวลาไทย, source hash, template snapshot, request ID ป้องกันผลซ้ำ
- เอกสารต้นฉบับ API อ่านได้เท่านั้นและต้องล็อกอิน ไม่มีเส้นทางแก้ไขไฟล์ แบบร่าง/ผล standalone อยู่ใน IndexedDB `ESC_SOURCE_RECORDS_V1`; หน้าใหม่ต้องออนไลน์เพื่อโหลดบัญชี/คลังเอกสารในโหมดเซิร์ฟเวอร์
- ทดสอบทุกฟอร์ม 39 แบบ, การบันทึกสองโหมด, แบบร่าง, ส่งซ้ำ, สิทธิ์, ต้นฉบับอ่านอย่างเดียว และแท็บเล็ตใน `tests/source-forms-check.js` ไม่ deploy และไม่แก้ business records เดิมใน SQLite

### **v3.0.0** — `2026-10-01` (Reliability, Authentication & Offline Upgrade)
- **ผู้ดำเนินการ**: Codex — ผู้ใช้อนุญาตให้แก้ครบทั้ง 12 ข้อ
- แก้ API method, snapshot, CSV transaction และคอลัมน์ CSV ที่ไม่ตรง schema รวมถึงฟอร์มตั้งต้นที่อ้างแผนกเก่า
- เพิ่มล็อกอิน scrypt/HttpOnly session, สิทธิ์ที่ API, ผู้ทำรายการจากบัญชีจริง และตั้งรหัสผ่านชั่วคราวโดยผู้ดูแล
- ใช้ IndexedDB และคิวรอส่งแยกจากฐานกลาง ส่งซ้ำด้วย idempotency key ไม่ fallback เมื่อ API ปฏิเสธข้อมูล
- Transaction ครอบคลุมใบตรวจ สถานะเครื่อง ใบซ่อม สายตรวจ เลขเอกสาร และ Audit; Undo เฉพาะแถวที่ยังไม่ถูกแก้ต่อ
- เลขเอกสารเปลี่ยนตามเดือนเวลาไทยและไม่ใช้ COUNT; ตรวจฉุกเฉินไม่ปิดจุดสายตรวจ; ปิดงานซ่อมต้องมีผู้ยืนยันและรายละเอียด
- QR กล้อง/กรอกรหัส/ป้ายเดิม, ไลบรารีและฟอนต์ภายในเครื่อง, Service Worker ที่แจ้งรุ่นใหม่
- แยกโมดูล backend/read model/CSV และ frontend/inspection/standalone/table; ใช้กฎตรวจข้อมูลร่วมใน domain.js
- สำรองรายวันและตรวจ integrity พร้อม CLI กู้คืนที่เก็บฐานเดิมไว้
- ดูขั้นตอนตั้งบัญชี HTTPS และกู้คืนใน `README.md` พร้อมแผนผังไฟล์ใหม่
- ทดสอบด้วยฐานใหม่และสำเนาฐานเดิมเท่านั้น ไม่ได้ตั้งรหัสผ่านบัญชีจริงหรือ deploy production

### **v2.15.0** — `2026-09-28` (Responsive UI Layout & Users/Settings View Overhaul)
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `public/js/views-and-crud.js`, `public/css/custom.css`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายละเอียดการแก้ไข**:
  1. **ปรับปรุงโครงสร้าง UI หน้า "จัดการผู้ใช้งาน & ตั้งค่าการแจ้งเตือน" (`renderUsersAndSettings`)**:
     - แก้ไขแท็กปิด `<div>` ที่ไม่สมบูรณ์บริเวณแถบเครื่องมือปุ่มจัดการผู้ใช้งาน
     - ปรับโครงสร้างเลย์เอาต์จากเดิมที่แบ่งคอลัมน์ `grid-cols-3` (ตารางกิน 2 ใน 3 ส่วนทำให้เนื้อหาถูกบีบอัดและล้นจอ) ให้เป็น **Stacked Full-Width Cards (`space-y-6`)**:
       - **การ์ดที่ 1 (ความกว้างเต็ม 100%)**: ตารางรายชื่อผู้ใช้งานและช่างเทคนิค (`tbl-users-list`) พร้อมกำหนดขนาดคอลัมน์เริ่มต้นที่กว้างขวางสบายตา (รหัสพนักงาน 130px, ชื่อ-สกุล 250px, ฝ่าย 180px, แผนก 220px, สิทธิ์ 150px, จัดการ 140px)
       - **การ์ดที่ 2 (ความกว้างเต็ม 100%)**: ส่วนตั้งค่าระบบกลางและการแจ้งเตือน Telegram (Telegram Settings) จัดวางฟอร์มเป็นตารางกริด 3 คอลัมน์ (`md:grid-cols-3`) สำหรับชื่อองค์กร, Token และ Chat ID อย่างเป็นระเบียบสวยงาม
  2. **ปรับปรุงอัลกอริทึมคำนวณ Auto-Fit ตาราง (`autoFitTableColumns`)**:
     - เพิ่มการสุ่มวัดความกว้างเนื้อหาจริงจากแถวข้อมูลใน `tbody` ร่วมกับขนาดของหัวตาราง `th` เพื่อให้คอลัมน์ที่มีชื่อ-นามสกุล หรือชื่อฝ่าย/แผนกยาวๆ ได้รับการคำนวณขนาดที่พอดีอย่างแท้จริง
     - ปลด `!important` จาก `table-layout: fixed;` ใน `custom.css` เพื่อให้การสลับโหมดเป็น `table-layout: auto;` ชั่วคราวขณะวัดผลความกว้างทำงานได้อย่างแม่นยำทุกเบราว์เซอร์
  3. **ปรับแต่ง Typography และระยะขอบตารางใน `public/css/custom.css`**:
     - เพิ่ม `padding-right: 14px !important;` ให้กับหัวคอลัมน์ตาราง เพื่อป้องกันไม่ให้ปุ่ม Resizer Handle ซ้อนทับตัวหนังสือ
     - กำหนดให้เนื้อหาข้อความในตาราง wrap บรรทัดใหม่อย่างเป็นระเบียบเมื่อคอลัมน์ถูกปรับขยาย

### **v2.14.0** — `2026-09-28` (Historical — Auto-Fit Table Columns Shortcut)
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `public/js/views-and-crud.js`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายละเอียดการแก้ไข**:
  1. **เพิ่มปุ่มลัด "📐 ปรับตารางพอดี" (Auto-Fit Columns Shortcut)**:
     - ในหน้า **ทะเบียนเครื่องจักรหลักและชิ้นส่วนย่อย (Machine Master Data)** เพิ่มปุ่มลัด `📐 ปรับตารางพอดี` บนแถบเครื่องมือข้างปุ่ม "คืนค่าขนาดคอลัมน์"
     - พัฒนาฟังก์ชัน `autoFitTableColumns(tableKey, tableId)`:
       - วัดขนาดธรรมชาติ (Natural Width) ของแต่ละคอลัมน์ตามขนาดเนื้อหาจริงและชื่อหัวตาราง
       - เปรียบเทียบกับความกว้างหน้าจอ/คอนเทนเนอร์ปัจจุบัน หากมีพื้นที่เหลือ จะทำการคำนวณและเกลี่ยสัดส่วนความกว้างให้พอดี 100% เต็มหน้าจอโดยอัตโนมัติ
       - บันทึกค่าความกว้างใหม่ลงใน `localStorage` ทันที เพื่อจำค่าไว้เมื่อเปิดใช้งานครั้งต่อไป
       - แสดงการแจ้งเตือน Toast `📐 ปรับขนาดคอลัมน์ตารางพอดีหน้าจอและเนื้อหาแล้ว`
  2. **เพิ่มปุ่มลัด "📐 ปรับตารางพอดี" ในตารางผู้ใช้งานและสิทธิ์ (Users List)**:
     - เพิ่มปุ่มลัด `📐 ปรับตารางพอดี` ในตาราง `tbl-users-list` เพื่อความสะดวกและเป็นมาตรฐานเดียวกันทั้งระบบ

### **v2.13.0** — `2026-09-28` (Comprehensive UX/UI Upgrade & Field Optimization)
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `public/js/app.js`, `public/js/views-and-crud.js`, `public/css/custom.css`, `public/sw.js`, `public/index.html`, `index.html`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายละเอียดการแก้ไข**:
  1. **ระบบบีบอัดรูปถ่ายหน้างานอัตโนมัติ (Client-Side Image Compression)**:
     - เพิ่มฟังก์ชัน `compressImageFile` ย่อขนาดภาพให้กว้างสูงสุดไม่เกิน 1,280 px และบีบอัด JPEG คุณภาพ 0.75 ผ่าน Canvas
     - ป้องกันปัญหา `QuotaExceededError` ใน `localStorage` 100% โดยลดขนาดไฟล์รูปภาพเหลือเพียง 100–250 KB
     - เพิ่มปุ่มดูรูปขนาดใหญ่ (`🔍 ดูรูป`) และปุ่มลบรูปภาพ (`✕ ลบ`) พร้อมแสดงขนาดไฟล์ KB ชัดเจน
  2. **ปุ่มทางลัดตรวจผ่านอัตโนมัติในหน้าตรวจเช็ค (Inspection Speed Bar Buttons)**:
     - เพิ่มปุ่ม **"🟢 ผ่านปกติทุกข้อ (Mark All Normal)"**: ตั้งค่าทุกหัวข้อเป็นปกติทันทีใน 1 คลิก (รวมค่าตัวเลขตามเกณฑ์ปกติหรือค่าเดิม)
     - เพิ่มปุ่ม **"↺ ล้างคำตอบ"**: เพื่อให้ช่างสามารถรีเซ็ตค่าในฟอร์มตรวจเช็คทั้งหมดกลับเป็นค่าว่างได้อย่างสะดวก
  3. **รองรับ Touch Event สำหรับการปรับขนาดคอลัมน์ตารางบน iPad / Tablet (Touch Resizing)**:
     - เพิ่ม `touchstart`, `touchmove`, `touchend`, `touchcancel` ใน `makeTableResizable`
     - กำหนด `touch-action: none` บน `.col-resizer` ทำให้ช่างหน้างานใช้นิ้วลากปรับขนาดคอลัมน์บนจอสัมผัสได้ลื่นไหล
  4. **จัดกลุ่มตัวเลือกผู้ใช้งานใน Dropdown ด้วย `<optgroup>`**:
     - แยกกลุ่มผู้ดูแลระบบ (`⚙️ ผู้ดูแลระบบศูนย์กลาง`), ช่างแผนกลูกหีบ (`🏭 แผนกลูกหีบ (ML)` 23 ท่าน), และแผนกอื่นๆ
     - ปรับขนาดกล่องผู้ใช้งานมุมล่างซ้ายให้ยืดหยุ่นบนจอมือถือขนาดเล็ก
  5. **เพิ่ม Search Debounce ในการค้นหาตารางเครื่องจักร**:
     - หน่วงเวลา 180ms เพื่อป้องกันการ re-render ถี่เกินไปเมื่อพิมพ์ค้นหาเร็วๆ พร้อมรักษาระดับ Focus ของเคอร์เซอร์
  6. **การยศาสตร์โรงงาน & โหมดคมชัดสูง (Factory Ergonomics & High Contrast)**:
     - กำหนด `min-width: 55px` และตัดคำด้วย `text-overflow: ellipsis` ในหัวตาราง
     - ปรับความสูงขั้นต่ำของปุ่มสัมผัสเป็น 48px และขอบหนา 2px ใน `body.tablet-field-mode`
  7. **ระบบ Offline Service Worker (`public/sw.js`)**:
     - แคชไฟล์ Assets หลักเพื่อให้เปิดระบบทำงานต่อได้ทันทีแม้สัญญาณอินเทอร์เน็ตขาดหายในจุดอับของโรงงาน

### **v2.12.0** — `2026-09-28` (Resizable Table Columns & Official Technician Roster Import)
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `public/css/custom.css`, `public/js/views-and-crud.js`, `public/js/app.js`, `src/db.js`, `server.js`, `data/comis.db`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายละเอียดการแก้ไข**:
  1. **ระบบปรับขนาดคอลัมน์ของตาราง (Resizable Table Columns) พร้อมจำค่าลง LocalStorage**:
     - เพิ่มเอนจิน `makeTableResizable(tableEl, tableKey)` และการคำนวณตำแหน่งเมาส์ลากเส้นคั่นหัวคอลัมน์ (`.col-resizer`) อย่างลื่นไหล
     - จดจำความกว้างคอลัมน์ที่ผู้ใช้ปรับแต่งลงใน `localStorage` (`esc_comis_table_col_widths_v1`) อัตโนมัติแยกตามตาราง
     - ใช้งานกับตารางสำคัญ 3 หน้า:
       - **ตารางทะเบียนเครื่องจักร (`tbl-machines-master`)** พร้อมปุ่ม "คืนค่าขนาดคอลัมน์"
       - **ตารางประวัติผลการตรวจเช็ค (`tbl-inspections-history`)** พร้อมปุ่ม "คืนค่าขนาดคอลัมน์"
       - **ตารางผู้ใช้งานและสิทธิ์ (`tbl-users-list`)** พร้อมปุ่ม "คืนค่าขนาด"
     - สไตล์ชีต `.table-resizable`, `.col-resizer`, `.col-resizer:hover`, `body.resizing-col` ใน `public/css/custom.css`
  2. **นำเข้ารายชื่อช่างตรวจเช็คจริง 23 คน สังกัดแผนกลูกหีบ (ML)**:
     - ใช้ **รหัสพนักงาน** (เช่น `629315`) เป็นตัวตนระบุผู้ใช้ (Username / User Identifier / `emp_code`) ตามคำสั่งผู้ใช้
     - รายชื่อช่าง 23 คน: `629315` (บุญชู งวดสูงเนิน), `659170` (ทินกร ทองอาบ), `619279` (จรุนันท์ ประจิตร), `629011` (ศุภมิตร สีคันทา), `629273` (ศักดิ์รินทร์ คำภักดี), `669084` (สหัสวรรษ ผิวผ่อง), `629302` (สมชาย มีมุข), `629328` (ไพรวัลย์ มีระหันนอก), `639152` (สมนึก ใจดี), `659246` (สุรกันต์ ช้างน้อย), `649073` (วุฒิพงษ์ นนทะคำจันทร์), `659096` (รัฐพล แก้วสุวรรณ์), `669041` (รัชชานนท์ องอาจ), `669199` (พิชิตตมาร คำกลาง), `679047` (มารุต บุญค้ำชู), `679046` (ธณกฤษ ท้าวธงชัย), `689094` (ธนพล กันเย็น), `689109` (พิชิต สุทธิศิริ), `699042` (ดนัย พินยารัตน์), `699043` (ศุภฤกษ์ ซีกพุดซา), `699127` (วิทยา สาระคำ), `679191` (สมฤทัย พูลผล), `698014` (อริยธรรม ขันคำ-นศ.ฝึกงาน)
     - ซิงค์เข้าฐานข้อมูล SQLite (`src/db.js` -> `syncOfficialTechnicianUsersSqlite`) และ Standalone LocalStorage (`public/js/app.js` -> `syncOfficialTechniciansInRaw`)
     - ปรับ Dropdown ผู้ใช้ (`#current-user-select`) ให้แสดงรูปแบบ `[รหัสพนักงาน] ชื่อ-สกุล (แผนก)`
     - แก้ไขคำสั่ง SQL ใน CSV Import ของ `server.js` ให้ตรงกับ schema ของตาราง `users`

### **v2.11.0** — `2026-09-28` (Factory Shift Standardization: 2 Shifts — Day & Night)
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `src/db.js`, `server.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `data/comis.db`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายละเอียดการแก้ไข**:
  1. **ปรับรอบกะการทำงานของโรงงานเป็นระบบ 2 กะ (12 ชม./กะ) ตามมาตรฐานจริงของโรงงาน**:
     - **☀️ กะเช้า (Day Shift)**: เวลา `07:00 - 19:00 น.`
     - **🌙 กะดึก (Night Shift)**: เวลา `19:00 - 07:00 น.`
  2. **อัปเดตหน้าจอแบบฟอร์มบันทึกการตรวจเช็คเครื่องจักร (`onChangeInspectForm` / Session Modal)**:
     - ปรับ Dropdown ข้อ `3. กะการทำงาน (Working Shift)` ให้เหลือ 2 ตัวเลือก:
       - `☀️ กะเช้า (07:00 - 19:00 น.)`
       - `🌙 กะดึก (19:00 - 07:00 น.)`
  3. **อัปเดตระบบสายเดินตรวจและรอบตรวจแบบทีม (`inspection_routes` & `route_rounds`)**:
     - ปรับหน้าต่างสร้าง/แก้ไขสายเดินตรวจ (`openRouteModal`) และการบันทึก (`saveRouteModal`) ให้กำหนดช่วงเวลาเดินตรวจ 2 กะ (กะเช้า: `07:30 - 09:30 น.`, กะดึก: `19:30 - 21:30 น.`)
     - ปรับหน้าต่างเปิดรอบตรวจประจำกะ (`startRouteRoundModal`) และ `submitStartRouteRound` ให้แสดงและใช้ค่าเริ่มต้นตามระบบ 2 กะ
  4. **ซิงค์ฐานข้อมูล SQLite (`src/db.js`, `data/comis.db`) และ Backend Server (`server.js`)**:
     - อัปเดต `syncOfficialMillingMachinesSqlite` ให้ตารางสายเดินตรวจ `RT-ML-01` ใช้โครงสร้าง 2 กะ (กะเช้า 07:00-19:00 และกะดึก 19:00-07:00)
     - อัปเดตค่าเริ่มต้นของคอลัมน์ `shift` ในตาราง `inspections` และ `route_rounds`
  5. **อัปเดตเทมเพลต CSV (`CSV_TEMPLATE_CONFIGS`) ใน `public/js/views-and-crud.js`**:
     - อัปเดตตัวอย่างข้อมูลสายเดินตรวจและเครื่องจักรให้สะท้อนกะ `กะเช้า (07:00-19:00)`

### **v2.10.0** — `2026-09-28` (Streamlined to 3 Core Engineering & Production Divisions, 10 Operational Departments)
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `src/db.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `data/comis.db`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายละเอียดการแก้ไข**:
  1. **ตัด 3 กลุ่มฝ่ายสนับสนุนออกชั่วคราวตามคำขอของผู้ใช้ (User Request 2026-09-28)**:
     - ตัด **ฝ่ายระบบมาตรฐานและคุณภาพ** (3 แผนก: `QS` แผนกระบบมาตรฐาน, `QA` แผนกประกันคุณภาพ, `LB` แผนกวิเคราะห์คุณภาพ)
     - ตัด **ฝ่ายจัดการสิ่งแวดล้อมและความปลอดภัย** (2 แผนก: `EV` แผนกสิ่งแวดล้อม, `SF` แผนกความปลอดภัยและอาชีวอนามัย)
     - ตัด **ฝ่ายคลังสินค้า** (2 แผนก: `WH` แผนกคลังพัสดุ, `SW` แผนกคลังน้ำตาล)
  2. **คงเหลือเฉพาะ 3 กลุ่มฝ่ายหลักสายการผลิตและวิศวกรรม รวม 10 แผนกปฏิบัติการ**:
     - **ฝ่ายผลิต (PD)**: `EP` (แผนกหม้อต้ม), `VP` (แผนกหม้อเคี่ยว), `CF` (แผนกหม้อปั่น), `WP` (แผนกระบบน้ำ)
     - **ฝ่ายวิศวกรรมจักรกล (EN)**: `ML` (แผนกลูกหีบ), `MA` (แผนกเครื่องกลซ่อมบำรุง), `EBL` (แผนกหม้อไอน้ำ)
     - **ฝ่ายวิศวกรรมไฟฟ้า (EE)**: `EM` (แผนกไฟฟ้าซ่อมบำรุง), `ME` (แผนกอุปกรณ์เครื่องมือวัด), `EPP` (แผนกไฟฟ้าผลิต)
  3. **ระบบ Auto-Migration รองรับทั้ง SQLite (`src/db.js`) และ Standalone LocalStorage (`public/js/app.js`)**:
     - อัปเดต `OFFICIAL_FACTORY_DEPARTMENTS` เหลือ 10 แผนก
     - ซิงค์และลบแผนกที่ถูกตัดออกจากตาราง `departments` ใน `data/comis.db` พร้อมรีแมปฟอร์ม `FRM-SAFE-001` ไปที่ `MA` (แผนกเครื่องกลซ่อมบำรุง) ป้องกัน Foreign Key เสียหาย
     - อัปเดต `LEGACY_CODE_MAP` ให้ครอบคลุมแผนกที่ตัดออก
  4. **อัปเดตหน้าจัดการแผนก (`renderDepartments`) และคำอธิบายเทมเพลต CSV (`CSV_TEMPLATE_CONFIGS`) ให้ระบุ 10 แผนกชัดเจน**

### **v2.9.0** — `2026-09-28` (Added Pending Repair & Under Repair Statuses)
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `public/js/views-and-crud.js`, `public/js/app.js`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายละเอียดการแก้ไข**:
  1. **เพิ่มสถานะ `รอซ่อม` (`pending_repair`) และ `อยู่ระหว่างการซ่อม` (`under_repair`) ในสถานะการเดินเครื่องของเครื่องจักร (Operating State)**:
     - อัปเดตฟังก์ชัน `getOperatingBadge(opState)` ใน `public/js/app.js` ให้แสดง Badge:
       - `⏳ รอซ่อม` (`pending_repair`) โทนสี Amber
       - `🛠️ อยู่ระหว่างการซ่อม` (`under_repair` / `maintenance`) โทนสี Rose
     - เพิ่มปุ่มกดเลือกสถานะ `⏳ รอซ่อม` และ `🛠️ ระหว่างซ่อม` ในหน้าจอแบบฟอร์มตรวจเช็คเครื่องจักร (`onChangeInspectOperatingState`)
     - เพิ่มตัวเลือกใน Dropdown หน้าต่างเพิ่ม/แก้ไขเครื่องจักร (`openMachineModal` -> `#m-opstate`)
     - เพิ่มตัวกรอง Dropdown `ทุกการเดินเครื่อง` ในหน้าทะเบียนเครื่องจักร (`renderMachines`) สามารถกรองดูเฉพาะเครื่องที่ `รอซ่อม` หรือ `ระหว่างซ่อม` ได้ทันที
  2. **เพิ่มสถานะ `รอซ่อม` (`pending_repair`) และ `อยู่ระหว่างการซ่อม` (`under_repair`) ในระบบกระดานแจ้งซ่อม F-Tag (Defect Tracking)**:
     - อัปเดต `statusMap` และตัวกรอง `#defect-status-filter` ใน `public/js/views-and-crud.js`
     - เพิ่มตัวเลือกใน Dropdown สถานะการซ่อมในหน้าต่างอัปเดตใบแจ้งซ่อม (`openDefectModal` -> `#def-status`)
  3. **อัปเดตเทมเพลต CSV และตัวอย่างการนำเข้าข้อมูล**:
     - อัปเดต `CSV_TEMPLATE_CONFIGS.machines` ให้มีตัวอย่างรหัสเครื่องจักรทางการและระบุสถานะ `pending_repair` / `under_repair`

### **v2.8.1** — `2026-09-28`
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `public/js/views-and-crud.js`, `public/js/app.js`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายละเอียดการแก้ไข**:
  1. **ปรับการแสดงผลคอลัมน์ `Class` ในตารางทะเบียนเครื่องจักรให้สั้นกระชับ**:
     - แสดงเฉพาะตัวอักษรระดับความสำคัญ เช่น `A`, `B`, `C` (แทนคำเดิม `Class A`, `Class B`, `Class C`) เพื่อให้ตารางอ่านง่าย ประหยัดพื้นที่ และสบายตา
     - ปรับการแสดงผล Badge บนการ์ดเครื่องจักรในหน้าภาพรวมให้สอดคล้องกัน

### **v2.8.0** — `2026-09-28` (Official Machine Hierarchy Codes for Milling Department `ML`, TUR & SHR Separation)
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `src/db.js`, `public/js/app.js`, `public/js/factory-map-config.js`, `data/comis.db`, `CONTEXT.md`
- **รายละเอียดการแก้ไข**:
  1. **นำเข้ารหัสเครื่องจักรทางการระดับเครื่องจักร (D–F) จากเอกสารสรุปของ Codex (`logs/2026-09-28_codex_MACHINE_SUMMARY_FOR_AGY.md`)**:
     - อ้างอิงจากไฟล์ Excel ต้นฉบับ `250503 Machine hierarchy ชิ้นส่วนเครื่องจักรแผนกลูกหีบ ทั้งหมด.xlsx`
     - นำเข้าครบทั้ง 21 รายการยืนยันจากตารางหัวข้อ 3 และขยายรหัสมาตรฐานแบบเดียวกันให้กับเครื่องจักรที่เหลือในแผนกลูกหีบรวม 41 รายการ
  2. **แยกรายการ `TUR` และ `SHR` เป็นคนละเครื่องจักรตามข้อยืนยันผู้ใช้ (User Confirmed 2026-09-28)**:
     - `ML-TUR-01`: เทอร์ไบน์ขับเชร็ดเดอร์ (Turbine for Heavy Duty Shredder)
     - `ML-SHR-01`: เครื่องเชร็ดเดอร์ (Heavy Duty Shredder)
     - แยกตัวตนและประวัติการตรวจเช็คออกจากกันโดยเด็ดขาด ไม่รวมเป็นเครื่องเดียวกัน
  3. **กำหนดรหัสทางการระดับเครื่องจักร (D–F) ทั้ง 41 เครื่องของแผนกลูกหีบ**:
     - กลุ่มดั๊มพ์ & ไฮดรอลิก: `ML-TTP-01`, `ML-TTP-02`, `ML-TTP-03`, `ML-PUN-01`
     - กลุ่มตะกาว & สะพานดั๊มพ์: `ML-CAR-01`, `ML-CAR-02`, `ML-SCC-01`, `ML-LFS-01`, `ML-SND-01`, `ML-SND-02`, `ML-KCK-01`, `ML-KCK-02`
     - กลุ่มสะพานเมน & มีดสับ: `ML-MCC-01`, `ML-PCT-01`, `ML-CUT-01` ถึง `ML-CUT-04`, `ML-LFM-01`, `ML-KCK-03`
     - กลุ่มเชร็ดเดอร์ & สายพานยาง: `ML-MAS-01`, `ML-TUR-01`, `ML-SHR-01`, `ML-SHE-01`, `ML-HSB-01`, `ML-MAS-02`, `ML-LFH-01`
     - กลุ่มสะพานข้ามชุด สกรีน & ลูกหีบ: `ML-INT-01` ถึง `ML-INT-03`, `ML-RSC-01`, `ML-SCY-01`, `ML-MIL-02` ถึง `ML-MIL-05`
     - กลุ่มเครน & รอกไฟฟ้า: `ML-CRN-01` ถึง `ML-CRN-03`, `ML-OHC-10`, `ML-OHC-11`
  4. **อัปเดตระบบซิงค์อัตโนมัติ SQLite (`data/comis.db`), Standalone LocalStorage (`public/js/app.js`), ผัง 3D (`factory-map-config.js`) และสายเดินตรวจ `RT-ML-01`**:
     - ล้างรหัสชั่วคราว `ML-01` ถึง `ML-38` ออก และแทนที่ด้วยรหัสทางการ 41 รายการ พร้อมอัปเดตจุดตรวจ 41 จุดในสายเดินตรวจ `RT-ML-01`

### **v2.7.1** — `2026-09-28`
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `server.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `CONTEXT.md`
- **รายละเอียดการแก้ไข**:
  1. **เพิ่มคอลัมน์ `ฝ่าย (Division)` ในตารางหลักของระบบ (`public/js/views-and-crud.js`)**:
     - **หน้าทะเบียนเครื่องจักร (`renderMachines`)**: เพิ่มคอลัมน์ `ฝ่าย (Division)` แยกชัดเจนคู่กับ `แผนกที่ดูแล / พื้นที่ติดตั้ง` พร้อมเพิ่มตัวกรอง Dropdown `📂 ทุกฝ่าย (All Divisions)` และการค้นหาด้วยชื่อฝ่าย
     - **หน้าประวัติและอนุมัติผล (`renderHistory`) & ใบรายงาน PDF (`openInspectionReportModal`)**: เพิ่มคอลัมน์และช่องแสดง `ฝ่าย (Division)`
     - **หน้าจัดการผู้ใช้งาน (`renderUsersAndSettings`)**: เพิ่มคอลัมน์ `ฝ่าย (Division)` ก่อนคอลัมน์ `แผนก`
     - **หน้าต่างเพิ่ม/แก้ไขเครื่องจักร (`openMachineModal`) และป้าย QR Code (`openMachineQRModal`)**: แสดง `สังกัดฝ่าย: 📂 ...` อัปเดตอัตโนมัติตามแผนกที่เลือก
  2. **เพิ่มคอลัมน์ `ฝ่าย` ในไฟล์ส่งออก CSV (`exportMachinesCSV` และ `exportInspectionsCSV`)**:
     - ส่งออกข้อมูลคอลัมน์ `ฝ่าย` คู่กับ `แผนก` ในไฟล์ Excel/CSV
  3. **ซิงค์ฟิลด์ `division_name` (`d.plant_name`) ครบทั้งโหมด Server (`server.js`) และโหมด Standalone (`public/js/app.js`)**

### **v2.7.0** — `2026-09-28`
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `src/db.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `public/js/factory-overview.js`, `data/comis.db`, `CONTEXT.md`
- **รายละเอียดการแก้ไข**:
  1. **แยกเฉพาะรายชื่อ `แผนก` ทั้ง 17 แผนกปฏิบัติการ (`EP`, `VP`, `CF`, `WP`, `ML`, `MA`, `EBL`, `EM`, `ME`, `EPP`, `QS`, `QA`, `LB`, `EV`, `SF`, `WH`, `SW`)**:
     - ถอดรหัสที่เป็นระดับ `ฝ่าย` หรือ `สายงาน` (`PD`, `EN`, `EE`, `OF`, `SR`, `IT`, `HR`, `PC`, `AC`) ออกจากตารางรายชื่อแผนกโดยตรง
  2. **จัดหมวดหมู่ `ฝ่าย` เป็นกลุ่มแม่ (`กลุ่มฝ่าย >> แผนก`) ทั้งหมด 6 กลุ่มฝ่าย**:
     - **กลุ่มที่ 1: `ฝ่ายผลิต (PD)`** >> `EP` (แผนกหม้อต้ม), `VP` (แผนกหม้อเคี่ยว), `CF` (แผนกหม้อปั่น), `WP` (แผนกระบบน้ำ)
     - **กลุ่มที่ 2: `ฝ่ายวิศวกรรมจักรกล (EN)`** >> `ML` (แผนกลูกหีบ), `MA` (แผนกเครื่องกลซ่อมบำรุง), `EBL` (แผนกหม้อไอน้ำ)
     - **กลุ่มที่ 3: `ฝ่ายวิศวกรรมไฟฟ้า (EE)`** >> `EM` (แผนกไฟฟ้าซ่อมบำรุง), `ME` (แผนกอุปกรณ์เครื่องมือวัด), `EPP` (แผนกไฟฟ้าผลิต)
     - **กลุ่มที่ 4: `ฝ่ายระบบมาตรฐานและคุณภาพ`** >> `QS` (แผนกระบบมาตรฐาน), `QA` (แผนกประกันคุณภาพ), `LB` (แผนกวิเคราะห์คุณภาพ)
     - **กลุ่มที่ 5: `ฝ่ายจัดการสิ่งแวดล้อมและความปลอดภัย`** >> `EV` (แผนกสิ่งแวดล้อม), `SF` (แผนกความปลอดภัยและอาชีวอนามัย)
     - **กลุ่มที่ 6: `ฝ่ายคลังสินค้า`** >> `WH` (แผนกคลังพัสดุ), `SW` (แผนกคลังน้ำตาล)
  3. **อัปเดตตัวกรอง Dropdown ทุกจุดในระบบ (`#global-dept-filter`, `#f3d-dept-select`, และ Modal CRUD ทั้งหมด) และหน้าจัดการแผนก (`renderDepartments`)**:
     - แสดงตัวเลือกแบบ `<optgroup label="📂 กลุ่ม: ฝ่าย...">` ในรูปแบบ `ฝ่าย... >> [รหัส] แผนก...`
     - รองรับการกรองข้อมูลทั้งระดับ **กลุ่มฝ่าย (`GROUP:ฝ่าย...`)** และระดับ **แผนกเดี่ยว** ทั้งในหน้า Dashboard, ทะเบียนเครื่องจักร, สายเดินตรวจ และผังโรงงาน 3D

### **v2.6.0** — `2026-09-28`
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `src/db.js`, `public/js/app.js`, `public/js/factory-map-config.js`, `public/js/views-and-crud.js`, `data/comis.db`, `CONTEXT.md`
- **รายละเอียดการแก้ไข**:
  1. **นำเข้าทะเบียนเครื่องจักรจริงของ `แผนกลูกหีบ (ML)` ทั้ง 38 รายการ (`ML-01` ถึง `ML-38`)**
  2. **ผูกพิกัดเครื่องจักรจริงบนผังโรงงาน 3D (`production-center`) + แบบฟอร์ม `FRM-ML-001` + สายเดินตรวจตามลำดับการผลิต `RT-ML-01`**

### **v2.5.0** — `2026-09-28`
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `src/db.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `data/comis.db`, `CONTEXT.md`
- **รายละเอียดการแก้ไข**:
  1. **อัปเดตรหัสย่อและชื่อฝ่าย/แผนกตามผังองค์กรจริงของโรงงาน**
  2. **ระบบ Migration อัตโนมัติทั้ง SQLite (`syncOfficialFactoryDepartmentsSqlite`) และ Standalone LocalStorage (`syncOfficialFactoryDepartmentsInRaw`)**

### **v2.4.0** — `2026-09-28`
- **ผู้ดำเนินการ**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **ไฟล์ที่แก้ไข**: `src/db.js`, `server.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `public/js/factory-map-config.js`, `public/js/factory-overview.js`, `data/comis.db`
- **รายละเอียดการแก้ไข**:
  1. **ลบข้อมูลจำลอง (Mockup / Demo Data) ออกทั้งหมด เพื่อรองรับการใช้งานข้อมูลจริง 100%**
  2. **ระบบล้างเฉพาะรหัส Mockup โดยไม่กระทบข้อมูลจริงที่ผู้ใช้เพิ่มเอง (`purgeMockupDataFromSqlite` & `purgeMockupRecordsFromRaw`)**

### **v2.3.1** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI
- **ไฟล์ที่แก้ไข**: `public/js/factory-map-config.js`, `public/js/factory-3d-scene.js`, `public/js/factory-overview.js`
- **รายละเอียดการแก้ไขและฟีเจอร์ใหม่ตาม `USER_CONFIRMED_OVERRIDES.md`**:
  1. **ปรับชื่ออาคารแดง (ภาพ 3, 17, 19)**: ตั้งชื่อทางการเป็น **“อาคารสำนักงาน (ตึกแดง)”** ครบทั้งผัง 3D, ป้ายโซน, Drawer และแผนผัง 2.5D SVG
  2. **ปรับชื่อถังสีเหลือง (ภาพ 14, 39)**: กำหนดสีถังเป็นสีเหลืองอุตสาหกรรม (`#EAB308`) และตั้งชื่อเฉพาะตัวถังเป็น **“ถังโมลาส”**
  3. **ตัดพื้นที่ภาพ 4, 5, 6, 8 และ VIS-11 ออกจากโมเดล**: ยืนยันไม่นำชุดบ่อและท่อแยกนี้มาสร้างในโมเดลโรงงาน และไม่ลบไฟล์ภาพต้นฉบับ
  4. **ตัดภาพ 18 และกลุ่มถังโลหะ 4 ใบของโรงงานอื่นออกจากผัง**: แนวถนนทางเข้าใช้ภาพ 19–21 เป็นหลัก และไม่มีกลุ่มถังโลหะ 4 ใบ
  5. **คงรูปทรงถังฟ้าอ่อน (ภาพ 45) โดยไม่ใส่ป้ายชื่อ**: คงทรงกระบอก 3D แนวตั้งสีฟ้าอ่อนหน้าโถงหม้อเคี่ยว/หม้อไอน้ำ แต่ไม่ติดป้ายชื่อหรือป้ายรอยืนยัน
  6. **คงลานแคบ (ภาพ 27–29) โดยไม่ใส่ชื่อลาน**: คงพื้นที่ทางกายภาพข้างลานกากอ้อยในโมเดล แต่ไม่ใส่ป้ายชื่อใด ๆ (ไม่ใช้ชื่อลานเก็บขี้เพาะ/ขี้เถ้า)

### **v2.3.0** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

### **v2.2.0 / v2.2.1** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

### **v2.3.2** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

### **v2.1.0** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

### **v2.0.0** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

### **v1.2.1** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

### **v1.2.0** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

### **v1.1.0** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

### **v1.0.0** — `2026-09-25`
- **ผู้ดำเนินการ**: Antigravity AI

---

## 4. สถานะปัจจุบันของระบบ (Current System Status)
- **เวอร์ชันล่าสุด**: **v3.0.2** — เชื่อมบัญชีและการมอบหมายผู้ใช้ใน Data Center Hub กับระบบกลาง (รายละเอียดใน README.md)
- **สถานะ Lock (`_lock/current.md`)**: `## FREE` (พร้อมรับคำสั่งถัดไป)

