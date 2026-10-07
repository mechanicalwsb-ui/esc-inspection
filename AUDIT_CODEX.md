# รายงานตรวจสอบ Codebase — COMIS / ESC Inspection

**Eastern Sugar & Cane | Backend, Database, Security & Reliability Audit**  
วันที่ตรวจ: **7 ตุลาคม 2026 (Asia/Bangkok)** · เวอร์ชันใน `package.json`: **3.0.2**  
ผู้จัดทำ: **Codex — Senior Backend & Systems Specialist**  
ประเภทงาน: **Read-only code review; เพิ่มเฉพาะรายงานนี้ ไม่แก้ application code**

## 1. Executive Assessment — ข้อสรุปสำหรับผู้บริหารวิศวกรรม

ระบบมีพื้นฐานที่เหมาะกับงานตรวจเครื่องจักรแบบศูนย์กลางขนาดเล็ก: Node.js HTTP server, SQLite, authentication ด้วย session cookie, password hashing ด้วย scrypt, transaction สำหรับงานเขียน, idempotency สำหรับ retry และ revision checks สำหรับงานตรวจร่วมกัน อย่างไรก็ตาม **ยังไม่ควรถือว่าระบบพร้อมสำหรับการใช้งาน production ที่ต้องรับรองความปลอดภัยและความครบถ้วนของประวัติ** จนกว่าจะแก้ความเสี่ยงด้าน Stored XSS, migration ของทะเบียนแผนก, transport security และขอบเขต authorization

ความเสี่ยงต่อโรงงานคือการแก้ข้อมูลโดยใช้ session ของหัวหน้า/ผู้ดูแล การสูญเสียหรือย้ายความหมายของประวัติเครื่องจักรหลัง migration และการหยุดรับงานตรวจเมื่อ API queue ถูกคำขอช้าหรือ backup ขนาดใหญ่กีดขวาง ประเด็นเหล่านี้กระทบความน่าเชื่อถือของข้อมูลสำหรับซ่อมบำรุงและการสอบกลับ (Maintenance Traceability) โดยตรง

| Priority | ประเด็นหลัก | ผลกระทบทางธุรกิจ |
|---|---|---|
| **Critical** | C-01 Stored XSS ในรายงานผลตรวจ | ผู้ตรวจที่มีบัญชีสามารถฝากเนื้อหาที่ทำงานใน browser ของผู้ดูแล เปิดทางให้ใช้สิทธิ์ผู้ดูแลแก้ข้อมูล |
| **Critical** | C-02 Destructive department migration ไม่ atomic และ remap ไม่ครบ | ประวัติตรวจ/ใบซ่อมผูกแผนกผิด สูญเสียความหมายของ FK หรือข้อมูลจาก cascade |
| **High** | H-01 HTTP และ proxy trust/setup boundary | รหัสผ่านและ session เสี่ยงถูกดักอ่าน; first setup อาจเปิดผ่าน loopback proxy |
| **High** | H-02 Authorization ตรวจ destination และ read scope ไม่ครบ | ย้ายงานซ่อมข้ามแผนก/ข้อมูลทั้งโรงงานเปิดให้ทุกบัญชีอ่าน |
| **High** | H-03 Global API queue และ synchronous work | ผู้ใช้ทั้งโรงงานรอคำขอช้า การโจมตีด้าน availability ทำได้ก่อน login |
| **High** | H-04 Audit fail-open และ authentication changes ไม่ atomic | การแก้ไขสำเร็จโดยไม่มีหลักฐาน audit; session revocation อาจไม่ครบเมื่อเกิด error |
| **High** | H-05 Active DB ใน OneDrive และ restore ไม่มี runtime exclusion | Cloud sync ไม่แทน SQLite locking; restore เสี่ยงขณะ server ยังใช้งาน |
| **High** | H-06 ลบ master data แบบ cascade และไม่เก็บ form snapshot | หลักฐานตรวจย้อนหลังหายหรือแสดงชื่อ/แม่แบบที่เปลี่ยนแล้ว |
| **Medium** | M-01–M-07 Validation, schema, retry, backup, API contract, response lifecycle | ข้อมูลผิดชนิด ความขัดแย้ง และการกู้คืนที่ตรวจสอบได้ไม่ครบ |
| **Low** | L-01–L-03 Runtime packaging, documentation, launcher | เพิ่มภาระดูแลและความสับสนระหว่างรุ่น |

**ระดับความมั่นใจ:** หลักฐานโค้ดของ findings สูง; severity บางรายการขึ้นกับ deployment และการเข้าถึงจริง รายงานนี้ไม่อ้างว่าเกิดการโจมตีหรือข้อมูลสูญหายแล้ว

## 2. Scope, Method & Limitations — ขอบเขตและวิธีตรวจ

ตรวจไฟล์ backend ที่ร้องขอครบ ได้แก่ `server.js`, `src/db.js`, `src/gateway.js`, `src/reliability.js`, `src/security.js`, `src/csv-import.js`, `src/source-records.js`, `src/backup-cli.js` และ `tests/system.test.js` รวมถึง `src/bootstrap.js`, shared validation ใน `public/js/domain.js`, frontend report rendering, session/offline sync, Service Worker, launcher, `package.json`, `.gitignore`, README, CONTEXT และ collaboration/lock documents เพื่อเชื่อมโยงระบบตั้งแต่ client ถึง storage

สำรวจโครงสร้าง repository ซึ่งมี `public/`, `forms/`, `เอกสารตรวจเครื่องจักร/`, `github-pages-release/`, `data/`, `logs/`, `docs/`, `scratch/` และ `_lock/` การตรวจเชิงลึกเน้น executable backend และเส้นทางข้อมูล/security ที่เกี่ยวข้อง ไม่ได้พิสูจน์ความถูกต้องของทุกฟอร์มโรงงาน ทุก binary asset หรือทุก bundled vendor library และไม่ได้ทำ penetration test ของระบบที่เปิดใช้งานจริง

- อ่านโค้ดและติดตาม request → authorization → validation → transaction → audit → response → retry/undo
- ตรวจ schema declarations, migration, FK/cascade, JSON fields และ backup/restore lifecycle จาก source
- ตรวจ test assertions จริง แยกสิ่งที่ชื่อ test อ้างออกจากสิ่งที่ตรวจจริง
- พยายามรัน `node --no-warnings --test tests/system.test.js` แต่ environment นี้ไม่รู้จักคำสั่ง `node`; ตรวจ standard installation paths แล้วไม่พบ executable จึง **ไม่มีผล pass/fail จากการรันทดสอบใน audit นี้**
- `git` ไม่อยู่ใน PATH จึงไม่ได้ยืนยัน commit hash, tracked-file status หรือ diff ด้วย Git; การแก้ไขของงานนี้มีเพียงไฟล์รายงานใหม่
- ไม่เปิด production SQLite เพื่อแก้ไข ไม่รัน migration, purge, restore, backup หรือส่ง Telegram จริง; ไม่มีการรับรอง live `integrity_check`, live PRAGMA values, TLS configuration หรือ OneDrive sync status
- `_lock/current.md` ระบุงาน audit ของ Codex และ Claude อยู่แล้ว งานนี้อ่านโค้ดและสร้าง `AUDIT_CODEX.md` ตามคำสั่งผู้ใช้ ไม่แก้ lock ของผู้อื่นและไม่เปลี่ยน application files

เลขบรรทัดในรายงานอ้างอิงไฟล์ที่อ่านระหว่าง audit และอาจเคลื่อนหากมีการแก้ repository ภายหลัง

## 3. Backend & Server Architecture

### 3.1 Request and startup flow

```text
Startup
  src/db.js: open SQLite + journal/FK configuration
  initDatabase: schema → ALTERs → seed/purge/official-data synchronization
  Reliability/Security/SourceRecords: create auxiliary tables
  daily backup check → start HTTP or HTTPS listener

API request
  Gateway: serialized queue → parse JSON → session → role policy
    → identity attribution → idempotency/revision → validation
    → BEGIN IMMEDIATE → server/source-record handler
    → snapshot audit finalization → revisions + replay receipt
    → COMMIT → notification attempt → response

Static request
  handler directly → public/inspection-form file or SPA fallback
```

`server.js` เป็นทั้ง composition root, router, business service, static server และ response writer จำนวนมาก การแยก `security`, `gateway`, `reliability`, `bootstrap`, `csv-import` และ `source-records` เป็นก้าวที่ดี แต่ transaction และ audit ยังอาศัยการครอบ `res.end` สองชั้น (`src/gateway.js:150`, `server.js:171`) ทำให้ correctness ผูกกับ HTTP response lifecycle แทนขอบเขต business operation ที่ชัดเจน

**จุดแข็งที่ยืนยันจาก source:**

- SQL values ใช้ prepared statements โดยทั่วไป; dynamic table/column identifiers ส่วนสำคัญมาจาก internal maps ไม่ใช่ body โดยตรง
- `BEGIN IMMEDIATE` ครอบ mutation ส่วนใหญ่ รวม CSV และ inspection/health/defect/document-sequence
- notification ของ abnormal inspection อยู่หลัง commit (`server.js:593`) จึงไม่ส่งแจ้งเตือนก่อน transaction สำเร็จ
- gateway attribution แทน actor/inspector ด้วย authenticated identity ลดการปลอมผู้ทำรายการ
- JSON response ผ่าน `Gateway.sanitize` เพื่อซ่อน settings secrets และ undo payload จาก non-admin
- static inspection-form route ตรวจ resolved path และ extension; source-doc route เลือก path จาก catalogue

**ข้อจำกัดหลัก:** ไม่มี service/repository boundary, ไม่มี request context แบบ explicit, global audit actor อาศัย serialization, synchronous SQLite/crypto/filesystem ทำงานบน event loop และไม่มี bounded queue หรือ deployment-level single-instance enforcement

### 3.2 Recommended architecture

คง Node.js + SQLite ได้สำหรับ single-host deployment แต่แยก `routes`, application services, repositories, authorization policies และ operational jobs ให้ชัดเจน ใช้ service return value ที่เป็น `{status, body}` แล้วให้ transaction helper commit ก่อน response writer ส่ง headers/body ห้ามให้ service เรียก `res.end` เอง ส่ง `actor_id`, request ID และเวลาเป็น context เข้า audit writer โดยตรง

ให้ SQLite อยู่บน local storage นอก sync folder; เฉพาะ verified backups จึงส่งไปพื้นที่สำรอง หากต้องใช้หลาย application instances หรือ throughput สูง ให้ประเมิน PostgreSQL ตาม workload จริง การเปิด WAL เพียงอย่างเดียวไม่ทำให้ API queue ปัจจุบันรองรับ concurrent execution

## 4. Database Layer & Data Integrity

### 4.1 Journal mode, isolation and concurrency

**ข้อเท็จจริง: ระบบไม่ได้ใช้ WAL** `src/db.js:15` ตั้ง `PRAGMA journal_mode = DELETE` และ `foreign_keys = ON` ตาม README/CONTEXT ไม่พบ explicit `busy_timeout`, `synchronous` หรือ application indexes ใน DB initialization ที่ตรวจ ค่า default ของ SQLite/runtime ต้องตรวจจากระบบจริง ไม่ควรอ้างว่าถูกตั้งเป็นค่าที่ต้องการแล้ว

DELETE mode ใช้ rollback journal; WAL ช่วยให้ readers กับ writer ทำงานร่วมกันได้มากขึ้น แต่ยังมี writer เดียว และ WAL ไม่รองรับการใช้ฐานร่วมข้าม host ผ่าน network filesystem ตาม [SQLite WAL documentation](https://www.sqlite.org/wal.html) OneDrive folder เป็น local folder ที่มี cloud replication เพิ่มเข้ามา จึงต้องแยกความเสี่ยงของ sync client ออกจากข้อจำกัด network filesystem: SQLite locks ไม่ได้ส่งต่อผ่าน cloud replication ไม่ว่าใช้ DELETE หรือ WAL

`tail` ใน gateway จัดคิว **ทุก API request รวม GET และ auth** ใน process เดียว จึงช่วยไม่ให้ async handler อื่นใช้ connection/actor ซ้อนกัน แต่ไม่ป้องกัน CLI, server instance ที่สอง หรือเครื่องอีกเครื่อง `BEGIN IMMEDIATE` รับ write transaction ตั้งแต่ต้น; external contention ยังอาจทำให้ `SQLITE_BUSY` และ commit อาจล้มเหลวได้ ตาม [SQLite transaction documentation](https://www.sqlite.org/lang_transaction.html)

Validation, existing-row reads และ If-Match checks เกิด **ก่อน BEGIN** ดังนั้นแม้ปลอดการแข่งขันภายใน API queue เดียว แต่ external writer สามารถเปลี่ยน row/revision ระหว่าง check กับ transaction ได้ ต้องย้าย invariant checks เข้า transaction และใช้ conditional update หรือ deployment exclusion เพิ่ม

### 4.2 Atomic batch and rollback guarantees

| Operation | ปัจจุบัน | เงื่อนไข/ข้อจำกัด |
|---|---|---|
| Inspection + health + auto defect + sequence | อยู่ใน gateway transaction | ต้องไม่ถูกเขียนผ่าน connection/entrypoint อื่น; audit writer ยัง swallow error |
| CSV import | อยู่ใน gateway transaction | `importRows` ไม่เปิด transaction เอง ต้องรักษา caller contract |
| Revision and idempotency receipt | เก็บก่อน commit ใน transaction เดียว | headers ถูกเตรียมก่อน commit; optional idempotency key |
| Undo row changes | ตรวจ after-state แล้ว restore ใน transaction | ครอบคลุมเฉพาะ KEYS; cascade ไปตารางอื่นและ metadata มีข้อจำกัด |
| Password setup/reset/session issue | return ก่อน generic transaction | password write/session deletion/session issue ไม่ atomic |
| Startup schema/seed/purge/sync | หลาย autocommit statements | crash/error ระหว่างขั้นตอนไม่มี whole-operation rollback |
| Restore file replacement | copy → check → rename | ไม่มี server lock, recovery manifest หรือ sidecar policy |

Gateway rollback สำหรับ errors ก่อน commit เป็นมาตรการสำคัญ แต่ไม่ใช่ universal guarantee: auth handlers และ startup ไม่ผ่าน transaction เดียวกัน; audit failures ถูกกลืน; post-commit serialization/send failure ย้อน business data ไม่ได้ ต้องใช้ idempotency รับกรณี client ไม่ทราบผลลัพธ์

### 4.3 Schema invariants

มี UNIQUE สำหรับ business codes/doc numbers, FK ของ relational tables หลายรายการ และ FK sessions/credentials ที่ cascade ตาม users เป็นจุดดี แต่ยังขาด:

- CHECK สำหรับ role/status/criticality, nonnegative numbers, boolean flags และ valid JSON
- FK สำหรับ `inspections.route_id`, `route_round_id` ที่เพิ่มด้วย ALTER และ `machine_placements.machine_code`
- FK ของ route stops/form references/inspection references ซึ่งฝังอยู่ใน JSON
- indexes สำหรับ department/FK columns, inspection date, repair status และ session expiry; UNIQUE/PK indexes มีอยู่โดย SQLite แต่ไม่แทน indexes ตาม query workload
- immutable identity และ snapshot ของ form version/thresholds สำหรับ inspection ที่ลงนามแล้ว
- lifecycle invariant เช่น approved/rejected state transition, authorization of reassignment, exactly one completion per route stop

ต้องตรวจ orphan และ semantic mismatch ก่อนเติม constraints เพราะ FK เพียงตรวจว่า ID มีอยู่ ไม่ตรวจว่า ID นั้นยังหมายถึงแผนกเดิม

## 5. Detailed Findings — ความเสี่ยงพร้อมหลักฐานและแนวทางแก้

### C-01 — Stored XSS เปิดทางใช้สิทธิ์ของผู้ดูแล

**Evidence:** `public/js/views-and-crud.js:395` (`openInspectionReportModal`) นำ `a.value`, `a.remark`, `ins.inspector_note` และข้อมูลอื่นแทรกใน HTML template โดยไม่ escape; `public/js/domain.js:24` validation ไม่กำหนดให้ remark/note เป็น plain text ที่ปลอดภัยเมื่อ render ภายหลัง ข้อมูลถูกเก็บใน `answers_json`/`inspector_note` แล้วกลับมาใน bootstrap รูป/ลายเซ็นถูกแทรกใน HTML attributes โดยมีเพียง prefix check สำหรับ signature

**Risk path:** ผู้ใช้ที่มีสิทธิ์สร้าง inspection ของเครื่องในแผนกตนส่ง markup/event-bearing content ใน remark/note → ข้อมูลเก็บถาวร → หัวหน้าหรือผู้ดูแลเปิดรายงาน → browser render HTML ของผู้โจมตี HttpOnly ป้องกันการอ่าน cookie จาก JavaScript แต่ไม่ป้องกัน script ส่ง same-origin API requests ด้วย session ของเหยื่อ

**Confidence:** Source-confirmed unsafe source-to-render path; ไม่ได้รัน browser exploit ใน audit นี้ จัด Critical เพราะผลลัพธ์อาจข้ามจาก inspector ไป super_admin ได้ และไม่มี CSP mitigation ใน server ที่ตรวจ

**Implementation:** เปลี่ยน text fields เป็น DOM `textContent` หรือ context-aware HTML escaping ทุกจุด; ตรวจ image MIME/base64/decoded size จริงและสร้าง URL attributes ผ่าน DOM; หากต้องรองรับ rich text ให้ใช้ vetted sanitizer แบบ allowlist เพิ่ม CSP ตาม script loading จริง ไม่ใช้ CSP แทนการแก้ sinks ทดสอบทั้ง report modal, print view, defect view และ field/label rendering ด้วย inert malicious fixtures

### C-02 — Department migration ทำลายข้อมูลหรือ remap ประวัติผิด

**Evidence:** `src/db.js:708` (`syncOfficialFactoryDepartmentsSqlite`) snapshot/remap เฉพาะ `machines`, `form_templates`, `inspection_routes`, `route_rounds`, `users` (`:757`) แล้ว `foreign_keys=OFF`, `DELETE FROM departments` (`:764`) และสร้าง ID ใหม่ ไม่ remap `inspections.department_id`, `defect_tickets.assigned_dept_id` และ `source_form_records.department_id` ไม่ครอบ startup operation ด้วย transaction; `initDatabase` เรียก sync ก่อน Security/SourceRecords initialization และก่อน startup backup

**Consequences:**

1. แผนกเก่า ID เดิมอาจหมายถึงคนละ code หลังสร้างใหม่ ทำให้ historical inspection/repair ผูกแผนกผิดโดย FK check ยังผ่าน
2. ถ้า ID เดิมไม่มีในชุดใหม่ จะเกิด orphan references เมื่อ re-enable FK ซึ่งไม่ได้ตรวจข้อมูลย้อนหลังเอง
3. Crash หลัง DELETE/ระหว่าง remap ทิ้งฐานใน partial state; error ถูก catch แล้วคืน object ซึ่ง startup callers ไม่ตรวจทุกผลลัพธ์
4. เส้นทาง `/api/system/purge-mockup` เรียก sync แบบ force ภายใน gateway transaction การเปลี่ยน `PRAGMA foreign_keys` ภายใน transaction ไม่มีผล ตาม [SQLite PRAGMA documentation](https://www.sqlite.org/pragma.html#pragma_foreign_keys) ดังนั้น DELETE อาจ SET NULL/cascade ก่อน remap และ inspection/defect columns ที่ไม่อยู่ใน snapshot อาจกลายเป็น NULL

**Implementation:** เลิก rebuild stable department IDs; upsert ด้วย code และเปลี่ยนสถานะ obsolete แทนลบ หากต้อง merge ให้ใช้ explicit old→new mapping ที่ครอบคลุมทุก referencing table ภายใน transaction พร้อม pre/post assertions; backup **ก่อน** migration, fail startup เมื่อ invariant ไม่ผ่าน และใช้ versioned migration ledger ทดสอบจาก legacy DB ที่มี inspections, defects และ source records จริงบนสำเนา

### H-01 — HTTP defaults และ deployment/proxy trust ไม่ปลอดภัยครบ

**Evidence:** `server.js:1148` สร้าง HTTPS เฉพาะเมื่อมีทั้ง cert/key; ปกติ HTTP และ bind `0.0.0.0` `Security.issue` เพิ่ม Secure เฉพาะ `req.socket.encrypted` (`src/security.js:20`); first setup ดูเฉพาะ socket remoteAddress (`src/gateway.js:100`)

**Impact:** HTTP บน LAN ส่ง credentials/session แบบ plaintext หาก terminate TLS ที่ reverse proxy แล้ว backend เป็น HTTP cookie จะไม่ติด Secure ตาม code ปัจจุบัน นอกจากนี้ proxy บนเครื่องเดียวกันอาจทำให้ request จากภายนอกมี loopback remoteAddress และผ่าน first-setup restriction ได้ ทั้งสองกรณีขึ้นกับ deployment จริง ไม่ได้ยืนยันว่ามี proxy ใช้งานอยู่

**Implementation:** production mode ต้องบังคับ HTTPS/secure cookie; ระบุ trusted proxy addresses และ forwarding protocol policy โดยไม่เชื่อ forwarded headers จากผู้ใช้โดยตรง ปิด setup route หลัง provisioning และบล็อกที่ proxy หรือใช้ local CLI/one-time bootstrap secret ที่ไม่เปิดผ่าน public listener เพิ่ม tests สำหรับ native TLS, trusted/untrusted proxy และ incomplete TLS configuration

### H-02 — Authorization gaps: destination department และ data scope

**Evidence:** `src/gateway.js:18` ตรวจ department จาก existing row หรือ `b.department_id`; `b.assigned_dept_id` ตรวจเพียง existence (`:34`) จึงไม่ได้เทียบ destination กับ user department เมื่อสร้าง/แก้ defect `server.js:676` เขียน destination ที่ client ส่งได้ `Security.allowed` อนุญาต GET เกือบทุก API สำหรับทุก role; `src/bootstrap.js` อ่าน business tables/users ทั้งหมด `sanitize` ตัด secrets/undo แต่ไม่ filter department หรือ phone/email

**Concrete scenario:** dept_admin ของ ML แก้ ticket ที่ assigned ML ด้วย If-Match ปัจจุบันและส่ง assigned_dept_id ของ EM; existing ownership ผ่าน ส่วน destination เพียงมีอยู่จริง จึงย้ายงานเข้า EM ได้ Inspector เปิด defect ของเครื่องแผนกตนแต่ส่ง assigned_dept_id ของแผนกอื่นได้เช่นกัน

**Important distinction:** การอ่านข้อมูลทั้งโรงงานอาจเป็น policy ที่ตั้งใจสำหรับ dashboard; source records GET มี department filtering แล้ว จึงต้องให้เจ้าของระบบกำหนด read policy แยกจาก mutation policy ไม่ควรสรุปว่า global read ทุกแบบเป็น unauthorized โดยอัตโนมัติ

**Implementation:** explicit policy `(actor, action, existing resource, proposed resource)`; แยก permission `repair.reassign.cross_department`; filter read queries ตามสิทธิ์และใช้ minimal user DTO; ตรวจ parent round department และ form scope ของ inspections ด้วย โดยเฉพาะ null ownership และ JSON relationships

### H-03 — API queue ถูก head-of-line blocking และไม่มี admission control

**Evidence:** `src/gateway.js:82,173` ใช้ promise tail เดียว; parseBody อยู่ภายใน queued dispatch ก่อน authentication รองรับ body 25 MB (`server.js:46`); scryptSync, bootstrap/snapshot และ source document readFileSync ทำงาน synchronous `/api/telegram/test` await external fetch โดยไม่มี explicit timeout

**Impact:** unauthenticated slow upload จอง API queue; valid login/password work ใช้ CPU ทั้ง process; large bootstrap/CSV/backup กีดขวางงานตรวจทุกแผนก Timer timeout ของ HTTP ไม่ได้กำหนดเวลารอทั้งหมดใน application queue และ `req.aborted` ไม่มี explicit cleanup path ใน parseBody เมื่อคำขอ queued/connection ถูกยกเลิก ต้องทดสอบว่ามี promise ค้างใน runtime หรือไม่

**Implementation:** จำกัด body size ตาม endpoint และอ่าน/validate body ก่อนเข้า write queue; bounded queue พร้อม 503/Retry-After; deadline และ aborted/close handling สำหรับทุกงาน แยก read scheduling จาก writer เมื่อ architecture รองรับ explicit context ใช้ async crypto/worker ตาม workload และกำหนด external fetch timeout เพิ่ม rate limits สำหรับ login, password verify/reset, upload และ expensive routes

### H-04 — Audit fail-open และ password/session updates ไม่ atomic

**Evidence:** `src/db.js:1279` (`logAudit`) catch error แล้ว log console; `server.js:117` snapshot finalization catch error แล้วปล่อย response ต่อ; auth setup/password/login returns ก่อน `BEGIN IMMEDIATE` (`src/gateway.js:98–120` เทียบ `:148`) ไม่มี audit login/logout/password/reset/failed authentication events

**Impact:** business mutation commit ได้แม้ audit insert/undo generation ล้มเหลว Password hash update สำเร็จแต่ session deletion ล้มเหลวอาจทำให้ old session ยังคงใช้ได้ หรือ password เปลี่ยนแล้ว client ได้ error และไม่มี session ใหม่ Global authenticatedActor ปลอดภัยเพราะ queue ปัจจุบันเท่านั้น หากเพิ่ม concurrency โดยตรง attribution อาจปะปน

**Implementation:** business audit insertion ต้องเป็น required part ของ transaction และ throw เมื่อทำไม่ได้; เก็บ actor user ID + role/department snapshot + request ID + outcome จัด auth credential/session changes เป็น transaction เดียว เพิ่ม auth security events ที่ไม่บันทึก password/token; ใช้ explicit context; แยก reversible undo data ออกจาก append-only audit evidence และกำหนด retention/ACL

### H-05 — OneDrive DB/restore และ `_lock` ไม่ใช่ runtime locking

**Evidence:** default DB อยู่ `data/comis.db` ใน repository ซึ่ง workspace อยู่ OneDrive; `_lock/current.md` เป็น Markdown coordination ตาม `COLLABORATION_RULES.md` ไม่พบ server/backup CLI enforcement `src/backup-cli.js:12` เช็คเพียง presence ของ `--server-stopped`, backup old target, copy temp แล้ว rename target ไม่มี process/OS lock

**Impact:** Markdown lock ไม่ป้องกัน server instance ซ้ำ และ flag ไม่พิสูจน์ว่าหยุด server จริง Windows อาจ reject rename เมื่อมี handles; ระบบอื่นอาจให้ old connection ใช้ old file ต่อ ไม่มี policy สำหรับ hot rollback journal หรือ WAL/SHM หาก restore DB ที่มี sidecars Backup อยู่ใกล้ DB จึงมี correlated disk/sync failure

**Implementation:** ย้าย active DB นอก OneDrive; ใช้ single-instance local OS locking สำหรับ server/restore และให้ restore ปฏิเสธเมื่อ acquire lock ไม่ได้ หลังหยุดทุก connection ให้ตรวจ journal state ตาม runbook ก่อน replace ใช้ verified temp artifact, retained backup, manifest และ recovery steps ตรวจ rename failure/disk-full ทุกขั้น; replication เฉพาะ closed verified backup ไปอีก failure domain

### H-06 — Cascade deletion และไม่มี immutable inspection template

**Evidence:** `src/db.js:96` inspections FK ไป machine/form เป็น ON DELETE CASCADE; defect FK ไป machine cascade; route_rounds FK ไป route cascade DELETE handlers ลบ master rows จริง (`server.js:335` และ handlers ของ forms/routes) Bootstrap join form/machine ปัจจุบันเพื่อแสดง historical names โดย inspections ไม่เก็บ full template version/threshold snapshot

**Impact:** ผู้ดูแลลบ machine/form แล้ว inspection evidence หาย การแก้ฟอร์มภายหลังทำให้ตรวจย้อนกลับไม่ได้ว่าตอนวัดใช้เกณฑ์ใด Undo ไม่ใช่ substitute ของ record-retention policy โดยเฉพาะ cascade ไปตารางที่ KEYS ไม่ครอบคลุม

**Implementation:** archive master data ผ่าน is_active; ใช้ RESTRICT สำหรับ signed inspection references และ explicit archival/purge policy เก็บ template ID/version/hash + threshold/schema snapshot + machine identification snapshot ใน record ตรวจว่า delete/undo ไม่ทำให้ historical forms, credentials หรือ source records สูญหาย

### M-01 — Validation และ workflow invariants ยังไม่ครบ

**Evidence:** `Domain.validateInspection` ยอม `emergency_quick` ให้ข้าม template matching/required/signature และรับ arbitrary field IDs; numeric classification ตรวจ value แต่ nonnumeric fields ไม่ validate option/type อย่างครบ `require_photo_on_abnormal` มี setting แต่ไม่พบ server-side enforcement ใน validation/inspection handler `Gateway.validate` ไม่ตรวจ route stops/form association ทุกตัว, shared draft note/attachment sizes และ target/assignment lifecycle อย่างครบ

**Impact:** emergency endpoint policy ต้องไม่ถูกใช้เพื่อส่งค่าที่หลีกเลี่ยงหลักฐานการตรวจ; abnormal result ไม่มี photo แม้ setting ระบุ require; malformed JSON/type บางกรณีได้ 500 แทน 422; round codes เป็น UTC date + random 900 possibilities (`server.js` round creation) จึงชนกันได้เมื่อเปิดหลายรอบ

**Implementation:** endpoint schemas, allowlisted fields, strict types/lengths, per-image limits และ server-side option rules; แยก emergency schema/permissions ชัดเจน; validate route stop machine/form/department พร้อม form activation; ใช้ transactional sequence หรือ UUID สำหรับ round codes; นิยาม photo/signature exceptions ตาม factory SOP และตรวจ backend จริง

### M-02 — Schema migration ledger และ constraints ไม่ครบ

**Evidence:** `src/db.js:214` safeAddColumn กลืนทุก ALTER error เสมือน column already exists ไม่ใช้ user_version/migration ledger; initial seed early-return เมื่อ departments มีข้อมูล (`:333`) แม้ tables/settings/forms อาจยัง seed ไม่ครบ Startup synchronization หลายฟังก์ชัน swallow errors

**Implementation:** numbered transactional migrations, checksum/version ledger, column introspection แทน blanket catch, fail-fast startup และ backup ก่อนเปลี่ยน schema เพิ่ม CHECK/FK/index ผ่าน staged migration พร้อม orphan/JSON/data-range checks กำหนด invariant ว่า restart และ upgrade ที่ไม่มี migration ต้องไม่เปลี่ยน business records

### M-03 — Revision/idempotency coverage และ retry after undo

**Evidence:** generic If-Match ใช้ numeric prefix regex (`src/gateway.js:175`), settings PUT ไม่อยู่ใน coverage; hub settings และ placement มี bespoke checks CSV update ไม่รับ row expected revisions; validation/revision/idempotency lookup ก่อน BEGIN `api_requests` ไม่มี timestamp/expiry/retention และ receipt มี optional key Undo ไม่เปลี่ยน receipt เดิม

**Impact:** CSV สามารถทับข้อมูลล่าสุดโดยไม่มี expected state; settings เขียนทับกัน; retry หลัง undo อาจ replay success ของ resource ที่ถูกย้อนแล้ว แม้ attached bootstrap สะท้อนข้อมูลปัจจุบันแล้ว Regex/prefix route handling บางจุดยังยอม suffix ที่ไม่อยู่ใน contract

**Implementation:** exact route patterns, version checks inside transaction, required idempotency for offline-sensitive creates, per-row expected revisions สำหรับ CSV หรือ explicit override workflow กำหนดว่า receipt หลัง undo เป็น historical receipt หรือ invalidated operation แล้วสื่อสารสถานะชัดเจน; เพิ่ม timestamps และ retention ที่ยาวกว่าช่วง offline queue สูงสุด หลีกเลี่ยงลบ receipt จนทำให้ queued retry กลายเป็น duplicate

### M-04 — Snapshot/undo cost และ coverage ไม่ครบ

**Evidence:** mutating API handler snapshot full business tables แล้วอ่านทั้งชุดซ้ำเพื่อ diff/normalize (`server.js:109`, `src/reliability.js:28`); เก็บ delta เดียวให้หลาย audit logs ของ request; KEYS ไม่รวม credentials/sessions/source_form_records/sequences/revisions แม้ source-record create ผ่าน snapshot wrapper

**Impact:** photos/signatures ใน JSON ถูก copy ซ้ำใน memory และ undo payload; เวลา/memory โตตามข้อมูลทั้งโรงงาน Source records มี audit แต่ไม่สามารถ undo ผ่าน delta ปัจจุบัน ซึ่งอาจถูกต้องตาม append-only policyแต่ metadata ควรระบุชัด Normalization overwrite inserted inspected_at/started_at ด้วยเวลาปัจจุบัน ต้องแยก actual event time จาก server ingestion time สำหรับ offline work Undo cascade ยังอาจลบข้อมูลที่ไม่มี snapshot โดย FK ไม่แจ้งว่าข้อมูลสัมพันธ์ถูกลบไปแล้ว

**Implementation:** service บันทึก before/after เฉพาะ affected rows; explicit undo eligibility และ dependencies; preserve occurred_at vs received_at; separate attachment storage จาก row/audit payload เก็บ sequence แบบ monotonic ต่อไปได้โดยตั้งใจ ไม่จำเป็นต้อง undo sequence แต่ต้อง document semantics

### M-05 — Backup readiness, retention and notification recovery

**Evidence:** `Reliability.backup` ใช้ VACUUM INTO + integrity_check แต่ไม่ foreign_key_check; CLI check เพิ่ม FK และตรวจเพียงสี่ table names Startup/timer เช็คชื่อ file prefix ของวัน ไม่ตรวจ latest manifest/file content; startup backup อยู่หลัง migration API backup ใช้ default path ของ reliability ไม่ใช้ configured backupDir ทุกกรณี ไม่มี retention policy Notification หลัง commit เป็น memory callback ไม่มี durable retry/outbox

**Impact:** file ที่ backup verification ล้มเหลวแต่เหลือใน directory อาจทำให้ scheduler เห็นว่า backup วันนี้มีแล้ว; schema-compatible แต่ semantic-corrupt DB ยังผ่าน integrity; backup path ไม่ตรง deployment configuration; disk เต็มจาก backups/audit receipts; crash หลัง commit ก่อนส่ง Telegram ทำให้ alert หาย

**Implementation:** verified backup manifest หลัง integrity+FK+schema checks สำเร็จ; unify configured path; timestamp/age alert และ periodic restore drill; pre-migration backup; retention พร้อม capacity monitoring; transactional outbox สำหรับ notification พร้อม retry/dead-letter ไม่รับรอง exactly-once ที่ external messaging ปลายทาง

### M-06 — HTTP response lifecycle และ error contract

**Evidence:** `sendJson` เรียก `res.writeHead` ก่อน `res.end` ส่วน gateway เพิ่ง COMMIT ใน end wrapper และเมื่อ error เปลี่ยนเพียง `res.statusCode` (`src/gateway.js:165`) Bootstrap ถูก refresh หลายครั้งก่อน commit แล้ว sanitize/stringify หลัง commit Error responses เปิด `err.message` จาก database/filesystem โดยตรง

**Impact:** commit-time error อาจคืน error body ภายใต้ success headers ที่สร้างไว้แล้ว ต้องทดสอบ wire status จริงด้วย forced COMMIT failure; serialize failure หลัง commit ทำให้ client เข้าใจว่าบันทึกไม่สำเร็จ ขณะที่ DB เปลี่ยนแล้ว ไม่มี error code/request correlation ที่คงที่

**Implementation:** เตรียม response payload ให้ serialize ได้ก่อน commit; commit ก่อน writeHead; response writer แบบจุดเดียว; map domain/constraint/busy errors เป็น structured codes และ retryability; redact internal error detail จาก client บันทึก stack/request ID ใน server logs ทดสอบ deferred FK commit failure และ disconnected client หลัง commit

### M-07 — API versioning, source document portability and read models

**Evidence:** ไม่พบ `/api/v1` implementation; API จริงเป็น `/api/...` ข้อมูลหลักอ่านผ่าน full bootstrap ไม่ใช่ paginated resources SourceRecords default root เป็น personal absolute Windows path `source_hash` เทียบ catalogue metadata แต่ไม่ hash bytes ของ live document ทุกครั้ง; source-doc serving อ่าน entire file synchronous

**Impact:** client/server version mismatch และ polling costs โตตาม data/photos; source records list ถูกจำกัด 1000 โดยไม่มี pagination; original source file เปลี่ยนภายนอกแต่ catalogue hash ยังเดิมทำให้ version evidence ไม่ครบ

**Implementation:** ออก OpenAPI contract สำหรับ endpoints ปัจจุบัน แล้วเพิ่ม `/api/v1` อย่างมี compatibility window อย่า rename ทันที แยก paginated/delta read models และ summary; validated source-root configuration/read-only ACL; content-addressed immutable source versions พร้อม hash verification ที่เหมาะกับ performance; stream source documents และ handles/errors อย่างครบ

### Low Priority

- **L-01 Runtime and dependency governance:** `package.json` ระบุ Node >=22.13.0 และไม่มี npm runtime dependencies เป็นข้อดีด้านพื้นที่โจมตี แต่ `node:sqlite` ผูกกับ Node/SQLite version และ bundled frontend libraries ยังต้องมี inventory/license/security update process ระบุ supported runtime version ใน deployment, run syntax/tests ใน CI และติดตาม bundled vendor versions
- **L-02 Documentation/release drift:** CONTEXT และบาง comments ยังอธิบายรุ่น/LocalStorage/จำนวนแผนกเก่า มีหลายสำเนา HTML/forms/release directories ต้องประกาศ canonical source, reproducible release process และ checks ที่กัน client bundle ต่างรุ่น โดยไม่ตัดสินว่าทุกสำเนาเป็น dead code
- **L-03 Launcher:** `start-comis.js` เปิด `http://localhost:3000` ก่อน server ready และไม่ตาม PORT/TLS configuration ควรเปิด actual configured URL หลัง listen success พร้อม windowsHide สำหรับ background helper ตาม deployment policy

## 6. Authentication & API Security Assessment

| Control | สิ่งที่มี | สิ่งที่ควรเพิ่ม |
|---|---|---|
| Passwords | scryptSync, random 16-byte salt, 64-byte hash, timingSafeEqual, 10–128 characters | async/bounded crypto, credential update transaction, auth audit, test corrupted credential handling |
| Sessions | random 32-byte token, SHA-256 stored hash, 8-hour expiry, HttpOnly/SameSite=Strict | production Secure enforcement, session cap/cleanup, explicit proxy trust, reset/login event tracking |
| Temporary password | must_change บล็อก business APIs; password route เปลี่ยนรหัสได้ | test expiry/reset race and session invalidation failures |
| Roles | super_admin/dept_admin/inspector/viewer with route allowlist | proposed-state/parent authorization; unknown role deny; separate action permission model |
| CSRF | strict cookie, JSON content type, Origin-vs-Host check สำหรับ mutations | validate Host/deployment origin, trusted proxy configuration; XSS fix เพราะ CSRF controls ไม่กัน injected same-origin script |
| Rate limiting | failed login 10 attempts/15 min ต่อ remote IP in-memory | account+IP/global bounds, cleanup, password endpoint limits, durable/shared store ตาม topology |
| SQL injection | prepared values และ fixed maps ในเส้นทางหลัก | maintain identifier allowlists; malformed input tests; ไม่มีหลักฐาน SQL injection ที่ยืนยันใน audit นี้ |
| Output security | secrets/undo stripped from non-admin bootstrap | safe HTML sinks, CSP, nosniff/security headers, least-data DTO/read filtering |
| Logs | business logs และ console errors | append-only audit, authentication outcomes, request IDs, redaction, retention/monitoring |

Login limiter รีเซ็ตเมื่อ process restart หรือ successful login และ Map ไม่มี global eviction; ผู้ใช้หลายคนหลัง proxy อาจใช้ IP bucket เดียว การเปลี่ยนรหัสใช้ verify โดยไม่มี limiter เดียวกับ login จึงไม่ควรเรียกมาตรการปัจจุบันว่า comprehensive brute-force/DoS protection

API `/api/v1` ในขอบเขตคำขอ **ยังไม่มีใน implementation นี้** การประเมินนี้ครอบคลุม `/api` ที่มีจริง รวม auth, bootstrap, departments, machines, forms, inspections/approve, defects, routes, route-rounds/join/draft, users, settings, hub-settings, placements, CSV, audit/client-event/undo, system/backup/purge, Telegram และ source catalogue/documents/records

## 7. Reliability, Crash Recovery & Test Coverage

SQLite transaction/journaling ช่วย atomic commit ของ writes ที่อยู่ใน transaction แต่ power-loss durability ต้องดู PRAGMA ที่มีผลจริง storage/OS และสภาพการ sync มี backup ไม่เท่ากับ HA ระบบไม่มี SIGTERM/SIGINT graceful shutdown flow สำหรับ stop accepting → drain queue → close DB และไม่มี health/readiness endpoint หรือ structured operational metrics ใน server ที่ตรวจ

### 7.1 Coverage ที่มีใน `tests/system.test.js`

พบ **13 test declarations** พร้อม fresh server/temp DB fixture และ production-upgrade test ที่ใช้สำเนา ไม่ใช่ mutation ของ production DB โดยตรง Tests ครอบคลุม:

- Hub user assignments/default settings role permissions และ stale settings
- Authentication บางส่วน, viewer write deny, secret/undo redaction
- Numeric thresholds, monthly document pattern และ duplicate retry
- Validation fail without record creation และ health ที่ไม่ปิด open repair เอง
- CSV quoted multiline parsing และ invalid department rejection
- Placement/entity conflicts; undo preserve unrelated rows และ block later-changed rows
- Verified backup, CLI restore บนสำเนา และ FK check
- Trigger-induced defect insert failure ระหว่าง inspection write
- Shared draft revision, trusted attribution และ emergency ไม่ complete route stop
- Upgrade จาก production copy ไม่เปลี่ยน existing rows และ stopped running-only fields

**ข้อจำกัดที่สำคัญ:**

1. CSV rollback test ใช้ invalid department ซึ่ง prevalidation ปฏิเสธก่อนเขียน จึงพิสูจน์ early rejection มากกว่า mid-batch rollback ต้องเพิ่ม trigger failure ในแถวหลัง
2. Test ที่ชื่อรวม document sequence rollback ไม่ assert sequence/revisions/audit/api_requests โดยตรง ตรวจเพียง inspections/defects/health
3. Shared-draft test และ conflict tests ส่งตามลำดับ ไม่ใช่ concurrent requests ที่แข่งขันกันจริง
4. Upgrade test ใช้ current `data/comis.db` copy; ถ้า migration flags ครบแล้ว destructive legacy path อาจไม่ได้ทำงาน ไม่แทน synthetic legacy fixtures
5. ไม่มี auth rate-limit/expiry/logout/reset-failure/proxy tests, cross-department reassignment tests, Stored XSS browser tests หรือ commit failure response-status test
6. ไม่มี process-kill-between-writes, disk-full, lock contention, restore-while-running, corrupt schema, backup false-positive, round collision, source-record server integration และ sustained load tests ในไฟล์นี้
7. Browser/source-form check scripts มีแยก แต่ `npm test` pattern เป็น `tests/*.test.js` จึงไม่ได้รันทุก `*-check.js` อัตโนมัติ Fixtures retain ใน temp โดยตั้งใจ; ควรมีกระบวนการล้างพื้นที่ใน CI

### 7.2 Required verification matrix

| Test group | วิธีตรวจบน isolated fixtures | Acceptance |
|---|---|---|
| Authorization | ML/EM actors, defect create/reassign, null dept, parent round/form scope, read DTO | deny unauthorized proposed state; no unintended PII/secrets |
| Stored XSS | submit inert event/markup fixtures แล้วเปิด report/print ใน browser | แสดงเป็น text; ไม่มี script/event execution |
| Atomicity | trigger failure ที่ CSV row 2, audit insert failure, sequence failure, deferred FK COMMIT failure | business+audit+version+receipt rollback; wire status ไม่เป็น success |
| Concurrency | parallel same If-Match, same idempotency key, external writer | one accepted state change; documented 409/503 and no duplicate |
| Migration | legacy department IDs + all referencing tables; crash/restart between steps | stable business identity; FK+semantic checks pass; idempotent restart |
| Recovery | kill child server before/after commit; offline restore; active-server restore rejection | committed data preserved, partial writes absent, restore exclusion works |
| Backup | corrupt/fake daily filename, disk full, custom dirs, schema mismatch | verified manifest required; alert/error visible; no false ready state |
| Availability | slow/aborted unauthenticated uploads, login load, full-size data, hanging notification | bounded queue/latency; unaffected legitimate work meets agreed SLO |

กำหนด baseline บนจำนวนเครื่อง/ใบตรวจ/ภาพตามโรงงานจริงก่อนตั้ง latency/throughput target รายงานนี้ไม่มี measured performance figures และไม่ให้เปอร์เซ็นต์ test coverage ที่ไม่ได้วัด

## 8. Actionable Improvement Plan — แผนปรับปรุงเรียงความสำคัญ

เวลาข้างล่างเป็น planning estimates ไม่ใช่ commitment; ทุก change ต้องตรวจบน staging/สำเนา และ production release ตาม governance ของโรงงาน

| Priority / Window | Implementation steps | Suggested owner | Exit criteria |
|---|---|---|---|
| **Critical — ก่อนขยายใช้งาน** | แก้ Stored XSS sinks/attributes; เพิ่ม browser security fixtures; จำกัด risky fields | Frontend + Backend | malicious data renders inert ในรายงาน/print ทุกเส้นทาง |
| **Critical — ก่อน restart/upgrade ที่มี migration** | ทำ pre-migration backup; replace department rebuild ด้วย stable-ID migration; remap ทุก reference; fail-fast | Backend + DBA | legacy fixtures และ semantic/FK checks ผ่าน; interruption ไม่ทิ้ง partial migration |
| **High — 1–2 สัปดาห์แรก** | บังคับ production TLS/Secure; provision local setup; configure proxy trust | IT Infrastructure + Backend | HTTP/proxy/setup tests ผ่าน; browser cookie Secure; setup inaccessible externally |
| **High — 1–2 สัปดาห์แรก** | แก้ authorization proposed-state; define factory-wide read policy; least-data DTO | Backend + Engineering owner | role/department matrix ผ่านทั้ง existing/destination/parent |
| **High — 1–2 สัปดาห์แรก** | ย้าย active DB ออกจาก OneDrive; single-instance OS lock; restore exclusion/runbook | IT + Backend | second server/active restore rejected; verified offline restore drill |
| **High — 2–4 สัปดาห์** | transaction helper แทน res.end wrappers; required audit; atomic password/session changes | Backend | commit failure status/audit/reset tests ผ่าน; no response before commit |
| **High — 2–4 สัปดาห์** | bounded API work/crypto, request deadlines, abort handling, rate limits | Backend + Operations | slow upload/hanging upstream ไม่หยุดทั้งระบบ; agreed load SLO ผ่าน |
| **High — 2–4 สัปดาห์** | soft delete/RESTRICT; immutable inspection template/evidence | Backend + Maintenance QA | archive ไม่ลบ inspection; historical report reproduces original criteria |
| **Medium — 1–2 เดือน** | strict schemas + migration ledger/constraints/indexes; exact route contract | Backend | all invalid types return 4xx; upgrade invariant and query plan checks ผ่าน |
| **Medium — 1–2 เดือน** | row-level audit, paginated/delta reads, attachment limits/storage | Backend + Frontend | memory/latency bounded at expected annual data volume |
| **Medium — 1–2 เดือน** | verified backup manifest/retention/off-host copy; outbox; monitoring/shutdown | Operations + Backend | recovery/alert drills ผ่าน; capacity/backup age visible |
| **Low — ต่อเนื่อง** | runtime pin/CI, vendor inventory, reproducible releases, docs/launcher refresh | Development + IT | single canonical release and repeatable checks |

### Suggested execution sequence

1. ทำ isolated staging DB และ baseline fixtures ก่อนแก้ระบบ; เก็บ backup/restore procedure ที่ทำซ้ำได้
2. ปิด Critical paths โดยไม่เปลี่ยน master IDs หรือ API URL โดยพลการ
3. แก้ authorization/TLS/runtime exclusion เพื่อให้ deployment boundary ชัดเจน
4. Refactor transaction/audit/response lifecycle พร้อม tests ของ failure จริง
5. ปรับ validation/schema/read model/recovery แล้ววัด workload เพื่อเลือก SQLite/WAL หรือ server DB

**Decision on SQLite:** คง SQLite สำหรับ single-host/single-writer ที่มี local storage และ verified backups ได้ เมื่อย้าย storage แล้วจึงทดสอบ WAL กับ workload และ explicit durability/checkpoint policy อย่าเปิด WAL บน active OneDrive DB เพื่อหวังแก้ cloud concurrency หากต้องการหลาย writers/instances และ shared transaction governance ให้เลือก database server architecture

**Suggested recovery objectives:** ให้ฝ่ายวิศวกรรมกับ IT กำหนด RPO/RTO เป็นตัวเลขตามงานกะจริง ปัจจุบัน daily backup อาจเสียงานเกือบหนึ่งวันภายใต้ scheduling ปกติ และนานกว่านั้นหาก backup ล้มเหลวโดยไม่มี alert ไม่ควรอ้าง RPO/RTO ที่รับรองแล้ว

## 9. Operational Acceptance Checklist

- [ ] Critical XSS และ migration findings ปิดด้วย source changes + isolated tests
- [ ] HTTPS, Secure cookie, proxy trust และ setup boundary ตรวจจาก actual deployment
- [ ] Role/read/reassign policies ได้รับการนิยามโดยเจ้าของกระบวนการโรงงาน
- [ ] DB integrity, FK และ semantic relationship checks ผ่านบนสำเนาล่าสุด
- [ ] Backup ก่อน migration; restore drill บน host แยก; active restore ถูกปฏิเสธ
- [ ] ทุก business mutation มี atomic audit evidence และ failure response ตรงสถานะจริง
- [ ] Slow request/load/crash cases ผ่าน SLO และ recovery criteria ที่โรงงานกำหนด
- [ ] Graceful shutdown, disk/queue/backup monitoring และ operational runbook พร้อม
- [ ] Runtime/test suite รันได้ใน CI และ deployment environment ที่รองรับจริง

## 10. Source References & Audit Outcome

Primary repository evidence: `server.js`; `src/db.js`; `src/gateway.js`; `src/reliability.js`; `src/security.js`; `src/bootstrap.js`; `src/csv-import.js`; `src/source-records.js`; `src/backup-cli.js`; `public/js/domain.js`; `public/js/views-and-crud.js`; `public/js/inspection.js`; `public/js/session-and-sync.js`; `public/sw.js`; `tests/system.test.js`; `package.json`; `README.md`; `CONTEXT.md`; `COLLABORATION_RULES.md`; `_lock/current.md`; `start-comis.js`; `.gitignore`.

External primary references used to verify database semantics: [SQLite Write-Ahead Logging](https://www.sqlite.org/wal.html), [SQLite Transactions](https://www.sqlite.org/lang_transaction.html), [SQLite Foreign-Key PRAGMA](https://www.sqlite.org/pragma.html#pragma_foreign_keys).

**Audit outcome:** สร้างรายงานและแผนแก้ไขจากหลักฐานใน repository ครบขอบเขต backend/database/security/reliability ที่ร้องขอ **ยังไม่มี runtime test result หรือ production integrity certification** เนื่องจากไม่พบ Node.js ใน environment งานนี้ไม่ได้แก้ existing application code, deploy, restore หรือส่งข้อความภายนอก
