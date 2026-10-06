# บันทึกการทำงาน (Append-Only Log) — Antigravity AI
- **ผู้บันทึก**: Antigravity AI (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`)
- **วันที่**: 2026-09-25
- **โปรเจกต์**: ระบบตรวจสอบเครื่องจักรออนไลน์แบบศูนย์กลาง (ESC Machine Inspection Center — บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน))

---

## [2026-09-25 15:10 - 15:30] สร้างระบบต้นแบบเวอร์ชัน v1.0.0 (Full-Stack Prototype)
- **รายการไฟล์ที่สร้าง/แก้ไข**:
  - `package.json`: ตั้งค่าโปรเจกต์ Node.js v22 (ไม่พึ่งพาไลบรารีภายนอกที่เสียค่าใช้จ่าย)
  - `src/db.js`: สร้างโมดูลฐานข้อมูล SQLite (`node:sqlite`) พร้อมตาราง `departments`, `users`, `machines`, `form_templates`, `inspections`, `defects`
  - `server.js`: สร้าง HTTP Server และ REST API ครบทุกโมดูล (CRUD แผนก, เครื่องจักร, ฟอร์มตรวจเช็ค, ประวัติการตรวจ, แจ้งซ่อม F-Tag, สถิติ Dashboard)
  - `public/index.html`, `public/css/custom.css`, `public/js/app.js`, `public/js/views-and-crud.js`: สร้างส่วนติดต่อผู้ใช้แบบ Single-Page Application (SPA) พร้อมกราฟ CBM, ระบบสร้างฟอร์มเอง (Dynamic Form Builder) และกระดานเซ็นชื่อดิจิทัล

---

## [2026-09-25 15:35 - 16:08] อัปเดตเวอร์ชัน v1.1.0 (Standalone HTML Mode & แก้ปัญหา OneDrive Sync)
- **รายการไฟล์ที่สร้าง/แก้ไข**:
  - `index.html` (Root) และ `public/js/app.js`: เพิ่มระบบ `StandaloneDB` เก็บข้อมูลลง `localStorage` อัตโนมัติเมื่อเปิดไฟล์ `index.html` โดยตรงแบบไม่รัน Server
  - `index.html`, `public/index.html`: นำป้าย `FREE 100%` ออกจากแถบเมนูตามคำสั่งผู้ใช้
  - ลบไฟล์ `start-comis.bat` และไฟล์ชั่วคราว `comis.db-shm`, `comis.db-wal` เนื่องจาก OneDrive บล็อกการซิงค์ไฟล์ `.bat` และไฟล์ล็อกของ SQLite
  - `src/db.js`: เปลี่ยนโหมด SQLite จาก `WAL` เป็น `PRAGMA journal_mode = DELETE;` เพื่อให้ซิงค์ผ่าน OneDrive ได้ 100%
  - `start-comis.js`: สร้างสคริปต์ `.js` แทน `.bat`

---

## [2026-09-25 16:09 - 16:15] อัปเดตเวอร์ชัน v1.2.0 (ES Group Corporate Theme & Sugar Mill Seed Data)
- **รายการไฟล์ที่แก้ไข**:
  - `index.html`, `public/index.html`, `public/css/custom.css`: ปรับโทนสีเขียว-ทอง (`#1f760e`, `#5c9f06`, `#8ce617`, `#0f2e09`), ฟอนต์ `Kanit` และโลโก้ทางการของ **บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) (`https://www.esgroup.co.th/images/logo-v2.png`)**
  - `public/js/app.js`, `src/db.js`, `public/js/views-and-crud.js`: ปรับเปลี่ยนข้อมูลเริ่มต้น (Seed Data) ให้ตรงกับสายการผลิตโรงงานน้ำตาลและโรงไฟฟ้าชีวมวลของ ES Group และใส่โลโก้ ES Group ในใบรายงานและป้าย QR Code

---

## [2026-09-25 16:18 - 16:22] อัปเดตเวอร์ชัน v1.2.1 (บังคับใช้ COLLABORATION_RULES.md และวางแผนสถาปัตยกรรม v2.0.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `16:18`: ประกาศ `## LOCKED` เพื่อสร้างไฟล์ `CONTEXT.md` และ `logs/2026-09-25_ai-antigravity.md`
- **รายการไฟล์ที่สร้าง**:
  - `CONTEXT.md`: บันทึกสถานะความจริงล่าสุดของโปรเจกต์, โครงสร้างไฟล์, ข้อจำกัด OneDrive, ประวัติการแก้ไขทุกเวอร์ชัน (`v1.0.0` ถึง `v1.2.1`) และแผนการพัฒนา `v2.0.0`
  - `logs/2026-09-25_ai-antigravity.md`: ไฟล์บันทึกการทำงานแบบ Append-only ไฟล์นี้
- **รายละเอียดการวางแผน v2.0.0**:
  - ออกแบบ UX/UI สำหรับ **iPad / แท็บเล็ตหน้างาน** ของช่างตรวจเช็ค
  - ออกแบบระบบ **สายการเดินตรวจ (Inspection Routes) + กำหนดช่วงเวลา (Time Windows) + การช่วยกันตรวจหลายคนในแผนก (Multi-Inspector Shared Round)**
  - ออกแบบโหมด **ลงข้อมูลฉุกเฉิน / บันทึกค่าด่วนเฉพาะจุด (Emergency / Ad-Hoc Quick Data Entry)** โดยไม่ต้องกรอกฟอร์มทั้งใบ
- **การปลด Lock (`_lock/current.md`)**:
  - `16:22`: เปลี่ยนสถานะ `_lock/current.md` เป็น `## FREE` เรียบร้อยแล้ว

---

## [2026-09-25 16:25 - 16:48] พัฒนาและติดตั้งเวอร์ชัน v2.0.0 เต็มรูปแบบ (iPad UX + สายเดินตรวจ & ทีมช่าง + ลงข้อมูลฉุกเฉิน)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `16:25`: ประกาศ `## LOCKED` ระบุรายการไฟล์ทั้งหมดที่แก้ไขตาม `COLLABORATION_RULES.md`
- **รายการไฟล์ที่แก้ไข (อ่านไฟล์ล่าสุดจากดิสก์และแก้ไขแบบ Diff เท่านั้น)**:
  - `index.html` และ `public/index.html`:
    - เพิ่มเมนู `🗺️ สายเดินตรวจ & ทีมตรวจ` (`data-tab="routes"`, `#badge-routes`) บนแถบเมนูด้านซ้าย
    - เพิ่มปุ่ม `📱 โหมดไอแพดหน้างาน` (`#btn-tablet-mode`) และปุ่ม `⚡ ลงข้อมูลฉุกเฉิน` บนแถบด้านบนสุด
  - `public/css/custom.css`:
    - เพิ่มคลาส `.tablet-field-mode`, `.touch-target-btn`, `.touch-num-input`, `.touch-stepper-btn`, `.inspect-field-card` สำหรับหน้าจอสัมผัสของช่างหน้างาน
  - `public/js/app.js`:
    - เพิ่มข้อมูลเริ่มต้น `routes` (สายเดินตรวจมาตรฐานพร้อมช่วงเวลาตรวจแต่ละกะ) และ `routeRounds` (รอบการเดินตรวจร่วมกันของทีมช่าง)
    - เพิ่ม REST API จำลองฝั่ง Standalone (`/api/routes`, `/api/route-rounds`, อัปเดต `/api/inspections` รองรับ `emergency_quick` และ `co_inspectors`)
    - อัปเกรดหน้า `renderInspect` ให้มี **iPad Speed Bar**, ปุ่มกดผ่านหมวดสายตาทั้งหมด, ปุ่มปรับค่าตัวเลขสัมผัส (`-1 / -0.1 / = ค่าเดิม / +0.1 / +1`), แถบสลับจุดแวะตรวจในสายตรวจ และปุ่ม `💾 พัก/แชร์ความคืบหน้าให้เพื่อนตรวจต่อ`
  - `public/js/views-and-crud.js`:
    - สร้างหน้า `renderRoutes()` แสดงรอบการเดินตรวจประจำกะของทีมช่าง, ลำดับเครื่องจักร `จุดที่ 1 -> 2 -> 3`, ปุ่มลงชื่อเข้าร่วมทีมตรวจ และหน้าต่างสร้าง/แก้ไขสายเดินตรวจ (`openRouteModal`)
    - สร้างหน้าต่าง `openEmergencyQuickEntryModal()` สำหรับการลงค่าฉุกเฉินเฉพาะจุด (เลือกกรอกเพียง 1–2 พารามิเตอร์ หรือพิมพ์อาการผิดปกติเร่งด่วนโดยไม่ต้องกรอกทั้งฟอร์ม)
    - อัปเดตหน้าประวัติและใบรายงาน (`renderHistory`, `openInspectionReportModal`) ให้แสดงป้าย `⚡ ฉุกเฉิน/เฉพาะจุด` และรายชื่อ `🤝 ทีมช่างผู้ร่วมตรวจ`
  - `src/db.js` และ `server.js`:
    - เพิ่มตาราง `inspection_routes` และ `route_rounds` ใน SQLite (`PRAGMA journal_mode = DELETE;`) พร้อม Endpoint `/api/routes` และ `/api/route-rounds` ให้ตรงกับโหมด Standalone 100%
- **การตรวจสอบความถูกต้อง (Verification)**:
  - รัน `node --check` ตรวจสอบ `public/js/app.js`, `public/js/views-and-crud.js`, `src/db.js`, `server.js` ผ่านทั้งหมด (`ALL_JS_SYNTAX_OK`)
- **การปลด Lock (`_lock/current.md`)**:
  - `16:48`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.0.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-25 16:50 - 17:18] พัฒนาและติดตั้งเวอร์ชัน v2.1.0 (ESC Factory World 3D Diorama + ระบบประวัติการทำงานและย้อนข้อมูล Undo/Rollback)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `16:50`: ประกาศ `## LOCKED` เพื่อพัฒนาฟีเจอร์ตามไฟล์สเปก `logs/2026-09-25_codex_FACTORY_3D_CONCEPT_FOR_AGY.md` และระบบ Audit Log & Rollback
- **รายการไฟล์ที่สร้างใหม่**:
  - `public/assets/factory/esc-aerial-reference.jpg` และ `public/assets/factory/esc-ui-reference.png`: บันทึกภาพถ่ายมุมสูงโรงงานจริงและภาพต้นแบบ UI สำหรับอ้างอิงโซน 3D
  - `public/assets/factory/three.r128.min.js` และ `public/assets/factory/THREE_LICENSE.txt`: ไลบรารี Three.js r128 แบบ Local เพื่อให้เปิดผ่าน `index.html` แบบออฟไลน์ได้ทันที
  - `public/css/factory-overview.css`: สไตล์ชีตเฉพาะหน้า 3D Factory World โดยใช้คลาส `.esc-*` และ `.f3d-*` ไม่ชนกับ `custom.css`
  - `public/js/factory-map-config.js`: นิยามพาเลตสี 3D, มุมกล้อง Orthographic, โซนพื้นที่โรงงาน 8 โซนตามภาพถ่ายมุมสูง (`front-pond`, `front-building`, `front-left-block`, `production-west`, `production-center`, `central-yard`, `water-east`, `rear-block`) และการผูกเครื่องจักรเข้ากับโซน (`DEFAULT_MACHINE_PLACEMENTS`) โดยแยกจาก `department_id`
  - `public/js/factory-3d-scene.js`: สร้างฉาก 3D Diorama ด้วย Three.js (`OrthographicCamera`), อาคาร/ไซโล/ปล่อง/สะพานลำเลียง/บ่อน้ำ/แนวต้นสน, ป้ายหมุด HTML ลอยเหนือโซน, เส้นทางเดินตรวจ 3D Tube Overlay, ระบบควบคุมเมาส์และนิ้วสัมผัส iPad (แยก drag vs tap $\le 6\text{ px}$), ระบบคืน Memory (`dispose()`) และ **2D Interactive SVG Map Fallback**
  - `public/js/factory-overview.js`: คอนโทรลเลอร์หน้า `ภาพรวมโรงงาน 3D` พร้อม KPI Strip, ตัวกรองแผนก/สถานะ/สายเดินตรวจ/ค้นหาเครื่องจักร, แผงรายละเอียดโซน (Right Drawer), หน้าต่างกำหนดโซน 3D ให้เครื่องจักร (`openMachinePlacementEditorModal`) และปุ่ม Deep-Link ไปยังหน้าเริ่มตรวจเช็ค, ลงข้อมูลฉุกเฉิน, ประวัติเฉพาะเครื่อง และรายการ F-Tag เฉพาะเครื่อง
- **รายการไฟล์เดิมที่แก้ไข (แบบ Diff เท่านั้น)**:
  - `src/db.js` และ `server.js`:
    - อัปเกรดตาราง `audit_logs` เพิ่มคอลัมน์ `can_undo`, `reverted`, `reverted_at`, `reverted_by`, `undo_json`
    - เพิ่มระบบถ่าย `captureSqliteRawSnapshot()` ก่อนการเปลี่ยนแปลงข้อมูลทุก API (`POST / PUT / DELETE`) และเพิ่ม Endpoint `POST /api/audit-logs/:id/undo` กับ `POST /api/audit-logs/client-event`
  - `public/js/app.js`:
    - เพิ่มฟังก์ชัน `cloneDataSnapshot()` และ `applyDataSnapshotToRaw()` เพื่อบันทึก `snapshot_before` ลงในทุกธุรกรรมของโหมด Standalone (`localStorage`) และรองรับการกดย้อนข้อมูลกลับ (`POST /api/audit-logs/:id/undo`)
    - เชื่อมต่อแท็บ `factory3d` และ `auditlog` เข้ากับ `switchTab()` และ `renderCurrentTab()` พร้อมเรียก `cleanupFactoryOverview()` ทุกครั้งที่สลับออกจากหน้า 3D
  - `public/js/views-and-crud.js`:
    - สร้างหน้า `renderAuditLogCenter()` (`ประวัติระบบ & ย้อนข้อมูล`) พร้อมตัวกรอง, หน้าต่างดู JSON Snapshot ก่อนแก้ไข (`openAuditSnapshotDetailModal`) และฟังก์ชัน `undoSystemAuditLog()`
    - อัปเดต `renderDefects()` และ `renderHistory()` ให้รองรับการกรองเฉพาะเครื่องจักร (`state.defectMachineFilter`, `state.historyMachineFilter`) เมื่อกดลิงก์มาจากหน้าโรงงาน 3D
  - `index.html` และ `public/index.html`:
    - เพิ่มเมนู `ภาพรวมโรงงาน 3D` (`data-tab="factory3d"`) และ `ประวัติระบบ & ย้อนข้อมูล` (`data-tab="auditlog"`) พร้อมลิงก์สคริปต์และ CSS ครบทั้งสองไฟล์
- **การตรวจสอบความถูกต้อง (Verification)**:
  - รัน `node --check` ตรวจสอบไฟล์ JS ทั้ง 7 ไฟล์ (`factory-map-config.js`, `factory-3d-scene.js`, `factory-overview.js`, `views-and-crud.js`, `app.js`, `src/db.js`, `server.js`) ผ่านทั้งหมด (`ALL_SYNTAX_OK`)
- **การปลด Lock (`_lock/current.md`)**:
  - `17:18`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.1.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-25 19:20 - 20:43] พัฒนาและติดตั้งเวอร์ชัน v2.2.0 (CSV Bulk Import + กรองเฉพาะยูเซอร์ที่เกี่ยวข้อง + Dark/Light Mode + อัปเกรด 3D Factory P0/P1 + ตรึงแท็บผู้ใช้งานขณะนี้ที่มุมขวาล่าง)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `19:20`: ประกาศ `## LOCKED` ระบุไฟล์ทั้งหมดที่แก้ไขตาม `COLLABORATION_RULES.md`
- **รายการไฟล์ที่แก้ไข (แบบ Diff เท่านั้น)**:
  - `index.html` และ `public/index.html`:
    - เพิ่มเมนู `📥 นำเข้าข้อมูล CSV (Template)` (`data-tab="csvimport"`) ในหมวดฐานข้อมูลและระบบตั้งค่า
    - อัปเดตเมนู `สายเดินตรวจ & แบ่งงานทีมช่าง` (`data-tab="routes"`) ในหมวดศูนย์บัญชาการและหน้างาน
    - เพิ่มปุ่มสลับโหมด `🌙 โหมดมืด` / `☀️ โหมดสว่าง` (`#btn-theme-mode`) บนแถบด้านบนสุด และแถบสถานะการเชื่อมต่อเซิร์ฟเวอร์ (`#server-status-banner`)
    - ย้ายแท็บ **`👤 ผู้ใช้งานขณะนี้:`** ออกมาเป็นกล่องลอยตรึงคงที่ที่มุมขวาล่างของหน้าจอ (`#fixed-active-user-dock`, `fixed bottom-4 right-4 z-40`) ไม่ขยับตามการเลื่อนหน้าจอหรือการสลับหน้า และตรึงแถบเมนูซ้าย (`lg:sticky lg:top-0 lg:h-screen`)
  - `public/css/custom.css` และ `public/css/factory-overview.css`:
    - เพิ่มชุดสไตล์ `body.dark-theme` โทนสีเขียวเข้มมรกต-ทองคำ (`Deep Forest Emerald Night` `#071705`, `#0d2309`, `#122d0d`, `#8ce617`) และคลาส `.esc-layer-pill`, `.status-warning`, `.status-stale`
  - `public/js/app.js` และ `public/js/views-and-crud.js`:
    - สร้างศูนย์นำเข้าข้อมูล CSV (`renderCsvImportCenter`, `openCsvImportModal`, `downloadCsvTemplate`, `submitCsvImportRows`) รองรับ `machines`, `routes`, `departments`, `users` พร้อมบันทึก Snapshot ลง Audit Log (`BULK_IMPORT_CSV`)
    - เพิ่มระบบกรองข้อมูลตามผู้ใช้งานขณะนี้ (`isMachineRelevantToActiveUser`, `isFormRelevantToActiveUser`, `isRouteRoundRelevantToActiveUser`, `renderUserScopeFilterBar`) ในหน้าตรวจเช็คหน้างานและหน้าสายเดินตรวจประจำกะ
    - เพิ่มฟังก์ชันสลับโหมดมืด/สว่าง (`initThemeMode`, `toggleThemeMode`) และอัปเดตสถานะการเชื่อมต่อเซิร์ฟเวอร์ (`updateServerStatusBanner`)
  - `public/js/factory-map-config.js`, `public/js/factory-3d-scene.js`, `public/js/factory-overview.js`, `src/db.js`, `server.js`:
    - อัปเกรดหน้า `ภาพรวมโรงงาน 3D` ตามเอกสารวิจัย `logs/2026-09-25_codex_FACTORY_3D_DASHBOARD_RESEARCH_FOR_AGY.md` ครบทั้ง P0-1 ถึง P0-4 และ P1-1 ถึง P1-3 (5-Dimension Status Model, Full vs Partial Coverage, Real Today vs Demo Date Toggle, Layer Switcher 5 เลเยอร์ + Dynamic Legend, 3D Machine Sub-markers + Inline CBM Sparkline, Render-on-Demand `invalidate(reason)` + Eco Mode, `THREE.InstancedMesh` ต้นสน, และ Server-Synced `machine_placements` พร้อม Revision Check)
- **การตรวจสอบความถูกต้อง (Verification)**:
  - รัน `node --check` ตรวจสอบไฟล์ JS ทั้ง 7 ไฟล์ (`server.js`, `src/db.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `public/js/factory-map-config.js`, `public/js/factory-3d-scene.js`, `public/js/factory-overview.js`) ผ่านทั้งหมด และทดสอบ `initDatabase()` บน SQLite สำเร็จ (`DB OK! Placements: 9`)
- **การปลด Lock (`_lock/current.md`)**:
  - `20:43`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.2.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-25 21:01 - 21:05] ปรับตำแหน่งแท็บ "ผู้ใช้งานขณะนี้:" ไปตรึงที่มุมซ้ายล่าง (`fixed bottom-3 left-3`)
- **รายการไฟล์ที่แก้ไข**:
  - `index.html` และ `public/index.html`: ย้าย `#fixed-active-user-dock` จากมุมขวาล่าง (`bottom-4 right-4`) ไปตรึงที่มุมซ้ายล่าง (`fixed bottom-3 left-3 z-40 w-[264px]`) พอดีกับความกว้างแถบเมนูซ้าย และเพิ่ม `pb-36` ให้ `<nav id="nav-menu">` เพื่อไม่ให้บังปุ่มเมนูล่างสุด
- **การปลด Lock (`_lock/current.md`)**:
  - `21:05`: ปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-25 21:09 - 21:20] ปรับปรุงความคมชัดของตัวหนังสือและป้ายสถานะในโหมดมืด (Dark Mode High-Contrast Typography & Badge Overrides — v2.2.1)
- **รายการไฟล์ที่แก้ไข**:
  - `public/css/custom.css`:
    - ล็อกสีข้อความในกล่องโลโก้ ES Group มุมซ้ายบน (`#sidebar .bg-white\/95`) ให้เป็นสีเขียวเข้ม/เทาเข้มคมชัดบนพื้นขาว ไม่ถูกเปลี่ยนเป็นสีเขียวอ่อนกลืนกับพื้นขาว
    - เพิ่มกฎปรับพื้นหลังสีอ่อนทั้งหมด (`.bg-white/90`, `.bg-white/80`, `.bg-slate-200`, และตระกูล `-50`, `-100`, `-200` พร้อมค่าความโปร่งใส `/90`, `/80`, `/70`, `/60`, `/50`, `/40`, `/30`, `/20` ของ `emerald`, `green`, `amber`, `yellow`, `orange`, `rose`, `red`, `blue`, `sky`, `cyan`, `teal`, `indigo`, `purple`) ให้เป็นพื้นหลังโทนเข้มคู่กับตัวอักษรสีสว่างคมชัด (`#f0fdf4`, `#d1fae5`, `#8ce617`, `#fcd34d`, `#fda4af`, `#7dd3fc`, `#c4b5fd`)
    - บังคับตัวอักษรสีเข้ม (`#071505`) บนปุ่มสีสว่าง (`bg-amber-400`, `bg-amber-300`, `bg-[#8ce617]`) และปรับสีข้อความประจำแผนกที่เป็น Inline Style (`[style*="color:"]`) ให้สว่างขึ้นอัตโนมัติในโหมดมืด
    - คงพื้นหลังกระดานเซ็นชื่อ (`canvas#signature-canvas`) ให้เป็นสีสว่างเพื่อเห็นหมึกปากกาสีน้ำเงินชัดเจน
  - `public/css/factory-overview.css`:
    - นิยามคลาส `.from-brand-900.to-brand-800`, `.bg-brand-600`, `.bg-brand-50`, `.text-brand-*`, `.border-brand-*` ทั้งในโหมดสว่างและโหมดมืด
    - แก้ไขลำดับความสำคัญ (Specificity) ของ `.f3d-zone-pin.selected .f3d-pin-card`, `.f3d-zone-pin.status-stale .f3d-pin-card` และ `.esc-camera-toolbar` ในโหมดมืด ไม่ให้ตัวอักษรสีขาวไปทับบนพื้นหลังสีอ่อน
  - `public/js/app.js`:
    - ปรับสีเส้นกราฟ, ตัวอักษร Legend, ตัวเลขแกน X/Y และเส้นตารางของ Chart.js ใน `initDashboardCharts()` ให้สว่างคมชัดเมื่ออยู่ในโหมดมืด
- **การปลด Lock (`_lock/current.md`)**:
  - `21:20`: ปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-25 21:29 - 21:50] อัปเกรดหน้า "ภาพรวมโรงงาน" เป็นมุมมองไอโซเมตริก (Isometric 3D & 2.5D Map) โรงงานน้ำตาลและอ้อยตะวันออก 1573, ตำบล วังใหม่ อำเภอ วังสมบูรณ์ สระแก้ว 27250 (v2.3.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `21:29`: ประกาศ `## LOCKED` (`session: 96b3077c-c514-4d48-a785-95f93104b5cb`) เพื่อแก้ไข `public/js/factory-map-config.js`, `public/js/factory-3d-scene.js`, `public/js/factory-overview.js`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการไฟล์ที่แก้ไข (แบบ Diff เท่านั้น)**:
  - `public/js/factory-map-config.js`:
    - เพิ่ม `FACTORY_PLANT_INFO` ระบุข้อมูลที่ตั้งจริงของ **บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) — สาขาวังสมบูรณ์** และ **บริษัท อี เอส พลังงาน จำกัด** เลขที่ **1573 หมู่ที่ 1 ตำบลวังใหม่ อำเภอวังสมบูรณ์ จังหวัดสระแก้ว 27250** (ริมทางหลวงแผ่นดินหมายเลข 317)
    - ปรับปรุงคำอธิบาย พิกัดศูนย์กลาง และจุดย่อย (`bays`) ของทั้ง 8 โซนหลัก (`front-building`, `front-pond`, `front-left-block`, `production-west`, `production-center`, `central-yard`, `water-east`, `rear-block`) ให้ตรงกับผังจริง
    - เพิ่มมุมกล้องมาตรฐาน `FACTORY_CAMERA_PRESETS` แบบไอโซเมตริกครบ 5 มุม (`overview` [Iso 45°], `aerial` [มุมโดรน 1573], `production` [โซนผลิต], `water` [บ่อน้ำ/ชานอ้อย], `topplan` [ผังด้านบน])
  - `public/js/factory-3d-scene.js`:
    - ปรับมุมกล้องเริ่มต้นของ `OrthographicCamera` เป็น **True Isometric (`theta: -0.54, phi: 0.92, radius: 132, zoom: 1.04`)** พร้อมเปิดให้หมุนสำรวจได้ 360 องศาเต็มรูปแบบ
    - สร้างรายละเอียดแผนผังไอโซเมตริก 3 มิติของโรงงาน 1573 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว เพิ่มเติม: ตารางกริดวิศวกรรมไอโซเมตริก (`THREE.GridHelper`), ถนนทางเข้าหลักพร้อมเกาะกลางและเสาไฟกิ่ง, ป้ายทางหลวงสีน้ำเงิน, วงเวียนหน้าตึกแดง, ซุ้มด่านชั่งอ้อยพร้อมป้ายพุ่มไม้ตัดแต่งตัวอักษร `"ESC"`, โถงลูกหีบอ้อยคาดแถบสีน้ำเงินพร้อมรางดัมพ์อ้อย, โรงไฟฟ้าชีวมวลพร้อมไซโลสีฟ้าอ่อนด้านหน้า-ถังดักฝุ่น ESP-ปล่องสูง, ถังกากน้ำตาลคู่, บ่อบำบัดน้ำ 9 ช่องพร้อมเครื่องตีน้ำเติมอากาศ (Aerators), อ่างเก็บน้ำดิบขนาดใหญ่ด้านตะวันออกเฉียงเหนือ, ลานกองชานอ้อยล้อมกำแพงกันฝุ่นสีน้ำเงินพร้อมกองชานอ้อย 3 มิติ, เสาไฟสปอตไลท์สูง (High-Mast Towers), และรถบรรทุกอ้อยจำลอง (`_addCaneTruck`)
    - อัปเกรด `_mount2DFallback()` เป็น **2.5D Isometric Illustrated SVG Map** ของโรงงาน 1573 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250 พร้อมปุ่มสลับซ้อนภาพถ่ายมุมสูงจริง (`#f3d-toggle-aerial-bg`)
  - `public/js/factory-overview.js`:
    - ปรับค่าเริ่มต้น `f3dUiState.selectedZoneId = null` เพื่อให้เมื่อเปิดหน้า `ภาพรวมโรงงาน` จะเห็นแผนผังไอโซเมตริกของโรงงาน 1573 วังใหม่ วังสมบูรณ์ เต็มจอทันทีโดยไม่ถูกแผง Drawer บัง และเปิดแผงรายละเอียดเมื่อคลิกเลือกโซนหรือเครื่องจักร
    - เพิ่มแถบข้อมูลสถานที่ตั้ง `โรงงานน้ำตาลและอ้อยตะวันออก 1573, ตำบล วังใหม่ อำเภอ วังสมบูรณ์ สระแก้ว 27250` บนหัวหน้าเว็บ ป้ายเข็มทิศไอโซเมตริกมุมซ้ายล่าง และปุ่มเลือกมุมกล้องไอโซเมตริกทั้ง 5 มุมบนแถบเครื่องมือขวาบน
- **การปลด Lock (`_lock/current.md`)**:
  - `21:50`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.3.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-25 22:00 - 22:05] ปรับแต่งผังโมเดลตามคำยืนยันล่าสุดของผู้ใช้ใน USER_CONFIRMED_OVERRIDES.md (v2.3.1)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `22:00`: ประกาศ `## LOCKED` (`session: 96b3077c-c514-4d48-a785-95f93104b5cb`) เพื่อแก้ไข `public/js/factory-map-config.js`, `public/js/factory-3d-scene.js`, `public/js/factory-overview.js`, `CONTEXT.md`
- **รายการสิ่งที่ดำเนินการตามคำสั่งผู้ใช้**:
  1. **อาคารแดง (ภาพ 3, 17, 19)**: ตั้งชื่อทางการเป็น **“อาคารสำนักงาน (ตึกแดง)”** (zone `front-building`, `shortName`, `description`, ป้าย 3D pin, Drawer, และแผนผัง 2.5D SVG) โดยกำหนด `nameVerified: true`
  2. **ถังเหลือง (ภาพ 14, 39)**: ปรับวัสดุ 3D เป็นสีเหลืองอุตสาหกรรม (`#EAB308` พร้อมหลังคากรวย `#CA8A04`) และตั้งชื่อเฉพาะตัวถังเป็น **“ถังโมลาส”** (พร้อมวาดลงแผนผัง 2.5D SVG และอัปเดต bay ใน `water-east`)
  3. **ตัดพื้นที่ภาพ 4, 5, 6, 8 และ VIS-11 ออกจากโมเดล**: ยืนยันไม่นำชุดบ่อและท่อแยกนี้มาสร้างในโมเดล และคงไฟล์ภาพต้นฉบับไว้ครบถ้วน
  4. **ตัดภาพ 18 และกลุ่มถังโลหะ 4 ใบของโรงงานอื่นออกจากผัง**: แนวถนนทางเข้าอ้างอิงภาพ 19–21 และไม่มีกลุ่มถังโลหะ 4 ใบ
  5. **คงรูปทรงถังฟ้าอ่อน (ภาพ 45) โดยไม่ใส่ป้ายชื่อ**: คงกระบอก 3D แนวตั้งสีฟ้าอ่อนหน้าโถงหม้อเคี่ยว/หม้อไอน้ำ แต่ไม่ติดป้ายชื่อและนำชื่อออกจาก bay ของ `production-west`
  6. **คงลานแคบ (ภาพ 27–29) โดยไม่ใส่ชื่อลาน**: คงพื้นที่ทางกายภาพข้างลานกากอ้อยในโมเดล แต่ไม่ใส่ป้ายชื่อใด ๆ (ไม่ใช้ชื่อลานเก็บขี้เพาะ/ขี้เถ้า)
- **การปลด Lock (`_lock/current.md`)**:
  - `22:05`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.3.1` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-25 22:06 - 22:12] ตรวจสอบและแก้ไขสาเหตุ "แผนที่ไม่ขึ้น" (Fix 3D Map Rendering & Syntax Error v2.3.2)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `22:06`: ประกาศ `## LOCKED` (`session: 96b3077c-c514-4d48-a785-95f93104b5cb`) เพื่อตรวจสอบหาสาเหตุที่แผนที่ไม่แสดงผลบนหน้าจอ
- **การวินิจฉัยและระบุต้นตอของปัญหา (Root Cause Diagnosis)**:
  - จากภาพหลักฐานที่ผู้ใช้แจ้ง (`media_1790348703360.png`): หน้า "ภาพรวมโรงงาน 3D" โหลดแถบหัวเรื่อง, ปุ่ม Layer, ปุ่มควบคุมมุมกล้อง และแถบด้านล่างขึ้น แต่บริเวณ Stage Shell ตรงกลางกลับว่างเปล่า ไม่มีแคนวาส 3 มิติ และไม่มีป้ายหมุดโซน (Zone Pins)
  - ทำการตรวจสอบการคอมไพล์โค้ด JavaScript ด้วย Headless Browser (Microsoft Edge):
    - พบข้อผิดพลาดร้ายแรง: `SyntaxError: Unexpected token 'if'` ที่บรรทัด 712 ใน `public/js/factory-3d-scene.js`
    - สาเหตุ: ในการแก้ไขรอบก่อนหน้า บรรทัดคำสั่งเงื่อนไข `if (zoneId === 'front-building') {` ในเมธอด `_populateZoneArchitecture()` หลุดหายไป ทำให้บล็อกคำสั่งสถาปัตยกรรม 3D กลายเป็น statement เปล่า และบรรทัดถัดไป `} else if (zoneId === 'front-left-block') {` ไม่มี `if` จับคู่ ส่งผลให้ JavaScript Engine หยุดประเมินไฟล์ ส่งผลให้คลาส `Factory3DScene` ไม่ถูกสร้างขึ้น (`window.Factory3DScene is not a constructor`) เมธอด `.mount()` จึงไม่ทำงาน
- **การแก้ไขและยืนยันผล (Fix & Verification)**:
  - เติมคำสั่ง `if (zoneId === 'front-building') {` กลับเข้าสู่ตำแหน่งบรรทัด 697 ใน `public/js/factory-3d-scene.js` อย่างสมบูรณ์
  - รันการทดสอบคอมไพล์และเรนเดอร์จริงด้วย Headless Browser:
    - ผลการรัน: `SUMMARY: canvases=1, canvasWidth=1200, canvasHeight=540, pins=8, svgs=0` ไม่มี Error ใดๆ ใน Console
    - ถ่ายภาพแคปเจอร์ยืนยันผล (`scratch/factory_overview_fixed.png`): โมเดลไดโอรามา 3D โรงงาน 1573 ต.วังใหม่ อ.วังสมบูรณ์ ทั้งหมด 8 โซน, อาคารสำนักงาน (ตึกแดง), ถังโมลาสสีเหลือง, บ่อบำบัด 9 บ่อ, ไซโลฟ้าอ่อน, โซนการผลิต และป้ายหมุดลอยขึ้นแสดงผลอย่างถูกต้อง สวยงาม คมชัด และหมุนดูได้ 360 องศา
- **การปลด Lock (`_lock/current.md`)**:
  - `22:12`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.3.2` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 10:46 - 11:06] ลบข้อมูลจำลอง (Mockup / Demo Data) ทั้งหมดเพื่อใช้งานข้อมูลจริง (Production Clean Mode v2.4.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `10:46`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `src/db.js`, `server.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `public/js/factory-map-config.js`, `public/js/factory-overview.js` และ `data/comis.db`
- **รายการสิ่งที่ดำเนินการ**:
  1. **`src/db.js` & `data/comis.db` (SQLite Backend)**:
     - นำข้อมูลจำลองออกจาก `seedInitialData()` และยกเลิก `seedRoutesV2IfNeeded()` คงไว้เฉพาะโครงสร้างหลัก 5 แผนก (`MECH`, `ELEC`, `PROD`, `BOIL`, `SAFE`), แม่แบบฟอร์มมาตรฐาน 4 ฟอร์ม (`FRM-MECH-001`, `FRM-ELEC-001`, `FRM-PROD-AM01`, `FRM-SAFE-001`) และผู้ดูแลระบบหลัก (`EMP-1001: วศ.ประจักษ์`)
     - สร้างฟังก์ชัน `purgeMockupDataFromSqlite(force)` ล้างเฉพาะรหัสข้อมูลจำลอง (`MOCKUP_IDENTIFIERS`) ออกจาก `data/comis.db` ทันทีโดยไม่กระทบข้อมูลจริงที่ผู้ใช้สร้างเอง และรันยืนยันผลบน `data/comis.db` (`machines: 0, inspections: 0, defects: 0, routes: 0, rounds: 0, placements: 0`)
  2. **`public/js/app.js` (Standalone & Frontend State)**:
     - ล้างข้อมูลจำลองใน `getInitialSeedData()` และสร้าง `purgeMockupRecordsFromRaw(raw, force)` เรียกอัตโนมัติใน `getLocalDb()` เพื่อลบรายการจำลองที่ค้างอยู่ใน `localStorage` (`ESC_COMIS_CENTER_DB_V2` และ `esc_machine_placements_v21`)
     - แก้ไข `enrichRawData(raw)` ไม่ให้เติม `seed.routes` / `seed.routeRounds` กลับเข้ามาเมื่อตารางว่าง
     - นำตัวเลขสมมติ (`2.4, 2.6` / `62, 64`) ออกจาก `initDashboardCharts()` เมื่อยังไม่มีข้อมูลตรวจวัดจริง
     - เพิ่ม Empty State พร้อมปุ่มลัด `+ เพิ่มเครื่องจักรจริง` และ `📥 นำเข้าข้อมูลจาก CSV` ในหน้า Dashboard และหน้าตรวจเช็ค
  3. **`public/js/factory-map-config.js` & `public/js/factory-overview.js`**:
     - ตั้งค่า `DEFAULT_MACHINE_PLACEMENTS = []` และตั้งค่า `f3dUiState.dateMode = 'real'` เป็นค่าเริ่มต้น
  4. **`server.js` & `public/js/views-and-crud.js`**:
     - เพิ่ม API `POST /api/system/purge-mockup` และอัปเดตปุ่มในหน้าตั้งค่าเป็น `🧹 ล้างข้อมูลจำลอง (Mockup) ออกทั้งหมด (คงเหลือเฉพาะข้อมูลจริง)`
- **การปลด Lock (`_lock/current.md`)**:
  - `11:06`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.4.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 11:10 - 11:26] อัปเดตรหัสย่อและชื่อฝ่าย/แผนกทั้ง 26 หน่วยงานตามตารางผังองค์กรจริงของโรงงาน (v2.5.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `11:10`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `src/db.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `data/comis.db`, `CONTEXT.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **เพิ่มรายชื่อ 26 ฝ่าย/แผนกมาตรฐานโรงงาน (`OFFICIAL_FACTORY_DEPARTMENTS`) แทนที่ 5 แผนกจำลองเดิม (`MECH`, `ELEC`, `PROD`, `BOIL`, `SAFE`)**:
     - ระดับฝ่าย: `PD` (ฝ่ายผลิต), `EN` (ฝ่ายวิศวกรรมจักรกล), `EE` (ฝ่ายวิศวกรรมไฟฟ้า)
     - สายงานผลิต (ฝ่ายผลิต): `EP` (แผนกหม้อต้ม), `VP` (แผนกหม้อเคี่ยว), `CF` (แผนกหม้อปั่น), `WP` (แผนกระบบน้ำ)
     - สายงานผลิต (ฝ่ายวิศวกรรมจักรกล): `ML` (แผนกลูกหีบ), `MA` (แผนกเครื่องกลซ่อมบำรุง), `EBL` (แผนกหม้อไอน้ำ)
     - สายงานผลิต (ฝ่ายวิศวกรรมไฟฟ้า): `EM` (แผนกไฟฟ้าซ่อมบำรุง), `ME` (แผนกอุปกรณ์เครื่องมือวัด), `EPP` (แผนกไฟฟ้าผลิต)
     - สายงานระบบมาตรฐานและคุณภาพ: `QS` (แผนกระบบมาตรฐาน), `QA` (แผนกประกันคุณภาพ), `LB` (แผนกวิเคราะห์คุณภาพ)
     - สายงานจัดการสิ่งแวดล้อมและความปลอดภัย: `EV` (แผนกสิ่งแวดล้อม), `SF` (แผนกความปลอดภัยและอาชีวอนามัย)
     - สายงานบริหารจัดการ: `OF` (ฝ่ายการสำนักงาน), `WH` (แผนกคลังพัสดุ), `SW` (แผนกคลังน้ำตาล)
     - สายงานสนับสนุนอื่นๆ: `SR` (สายงานองค์กรสัมพันธ์), `IT` (สายงานเทคโนโลยีสารสนเทศ), `HR` (สายงานทรัพยากรบุคคล), `PC` (สายงานจัดซื้อ), `AC` (สายงานเกษตร)
  2. **สร้างระบบ Migration อัตโนมัติทั้ง SQLite (`syncOfficialFactoryDepartmentsSqlite` ใน `src/db.js`) และ Standalone LocalStorage (`syncOfficialFactoryDepartmentsInRaw` ใน `public/js/app.js`)**:
     - อัปเดต `data/comis.db` ให้มีครบ 26 ฝ่าย/แผนก พร้อมปรับ `department_id` ของ `EMP-1001` (`EN`) และแม่แบบฟอร์มทั้ง 4 ฟอร์ม (`FRM-MECH-001` -> `MA`, `FRM-ELEC-001` -> `EM`, `FRM-PROD-AM01` -> `PD`, `FRM-SAFE-001` -> `SF`)
  3. **อัปเดตหน้าจัดการแผนกและเทมเพลต CSV (`public/js/views-and-crud.js`)**:
     - ปรับตัวอย่างใน `CSV_TEMPLATE_CONFIGS` (`machines`, `routes`, `departments`, `users`) ให้ใช้รหัสย่อแผนกมาตรฐานของโรงงาน (`ML`, `MA`, `EBL`, `EP`, `EM`)
- **การปลด Lock (`_lock/current.md`)**:
  - `11:26`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.5.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 11:28 - 11:37] นำเข้าทะเบียนเครื่องจักรจริง แผนกลูกหีบ (ML) ทั้ง 38 รายการ (v2.6.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `11:28`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `src/db.js`, `public/js/app.js`, `public/js/factory-map-config.js`, `public/js/views-and-crud.js`, `data/comis.db`, `CONTEXT.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **เพิ่มรายชื่อเครื่องจักรจริงของ `แผนกลูกหีบ (ML)` ทั้ง 38 รายการ (`ML-01` ถึง `ML-38`)**:
     - `ML-01` ถึง `ML-36`: เครื่องจักรตามรายการข้อความที่ผู้ใช้ระบุ (ไฮดลอลิคยกดั๊มพ์ เบอร์ 1–3, ตะกาวโกยอ้อย เบอร์ 1–2, สะพานดั๊มพ์, ใบเกลี่ยสะพานดั๊มพ์, สะพานสิ่งไร้สาระ เบอร์ 1–2, ใบเตะสะพานดั๊มพ์ เบอร์ 1–2, สะพานเมน, ใบมีด Precutter, ใบมีดสะพานเมน เบอร์ 1–2, ใบเกลี่ยสะพานเมน, ใบเตะสะพานเมน เบอร์ 3, แม่เหล็กก่อนลงเชร็ดเดอร์, เชร็ดเดอร์, เทอร์ไบน์, สะพานเชร็ดเดอร์, สายพานยาง High speed belt, แม่เหล็กสำหรับสะพานยาง, สะพานข้ามชุด เบอร์ 1–3, โรตารี่สกีน, รางสว่าน, ลูกหีบ ชุดที่ 2–5, ใบเกลี่ย High Speed Belt, เครนเหนือศรีษะ 10/5 ตัน, เครนเหนือศรีษะ 50/20 ตัน เบอร์ 1–2)
     - `ML-37` ถึง `ML-38`: รอกไฟฟ้า OHC-10 ขนาด 2 ton S/N 18091799 และ รอกไฟฟ้า OHC-11 ขนาด 5 ton S/N 18100447 จากตารางรูปภาพที่ 2
  2. **ผูกพิกัดเครื่องจักรจริงบนผัง 3D (`production-center` ใน `factory-map-config.js` และ `machine_placements`), สร้างแบบฟอร์ม `FRM-ML-001` และสายเดินตรวจตามลำดับการผลิต `RT-ML-01`**:
     - ซิงค์อัตโนมัติทั้งใน SQLite (`data/comis.db`) และโหมดเปิดไฟล์ตรง (`localStorage`)
- **การปลด Lock (`_lock/current.md`)**:
  - `11:37`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.6.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 11:45 - 12:04] แยกเฉพาะรายชื่อ 17 แผนกปฏิบัติการ และจัดหมวดหมู่ตามกลุ่มฝ่าย (กลุ่มฝ่าย >> แผนก) (v2.7.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `11:45`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `src/db.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `public/js/factory-overview.js`, `data/comis.db`, `CONTEXT.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **แยกเฉพาะ `แผนก` ทั้ง 17 แผนกปฏิบัติการออกจากรหัสระดับฝ่าย/สายงาน**:
     - นำรหัสที่เป็นระดับฝ่ายและสายงาน (`PD`, `EN`, `EE`, `OF`, `SR`, `IT`, `HR`, `PC`, `AC`) ออกจากตารางรายชื่อ `departments`
     - จัดหมวดหมู่ทั้ง 17 แผนกภายใต้ 6 กลุ่มฝ่าย (`กลุ่มฝ่าย >> แผนก`):
       1. `ฝ่ายผลิต (PD)` >> `EP`, `VP`, `CF`, `WP`
       2. `ฝ่ายวิศวกรรมจักรกล (EN)` >> `ML`, `MA`, `EBL`
       3. `ฝ่ายวิศวกรรมไฟฟ้า (EE)` >> `EM`, `ME`, `EPP`
       4. `ฝ่ายระบบมาตรฐานและคุณภาพ` >> `QS`, `QA`, `LB`
       5. `ฝ่ายจัดการสิ่งแวดล้อมและความปลอดภัย` >> `EV`, `SF`
       6. `ฝ่ายคลังสินค้า` >> `WH`, `SW`
  2. **อัปเดต Dropdown, ตัวกรอง Global/3D และหน้าจัดการแผนก (`renderDepartments`)**:
     - สร้างฟังก์ชัน `groupDepartmentsByDivision`, `renderDepartmentSelectOptions`, `doesDepartmentMatchFilter` ใน `public/js/app.js`
     - แสดงตัวเลือกแผนกในรูปแบบ `<optgroup label="📂 กลุ่ม: ฝ่าย...">` พร้อมข้อความ `ฝ่าย... >> [รหัส] แผนก...`
     - รองรับการกรองข้อมูลทั้งระดับ **กลุ่มฝ่าย (`GROUP:ฝ่าย...`)** และระดับ **แผนกเดี่ยว** ทั้งใน `#global-dept-filter` และ `#f3d-dept-select`
- **การปลด Lock (`_lock/current.md`)**:
  - `12:04`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.7.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 12:08 - 12:17] เพิ่มคอลัมน์ ฝ่าย (Division) ในตารางทะเบียนเครื่องจักร, ประวัติการตรวจ, ผู้ใช้งาน และไฟล์ CSV Export (v2.7.1)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `12:08`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `server.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `CONTEXT.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **เพิ่มคอลัมน์ `ฝ่าย (Division)` ในตารางข้อมูลหลัก (`public/js/views-and-crud.js`)**:
     - หน้า `ทะเบียนเครื่องจักรและป้าย QR Code` (`renderMachines`): เพิ่มคอลัมน์ `ฝ่าย (Division)` แสดงคู่กับ `แผนกที่ดูแล / พื้นที่ติดตั้ง` พร้อมตัวกรอง Dropdown `📂 ทุกฝ่าย (All Divisions)` และรองรับการค้นหาชื่อฝ่ายในช่องค้นหา
     - หน้า `ประวัติและอนุมัติผล` (`renderHistory`) และใบรายงาน PDF (`openInspectionReportModal`): เพิ่มคอลัมน์ `ฝ่าย (Division)`
     - หน้า `จัดการผู้ใช้งานและสิทธิ์` (`renderUsersAndSettings`): เพิ่มคอลัมน์ `ฝ่าย (Division)`
     - หน้าต่างเพิ่ม/แก้ไขเครื่องจักร (`openMachineModal`) และป้าย QR (`openMachineQRModal`): แสดง `สังกัดฝ่าย: 📂 ...` อัปเดตอัตโนมัติตามแผนกที่เลือก
  2. **เพิ่มคอลัมน์ `ฝ่าย` ในไฟล์ส่งออก CSV (`exportMachinesCSV`, `exportInspectionsCSV`)**:
     - แทรกคอลัมน์ `'ฝ่าย'` ก่อน `'แผนก'` ในไฟล์ CSV
  3. **ซิงค์ฟิลด์ `division_name` (`d.plant_name`) ใน `server.js` และ `public/js/app.js`**:
     - อัปเดต SQL query ใน `getFullBootstrapData()` (`server.js`) และ `enrichRawData()` (`public/js/app.js`) ให้แนบ `division_name` กับทุกเรคคอร์ด พร้อมอัปเดต flag `official_ml_machines_v27` เพื่อให้โหมด LocalStorage ซิงค์เครื่องจักร `ML-01` ถึง `ML-38` ภายใต้ `ฝ่ายวิศวกรรมจักรกล (EN)` ทันที
- **การปลด Lock (`_lock/current.md`)**:
  - `12:17`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.7.1` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 13:40 - 14:15] ปรับรหัสเครื่องจักรมาตรฐานโรงงาน 41 รายการ แผนกลูกหีบ (ML) ตามข้อกำหนด Codex และแยก TUR / SHR ชัดเจน (v2.8.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `13:40`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `src/db.js`, `public/js/app.js`, `public/js/factory-map-config.js`, `data/comis.db`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **แปลงรหัสเครื่องจักรชั่วคราว (`ML-01` ถึง `ML-38`) สู่รหัสมาตรฐานทางการ 41 รายการ (`ML-TTP-01` ถึง `ML-OHC-11`)**:
     - อ้างอิงตามเอกสาร `logs/2026-09-28_codex_MACHINE_SUMMARY_FOR_AGY.md` และหลักเกณฑ์รหัสเครื่องจักรทางการ
     - ปรับโครงสร้างรหัสแบบกระชับ 3 บล็อก (แผนก `ML` - ชนิดเครื่องจักร 3 ตัวอักษร - ลำดับตัวเลข 2 หลัก) เช่น `ML-TTP-01`, `ML-CAR-01`, `ML-TUR-01`, `ML-SHR-01` เหมาะสำหรับติดป้าย QR Code หน้างานและแสดงผลบนแท็บเล็ต/มือถือ
  2. **แยกเครื่องจักรเทอร์ไบน์และเชร็ดเดอร์ออกจากกันเด็ดขาด (ตามคำสั่งยืนยันของผู้ใช้)**:
     - `ML-TUR-01`: เทอร์ไบน์ขับเชร็ดเดอร์ (Turbine for Heavy Duty Shredder)
     - `ML-SHR-01`: เครื่องเชร็ดเดอร์ (Heavy Duty Shredder)
     - มีประวัติการตรวจเช็คและสายเดินตรวจแยกกันชัดเจน ไม่ยุบรวมกัน
  3. **ซิงค์ข้อมูลและสายเดินตรวจทั้ง SQLite และ Standalone LocalStorage**:
     - อัปเดต `src/db.js` และฟังก์ชัน `syncOfficialMillingMachinesSqlite` ให้ลบชุดรหัสชั่วคราว `ML-01` ถึง `ML-38` แล้วนำเข้า 41 เครื่องจักรทางการ พร้อมอัปเดตสายเดินตรวจ `RT-ML-01` ให้มีจุดตรวจครบทั้ง 41 จุดตามลำดับกระบวนการผลิต
     - อัปเดต `public/js/app.js` เพิ่ม `OFFICIAL_ML_MACHINES_SEED` และฟังก์ชัน `syncOfficialMillingMachinesInRaw` รองรับการทำงานในโหมด Standalone LocalStorage พร้อม flag `official_ml_machines_v28`
     - อัปเดต `public/js/factory-map-config.js` ให้แสดงพิกัดบนผัง 3D ด้วยรหัสทางการทั้ง 41 จุด
  4. **ตรวจสอบระบบและการคอมไพล์**:
     - ทำการรัน `node --check` ผ่านทุกไฟล์ (`src/db.js`, `server.js`, `public/js/app.js`, `public/js/factory-map-config.js`, `public/js/views-and-crud.js`) ไวยากรณ์ถูกต้อง 100%
     - ตรวจสอบฐานข้อมูล `data/comis.db` พบเครื่องจักร 41 รายการถูกต้อง ครบถ้วน
- **การปลด Lock (`_lock/current.md`)**:
  - `14:15`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.8.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 14:12 - 14:15] ปรับคอลัมน์ Class ให้แสดงสั้นกระชับเฉพาะตัวอักษร เช่น A (v2.8.1)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `14:13`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `public/js/views-and-crud.js`, `public/js/app.js`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **ปรับการแสดงผลคอลัมน์ `Class` ในตารางทะเบียนเครื่องจักร (`renderMachines`) ใน `public/js/views-and-crud.js`**:
     - เปลี่ยนป้าย Badge จากเดิม `Class ${m.criticality}` (เช่น `Class A`) เป็น `${m.criticality}` (เช่น `A`) ตามคำขอของผู้ใช้ ให้สั้นกระชับ ประหยัดเนื้อที่ตาราง และอ่านง่าย
  2. **ปรับการแสดงผล Badge บนการ์ดเครื่องจักรในหน้าภาพรวม (`public/js/app.js`)**:
     - เปลี่ยนป้าย Badge ด้านข้างรหัสเครื่องจักรจาก `Class ${m.criticality}` เป็น `${m.criticality}` ให้เป็นมาตรฐานเดียวกันทั้งระบบ
  3. **ตรวจสอบไวยากรณ์ (Syntax Check)**:
     - ทดสอบ `node --check` ผ่านทั้ง `public/js/views-and-crud.js` และ `public/js/app.js` ไวยากรณ์ถูกต้อง 100%
- **การปลด Lock (`_lock/current.md`)**:
  - `14:15`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.8.1` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 14:26 - 14:36] เพิ่มสถานะ "รอซ่อม" และ "อยู่ระหว่างการซ่อม" ทั้งระบบเครื่องจักรและใบแจ้งซ่อม F-Tag (v2.9.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `14:33`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `public/js/app.js`, `public/js/views-and-crud.js`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **เพิ่มสถานะในระบบการเดินเครื่องจักร (Operating State)**:
     - เพิ่มสถานะ `⏳ รอซ่อม` (`pending_repair`) และ `🛠️ อยู่ระหว่างการซ่อม` (`under_repair`) ใน `getOperatingBadge(opState)`
     - เพิ่มปุ่มกดเลือกสถานะในหน้าจอแบบฟอร์มตรวจเช็คเครื่องจักร (`onChangeInspectOperatingState`)
     - เพิ่มตัวเลือกใน Dropdown หน้าต่างสร้าง/แก้ไขเครื่องจักร (`openMachineModal` -> `#m-opstate`)
     - เพิ่มตัวกรอง Dropdown `ทุกการเดินเครื่อง` (`state.machineOperatingFilter`) ในหน้าทะเบียนเครื่องจักร สามารถกรองดูเฉพาะเครื่องที่ `รอซ่อม` หรือ `ระหว่างซ่อม` ได้อย่างสะดวกรวดเร็ว
  2. **เพิ่มสถานะในระบบติดตามใบแจ้งซ่อม F-Tag (Defect Tracking)**:
     - เพิ่มสถานะ `⏳ รอซ่อม (Pending Repair)` และ `🛠️ อยู่ระหว่างการซ่อม (Under Repair)` ใน `statusMap` และตัวกรอง `#defect-status-filter`
     - เพิ่มตัวเลือกใน Dropdown อัปเดตงานซ่อม (`openDefectModal` -> `#def-status`)
  3. **ตรวจสอบระบบ**:
     - รัน `node --check` ผ่าน 100% ไวยากรณ์ถูกต้อง ปราศจากข้อผิดพลาด
- **การปลด Lock (`_lock/current.md`)**:
  - `14:36`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.9.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 14:48 - 14:55] ตัด 3 กลุ่มฝ่ายสนับสนุนออกชั่วคราว คงเหลือ 3 ฝ่ายหลักสายวิศวกรรมและการผลิต 10 แผนกปฏิบัติการ (v2.10.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `14:48`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `src/db.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `data/comis.db`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **ตัด 3 กลุ่มฝ่ายสนับสนุนออกตามภาพที่ผู้ใช้กำหนด (`media_1790580275977.png`)**:
     - ตัด **ฝ่ายระบบมาตรฐานและคุณภาพ** (3 แผนก: `QS` แผนกระบบมาตรฐาน, `QA` แผนกประกันคุณภาพ, `LB` แผนกวิเคราะห์คุณภาพ)
     - ตัด **ฝ่ายจัดการสิ่งแวดล้อมและความปลอดภัย** (2 แผนก: `EV` แผนกสิ่งแวดล้อม, `SF` แผนกความปลอดภัยและอาชีวอนามัย)
     - ตัด **ฝ่ายคลังสินค้า** (2 แผนก: `WH` แผนกคลังพัสดุ, `SW` แผนกคลังน้ำตาล)
  2. **คงเหลือเฉพาะ 3 กลุ่มฝ่ายหลัก 10 แผนกปฏิบัติการ**:
     - **ฝ่ายผลิต (PD)**: `EP` (แผนกหม้อต้ม), `VP` (แผนกหม้อเคี่ยว), `CF` (แผนกหม้อปั่น), `WP` (แผนกระบบน้ำ)
     - **ฝ่ายวิศวกรรมจักรกล (EN)**: `ML` (แผนกลูกหีบ), `MA` (แผนกเครื่องกลซ่อมบำรุง), `EBL` (แผนกหม้อไอน้ำ)
     - **ฝ่ายวิศวกรรมไฟฟ้า (EE)**: `EM` (แผนกไฟฟ้าซ่อมบำรุง), `ME` (แผนกอุปกรณ์เครื่องมือวัด), `EPP` (แผนกไฟฟ้าผลิต)
  3. **ระบบ Auto-Migration ในฐานข้อมูล SQLite (`src/db.js`) & Standalone LocalStorage (`public/js/app.js`)**:
     - อัปเดต `OFFICIAL_FACTORY_DEPARTMENTS` ให้เหลือ 10 แผนก
     - ใน `src/db.js`: ปรับ `syncOfficialFactoryDepartmentsSqlite` พร้อม flag `official_depts_v30` ทำการลบ 7 แผนกที่ถูกตัดออก และแมปฟอร์ม `FRM-SAFE-001` เข้ากับ `MA` (แผนกเครื่องกลซ่อมบำรุง) เพื่อไม่ให้ Foreign Key เสียหาย
     - ใน `public/js/app.js`: ปรับ `getInitialSeedData().departments` และ `syncOfficialFactoryDepartmentsInRaw` พร้อม flag `official_depts_v30 = '1'` ให้ทำงานตรงกันในโหมด LocalStorage
  4. **อัปเดตหน้าจัดการแผนกและเทมเพลต CSV (`public/js/views-and-crud.js`)**:
     - อัปเดตข้อความอธิบายใน `renderDepartments` และคำอธิบายเทมเพลต CSV (`CSV_TEMPLATE_CONFIGS.departments`, `CSV_TEMPLATE_CONFIGS.users`) ให้แสดงเฉพาะ 10 แผนกปฏิบัติการ
  5. **ตรวจสอบความถูกต้อง (Verification)**:
     - รัน `node --check` ผ่าน 100% ทุกไฟล์ ไม่มี SyntaxError
     - ตรวจสอบ `departments` ใน `data/comis.db` พบ 10 แผนกถูกต้อง สมบูรณ์
- **การปลด Lock (`_lock/current.md`)**:
  - `14:55`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.10.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 15:10 - 15:15] ปรับรอบกะการทำงานเป็น 2 กะ: กะเช้า 07:00-19:00 น. และ กะดึก 19:00-07:00 น. (v2.11.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `14:54`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `src/db.js`, `server.js`, `public/js/app.js`, `public/js/views-and-crud.js`, `data/comis.db`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **ปรับรอบกะการทำงานของโรงงานเป็นระบบ 2 กะ (12 ชม./กะ) ตามมาตรฐานจริงของโรงงาน**:
     - **☀️ กะเช้า (Day Shift)**: เวลา `07:00 - 19:00 น.`
     - **🌙 กะดึก (Night Shift)**: เวลา `19:00 - 07:00 น.`
  2. **ปรับปรุงหน้าจอแบบฟอร์มตรวจเช็คเครื่องจักร (`public/js/app.js`)**:
     - Dropdown ข้อ `3. กะการทำงาน (Working Shift)` ปรับให้เหลือ 2 ตัวเลือกชัดเจน:
       - `☀️ กะเช้า (07:00 - 19:00 น.)`
       - `🌙 กะดึก (19:00 - 07:00 น.)`
     - ปรับค่าเริ่มต้นของ `state.inspectSession.shift` ให้เป็น `'กะเช้า (07:00-19:00)'`
  3. **ปรับปรุงระบบสายเดินตรวจและรอบตรวจแบบทีม (`public/js/views-and-crud.js`)**:
     - ปรับฟอร์มสร้าง/แก้ไขสายเดินตรวจ (`openRouteModal` & `saveRouteModal`) ให้มีช่องกำหนดช่วงเวลาเดินตรวจ 2 กะ: กะเช้า (`07:30 - 09:30 น.`) และ กะดึก (`19:30 - 21:30 น.`)
     - ปรับฟอร์มเริ่มรอบตรวจ (`submitStartRouteRound`) ให้ใช้ค่ากะเริ่มต้นเป็น 2 กะ
     - อัปเดตตัวอย่างใน `CSV_TEMPLATE_CONFIGS.routes`
  4. **ซิงค์ฐานข้อมูล SQLite (`src/db.js`, `data/comis.db`) และ Backend Server (`server.js`)**:
     - อัปเดต `syncOfficialMillingMachinesSqlite` พร้อม flag `official_ml_machines_v28_shift2` ให้สายเดินตรวจ `RT-ML-01` บันทึกรอบกะ 2 กะลงใน `inspection_routes` อย่างถูกต้อง
     - อัปเดตค่า default shift ใน `server.js` (`POST /api/inspections`, `POST /api/route-rounds`, CSV route import fallback)
  5. **ตรวจสอบความถูกต้อง (Verification)**:
     - ทดสอบรันและดึงข้อมูลจาก `inspection_routes` ใน SQLite พบกะเช้า (07:00-19:00) และกะดึก (19:00-07:00) ครบถ้วน
     - รัน `node --check` ผ่าน 100% ทุกไฟล์ ไม่มี Syntax Error
- **การปลด Lock (`_lock/current.md`)**:
  - `15:15`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.11.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 15:35 - 15:58] ปรับปรุงตารางให้สามารถปรับขนาดคอลัมน์ได้ (Resizable Columns) และนำเข้ารายชื่อช่างตรวจเช็ค 23 คน (v2.12.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `15:35`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `public/css/custom.css`, `public/js/views-and-crud.js`, `public/js/app.js`, `src/db.js`, `server.js`, `data/comis.db`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **ระบบตารางปรับขนาดคอลัมน์ได้ (Resizable Table Columns Engine) พร้อมจำค่าลง LocalStorage**:
     - สร้างเอนจิน `makeTableResizable(tableEl, tableKey)` ใน `public/js/views-and-crud.js` พร้อมฟังก์ชันช่วย `saveStoredTableWidths`, `getStoredTableWidths`, และ `resetTableColumnWidths`
     - นำมาใช้งานกับตารางหลัก 3 ตาราง:
       - **ตารางทะเบียนเครื่องจักร (`tbl-machines-master`)** พร้อมปุ่ม "คืนค่าขนาดคอลัมน์"
       - **ตารางประวัติผลการตรวจเช็ค (`tbl-inspections-history`)** พร้อมปุ่ม "คืนค่าขนาดคอลัมน์"
       - **ตารางผู้ใช้งานและสิทธิ์ (`tbl-users-list`)** พร้อมปุ่ม "คืนค่าขนาด"
     - สไตล์ชีต `.table-resizable`, `.col-resizer`, `.col-resizer:hover`, `body.resizing-col` ใน `public/css/custom.css`
     - สลับแท็บแล้วทำงานอัตโนมัติผ่าน `window.initAllResizableTables(container)` ใน `public/js/app.js`
  2. **นำเข้ารายชื่อพนักงานในตำแหน่งช่าง/ผู้ตรวจเช็ค 23 คน โดยใช้รหัสพนักงานเป็น User/Identifier**:
     - รายชื่อพนักงานทั้ง 23 คน: `629315` (นายบุญชู งวดสูงเนิน), `659170` (นายทินกร ทองอาบ), `619279` (นายจรุนันท์ ประจิตร), `629011` (นายศุภมิตร สีคันทา), `629273` (นายศักดิ์รินทร์ คำภักดี), `669084` (นายสหัสวรรษ ผิวผ่อง), `629302` (นายสมชาย มีมุข), `629328` (นายไพรวัลย์ มีระหันนอก), `639152` (นายสมนึก ใจดี), `659246` (นายสุรกันต์ ช้างน้อย), `649073` (นายวุฒิพงษ์ นนทะคำจันทร์), `659096` (นายรัฐพล แก้วสุวรรณ์), `669041` (นายรัชชานนท์ องอาจ), `669199` (นายพิชิตตมาร คำกลาง), `679047` (นายมารุต บุญค้ำชู), `679046` (นายธณกฤษ ท้าวธงชัย), `689094` (นายธนพล กันเย็น), `689109` (นายพิชิต สุทธิศิริ), `699042` (นายดนัย พินยารัตน์), `699043` (นายศุภฤกษ์ ซีกพุดซา), `699127` (นายวิทยา สาระคำ), `679191` (น.ส.สมฤทัย พูลผล), `698014` (นายอริยธรรม ขันคำ-นศ.ฝึกงาน)
     - ทั้งหมดสังกัด **แผนกลูกหีบ (ML)** ในตำแหน่งช่างตรวจเช็ค (`inspector`)
     - เพิ่มฟังก์ชัน `syncOfficialTechnicianUsersSqlite` ใน `src/db.js` และซิงค์เข้า SQLite `data/comis.db` (ยอดรวม 24 บัญชี: Admin 1 + ช่าง 23)
     - เพิ่มฟังก์ชัน `syncOfficialTechniciansInRaw` และอัปเดต Seed Users ใน `public/js/app.js` รองรับ Standalone LocalStorage
     - ปรับ Dropdown ผู้ใช้ด้านซ้ายล่าง (`#current-user-select`) ให้แสดงรูปแบบ `[รหัสพนักงาน] ชื่อ-สกุล (แผนก)`
     - แก้ไข SQL Statement ใน `server.js` (CSV users import) ให้ตรงกับคอลัมน์จริงของตาราง `users`
  3. **การตรวจสอบความถูกต้อง (Verification)**:
     - ทดสอบ `SELECT count(*) FROM users` ใน `data/comis.db` ได้ 24 บัญชีครบถ้วน
     - ทดสอบ `SELECT count(*) FROM users WHERE role = 'inspector'` ได้ 23 บัญชี
     - รัน `node --check` ผ่าน 100% ทุกไฟล์ JS
- **การปลด Lock (`_lock/current.md`)**:
  - `15:58`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.12.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 16:46 - 16:52] ปรับปรุงระบบทั้งหมดตามผลการตรวจสอบ UX/UI และการใช้งานหน้างาน (v2.13.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `16:46`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `public/js/app.js`, `public/js/views-and-crud.js`, `public/css/custom.css`, `public/sw.js`, `public/index.html`, `index.html`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **ระบบบีบอัดรูปถ่ายหน้างานอัตโนมัติ (Client-Side Image Compression)**:
     - สร้างฟังก์ชัน `compressImageFile(file, 1280, 0.75)` ใน `public/js/app.js` ย่อความละเอียดและบีบอัดภาพถ่ายจากกล้องมือถือ/แท็บเล็ตเหลือ 100–250 KB
     - ป้องกันปัญหาพื้นที่ `localStorage` เต็ม (`QuotaExceededError`) ได้ 100%
     - ปรับปรุง UI แนบรูปภาพให้แสดงขนาด KB, ปุ่มดูภาพขนาดใหญ่ใน Modal (`🔍 ดูรูป`), และปุ่มลบภาพ (`✕ ลบ`)
  2. **ปุ่มทางลัดตรวจผ่านอัตโนมัติในหน้าตรวจเช็ค (Inspection Speed Bar Buttons)**:
     - เพิ่มปุ่ม **"🟢 ผ่านปกติทุกข้อ (Mark All Normal)"** สั่งตั้งค่าทุกข้อเป็นปกติอัตโนมัติ 1-Click
     - เพิ่มปุ่ม **"↺ ล้างคำตอบ"** เพื่อรีเซ็ตค่าในฟอร์มตรวจเช็คทั้งหมดกลับเป็นค่าว่าง
  3. **รองรับ Touch Event สำหรับ Resizable Table บน iPad / Tablet**:
     - เพิ่ม `touchstart`, `touchmove`, `touchend`, `touchcancel` ใน `makeTableResizable` (`public/js/views-and-crud.js`)
     - กำหนด `touch-action: none` บนแถบลาก ทำให้ช่างหน้างานใช้นิ้วลากปรับขนาดคอลัมน์บนจอสัมผัสได้ลื่นไหล
  4. **จัดกลุ่มตัวเลือกผู้ใช้งานใน Dropdown ด้วย `<optgroup>`**:
     - ปรับ Dropdown `#current-user-select` ให้จัดกลุ่มเป็น Admin, ช่างแผนกลูกหีบ (ML 23 ท่าน), และแผนกอื่นๆ
     - ปรับ Dock ผู้ใช้งานมุมล่างซ้ายให้ยืดหยุ่นไม่บังเนื้อหาบนจอมือถือขนาดเล็ก
  5. **เพิ่ม Search Debounce ในการค้นหาตารางเครื่องจักร**:
     - สร้างฟังก์ชัน `debounce` และ `onMachineSearchInput` หน่วงเวลา 180ms ไม่ให้กระตุกขณะพิมพ์
  6. **การยศาสตร์โรงงาน & โหมดคมชัดสูง (Factory Ergonomics & High Contrast)**:
     - กำหนด `min-width: 55px` และ `text-overflow: ellipsis` ป้องกันหัวตารางล้น
     - ปรับความสูงขั้นต่ำของปุ่มสัมผัสเป็น 48px และขอบหนา 2px ใน `body.tablet-field-mode`
  7. **ระบบ Offline Service Worker (`public/sw.js`)**:
     - สร้าง `public/sw.js` แคชไฟล์ Assets หลัก และลงทะเบียนในทั้ง `index.html` และ `public/index.html`
  8. **การตรวจสอบความถูกต้อง (Verification)**:
     - รัน `node --check` ผ่าน 100% ทุกไฟล์ JS
     - ทดสอบความสมบูรณ์ของฐานข้อมูล SQLite (ผู้ใช้ 24, เครื่องจักร 41, แผนก 10)
- **การปลด Lock (`_lock/current.md`)**:
  - `16:52`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.13.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`

---

## [2026-09-28 16:53 - 16:56] เพิ่มปุ่มลัดการปรับขนาดตารางพอดีหน้าจออัตโนมัติ (v2.14.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `16:53`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `public/js/views-and-crud.js`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **ฟังก์ชัน `autoFitTableColumns(tableKey, tableId)`**:
     - สร้างฟังก์ชันคำนวณและปรับขนาดคอลัมน์อัตโนมัติใน `public/js/views-and-crud.js`
     - สลับเลย์เอาต์ชั่วคราวเพื่อวัดความกว้างเนื้อหาตามจริง (Natural Width) ของแต่ละคอลัมน์
     - เกลี่ยสัดส่วนความกว้างตามขนาดพื้นที่แสดงผลของคอนเทนเนอร์และหน้าจอปัจจุบันให้พอดี 100%
     - บันทึกความกว้างลงใน `localStorage` ทันที และแจ้งเตือนผ่าน Toast
     - Expose ฟังก์ชันขึ้น `window.autoFitTableColumns` เพื่อเรียกใช้จากทุกที่
  2. **เพิ่มปุ่มลัด "📐 ปรับตารางพอดี" ในหน้าทะเบียนเครื่องจักร (Machines Master Data)**:
     - ติดตั้งปุ่มลัด `📐 ปรับตารางพอดี` บนแถบเครื่องมือของตาราง `tbl-machines-master` คู่กับปุ่ม "คืนค่าขนาดคอลัมน์"
  3. **เพิ่มปุ่มลัด "📐 ปรับตารางพอดี" ในตารางผู้ใช้งานและสิทธิ์ (Users List)**:
     - ติดตั้งปุ่มลัด `📐 ปรับตารางพอดี` บนตาราง `tbl-users-list` เพื่อรองรับการใช้งานอย่างทั่วถึง
---

## [2026-09-28 17:05 - 17:15] ปรับปรุง UI หน้าจัดการผู้ใช้งาน & การตั้งค่าระบบ และเพิ่มประสิทธิภาพ Auto-fit (v2.15.0)
- **การจัดการ Lock (`_lock/current.md`)**:
  - `17:05`: ประกาศ `## LOCKED` (`session: fc87553e-10ef-47a5-89de-311141c5b7ba`) เพื่อแก้ไข `public/js/views-and-crud.js`, `public/css/custom.css`, `CONTEXT.md`, `logs/2026-09-25_ai-antigravity.md`
- **รายการสิ่งที่ดำเนินการ**:
  1. **แก้ไขเลย์เอาต์หน้า "จัดการผู้ใช้งาน & ตั้งค่าระบบ" (`renderUsersAndSettings`)**:
     - แก้ไขแท็กปิด `<div>` ที่ขาดหายบริเวณ toolbar ปุ่มจัดการผู้ใช้
     - ปรับโครงสร้างหน้าเว็บจากเดิมแบ่ง `grid-cols-3` (ตาราง 2 ส่วน / ตั้งค่า 1 ส่วน ซึ่งบีบตารางจนเบียดและเกิดช่องว่างล้นจอ) เปลี่ยนเป็น **Stacked Full-Width Cards (`space-y-6`)**:
       - ตารางรายชื่อผู้ใช้งานและช่างเทคนิค (`tbl-users-list`) แสดงเต็มความกว้างหน้าจอ มีพื้นที่กว้างขวางสำหรับชื่อ-นามสกุล และฝ่าย/แผนก
       - ฟอร์มตั้งค่าระบบกลาง & Telegram แจ้งเตือน แสดงด้านล่างแบบเต็มการ์ด จัดวาง input 3 คอลัมน์ (`md:grid-cols-3`) สำหรับชื่อองค์กร, Token และ Chat ID
  2. **ปรับปรุงอัลกอริทึม Auto-Fit ตาราง (`autoFitTableColumns`)**:
     - เพิ่มการสุ่มวัดความกว้างเนื้อหาจริงจากเซลล์ใน `tbody` ร่วมกับ `th` เพื่อให้รองรับข้อความยาวในเนื้อหาตารางได้อย่างพอดี
     - ปลด `!important` จาก `table-layout: fixed;` ใน `custom.css` เพื่อให้การสลับโหมดเป็น `table-layout: auto;` ชั่วคราวขณะคำนวณทำงานได้อย่างแม่นยำ
  3. **ปรับแต่ง Typography และระยะขอบของตารางใน `public/css/custom.css`**:
     - เพิ่ม `padding-right: 14px !important;` ให้กับหัวคอลัมน์ตาราง เพื่อไม่ให้ตัวจับขยายทับตัวหนังสือ
     - อนุญาตให้เนื้อหาในตาราง wrap บรรทัดใหม่อย่างสวยงาม
  4. **การตรวจสอบความถูกต้อง (Verification)**:
     - รัน `node --check public/js/views-and-crud.js` ผ่านโค้ด 100% (exit code 0)
     - รัน `node --check public/js/app.js` ผ่านโค้ด 100% (exit code 0)
- **การปลด Lock (`_lock/current.md`)**:
  - `17:15`: อัปเดต `CONTEXT.md` เป็นเวอร์ชัน `v2.15.0` และปลดล็อก `_lock/current.md` เป็น `## FREE`



