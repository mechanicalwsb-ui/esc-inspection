# ผลการแก้ไข v3.0.0 — 2026-10-01

ผู้ใช้อนุญาตให้แก้ครบ 12 หัวข้อจากรายการแนะนำ งานเสร็จใน workspace โดยไม่ได้ deploy หรือส่ง Telegram จริง

| หัวข้อ | ผลที่ทำ |
|---|---|
| 1. API ผิด | ใช้ req.method, แก้ snapshot, เปลี่ยน CSV เป็น schema จริง และแก้ฟอร์ม seed ที่อ้างแผนกเก่า |
| 2. สถานะบันทึก | HTTP error ไม่ fallback; แยกบันทึกฐานกลางกับเก็บในคิว; พิกัดไม่แจ้งสำเร็จเมื่อ API ปฏิเสธ |
| 3. ออฟไลน์ | IndexedDB, คิวเฉพาะเจ้าของ, idempotency, ส่งเมื่อเชื่อมต่อ, ดาวน์โหลด/ตรวจแก้รายการค้าง |
| 4. สิทธิ์ | scrypt, HttpOnly/SameSite session, setup จาก loopback, รหัสชั่วคราว, ตรวจ role/แผนกที่ API และชื่อจากบัญชีจริง |
| 5. Undo/backup | Undo เฉพาะแถวและตรวจการแก้ต่อ; ปิด Undo Snapshot เก่า; สำรองตรวจ integrity; CLI restore เก็บฐานเดิม |
| 6. เลขเอกสาร/เวลา | sequence แยกเดือน ไม่ใช้ COUNT, เวลา Asia/Bangkok, ไม่คืน sequence เมื่อ Undo |
| 7. ความถูกต้อง | ตรวจฟอร์ม/เครื่อง/ตัวเลข/ลายเซ็น, Transaction ทั้งชุด, กันคำขอซ้ำ, ไม่ใส่ค่าตัวเลขอัตโนมัติจาก bulk pass |
| 8. ตรวจร่วม | polling 15 วินาที, revision ของ entity/รอบตรวจ, รวมแบบร่าง, เก็บผู้กรอกแต่ละข้อ, ไม่แทนข้อมูลใหม่ด้วย response เก่า |
| 9. QR | กล้อง jsQR, ถอดรหัสป้ายใหม่/URL เดิม, กรอกรหัส/เลือกเครื่อง, TLS configuration |
| 10. ผลตรวจ/งานซ่อม | ไม่รีเซ็ตผลตรวจจากการปิดซ่อม, ใบซ่อมค้างแยกจากผลตรวจ, ผู้ยืนยันปิดงานและรายละเอียดบังคับ, ตรวจฉุกเฉินไม่ปิดจุดสายตรวจ |
| 11. ไฟล์ออฟไลน์ | ไลบรารี ฟอนต์ โลโก้ และใบอนุญาต local; cache แยกรุ่น; แจ้งอัปเดตก่อน reload |
| 12. โครงสร้าง/เอกสาร | แยก security/gateway/bootstrap/CSV/reliability, inspection/standalone/table/persistence/sync/QR และ shared domain; README/CONTEXT/package ตรง v3.0.0 |

## หลักฐานตรวจสอบ

- `node --no-warnings --test tests/system.test.js`: **12 ผ่าน / 0 ไม่ผ่าน**
- ทดสอบ authentication/role, threshold/idempotency/เลขเดือน, validation, CSV atomic/multiline, placement conflict, entity revision/Undo ใหม่, Undo conflict, backup และคำสั่ง CLI restore, transaction failure, shared draft/partial emergency, upgrade จากสำเนาฐานเดิม, stopped running-only fields
- Playwright + Edge headless: **ผ่าน** หน้าใช้งาน 12 หน้า, layout 1024×768, ไม่มี page error/ไม่มี request ภายนอก, offline reload, IndexedDB queue, reconnect sync, QR decoding/manual, standalone persistence, bulk pass ไม่สร้างค่าตัวเลข
- Syntax check **23 ไฟล์ผ่าน**; script/style/image paths ใน index ทั้งสองไฟล์มีครบ
- อ่านเปรียบเทียบทุกตารางเดิมกับไฟล์สำรอง: **data/comis.db ไม่เปลี่ยนข้อมูล**; integrity `ok`
- ตรวจสำรองและกู้คืนด้วยฐานชั่วคราวเท่านั้น พร้อมลบสำรองข้อมูลทดสอบที่เคยถูกสร้างใน data/backups โดยยืนยัน provenance ก่อนลบ
- สำรองก่อนแก้อยู่ใน `logs/20261001-220539_codex_backup/` (โค้ดเดิมและฐานข้อมูลที่ผ่าน integrity)

## สิ่งที่ต้องทำเมื่อเริ่มใช้งานจริง

- เริ่ม server แล้วตั้งรหัสผ่านบัญชีผู้ดูแลบน localhost; งานนี้ไม่ได้ตั้งรหัสผ่านบัญชีจริง
- ตั้ง HTTPS/certificate ที่อุปกรณ์เชื่อถือสำหรับกล้อง/Service Worker ผ่าน LAN
- ตรวจกล้องและการโฟกัสบนมือถือ/iPad จริง (ทดสอบถอดรหัสและ fallback แล้ว)
- Telegram จริงยังไม่ถูกส่ง; ตั้งค่าบัญชีแล้วทดสอบโดยผู้ดูแล
- ตรวจ OneDrive sync ในเครื่องผู้ใช้: ตรวจการเขียนและเนื้อหาไฟล์ในเครื่องแล้ว แต่เครื่องมือที่มีไม่ยืนยันสถานะ sync ของ OneDrive
