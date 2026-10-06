const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = process.env.COMIS_DB_PATH || path.join(DATA_DIR, 'comis.db');
const db = new DatabaseSync(DB_PATH);

// Enable Foreign Keys & OneDrive-friendly journal mode
db.exec(`
  PRAGMA journal_mode = DELETE;
  PRAGMA foreign_keys = ON;
`);

function initDatabase() {
  db.exec(`
    -- 1. ตารางแผนก (Departments)
    CREATE TABLE IF NOT EXISTS departments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      plant_name TEXT NOT NULL DEFAULT 'โรงงานหลัก (Plant 1)',
      manager_name TEXT DEFAULT '',
      color TEXT DEFAULT '#2563eb',
      icon TEXT DEFAULT 'wrench',
      telegram_chat_id TEXT DEFAULT '',
      description TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', '+7 hours')),
      updated_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 2. ตารางผู้ใช้งาน (Users)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emp_code TEXT UNIQUE NOT NULL,
      full_name TEXT NOT NULL,
      position TEXT DEFAULT '',
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      role TEXT NOT NULL DEFAULT 'inspector', -- super_admin, dept_admin, inspector, viewer
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 3. ตารางเครื่องจักร (Machines - Master Data)
    CREATE TABLE IF NOT EXISTS machines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      machine_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'Pump & Piping',
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      plant_area TEXT NOT NULL DEFAULT 'อาคารผลิต 1',
      system_name TEXT DEFAULT 'ระบบหลัก',
      brand TEXT DEFAULT '',
      model TEXT DEFAULT '',
      serial_number TEXT DEFAULT '',
      install_year INTEGER DEFAULT 2022,
      criticality TEXT NOT NULL DEFAULT 'A', -- A (Critical), B (Essential), C (General)
      operating_state TEXT NOT NULL DEFAULT 'running', -- running, standby, maintenance
      health_status TEXT NOT NULL DEFAULT 'normal', -- normal, warning, abnormal
      running_hours REAL DEFAULT 0,
      specs_json TEXT DEFAULT '{}', -- JSON: motor_kw, rpm, bearing_de, bearing_nde, lube_type, components[]
      location_note TEXT DEFAULT '',
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', '+7 hours')),
      updated_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 4. ตารางแม่แบบฟอร์มตรวจเช็ค (Dynamic Form Templates)
    CREATE TABLE IF NOT EXISTS form_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      form_code TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL, -- แผนกผู้ตรวจ
      target_machine_id INTEGER REFERENCES machines(id) ON DELETE SET NULL, -- NULL = ใช้ตามหมวดหมู่/หลายเครื่อง
      machine_category TEXT DEFAULT 'ALL', -- ALL หรือระบุหมวดหมู่เครื่องจักร
      frequency TEXT NOT NULL DEFAULT 'daily', -- per_shift, daily, weekly, monthly, quarterly
      estimated_minutes INTEGER DEFAULT 15,
      version INTEGER DEFAULT 1,
      require_signature INTEGER DEFAULT 1,
      sections_json TEXT NOT NULL DEFAULT '[]', -- โครงสร้างหมวดหมู่และข้อคำถามแบบ Dynamic
      is_active INTEGER DEFAULT 1,
      created_by TEXT DEFAULT 'System Admin',
      created_at TEXT DEFAULT (datetime('now', '+7 hours')),
      updated_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 5. ตารางบันทึกผลการตรวจเช็ค (Inspection Records)
    CREATE TABLE IF NOT EXISTS inspections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      doc_no TEXT UNIQUE NOT NULL,
      machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
      form_id INTEGER NOT NULL REFERENCES form_templates(id) ON DELETE CASCADE,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      inspector_name TEXT NOT NULL,
      inspector_code TEXT DEFAULT '',
      shift TEXT NOT NULL DEFAULT 'กะเช้า (07:00-19:00)',
      machine_state_at_check TEXT NOT NULL DEFAULT 'running', -- running, standby, maintenance
      checkin_method TEXT NOT NULL DEFAULT 'qr_scan', -- qr_scan, manual
      overall_result TEXT NOT NULL DEFAULT 'normal', -- normal, warning, abnormal
      normal_count INTEGER DEFAULT 0,
      warning_count INTEGER DEFAULT 0,
      abnormal_count INTEGER DEFAULT 0,
      answers_json TEXT NOT NULL DEFAULT '[]', -- คำตอบทุกข้อ + ค่าตัวเลข + รูปถ่าย + หมายเหตุ
      inspector_note TEXT DEFAULT '',
      signature_data TEXT DEFAULT '',
      approval_status TEXT NOT NULL DEFAULT 'pending', -- pending, approved, rejected
      approved_by TEXT DEFAULT '',
      approved_at TEXT DEFAULT '',
      approval_note TEXT DEFAULT '',
      inspected_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 6. ตารางใบแจ้งซ่อม / ติดตามความผิดปกติ (Defect Tickets / F-Tags)
    CREATE TABLE IF NOT EXISTS defect_tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_no TEXT UNIQUE NOT NULL,
      inspection_id INTEGER REFERENCES inspections(id) ON DELETE SET NULL,
      machine_id INTEGER NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
      component_name TEXT DEFAULT 'ชุดหลัก',
      defect_title TEXT NOT NULL,
      defect_detail TEXT DEFAULT '',
      reported_by TEXT NOT NULL,
      assigned_dept_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      assigned_to TEXT DEFAULT '',
      severity TEXT NOT NULL DEFAULT 'high', -- critical, high, medium, low
      status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, waiting_parts, resolved, closed
      root_cause TEXT DEFAULT '',
      corrective_action TEXT DEFAULT '',
      before_photo TEXT DEFAULT '',
      after_photo TEXT DEFAULT '',
      downtime_hours REAL DEFAULT 0,
      resolved_at TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', '+7 hours')),
      updated_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 7. ตารางตั้งค่าระบบ (System Settings)
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 8. ตารางประวัติการใช้งานระบบ (Audit Logs)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_name TEXT NOT NULL,
      action_type TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_name TEXT NOT NULL,
      detail TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 9. ตารางสายเดินตรวจมาตรฐานและตารางเวลาประจำกะ (Inspection Walking Routes)
    CREATE TABLE IF NOT EXISTS inspection_routes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      route_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      description TEXT DEFAULT '',
      shift_schedules_json TEXT NOT NULL DEFAULT '[]',
      stops_json TEXT NOT NULL DEFAULT '[]',
      estimated_minutes INTEGER DEFAULT 35,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );

    -- 10. ตารางรอบการเดินตรวจร่วมกันของทีมช่างในแต่ละกะ (Multi-Inspector Route Rounds)
    CREATE TABLE IF NOT EXISTS route_rounds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      round_code TEXT UNIQUE NOT NULL,
      route_id INTEGER REFERENCES inspection_routes(id) ON DELETE CASCADE,
      route_code TEXT DEFAULT '',
      route_name TEXT NOT NULL,
      department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
      shift TEXT NOT NULL DEFAULT 'กะเช้า',
      time_window TEXT DEFAULT '08:30 - 10:00',
      status TEXT NOT NULL DEFAULT 'in_progress',
      assigned_inspectors_json TEXT NOT NULL DEFAULT '[]',
      stops_progress_json TEXT NOT NULL DEFAULT '[]',
      started_at TEXT DEFAULT (datetime('now', '+7 hours')),
      completed_at TEXT DEFAULT ''
    );

    -- 11. ตารางพิกัดเครื่องจักรบนผังโรงงาน 3D (Server-Synced 3D Machine Placements - P0-3)
    CREATE TABLE IF NOT EXISTS machine_placements (
      machine_code TEXT PRIMARY KEY,
      zone_id TEXT NOT NULL,
      bay_label TEXT DEFAULT '',
      anchor_offset_json TEXT DEFAULT '{}',
      x REAL DEFAULT 0,
      y REAL DEFAULT 0,
      z REAL DEFAULT 0,
      location_verified INTEGER DEFAULT 0,
      verified_by TEXT DEFAULT '',
      verified_at TEXT DEFAULT '',
      note TEXT DEFAULT '',
      revision INTEGER DEFAULT 1,
      updated_by TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now', '+7 hours'))
    );
  `);

  // Safe schema migrations for existing SQLite databases upgrading to v2.0, v2.1 & v2.2
  const safeAddColumn = (sql) => {
    try { db.exec(sql); } catch (_) { /* Column already exists */ }
  };
  safeAddColumn(`ALTER TABLE inspections ADD COLUMN route_id INTEGER DEFAULT NULL`);
  safeAddColumn(`ALTER TABLE inspections ADD COLUMN route_round_id INTEGER DEFAULT NULL`);
  safeAddColumn(`ALTER TABLE inspections ADD COLUMN inspection_type TEXT DEFAULT 'routine'`);
  safeAddColumn(`ALTER TABLE inspections ADD COLUMN co_inspectors_json TEXT DEFAULT '[]'`);
  safeAddColumn(`ALTER TABLE audit_logs ADD COLUMN can_undo INTEGER DEFAULT 0`);
  safeAddColumn(`ALTER TABLE audit_logs ADD COLUMN reverted INTEGER DEFAULT 0`);
  safeAddColumn(`ALTER TABLE audit_logs ADD COLUMN reverted_at TEXT DEFAULT ''`);
  safeAddColumn(`ALTER TABLE audit_logs ADD COLUMN reverted_by TEXT DEFAULT ''`);
  safeAddColumn(`ALTER TABLE audit_logs ADD COLUMN undo_json TEXT DEFAULT '{}'`);
  safeAddColumn(`ALTER TABLE machine_placements ADD COLUMN bay_label TEXT DEFAULT ''`);
  safeAddColumn(`ALTER TABLE machine_placements ADD COLUMN anchor_offset_json TEXT DEFAULT '{}'`);
  safeAddColumn(`ALTER TABLE machine_placements ADD COLUMN updated_by TEXT DEFAULT ''`);

  seedInitialData();
  purgeMockupDataFromSqlite(false);
  syncOfficialFactoryDepartmentsSqlite(false);
  syncOfficialMillingMachinesSqlite(false);
  syncOfficialTechnicianUsersSqlite(false);
}

const OFFICIAL_FACTORY_DEPARTMENTS = [
  // กลุ่มที่ 1: ฝ่ายผลิต (PD) >> 4 แผนก
  {
    code: 'EP',
    name: 'แผนกหม้อต้ม',
    plant_name: 'ฝ่ายผลิต (PD)',
    manager_name: 'หัวหน้าแผนกหม้อต้ม',
    color: '#059669',
    icon: 'flame',
    description: 'ควบคุมดูแลกระบวนการต้มใสและหม้อต้มน้ำอ้อย (Evaporation & Clarification)'
  },
  {
    code: 'VP',
    name: 'แผนกหม้อเคี่ยว',
    plant_name: 'ฝ่ายผลิต (PD)',
    manager_name: 'หัวหน้าแผนกหม้อเคี่ยว',
    color: '#0d9488',
    icon: 'thermometer',
    description: 'ควบคุมดูแลหม้อเคี่ยวน้ำตาลระบบสุญญากาศ (Vacuum Pan & Crystallization)'
  },
  {
    code: 'CF',
    name: 'แผนกหม้อปั่น',
    plant_name: 'ฝ่ายผลิต (PD)',
    manager_name: 'หัวหน้าแผนกหม้อปั่น',
    color: '#0891b2',
    icon: 'refresh-cw',
    description: 'ควบคุมดูแลเครื่องปั่นแยกน้ำตาล (Centrifugal Station) และระบบอบแห้งน้ำตาล'
  },
  {
    code: 'WP',
    name: 'แผนกระบบน้ำ',
    plant_name: 'ฝ่ายผลิต (PD)',
    manager_name: 'หัวหน้าแผนกระบบน้ำ',
    color: '#0284c7',
    icon: 'droplets',
    description: 'ดูแลระบบผลิตน้ำใช้ในโรงงาน ระบบน้ำหล่อเย็น และสถานีสูบน้ำหมุนเวียน'
  },
  // กลุ่มที่ 2: ฝ่ายวิศวกรรมจักรกล (EN) >> 3 แผนก
  {
    code: 'ML',
    name: 'แผนกลูกหีบ',
    plant_name: 'ฝ่ายวิศวกรรมจักรกล (EN)',
    manager_name: 'หัวหน้าแผนกลูกหีบ',
    color: '#166534',
    icon: 'settings',
    description: 'ดูแลรักษาระบบสะพานลำเลียงอ้อย มีดสับอ้อย เครื่องย่อย และชุดลูกหีบอ้อย (Milling Tandem)'
  },
  {
    code: 'MA',
    name: 'แผนกเครื่องกลซ่อมบำรุง',
    plant_name: 'ฝ่ายวิศวกรรมจักรกล (EN)',
    manager_name: 'หัวหน้าแผนกเครื่องกลซ่อมบำรุง',
    color: '#1f760e',
    icon: 'wrench',
    description: 'ซ่อมบำรุงเครื่องจักรกล ปั๊ม เกียร์ ลูกปืน และตรวจวัดความสั่นสะเทือน (Mechanical Maintenance & CBM)'
  },
  {
    code: 'EBL',
    name: 'แผนกหม้อไอน้ำ',
    plant_name: 'ฝ่ายวิศวกรรมจักรกล (EN)',
    manager_name: 'หัวหน้าแผนกหม้อไอน้ำ',
    color: '#dc2626',
    icon: 'flame',
    description: 'ดูแลหม้อไอน้ำแรงดันสูง (Boiler) ระบบน้ำป้อน พัดลมดูดควัน และระบบส่งจ่ายไอน้ำ'
  },
  // กลุ่มที่ 3: ฝ่ายวิศวกรรมไฟฟ้า (EE) >> 3 แผนก
  {
    code: 'EM',
    name: 'แผนกไฟฟ้าซ่อมบำรุง',
    plant_name: 'ฝ่ายวิศวกรรมไฟฟ้า (EE)',
    manager_name: 'หัวหน้าแผนกไฟฟ้าซ่อมบำรุง',
    color: '#ea580c',
    icon: 'zap',
    description: 'บำรุงรักษามอเตอร์ไฟฟ้า ตู้สวิตช์บอร์ด MCC/MDB อินเวอร์เตอร์ (VFD) และระบบไฟฟ้ากำลัง'
  },
  {
    code: 'ME',
    name: 'แผนกอุปกรณ์เครื่องมือวัด',
    plant_name: 'ฝ่ายวิศวกรรมไฟฟ้า (EE)',
    manager_name: 'หัวหน้าแผนกอุปกรณ์เครื่องมือวัด',
    color: '#ca8a04',
    icon: 'gauge',
    description: 'ดูแลอุปกรณ์เครื่องมือวัด (Instrumentation) เซนเซอร์ วาล์วควบคุม และระบบ PLC/DCS'
  },
  {
    code: 'EPP',
    name: 'แผนกไฟฟ้าผลิต',
    plant_name: 'ฝ่ายวิศวกรรมไฟฟ้า (EE)',
    manager_name: 'หัวหน้าแผนกไฟฟ้าผลิต',
    color: '#b45309',
    icon: 'cpu',
    description: 'ควบคุมระบบผลิตและจ่ายกระแสไฟฟ้า ชุดเครื่องกำเนิดไฟฟ้า และสถานีไฟฟ้าย่อย'
  }
];

function seedInitialData() {
  const deptCount = db.prepare('SELECT COUNT(*) as count FROM departments').get().count;
  if (deptCount > 0) return;

  console.log('Initializing clean production COMIS SQLite database with 17 official factory departments grouped by division...');

  // 1. Seed System Settings
  const insertSetting = db.prepare('INSERT OR IGNORE INTO system_settings (key, value) VALUES (?, ?)');
  insertSetting.run('organization_name', 'บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) — ฝ่ายวิศวกรรมจักรกล');
  insertSetting.run('plant_title', 'ระบบตรวจสอบเครื่องจักรออนไลน์แบบศูนย์กลาง (ESC Machine Inspection Center)');
  insertSetting.run('telegram_bot_token', '');
  insertSetting.run('telegram_default_chat_id', '');
  insertSetting.run('auto_create_defect_ticket', 'true');
  insertSetting.run('require_photo_on_abnormal', 'true');
  insertSetting.run('mockup_purged_v24', 'true');
  insertSetting.run('official_depts_v27', 'true');

  // 2. Seed All 17 Official Factory Departments (ฝ่าย >> แผนก)
  const insertDept = db.prepare(`
    INSERT INTO departments (code, name, plant_name, manager_name, color, icon, description)
    VALUES (@code, @name, @plant_name, @manager_name, @color, @icon, @description)
  `);
  for (const d of OFFICIAL_FACTORY_DEPARTMENTS) insertDept.run(d);

  // 3. Seed Primary Admin User Only (สังกัด ฝ่ายวิศวกรรมจักรกล (EN) >> ML : แผนกลูกหีบ)
  const users = [
    { emp_code: 'EMP-1001', full_name: 'วศ.ประจักษ์ (System Center Admin)', position: 'วิศวกรเครื่องกลอาวุโส', department_id: 5, role: 'super_admin', phone: '', email: '' }
  ];
  const insertUser = db.prepare(`
    INSERT INTO users (emp_code, full_name, position, department_id, role, phone, email)
    VALUES (@emp_code, @full_name, @position, @department_id, @role, @phone, @email)
  `);
  for (const u of users) insertUser.run(u);

  // 5. Seed Form Templates (4 แบบฟอร์มมาตรฐานผูกกับแผนกจริง MA, EM, EP, SF)
  const formTemplates = [
    {
      form_code: 'FRM-MECH-001',
      title: 'แบบฟอร์มตรวจเช็คเครื่องจักรหมุนและปั๊มแรงดันสูง (Mechanical & CBM Checksheet)',
      description: 'สำหรับช่างวิศวกรรมเครื่องกล (MA / ML / EBL) ตรวจวัดอุณหภูมิลูกปืน ความสั่นสะเทือน (Vibration) แรงดัน และระบบหล่อลื่น',
      department_id: 6, // MA : แผนกเครื่องกลซ่อมบำรุง

      target_machine_id: null,
      machine_category: 'ALL',
      frequency: 'daily',
      estimated_minutes: 15,
      version: 2,
      require_signature: 1,
      sections_json: JSON.stringify([
        {
          id: 'sec_mech_1',
          title: 'หมวดที่ 1: ระบบหล่อลื่นและซีลกันรั่ว (Lubrication & Sealing)',
          fields: [
            {
              id: 'f_oil_level',
              label: 'ระดับน้ำมันหล่อลื่นในตาแมว (Oil Sight Glass Level)',
              field_type: 'three_state',
              tpm_tag: 'L',
              tool_method: 'สายตา (Visual Check)',
              standard_opl: 'ระดับน้ำมันต้องอยู่ระหว่างขีดกึ่งกลางถึง 3/4 ของตาแมว น้ำมันไม่ขุ่นขาวหรือเป็นฟอง',
              running_only: false,
              required: true,
              options: ['ปกติ (1/2 - 3/4)', 'เฝ้าระวัง (พร่องเล็กน้อย/เติมเพิ่ม)', 'ผิดปกติ (ต่ำกว่าขีด/น้ำมันขุ่นดำ/รั่วซึม)']
            },
            {
              id: 'f_seal_leak',
              label: 'สภาพซีลกันรั่ว (Mechanical Seal / Packing Gland)',
              field_type: 'pass_fail',
              tpm_tag: 'I',
              tool_method: 'สายตา (Visual Check)',
              standard_opl: 'ไม่มีน้ำหรือน้ำมันพุ่งออกบริเวณเพลา สำหรับ Mechanical Seal ต้องแห้งสนิท',
              running_only: false,
              required: true
            },
            {
              id: 'f_bolt_tight',
              label: 'ความแน่นของน็อตแท่นเครื่องและการ์ดคัปปลิ้ง (Foundation & Coupling Bolts)',
              field_type: 'pass_fail',
              tpm_tag: 'T',
              tool_method: 'สายตา / สังเกตขีดมาร์คสี (Match Mark)',
              standard_opl: 'ขีดมาร์คสีที่หัวน็อตตรงแนวเดิม น็อตไม่คลายตัวหรือขาดหาย',
              running_only: false,
              required: true
            }
          ]
        },
        {
          id: 'sec_mech_2',
          title: 'หมวดที่ 2: การตรวจวัดสภาพขณะเดินเครื่อง (Bearing Temp, Vibration & Pressure)',
          fields: [
            {
              id: 'f_brg_de_temp',
              label: 'อุณหภูมิลูกปืนด้านขับ (Bearing DE Temperature)',
              field_type: 'number_range',
              tpm_tag: 'I',
              tool_method: 'ปืนวัดอุณหภูมิอินฟราเรด (IR Thermometer)',
              standard_opl: 'ปกติ ≤ 70°C | เฝ้าระวัง 70.1 - 80°C | ผิดปกติ > 80°C (ห้ามเกิน 85°C เด็ดขาด)',
              unit: '°C',
              min_normal: 25,
              max_normal: 70,
              max_warning: 80,
              running_only: true,
              required: true
            },
            {
              id: 'f_brg_nde_temp',
              label: 'อุณหภูมิลูกปืนด้านท้าย (Bearing NDE Temperature)',
              field_type: 'number_range',
              tpm_tag: 'I',
              tool_method: 'ปืนวัดอุณหภูมิอินฟราเรด (IR Thermometer)',
              standard_opl: 'ปกติ ≤ 70°C | เฝ้าระวัง 70.1 - 80°C | ผิดปกติ > 80°C',
              unit: '°C',
              min_normal: 25,
              max_normal: 70,
              max_warning: 80,
              running_only: true,
              required: true
            },
            {
              id: 'f_vibration_rms',
              label: 'ค่าความสั่นสะเทือนรวม (Overall Vibration Velocity RMS - ISO 10816-3)',
              field_type: 'number_range',
              tpm_tag: 'I',
              tool_method: 'เครื่องวัดความสั่นสะเทือน (Vibration Pen / Analyzer)',
              standard_opl: 'ตามเกณฑ์ ISO 10816 Group 2: ปกติ ≤ 4.5 mm/s | เฝ้าระวัง 4.51 - 7.1 mm/s | ผิดปกติ > 7.1 mm/s',
              unit: 'mm/s',
              min_normal: 0.1,
              max_normal: 4.5,
              max_warning: 7.1,
              running_only: true,
              required: true
            },
            {
              id: 'f_discharge_press',
              label: 'แรงดันขาออกขณะทำงาน (Discharge Pressure)',
              field_type: 'number_range',
              tpm_tag: 'I',
              tool_method: 'Pressure Gauge หน้าเครื่อง',
              standard_opl: 'แรงดันอยู่ในย่านทำงานปกติ ไม่แกว่งผิดปกติ',
              unit: 'Bar',
              min_normal: 6.0,
              max_normal: 100.0,
              max_warning: 110.0,
              running_only: true,
              required: false
            }
          ]
        }
      ])
    },
    {
      form_code: 'FRM-ELEC-001',
      title: 'แบบฟอร์มตรวจเช็คมอเตอร์ไฟฟ้าและตู้ควบคุม (Electrical Motor & MCC Inspection)',
      description: 'สำหรับช่างไฟฟ้าและวัดคุม (EM / ME / EPP) ตรวจวัดกระแสไฟฟ้า 3 เฟส อุณหภูมิมอเตอร์ พัดลมระบายอากาศ และจุดต่อสายไฟ',
      department_id: 8, // EM : แผนกไฟฟ้าซ่อมบำรุง
      target_machine_id: null,
      machine_category: 'ALL',
      frequency: 'weekly',
      estimated_minutes: 20,
      version: 1,
      require_signature: 1,
      sections_json: JSON.stringify([
        {
          id: 'sec_elec_1',
          title: 'หมวดที่ 1: ตรวจวัดค่าทางไฟฟ้าและอุณหภูมิมอเตอร์',
          fields: [
            {
              id: 'f_motor_amp',
              label: 'กระแสไฟฟ้าของมอเตอร์ (Motor Load Current)',
              field_type: 'number_range',
              tpm_tag: 'I',
              tool_method: 'Clamp Meter / หน้าจอ VFD Display',
              standard_opl: 'กระแสต้องไม่เกินพิกัด Full Load Amp (FLA) บน Nameplate',
              unit: 'A',
              min_normal: 1,
              max_normal: 85,
              max_warning: 95,
              running_only: true,
              required: true
            },
            {
              id: 'f_motor_body_temp',
              label: 'อุณหภูมิตัวถังมอเตอร์และกล่องต่อสาย (Motor Frame & Terminal Box Temp)',
              field_type: 'number_range',
              tpm_tag: 'I',
              tool_method: 'กล้องถ่ายภาพความร้อน (Thermo Camera / IR Gun)',
              standard_opl: 'ปกติ ≤ 75°C | เฝ้าระวัง 75.1 - 85°C | ผิดปกติ > 85°C',
              unit: '°C',
              min_normal: 25,
              max_normal: 75,
              max_warning: 85,
              running_only: true,
              required: true
            },
            {
              id: 'f_cooling_fan',
              label: 'สภาพพัดลมระบายความร้อนท้ายมอเตอร์และฝาครอบ',
              field_type: 'pass_fail',
              tpm_tag: 'C',
              tool_method: 'สายตาและฟังเสียง',
              standard_opl: 'ตะแกรงท้ายมอเตอร์ไม่อุดตันด้วยฝุ่นกากอ้อย ใบพัดไม่แตกหัก',
              running_only: false,
              required: true
            },
            {
              id: 'f_panel_clean',
              label: 'สภาพภายในตู้ควบคุมไฟฟ้า (MCC / VFD Panel) และจุดเข้าสาย',
              field_type: 'three_state',
              tpm_tag: 'C',
              tool_method: 'สายตา / กล้อง Thermoscan',
              standard_opl: 'ไม่มีรอยไหม้จุดต่อสายไฟ พัดลมหน้าตู้หมุนปกติ ซีลกันฝุ่นปิดสนิท',
              running_only: false,
              required: true,
              options: ['ปกติ (สะอาด/จุดต่อแน่น)', 'เฝ้าระวัง (มีฝุ่นสะสม ต้องเป่าทำความสะอาด)', 'ผิดปกติ (พบรอยความร้อนสูง/สายหลวม)']
            }
          ]
        }
      ])
    },
    {
      form_code: 'FRM-PROD-AM01',
      title: 'แบบฟอร์มตรวจเช็คเครื่องจักรประจำกะโดยพนักงานเดินเครื่อง (AM / CLIT Daily Check)',
      description: 'สำหรับพนักงานฝ่ายผลิต (EP / VP / CF / WP) ตรวจความสะอาด น้ำมันหล่อลื่น เสียงผิดปกติ และความพร้อมก่อน/ระหว่างเดินเครื่องประจำกะ',
      department_id: 1, // EP : แผนกหม้อต้ม (กลุ่มฝ่ายผลิต PD)
      target_machine_id: null,
      machine_category: 'ALL',
      frequency: 'per_shift',
      estimated_minutes: 10,
      version: 1,
      require_signature: 1,
      sections_json: JSON.stringify([
        {
          id: 'sec_am_1',
          title: 'หมวดตรวจเช็คพื้นฐาน 4 ประการ (CLIT: Clean, Lubricate, Inspect, Tighten)',
          fields: [
            {
              id: 'f_am_clean',
              label: '1. ความสะอาดตัวเครื่องและพื้นที่รอบเครื่องจักร (Cleaning)',
              field_type: 'pass_fail',
              tpm_tag: 'C',
              tool_method: 'สายตาและการทำความสะอาดหน้างาน',
              standard_opl: 'ไม่มีคราบน้ำมันหกเลอะเทอะ ไม่มีเศษกากอ้อยหรือสิ่งกีดขวางรอบเครื่อง',
              running_only: false,
              required: true
            },
            {
              id: 'f_am_sound',
              label: '2. เสียงและกลิ่นขณะเครื่องจักรทำงาน (Abnormal Sound & Smell)',
              field_type: 'pass_fail',
              tpm_tag: 'I',
              tool_method: 'ประสาทสัมผัส (ฟังเสียง / ดมกลิ่น)',
              standard_opl: 'ไม่มีเสียงดังกระแทก เสียงหวีดของลูกปืน หรือกลิ่นเหม็นไหม้',
              running_only: true,
              required: true
            },
            {
              id: 'f_am_guard',
              label: '3. การ์ดครอบจุดหมุนและป้ายเตือนความปลอดภัย (Safety Guard)',
              field_type: 'pass_fail',
              tpm_tag: 'T',
              tool_method: 'สายตาและลองขยับตรวจความแน่น',
              standard_opl: 'การ์ดครอบสายพาน/คัปปลิ้งติดตั้งครบถ้วน น็อตยึดแน่นหนา',
              running_only: false,
              required: true
            },
            {
              id: 'f_am_symptoms',
              label: '4. รายการสิ่งผิดปกติที่พบเบื้องต้น (เลือกได้หลายข้อหากพบ)',
              field_type: 'checkbox',
              tpm_tag: 'I',
              tool_method: 'สำรวจรอบเครื่อง',
              standard_opl: 'หากไม่พบความผิดปกติ ให้เว้นว่างหรือเลือก "ไม่พบสิ่งผิดปกติ"',
              running_only: false,
              required: false,
              options: ['ไม่พบสิ่งผิดปกติ', 'พบรอยรั่วซึมของน้ำมัน/น้ำ', 'มีเสียงดังผิดปกติที่จุดหมุน', 'น็อตยึดคลายตัว', 'เกจวัดแรงดันชำรุด/กระจกแตก']
            }
          ]
        }
      ])
    },
    {
      form_code: 'FRM-SAFE-001',
      title: 'แบบฟอร์มตรวจสอบความปลอดภัยของเครื่องจักรประจำเดือน (Machine Safety & LOTO Audit)',
      description: 'สำหรับแผนกความปลอดภัยและอาชีวอนามัย (SF) ตรวจสอบอุปกรณ์ป้องกันอันตราย ปุ่มหยุดฉุกเฉิน และความพร้อมระบบ Lockout/Tagout',
      department_id: 15, // SF : แผนกความปลอดภัยและอาชีวอนามัย
      target_machine_id: null,
      machine_category: 'ALL',
      frequency: 'monthly',
      estimated_minutes: 15,
      version: 1,
      require_signature: 1,
      sections_json: JSON.stringify([
        {
          id: 'sec_safe_1',
          title: 'หมวดตรวจสอบระบบความปลอดภัยเครื่องจักร (Machine Guarding & Emergency)',
          fields: [
            {
              id: 'f_safe_estop',
              label: 'สภาพปุ่มหยุดฉุกเฉิน (Emergency Stop / Pull Cord Switch)',
              field_type: 'pass_fail',
              tpm_tag: 'I',
              tool_method: 'ตรวจสอบสภาพและป้ายบ่งชี้ภาษาไทย',
              standard_opl: 'ปุ่ม E-Stop ไม่แตกหัก มีป้ายชื่อชัดเจน ไม่มีสิ่งกีดขวางการกดใช้งาน',
              running_only: false,
              required: true
            },
            {
              id: 'f_safe_guard',
              label: 'สภาพการ์ดครอบจุดหมุน สายพาน และเพลาขับ (Rotating Part Guard)',
              field_type: 'pass_fail',
              tpm_tag: 'I',
              tool_method: 'สายตา',
              standard_opl: 'ปิดมิดชิดทุกด้าน ช่องตะแกรงนิ้วมือลอดเข้าไม่ได้ ทาสีเหลืองเตือนภัยชัดเจน',
              running_only: false,
              required: true
            },
            {
              id: 'f_safe_ground',
              label: 'สายดินประจำโครงเครื่องจักรและมอเตอร์ (Protective Earthing / Grounding)',
              field_type: 'pass_fail',
              tpm_tag: 'T',
              tool_method: 'สายตาและตรวจขั้วต่อหางปลา',
              standard_opl: 'สายดินสีเขียว-เหลืองต่อแน่นหนา ไม่ขาดหรือขึ้นสนิม',
              running_only: false,
              required: true
            }
          ]
        }
      ])
    }
  ];

  const insertForm = db.prepare(`
    INSERT INTO form_templates (
      form_code, title, description, department_id, target_machine_id,
      machine_category, frequency, estimated_minutes, version, require_signature, sections_json
    ) VALUES (
      @form_code, @title, @description, @department_id, @target_machine_id,
      @machine_category, @frequency, @estimated_minutes, @version, @require_signature, @sections_json
    )
  `);
  for (const f of formTemplates) {
    if (!db.prepare('SELECT id FROM departments WHERE id=?').get(f.department_id)) f.department_id = db.prepare("SELECT id FROM departments WHERE code='MA'").get().id;
    insertForm.run(f);
  }

  // 6. Seed Audit Log
  db.prepare(`
    INSERT INTO audit_logs (actor_name, action_type, target_type, target_name, detail)
    VALUES ('System Setup', 'INIT_SYSTEM', 'DATABASE', 'ESC Machine Center v2.7', 'เตรียมโครงสร้างฐานข้อมูลแยกเฉพาะ 17 แผนก จัดกลุ่มตามฝ่าย (ฝ่าย >> แผนก)')
  `).run();

  console.log('COMIS database initialized cleanly without mockup records.');
}

const MOCKUP_IDENTIFIERS = {
  machines: [
    'MCH-BLR-P01', 'MCH-MIL-G01', 'MCH-BLR-F02', 'MCH-PRD-C04',
    'MCH-UTL-A01', 'MCH-ELC-M01', 'MCH-CNV-B02', 'MCH-MILL-01',
    'MCH-CANE-CR01', 'MCH-GEN-TB01', 'MCH-CENT-04', 'MCH-WTP-P02', 'MCH-AIR-C01'
  ],
  inspections: [
    'INS-202609-0001', 'INS-202609-0002', 'INS-202609-0003',
    'INS-202609-0004', 'INS-202609-0005', 'INS-202609-0006'
  ],
  defects: ['DEF-202609-0001', 'DEF-202609-0002'],
  routes: ['RT-MECH-01', 'RT-PROD-01', 'RT-BOIL-01', 'RT-ELEC-01'],
  rounds: [
    'RND-20260925-M1', 'RND-20260925-P1', 'RND-20260925-B1',
    'RND-20260925-M01', 'RND-20260925-E01'
  ],
  users: ['EMP-1002', 'EMP-2001', 'EMP-2002', 'EMP-3001', 'EMP-4001', 'EMP-5001'],
  legacyDepartments: ['MECH', 'ELEC', 'PROD', 'BOIL', 'SAFE', 'PD', 'EN', 'EE', 'OF', 'SR', 'IT', 'HR', 'PC', 'AC']
};

function syncOfficialFactoryDepartmentsSqlite(force = false) {
  try {
    const flag = db.prepare("SELECT value FROM system_settings WHERE key = 'official_depts_v30'").get();
    const removedCount = db.prepare("SELECT COUNT(*) AS cnt FROM departments WHERE code IN ('QS','QA','LB','EV','SF','WH','SW','MECH','ELEC','PROD','BOIL','SAFE','PD','EN','EE','OF','SR','IT','HR','PC','AC')").get().cnt;
    const totalCount = db.prepare("SELECT COUNT(*) AS cnt FROM departments").get().cnt;
    if (!force && flag && flag.value === 'true') {
      return { synced: false };
    }

    const LEGACY_CODE_MAP = {
      MECH: 'MA',
      ELEC: 'EM',
      PROD: 'EP',
      BOIL: 'EBL',
      SAFE: 'MA',
      PD: 'EP',
      EN: 'ML',
      EE: 'EM',
      OF: 'MA',
      SR: 'MA',
      IT: 'EM',
      HR: 'MA',
      PC: 'MA',
      AC: 'ML',
      QS: 'MA',
      QA: 'EP',
      LB: 'EP',
      EV: 'MA',
      SF: 'MA',
      WH: 'MA',
      SW: 'EP'
    };

    const existingDepts = db.prepare('SELECT * FROM departments ORDER BY id ASC').all();
    const oldIdToTargetCode = {};
    const customDepts = [];
    const officialCodes = new Set(OFFICIAL_FACTORY_DEPARTMENTS.map(d => d.code));

    for (const d of existingDepts) {
      const code = String(d.code || '').trim().toUpperCase();
      if (LEGACY_CODE_MAP[code]) {
        oldIdToTargetCode[d.id] = LEGACY_CODE_MAP[code];
      } else if (officialCodes.has(code)) {
        oldIdToTargetCode[d.id] = code;
      } else if (code) {
        oldIdToTargetCode[d.id] = code;
        customDepts.push(d);
      }
    }

    const tablesWithDept = ['machines', 'form_templates', 'inspection_routes', 'route_rounds', 'users'];
    const rowDeptSnapshots = {};
    for (const tbl of tablesWithDept) {
      rowDeptSnapshots[tbl] = db.prepare(`SELECT id, department_id FROM ${tbl}`).all();
    }

    db.exec('PRAGMA foreign_keys = OFF;');
    try {
      db.prepare('DELETE FROM departments').run();
      try {
        db.prepare("DELETE FROM sqlite_sequence WHERE name = 'departments'").run();
      } catch (_) { /* ignore if sqlite_sequence not present */ }

      const insertDeptWithId = db.prepare(`
        INSERT INTO departments (id, code, name, plant_name, manager_name, color, icon, description)
        VALUES (@id, @code, @name, @plant_name, @manager_name, @color, @icon, @description)
      `);

      let nextId = 1;
      const codeToNewId = {};
      for (const d of OFFICIAL_FACTORY_DEPARTMENTS) {
        insertDeptWithId.run({
          id: nextId,
          code: d.code,
          name: d.name,
          plant_name: d.plant_name,
          manager_name: d.manager_name,
          color: d.color,
          icon: d.icon,
          description: d.description
        });
        codeToNewId[d.code] = nextId;
        nextId++;
      }

      for (const cd of customDepts) {
        insertDeptWithId.run({
          id: nextId,
          code: cd.code,
          name: cd.name,
          plant_name: cd.plant_name || 'ฝ่ายวิศวกรรมจักรกล (EN)',
          manager_name: cd.manager_name || '',
          color: cd.color || '#1f760e',
          icon: cd.icon || 'building-2',
          description: cd.description || ''
        });
        codeToNewId[String(cd.code || '').trim().toUpperCase()] = nextId;
        nextId++;
      }

      // Remap foreign keys in related tables
      for (const tbl of tablesWithDept) {
        const updateStmt = db.prepare(`UPDATE ${tbl} SET department_id = ? WHERE id = ?`);
        for (const row of rowDeptSnapshots[tbl]) {
          const targetCode = oldIdToTargetCode[row.department_id] || 'ML';
          const newDeptId = codeToNewId[targetCode] || codeToNewId.ML || 5;
          updateStmt.run(newDeptId, row.id);
        }
      }

      // Ensure primary engineer admin and standard forms map to exact official departments
      if (codeToNewId.ML) {
        db.prepare("UPDATE users SET department_id = ? WHERE emp_code = 'EMP-1001'").run(codeToNewId.ML);
        db.prepare("UPDATE machines SET department_id = ? WHERE machine_code LIKE 'ML-%'").run(codeToNewId.ML);
        db.prepare("UPDATE form_templates SET department_id = ? WHERE form_code = 'FRM-ML-001'").run(codeToNewId.ML);
        db.prepare("UPDATE inspection_routes SET department_id = ? WHERE route_code = 'RT-ML-01'").run(codeToNewId.ML);
      }
      if (codeToNewId.MA) {
        db.prepare("UPDATE form_templates SET department_id = ? WHERE form_code = 'FRM-MECH-001'").run(codeToNewId.MA);
        db.prepare("UPDATE form_templates SET department_id = ? WHERE form_code = 'FRM-SAFE-001'").run(codeToNewId.MA);
      }
      if (codeToNewId.EM) {
        db.prepare("UPDATE form_templates SET department_id = ? WHERE form_code = 'FRM-ELEC-001'").run(codeToNewId.EM);
      }
      if (codeToNewId.EP) {
        db.prepare("UPDATE form_templates SET department_id = ? WHERE form_code = 'FRM-PROD-AM01'").run(codeToNewId.EP);
      }
    } finally {
      db.exec('PRAGMA foreign_keys = ON;');
    }

    db.prepare("INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES ('official_depts_v30', 'true', datetime('now', '+7 hours'))").run();
    logAudit(
      'System Admin',
      'SYNC_DEPARTMENTS',
      'DEPARTMENTS',
      'คัดกรองเฉพาะ 10 แผนกปฏิบัติการสายผลิตและวิศวกรรม (PD, EN, EE)',
      'ตัดกลุ่มฝ่ายมาตรฐาน/ความปลอดภัย/คลังสินค้า (QS, QA, LB, EV, SF, WH, SW) ออกจากตัวเลือกระบบ คงไว้เฉพาะ 10 แผนกหลักในฝ่ายผลิต ฝ่ายวิศวกรรมจักรกล และฝ่ายวิศวกรรมไฟฟ้า'
    );

    return { synced: true, count: OFFICIAL_FACTORY_DEPARTMENTS.length };
  } catch (err) {
    console.error('syncOfficialFactoryDepartmentsSqlite error:', err.message);
    return { synced: false, error: err.message };
  }
}

const OFFICIAL_ML_MACHINES = [
  // กลุ่มที่ 1: ระบบรับอ้อย ดั๊มพ์อ้อย และสะพานดั๊มพ์ (Cane Unloading & Side Carrier)
  { machine_code: 'ML-TTP-01', name: 'ดั๊มพ์ เบอร์ 1 (Hydraulic Truck Tipper No.1)', category: 'Hydraulic System & Truck Tipper', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: -14, offsetZ: 9 },
  { machine_code: 'ML-TTP-02', name: 'ดั๊มพ์ เบอร์ 2 (Hydraulic Truck Tipper No.2)', category: 'Hydraulic System & Truck Tipper', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: -11.5, offsetZ: 9 },
  { machine_code: 'ML-TTP-03', name: 'ดั๊มพ์ เบอร์ 3 (Hydraulic Truck Tipper No.3)', category: 'Hydraulic System & Truck Tipper', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: -9, offsetZ: 9 },
  { machine_code: 'ML-PUN-01', name: 'ถังไฮดรอลิคยกดั๊มพ์ (Hydraulic Pump Unit for Tipper)', category: 'Hydraulic Power Unit', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: -6.5, offsetZ: 9 },
  { machine_code: 'ML-CAR-01', name: 'ตะกาวโกยอ้อย เบอร์ 1 (Cane Rake No.1)', category: 'Cane Unloading & Feeder', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: -4, offsetZ: 9 },
  { machine_code: 'ML-CAR-02', name: 'ตะกาวโกยอ้อย เบอร์ 2 (Cane Rake No.2)', category: 'Cane Unloading & Feeder', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: -1.5, offsetZ: 9 },
  { machine_code: 'ML-SCC-01', name: 'สะพานดั๊มพ์ (Side Cane Carrier)', category: 'Cane Carrier & Conveyor', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: 1, offsetZ: 9 },
  { machine_code: 'ML-LFS-01', name: 'ใบเกลี่ยสะพานดั๊มพ์ (Cane Leveller for Side cane carrier)', category: 'Cane Preparation', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: 3.5, offsetZ: 9 },
  { machine_code: 'ML-SND-01', name: 'สะพานสิ่งไร้สาระ เบอร์ 1 (สะพานยางดักทราย 1 - Sand Side Conveyor No.1)', category: 'Cane Carrier & Sand Conveyor', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'B', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: 6, offsetZ: 9 },
  { machine_code: 'ML-SND-02', name: 'สะพานสิ่งไร้สาระ เบอร์ 2 (สะพานยางดักทราย 2 - Sand Side Conveyor No.2)', category: 'Cane Carrier & Sand Conveyor', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'B', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: 8.5, offsetZ: 9 },
  { machine_code: 'ML-KCK-01', name: 'ใบเตะสะพานดั๊มพ์ เบอร์ 1 (Kicker No.1)', category: 'Cane Preparation', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: 11, offsetZ: 9 },
  { machine_code: 'ML-KCK-02', name: 'ใบเตะสะพานดั๊มพ์ เบอร์ 2 (Kicker No.2)', category: 'Cane Preparation', plant_area: 'อาคารลูกหีบ — โซนรางดั๊มพ์และสะพานดั๊มพ์', criticality: 'A', bay_label: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', offsetX: 13.5, offsetZ: 9 },

  // กลุ่มที่ 2: ระบบสะพานเมน มีดสับอ้อย และเครื่องเชร็ดเดอร์ (Main Carrier, Cutters & Shredder)
  { machine_code: 'ML-MCC-01', name: 'สะพานเมน (Main cane carrier)', category: 'Cane Carrier & Conveyor', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: -14, offsetZ: 3 },
  { machine_code: 'ML-PCT-01', name: 'ใบมีด Precutter (Pre-cutter for main cane carrier)', category: 'Cane Preparation (Cutter)', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: -11.5, offsetZ: 3 },
  { machine_code: 'ML-CUT-01', name: 'ใบมีดสะพานเมน No.1-1 (Cutter 1-1)', category: 'Cane Preparation (Cutter)', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: -9, offsetZ: 3 },
  { machine_code: 'ML-CUT-02', name: 'ใบมีดสะพานเมน No.2-1 (Cutter 2-1)', category: 'Cane Preparation (Cutter)', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: -6.5, offsetZ: 3 },
  { machine_code: 'ML-CUT-03', name: 'ใบมีดสะพานเมน No.1-2 (Cutter 1-2)', category: 'Cane Preparation (Cutter)', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: -4, offsetZ: 3 },
  { machine_code: 'ML-CUT-04', name: 'ใบมีดสะพานเมน No.2-2 (Cutter 2-2)', category: 'Cane Preparation (Cutter)', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: -1.5, offsetZ: 3 },
  { machine_code: 'ML-LFM-01', name: 'ใบเกลี่ยสะพานเมน (Main Leveller for Main cane carrier)', category: 'Cane Preparation', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 1, offsetZ: 3 },
  { machine_code: 'ML-KCK-03', name: 'ใบเตะสะพานเมน เบอร์ 3 (Kicker No.3)', category: 'Cane Preparation', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 3.5, offsetZ: 3 },
  { machine_code: 'ML-MAS-01', name: 'แม่เหล็กเชร็ดเดอร์ (Magnetic separator (for Shredder))', category: 'Magnetic Separator', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 6, offsetZ: 3 },
  { machine_code: 'ML-TUR-01', name: 'เทอร์ไบน์ขับเชร็ดเดอร์ (Turbine for Heavy Duty Shredder)', category: 'Steam Turbine Drive', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 8.5, offsetZ: 3 },
  { machine_code: 'ML-SHR-01', name: 'เครื่องเชร็ดเดอร์ (Heavy Duty Shredder)', category: 'Heavy Duty Shredder', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 11, offsetZ: 3 },
  { machine_code: 'ML-SHE-01', name: 'สะพานเชร็ดเดอร์ (Shredder Elevator)', category: 'Cane Carrier & Conveyor', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 13.5, offsetZ: 3 },
  { machine_code: 'ML-HSB-01', name: 'สายพานยาง High speed belt (High speed belt)', category: 'High Speed Belt Conveyor', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 15.5, offsetZ: 3 },
  { machine_code: 'ML-MAS-02', name: 'แม่เหล็กสำหรับสะพานยาง (Magnetic separator (for speed belt))', category: 'Magnetic Separator', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 17.5, offsetZ: 3 },
  { machine_code: 'ML-LFH-01', name: 'ใบเกลี่ย High Speed Belt', category: 'Cane Preparation', plant_area: 'อาคารลูกหีบ — โซนสะพานเมนและเชร็ดเดอร์', criticality: 'A', bay_label: 'สะพานสายพานลำเลียงชานอ้อยหลัก', offsetX: 19.5, offsetZ: 3 },

  // กลุ่มที่ 3: ระบบชุดลูกหีบสกัดน้ำอ้อย สะพานข้ามชุด และโรตารี่สกรีน (Milling Tandem & Screening)
  { machine_code: 'ML-INT-01', name: 'สะพานข้ามชุด เบอร์ 1 (Intermediate Carrier No.1)', category: 'Intermediate Carrier', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: -14, offsetZ: -3 },
  { machine_code: 'ML-INT-02', name: 'สะพานข้ามชุด เบอร์ 2 (Intermediate Carrier No.2)', category: 'Intermediate Carrier', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: -11, offsetZ: -3 },
  { machine_code: 'ML-INT-03', name: 'สะพานข้ามชุด เบอร์ 3 (Intermediate Carrier No.3)', category: 'Intermediate Carrier', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: -8, offsetZ: -3 },
  { machine_code: 'ML-RSC-01', name: 'โรตารี่สกีน (Rotary screen)', category: 'Juice Screening', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'B', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: -5, offsetZ: -3 },
  { machine_code: 'ML-SCY-01', name: 'รางสว่านลำเลียงกากอ้อย (Bagasse Screw Conveyor)', category: 'Screw Conveyor', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'B', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: -2, offsetZ: -3 },
  { machine_code: 'ML-MIL-02', name: 'ลูกหีบ ชุดที่ 2 (Mill No.2)', category: 'Milling Tandem Unit', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: 1, offsetZ: -3 },
  { machine_code: 'ML-MIL-03', name: 'ลูกหีบ ชุดที่ 3 (Mill No.3)', category: 'Milling Tandem Unit', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: 4, offsetZ: -3 },
  { machine_code: 'ML-MIL-04', name: 'ลูกหีบ ชุดที่ 4 (Mill No.4)', category: 'Milling Tandem Unit', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: 7, offsetZ: -3 },
  { machine_code: 'ML-MIL-05', name: 'ลูกหีบ ชุดที่ 5 (Mill No.5)', category: 'Milling Tandem Unit', plant_area: 'อาคารลูกหีบ — โซนชุดลูกหีบและสะพานข้ามชุด', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: 10, offsetZ: -3 },

  // กลุ่มที่ 4: เครนเหนือศีรษะและรอกไฟฟ้าประจำอาคารลูกหีบ (Overhead Cranes & Electric Hoists)
  { machine_code: 'ML-CRN-01', name: 'เครนเหนือศรีษะ ขนาด 10/5 ตัน (Overhead crane 10/5 ton)', category: 'Overhead Crane & Hoist', plant_area: 'อาคารลูกหีบ — โถงเครนเหนือศีรษะและรอกไฟฟ้า', criticality: 'B', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: -10, offsetZ: -8 },
  { machine_code: 'ML-CRN-02', name: 'เครนเหนือศรีษะ ขนาด 50/20 ตัน เบอร์ 1 (Overhead crane 50/20 ton No.1)', category: 'Overhead Crane & Hoist', plant_area: 'อาคารลูกหีบ — โถงเครนเหนือศีรษะและรอกไฟฟ้า', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: -5, offsetZ: -8 },
  { machine_code: 'ML-CRN-03', name: 'เครนเหนือศรีษะ ขนาด 50/20 ตัน เบอร์ 2 (Overhead crane 50/20 ton No.2)', category: 'Overhead Crane & Hoist', plant_area: 'อาคารลูกหีบ — โถงเครนเหนือศีรษะและรอกไฟฟ้า', criticality: 'A', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: 0, offsetZ: -8 },
  { machine_code: 'ML-OHC-10', name: 'รอกไฟฟ้า OHC-10 ขนาด 2 ton S/N 18091799', category: 'Overhead Crane & Hoist', plant_area: 'อาคารลูกหีบ — โถงเครนเหนือศีรษะและรอกไฟฟ้า', criticality: 'B', serial_number: '18091799', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: 5, offsetZ: -8 },
  { machine_code: 'ML-OHC-11', name: 'รอกไฟฟ้า OHC-11 ขนาด 5 ton S/N 18100447', category: 'Overhead Crane & Hoist', plant_area: 'อาคารลูกหีบ — โถงเครนเหนือศีรษะและรอกไฟฟ้า', criticality: 'B', serial_number: '18100447', bay_label: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', offsetX: 10, offsetZ: -8 }
];

function syncOfficialMillingMachinesSqlite(force = false) {
  try {
    const flag = db.prepare("SELECT value FROM system_settings WHERE key = 'official_ml_machines_v28_shift2'").get();
    const existingMlCount = db.prepare("SELECT COUNT(*) AS cnt FROM machines WHERE machine_code LIKE 'ML-%' AND machine_code NOT GLOB 'ML-[0-9][0-9]'").get().cnt;
    if (!force && flag && flag.value === 'true') {
      return { synced: false };
    }

    // Clean up temporary ML-01 to ML-38 records
    db.prepare("DELETE FROM machine_placements WHERE machine_code GLOB 'ML-[0-9][0-9]'").run();
    db.prepare("DELETE FROM machines WHERE machine_code GLOB 'ML-[0-9][0-9]'").run();

    const mlDept = db.prepare("SELECT id FROM departments WHERE code = 'ML'").get();
    const mlDeptId = mlDept ? mlDept.id : 5;

    const upsertMachine = db.prepare(`
      INSERT INTO machines (
        machine_code, name, category, department_id, plant_area, system_name,
        brand, model, serial_number, criticality, operating_state, health_status,
        running_hours, specs_json, location_note
      ) VALUES (
        @machine_code, @name, @category, @department_id, @plant_area, @system_name,
        @brand, @model, @serial_number, @criticality, 'running', 'normal',
        0, @specs_json, @location_note
      )
      ON CONFLICT(machine_code) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        department_id = excluded.department_id,
        plant_area = excluded.plant_area,
        criticality = excluded.criticality,
        serial_number = CASE WHEN excluded.serial_number != '' THEN excluded.serial_number ELSE machines.serial_number END
    `);

    const upsertPlacement = db.prepare(`
      INSERT INTO machine_placements (
        machine_code, zone_id, bay_label, anchor_offset_json, x, y, z,
        location_verified, verified_by, verified_at, note, revision, updated_by
      ) VALUES (
        @machine_code, 'production-center', @bay_label, @anchor_offset_json,
        @x, 4, @z, 1, 'แผนกลูกหีบ (ML)', datetime('now', '+7 hours'),
        @note, 1, 'System Setup'
      )
      ON CONFLICT(machine_code) DO UPDATE SET
        zone_id = excluded.zone_id,
        bay_label = excluded.bay_label,
        anchor_offset_json = excluded.anchor_offset_json,
        x = excluded.x,
        z = excluded.z
    `);

    for (const m of OFFICIAL_ML_MACHINES) {
      upsertMachine.run({
        machine_code: m.machine_code,
        name: m.name,
        category: m.category,
        department_id: mlDeptId,
        plant_area: m.plant_area,
        system_name: 'สายการผลิตแผนกลูกหีบ (Milling Line)',
        brand: '',
        model: '',
        serial_number: m.serial_number || '',
        criticality: m.criticality || 'A',
        specs_json: JSON.stringify({
          power_kw: '-',
          bearing_de: 'มาตรฐานโรงงาน',
          lube_oil: 'ตามตารางหล่อลื่นแผนกลูกหีบ',
          components: ['ชุดขับเคลื่อนหลัก', 'ตลับลูกปืน DE/NDE', 'ระบบหล่อลื่น/ไฮดรอลิก', 'โครงสร้างและอุปกรณ์นิรภัย']
        }),
        location_note: m.plant_area
      });

      const worldX = -6 + (m.offsetX || 0);
      const worldZ = -14 + (m.offsetZ || 0);
      upsertPlacement.run({
        machine_code: m.machine_code,
        bay_label: m.bay_label || 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)',
        anchor_offset_json: JSON.stringify({ offsetX: m.offsetX || 0, offsetZ: m.offsetZ || 0 }),
        x: worldX,
        z: worldZ,
        note: `${m.name} (${m.plant_area})`
      });
    }

    // Ensure dedicated Milling inspection form FRM-ML-001 exists for department ML
    const existingMlForm = db.prepare("SELECT id FROM form_templates WHERE form_code = 'FRM-ML-001'").get();
    if (!existingMlForm) {
      db.prepare(`
        INSERT INTO form_templates (
          form_code, title, description, department_id, target_machine_id,
          machine_category, frequency, estimated_minutes, version, require_signature, sections_json
        ) VALUES (
          @form_code, @title, @description, @department_id, NULL,
          'ALL', 'per_shift', 15, 1, 1, @sections_json
        )
      `).run({
        form_code: 'FRM-ML-001',
        title: 'แบบฟอร์มตรวจเช็คเครื่องจักรแผนกลูกหีบประจำกะ (Milling & Cane Preparation Checksheet)',
        description: 'สำหรับช่างและพนักงานแผนกลูกหีบ (ML) ตรวจเช็ครางดั๊มพ์ สะพานลำเลียงอ้อย มีดสับอ้อย เชร็ดเดอร์ ชุดลูกหีบ และเครนเหนือศีรษะ',
        department_id: mlDeptId,
        sections_json: JSON.stringify([
          {
            id: 'sec_ml_1',
            title: 'หมวดที่ 1: ระบบหล่อลื่น ไฮดรอลิก และความพร้อมทางกล (Lubrication, Hydraulic & Mechanical)',
            fields: [
              {
                id: 'f_ml_oil_level',
                label: 'ระดับน้ำมันหล่อลื่นเกียร์ / น้ำมันไฮดรอลิก และจุดอัดจาระบี',
                field_type: 'three_state',
                tpm_tag: 'L',
                tool_method: 'สายตาตรวจ Sight Glass / เกจวัดระดับ',
                standard_opl: 'ระดับน้ำมันอยู่ในเกณฑ์ปกติ (1/2 - 3/4) ไม่มีรอยรั่วซึมหรือน้ำมันขุ่นเป็นฟอง',
                running_only: false,
                required: true,
                options: ['ปกติ (ระดับปกติ/ไม่รั่วซึม)', 'เฝ้าระวัง (พร่องเล็กน้อย/เติมเพิ่ม)', 'ผิดปกติ (ต่ำกว่าเกณฑ์/รั่วซึมรุนแรง)']
              },
              {
                id: 'f_ml_structure',
                label: 'สภาพโซ่ลำเลียง ใบมีด ค้อนเชร็ดเดอร์ ลูกหีบ หรือสลิงเครน และน็อตยึดแท่น',
                field_type: 'pass_fail',
                tpm_tag: 'T',
                tool_method: 'สายตาและฟังเสียงผิดปกติขณะทำงาน',
                standard_opl: 'น็อตยึดแน่นหนา โซ่ไม่หย่อนหรือตึงผิดปกติ การ์ดครอบจุดหมุนครบถ้วน',
                running_only: false,
                required: true
              }
            ]
          },
          {
            id: 'sec_ml_2',
            title: 'หมวดที่ 2: การตรวจวัดอุณหภูมิลูกปืน ความสั่นสะเทือน และแรงดันใช้งาน',
            fields: [
              {
                id: 'f_ml_brg_temp',
                label: 'อุณหภูมิลูกปืน / ตัวเรือนเกียร์ (Bearing & Gearbox Temperature)',
                field_type: 'number_range',
                tpm_tag: 'I',
                tool_method: 'ปืนวัดอุณหภูมิอินฟราเรด (IR Thermometer)',
                standard_opl: 'ปกติ ≤ 70°C | เฝ้าระวัง 70.1 - 80°C | ผิดปกติ > 80°C',
                unit: '°C',
                min_normal: 25,
                max_normal: 70,
                max_warning: 80,
                running_only: true,
                required: true
              },
              {
                id: 'f_ml_vib',
                label: 'ความสั่นสะเทือนรวม (Overall Vibration Velocity RMS)',
                field_type: 'number_range',
                tpm_tag: 'I',
                tool_method: 'เครื่องวัดความสั่นสะเทือน (Vibration Meter)',
                standard_opl: 'ปกติ ≤ 4.5 mm/s | เฝ้าระวัง 4.51 - 7.1 mm/s | ผิดปกติ > 7.1 mm/s',
                unit: 'mm/s',
                min_normal: 0.1,
                max_normal: 4.5,
                max_warning: 7.1,
                running_only: true,
                required: false
              },
              {
                id: 'f_ml_sound',
                label: 'เสียงและกลิ่นผิดปกติขณะเดินเครื่อง (Abnormal Noise & Smell)',
                field_type: 'pass_fail',
                tpm_tag: 'I',
                tool_method: 'ฟังเสียง / สังเกตอาการหน้างาน',
                standard_opl: 'ไม่มีเสียงกระแทกผิดปกติที่ลูกปืน/ชุดเกียร์ ไม่มีกลิ่นไหม้',
                running_only: true,
                required: true
              }
            ]
          }
        ])
      });
    }

    // Ensure sequential walking route RT-ML-01 exists for Milling Department
    const mlMachinesInDb = db.prepare("SELECT id, machine_code, name, plant_area FROM machines WHERE department_id = ? ORDER BY id ASC").all(mlDeptId);
    const mlFormRow = db.prepare("SELECT id FROM form_templates WHERE form_code = 'FRM-ML-001'").get();
    const mlFormId = mlFormRow ? mlFormRow.id : 1;

    if (mlMachinesInDb.length > 0) {
      const stops = mlMachinesInDb.map((m, idx) => ({
        order: idx + 1,
        machine_id: m.id,
        machine_code: m.machine_code,
        machine_name: m.name,
        plant_area: m.plant_area,
        form_id: mlFormId,
        target_Offset_min: (idx + 1) * 3,
        focus_note: `จุดตรวจที่ ${idx + 1}: ${m.name}`
      }));
      const schedules = [
        { shift: 'กะเช้า (07:00-19:00)', window: '07:30 - 09:30 น.', team_size: 2, default_inspectors: ['วศ.ประจักษ์ (System Center Admin)'] },
        { shift: 'กะดึก (19:00-07:00)', window: '19:30 - 21:30 น.', team_size: 2, default_inspectors: [] }
      ];

      db.prepare(`
        INSERT INTO inspection_routes (
          route_code, name, department_id, description, shift_schedules_json, stops_json, estimated_minutes
        ) VALUES (
          'RT-ML-01',
          'สายเดินตรวจเครื่องจักรแผนกลูกหีบตามลำดับการผลิต (รางดั๊มพ์ → สะพานเมน → เชร็ดเดอร์ → ลูกหีบ → เครน)',
          @department_id,
          'เดินตรวจเช็คเครื่องจักรจริงในแผนกลูกหีบ (ML) เรียงตามลำดับกระบวนการผลิตตามรหัสเครื่องจักรทางการ',
          @shift_schedules_json,
          @stops_json,
          90
        )
        ON CONFLICT(route_code) DO UPDATE SET
          name = excluded.name,
          department_id = excluded.department_id,
          description = excluded.description,
          shift_schedules_json = excluded.shift_schedules_json,
          stops_json = excluded.stops_json
      `).run({
        department_id: mlDeptId,
        shift_schedules_json: JSON.stringify(schedules),
        stops_json: JSON.stringify(stops)
      });
    }

    db.prepare("INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES ('official_ml_machines_v28_shift2', 'true', datetime('now', '+7 hours'))").run();
    logAudit(
      'System Admin',
      'IMPORT_ML_MACHINES',
      'MACHINES',
      'นำเข้ารหัสเครื่องจักรทางการ แผนกลูกหีบ (ML)',
      'อัปเดตรหัสเครื่องจักรทางการของแผนกลูกหีบ (ML-TTP-01, ML-CAR-01, ML-TUR-01, ML-SHR-01 ฯลฯ) แยก TUR/SHR พร้อมผูกพิกัดและสายเดินตรวจ'
    );

    return { synced: true, count: OFFICIAL_ML_MACHINES.length };
  } catch (err) {
    console.error('syncOfficialMillingMachinesSqlite error:', err.message);
    return { synced: false, error: err.message };
  }
}

const OFFICIAL_TECHNICIAN_USERS = [
  { emp_code: '629315', full_name: 'นายบุญชู งวดสูงเนิน', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '659170', full_name: 'นายทินกร ทองอาบ', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '619279', full_name: 'นายจรุนันท์ ประจิตร', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '629011', full_name: 'นายศุภมิตร สีคันทา', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '629273', full_name: 'นายศักดิ์รินทร์ คำภักดี', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '669084', full_name: 'นายสหัสวรรษ ผิวผ่อง', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '629302', full_name: 'นายสมชาย มีมุข', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '629328', full_name: 'นายไพรวัลย์ มีระหันนอก', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '639152', full_name: 'นายสมนึก ใจดี', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '659246', full_name: 'นายสุรกันต์ ช้างน้อย', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '649073', full_name: 'นายวุฒิพงษ์ นนทะคำจันทร์', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '659096', full_name: 'นายรัฐพล แก้วสุวรรณ์', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '669041', full_name: 'นายรัชชานนท์ องอาจ', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '669199', full_name: 'นายพิชิตตมาร คำกลาง', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '679047', full_name: 'นายมารุต บุญค้ำชู', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '679046', full_name: 'นายธณกฤษ ท้าวธงชัย', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '689094', full_name: 'นายธนพล กันเย็น', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '689109', full_name: 'นายพิชิต สุทธิศิริ', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '699042', full_name: 'นายดนัย พินยารัตน์', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '699043', full_name: 'นายศุภฤกษ์ ซีกพุดซา', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '699127', full_name: 'นายวิทยา สาระคำ', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '679191', full_name: 'น.ส.สมฤทัย พูลผล', position: 'ช่างเทคนิคตรวจเช็ค', role: 'inspector', dept_code: 'ML' },
  { emp_code: '698014', full_name: 'นายอริยธรรม ขันคำ(นศ.ฝึกงาน)', position: 'นักศึกษาฝึกงานตรวจเช็ค', role: 'inspector', dept_code: 'ML' }
];

function syncOfficialTechnicianUsersSqlite(force = false) {
  try {
    const flag = db.prepare("SELECT value FROM system_settings WHERE key = 'official_technicians_v212'").get();
    if (!force && flag && flag.value === 'true') {
      return { synced: false };
    }

    const mlDept = db.prepare("SELECT id FROM departments WHERE UPPER(code) = 'ML'").get()
      || db.prepare("SELECT id FROM departments ORDER BY id ASC LIMIT 1").get();
    const mlDeptId = mlDept ? mlDept.id : 5;

    const findStmt = db.prepare("SELECT id, full_name, role FROM users WHERE UPPER(emp_code) = ?");
    const insertStmt = db.prepare(`
      INSERT INTO users (emp_code, full_name, position, department_id, role, phone, email, is_active)
      VALUES (?, ?, ?, ?, ?, '', '', 1)
    `);
    const updateStmt = db.prepare(`
      UPDATE users
      SET full_name = ?, position = ?, department_id = ?, role = ?, is_active = 1
      WHERE id = ?
    `);

    let inserted = 0;
    let updated = 0;

    for (const tech of OFFICIAL_TECHNICIAN_USERS) {
      const existing = findStmt.get(tech.emp_code.toUpperCase());
      if (existing) {
        updateStmt.run(tech.full_name, tech.position, mlDeptId, tech.role || 'inspector', existing.id);
        updated++;
      } else {
        insertStmt.run(tech.emp_code, tech.full_name, tech.position, mlDeptId, tech.role || 'inspector');
        inserted++;
      }
    }

    db.prepare("INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES ('official_technicians_v212', 'true', datetime('now', '+7 hours'))").run();
    logAudit(
      'System Admin',
      'IMPORT_USERS',
      'USERS',
      'นำเข้ารายชื่อช่างตรวจเช็ค 23 คน (แผนกลูกหีบ ML)',
      `เพิ่ม/อัปเดตช่างตรวจเช็ค 23 รายการ ใช้รหัสพนักงานเป็น username/emp_code (เพิ่มใหม่ ${inserted}, อัปเดต ${updated})`
    );

    return { synced: true, inserted, updated, total: OFFICIAL_TECHNICIAN_USERS.length };
  } catch (err) {
    console.error('syncOfficialTechnicianUsersSqlite error:', err.message);
    return { synced: false, error: err.message };
  }
}

function purgeMockupDataFromSqlite(force = false) {
  try {
    const flag = db.prepare("SELECT value FROM system_settings WHERE key = 'mockup_purged_v24'").get();
    if (!force && flag && flag.value === 'true') {
      syncOfficialFactoryDepartmentsSqlite(false);
      syncOfficialMillingMachinesSqlite(false);
      syncOfficialTechnicianUsersSqlite(false);
      return { purged: false };
    }

    const deleteByInList = (table, col, values) => {
      if (!values || values.length === 0) return 0;
      const placeholders = values.map(() => '?').join(',');
      const stmt = db.prepare(`DELETE FROM ${table} WHERE ${col} IN (${placeholders})`);
      return stmt.run(...values).changes || 0;
    };

    const deletedDefects = deleteByInList('defect_tickets', 'ticket_no', MOCKUP_IDENTIFIERS.defects);
    const deletedInspections = deleteByInList('inspections', 'doc_no', MOCKUP_IDENTIFIERS.inspections);
    const deletedRounds = deleteByInList('route_rounds', 'round_code', MOCKUP_IDENTIFIERS.rounds);
    const deletedRoutes = deleteByInList('inspection_routes', 'route_code', MOCKUP_IDENTIFIERS.routes);
    const deletedPlacements = deleteByInList('machine_placements', 'machine_code', MOCKUP_IDENTIFIERS.machines);
    const deletedMachines = deleteByInList('machines', 'machine_code', MOCKUP_IDENTIFIERS.machines);
    const deletedUsers = deleteByInList('users', 'emp_code', MOCKUP_IDENTIFIERS.users);

    db.prepare("INSERT OR REPLACE INTO system_settings (key, value, updated_at) VALUES ('mockup_purged_v24', 'true', datetime('now', '+7 hours'))").run();
    syncOfficialFactoryDepartmentsSqlite(force);
    syncOfficialMillingMachinesSqlite(force);

    const totalRemoved = deletedDefects + deletedInspections + deletedRounds + deletedRoutes + deletedPlacements + deletedMachines + deletedUsers;
    if (totalRemoved > 0) {
      logAudit(
        'System Admin',
        'PURGE_MOCKUP_DATA',
        'DATABASE',
        'ลบข้อมูลจำลอง (Mockup Data)',
        `ลบข้อมูลจำลองออกจากระบบแล้ว (เครื่องจักร ${deletedMachines}, ผลตรวจ ${deletedInspections}, ใบแจ้งซ่อม ${deletedDefects}, สายตรวจ ${deletedRoutes}, รอบตรวจ ${deletedRounds}, พนักงานตัวอย่าง ${deletedUsers}) เพื่อเตรียมรับข้อมูลจริง`
      );
    }
    return {
      purged: true,
      deletedMachines,
      deletedInspections,
      deletedDefects,
      deletedRoutes,
      deletedRounds,
      deletedPlacements,
      deletedUsers
    };
  } catch (err) {
    console.error('purgeMockupDataFromSqlite error:', err.message);
    return { purged: false, error: err.message };
  }
}

let authenticatedActor = null;
function setAuditActor(actor) { authenticatedActor = actor; }
function logAudit(actorName, actionType, targetType, targetName, detail = '', undoPayload = null) {
  actorName = authenticatedActor || actorName;
  try {
    const canUndo = undoPayload ? 1 : 0;
    const undoJson = undoPayload ? JSON.stringify(undoPayload) : '{}';
    db.prepare(`
      INSERT INTO audit_logs (actor_name, action_type, target_type, target_name, detail, can_undo, reverted, undo_json, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?, datetime('now', '+7 hours'))
    `).run(actorName || 'System Admin', actionType, targetType, targetName, detail || '', canUndo, undoJson);
  } catch (e) {
    console.error('Audit log error:', e.message);
  }
}

module.exports = {
  setAuditActor,
  db,
  initDatabase,
  logAudit,
  purgeMockupDataFromSqlite,
  syncOfficialFactoryDepartmentsSqlite,
  syncOfficialMillingMachinesSqlite,
  syncOfficialTechnicianUsersSqlite,
  OFFICIAL_FACTORY_DEPARTMENTS,
  OFFICIAL_ML_MACHINES,
  OFFICIAL_TECHNICIAN_USERS,
  MOCKUP_IDENTIFIERS
};
