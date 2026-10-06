// ============================================================================
// COMIS Center — Core Frontend Application (app.js)
// รองรับทั้งโหมดเปิดไฟล์ HTML โดยตรง (Standalone LocalStorage) และโหมดเชื่อมต่อ Server
// ============================================================================

const STORAGE_KEY = 'ESC_COMIS_CENTER_DB_V2';

function getInitialSeedData() {
  return {
    settings: {
      organization_name: 'บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) — ฝ่ายวิศวกรรมจักรกล',
      plant_title: 'ระบบตรวจสอบเครื่องจักรออนไลน์แบบศูนย์กลาง (ESC Machine Inspection Center)',
      telegram_bot_token: '',
      telegram_default_chat_id: '',
      auto_create_defect_ticket: 'true',
      require_photo_on_abnormal: 'true'
    },
    departments: [
      // กลุ่มที่ 1: ฝ่ายผลิต (PD) >> 4 แผนก
      {
        id: 1,
        code: 'EP',
        name: 'แผนกหม้อต้ม',
        plant_name: 'ฝ่ายผลิต (PD)',
        manager_name: 'หัวหน้าแผนกหม้อต้ม',
        color: '#059669',
        icon: 'flame',
        description: 'ดูแลควบคุมกระบวนการใสน้ำอ้อย หม้อต้ม (Evaporator) และระบบทำความร้อนน้ำอ้อย'
      },
      {
        id: 2,
        code: 'VP',
        name: 'แผนกหม้อเคี่ยว',
        plant_name: 'ฝ่ายผลิต (PD)',
        manager_name: 'หัวหน้าแผนกหม้อเคี่ยว',
        color: '#0d9488',
        icon: 'gauge',
        description: 'ดูแลควบคุมหม้อเคี่ยวสุญญากาศ (Vacuum Pan) และการตกผลึกน้ำตาล'
      },
      {
        id: 3,
        code: 'CF',
        name: 'แผนกหม้อปั่น',
        plant_name: 'ฝ่ายผลิต (PD)',
        manager_name: 'หัวหน้าแผนกหม้อปั่น',
        color: '#0891b2',
        icon: 'refresh-cw',
        description: 'ดูแลเครื่องปั่นแยกน้ำตาล (Centrifugal) ระบบอบแห้ง และลำเลียงน้ำตาลเข้าบรรจุ'
      },
      {
        id: 4,
        code: 'WP',
        name: 'แผนกระบบน้ำ',
        plant_name: 'ฝ่ายผลิต (PD)',
        manager_name: 'หัวหน้าแผนกระบบน้ำ',
        color: '#0284c7',
        icon: 'droplets',
        description: 'ดูแลระบบผลิตน้ำดี น้ำป้อนหม้อไอน้ำ หอหล่อเย็น (Cooling Tower) และระบบบำบัดน้ำ'
      },
      // กลุ่มที่ 2: ฝ่ายวิศวกรรมจักรกล (EN) >> 3 แผนก
      {
        id: 5,
        code: 'ML',
        name: 'แผนกลูกหีบ',
        plant_name: 'ฝ่ายวิศวกรรมจักรกล (EN)',
        manager_name: 'หัวหน้าแผนกลูกหีบ',
        color: '#16a34a',
        icon: 'settings',
        description: 'ดูแลเครื่องจักรเตรียมอ้อย มีดสับอ้อย เครื่องย่อยอ้อย (Shredder) และชุดลูกหีบสกัดน้ำอ้อย'
      },
      {
        id: 6,
        code: 'MA',
        name: 'แผนกเครื่องกลซ่อมบำรุง',
        plant_name: 'ฝ่ายวิศวกรรมจักรกล (EN)',
        manager_name: 'หัวหน้าแผนกเครื่องกลซ่อมบำรุง',
        color: '#1f760e',
        icon: 'wrench',
        description: 'ดูแลงานซ่อมบำรุงเครื่องกล ปั๊ม ชุดเกียร์ ระบบไฮดรอลิก และการตรวจสอบสภาพเครื่องจักร (CBM/PM)'
      },
      {
        id: 7,
        code: 'EBL',
        name: 'แผนกหม้อไอน้ำ',
        plant_name: 'ฝ่ายวิศวกรรมจักรกล (EN)',
        manager_name: 'หัวหน้าแผนกหม้อไอน้ำ',
        color: '#dc2626',
        icon: 'flame',
        description: 'ดูแลหม้อไอน้ำแรงดันสูง (Boiler) พัดลมเป่าเตา ระบบลำเลียงกากอ้อย และอุปกรณ์นิรภัยไอน้ำ'
      },
      // กลุ่มที่ 3: ฝ่ายวิศวกรรมไฟฟ้า (EE) >> 3 แผนก
      {
        id: 8,
        code: 'EM',
        name: 'แผนกไฟฟ้าซ่อมบำรุง',
        plant_name: 'ฝ่ายวิศวกรรมไฟฟ้า (EE)',
        manager_name: 'หัวหน้าแผนกไฟฟ้าซ่อมบำรุง',
        color: '#ea580c',
        icon: 'zap',
        description: 'ดูแลบำรุงรักษามอเตอร์ไฟฟ้า ตู้ควบคุม MCC/MDB อินเวอร์เตอร์ (VFD) และระบบไฟฟ้ากำลัง'
      },
      {
        id: 9,
        code: 'ME',
        name: 'แผนกอุปกรณ์เครื่องมือวัด',
        plant_name: 'ฝ่ายวิศวกรรมไฟฟ้า (EE)',
        manager_name: 'หัวหน้าแผนกอุปกรณ์เครื่องมือวัด',
        color: '#ca8a04',
        icon: 'activity',
        description: 'ดูแลเครื่องมือวัดคุม (Instrumentation) วาล์วควบคุมอัตโนมัติ เซ็นเซอร์ และระบบ PLC/DCS'
      },
      {
        id: 10,
        code: 'EPP',
        name: 'แผนกไฟฟ้าผลิต',
        plant_name: 'ฝ่ายวิศวกรรมไฟฟ้า (EE)',
        manager_name: 'หัวหน้าแผนกไฟฟ้าผลิต',
        color: '#b45309',
        icon: 'cpu',
        description: 'ดูแลเครื่องกำเนิดไฟฟ้ากังหันไอน้ำ (Steam Turbine Generator) และระบบจ่ายกระแสไฟฟ้าหลัก'
      }
    ],
    users: [
      { id: 1, emp_code: 'EMP-1001', full_name: 'วศ.ประจักษ์ (System Center Admin)', position: 'วิศวกรเครื่องกลอาวุโส', department_id: 5, role: 'super_admin', phone: '081-234-5678', email: 'prajaktu@factory.co.th' },
      { id: 2, emp_code: '629315', full_name: 'นายบุญชู งวดสูงเนิน', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 3, emp_code: '659170', full_name: 'นายทินกร ทองอาบ', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 4, emp_code: '619279', full_name: 'นายจรุนันท์ ประจิตร', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 5, emp_code: '629011', full_name: 'นายศุภมิตร สีคันทา', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 6, emp_code: '629273', full_name: 'นายศักดิ์รินทร์ คำภักดี', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 7, emp_code: '669084', full_name: 'นายสหัสวรรษ ผิวผ่อง', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 8, emp_code: '629302', full_name: 'นายสมชาย มีมุข', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 9, emp_code: '629328', full_name: 'นายไพรวัลย์ มีระหันนอก', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 10, emp_code: '639152', full_name: 'นายสมนึก ใจดี', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 11, emp_code: '659246', full_name: 'นายสุรกันต์ ช้างน้อย', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 12, emp_code: '649073', full_name: 'นายวุฒิพงษ์ นนทะคำจันทร์', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 13, emp_code: '659096', full_name: 'นายรัฐพล แก้วสุวรรณ์', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 14, emp_code: '669041', full_name: 'นายรัชชานนท์ องอาจ', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 15, emp_code: '669199', full_name: 'นายพิชิตตมาร คำกลาง', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 16, emp_code: '679047', full_name: 'นายมารุต บุญค้ำชู', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 17, emp_code: '679046', full_name: 'นายธณกฤษ ท้าวธงชัย', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 18, emp_code: '689094', full_name: 'นายธนพล กันเย็น', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 19, emp_code: '689109', full_name: 'นายพิชิต สุทธิศิริ', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 20, emp_code: '699042', full_name: 'นายดนัย พินยารัตน์', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 21, emp_code: '699043', full_name: 'นายศุภฤกษ์ ซีกพุดซา', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 22, emp_code: '699127', full_name: 'นายวิทยา สาระคำ', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 23, emp_code: '679191', full_name: 'น.ส.สมฤทัย พูลผล', position: 'ช่างเทคนิคตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' },
      { id: 24, emp_code: '698014', full_name: 'นายอริยธรรม ขันคำ(นศ.ฝึกงาน)', position: 'นักศึกษาฝึกงานตรวจเช็ค', department_id: 5, role: 'inspector', phone: '', email: '' }
    ],
    machines: [],
    forms: [
      {
        id: 1,
        form_code: 'FRM-MECH-001',
        title: 'แบบฟอร์มตรวจเช็คเครื่องจักรหมุนและปั๊มแรงดันสูง (Mechanical & CBM Checksheet)',
        description: 'สำหรับช่างวิศวกรรมเครื่องกล (MA / ML / EBL) ตรวจวัดอุณหภูมิลูกปืน ความสั่นสะเทือน (Vibration) แรงดัน และระบบหล่อลื่น',
        department_id: 6,
        target_machine_id: null,
        machine_category: 'ALL',
        frequency: 'daily',
        estimated_minutes: 15,
        version: 2,
        require_signature: 1,
        sections: [
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
                standard_opl: 'ปกติ ≤ 70°C | เฝ้าระวัง 70.1 - 80°C | ผิดปกติ > 80°C',
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
                standard_opl: 'ตามเกณฑ์ ISO 10816: ปกติ ≤ 4.5 mm/s | เฝ้าระวัง 4.51 - 7.1 mm/s | ผิดปกติ > 7.1 mm/s',
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
        ]
      },
      {
        id: 2,
        form_code: 'FRM-ELEC-001',
        title: 'แบบฟอร์มตรวจเช็คมอเตอร์ไฟฟ้าและตู้ควบคุม (Electrical Motor & MCC Inspection)',
        description: 'สำหรับช่างไฟฟ้าและวัดคุม (EM / ME / EPP) ตรวจวัดกระแสไฟฟ้า 3 เฟส อุณหภูมิมอเตอร์ พัดลมระบายอากาศ และจุดต่อสายไฟ',
        department_id: 8,
        target_machine_id: null,
        machine_category: 'ALL',
        frequency: 'weekly',
        estimated_minutes: 20,
        version: 1,
        require_signature: 1,
        sections: [
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
                label: 'อุณหภูมิตัวถังมอเตอร์และกล่องต่อสาย (Motor Frame Temp)',
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
        ]
      },
      {
        id: 3,
        form_code: 'FRM-PROD-AM01',
        title: 'แบบฟอร์มตรวจเช็คเครื่องจักรประจำกะโดยพนักงานเดินเครื่อง (AM / CLIT Daily Check)',
        description: 'สำหรับพนักงานฝ่ายผลิต (EP / VP / CF / WP) ตรวจความสะอาด น้ำมันหล่อลื่น เสียงผิดปกติ และความพร้อมประจำกะ',
        department_id: 1,
        target_machine_id: null,
        machine_category: 'ALL',
        frequency: 'per_shift',
        estimated_minutes: 10,
        version: 1,
        require_signature: 1,
        sections: [
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
                standard_opl: 'หากไม่พบความผิดปกติ ให้เลือก "ไม่พบสิ่งผิดปกติ"',
                running_only: false,
                required: false,
                options: ['ไม่พบสิ่งผิดปกติ', 'พบรอยรั่วซึมของน้ำมัน/น้ำ', 'มีเสียงดังผิดปกติที่จุดหมุน', 'น็อตยึดคลายตัว', 'เกจวัดแรงดันชำรุด/กระจกแตก']
              }
            ]
          }
        ]
      },
      {
        id: 4,
        form_code: 'FRM-SAFE-001',
        title: 'แบบฟอร์มตรวจสอบความปลอดภัยของเครื่องจักรประจำเดือน (Machine Safety & LOTO Audit)',
        description: 'สำหรับแผนกความปลอดภัยและอาชีวอนามัย (SF) ตรวจสอบอุปกรณ์ป้องกันอันตราย ปุ่มหยุดฉุกเฉิน และระบบสายดิน',
        department_id: 15,
        target_machine_id: null,
        machine_category: 'ALL',
        frequency: 'monthly',
        estimated_minutes: 15,
        version: 1,
        require_signature: 1,
        sections: [
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
        ]
      }
    ],
    inspections: [],
    defects: [],
    routes: [],
    routeRounds: [],
    machinePlacements: {},
    auditLogs: [
      {
        id: 1,
        actor_name: 'System Setup',
        action_type: 'INIT_SYSTEM',
        target_type: 'DATABASE',
        target_name: 'ESC Machine Center v2.7 (17 Official Departments Grouped by Division)',
        detail: 'ระบบแยกเฉพาะ 17 แผนกปฏิบัติการ จัดหมวดหมู่ตามกลุ่มฝ่าย (ฝ่าย >> แผนก)',
        created_at: '2026-09-28 11:45:00'
      }
    ]
  };
}

const MOCKUP_IDENTIFIERS = {
  machines: new Set([
    'MCH-BLR-P01', 'MCH-MIL-G01', 'MCH-BLR-F02', 'MCH-PRD-C04', 'MCH-SUG-C04', 'MCH-UTL-A01', 'MCH-ELC-M01', 'MCH-CNV-B02',
    'MCH-MILL-01', 'MCH-MILL-02', 'MCH-EVAP-01', 'MCH-CENT-01', 'MCH-CENT-04', 'MCH-PACK-01', 'MCH-TURB-01', 'MCH-PUMP-02',
    'MCH-LAB-01', 'MCH-WTP-01', 'MCH-WTP-P02', 'MCH-SUB-01', 'MCH-CANE-CR01', 'MCH-GEN-TB01'
  ]),
  inspections: new Set(['INS-202609-0001', 'INS-202609-0002', 'INS-202609-0003', 'INS-202609-0004', 'INS-202609-0005', 'INS-202609-0006']),
  defects: new Set(['DEF-202609-0001', 'DEF-202609-0002']),
  routes: new Set(['RT-MECH-01', 'RT-PROD-01', 'RT-BOIL-01', 'RT-ELEC-01']),
  routeRounds: new Set(['RND-20260925-M1', 'RND-20260925-P1', 'RND-20260925-B1', 'RND-20260925-001', 'RND-20260925-002']),
  users: new Set(['EMP-1002', 'EMP-2001', 'EMP-2002', 'EMP-3001', 'EMP-4001', 'EMP-5001']),
  legacyDepartments: new Set(['MECH', 'ELEC', 'PROD', 'BOIL', 'SAFE', 'PD', 'EN', 'EE', 'OF', 'SR', 'IT', 'HR', 'PC', 'AC'])
};

function syncOfficialFactoryDepartmentsInRaw(raw, force = false) {
  if (!raw || typeof raw !== 'object') return false;
  if (!raw.settings) raw.settings = {};
  const officialDepts = getInitialSeedData().departments;
  const currentDepts = Array.isArray(raw.departments) ? raw.departments : [];
  const hasLegacyDepts = currentDepts.some(d => ['QS','QA','LB','EV','SF','WH','SW','MECH','ELEC','PROD','BOIL','SAFE','PD','EN','EE','OF','SR','IT','HR','PC','AC'].includes(String(d.code || '').toUpperCase()));
  if (!force && raw.settings.official_depts_v30 === '1' && !hasLegacyDepts && currentDepts.length === officialDepts.length) {
    return false;
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
  const officialCodes = new Set(officialDepts.map(d => d.code));
  const oldIdToTargetCode = {};
  const customDepts = [];

  for (const d of currentDepts) {
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

  const nextDepts = officialDepts.map((d, idx) => ({ ...d, id: idx + 1 }));
  const codeToNewId = {};
  for (const d of nextDepts) {
    codeToNewId[d.code] = d.id;
  }
  let nextId = nextDepts.length + 1;
  for (const cd of customDepts) {
    const code = String(cd.code || '').trim().toUpperCase();
    const copy = { ...cd, id: nextId };
    nextDepts.push(copy);
    codeToNewId[code] = nextId;
    nextId++;
  }
  raw.departments = nextDepts;

  const remapDeptId = (item, fallbackCode = 'ML') => {
    if (!item || typeof item !== 'object') return;
    const targetCode = oldIdToTargetCode[item.department_id] || fallbackCode;
    if (codeToNewId[targetCode]) {
      item.department_id = codeToNewId[targetCode];
    }
  };

  if (Array.isArray(raw.machines)) {
    raw.machines.forEach(m => {
      if (String(m.machine_code || '').toUpperCase().startsWith('ML-')) {
        m.department_id = codeToNewId.ML || 5;
      } else {
        remapDeptId(m, 'ML');
      }
    });
  }
  if (Array.isArray(raw.routes)) {
    raw.routes.forEach(r => {
      if (String(r.route_code || '').toUpperCase() === 'RT-ML-01') {
        r.department_id = codeToNewId.ML || 5;
      } else {
        remapDeptId(r, 'ML');
      }
    });
  }
  if (Array.isArray(raw.routeRounds)) raw.routeRounds.forEach(rr => remapDeptId(rr, 'ML'));
  if (Array.isArray(raw.users)) {
    raw.users.forEach(u => {
      if (String(u.emp_code || '').toUpperCase() === 'EMP-1001') {
        u.department_id = codeToNewId.ML || 5;
      } else {
        remapDeptId(u, 'ML');
      }
    });
  }
  if (Array.isArray(raw.forms)) {
    raw.forms.forEach(f => {
      const fCode = String(f.form_code || '').toUpperCase();
      if (fCode === 'FRM-ML-001') f.department_id = codeToNewId.ML || 5;
      else if (fCode === 'FRM-MECH-001') f.department_id = codeToNewId.MA || 6;
      else if (fCode === 'FRM-ELEC-001') f.department_id = codeToNewId.EM || 8;
      else if (fCode === 'FRM-PROD-AM01') f.department_id = codeToNewId.EP || 1;
      else if (fCode === 'FRM-SAFE-001') f.department_id = codeToNewId.MA || 6;
      else remapDeptId(f, 'ML');
    });
  }

  raw.settings.official_depts_v30 = '1';
  return true;
}

const OFFICIAL_ML_MACHINES_SEED = [
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

function syncOfficialMillingMachinesInRaw(raw, force = false) {
  if (!raw || typeof raw !== 'object') return false;
  if (!raw.settings) raw.settings = {};
  if (!Array.isArray(raw.machines)) raw.machines = [];
  if (!Array.isArray(raw.forms)) raw.forms = [];
  if (!Array.isArray(raw.routes)) raw.routes = [];
  if (!raw.machinePlacements || typeof raw.machinePlacements !== 'object') raw.machinePlacements = {};

  const existingMlCount = raw.machines.filter(m => String(m.machine_code || '').toUpperCase().startsWith('ML-') && !/^ML-\d{2}$/i.test(m.machine_code)).length;
  if (!force && raw.settings.official_ml_machines_v28 === '1' && existingMlCount >= OFFICIAL_ML_MACHINES_SEED.length) {
    return false;
  }

  // Remove temporary ML-01 to ML-38 records
  raw.machines = raw.machines.filter(m => !/^ML-\d{2}$/i.test(m.machine_code));
  for (const k of Object.keys(raw.machinePlacements)) {
    if (/^ML-\d{2}$/i.test(k)) {
      delete raw.machinePlacements[k];
    }
  }

  const mlDept = (raw.departments || []).find(d => String(d.code || '').toUpperCase() === 'ML');
  const mlDeptId = mlDept ? mlDept.id : 5;

  let nextId = raw.machines.reduce((max, m) => Math.max(max, Number(m.id) || 0), 0) + 1;
  for (const seedM of OFFICIAL_ML_MACHINES_SEED) {
    const existing = raw.machines.find(m => String(m.machine_code || '').toUpperCase() === seedM.machine_code);
    if (existing) {
      existing.name = seedM.name;
      existing.category = seedM.category;
      existing.department_id = mlDeptId;
      existing.plant_area = seedM.plant_area;
      existing.criticality = seedM.criticality;
    } else {
      raw.machines.push({
        id: nextId++,
        machine_code: seedM.machine_code,
        name: seedM.name,
        category: seedM.category,
        department_id: mlDeptId,
        plant_area: seedM.plant_area,
        brand: '',
        model: '',
        serial_number: seedM.serial_number || '',
        criticality: seedM.criticality || 'A',
        operating_state: 'running',
        health_status: 'normal',
        running_hours: 0,
        specs: {
          power_kw: '-',
          bearing_de: 'มาตรฐานโรงงาน',
          lube_oil: 'ตามตารางหล่อลื่นแผนกลูกหีบ',
          components: ['ชุดขับเคลื่อนหลัก', 'ตลับลูกปืน DE/NDE', 'ระบบหล่อลื่น/ไฮดรอลิก', 'โครงสร้างและอุปกรณ์นิรภัย']
        }
      });
    }

    raw.machinePlacements[seedM.machine_code] = {
      machineCode: seedM.machine_code,
      zoneId: 'production-center',
      bayLabel: seedM.bay_label || 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)',
      anchorOffset: { offsetX: seedM.offsetX || 0, offsetZ: seedM.offsetZ || 0 },
      locationVerified: true,
      verifiedBy: 'แผนกลูกหีบ (ML)'
    };
  }

  let mlForm = raw.forms.find(f => String(f.form_code || '').toUpperCase() === 'FRM-ML-001');
  if (!mlForm) {
    const nextFormId = raw.forms.reduce((max, f) => Math.max(max, Number(f.id) || 0), 0) + 1;
    mlForm = {
      id: nextFormId,
      form_code: 'FRM-ML-001',
      title: 'แบบฟอร์มตรวจเช็คเครื่องจักรแผนกลูกหีบประจำกะ (Milling & Cane Preparation Checksheet)',
      description: 'สำหรับช่างและพนักงานแผนกลูกหีบ (ML) ตรวจเช็ครางดั๊มพ์ สะพานลำเลียงอ้อย มีดสับอ้อย เชร็ดเดอร์ ชุดลูกหีบ และเครนเหนือศีรษะ',
      department_id: mlDeptId,
      target_machine_id: null,
      machine_category: 'ALL',
      frequency: 'per_shift',
      estimated_minutes: 15,
      version: 1,
      require_signature: 1,
      sections: [
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
      ]
    };
    raw.forms.push(mlForm);
  }

  const mlMachines = raw.machines.filter(m => m.department_id === mlDeptId);
  const existingRoute = raw.routes.find(r => String(r.route_code || '').toUpperCase() === 'RT-ML-01');
  const routeStops = mlMachines.map((m, idx) => ({
    order: idx + 1,
    machine_id: m.id,
    machine_code: m.machine_code,
    machine_name: m.name,
    plant_area: m.plant_area,
    form_id: mlForm.id,
    target_Offset_min: (idx + 1) * 3,
    focus_note: `จุดตรวจที่ ${idx + 1}: ${m.name}`
  }));

  if (existingRoute) {
    existingRoute.stops = routeStops;
  } else if (mlMachines.length > 0) {
    const nextRouteId = raw.routes.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;
    raw.routes.push({
      id: nextRouteId,
      route_code: 'RT-ML-01',
      name: 'สายเดินตรวจเครื่องจักรแผนกลูกหีบตามลำดับการผลิต (รางดั๊มพ์ → สะพานเมน → เชร็ดเดอร์ → ลูกหีบ → เครน)',
      department_id: mlDeptId,
      description: 'เดินตรวจเช็คเครื่องจักรจริงในแผนกลูกหีบ (ML) เรียงตามลำดับกระบวนการผลิตตามรหัสเครื่องจักรทางการ',
      estimated_minutes: 90,
      shift_schedules: [
        { shift: 'กะเช้า (07:00-19:00)', window: '07:30 - 09:30 น.', team_size: 2, default_inspectors: ['วศ.ประจักษ์ (System Center Admin)'] },
        { shift: 'กะดึก (19:00-07:00)', window: '19:30 - 21:30 น.', team_size: 2, default_inspectors: [] }
      ],
      stops: routeStops
    });
  }

  raw.settings.official_ml_machines_v28 = '1';
  return true;
}

const OFFICIAL_TECHNICIAN_USERS_SEED = [
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

function syncOfficialTechniciansInRaw(raw, force = false) {
  if (!raw || typeof raw !== 'object') return false;
  if (!raw.settings) raw.settings = {};
  if (!Array.isArray(raw.users)) raw.users = [];

  const existingCodes = new Set(raw.users.map(u => String(u.emp_code || '').trim().toUpperCase()));
  const allPresent = OFFICIAL_TECHNICIAN_USERS_SEED.every(t => existingCodes.has(t.emp_code.toUpperCase()));
  if (!force && raw.settings.official_technicians_v212 === '1' && allPresent) {
    return false;
  }

  const mlDept = (raw.departments || []).find(d => String(d.code || '').toUpperCase() === 'ML');
  const mlDeptId = mlDept ? mlDept.id : 5;

  let maxId = raw.users.reduce((m, u) => Math.max(m, Number(u.id) || 0), 0);
  let changed = false;

  for (const tech of OFFICIAL_TECHNICIAN_USERS_SEED) {
    const existing = raw.users.find(u => String(u.emp_code || '').trim().toUpperCase() === tech.emp_code.toUpperCase());
    if (existing) {
      existing.full_name = tech.full_name;
      existing.position = tech.position;
      existing.role = tech.role;
      existing.department_id = mlDeptId;
      existing.is_active = 1;
      changed = true;
    } else {
      maxId++;
      raw.users.push({
        id: maxId,
        emp_code: tech.emp_code,
        full_name: tech.full_name,
        position: tech.position,
        department_id: mlDeptId,
        role: tech.role,
        phone: '',
        email: '',
        is_active: 1
      });
      changed = true;
    }
  }

  raw.settings.official_technicians_v212 = '1';
  return changed;
}

function purgeMockupRecordsFromRaw(raw, force = false) {
  if (!raw || typeof raw !== 'object') return false;
  if (!raw.settings) raw.settings = {};
  const deptSynced = syncOfficialFactoryDepartmentsInRaw(raw, force);
  const mlSynced = syncOfficialMillingMachinesInRaw(raw, force);
  const techSynced = syncOfficialTechniciansInRaw(raw, force);
  if (!force && raw.settings.mockup_purged_v2 === '1' && raw.settings.official_technicians_v212 === '1') return deptSynced || mlSynced || techSynced;

  let changed = deptSynced || mlSynced || techSynced;

  if (Array.isArray(raw.machines)) {
    const beforeLen = raw.machines.length;
    raw.machines = raw.machines.filter(m => !MOCKUP_IDENTIFIERS.machines.has(String(m.machine_code || '').toUpperCase()));
    if (raw.machines.length !== beforeLen) changed = true;
  } else {
    raw.machines = [];
  }

  if (Array.isArray(raw.inspections)) {
    const beforeLen = raw.inspections.length;
    raw.inspections = raw.inspections.filter(i => !MOCKUP_IDENTIFIERS.inspections.has(String(i.doc_no || '').toUpperCase()));
    if (raw.inspections.length !== beforeLen) changed = true;
  } else {
    raw.inspections = [];
  }

  if (Array.isArray(raw.defects)) {
    const beforeLen = raw.defects.length;
    raw.defects = raw.defects.filter(d => !MOCKUP_IDENTIFIERS.defects.has(String(d.ticket_no || '').toUpperCase()));
    if (raw.defects.length !== beforeLen) changed = true;
  } else {
    raw.defects = [];
  }

  if (Array.isArray(raw.routes)) {
    const beforeLen = raw.routes.length;
    raw.routes = raw.routes.filter(r => !MOCKUP_IDENTIFIERS.routes.has(String(r.route_code || '').toUpperCase()));
    if (raw.routes.length !== beforeLen) changed = true;
  } else {
    raw.routes = [];
  }

  if (Array.isArray(raw.routeRounds)) {
    const beforeLen = raw.routeRounds.length;
    raw.routeRounds = raw.routeRounds.filter(rr => {
      const code = String(rr.round_code || rr.round_no || '').toUpperCase();
      return !MOCKUP_IDENTIFIERS.routeRounds.has(code);
    });
    if (raw.routeRounds.length !== beforeLen) changed = true;
  } else {
    raw.routeRounds = [];
  }

  if (Array.isArray(raw.users)) {
    const beforeLen = raw.users.length;
    raw.users = raw.users.filter(u => !MOCKUP_IDENTIFIERS.users.has(String(u.emp_code || '').toUpperCase()));
    if (raw.users.length === 0) {
      raw.users = getInitialSeedData().users;
    }
    if (raw.users.length !== beforeLen) changed = true;
  }

  if (raw.machinePlacements && typeof raw.machinePlacements === 'object') {
    for (const key of Object.keys(raw.machinePlacements)) {
      if (MOCKUP_IDENTIFIERS.machines.has(String(key).toUpperCase())) {
        delete raw.machinePlacements[key];
        changed = true;
      }
    }
  } else {
    raw.machinePlacements = {};
  }

  try {
    const placementRaw = localStorage.getItem('esc_machine_placements_v21');
    if (placementRaw) {
      const parsedMap = JSON.parse(placementRaw);
      if (Array.isArray(parsedMap)) {
        const filteredArr = parsedMap.filter(item => !MOCKUP_IDENTIFIERS.machines.has(String(item?.machineCode || item?.machine_code || '').toUpperCase()));
        if (filteredArr.length !== parsedMap.length) {
          localStorage.setItem('esc_machine_placements_v21', JSON.stringify(filteredArr));
        }
      } else if (parsedMap && typeof parsedMap === 'object') {
        let pChanged = false;
        for (const k of Object.keys(parsedMap)) {
          if (MOCKUP_IDENTIFIERS.machines.has(String(k).toUpperCase())) {
            delete parsedMap[k];
            pChanged = true;
          }
        }
        if (pChanged) {
          localStorage.setItem('esc_machine_placements_v21', JSON.stringify(parsedMap));
        }
      }
    }
  } catch (e) {}

  raw.settings.mockup_purged_v2 = '1';
  return changed || true;
}

function enrichRawData(raw) {
  if (!Array.isArray(raw.departments)) raw.departments = getInitialSeedData().departments;
  if (!Array.isArray(raw.users)) raw.users = getInitialSeedData().users;
  if (!Array.isArray(raw.machines)) raw.machines = [];
  if (!Array.isArray(raw.forms)) raw.forms = getInitialSeedData().forms;
  if (!Array.isArray(raw.inspections)) raw.inspections = [];
  if (!Array.isArray(raw.defects)) raw.defects = [];
  if (!Array.isArray(raw.routes)) raw.routes = [];
  if (!Array.isArray(raw.routeRounds)) raw.routeRounds = [];
  if (!raw.machinePlacements || typeof raw.machinePlacements !== 'object') {
    raw.machinePlacements = {};
  }

  const deptMap = {};
  for (const d of raw.departments) deptMap[d.id] = d;
  const machineMap = {};
  for (const m of raw.machines) machineMap[m.id] = m;
  const formMap = {};
  for (const f of raw.forms) formMap[f.id] = f;

  const departments = raw.departments.map(d => ({
    ...d,
    machine_count: raw.machines.filter(m => Number(m.department_id) === Number(d.id)).length,
    form_count: raw.forms.filter(f => Number(f.department_id) === Number(d.id)).length,
    user_count: raw.users.filter(u => Number(u.department_id) === Number(d.id)).length
  }));

  const machines = raw.machines.map(m => {
    const d = deptMap[m.department_id] || {};
    return {
      ...m,
      operating_state: m.operating_state || m.operating_status || 'running',
      specs: m.specs || {},
      division_name: d.plant_name || 'ฝ่ายปฏิบัติการ',
      department_name: d.name || '-',
      department_code: d.code || '-',
      department_color: d.color || '#1f760e'
    };
  });

  const forms = raw.forms.map(f => {
    const d = deptMap[f.department_id] || {};
    return {
      ...f,
      sections: f.sections || [],
      division_name: d.plant_name || 'ฝ่ายปฏิบัติการ',
      department_name: d.name || 'ทุกแผนก',
      department_code: d.code || 'ALL',
      department_color: d.color || '#1f760e'
    };
  });

  const inspections = raw.inspections.map(i => {
    const m = machineMap[i.machine_id] || {};
    const f = formMap[i.form_id] || {};
    const d = deptMap[i.department_id] || {};
    return {
      ...i,
      answers: i.answers || [],
      inspection_type: i.inspection_type || 'routine',
      co_inspectors: Array.isArray(i.co_inspectors) ? i.co_inspectors : (i.inspector_name ? [i.inspector_name] : []),
      machine_code: m.machine_code || '-',
      machine_name: m.name || '-',
      plant_area: m.plant_area || '-',
      form_code: f.form_code || (i.inspection_type === 'emergency_quick' ? 'EMERGENCY-LOG' : '-'),
      form_title: f.title || (i.inspection_type === 'emergency_quick' ? '⚡ บันทึกค่าด่วน / แจ้งเหตุฉุกเฉินเฉพาะจุด' : '-'),
      division_name: d.plant_name || 'ฝ่ายปฏิบัติการ',
      department_name: d.name || '-',
      department_code: d.code || '-',
      department_color: d.color || '#1f760e'
    };
  });

  const defects = raw.defects.map(dt => {
    const m = machineMap[dt.machine_id] || {};
    const d = deptMap[dt.assigned_dept_id] || {};
    return {
      ...dt,
      machine_code: m.machine_code || '-',
      machine_name: m.name || '-',
      plant_area: m.plant_area || '-',
      assigned_division_name: d.plant_name || 'ฝ่ายปฏิบัติการ',
      assigned_dept_name: d.name || '-',
      assigned_dept_code: d.code || '-',
      assigned_dept_color: d.color || '#1f760e'
    };
  });

  const users = raw.users.map(u => {
    const d = deptMap[u.department_id] || {};
    return {
      ...u,
      division_name: d.plant_name || 'ฝ่ายปฏิบัติการ',
      department_name: d.name || '-',
      department_code: d.code || '-',
      department_color: d.color || '#1f760e'
    };
  });

  const routes = (raw.routes || []).map(r => {
    const d = deptMap[r.department_id] || {};
    const stops = (r.stops || []).map((st, idx) => {
      const m = machineMap[st.machine_id] || {};
      const f = formMap[st.form_id] || {};
      const noteText = st.stop_note || st.walk_note || '';
      return {
        ...st,
        stop_order: st.stop_order || idx + 1,
        stop_note: noteText,
        walk_note: noteText,
        machine_code: m.machine_code || '-',
        machine_name: m.name || '-',
        plant_area: m.plant_area || '-',
        health_status: m.health_status || 'normal',
        operating_state: m.operating_state || m.operating_status || 'running',
        form_code: f.form_code || 'FRM-MECH-001',
        form_title: f.title || 'แบบฟอร์มมาตรฐาน'
      };
    });

    const timeWindows = Array.isArray(r.time_windows) && r.time_windows.length
      ? r.time_windows
      : (Array.isArray(r.shift_schedules) && r.shift_schedules.length
        ? r.shift_schedules.map(sc => sc.time_window || '08:30-10:00')
        : ['08:30-10:00', '13:30-15:00']);

    const shiftSchedules = Array.isArray(r.shift_schedules) && r.shift_schedules.length
      ? r.shift_schedules
      : timeWindows.map((tw, idx) => ({
          shift: idx % 2 === 0 ? 'กะเช้า (07:00-19:00)' : 'กะดึก (19:00-07:00)',
          time_window: tw,
          note: `รอบเดินตรวจตามตารางเวลา #${idx + 1}`
        }));

    return {
      ...r,
      stops,
      time_windows: timeWindows,
      shift_schedules: shiftSchedules,
      team_inspectors: Array.isArray(r.team_inspectors) ? r.team_inspectors : [],
      division_name: d.plant_name || 'ฝ่ายปฏิบัติการ',
      department_name: d.name || '-',
      department_code: d.code || '-',
      department_color: d.color || '#1f760e'
    };
  });

  const routeMap = {};
  for (const r of routes) routeMap[r.id] = r;

  const routeRounds = (raw.routeRounds || []).map(rr => {
    const rt = routeMap[rr.route_id] || routes[0] || { stops: [] };
    const d = deptMap[rr.department_id || rt.department_id] || {};
    const rawStopStatuses = rr.stop_statuses || {};
    const rawStopsProgress = Array.isArray(rr.stops_progress) ? rr.stops_progress : null;

    const stopsProgress = (rt.stops || []).map((st, idx) => {
      const mIdStr = String(st.machine_id);
      const fromArray = rawStopsProgress ? rawStopsProgress.find(sp => Number(sp.machine_id) === Number(st.machine_id)) : null;
      const fromMap = rawStopStatuses[mIdStr] || null;
      const rawSt = fromArray || fromMap || {};
      const normStatus = (rawSt.status === 'done' || rawSt.status === 'completed')
        ? 'completed'
        : (rawSt.status === 'checking' || rawSt.status === 'in_progress_shared')
        ? 'in_progress_shared'
        : 'pending';
      const checkedBy = rawSt.checked_by || rawSt.inspector_name || '';
      const coInspectors = Array.isArray(rawSt.co_inspectors)
        ? rawSt.co_inspectors
        : (checkedBy ? [checkedBy] : []);
      const draftAnswers = rawSt.shared_draft_answers || rawSt.draft_answers || {};
      return {
        stop_order: st.stop_order || idx + 1,
        machine_id: st.machine_id,
        machine_code: st.machine_code,
        machine_name: st.machine_name,
        plant_area: st.plant_area,
        form_id: st.form_id,
        form_code: st.form_code,
        form_title: st.form_title,
        stop_note: st.stop_note || st.walk_note || '',
        status: normStatus,
        inspection_id: rawSt.inspection_id || null,
        doc_no: rawSt.doc_no || '',
        overall_result: rawSt.overall_result || '',
        checked_by: checkedBy,
        co_inspectors: coInspectors,
        shared_draft_answers: draftAnswers,
        shared_draft_note: rawSt.shared_draft_note || rawSt.inspector_note || '',
        checked_at: rawSt.checked_at || rawSt.updated_at || ''
      };
    });

    const stopStatuses = {};
    stopsProgress.forEach(sp => {
      stopStatuses[String(sp.machine_id)] = {
        status: sp.status === 'completed' ? 'done' : sp.status === 'in_progress_shared' ? 'checking' : 'pending',
        inspector_name: sp.checked_by,
        co_inspectors: sp.co_inspectors,
        inspection_id: sp.inspection_id,
        doc_no: sp.doc_no,
        overall_result: sp.overall_result,
        updated_at: sp.checked_at,
        draft_answers: sp.shared_draft_answers,
        inspector_note: sp.shared_draft_note
      };
    });

    let assignedInspectors = [];
    if (Array.isArray(rr.assigned_inspectors) && rr.assigned_inspectors.length > 0) {
      assignedInspectors = rr.assigned_inspectors.map(ai => {
        if (typeof ai === 'string') {
          const uObj = users.find(u => u.full_name === ai || u.emp_code === ai);
          return { inspector_code: uObj ? uObj.emp_code : 'EMP', inspector_name: ai, role_note: 'ผู้ร่วมตรวจประจำกะ' };
        }
        return ai;
      });
    } else if (Array.isArray(rr.team_members) && rr.team_members.length > 0) {
      assignedInspectors = rr.team_members.map(name => {
        const uObj = users.find(u => u.full_name === name || u.emp_code === name);
        return { inspector_code: uObj ? uObj.emp_code : 'EMP', inspector_name: name, role_note: 'ทีมช่างเดินตรวจประจำกะ' };
      });
    }

    const teamMembers = assignedInspectors.map(x => x.inspector_name).filter(Boolean);
    const totalStops = stopsProgress.length;
    const doneCount = stopsProgress.filter(sp => sp.status === 'completed').length;
    const checkingCount = stopsProgress.filter(sp => sp.status === 'in_progress_shared').length;
    const progressPct = totalStops > 0 ? Math.round((doneCount / totalStops) * 100) : 0;
    const roundCode = rr.round_code || rr.round_no || `RND-0${rr.id}`;
    const shiftText = rr.shift || rr.shift_name || 'กะเช้า (07:00-19:00)';
    const timeWinText = rr.time_window || rr.shift_window || '07:30 - 09:30';

    return {
      ...rr,
      round_code: roundCode,
      round_no: roundCode,
      route_code: rt.route_code || '-',
      route_name: rt.name || '-',
      shift: shiftText,
      shift_name: shiftText,
      time_window: timeWinText,
      shift_window: timeWinText,
      stops: rt.stops || [],
      stops_progress: stopsProgress,
      stop_statuses: stopStatuses,
      assigned_inspectors: assignedInspectors,
      team_members: teamMembers,
      total_stops: totalStops,
      completed_stops: doneCount,
      done_count: doneCount,
      checking_count: checkingCount,
      progress_pct: progressPct,
      status: doneCount >= totalStops && totalStops > 0 ? 'completed' : (rr.status || 'in_progress'),
      department_name: d.name || '-',
      department_code: d.code || '-',
      department_color: d.color || '#1f760e'
    };
  });

  return {
    ...raw,
    departments,
    machines,
    forms,
    inspections,
    defects,
    users,
    routes,
    routeRounds,
    machinePlacements: raw.machinePlacements || {}
  };
}

function getLocalDb() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (purgeMockupRecordsFromRaw(parsed, false)) {
        saveLocalDb(parsed);
      }
      return enrichRawData(parsed);
    }
  } catch (e) {}
  const initial = getInitialSeedData();
  purgeMockupRecordsFromRaw(initial, true);
  saveLocalDb(initial);
  return enrichRawData(initial);
}

function saveLocalDb(raw) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
  } catch (e) {}
}

function nowStr() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function cloneDataSnapshot(raw) {
  return {
    departments: JSON.parse(JSON.stringify(raw.departments || [])),
    machines: JSON.parse(JSON.stringify(raw.machines || [])),
    forms: JSON.parse(JSON.stringify(raw.forms || [])),
    inspections: JSON.parse(JSON.stringify(raw.inspections || [])),
    defects: JSON.parse(JSON.stringify(raw.defects || [])),
    users: JSON.parse(JSON.stringify(raw.users || [])),
    routes: JSON.parse(JSON.stringify(raw.routes || [])),
    routeRounds: JSON.parse(JSON.stringify(raw.routeRounds || [])),
    settings: JSON.parse(JSON.stringify(raw.settings || {})),
    machinePlacements: JSON.parse(JSON.stringify(raw.machinePlacements || {}))
  };
}

function applyDataSnapshotToRaw(raw, snap) {
  if (!snap || typeof snap !== 'object') return;
  const keys = ['departments', 'machines', 'forms', 'inspections', 'defects', 'users', 'routes', 'routeRounds', 'settings', 'machinePlacements'];
  keys.forEach(k => {
    if (snap[k] !== undefined) {
      raw[k] = JSON.parse(JSON.stringify(snap[k]));
    }
  });
}

function handleLocalApiRequest(url, method, body) {
  const raw = getLocalDb();
  if (!Array.isArray(raw.auditLogs)) raw.auditLogs = [];

  if (url === '/api/bootstrap' && method === 'GET') {
    return { ok: true, data: enrichRawData(raw) };
  }

  const preMutationSnapshot = ['POST', 'PUT', 'DELETE'].includes(method) && !url.startsWith('/api/audit-logs/')
    ? cloneDataSnapshot(raw)
    : null;

  const addAudit = (actor, action, targetType, targetName, detail = '', extraUndo = {}) => {
    raw.auditLogs.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      actor_name: actor || state?.activeUser?.full_name || 'System Admin',
      action_type: action,
      target_type: targetType,
      target_name: targetName,
      detail: detail || `ดำเนินการ ${action} บน ${targetType}: ${targetName}`,
      can_undo: true,
      reverted: false,
      reverted_at: '',
      reverted_by: '',
      undo_payload: {
        mode: 'local_snapshot',
        snapshot_before: preMutationSnapshot,
        ...extraUndo
      },
      created_at: nowStr()
    });
  };

  // Departments
  if (url === '/api/departments' && method === 'POST') {
    const nextId = Math.max(0, ...raw.departments.map(x => x.id)) + 1;
    raw.departments.push({ id: nextId, ...body, code: body.code.toUpperCase() });
    addAudit(body.actor, 'CREATE', 'DEPARTMENT', `${body.code} - ${body.name}`, `เพิ่มแผนกใหม่ [${body.code.toUpperCase()}] ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/departments/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.departments.findIndex(x => x.id === id);
    const oldDept = idx >= 0 ? raw.departments[idx] : null;
    if (idx >= 0) raw.departments[idx] = { ...raw.departments[idx], ...body, code: body.code.toUpperCase() };
    addAudit(body.actor, 'UPDATE', 'DEPARTMENT', `${body.code} - ${body.name}`, `แก้ไขข้อมูลแผนก (เดิม: ${oldDept ? oldDept.name : id})`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/departments/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldDept = raw.departments.find(x => x.id === id);
    raw.departments = raw.departments.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'DEPARTMENT', oldDept ? `${oldDept.code} - ${oldDept.name}` : `#${id}`, `ลบแผนกออกจากระบบ`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Machines
  if (url === '/api/machines' && method === 'POST') {
    const nextId = Math.max(0, ...raw.machines.map(x => x.id)) + 1;
    raw.machines.push({ id: nextId, ...body, machine_code: body.machine_code.toUpperCase() });
    addAudit(body.actor, 'CREATE', 'MACHINE', `${body.machine_code} - ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/machines\/\d+\/clone$/) && method === 'POST') {
    const id = Number(url.split('/')[3]);
    const orig = raw.machines.find(x => x.id === id);
    if (orig) {
      const nextId = Math.max(0, ...raw.machines.map(x => x.id)) + 1;
      const newCode = `${orig.machine_code}-COPY${Math.floor(10 + Math.random() * 90)}`;
      raw.machines.push({ ...JSON.parse(JSON.stringify(orig)), id: nextId, machine_code: newCode, name: `${orig.name} (สำเนา)`, health_status: 'normal' });
      addAudit('Admin', 'CLONE', 'MACHINE', newCode);
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/machines/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.machines.findIndex(x => x.id === id);
    if (idx >= 0) raw.machines[idx] = { ...raw.machines[idx], ...body, machine_code: body.machine_code.toUpperCase() };
    addAudit(body.actor, 'UPDATE', 'MACHINE', `${body.machine_code} - ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/machines/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    raw.machines = raw.machines.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'MACHINE', `#${id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Forms
  if (url === '/api/forms' && method === 'POST') {
    const nextId = Math.max(0, ...raw.forms.map(x => x.id)) + 1;
    raw.forms.unshift({ id: nextId, ...body, version: 1, form_code: body.form_code.toUpperCase() });
    addAudit(body.actor, 'CREATE', 'FORM_TEMPLATE', `${body.form_code} - ${body.title}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/forms\/\d+\/clone$/) && method === 'POST') {
    const id = Number(url.split('/')[3]);
    const orig = raw.forms.find(x => x.id === id);
    if (orig) {
      const nextId = Math.max(0, ...raw.forms.map(x => x.id)) + 1;
      const newCode = `${orig.form_code}-COPY${Math.floor(10 + Math.random() * 90)}`;
      raw.forms.unshift({ ...JSON.parse(JSON.stringify(orig)), id: nextId, form_code: newCode, title: `${orig.title} (สำเนา)`, version: 1 });
      addAudit('Admin', 'CLONE', 'FORM_TEMPLATE', newCode);
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/forms/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.forms.findIndex(x => x.id === id);
    if (idx >= 0) {
      const nextVer = (raw.forms[idx].version || 1) + 1;
      raw.forms[idx] = { ...raw.forms[idx], ...body, version: nextVer, form_code: body.form_code.toUpperCase() };
    }
    addAudit(body.actor, 'UPDATE', 'FORM_TEMPLATE', `${body.form_code} - ${body.title}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/forms/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    raw.forms = raw.forms.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'FORM_TEMPLATE', `#${id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Inspections
  if (url === '/api/inspections' && method === 'POST') {
    const nextId = Math.max(0, ...raw.inspections.map(x => x.id)) + 1;
    const isEmergency = body.inspection_type === 'emergency_quick';
    const docPrefix = isEmergency ? 'EMG-202609-' : 'INS-202609-';
    const docNo = `${docPrefix}${String(nextId).padStart(4, '0')}`;
    const answers = Array.isArray(body.answers) ? body.answers : [];
    const normalCount = answers.filter(a => a.status === 'normal').length;
    const warningCount = answers.filter(a => a.status === 'warning').length;
    const abnormalItems = answers.filter(a => a.status === 'abnormal');
    const abnormalCount = abnormalItems.length;

    let overallResult = body.override_overall_result || 'normal';
    if (!body.override_overall_result) {
      if (abnormalCount > 0) overallResult = 'abnormal';
      else if (warningCount > 0) overallResult = 'warning';
    }

    // Collect all unique co-inspectors from item-level checks + main inspector
    const coSet = new Set();
    if (body.inspector_name) coSet.add(body.inspector_name);
    if (Array.isArray(body.co_inspectors)) body.co_inspectors.forEach(n => n && coSet.add(n));
    answers.forEach(a => { if (a.checked_by) coSet.add(a.checked_by); });
    const coInspectors = Array.from(coSet);

    raw.inspections.unshift({
      id: nextId,
      doc_no: docNo,
      machine_id: Number(body.machine_id),
      form_id: Number(body.form_id) || 1,
      department_id: Number(body.department_id) || 1,
      inspector_name: body.inspector_name,
      inspector_code: body.inspector_code,
      co_inspectors: coInspectors,
      inspection_type: body.inspection_type || 'routine',
      route_round_id: body.route_round_id ? Number(body.route_round_id) : null,
      shift: body.shift,
      machine_state_at_check: body.machine_state_at_check || 'running',
      checkin_method: body.checkin_method || (isEmergency ? 'emergency_log' : 'qr_scan'),
      overall_result: overallResult,
      normal_count: normalCount,
      warning_count: warningCount,
      abnormal_count: abnormalCount,
      answers,
      inspector_note: body.inspector_note || '',
      signature_data: body.signature_data || '',
      approval_status: 'pending',
      approved_by: '',
      approved_at: '',
      inspected_at: nowStr()
    });

    const mIdx = raw.machines.findIndex(m => m.id === Number(body.machine_id));
    if (mIdx >= 0) {
      raw.machines[mIdx].health_status = overallResult;
      if (body.machine_state_at_check) {
        raw.machines[mIdx].operating_state = body.machine_state_at_check;
      }
    }

    // Update Route Round progress ONLY for routine (full) inspections (P0-1: emergency partial check does not mark full route stop completed)
    if (!isEmergency) {
      if (!Array.isArray(raw.routeRounds)) raw.routeRounds = [];
      const targetRound = body.route_round_id
        ? raw.routeRounds.find(rr => rr.id === Number(body.route_round_id))
        : raw.routeRounds.find(rr => rr.status === 'in_progress' && rr.stop_statuses && rr.stop_statuses[String(body.machine_id)]);
      if (targetRound) {
        if (!targetRound.stop_statuses) targetRound.stop_statuses = {};
        const prevStop = targetRound.stop_statuses[String(body.machine_id)] || {};
        const mergedCo = Array.from(new Set([...(prevStop.co_inspectors || []), ...coInspectors]));
        targetRound.stop_statuses[String(body.machine_id)] = {
          status: 'done',
          inspector_name: body.inspector_name,
          co_inspectors: mergedCo,
          inspection_id: nextId,
          doc_no: docNo,
          overall_result: overallResult,
          updated_at: nowStr().slice(11, 16),
          draft_answers: {}
        };
        if (!Array.isArray(targetRound.team_members)) targetRound.team_members = [];
        mergedCo.forEach(name => {
          if (name && !targetRound.team_members.includes(name)) targetRound.team_members.push(name);
        });
      }
    }

    let createdTicketNo = null;
    if (abnormalCount > 0 || body.force_create_urgent_ticket) {
      const nextDefId = Math.max(0, ...raw.defects.map(x => x.id)) + 1;
      createdTicketNo = `DEF-202609-${String(nextDefId).padStart(4, '0')}`;
      const summaryTitle = abnormalItems.length > 0
        ? abnormalItems.map(a => `${a.label}: ${a.value}${a.unit ? ' ' + a.unit : ''}`).join(', ')
        : (body.emergency_title || body.inspector_note || 'แจ้งเหตุผิดปกติฉุกเฉินหน้างาน');
      const detailText = abnormalItems.length > 0
        ? abnormalItems.map(a => `• ${a.label} = ${a.value}${a.unit ? ' ' + a.unit : ''} ${a.remark ? '(' + a.remark + ')' : ''}`).join('\n')
        : (body.inspector_note || 'บันทึกด่วนจากโหมดฉุกเฉิน');
      raw.defects.unshift({
        id: nextDefId,
        ticket_no: createdTicketNo,
        inspection_id: nextId,
        machine_id: Number(body.machine_id),
        component_name: body.component_name || (isEmergency ? '⚡ แจ้งด่วนโหมดฉุกเฉิน ' + docNo : 'ตรวจพบจากใบตรวจเช็ค ' + docNo),
        defect_title: (isEmergency ? '[⚡ ด่วนฉุกเฉิน] ' : '') + summaryTitle.slice(0, 170),
        defect_detail: detailText + (body.inspector_note && abnormalItems.length > 0 ? `\nหมายเหตุเพิ่มเติม: ${body.inspector_note}` : ''),
        reported_by: coInspectors.join(', '),
        assigned_dept_id: Number(body.department_id) || 1,
        assigned_to: isEmergency ? 'ทีมซ่อมบำรุงฉุกเฉิน (Rapid Response)' : '',
        severity: isEmergency ? 'critical' : 'high',
        status: 'open',
        root_cause: '',
        corrective_action: '',
        downtime_hours: 0,
        created_at: nowStr()
      });
    }

    addAudit(body.inspector_name, isEmergency ? 'EMERGENCY_QUICK_LOG' : 'SUBMIT_INSPECTION', 'INSPECTION', `${docNo} -> ${overallResult.toUpperCase()}`);
    saveLocalDb(raw);
    return { ok: true, doc_no: docNo, overall_result: overallResult, created_ticket_no: createdTicketNo, data: enrichRawData(raw) };
  }

  // Inspection Routes CRUD
  if (url === '/api/routes' && method === 'POST') {
    if (!Array.isArray(raw.routes)) raw.routes = [];
    const nextId = Math.max(0, ...raw.routes.map(x => x.id)) + 1;
    const shiftSchedules = Array.isArray(body.shift_schedules) ? body.shift_schedules : [];
    const timeWindows = Array.isArray(body.time_windows)
      ? body.time_windows
      : (shiftSchedules.length ? shiftSchedules.map(s => s.time_window) : ['08:30-10:00', '13:30-15:00']);
    raw.routes.push({
      id: nextId,
      route_code: (body.route_code || `RT-0${nextId}`).toUpperCase(),
      name: body.name,
      department_id: Number(body.department_id) || 1,
      estimated_minutes: Number(body.estimated_minutes) || 30,
      time_windows: timeWindows,
      shift_schedules: shiftSchedules,
      team_inspectors: Array.isArray(body.team_inspectors) ? body.team_inspectors : [],
      description: body.description || '',
      stops: Array.isArray(body.stops) ? body.stops : []
    });
    addAudit(body.actor, 'CREATE', 'INSPECTION_ROUTE', `${body.route_code} - ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/routes/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = (raw.routes || []).findIndex(x => x.id === id);
    if (idx >= 0) {
      const shiftSchedules = Array.isArray(body.shift_schedules) ? body.shift_schedules : (raw.routes[idx].shift_schedules || []);
      const timeWindows = Array.isArray(body.time_windows)
        ? body.time_windows
        : (shiftSchedules.length ? shiftSchedules.map(s => s.time_window) : (raw.routes[idx].time_windows || ['08:30-10:00']));
      raw.routes[idx] = {
        ...raw.routes[idx],
        ...body,
        id,
        route_code: (body.route_code || raw.routes[idx].route_code).toUpperCase(),
        department_id: Number(body.department_id) || raw.routes[idx].department_id,
        shift_schedules: shiftSchedules,
        time_windows: timeWindows
      };
    }
    addAudit(body.actor, 'UPDATE', 'INSPECTION_ROUTE', `${body.route_code} - ${body.name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/routes/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    raw.routes = (raw.routes || []).filter(x => x.id !== id);
    raw.routeRounds = (raw.routeRounds || []).filter(x => x.route_id !== id);
    addAudit('Admin', 'DELETE', 'INSPECTION_ROUTE', `#${id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Route Rounds (Multi-Inspector Shared Round & Co-Inspection Drafts)
  if (url === '/api/route-rounds' && method === 'POST') {
    if (!Array.isArray(raw.routeRounds)) raw.routeRounds = [];
    const nextId = Math.max(0, ...raw.routeRounds.map(x => x.id)) + 1;
    const rt = (raw.routes || []).find(r => r.id === Number(body.route_id));
    const stopStatuses = {};
    if (rt && Array.isArray(rt.stops)) {
      rt.stops.forEach(st => {
        stopStatuses[String(st.machine_id)] = { status: 'pending', inspector_name: '', co_inspectors: [], updated_at: '', draft_answers: {} };
      });
    }
    const roundNo = `RND-${nowStr().slice(0, 10).replace(/-/g, '')}-0${nextId}`;
    const assignedInspectors = Array.isArray(body.assigned_inspectors) ? body.assigned_inspectors : [];
    const teamMembers = assignedInspectors.length > 0
      ? assignedInspectors.map(x => x.inspector_name || x).filter(Boolean)
      : (body.inspector_name ? [body.inspector_name] : [state?.activeUser?.full_name || 'สมชาย ใจเพชร']);
    raw.routeRounds.unshift({
      id: nextId,
      round_no: roundNo,
      round_code: roundNo,
      route_id: Number(body.route_id),
      department_id: rt ? rt.department_id : (Number(body.department_id) || 1),
      shift_window: body.time_window || body.shift_window || (rt?.time_windows?.[0] || '07:30 - 09:30'),
      shift_name: body.shift || body.shift_name || 'กะเช้า (07:00-19:00)',
      status: 'in_progress',
      assigned_inspectors: assignedInspectors,
      team_members: teamMembers,
      stop_statuses: stopStatuses,
      started_at: nowStr(),
      completed_at: ''
    });
    addAudit(teamMembers[0] || body.inspector_name, 'START_ROUTE_ROUND', 'ROUTE_ROUND', `${roundNo} (${rt?.route_code || ''})`);
    saveLocalDb(raw);
    return { ok: true, round_id: nextId, round: { id: nextId, round_code: roundNo }, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/route-rounds\/\d+$/) && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const rr = (raw.routeRounds || []).find(x => x.id === id);
    if (rr) {
      if (body.join_inspector) {
        const jName = body.join_inspector.inspector_name || body.inspector_name;
        if (!Array.isArray(rr.team_members)) rr.team_members = [];
        if (jName && !rr.team_members.includes(jName)) rr.team_members.push(jName);
        if (Array.isArray(rr.assigned_inspectors)) {
          if (!rr.assigned_inspectors.some(x => x.inspector_name === jName)) {
            rr.assigned_inspectors.push(body.join_inspector);
          }
        }
        addAudit(jName, 'JOIN_TEAM_ROUND', 'ROUTE_ROUND', rr.round_code || rr.round_no);
      }
      if (body.shared_draft_save) {
        const sd = body.shared_draft_save;
        if (!rr.stop_statuses) rr.stop_statuses = {};
        const key = String(sd.machine_id);
        const prev = rr.stop_statuses[key] || { co_inspectors: [] };
        const coList = Array.from(new Set([...(prev.co_inspectors || []), sd.inspector_name].filter(Boolean)));
        rr.stop_statuses[key] = {
          ...prev,
          status: 'checking',
          inspector_name: sd.inspector_name || prev.inspector_name,
          co_inspectors: coList,
          updated_at: nowStr().slice(11, 16),
          draft_answers: sd.answers || {},
          inspector_note: sd.note || ''
        };
        if (!Array.isArray(rr.team_members)) rr.team_members = [];
        if (sd.inspector_name && !rr.team_members.includes(sd.inspector_name)) {
          rr.team_members.push(sd.inspector_name);
        }
        addAudit(sd.inspector_name, 'SAVE_SHARED_PROGRESS', 'ROUTE_ROUND', `${rr.round_code || rr.round_no} เครื่อง #${sd.machine_id}`);
      }
      if (body.status) {
        rr.status = body.status;
        if (body.status === 'completed') rr.completed_at = nowStr();
      }
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/route-rounds\/\d+\/join$/) && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const rr = (raw.routeRounds || []).find(x => x.id === id);
    if (rr && body.inspector_name) {
      if (!Array.isArray(rr.team_members)) rr.team_members = [];
      if (!rr.team_members.includes(body.inspector_name)) {
        rr.team_members.push(body.inspector_name);
      }
      addAudit(body.inspector_name, 'JOIN_TEAM_ROUND', 'ROUTE_ROUND', rr.round_no);
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.match(/^\/api\/route-rounds\/\d+\/draft$/) && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const rr = (raw.routeRounds || []).find(x => x.id === id);
    if (rr && body.machine_id) {
      if (!rr.stop_statuses) rr.stop_statuses = {};
      const key = String(body.machine_id);
      const prev = rr.stop_statuses[key] || { co_inspectors: [] };
      const coList = Array.from(new Set([...(prev.co_inspectors || []), body.inspector_name].filter(Boolean)));
      rr.stop_statuses[key] = {
        ...prev,
        status: 'checking',
        inspector_name: body.inspector_name || prev.inspector_name,
        co_inspectors: coList,
        updated_at: nowStr().slice(11, 16),
        draft_answers: body.draft_answers || {},
        inspector_note: body.inspector_note || ''
      };
      if (!Array.isArray(rr.team_members)) rr.team_members = [];
      if (body.inspector_name && !rr.team_members.includes(body.inspector_name)) {
        rr.team_members.push(body.inspector_name);
      }
      addAudit(body.inspector_name, 'SAVE_SHARED_PROGRESS', 'ROUTE_ROUND', `${rr.round_no} เครื่อง #${body.machine_id}`);
      saveLocalDb(raw);
    }
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/route-rounds/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldRr = (raw.routeRounds || []).find(x => x.id === id);
    raw.routeRounds = (raw.routeRounds || []).filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'ROUTE_ROUND', oldRr ? oldRr.round_no : `#${id}`, `ลบรอบการเดินตรวจเช็ค`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  if (url.match(/^\/api\/inspections\/\d+\/approve$/) && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.inspections.findIndex(x => x.id === id);
    const docNo = idx >= 0 ? raw.inspections[idx].doc_no : `#${id}`;
    if (idx >= 0) {
      raw.inspections[idx].approval_status = body.approval_status || 'approved';
      raw.inspections[idx].approved_by = body.approved_by || 'หัวหน้าแผนก';
      raw.inspections[idx].approved_at = nowStr();
    }
    addAudit(body.approved_by, 'APPROVE', 'INSPECTION', docNo, `อนุมัติใบตรวจเช็ค ${docNo} สถานะ: ${body.approval_status || 'approved'}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  if (url.startsWith('/api/inspections/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldIns = raw.inspections.find(x => x.id === id);
    raw.inspections = raw.inspections.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'INSPECTION', oldIns ? oldIns.doc_no : `#${id}`, `ลบประวัติใบตรวจเช็ค ${oldIns ? oldIns.doc_no : '#' + id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Defects
  if (url === '/api/defects' && method === 'POST') {
    const nextId = Math.max(0, ...raw.defects.map(x => x.id)) + 1;
    const ticketNo = `DEF-202609-${String(nextId).padStart(4, '0')}`;
    raw.defects.unshift({ id: nextId, ticket_no: ticketNo, ...body, created_at: nowStr() });
    if (body.severity === 'critical' || body.severity === 'high') {
      const mIdx = raw.machines.findIndex(m => m.id === Number(body.machine_id));
      if (mIdx >= 0) raw.machines[mIdx].health_status = 'abnormal';
    }
    addAudit(body.reported_by, 'CREATE', 'DEFECT_TICKET', ticketNo, `เปิดใบแจ้งซ่อม ${ticketNo}: ${body.defect_title || ''}`);
    saveLocalDb(raw);
    return { ok: true, ticket_no: ticketNo, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/defects/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.defects.findIndex(x => x.id === id);
    const oldTicket = idx >= 0 ? raw.defects[idx] : null;
    if (idx >= 0) {
      raw.defects[idx] = { ...raw.defects[idx], ...body };
      if (body.status === 'resolved' || body.status === 'closed') {
        const mIdx = raw.machines.findIndex(m => m.id === Number(body.machine_id));
        if (mIdx >= 0) raw.machines[mIdx].health_status = 'normal';
      }
    }
    addAudit(body.actor, 'UPDATE', 'DEFECT_TICKET', `${oldTicket ? oldTicket.ticket_no : '#' + id} -> ${body.status}`, `อัปเดตสถานะงานซ่อมเป็น ${body.status}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/defects/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldTicket = raw.defects.find(x => x.id === id);
    raw.defects = raw.defects.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'DEFECT_TICKET', oldTicket ? oldTicket.ticket_no : `#${id}`, `ลบใบแจ้งซ่อม ${oldTicket ? oldTicket.ticket_no : '#' + id}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Users
  if (url === '/api/users' && method === 'POST') {
    const nextId = Math.max(0, ...raw.users.map(x => x.id)) + 1;
    raw.users.push({ id: nextId, ...body, emp_code: body.emp_code.toUpperCase() });
    addAudit(body.actor, 'CREATE', 'USER', `${body.emp_code} - ${body.full_name}`, `เพิ่มผู้ใช้งานใหม่ ${body.full_name} (${body.role})`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/users/') && method === 'PUT') {
    const id = Number(url.split('/')[3]);
    const idx = raw.users.findIndex(x => x.id === id);
    if (idx >= 0) raw.users[idx] = { ...raw.users[idx], ...body, emp_code: body.emp_code.toUpperCase() };
    addAudit(body.actor, 'UPDATE', 'USER', `${body.emp_code} - ${body.full_name}`, `แก้ไขข้อมูลผู้ใช้งาน ${body.full_name}`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }
  if (url.startsWith('/api/users/') && method === 'DELETE') {
    const id = Number(url.split('/')[3]);
    const oldUser = raw.users.find(x => x.id === id);
    raw.users = raw.users.filter(x => x.id !== id);
    addAudit('Admin', 'DELETE', 'USER', oldUser ? `${oldUser.emp_code} - ${oldUser.full_name}` : `#${id}`, `ลบผู้ใช้งานออกจากระบบ`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Settings
  if (url === '/api/settings' && method === 'PUT') {
    raw.settings = { ...raw.settings, ...body };
    addAudit(body.actor, 'UPDATE', 'SETTINGS', 'ตั้งค่าระบบและแจ้งเตือน Telegram', `บันทึกการตั้งค่าองค์กรและการแจ้งเตือน`);
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // 3D Machine Placements (P0-3 Server/Local Sync with Revision Check)
  const placementMatch = url.match(/^\/api\/machine-placements\/([^/]+)$/);
  if (placementMatch && method === 'PUT') {
    const machineCode = decodeURIComponent(placementMatch[1]).trim();
    if (!raw.machinePlacements || typeof raw.machinePlacements !== 'object' || Array.isArray(raw.machinePlacements)) {
      const nextMap = {};
      if (Array.isArray(raw.machinePlacements)) {
        raw.machinePlacements.forEach(item => {
          const c = item?.machineCode || item?.machine_code;
          if (c) nextMap[c] = item;
        });
      }
      raw.machinePlacements = nextMap;
    }
    const existing = raw.machinePlacements[machineCode] || null;
    const expectedRev = body.expectedRevision ?? body.expected_revision;
    if (existing && expectedRev !== undefined && Number(expectedRev) !== Number(existing.revision || 1)) {
      throw new Error(`พิกัดของ ${machineCode} ถูกแก้ไขไปแล้ว (Rev #${existing.revision}) กรุณารีเฟรช`);
    }
    const nextRev = existing ? Number(existing.revision || 1) + 1 : 1;
    const zoneId = String(body.zoneId ?? body.zone_id ?? existing?.zoneId ?? existing?.zone_id ?? 'production-west');
    const bayLabel = String(body.bayLabel ?? body.bay_label ?? existing?.bayLabel ?? existing?.bay_label ?? '');
    const anchorOffset = body.anchorOffset || body.anchor_offset || existing?.anchorOffset || {
      x: Number(body.x ?? existing?.x ?? 0),
      y: Number(body.y ?? existing?.y ?? 0),
      z: Number(body.z ?? existing?.z ?? 0)
    };
    const isVerified = body.locationVerified !== undefined ? Boolean(body.locationVerified) : Boolean(body.location_verified);
    raw.machinePlacements[machineCode] = {
      machineCode,
      zoneId,
      bayLabel,
      anchorOffset,
      x: Number(anchorOffset.x ?? 0),
      y: Number(anchorOffset.y ?? 0),
      z: Number(anchorOffset.z ?? 0),
      locationVerified: isVerified,
      verifiedBy: isVerified ? (body.actor || state?.activeUser?.full_name || 'System Admin') : (existing?.verifiedBy || ''),
      verifiedAt: isVerified ? nowStr() : (existing?.verifiedAt || ''),
      note: String(body.note ?? existing?.note ?? ''),
      revision: nextRev,
      updatedAt: nowStr()
    };
    addAudit(
      body.actor || state?.activeUser?.full_name || 'System Admin',
      'UPDATE_3D_PLACEMENT',
      '3D_PLACEMENT',
      `${machineCode} -> ${zoneId}`,
      `อัปเดตพิกัด 3D โซน ${zoneId} (${bayLabel || '-'}) Rev #${nextRev}`
    );
    saveLocalDb(raw);
    return { ok: true, revision: nextRev, data: enrichRawData(raw) };
  }

  // CSV Bulk Import (POST /api/csv-import)
  if (url === '/api/csv-import' && method === 'POST') {
    const entityType = String(body.entity_type || 'machines').trim();
    const rows = Array.isArray(body.rows) ? body.rows : [];
    const actor = body.actor || state?.activeUser?.full_name || 'System Admin';
    let inserted = 0;
    let updated = 0;

    if (entityType === 'machines') {
      for (const r of rows) {
        const code = String(r.machine_code || '').trim().toUpperCase();
        const name = String(r.name || '').trim();
        if (!code || !name) continue;
        const deptCode = String(r.department_code || 'MECH').trim().toUpperCase();
        const deptObj = raw.departments.find(d => String(d.code).toUpperCase() === deptCode) || raw.departments[0];
        const deptId = deptObj ? deptObj.id : 1;
        const idx = raw.machines.findIndex(m => String(m.machine_code).toUpperCase() === code);
        const specs = {
          ...(idx >= 0 ? (raw.machines[idx].specs || {}) : {}),
          ...(r.motor_kw ? { motor_kw: r.motor_kw } : {}),
          ...(r.rpm ? { rpm: r.rpm } : {}),
          ...(r.max_temp_c ? { max_temp_c: r.max_temp_c } : {}),
          ...(r.max_vib_mms ? { max_vib_mms: r.max_vib_mms } : {})
        };
        if (idx >= 0) {
          raw.machines[idx] = {
            ...raw.machines[idx],
            name,
            category: r.category || raw.machines[idx].category || 'Rotating Equipment',
            department_id: deptId,
            plant_area: r.plant_area || raw.machines[idx].plant_area || 'อาคารผลิตหลัก',
            building: r.building || raw.machines[idx].building || 'Building A',
            line_zone: r.line_zone || raw.machines[idx].line_zone || 'Line 1',
            model_brand: r.model_brand || raw.machines[idx].model_brand || '-',
            serial_no: r.serial_no || raw.machines[idx].serial_no || '-',
            criticality: r.criticality || raw.machines[idx].criticality || 'B',
            operating_state: r.operating_status || r.operating_state || raw.machines[idx].operating_state || 'running',
            health_status: r.health_status || raw.machines[idx].health_status || 'normal',
            specs
          };
          updated++;
        } else {
          const nextId = Math.max(0, ...raw.machines.map(x => x.id)) + 1;
          raw.machines.push({
            id: nextId,
            machine_code: code,
            name,
            category: r.category || 'Rotating Equipment',
            department_id: deptId,
            plant_area: r.plant_area || 'อาคารผลิตหลัก',
            building: r.building || 'Building A',
            line_zone: r.line_zone || 'Line 1',
            model_brand: r.model_brand || '-',
            serial_no: r.serial_no || '-',
            criticality: r.criticality || 'B',
            operating_state: r.operating_status || r.operating_state || 'running',
            health_status: r.health_status || 'normal',
            running_hours: Number(r.running_hours || 1200),
            install_date: r.install_date || '2026-09-25',
            specs
          });
          inserted++;
        }
      }
    } else if (entityType === 'departments') {
      for (const r of rows) {
        const code = String(r.code || '').trim().toUpperCase();
        const name = String(r.name || '').trim();
        if (!code || !name) continue;
        const idx = raw.departments.findIndex(d => String(d.code).toUpperCase() === code);
        if (idx >= 0) {
          raw.departments[idx] = {
            ...raw.departments[idx],
            name,
            plant_name: r.plant_name || raw.departments[idx].plant_name || 'โรงงานหลัก',
            manager_name: r.manager_name || raw.departments[idx].manager_name || '-',
            color: r.color || raw.departments[idx].color || '#1f760e',
            description: r.description || raw.departments[idx].description || ''
          };
          updated++;
        } else {
          const nextId = Math.max(0, ...raw.departments.map(x => x.id)) + 1;
          raw.departments.push({
            id: nextId,
            code,
            name,
            plant_name: r.plant_name || 'โรงงานหลัก',
            manager_name: r.manager_name || '-',
            color: r.color || '#1f760e',
            icon: 'cog',
            description: r.description || ''
          });
          inserted++;
        }
      }
    } else if (entityType === 'users') {
      for (const r of rows) {
        const empCode = String(r.emp_code || '').trim().toUpperCase();
        const fullName = String(r.full_name || '').trim();
        if (!empCode || !fullName) continue;
        const deptCode = String(r.department_code || 'MECH').trim().toUpperCase();
        const deptObj = raw.departments.find(d => String(d.code).toUpperCase() === deptCode) || raw.departments[0];
        const deptId = deptObj ? deptObj.id : 1;
        const idx = raw.users.findIndex(u => String(u.emp_code).toUpperCase() === empCode);
        if (idx >= 0) {
          raw.users[idx] = {
            ...raw.users[idx],
            full_name: fullName,
            role: r.role || raw.users[idx].role || 'inspector',
            position: r.position_title || r.position || raw.users[idx].position || 'ช่างเทคนิคตรวจเช็ค',
            department_id: deptId,
            shift_group: r.shift_group || raw.users[idx].shift_group || 'กะ A',
            phone: r.phone || raw.users[idx].phone || ''
          };
          updated++;
        } else {
          const nextId = Math.max(0, ...raw.users.map(x => x.id)) + 1;
          raw.users.push({
            id: nextId,
            emp_code: empCode,
            full_name: fullName,
            role: r.role || 'inspector',
            position: r.position_title || r.position || 'ช่างเทคนิคตรวจเช็ค',
            department_id: deptId,
            shift_group: r.shift_group || 'กะ A',
            phone: r.phone || ''
          });
          inserted++;
        }
      }
    } else if (entityType === 'routes') {
      for (const r of rows) {
        const routeCode = String(r.route_code || '').trim().toUpperCase();
        const name = String(r.name || '').trim();
        if (!routeCode || !name) continue;
        const deptCode = String(r.department_code || 'MECH').trim().toUpperCase();
        const deptObj = raw.departments.find(d => String(d.code).toUpperCase() === deptCode) || raw.departments[0];
        const deptId = deptObj ? deptObj.id : 1;
        const defaultForm = raw.forms.find(f => Number(f.department_id) === Number(deptId)) || raw.forms[0];
        const machineCodes = String(r.machine_codes || '').split(/[;|,]/).map(s => s.trim()).filter(Boolean);
        const stops = [];
        machineCodes.forEach((mc, sIdx) => {
          const mObj = raw.machines.find(m => String(m.machine_code).toUpperCase() === mc.toUpperCase());
          if (mObj) {
            stops.push({
              stop_order: sIdx + 1,
              machine_id: mObj.id,
              form_id: defaultForm ? defaultForm.id : 1,
              stop_note: `จุดที่ ${sIdx + 1}: ตรวจเช็ค ${mObj.machine_code}`
            });
          }
        });
        const timeWindows = String(r.time_windows || '08:30-10:00|13:30-15:00').split('|').map(s => s.trim()).filter(Boolean);
        const shiftSchedules = timeWindows.map((tw, i) => ({
          shift: i === 0 ? 'กะเช้า' : i === 1 ? 'กะบ่าย' : 'กะดึก',
          time_window: tw,
          note: `รอบเดินตรวจที่ ${i + 1}`
        }));
        const teamInspectors = String(r.team_inspectors || '').split(/[;|,]/).map(s => s.trim()).filter(Boolean);
        const idx = (raw.routes || []).findIndex(rt => String(rt.route_code).toUpperCase() === routeCode);
        if (idx >= 0) {
          raw.routes[idx] = {
            ...raw.routes[idx],
            name,
            department_id: deptId,
            estimated_minutes: Number(r.estimated_minutes || raw.routes[idx].estimated_minutes || 35),
            time_windows: timeWindows,
            shift_schedules: shiftSchedules,
            team_inspectors: teamInspectors.length ? teamInspectors : (raw.routes[idx].team_inspectors || []),
            description: r.description || raw.routes[idx].description || '',
            stops: stops.length ? stops : (raw.routes[idx].stops || [])
          };
          updated++;
        } else {
          const nextId = Math.max(0, ...(raw.routes || []).map(x => x.id)) + 1;
          raw.routes.push({
            id: nextId,
            route_code: routeCode,
            name,
            department_id: deptId,
            estimated_minutes: Number(r.estimated_minutes || 35),
            time_windows: timeWindows,
            shift_schedules: shiftSchedules,
            team_inspectors: teamInspectors,
            description: r.description || '',
            stops
          });
          inserted++;
        }
      }
    }

    addAudit(
      actor,
      'BULK_IMPORT_CSV',
      entityType.toUpperCase(),
      `นำเข้า CSV (${entityType})`,
      `เพิ่มใหม่ ${inserted} รายการ, อัปเดต ${updated} รายการ (รวม ${inserted + updated} แถว)`
    );
    saveLocalDb(raw);
    return { ok: true, inserted, updated, data: enrichRawData(raw) };
  }

  // Client-Side Activity Log Event (e.g. 3D Placement Change)
  if (url === '/api/audit-logs/client-event' && method === 'POST') {
    raw.auditLogs.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      actor_name: body.actor_name || state?.activeUser?.full_name || 'System Admin',
      action_type: body.action_type || 'UPDATE',
      target_type: body.target_type || '3D_PLACEMENT',
      target_name: body.target_name || '-',
      detail: body.detail || '',
      can_undo: true,
      reverted: false,
      reverted_at: '',
      reverted_by: '',
      undo_payload: body.undo_payload || null,
      created_at: nowStr()
    });
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  // Undo / Rollback System Activity Log Entry
  if (url.match(/^\/api\/audit-logs\/\d+\/undo$/) && method === 'POST') {
    const id = Number(url.split('/')[3]);
    const actor = body?.actor || state?.activeUser?.full_name || 'System Admin';
    const logItem = (raw.auditLogs || []).find(x => Number(x.id) === id);
    if (!logItem) {
      throw new Error('ไม่พบรายการประวัติที่ต้องการย้อนกลับ');
    }
    if (!logItem.can_undo || !logItem.undo_payload) {
      throw new Error('รายการนี้ไม่มี Snapshot สำหรับย้อนข้อมูลกลับ');
    }
    if (logItem.reverted) {
      throw new Error('รายการนี้ถูกย้อนข้อมูลกลับไปแล้ว');
    }

    const undoPayload = logItem.undo_payload;
    const beforeUndoSnap = cloneDataSnapshot(raw);

    if (undoPayload.snapshot_before) {
      applyDataSnapshotToRaw(raw, undoPayload.snapshot_before);
    }

    logItem.reverted = true;
    logItem.reverted_at = nowStr();
    logItem.reverted_by = actor;

    raw.auditLogs.unshift({
      id: Date.now() + Math.floor(Math.random() * 1000),
      actor_name: actor,
      action_type: 'UNDO_ROLLBACK',
      target_type: logItem.target_type,
      target_name: `ย้อนข้อมูลกลับ: ${logItem.target_name}`,
      detail: `กู้คืนข้อมูลกลับไปก่อนรายการ "${logItem.action_type} — ${logItem.target_name}"`,
      can_undo: true,
      reverted: false,
      reverted_at: '',
      reverted_by: '',
      undo_payload: {
        mode: 'local_snapshot',
        snapshot_before: beforeUndoSnap
      },
      created_at: nowStr()
    });

    saveLocalDb(raw);
    return {
      ok: true,
      undone_log_id: id,
      undo_payload: undoPayload,
      data: enrichRawData(raw)
    };
  }

  // Purge Mockup Data (Preserve real user-entered records)
  if (url === '/api/system/purge-mockup' && method === 'POST') {
    purgeMockupRecordsFromRaw(raw, true);
    addAudit(
      body?.actor || state?.activeUser?.full_name || 'System Admin',
      'PURGE_MOCKUP',
      'DATABASE',
      'ล้างข้อมูลจำลอง (Mockup Data)',
      'ลบรายการจำลองเริ่มต้นออกทั้งหมด คงเหลือเฉพาะข้อมูลจริง'
    );
    saveLocalDb(raw);
    return { ok: true, data: enrichRawData(raw) };
  }

  return { ok: true, data: enrichRawData(raw) };
}

const state = {
  data: {
    departments: [],
    machines: [],
    forms: [],
    inspections: [],
    defects: [],
    users: [],
    routes: [],
    routeRounds: [],
    machinePlacements: {},
    settings: {},
    auditLogs: []
  },
  activeTab: 'dashboard',
  globalDeptId: 'ALL',
  activeUser: null,
  userScopeOnly: true,
  themeMode: localStorage.getItem('ESC_THEME_MODE') || 'light',
  connectionMode: window.location.protocol === 'file:' ? 'local_file' : 'server',
  lastSyncAt: null,
  tabletMode: false,
  inspectFilterMode: 'ALL',
  activeRouteRoundId: 1,
  machineSearch: '',
  machineStatusFilter: 'ALL',
  machineOperatingFilter: 'ALL',
  historyResultFilter: 'ALL',
  historyMachineFilter: 'ALL',
  defectStatusFilter: 'ALL',
  defectMachineFilter: 'ALL',
  auditTypeFilter: 'ALL',
  auditSearch: '',
  trendMachineId: 1,
  trendFieldId: 'f_brg_de_temp',
  csvImportType: 'machines',
  csvPreviewRows: [],
  csvRawText: '',
  inspectSession: {
    machine_id: 1,
    form_id: 1,
    route_round_id: null,
    co_inspectors: [],
    shift: 'กะเช้า (07:00-19:00)',
    machine_state_at_check: 'running',
    checkin_method: 'qr_scan',
    inspector_note: '',
    answers: {}
  },
  builderMode: false,
  builderForm: null
};

let trendChartInstance = null;
let deptChartInstance = null;
let signatureCtx = null;
let isDrawingSignature = false;
let hasSignatureStroke = false;

// ============================================================================
// THEME MODE (DARK / LIGHT) WITH ES GROUP CORPORATE TONE
// ============================================================================
function applyThemeMode(mode) {
  state.themeMode = mode === 'dark' ? 'dark' : 'light';
  document.body.classList.toggle('dark-theme', state.themeMode === 'dark');
  try {
    localStorage.setItem('ESC_THEME_MODE', state.themeMode);
  } catch (_) {}

  const btn = document.getElementById('btn-theme-mode');
  const lbl = document.getElementById('theme-mode-label');
  if (btn && lbl) {
    if (state.themeMode === 'dark') {
      lbl.textContent = '🌙 โหมดมืด (ES Night)';
      btn.className = 'flex items-center gap-1.5 bg-[#14360e] hover:bg-[#1e4616] text-[#8ce617] border border-[#8ce617]/50 text-xs font-extrabold px-3 py-2 rounded-xl shadow-xs transition cursor-pointer';
    } else {
      lbl.textContent = '☀️ โหมดสว่าง (ES Light)';
      btn.className = 'flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold px-3 py-2 rounded-xl shadow-xs transition cursor-pointer';
    }
  }

  if (window.factory3DSceneInstance && typeof window.factory3DSceneInstance.setThemeMode === 'function') {
    window.factory3DSceneInstance.setThemeMode(state.themeMode);
  }
}

function toggleThemeMode() {
  const next = state.themeMode === 'dark' ? 'light' : 'dark';
  applyThemeMode(next);
  if (state.activeTab === 'dashboard') {
    setTimeout(() => initDashboardCharts(), 30);
  }
  showToast(
    next === 'dark'
      ? '🌙 เปลี่ยนเป็น "โหมดมืด (ES Forest Night)" แล้ว — ถนอมสายตาช่างกะดึกด้วยโทนสีเขียว-ทอง ES Group'
      : '☀️ เปลี่ยนเป็น "โหมดสว่าง (ES Daylight)" แล้ว — คมชัดสู้แสงหน้างานกลางแจ้ง',
    'info'
  );
}

// ============================================================================
// ACTIVE USER SCOPED FILTER HELPERS (FORMS & ACTIVE SHIFT ROUTE ROUNDS)
// ============================================================================
function isUserInInspectorList(user, list) {
  if (!user || !Array.isArray(list)) return false;
  const uName = String(user.full_name || '').trim();
  const uCode = String(user.emp_code || '').trim();
  const uId = Number(user.id);
  return list.some(item => {
    if (!item) return false;
    if (typeof item === 'string') {
      return (uName && item.includes(uName)) || (uCode && item.includes(uCode));
    }
    if (typeof item === 'object') {
      if (uId && Number(item.user_id) === uId) return true;
      if (uCode && (item.emp_code === uCode || item.inspector_code === uCode)) return true;
      if (uName && (item.full_name === uName || item.inspector_name === uName)) return true;
    }
    return false;
  });
}

function isRouteRoundScopedToActiveUser(rr, user = state.activeUser) {
  if (!rr) return false;
  if (!state.userScopeOnly || !user) return true;
  // Match if user is in assigned_inspectors / team_members OR belongs to the same department OR is assigned to a stop
  if (isUserInInspectorList(user, rr.assigned_inspectors) || isUserInInspectorList(user, rr.team_members)) {
    return true;
  }
  const stops = rr.stops_progress || rr.stop_statuses || [];
  if (stops.some(st => st && (
    (user.full_name && String(st.assigned_to || '').includes(user.full_name)) ||
    (user.full_name && String(st.inspector_name || '').includes(user.full_name)) ||
    isUserInInspectorList(user, st.co_inspectors)
  ))) {
    return true;
  }
  if (user.department_id && Number(rr.department_id) === Number(user.department_id)) {
    return true;
  }
  return false;
}

function isRouteScopedToActiveUser(route, user = state.activeUser) {
  if (!route) return false;
  if (!state.userScopeOnly || !user) return true;
  if (isUserInInspectorList(user, route.team_inspectors)) return true;
  if (user.department_id && Number(route.department_id) === Number(user.department_id)) return true;
  const activeRoundsForRoute = (state.data.routeRounds || []).filter(rr => Number(rr.route_id) === Number(route.id) && rr.status === 'in_progress');
  if (activeRoundsForRoute.some(rr => isRouteRoundScopedToActiveUser(rr, user))) return true;
  return false;
}

function isFormScopedToActiveUser(form, user = state.activeUser) {
  if (!form) return false;
  if (!state.userScopeOnly || !user) return true;
  if (!form.department_id) return true;
  if (user.department_id && Number(form.department_id) === Number(user.department_id)) return true;
  // Also include forms used in any active route round where the user is a team member
  const userRounds = (state.data.routeRounds || []).filter(rr => rr.status === 'in_progress' && isRouteRoundScopedToActiveUser(rr, user));
  for (const rr of userRounds) {
    const stops = rr.stops_progress || rr.stop_statuses || [];
    if (stops.some(st => Number(st.form_id) === Number(form.id))) return true;
  }
  return false;
}

function isMachineScopedToActiveUser(machine, user = state.activeUser) {
  if (!machine) return false;
  if (!state.userScopeOnly || !user) return true;
  if (user.department_id && Number(machine.department_id) === Number(user.department_id)) return true;
  const userRounds = (state.data.routeRounds || []).filter(rr => rr.status === 'in_progress' && isRouteRoundScopedToActiveUser(rr, user));
  for (const rr of userRounds) {
    const stops = rr.stops_progress || rr.stop_statuses || [];
    if (stops.some(st => Number(st.machine_id) === Number(machine.id) || st.machine_code === machine.machine_code)) return true;
  }
  return false;
}

function getScopedRouteRoundsForActiveUser(onlyInProgress = false) {
  let list = state.data.routeRounds || [];
  if (onlyInProgress) list = list.filter(r => r.status === 'in_progress');
  list = filterByGlobalDept(list);
  if (!state.userScopeOnly || !state.activeUser) return list;
  return list.filter(rr => isRouteRoundScopedToActiveUser(rr, state.activeUser));
}

function getScopedRoutesForActiveUser() {
  let list = filterByGlobalDept(state.data.routes || []);
  if (!state.userScopeOnly || !state.activeUser) return list;
  return list.filter(r => isRouteScopedToActiveUser(r, state.activeUser));
}

function getScopedFormsForActiveUser() {
  let list = filterByGlobalDept(state.data.forms || []);
  if (!state.userScopeOnly || !state.activeUser) return list;
  const scoped = list.filter(f => isFormScopedToActiveUser(f, state.activeUser));
  return scoped.length > 0 ? scoped : list;
}

function getScopedMachinesForActiveUser() {
  let list = filterByGlobalDept(state.data.machines || []);
  if (!state.userScopeOnly || !state.activeUser) return list;
  const scoped = list.filter(m => isMachineScopedToActiveUser(m, state.activeUser));
  return scoped.length > 0 ? scoped : list;
}

function toggleUserScopeFilter() {
  state.userScopeOnly = !state.userScopeOnly;
  renderCurrentTab();
  showToast(
    state.userScopeOnly
      ? `👤 กรองเฉพาะรายการที่เกี่ยวข้องกับ "${state.activeUser?.full_name || 'ผู้ใช้งานปัจจุบัน'}" แล้ว`
      : '🌐 แสดงข้อมูลทั้งหมดทุกแผนกและทุกรอบเดินตรวจแล้ว',
    'info'
  );
}

function renderUserScopeFilterBar(contextLabel = 'แบบฟอร์มและรอบการเดินตรวจในกะนี้') {
  const u = state.activeUser;
  if (!u) return '';
  const deptName = u.department_name || (state.data.departments.find(d => Number(d.id) === Number(u.department_id))?.name) || 'ส่วนกลาง';
  const deptCode = u.department_code || (state.data.departments.find(d => Number(d.id) === Number(u.department_id))?.code) || 'ALL';
  return `
    <div class="bg-emerald-50/90 border border-emerald-200 rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
      <div class="flex items-center gap-2.5 text-xs">
        <span class="w-8 h-8 rounded-xl bg-[#1f760e] text-white flex items-center justify-center font-bold shrink-0">👤</span>
        <div>
          <div class="font-bold text-slate-800 flex flex-wrap items-center gap-1.5">
            <span>มุมมองผู้ใช้งาน: <strong class="text-[#1f760e]">${u.full_name}</strong> (${u.emp_code || '-'})</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">[${deptCode}] ${deptName}</span>
          </div>
          <div class="text-[11px] text-slate-600 mt-0.5">
            ${state.userScopeOnly
              ? `กำลังแสดงเฉพาะ <strong>${contextLabel}</strong> ที่เกี่ยวข้องกับแผนกหรือทีมเดินตรวจของคุณ`
              : `กำลังแสดง <strong>${contextLabel} ทั้งหมดทุกแผนก</strong> ในโรงงาน`}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <button type="button" onclick="toggleUserScopeFilter()" class="px-3.5 py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center gap-1.5 ${
          state.userScopeOnly
            ? 'bg-[#1f760e] text-white border-[#1f760e] shadow-xs hover:bg-[#154c0c]'
            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
        }">
          ${state.userScopeOnly ? '👤 แสดงเฉพาะของฉัน (คลิกเพื่อดูทั้งหมด)' : '🌐 แสดงทั้งหมดทุกแผนก (คลิกเพื่อกรองเฉพาะฉัน)'}
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// SERVER CONNECTION & DATA FRESHNESS BANNER (P0-4)
// ============================================================================
function updateServerStatusBanner(mode, detail = '') {
  state.connectionMode = mode;
  state.lastSyncAt = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const banner = document.getElementById('server-status-banner');
  if (!banner) return;

  if (mode === 'server') {
    banner.className = 'hidden';
    banner.innerHTML = '';
  } else if (mode === 'local_file') {
    banner.className = 'bg-amber-50 border-b border-amber-200 px-6 py-1.5 text-[11px] text-amber-900 flex flex-wrap items-center justify-between gap-2 no-print';
    banner.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-amber-200 text-amber-950 font-extrabold">โหมดไฟล์ออฟไลน์ (Local HTML Mode)</span>
        <span>กำลังทำงานผ่าน LocalStorage ของเบราว์เซอร์ (${state.lastSyncAt}) — ข้อมูลบันทึกในเครื่องนี้ทันที</span>
      </div>
      <span class="font-semibold text-amber-800">💡 รัน <code>npm start</code> เพื่อเชื่อมฐานข้อมูลกลาง SQLite</span>
    `;
  } else if (mode === 'server_offline_fallback') {
    banner.className = 'bg-rose-600 text-white px-6 py-2 text-xs font-bold flex flex-wrap items-center justify-between gap-2 no-print shadow-sm';
    banner.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="px-2 py-0.5 rounded bg-white text-rose-700 font-extrabold">⚠️ เซิร์ฟเวอร์กลางขาดการเชื่อมต่อ (Offline Fallback)</span>
        <span>ไม่สามารถติดต่อ API เซิร์ฟเวอร์ได้ (${detail || 'Network Error'}) — ระบบสลับใช้แคชสำรองในเครื่องชั่วคราว ข้อมูลอาจไม่ใช่ชุดล่าสุดของโรงงาน</span>
      </div>
      <button onclick="loadBootstrap()" class="px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-extrabold cursor-pointer">🔄 ลองเชื่อมต่อใหม่</button>
    `;
  }
}

// ============================================================================
// INITIALIZATION & API HELPERS (AUTO FALLBACK TO LOCAL HTML MODE)
// ============================================================================
document.addEventListener('DOMContentLoaded', async () => {
  applyThemeMode(state.themeMode);
  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn) {
    mobileBtn.addEventListener('click', () => {
      const nav = document.getElementById('nav-menu');
      nav.classList.toggle('hidden');
    });
  }
  // Auto-enable tablet mode if screen width is iPad/Tablet range (768px - 1180px) or touch device
  if (window.innerWidth >= 700 && window.innerWidth <= 1180 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
    state.tabletMode = true;
    document.body.classList.add('tablet-field-mode');
  }
  await loadBootstrap();
});

function toggleTabletFieldMode() {
  state.tabletMode = !state.tabletMode;
  document.body.classList.toggle('tablet-field-mode', state.tabletMode);
  syncHeaderAndSidebar();
  renderCurrentTab();
  showToast(
    state.tabletMode
      ? '📱 เปิด "โหมดไอแพดช่างหน้างาน" แล้ว: ขยายปุ่มกดขนาดใหญ่ + แป้นตัวเลขด่วน + แถบสายตรวจ'
      : '💻 สลับกลับเป็นโหมดหน้าจอมาตรฐานแล้ว',
    'info'
  );
}

async function apiRequest(url, method = 'GET', body = null) {
  // If opened directly via file:// protocol, use LocalStorage Engine immediately
  if (window.location.protocol === 'file:') {
    updateServerStatusBanner('local_file');
    return handleLocalApiRequest(url, method, body);
  }
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(url, opts);
    const json = await res.json();
    if (!res.ok || json.ok === false) {
      throw new Error(json.error || 'Server Error');
    }
    updateServerStatusBanner('server');
    return json;
  } catch (err) {
    // Explicit warning when falling back to LocalStorage Engine so server errors are never silently masked
    updateServerStatusBanner('server_offline_fallback', err.message);
    return handleLocalApiRequest(url, method, body);
  }
}

async function loadBootstrap() {
  const res = await apiRequest('/api/bootstrap');
  updateStateData(res.data);
}

function updateStateData(newData) {
  state.data = newData;
  if (!state.activeUser && state.data.users.length > 0) {
    state.activeUser = state.data.users[0];
  } else if (state.activeUser) {
    state.activeUser = state.data.users.find(u => u.id === state.activeUser.id) || state.data.users[0];
  }
  syncHeaderAndSidebar();
  renderCurrentTab();
}

function syncHeaderAndSidebar() {
  const sub = document.getElementById('org-subtitle');
  if (sub && state.data.settings.organization_name) {
    sub.textContent = `${state.data.settings.organization_name} — ระบบฐานข้อมูลกลางเชื่อมโยงทุกแผนก`;
  }

  applyThemeMode(state.themeMode);

  const tabBtn = document.getElementById('btn-tablet-mode');
  const tabLbl = document.getElementById('tablet-mode-label');
  if (tabBtn && tabLbl) {
    if (state.tabletMode) {
      tabBtn.className = 'flex items-center gap-1.5 bg-[#1f760e] text-white border border-[#8ce617] text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-md transition';
      tabLbl.textContent = '📱 โหมดไอแพดหน้างาน: เปิดอยู่';
    } else {
      tabBtn.className = 'flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#1f760e] border border-[#1f760e]/30 text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition';
      tabLbl.textContent = '📱 โหมดไอแพดหน้างาน: ปิด';
    }
  }

  const deptSelect = document.getElementById('global-dept-filter');
  if (deptSelect) {
    deptSelect.innerHTML = renderDepartmentSelectOptions(state.globalDeptId, {
      includeAllOption: true,
      includeDivisionFilter: true,
      allValue: 'ALL'
    });
  }

  const userSelect = document.getElementById('current-user-select');
  if (userSelect && state.data.users.length > 0) {
    const admins = state.data.users.filter(u => u.role === 'super_admin');
    const mlUsers = state.data.users.filter(u => u.role !== 'super_admin' && (Number(u.department_id) === 5 || u.department_code === 'ML'));
    const otherUsers = state.data.users.filter(u => u.role !== 'super_admin' && Number(u.department_id) !== 5 && u.department_code !== 'ML');

    const renderOpts = list => list.map(u =>
      `<option value="${u.id}" ${state.activeUser && u.id === state.activeUser.id ? 'selected' : ''}>[${u.emp_code || '-'}] ${u.full_name} (${u.department_code || 'CENTER'})</option>`
    ).join('');

    let optHtml = '';
    if (admins.length > 0) {
      optHtml += `<optgroup label="⚙️ ผู้ดูแลระบบศูนย์กลาง (System Admin)">${renderOpts(admins)}</optgroup>`;
    }
    if (mlUsers.length > 0) {
      optHtml += `<optgroup label="🏭 แผนกลูกหีบ (ML) — ฝ่ายวิศวกรรมจักรกล (${mlUsers.length} ท่าน)">${renderOpts(mlUsers)}</optgroup>`;
    }
    if (otherUsers.length > 0) {
      optHtml += `<optgroup label="🏢 ผู้ใช้งานแผนกอื่นๆ">${renderOpts(otherUsers)}</optgroup>`;
    }
    userSelect.innerHTML = optHtml;
  }

  const roleBadge = document.getElementById('active-role-badge');
  if (roleBadge && state.activeUser) {
    const roleMap = {
      super_admin: 'SUPER ADMIN (ทุกแผนก)',
      dept_admin: 'หัวหน้าแผนก (DEPT ADMIN)',
      inspector: 'ช่างตรวจเช็ค (INSPECTOR)',
      viewer: 'ผู้ดูรายงาน (VIEWER)'
    };
    roleBadge.textContent = roleMap[state.activeUser.role] || state.activeUser.role;
  }

  const openDefects = state.data.defects.filter(d => d.status !== 'resolved' && d.status !== 'closed').length;
  const pendingApprovals = state.data.inspections.filter(i => i.approval_status === 'pending').length;
  const scopedActiveRounds = getScopedRouteRoundsForActiveUser(true).length;
  const auditCount = (state.data.auditLogs || []).length;

  setText('badge-defects', openDefects);
  setText('badge-pending', pendingApprovals);
  setText('badge-routes', scopedActiveRounds || (state.data.routes || []).length);
  setText('badge-machines', state.data.machines.length);
  setText('badge-forms', state.data.forms.length);
  setText('badge-depts', state.data.departments.length);
  setText('badge-auditlogs', auditCount);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function onChangeGlobalDept(deptId) {
  state.globalDeptId = deptId;
  renderCurrentTab();
}

function onChangeActiveUser(userId) {
  const user = state.data.users.find(u => String(u.id) === String(userId));
  if (user) {
    state.activeUser = user;
    // Update inspectSession form & machine to match the newly selected user's scope automatically
    const scopedMachines = getScopedMachinesForActiveUser();
    if (scopedMachines.length > 0 && !scopedMachines.some(m => Number(m.id) === Number(state.inspectSession.machine_id))) {
      state.inspectSession.machine_id = scopedMachines[0].id;
    }
    const scopedForms = getScopedFormsForActiveUser();
    if (scopedForms.length > 0 && !scopedForms.some(f => Number(f.id) === Number(state.inspectSession.form_id))) {
      state.inspectSession.form_id = scopedForms[0].id;
    }
    syncHeaderAndSidebar();
    showToast(`👤 สลับผู้ใช้งานเป็น: ${user.full_name} (${user.department_code || 'CENTER'}) — กรองแบบฟอร์มและรอบเดินตรวจตามผู้ใช้แล้ว`, 'info');
    renderCurrentTab();
  }
}

function switchTab(tabName) {
  if (state.activeTab === 'factory3d' && tabName !== 'factory3d' && typeof window.cleanupFactoryOverview === 'function') {
    window.cleanupFactoryOverview();
  }
  state.activeTab = tabName;
  state.builderMode = false;
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  const titles = {
    dashboard: '📊 แดชบอร์ดศูนย์กลาง (Central Command Center)',
    factory3d: '🏭 ESC Factory World — ภาพรวมโรงงาน (สำรวจพื้นที่ ดูสถานะเครื่องจักร และเริ่มตรวจเช็คจากแผนผังโรงงาน)',
    inspect: '📱 ตรวจเช็คเครื่องจักรหน้างาน (Online E-Checksheet & iPad Mode)',
    routes: '🗺️ ระบบสายเดินตรวจตามลำดับเครื่องจักร & แบ่งงานทีมช่างช่วยกันตรวจในแผนก',
    defects: '🚨 ศูนย์ติดตามความผิดปกติและใบแจ้งซ่อม (Defect & F-Tag Center)',
    history: '📜 ประวัติผลการตรวจเช็ค & การอนุมัติใบงาน (Inspection History)',
    machines: '⚙️ ทะเบียนเครื่องจักรและป้าย QR Code (Machine Master CRUD)',
    forms: '📝 ระบบสร้างแบบฟอร์มตรวจเช็คเอง (Dynamic Form Builder)',
    departments: '🏢 จัดการแผนกและพื้นที่รับผิดชอบ (Multi-Department CRUD)',
    csvimport: '📥 ศูนย์นำเข้าข้อมูลแบบ CSV & ดาวน์โหลดเทมเพลตมาตรฐาน (CSV Bulk Import & Template Center)',
    users: '👥 จัดการผู้ใช้งาน & ตั้งค่าการแจ้งเตือนฟรี (Users & System Settings)',
    auditlog: '⏪ ประวัติการทำงานในระบบ & ศูนย์ย้อนข้อมูลกลับ (System Activity Log & Point-in-Time Undo)'
  };
  setText('page-title', titles[tabName] || 'ESC Machine Center');
  renderCurrentTab();
}

function renderCurrentTab() {
  const container = document.getElementById('main-content');
  if (!container) return;

  if (state.activeTab !== 'factory3d' && typeof window.cleanupFactoryOverview === 'function') {
    window.cleanupFactoryOverview();
  }

  switch (state.activeTab) {
    case 'dashboard': renderDashboard(container); break;
    case 'factory3d':
      if (typeof window.renderFactoryOverview === 'function') {
        window.renderFactoryOverview(container);
      }
      break;
    case 'inspect': renderInspect(container); break;
    case 'routes': renderRoutes(container); break;
    case 'defects': renderDefects(container); break;
    case 'history': renderHistory(container); break;
    case 'machines': renderMachines(container); break;
    case 'forms': renderForms(container); break;
    case 'departments': renderDepartments(container); break;
    case 'csvimport':
      if (typeof renderCsvImportCenter === 'function') {
        renderCsvImportCenter(container);
      }
      break;
    case 'users': renderUsersAndSettings(container); break;
    case 'auditlog':
      if (typeof renderAuditLogCenter === 'function') {
        renderAuditLogCenter(container);
      }
      break;
    default: renderDashboard(container);
  }
  if (typeof window.initAllResizableTables === 'function') {
    window.initAllResizableTables(container);
  }
  if (window.lucide) window.lucide.createIcons();
}

function getDepartmentDivisionName(dept) {
  if (!dept) return 'ฝ่ายปฏิบัติการ';
  const raw = String(dept.plant_name || '').trim();
  return raw || 'ฝ่ายปฏิบัติการ';
}

function formatDeptHierarchy(dept) {
  if (!dept) return '-';
  const divName = getDepartmentDivisionName(dept);
  return `${divName} >> [${dept.code}] ${dept.name}`;
}

function groupDepartmentsByDivision(depts = state.data.departments || []) {
  const groupsMap = new Map();
  for (const d of depts) {
    const divName = getDepartmentDivisionName(d);
    if (!groupsMap.has(divName)) {
      groupsMap.set(divName, []);
    }
    groupsMap.get(divName).push(d);
  }
  return Array.from(groupsMap.entries()).map(([division, items]) => ({
    division,
    departments: items
  }));
}

function renderDepartmentSelectOptions(selectedId, opts = {}) {
  const depts = opts.departments || state.data.departments || [];
  const groups = groupDepartmentsByDivision(depts);
  const includeAllOption = Boolean(opts.includeAllOption);
  const includeDivisionFilter = Boolean(opts.includeDivisionFilter);
  const allValue = opts.allValue !== undefined ? opts.allValue : 'ALL';
  const allLabel = opts.allLabel || `🏢 ทุกฝ่าย / ทุกแผนก (${depts.length} แผนก)`;
  let html = '';

  if (includeAllOption) {
    const isAllSel = String(selectedId ?? '') === String(allValue);
    html += `<option value="${allValue}" ${isAllSel ? 'selected' : ''}>${allLabel}</option>`;
  }

  for (const grp of groups) {
    html += `<optgroup label="📂 กลุ่ม: ${grp.division}">`;
    if (includeDivisionFilter) {
      const grpVal = `GROUP:${grp.division}`;
      const isGrpSel = String(selectedId ?? '') === grpVal;
      html += `<option value="${grpVal}" ${isGrpSel ? 'selected' : ''}>📁 ทั้งกลุ่ม${grp.division} >> ทุกแผนก (${grp.departments.length} แผนก)</option>`;
    }
    for (const d of grp.departments) {
      const isSel = String(d.id) === String(selectedId);
      html += `<option value="${d.id}" ${isSel ? 'selected' : ''}>${grp.division} >> [${d.code}] ${d.name}</option>`;
    }
    html += `</optgroup>`;
  }
  return html;
}

function doesDepartmentMatchFilter(deptIdValue, filterValue) {
  if (!filterValue || filterValue === 'ALL') return true;
  const filterStr = String(filterValue);
  if (filterStr.startsWith('GROUP:')) {
    const targetDivision = filterStr.slice(6);
    const matchingDeptIds = new Set(
      (state.data.departments || [])
        .filter(d => getDepartmentDivisionName(d) === targetDivision)
        .map(d => String(d.id))
    );
    return matchingDeptIds.has(String(deptIdValue));
  }
  return String(deptIdValue) === filterStr;
}

window.getDepartmentDivisionName = getDepartmentDivisionName;
window.formatDeptHierarchy = formatDeptHierarchy;
window.groupDepartmentsByDivision = groupDepartmentsByDivision;
window.renderDepartmentSelectOptions = renderDepartmentSelectOptions;
window.doesDepartmentMatchFilter = doesDepartmentMatchFilter;

function filterByGlobalDept(items, deptKey = 'department_id') {
  if (!state.globalDeptId || state.globalDeptId === 'ALL') return items;
  return (items || []).filter(x => doesDepartmentMatchFilter(x[deptKey], state.globalDeptId));
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const colors = {
    success: 'bg-emerald-600 text-white border-emerald-700',
    error: 'bg-rose-600 text-white border-rose-700',
    info: 'bg-blue-600 text-white border-blue-700',
    warning: 'bg-amber-500 text-white border-amber-600'
  };
  const toast = document.createElement('div');
  toast.className = `${colors[type] || colors.success} px-4 py-3 rounded-xl shadow-lg border text-xs font-medium flex items-center justify-between gap-3 transition-all`;
  toast.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()" class="opacity-80 hover:opacity-100 font-bold">✕</button>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4500);
}

// ============================================================================
// STATUS & BADGE HELPERS
// ============================================================================
function getHealthBadge(status) {
  if (status === 'abnormal') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300 pulse-abnormal"><span class="w-2 h-2 rounded-full bg-rose-600"></span> ผิดปกติ (Abnormal)</span>`;
  }
  if (status === 'warning') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><span class="w-2 h-2 rounded-full bg-amber-500"></span> เฝ้าระวัง (Warning)</span>`;
  }
  return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-300"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> ปกติ (Normal)</span>`;
}

function getOperatingBadge(opState) {
  if (opState === 'running') {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">🟢 กำลังเดินเครื่อง</span>`;
  }
  if (opState === 'pending_repair') {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-300">⏳ รอซ่อม</span>`;
  }
  if (opState === 'under_repair' || opState === 'maintenance') {
    return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-300">🛠️ อยู่ระหว่างการซ่อม</span>`;
  }
  return `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">⚪ หยุดสำรอง (Standby)</span>`;
}

function getTpmBadge(tag) {
  const map = {
    C: { label: '🧹 C: ทำความสะอาด', cls: 'bg-sky-100 text-sky-800 border-sky-200' },
    L: { label: '🛢️ L: หล่อลื่น', cls: 'bg-amber-100 text-amber-800 border-amber-200' },
    I: { label: '🔍 I: ตรวจเช็ค/วัดค่า', cls: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    T: { label: '🔧 T: ขันแน่น', cls: 'bg-purple-100 text-purple-800 border-purple-200' }
  };
  const item = map[tag] || map.I;
  return `<span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${item.cls}">${item.label}</span>`;
}

// ============================================================================
// 1. CENTRAL COMMAND DASHBOARD VIEW
// ============================================================================
function renderDashboard(container) {
  const machines = filterByGlobalDept(state.data.machines);
  const inspections = filterByGlobalDept(state.data.inspections);
  const defects = filterByGlobalDept(state.data.defects, 'assigned_dept_id');

  const normalCount = machines.filter(m => m.health_status === 'normal').length;
  const warningCount = machines.filter(m => m.health_status === 'warning').length;
  const abnormalCount = machines.filter(m => m.health_status === 'abnormal').length;
  const openDefects = defects.filter(d => d.status !== 'resolved' && d.status !== 'closed');

  container.innerHTML = `
    <!-- KPI Summary Row -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div onclick="switchTab('machines')" class="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">เครื่องจักรในระบบ</span>
          <div class="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><i data-lucide="cog" class="w-5 h-5"></i></div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold text-slate-800">${machines.length}</span>
          <span class="text-xs text-slate-500">เครื่อง (${state.data.departments.length} แผนก)</span>
        </div>
        <div class="mt-2 text-[11px] text-blue-600 font-medium">คลิกเพื่อจัดการเพิ่ม/แก้ไข →</div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-emerald-700">สภาพปกติ (Normal)</span>
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><i data-lucide="check-circle-2" class="w-5 h-5"></i></div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold text-emerald-600">${normalCount}</span>
          <span class="text-xs text-slate-500">เครื่อง (${machines.length ? Math.round((normalCount / machines.length) * 100) : 0}%)</span>
        </div>
        <div class="mt-2 text-[11px] text-emerald-700">พร้อมใช้งานตามเกณฑ์มาตรฐาน</div>
      </div>

      <div class="bg-white rounded-2xl p-5 border border-amber-200 shadow-xs">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-amber-700">เฝ้าระวัง (Warning)</span>
          <div class="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><i data-lucide="alert-circle" class="w-5 h-5"></i></div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold text-amber-600">${warningCount}</span>
          <span class="text-xs text-slate-500">เครื่อง</span>
        </div>
        <div class="mt-2 text-[11px] text-amber-700">ค่าเริ่มสูง ควรวางแผน PM ล่วงหน้า</div>
      </div>

      <div onclick="switchTab('defects')" class="cursor-pointer bg-white rounded-2xl p-5 border border-rose-200 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-rose-700">ผิดปกติ/วิกฤต (Abnormal)</span>
          <div class="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center"><i data-lucide="flame" class="w-5 h-5"></i></div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold text-rose-600">${abnormalCount}</span>
          <span class="text-xs text-rose-600 font-semibold">เครื่องต้องแก้ไขด่วน</span>
        </div>
        <div class="mt-2 text-[11px] text-rose-600 font-medium">คลิกดูใบแจ้งซ่อม (${openDefects.length} รายการ) →</div>
      </div>

      <div onclick="switchTab('history')" class="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500">บันทึกการตรวจสะสม</span>
          <div class="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><i data-lucide="clipboard-list" class="w-5 h-5"></i></div>
        </div>
        <div class="mt-3 flex items-baseline gap-2">
          <span class="text-3xl font-extrabold text-slate-800">${inspections.length}</span>
          <span class="text-xs text-slate-500">ใบงาน</span>
        </div>
        <div class="mt-2 text-[11px] text-indigo-600 font-medium">รออนุมัติ ${inspections.filter(i => i.approval_status === 'pending').length} ใบงาน →</div>
      </div>
    </div>

    <!-- Charts Row: CBM Parameter Trend + Department Matrix -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- CBM Trend Chart -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i data-lucide="activity" class="w-4 h-4 text-blue-600"></i>
              กราฟแนวโน้มพารามิเตอร์เครื่องจักร (CBM Trend Analysis)
            </h3>
            <p class="text-xs text-slate-500">ติดตามแนวโน้มอุณหภูมิลูกปืนและความสั่นสะเทือนเทียบเกณฑ์มาตรฐาน</p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <select id="trend-machine-select" onchange="onChangeTrendFilter()" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium">
              ${state.data.machines.map(m => `<option value="${m.id}" ${m.id === Number(state.trendMachineId) ? 'selected' : ''}>${m.machine_code}: ${m.name.slice(0, 28)}</option>`).join('')}
            </select>
            <select id="trend-field-select" onchange="onChangeTrendFilter()" class="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium">
              <option value="f_brg_de_temp" ${state.trendFieldId === 'f_brg_de_temp' ? 'selected' : ''}>🌡️ อุณหภูมิลูกปืน DE (°C)</option>
              <option value="f_vibration_rms" ${state.trendFieldId === 'f_vibration_rms' ? 'selected' : ''}>📈 ความสั่นสะเทือน (mm/s)</option>
              <option value="f_brg_nde_temp" ${state.trendFieldId === 'f_brg_nde_temp' ? 'selected' : ''}>🌡️ อุณหภูมิลูกปืน NDE (°C)</option>
            </select>
          </div>
        </div>
        <div class="h-64">
          <canvas id="cbmTrendChart"></canvas>
        </div>
      </div>

      <!-- Department Overview Card -->
      <div class="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i data-lucide="building-2" class="w-4 h-4 text-indigo-600"></i>
              ภาพรวมกลุ่มฝ่าย &gt;&gt; แผนก (${state.data.departments.length} แผนก)
            </h3>
            <button onclick="switchTab('departments')" class="text-xs text-blue-600 hover:underline font-medium">จัดการฝ่าย &gt;&gt; แผนก</button>
          </div>
          <div class="h-44 mb-3">
            <canvas id="deptSummaryChart"></canvas>
          </div>
          <div class="space-y-2 mt-2 max-h-36 overflow-y-auto pr-1">
            ${state.data.departments.map(d => `
              <div class="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background:${d.color}"></span>
                  <span class="font-semibold text-slate-700 truncate" title="${formatDeptHierarchy(d)}">
                    <span class="text-slate-400 text-[11px]">${getDepartmentDivisionName(d)} &gt;&gt;</span> [${d.code}] ${d.name}
                  </span>
                </div>
                <div class="text-slate-500 shrink-0 ml-2">
                  <span class="font-semibold text-slate-800">${d.machine_count}</span> เครื่อง •
                  <span class="font-semibold text-blue-600">${d.form_count}</span> ฟอร์ม
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>

    <!-- Active Walking Route & Multi-Inspector Shift Round Banner (Scoped to Active User) -->
    ${(() => {
      const allInProgressRounds = (state.data.routeRounds || []).filter(r => r.status === 'in_progress');
      const activeRounds = getScopedRouteRoundsForActiveUser(true);
      const routes = getScopedRoutesForActiveUser();
      const uName = state.activeUser?.full_name || 'ผู้ใช้งานปัจจุบัน';
      return `
        <div class="bg-gradient-to-r from-[#0c2e07] via-[#154c0c] to-[#1f760e] rounded-2xl p-5 text-white shadow-md">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-3.5">
              <div class="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm shrink-0">
                <i data-lucide="route" class="w-6 h-6"></i>
              </div>
              <div>
                <div class="flex flex-wrap items-center gap-2">
                  <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30">
                    🗺️ Route & Team Inspection (v2.2)
                  </span>
                  <span class="text-xs text-emerald-200">
                    ${state.userScopeOnly
                      ? `👤 ของ ${uName}: สายตรวจที่เกี่ยวข้อง ${routes.length} เส้นทาง | รอบเดินตรวจในกะนี้ของฉัน ${activeRounds.length} รอบ (จากทั้งหมด ${allInProgressRounds.length} รอบ)`
                      : `🌐 ทุกแผนก: สายเดินตรวจมาตรฐาน ${routes.length} เส้นทาง | กำลังเดินตรวจในกะนี้ ${activeRounds.length} รอบ`}
                  </span>
                </div>
                <h3 class="font-bold text-base mt-1">ระบบสายเดินตรวจตามลำดับเครื่องจักร & แบ่งงานทีมช่างช่วยกันตรวจในแผนก</h3>
                <p class="text-xs text-emerald-100/85">แสดงเฉพาะรอบการเดินตรวจที่กำลังดำเนินการในกะนี้ที่เกี่ยวข้องกับยูเซอร์ของคุณ (คลิกสลับดูทั้งหมดได้)</p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button onclick="toggleUserScopeFilter()" class="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer">
                ${state.userScopeOnly ? `👤 เฉพาะของฉัน (${activeRounds.length}) • คลิกดูทั้งหมด` : `🌐 แสดงทั้งหมด (${activeRounds.length}) • คลิกกรองเฉพาะฉัน`}
              </button>
              <button onclick="openEmergencyQuickEntryModal(null)" class="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer">
                <i data-lucide="zap" class="w-4 h-4 text-amber-300"></i> ⚡ ลงข้อมูลฉุกเฉิน
              </button>
              <button onclick="switchTab('routes')" class="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer">
                <i data-lucide="map" class="w-4 h-4"></i> เปิดกระดานสายเดินตรวจ & ทีมช่าง (${activeRounds.length})
              </button>
            </div>
          </div>
          ${activeRounds.length > 0 ? `
            <div class="mt-4 pt-3.5 border-t border-white/15 grid grid-cols-1 lg:grid-cols-2 gap-3">
              ${activeRounds.map(rr => {
                const inspectors = (rr.assigned_inspectors || []).map(x => x.inspector_name || x.full_name || x).join(', ');
                const nextStop = (rr.stops_progress || []).find(s => s.status !== 'completed') || (rr.stops_progress || [])[0];
                return `
                <div class="bg-black/25 rounded-xl p-3.5 border border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div class="flex flex-wrap items-center gap-2">
                      <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-400 text-slate-950">${rr.round_code}</span>
                      <span class="font-bold text-sm text-white">${rr.route_name}</span>
                      <span class="text-xs text-emerald-200">⏰ ${rr.time_window || rr.shift}</span>
                    </div>
                    <div class="text-xs text-emerald-100/80 mt-1 flex flex-wrap items-center gap-2">
                      <span>👥 ทีมผู้ตรวจ (${(rr.assigned_inspectors || []).length} คน): <strong>${inspectors}</strong></span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="text-right">
                      <div class="text-xs font-bold text-amber-300">${rr.completed_stops}/${rr.total_stops} เครื่อง (${rr.progress_pct}%)</div>
                      <div class="w-24 h-2 bg-white/15 rounded-full overflow-hidden mt-1">
                        <div class="h-full bg-amber-400 rounded-full" style="width:${rr.progress_pct}%"></div>
                      </div>
                    </div>
                    <button onclick="${nextStop ? `startInspectionForMachine(${nextStop.machine_id}, ${rr.route_id}, ${rr.id})` : `switchTab('routes')`}" class="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold cursor-pointer">
                      เข้าร่วมตรวจ →
                    </button>
                  </div>
                </div>
              `;}).join('')}
            </div>
          ` : `
            <div class="mt-4 pt-3 border-t border-white/15 text-xs text-emerald-100 flex items-center justify-between">
              <span>ไม่มีรอบการเดินตรวจที่กำลังดำเนินการสำหรับผู้ใช้งาน "${uName}" ในขณะนี้</span>
              <button onclick="toggleUserScopeFilter()" class="underline font-bold text-amber-300 cursor-pointer">คลิกดูรอบเดินตรวจของแผนกอื่นทั้งหมด (${allInProgressRounds.length} รอบ)</button>
            </div>
          `}
        </div>
      `;
    })()}

    <!-- Real-time Machine Status Board -->
    <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 class="font-bold text-slate-800 text-base flex items-center gap-2">
            <i data-lucide="monitor" class="w-5 h-5 text-blue-600"></i>
            กระดานสถานะเครื่องจักรกลาง (Real-Time Machine Health Board)
          </h3>
          <p class="text-xs text-slate-500">คลิกปุ่ม "ตรวจเช็คทันที" เพื่อกรอกฟอร์มเต็ม หรือ "⚡ ลงค่าด่วน" เมื่อพบเหตุผิดปกติเฉพาะจุดหน้างาน</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="openMachineModal(null)" class="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <i data-lucide="plus" class="w-4 h-4"></i> เพิ่มเครื่องจักรใหม่
          </button>
        </div>
      </div>

      ${machines.length === 0 ? `
        <div class="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
            <i data-lucide="cpu" class="w-6 h-6"></i>
          </div>
          <h4 class="font-bold text-slate-800 text-sm">ยังไม่มีข้อมูลเครื่องจักรในระบบ (ลบข้อมูลจำลอง Mockup ออกแล้ว)</h4>
          <p class="text-xs text-slate-500 mt-1 max-w-md mx-auto">คุณสามารถเริ่มต้นใช้งานข้อมูลจริงได้ทันทีโดยการเพิ่มเครื่องจักรรายตัว หรือนำเข้าไฟล์ตาราง CSV ทั้งโรงงาน</p>
          <div class="mt-4 flex flex-wrap items-center justify-center gap-2.5">
            <button onclick="openMachineModal(null)" class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer">
              <i data-lucide="plus" class="w-4 h-4"></i> เพิ่มเครื่องจักรจริง
            </button>
            <button onclick="switchTab('csv-import')" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
              <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i> นำเข้าข้อมูลจาก CSV
            </button>
          </div>
        </div>
      ` : `
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        ${machines.map(m => `
          <div class="rounded-2xl border ${m.health_status === 'abnormal' ? 'border-rose-300 bg-rose-50/30' : m.health_status === 'warning' ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200 bg-white'} p-4 flex flex-col justify-between hover:shadow-md transition">
            <div>
              <div class="flex items-start justify-between gap-2">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">${m.machine_code}</span>
                    <span class="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">${m.criticality}</span>
                    ${getOperatingBadge(m.operating_state)}
                  </div>
                  <h4 class="font-bold text-slate-800 text-sm mt-2 leading-snug">${m.name}</h4>
                </div>
                ${getHealthBadge(m.health_status)}
              </div>

              <div class="mt-3 text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">แผนกผู้ดูแลหลัก:</span>
                  <span class="font-semibold" style="color:${m.department_color || '#2563eb'}">[${m.department_code || '-'}] ${m.department_name || '-'}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">พื้นที่ติดตั้ง:</span>
                  <span class="font-medium text-slate-700">${m.plant_area}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-400">ชั่วโมงเดินเครื่องสะสม:</span>
                  <span class="font-mono font-semibold text-slate-700">${Number(m.running_hours || 0).toLocaleString()} ชม.</span>
                </div>
              </div>
            </div>

            <div class="mt-4 pt-3 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-1.5">
                <button onclick="openMachineQRModal(${m.id})" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1" title="พิมพ์ป้าย QR Code">
                  <i data-lucide="qr-code" class="w-3.5 h-3.5"></i> QR
                </button>
                <button onclick="openMachineModal(${m.id})" class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1" title="แก้ไขข้อมูลเครื่องจักร">
                  <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> แก้ไข
                </button>
              </div>
              <div class="flex items-center gap-1.5">
                <button onclick="openEmergencyQuickEntryModal(${m.id})" class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer" title="ลงค่าฉุกเฉินเฉพาะจุดทันที">
                  <i data-lucide="zap" class="w-3.5 h-3.5 text-rose-600"></i> ลงค่าด่วน
                </button>
                <button onclick="startInspectionForMachine(${m.id})" class="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer">
                  <i data-lucide="clipboard-check" class="w-3.5 h-3.5"></i> ตรวจเช็คทันที
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
      `}
    </div>
  `;

  setTimeout(() => {
    initDashboardCharts();
  }, 50);
}

function onChangeTrendFilter() {
  const mSel = document.getElementById('trend-machine-select');
  const fSel = document.getElementById('trend-field-select');
  if (mSel) state.trendMachineId = Number(mSel.value);
  if (fSel) state.trendFieldId = fSel.value;
  initDashboardCharts();
}

function initDashboardCharts() {
  const ctxTrend = document.getElementById('cbmTrendChart');
  if (ctxTrend && window.Chart) {
    if (trendChartInstance) trendChartInstance.destroy();

    const machineInspections = state.data.inspections
      .filter(i => Number(i.machine_id) === Number(state.trendMachineId))
      .slice()
      .reverse();

    const labels = [];
    const values = [];
    let unitLabel = state.trendFieldId === 'f_vibration_rms' ? 'mm/s' : '°C';
    const warnLimit = state.trendFieldId === 'f_vibration_rms' ? 4.5 : 70;
    const critLimit = state.trendFieldId === 'f_vibration_rms' ? 7.1 : 80;

    for (const ins of machineInspections) {
      const ans = (ins.answers || []).find(a => a.field_id === state.trendFieldId);
      if (ans && !isNaN(parseFloat(ans.value))) {
        labels.push(ins.inspected_at.slice(5, 16));
        values.push(parseFloat(ans.value));
        unitLabel = ans.unit || unitLabel;
      }
    }

    if (labels.length === 0) {
      labels.push('ยังไม่มีข้อมูลตรวจวัดจริง');
    }

    const isDark = state.themeMode === 'dark';
    const chartTextColor = isDark ? '#d1fae5' : '#334155';
    const chartGridColor = isDark ? 'rgba(74, 222, 128, 0.14)' : 'rgba(148, 163, 184, 0.22)';
    const primaryLineColor = isDark ? '#8ce617' : '#1f760e';
    const primaryFillColor = isDark ? 'rgba(140, 230, 23, 0.18)' : 'rgba(31, 118, 14, 0.14)';

    trendChartInstance = new Chart(ctxTrend, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: `ค่าที่วัดได้จริง (${unitLabel})`,
            data: values,
            borderColor: primaryLineColor,
            backgroundColor: primaryFillColor,
            borderWidth: 3,
            pointRadius: 5,
            pointBackgroundColor: primaryLineColor,
            fill: true,
            tension: 0.3
          },
          {
            label: `เกณฑ์เฝ้าระวัง Warning (${warnLimit} ${unitLabel})`,
            data: labels.map(() => warnLimit),
            borderColor: '#f59e0b',
            borderWidth: 1.5,
            borderDash: [6, 4],
            pointRadius: 0,
            fill: false
          },
          {
            label: `เกณฑ์วิกฤต Abnormal (${critLimit} ${unitLabel})`,
            data: labels.map(() => critLimit),
            borderColor: isDark ? '#fb7185' : '#dc2626',
            borderWidth: 2,
            borderDash: [4, 4],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: chartTextColor,
              font: { family: 'Kanit', size: 11 }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: chartTextColor },
            grid: { color: chartGridColor }
          },
          y: {
            beginAtZero: false,
            ticks: { color: chartTextColor },
            grid: { color: chartGridColor }
          }
        }
      }
    });
  }

  const ctxDept = document.getElementById('deptSummaryChart');
  if (ctxDept && window.Chart) {
    if (deptChartInstance) deptChartInstance.destroy();
    const isDark = state.themeMode === 'dark';
    deptChartInstance = new Chart(ctxDept, {
      type: 'doughnut',
      data: {
        labels: state.data.departments.map(d => d.code),
        datasets: [{
          data: state.data.departments.map(d => d.machine_count || 1),
          backgroundColor: state.data.departments.map(d => d.color || '#2563eb'),
          borderWidth: 2,
          borderColor: isDark ? '#0d2309' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: isDark ? '#d1fae5' : '#334155',
              font: { family: 'Prompt', size: 11 }
            }
          }
        }
      }
    });
  }
}

// ============================================================================
// 2. EXECUTE INSPECTION VIEW (ONLINE E-CHECKSHEET + IPAD UX + CO-INSPECTION)
// ============================================================================
function startInspectionForMachine(machineId, routeId = null, routeRoundId = null) {
  if (machineId) {
    state.inspectSession.machine_id = Number(machineId);
    const machine = state.data.machines.find(m => m.id === Number(machineId));
    if (machine) {
      state.inspectSession.machine_state_at_check = machine.operating_state || 'running';
      const matchingForm = state.data.forms.find(f => f.department_id === machine.department_id) || state.data.forms[0];
      if (matchingForm) state.inspectSession.form_id = matchingForm.id;
    }
  }
  state.inspectSession.route_id = routeId ? Number(routeId) : null;
  state.inspectSession.route_round_id = routeRoundId ? Number(routeRoundId) : null;
  state.inspectSession.answers = {};
  state.inspectSession.inspector_note = '';
  state.inspectSession.co_inspectors = [];

  // Load shared draft answers if inspecting as part of a multi-inspector route round
  if (state.inspectSession.route_round_id) {
    const round = (state.data.routeRounds || []).find(r => r.id === state.inspectSession.route_round_id);
    if (round) {
      state.inspectSession.route_id = round.route_id;
      state.inspectSession.shift = round.shift || state.inspectSession.shift;
      const stopProgress = (round.stops_progress || []).find(s => Number(s.machine_id) === Number(state.inspectSession.machine_id));
      if (stopProgress && stopProgress.form_id) {
        state.inspectSession.form_id = Number(stopProgress.form_id);
      }
      if (stopProgress && stopProgress.shared_draft_answers && typeof stopProgress.shared_draft_answers === 'object') {
        state.inspectSession.answers = JSON.parse(JSON.stringify(stopProgress.shared_draft_answers));
      }
      if (stopProgress && stopProgress.shared_draft_note) {
        state.inspectSession.inspector_note = stopProgress.shared_draft_note;
      }
      if (stopProgress && Array.isArray(stopProgress.co_inspectors)) {
        state.inspectSession.co_inspectors = [...stopProgress.co_inspectors];
      }
    }
  }

  switchTab('inspect');
}

function getLastRecordedValueForField(machineId, fieldId) {
  const inspections = (state.data.inspections || []).filter(i => Number(i.machine_id) === Number(machineId));
  for (const ins of inspections) {
    const found = (ins.answers || []).find(a => a.field_id === fieldId && a.value !== '' && a.value !== undefined);
    if (found) {
      return {
        value: found.value,
        status: found.status,
        unit: found.unit || '',
        inspected_at: ins.inspected_at,
        inspector_name: ins.inspector_name
      };
    }
  }
  return null;
}

function setInspectFieldFilter(filterMode) {
  const noteEl = document.getElementById('inspect-overall-note');
  if (noteEl) state.inspectSession.inspector_note = noteEl.value;
  state.inspectSession.fieldFilter = filterMode;
  renderCurrentTab();
}

function quickPassAllVisualItems() {
  const form = state.data.forms.find(f => f.id === Number(state.inspectSession.form_id));
  if (!form) return;
  const noteEl = document.getElementById('inspect-overall-note');
  if (noteEl) state.inspectSession.inspector_note = noteEl.value;

  const isRunning = state.inspectSession.machine_state_at_check === 'running';
  let passedCount = 0;
  let numericRemaining = 0;

  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) {
      if (f.running_only && !isRunning) continue;
      const existing = state.inspectSession.answers[f.id];
      if (f.field_type === 'number_range') {
        if (!existing || existing.value === '' || !existing.status) numericRemaining++;
        continue;
      }
      if (!existing || !existing.status) {
        let defaultVal = 'ปกติ (Pass)';
        if (f.field_type === 'three_state') {
          defaultVal = (Array.isArray(f.options) && f.options[0]) ? f.options[0] : 'ปกติ (Normal)';
        } else if (f.field_type === 'checkbox') {
          defaultVal = (Array.isArray(f.options) && f.options[0]) ? f.options[0] : 'ไม่พบสิ่งผิดปกติ';
        }
        state.inspectSession.answers[f.id] = {
          field_id: f.id,
          label: f.label,
          value: defaultVal,
          status: 'normal',
          unit: f.unit || '',
          remark: '',
          photo: '',
          checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
        };
        passedCount++;
      }
    }
  }

  renderCurrentTab();
  showToast(`กดผ่านหมวดสายตา ${passedCount} รายการแล้ว (เหลือกรอกค่าตัวเลขวัดจริง ${numericRemaining} รายการ)`, 'info');
}

function markAllItemsNormal(includeNumeric = true) {
  const form = state.data.forms.find(f => f.id === Number(state.inspectSession.form_id));
  if (!form) return;
  const noteEl = document.getElementById('inspect-overall-note');
  if (noteEl) state.inspectSession.inspector_note = noteEl.value;

  const isRunning = state.inspectSession.machine_state_at_check === 'running';
  let markedCount = 0;

  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) {
      if (f.running_only && !isRunning) continue;
      if (f.field_type === 'number_range') {
        if (!includeNumeric) continue;
        const lastRec = getLastRecordedValueForField(state.inspectSession.machine_id, f.id);
        const minN = f.min_normal ?? 0;
        const maxN = f.max_normal ?? 100;
        let normalVal;
        if (lastRec && !isNaN(parseFloat(lastRec.value))) {
          const lv = parseFloat(lastRec.value);
          normalVal = (lv >= minN && lv <= maxN) ? lv : Number(((minN + maxN) / 2).toFixed(1));
        } else {
          normalVal = Number(((minN + maxN) / 2).toFixed(1));
        }
        state.inspectSession.answers[f.id] = {
          field_id: f.id,
          label: f.label,
          value: String(normalVal),
          status: 'normal',
          unit: f.unit || '',
          remark: '',
          photo: '',
          checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
        };
        markedCount++;
      } else {
        let defaultVal = 'ปกติ (Pass)';
        if (f.field_type === 'three_state') {
          defaultVal = (Array.isArray(f.options) && f.options[0]) ? f.options[0] : 'ปกติ (Normal)';
        } else if (f.field_type === 'checkbox') {
          defaultVal = (Array.isArray(f.options) && f.options[0]) ? f.options[0] : 'ไม่พบสิ่งผิดปกติ';
        }
        state.inspectSession.answers[f.id] = {
          field_id: f.id,
          label: f.label,
          value: defaultVal,
          status: 'normal',
          unit: f.unit || '',
          remark: '',
          photo: '',
          checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
        };
        markedCount++;
      }
    }
  }

  renderCurrentTab();
  showToast(`🟢 ตั้งค่าตรวจผ่านปกติทั้งหมด ${markedCount} ข้อ เรียบร้อยแล้ว`, 'success');
}

function resetInspectionAnswers() {
  if (confirm('คุณต้องการล้างคำตอบที่บันทึกไว้ในแบบฟอร์มนี้ทั้งหมดเพื่อเริ่มตรวจใหม่หรือไม่?')) {
    state.inspectSession.answers = {};
    state.inspectSession.inspector_note = '';
    renderCurrentTab();
    showToast('↺ ล้างคำตอบในแบบฟอร์มทั้งหมดเรียบร้อยแล้ว', 'info');
  }
}

function stepNumericFieldValue(fieldId, delta, minNorm, maxNorm, maxWarn, unit) {
  const inputEl = document.getElementById(`num-input-${fieldId}`);
  const existing = state.inspectSession.answers[fieldId];
  let currentNum = inputEl && inputEl.value !== '' ? parseFloat(inputEl.value) : (existing && existing.value !== '' ? parseFloat(existing.value) : NaN);
  if (isNaN(currentNum)) {
    const lastRec = getLastRecordedValueForField(state.inspectSession.machine_id, fieldId);
    currentNum = (lastRec && !isNaN(parseFloat(lastRec.value))) ? parseFloat(lastRec.value) : Number(((minNorm + maxNorm) / 2).toFixed(1));
  }
  const nextVal = Number((currentNum + delta).toFixed(1));
  if (inputEl) inputEl.value = nextVal;
  onNumericFieldInput(fieldId, String(nextVal), minNorm, maxNorm, maxWarn, unit);
}

function setNumericFieldToLastValue(fieldId, rawVal, minNorm, maxNorm, maxWarn, unit) {
  const inputEl = document.getElementById(`num-input-${fieldId}`);
  if (inputEl) inputEl.value = rawVal;
  onNumericFieldInput(fieldId, String(rawVal), minNorm, maxNorm, maxWarn, unit);
}

async function saveSharedCoInspectionDraft() {
  if (!state.inspectSession.route_round_id) {
    showToast('กรุณาเลือกเดินตรวจจาก "สายเดินตรวจ & ทีมตรวจ" เพื่อแชร์ความคืบหน้าร่วมกับทีม', 'warning');
    return;
  }
  const noteEl = document.getElementById('inspect-overall-note');
  const noteVal = noteEl ? noteEl.value.trim() : (state.inspectSession.inspector_note || '');
  try {
    const res = await apiRequest(`/api/route-rounds/${state.inspectSession.route_round_id}`, 'PUT', {
      shared_draft_save: {
        machine_id: state.inspectSession.machine_id,
        answers: state.inspectSession.answers,
        note: noteVal,
        inspector_name: state.activeUser?.full_name || 'ช่างตรวจเช็ค',
        inspector_code: state.activeUser?.emp_code || 'EMP-1002'
      }
    });
    updateStateData(res.data);
    showToast('บันทึกความคืบหน้าลงรอบตรวจกลางแล้ว! เพื่อนร่วมทีมสามารถเปิดตรวจต่อได้ทันที', 'success');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderInspect(container) {
  const allMachines = state.data.machines;
  const allForms = state.data.forms;
  if (allMachines.length === 0 || allForms.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-10 rounded-2xl border border-slate-200 text-center max-w-xl mx-auto">
        <div class="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="clipboard-check" class="w-6 h-6"></i>
        </div>
        <h3 class="font-bold text-slate-800 text-base">ยังไม่มีรายการเครื่องจักรจริงสำหรับตรวจเช็ค</h3>
        <p class="text-xs text-slate-500 mt-1">ระบบได้ลบข้อมูลจำลอง (Mockup) ออกแล้ว กรุณาเพิ่มเครื่องจักรจริง หรือนำเข้าจากไฟล์ CSV ก่อนเริ่มบันทึกผลตรวจเช็ค</p>
        <div class="mt-4 flex flex-wrap items-center justify-center gap-2.5">
          <button onclick="openMachineModal(null)" class="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer">
            <i data-lucide="plus" class="w-4 h-4"></i> เพิ่มเครื่องจักรจริง
          </button>
          <button onclick="switchTab('csv-import')" class="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer">
            <i data-lucide="file-spreadsheet" class="w-4 h-4 text-emerald-600"></i> นำเข้าข้อมูลจาก CSV
          </button>
        </div>
      </div>
    `;
    return;
  }

  const scopedMachines = getScopedMachinesForActiveUser();
  const scopedForms = getScopedFormsForActiveUser();
  const scopedActiveRounds = getScopedRouteRoundsForActiveUser(true);

  const selectedMachine = scopedMachines.find(m => m.id === Number(state.inspectSession.machine_id))
    || allMachines.find(m => m.id === Number(state.inspectSession.machine_id))
    || scopedMachines[0]
    || allMachines[0];
  state.inspectSession.machine_id = selectedMachine.id;

  const selectedForm = scopedForms.find(f => f.id === Number(state.inspectSession.form_id))
    || scopedForms.find(f => Number(f.department_id) === Number(selectedMachine.department_id))
    || scopedForms[0]
    || allForms[0];
  state.inspectSession.form_id = selectedForm.id;

  // Ensure selectedMachine and selectedForm are in the dropdown lists
  const machines = scopedMachines.some(m => m.id === selectedMachine.id) ? scopedMachines : [selectedMachine, ...scopedMachines];
  const forms = scopedForms.some(f => f.id === selectedForm.id) ? scopedForms : [selectedForm, ...scopedForms];

  const isRunning = state.inspectSession.machine_state_at_check === 'running';
  const fieldFilter = state.inspectSession.fieldFilter || 'all';

  // Calculate form completion progress & co-inspectors
  let totalFieldsCount = 0;
  let answeredFieldsCount = 0;
  const coInspectorSet = new Set(state.inspectSession.co_inspectors || []);
  if (state.activeUser?.full_name) coInspectorSet.add(state.activeUser.full_name);

  for (const sec of selectedForm.sections || []) {
    for (const f of sec.fields || []) {
      totalFieldsCount++;
      const skippedByStopped = f.running_only && !isRunning;
      const ans = state.inspectSession.answers[f.id];
      if (skippedByStopped || (ans && ans.value !== '' && ans.status)) {
        answeredFieldsCount++;
      }
      if (ans && ans.checked_by) coInspectorSet.add(ans.checked_by);
    }
  }
  const progressPct = totalFieldsCount > 0 ? Math.round((answeredFieldsCount / totalFieldsCount) * 100) : 0;

  let activeRound = state.inspectSession.route_round_id
    ? (state.data.routeRounds || []).find(r => r.id === Number(state.inspectSession.machine_id ? state.inspectSession.route_round_id : 0))
    : null;
  if (activeRound && state.userScopeOnly && !isRouteRoundScopedToActiveUser(activeRound, state.activeUser)) {
    activeRound = scopedActiveRounds[0] || null;
    state.inspectSession.route_round_id = activeRound ? activeRound.id : null;
  }
  if (!activeRound && scopedActiveRounds.length > 0) {
    activeRound = scopedActiveRounds[0];
  }

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-5">
      ${renderUserScopeFilterBar('แบบฟอร์มในการตรวจเช็ค & รอบการเดินตรวจที่กำลังดำเนินการในกะนี้')}

      ${scopedActiveRounds.length > 1 ? `
        <div class="bg-white rounded-2xl p-3.5 border border-emerald-200 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
          <span class="text-xs font-bold text-slate-700">🗺️ รอบการเดินตรวจที่กำลังดำเนินการในกะนี้ของคุณ (${scopedActiveRounds.length} รอบ):</span>
          <div class="flex flex-wrap items-center gap-1.5">
            ${scopedActiveRounds.map(rr => {
              const firstPending = (rr.stops_progress || []).find(s => s.status !== 'completed') || (rr.stops_progress || [])[0];
              const isSelectedRound = activeRound && Number(activeRound.id) === Number(rr.id);
              return `
                <button type="button" onclick="startInspectionForMachine(${firstPending ? firstPending.machine_id : selectedMachine.id}, ${rr.route_id}, ${rr.id})"
                  class="px-3 py-1.5 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                    isSelectedRound ? 'bg-[#1f760e] text-white border-[#1f760e]' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-emerald-50'
                  }">
                  ${rr.round_code}: ${rr.route_name} (${rr.completed_stops}/${rr.total_stops})
                </button>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      ${activeRound ? `
        <!-- Active Route Round & Co-Inspection Bar -->
        <div class="bg-gradient-to-r from-[#0c2e07] to-[#1f760e] text-white rounded-2xl p-4 shadow-md border border-emerald-700">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div class="flex flex-wrap items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs">🗺️ ${activeRound.round_code}</span>
                <span class="font-bold text-sm">${activeRound.route_name}</span>
                <span class="text-xs text-emerald-200">(${activeRound.time_window || activeRound.shift})</span>
              </div>
              <p class="text-xs text-emerald-100 mt-1">
                🤝 <strong>ผู้ร่วมตรวจเครื่องนี้:</strong> ${Array.from(coInspectorSet).join(', ')}
                — สามารถตรวจเฉพาะหมวดที่รับผิดชอบแล้วกด <strong>"พัก/แชร์ให้เพื่อนตรวจต่อ"</strong> ได้
              </p>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <button type="button" onclick="saveSharedCoInspectionDraft()" class="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer">
                <i data-lucide="share-2" class="w-4 h-4"></i> 💾 พัก/แชร์ความคืบหน้าให้เพื่อนตรวจต่อ
              </button>
              <button type="button" onclick="switchTab('routes')" class="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs cursor-pointer">
                ดูภาพรวมสายตรวจ (${activeRound.completed_stops}/${activeRound.total_stops})
              </button>
            </div>
          </div>
          <!-- Route Stop Switcher Pills -->
          <div class="mt-3 pt-3 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1">
            ${(activeRound.stops_progress || []).map(st => {
              const isCurrent = Number(st.machine_id) === Number(selectedMachine.id);
              const isDone = st.status === 'completed';
              const hasDraft = st.status === 'in_progress_shared';
              return `
                <button type="button" onclick="startInspectionForMachine(${st.machine_id}, ${activeRound.route_id}, ${activeRound.id})"
                  class="px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1.5 border transition cursor-pointer ${
                    isCurrent
                      ? 'bg-white text-slate-900 border-white shadow-xs'
                      : isDone
                      ? 'bg-emerald-800/80 text-emerald-200 border-emerald-600'
                      : hasDraft
                      ? 'bg-amber-500/30 text-amber-200 border-amber-400/50'
                      : 'bg-black/25 text-white/80 border-white/15 hover:bg-white/10'
                  }">
                  <span>จุดที่ ${st.stop_order}: ${st.machine_code}</span>
                  ${isDone ? '<span>✅</span>' : hasDraft ? '<span>⏳(กำลังช่วยกันตรวจ)</span>' : ''}
                </button>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}

      <!-- Top Selection Header Card -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <i data-lucide="clipboard-check" class="w-6 h-6"></i>
            </div>
            <div>
              <h2 class="font-bold text-slate-800 text-base">ใบบันทึกผลการตรวจสอบเครื่องจักรออนไลน์ (Digital E-Checksheet)</h2>
              <p class="text-xs text-slate-500">
                ผู้ตรวจปัจจุบัน: <strong class="text-blue-700">${state.activeUser?.full_name || 'ช่างตรวจเช็ค'}</strong> (${state.activeUser?.emp_code || '-'})
                ${coInspectorSet.size > 1 ? ` | 🤝 ทีมร่วมตรวจ: <strong class="text-emerald-700">${Array.from(coInspectorSet).join(', ')}</strong>` : ''}
              </p>
            </div>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="openEmergencyQuickEntryModal(${selectedMachine.id})" class="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer">
              <i data-lucide="zap" class="w-4 h-4 text-amber-300"></i> ⚡ ลงค่าฉุกเฉินเฉพาะจุด
            </button>
            <button type="button" onclick="openQuickQRScannerModal()" class="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer">
              <i data-lucide="qr-code" class="w-4 h-4 text-sky-400"></i> จำลองสแกน QR หน้าเครื่อง
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">1. เลือกเครื่องจักรที่ต้องการตรวจเช็ค ${state.userScopeOnly ? `<span class="text-emerald-700 font-semibold">(กรองเฉพาะผู้ใช้ ${machines.length}/${allMachines.length})</span>` : ''}</label>
            <select onchange="onChangeInspectMachine(this.value)" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600">
              ${machines.map(m => `<option value="${m.id}" ${m.id === selectedMachine.id ? 'selected' : ''}>[${m.machine_code}] ${m.name} (${m.plant_area})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">2. เลือกแบบฟอร์มการตรวจเช็ค ${state.userScopeOnly ? `<span class="text-emerald-700 font-semibold">(กรองเฉพาะผู้ใช้ ${forms.length}/${allForms.length})</span>` : ''}</label>
            <select onchange="onChangeInspectForm(this.value)" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-blue-600">
              ${forms.map(f => `<option value="${f.id}" ${f.id === selectedForm.id ? 'selected' : ''}>[${f.department_code || 'ALL'}] ${f.title} (v${f.version})</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">3. กะการทำงาน (Working Shift) *</label>
            <select onchange="state.inspectSession.shift = this.value" class="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
              <option value="กะเช้า (07:00-19:00)" ${state.inspectSession.shift.includes('กะเช้า') || state.inspectSession.shift.includes('เช้า') ? 'selected' : ''}>☀️ กะเช้า (07:00 - 19:00 น.)</option>
              <option value="กะดึก (19:00-07:00)" ${state.inspectSession.shift.includes('กะดึก') || state.inspectSession.shift.includes('ดึก') ? 'selected' : ''}>🌙 กะดึก (19:00 - 07:00 น.)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1">4. สถานะเครื่องจักรขณะเข้าตรวจ (Operating State) *</label>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button type="button" onclick="onChangeInspectOperatingState('running')" class="touch-target-btn py-2 px-2 rounded-xl text-xs font-bold border transition ${state.inspectSession.machine_state_at_check === 'running' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                🟢 เดินเครื่อง
              </button>
              <button type="button" onclick="onChangeInspectOperatingState('standby')" class="touch-target-btn py-2 px-2 rounded-xl text-xs font-bold border transition ${state.inspectSession.machine_state_at_check === 'standby' ? 'bg-slate-700 text-white border-slate-700 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                ⚪ หยุดสำรอง
              </button>
              <button type="button" onclick="onChangeInspectOperatingState('pending_repair')" class="touch-target-btn py-2 px-2 rounded-xl text-xs font-bold border transition ${state.inspectSession.machine_state_at_check === 'pending_repair' ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                ⏳ รอซ่อม
              </button>
              <button type="button" onclick="onChangeInspectOperatingState('under_repair')" class="touch-target-btn py-2 px-2 rounded-xl text-xs font-bold border transition ${state.inspectSession.machine_state_at_check === 'under_repair' || state.inspectSession.machine_state_at_check === 'maintenance' ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-slate-50 text-slate-600 border-slate-200'}">
                🛠️ ระหว่างซ่อม
              </button>
            </div>
          </div>
        </div>

        <div class="bg-slate-900 text-slate-200 rounded-xl p-3.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="text-slate-400">เครื่องจักร:</span> <strong class="text-white">${selectedMachine.machine_code}</strong> |
            <span class="text-slate-400">รุ่น:</span> <strong>${selectedMachine.brand} ${selectedMachine.model}</strong> |
            <span class="text-slate-400">ความสำคัญ:</span> <strong class="text-amber-400">Class ${selectedMachine.criticality}</strong>
          </div>
          <div class="text-sky-300 font-medium">
            📋 ฟอร์ม: ${selectedForm.form_code} (${selectedForm.department_name || 'ส่วนกลาง'})
          </div>
        </div>
      </div>

      <!-- iPad / Field Inspector Speed Toolbar -->
      <div class="bg-white rounded-2xl p-4 border-2 border-emerald-600/30 shadow-xs space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center gap-1">
              📱 แถบช่วยช่างหน้างาน (iPad Speed Bar)
            </span>
            <span class="text-xs font-bold text-slate-700">
              ความคืบหน้า: <strong class="text-emerald-700">${answeredFieldsCount}/${totalFieldsCount} ข้อ (${progressPct}%)</strong>
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button type="button" onclick="markAllItemsNormal(true)" class="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer" title="ตั้งค่าทุกข้อเป็นปกติอัตโนมัติ (รวมค่าตัวเลขตามเกณฑ์ปกติ/ค่าเดิม)">
              <i data-lucide="check-check" class="w-4 h-4"></i> 🟢 ผ่านปกติทุกข้อ (Mark All Normal)
            </button>
            <button type="button" onclick="quickPassAllVisualItems()" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-300 transition cursor-pointer" title="ผ่านเฉพาะข้อสายตา/กายภาพ โดยเว้นให้กรอกค่าตัวเลข CBM เอง">
              👁️ เฉพาะสายตา
            </button>
            <button type="button" onclick="resetInspectionAnswers()" class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 border border-rose-200 transition cursor-pointer" title="ล้างค่าที่กรอกไว้ในฟอร์มนี้ทั้งหมดเพื่อเริ่มตรวจใหม่">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> ล้างคำตอบ
            </button>
          </div>
        </div>

        <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-600 transition-all duration-300 rounded-full" style="width:${progressPct}%"></div>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="text-xs text-slate-500 font-semibold mr-1">กรองหัวข้อตรวจ:</span>
            <button type="button" onclick="setInspectFieldFilter('all')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${fieldFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              📋 ทั้งหมด (${totalFieldsCount})
            </button>
            <button type="button" onclick="setInspectFieldFilter('unchecked')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${fieldFilter === 'unchecked' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              ⏳ ยังไม่กรอก (${totalFieldsCount - answeredFieldsCount})
            </button>
            <button type="button" onclick="setInspectFieldFilter('numeric')" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${fieldFilter === 'numeric' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}">
              🔢 เฉพาะวัดค่าตัวเลข CBM
            </button>
          </div>
          <div class="text-[11px] text-slate-500">
            💡 ทิปสำหรับไอแพด: กดปุ่ม <strong>"-0.1 / = ค่าเดิม / +0.1"</strong> เพื่อปรับตัวเลขเร็วโดยไม่ต้องพิมพ์คีย์บอร์ด
          </div>
        </div>
      </div>

      <!-- Dynamic Sections & Questions -->
      ${(selectedForm.sections || []).map((sec, sIdx) => {
        const filteredFields = (sec.fields || []).filter(f => {
          if (fieldFilter === 'numeric') return f.field_type === 'number_range';
          if (fieldFilter === 'unchecked') {
            const skipped = f.running_only && !isRunning;
            if (skipped) return false;
            const ans = state.inspectSession.answers[f.id];
            return !ans || ans.value === '' || !ans.status;
          }
          return true;
        });
        if (filteredFields.length === 0) return '';
        return `
          <div class="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div class="bg-slate-800 text-white px-6 py-3.5 flex items-center justify-between">
              <h3 class="font-bold text-sm">${sec.title || `หมวดที่ ${sIdx + 1}`}</h3>
              <span class="text-xs text-slate-300">แสดง ${filteredFields.length} / ${(sec.fields || []).length} รายการ</span>
            </div>

            <div class="divide-y divide-slate-200">
              ${filteredFields.map((field, fIdx) => renderInspectionFieldInput(field, fIdx, isRunning, selectedMachine.id)).join('')}
            </div>
          </div>
        `;
      }).join('')}

      <!-- Summary Note & Digital Signature -->
      <div class="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div>
          <label class="block text-xs font-bold text-slate-700 mb-1.5">📝 บันทึกสรุปผลการตรวจเช็ค / ข้อเสนอแนะเพิ่มเติม</label>
          <textarea id="inspect-overall-note" rows="3" placeholder="ระบุข้อสังเกตเพิ่มเติม หรือสิ่งที่ได้ดำเนินการแก้ไขเบื้องต้นหน้างาน..." class="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-blue-600">${state.inspectSession.inspector_note || ''}</textarea>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center pt-2 border-t border-slate-100">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-bold text-slate-700">✍️ ลายเซ็นดิจิทัลผู้ตรวจเช็ค (วาดด้วยนิ้วหรือ Apple Pencil)</label>
              <button type="button" onclick="clearSignaturePad()" class="text-xs text-rose-600 hover:underline font-medium">ล้างลายเซ็น</button>
            </div>
            <div class="border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden">
              <canvas id="signature-canvas" width="420" height="130" class="w-full h-[130px]"></canvas>
            </div>
          </div>

          <div class="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
            <div class="text-xs text-slate-700 space-y-1">
              <div class="font-bold text-blue-900 text-sm">⚡ ระบบอัตโนมัติเมื่อกดส่งผลตรวจ:</div>
              <p>1. คำนวณสถานะเครื่องจักร (<span class="text-emerald-700 font-semibold">ปกติ</span> / <span class="text-amber-700 font-semibold">เฝ้าระวัง</span> / <span class="text-rose-700 font-semibold">ผิดปกติ</span>) ทันที</p>
              <p>2. หากมีข้อที่ <strong>ผิดปกติ (Abnormal)</strong> ระบบจะเปิด <strong>ใบแจ้งซ่อม (F-Tag)</strong> เข้ากระดานกลางให้อัตโนมัติ</p>
              <p>3. บันทึกรายชื่อผู้ร่วมตรวจทุกคนและอัปเดตความคืบหน้าสายเดินตรวจทันที</p>
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
              ${activeRound ? `
                <button type="button" onclick="saveSharedCoInspectionDraft()" class="py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer">
                  <i data-lucide="share-2" class="w-4 h-4"></i> พัก/แชร์ให้เพื่อนตรวจต่อ
                </button>
              ` : ''}
              <button type="button" onclick="submitInspectionForm()" class="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition cursor-pointer">
                <i data-lucide="send" class="w-4 h-4"></i> บันทึกและส่งผลการตรวจเช็คเข้าศูนย์กลาง
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => {
    initSignaturePad();
  }, 50);
}

function renderInspectionFieldInput(field, fIdx, isRunning, machineId) {
  const skippedByStopped = field.running_only && !isRunning;
  const currentAns = state.inspectSession.answers[field.id] || {
    field_id: field.id,
    label: field.label,
    value: '',
    status: skippedByStopped ? 'normal' : '',
    unit: field.unit || '',
    remark: '',
    photo: '',
    checked_by: ''
  };

  if (skippedByStopped) {
    currentAns.value = 'ข้ามการวัด (เครื่องหยุดเดิน)';
    currentAns.status = 'normal';
    state.inspectSession.answers[field.id] = currentAns;
  }

  let controlHtml = '';
  if (skippedByStopped) {
    controlHtml = `
      <div class="bg-slate-100 text-slate-500 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-slate-200">
        ⚪ ข้ามข้อนี้โดยอัตโนมัติ เนื่องจากสถานะเครื่องจักรคือ <strong>หยุดเดินเครื่อง</strong> (หัวข้อนี้วัดเฉพาะขณะเดินเครื่อง)
      </div>
    `;
  } else if (field.field_type === 'pass_fail') {
    controlHtml = `
      <div class="grid grid-cols-2 gap-3 max-w-lg">
        <button type="button" onclick="setFieldAnswer('${field.id}', 'ปกติ (Pass)', 'normal')" class="touch-target-btn py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${currentAns.status === 'normal' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-emerald-50'}">
          🟢 ปกติ / ผ่าน (Pass)
        </button>
        <button type="button" onclick="setFieldAnswer('${field.id}', 'ผิดปกติ (Fail)', 'abnormal')" class="touch-target-btn py-3 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 cursor-pointer ${currentAns.status === 'abnormal' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-rose-50'}">
          🔴 ผิดปกติ / ไม่ผ่าน (Fail)
        </button>
      </div>
    `;
  } else if (field.field_type === 'three_state') {
    const opts = Array.isArray(field.options) && field.options.length >= 3
      ? field.options
      : ['ปกติ (Normal)', 'เฝ้าระวัง (Warning)', 'ผิดปกติ (Abnormal)'];
    controlHtml = `
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button type="button" onclick="setFieldAnswer('${field.id}', '${opts[0]}', 'normal')" class="touch-target-btn py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${currentAns.status === 'normal' ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300'}">
          🟢 ${opts[0]}
        </button>
        <button type="button" onclick="setFieldAnswer('${field.id}', '${opts[1]}', 'warning')" class="touch-target-btn py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${currentAns.status === 'warning' ? 'bg-amber-500 text-white border-amber-500 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300'}">
          🟡 ${opts[1]}
        </button>
        <button type="button" onclick="setFieldAnswer('${field.id}', '${opts[2]}', 'abnormal')" class="touch-target-btn py-3 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${currentAns.status === 'abnormal' ? 'bg-rose-600 text-white border-rose-600 shadow-sm' : 'bg-slate-50 text-slate-700 border-slate-300'}">
          🔴 ${opts[2]}
        </button>
      </div>
    `;
  } else if (field.field_type === 'number_range') {
    const minN = field.min_normal ?? 0;
    const maxN = field.max_normal ?? 100;
    const maxW = field.max_warning ?? 120;
    const unitStr = field.unit || '';
    const lastRec = getLastRecordedValueForField(machineId || state.inspectSession.machine_id, field.id);
    const hasLastNumeric = lastRec && !isNaN(parseFloat(lastRec.value));

    controlHtml = `
      <div class="space-y-2.5">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative w-48">
            <input id="num-input-${field.id}" type="number" step="0.1" value="${currentAns.value}" placeholder="กรอกตัวเลข..."
              oninput="onNumericFieldInput('${field.id}', this.value, ${minN}, ${maxN}, ${maxW}, '${unitStr}')"
              class="touch-num-input w-full bg-slate-50 border-2 border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600" />
            <span class="absolute right-3 top-2.5 text-xs font-bold text-slate-400">${unitStr}</span>
          </div>

          <!-- iPad Touch Stepper Buttons -->
          <div class="flex flex-wrap items-center gap-1.5">
            <button type="button" onclick="stepNumericFieldValue('${field.id}', -1, ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-300 cursor-pointer">-1</button>
            <button type="button" onclick="stepNumericFieldValue('${field.id}', -0.1, ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-300 cursor-pointer">-0.1</button>
            ${hasLastNumeric ? `
              <button type="button" onclick="setNumericFieldToLastValue('${field.id}', '${lastRec.value}', ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 cursor-pointer" title="ใช้ค่าเดิมจากรอบตรวจล่าสุด">
                = ค่าเดิม (${lastRec.value})
              </button>
            ` : ''}
            <button type="button" onclick="stepNumericFieldValue('${field.id}', 0.1, ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-300 cursor-pointer">+0.1</button>
            <button type="button" onclick="stepNumericFieldValue('${field.id}', 1, ${minN}, ${maxN}, ${maxW}, '${unitStr}')" class="touch-stepper-btn px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold border border-slate-300 cursor-pointer">+1</button>
          </div>

          <div id="num-status-${field.id}">
            ${currentAns.status ? getHealthBadge(currentAns.status) : `<span class="text-xs text-slate-500">เกณฑ์ปกติ: <strong>${minN} - ${maxN} ${unitStr}</strong> (เฝ้าระวัง ≤ ${maxW})</span>`}
          </div>
        </div>
        ${hasLastNumeric ? `
          <div class="text-[11px] text-slate-500 flex items-center gap-2">
            <span>🕒 ค่าที่วัดได้ครั้งล่าสุด: <strong class="text-slate-700">${lastRec.value} ${unitStr}</strong> (${lastRec.inspected_at} โดย ${lastRec.inspector_name})</span>
          </div>
        ` : ''}
      </div>
    `;
  } else if (field.field_type === 'checkbox') {
    const opts = Array.isArray(field.options) ? field.options : ['ไม่พบสิ่งผิดปกติ', 'พบรอยรั่วซึม', 'เสียงดังผิดปกติ'];
    const selectedArr = Array.isArray(currentAns.value) ? currentAns.value : (currentAns.value ? String(currentAns.value).split(', ') : []);
    controlHtml = `
      <div class="flex flex-wrap gap-2">
        ${opts.map(opt => {
          const checked = selectedArr.includes(opt);
          return `
            <label class="touch-target-btn inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-bold cursor-pointer ${checked ? 'bg-blue-50 border-blue-500 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-700'}">
              <input type="checkbox" ${checked ? 'checked' : ''} onchange="onToggleCheckboxField('${field.id}', '${opt}', this.checked)" class="rounded text-blue-600 w-4 h-4" />
              <span>${opt}</span>
            </label>
          `;
        }).join('')}
      </div>
    `;
  } else {
    controlHtml = `
      <input type="text" value="${currentAns.value || ''}" placeholder="ระบุผลการตรวจสอบ..."
        oninput="setFieldAnswer('${field.id}', this.value, 'normal', false)"
        class="w-full max-w-lg bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-blue-600" />
    `;
  }

  const showAbnormalBox = currentAns.status === 'abnormal' || currentAns.status === 'warning';

  return `
    <div class="inspect-field-card p-5 space-y-3 ${currentAns.status === 'abnormal' ? 'bg-rose-50/40' : currentAns.status === 'warning' ? 'bg-amber-50/30' : ''}">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-bold text-sm text-slate-800">${fIdx + 1}. ${field.label}</span>
            ${getTpmBadge(field.tpm_tag)}
            ${field.running_only ? `<span class="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">วัดขณะเดินเครื่อง</span>` : ''}
            ${currentAns.checked_by ? `<span class="text-[11px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">👤 ตรวจโดย: ${currentAns.checked_by}</span>` : ''}
          </div>
          <div class="text-xs text-slate-500 flex flex-wrap items-center gap-3">
            <span>🛠️ <strong>วิธี/เครื่องมือ:</strong> ${field.tool_method || 'สายตา (Visual)'}</span>
            ${field.standard_opl ? `<span class="text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">📖 <strong>เกณฑ์ OPL:</strong> ${field.standard_opl}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="pt-1">
        ${controlHtml}
      </div>

      <div id="abnormal-box-${field.id}" class="${showAbnormalBox ? 'block' : 'hidden'} pt-2">
        <div class="p-3.5 rounded-xl bg-white border ${currentAns.status === 'abnormal' ? 'border-rose-300' : 'border-amber-300'} space-y-2.5">
          <div class="text-xs font-bold ${currentAns.status === 'abnormal' ? 'text-rose-700' : 'text-amber-700'} flex items-center gap-1.5">
            ⚠️ พบค่า ${currentAns.status === 'abnormal' ? 'ผิดปกติ (Abnormal) — กรุณาระบุสาเหตุและแนบรูปถ่ายหน้างาน' : 'เฝ้าระวัง (Warning) — สามารถบันทึกหมายเหตุเพิ่มเติมได้'}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input type="text" value="${currentAns.remark || ''}" placeholder="ระบุอาการผิดปกติ / สาเหตุเบื้องต้น..."
              oninput="onFieldRemarkChange('${field.id}', this.value)"
              class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs" />
            <div class="flex items-center gap-2">
              <label class="cursor-pointer bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-3 py-2 rounded-lg inline-flex items-center gap-1.5">
                <i data-lucide="camera" class="w-3.5 h-3.5 text-sky-400"></i> แนบรูปถ่ายจุดเสีย
                <input type="file" accept="image/*" capture="environment" class="hidden" onchange="onFieldPhotoUpload('${field.id}', this)" />
              </label>
              <div id="photo-preview-${field.id}" class="inline-flex items-center gap-1.5">
                ${currentAns.photo ? `
                  <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    ✅ แนบรูปแล้ว
                  </span>
                  <button type="button" onclick="previewAnswerPhoto('${field.id}')" class="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">🔍 ดูรูป</button>
                  <button type="button" onclick="removeAnswerPhoto('${field.id}')" class="text-xs text-rose-600 hover:underline font-semibold cursor-pointer">✕ ลบ</button>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function onChangeInspectMachine(machineId) {
  state.inspectSession.machine_id = Number(machineId);
  const machine = state.data.machines.find(m => m.id === Number(machineId));
  if (machine) {
    state.inspectSession.machine_state_at_check = machine.operating_state || 'running';
  }
  state.inspectSession.answers = {};
  renderCurrentTab();
}

function onChangeInspectForm(formId) {
  state.inspectSession.form_id = Number(formId);
  state.inspectSession.answers = {};
  renderCurrentTab();
}

function onChangeInspectOperatingState(opState) {
  state.inspectSession.machine_state_at_check = opState;
  renderCurrentTab();
}

function getFieldDefById(fieldId) {
  const form = state.data.forms.find(f => f.id === Number(state.inspectSession.form_id));
  if (!form) return null;
  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) {
      if (f.id === fieldId) return f;
    }
  }
  return null;
}

function setFieldAnswer(fieldId, value, status, rerender = true) {
  const f = getFieldDefById(fieldId);
  const existing = state.inspectSession.answers[fieldId] || {};
  state.inspectSession.answers[fieldId] = {
    ...existing,
    field_id: fieldId,
    label: f ? f.label : fieldId,
    value,
    status,
    unit: f?.unit || '',
    checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
  };
  if (rerender) {
    const noteEl = document.getElementById('inspect-overall-note');
    if (noteEl) state.inspectSession.inspector_note = noteEl.value;
    renderCurrentTab();
  }
}

function onNumericFieldInput(fieldId, rawVal, minNorm, maxNorm, maxWarn, unit) {
  const f = getFieldDefById(fieldId);
  const num = parseFloat(rawVal);
  let status = 'normal';
  if (!isNaN(num)) {
    if (num < minNorm || num > maxWarn) {
      status = 'abnormal';
    } else if (num > maxNorm) {
      status = 'warning';
    }
  }
  const existing = state.inspectSession.answers[fieldId] || {};
  state.inspectSession.answers[fieldId] = {
    ...existing,
    field_id: fieldId,
    label: f ? f.label : fieldId,
    value: rawVal,
    status: isNaN(num) ? '' : status,
    unit,
    checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
  };

  const badgeContainer = document.getElementById(`num-status-${fieldId}`);
  if (badgeContainer && !isNaN(num)) {
    badgeContainer.innerHTML = getHealthBadge(status);
  }
  const abnBox = document.getElementById(`abnormal-box-${fieldId}`);
  if (abnBox) {
    abnBox.classList.toggle('hidden', !(status === 'abnormal' || status === 'warning'));
  }
}

function onToggleCheckboxField(fieldId, optionText, isChecked) {
  const f = getFieldDefById(fieldId);
  const existing = state.inspectSession.answers[fieldId] || {};
  let arr = existing.value ? String(existing.value).split(', ').filter(Boolean) : [];
  if (isChecked) {
    if (!arr.includes(optionText)) arr.push(optionText);
  } else {
    arr = arr.filter(x => x !== optionText);
  }
  const hasDefect = arr.some(x => !x.includes('ไม่พบ'));
  state.inspectSession.answers[fieldId] = {
    ...existing,
    field_id: fieldId,
    label: f ? f.label : fieldId,
    value: arr.join(', '),
    status: hasDefect ? 'warning' : 'normal',
    unit: '',
    checked_by: state.activeUser?.full_name || 'ช่างตรวจเช็ค'
  };
  renderCurrentTab();
}

function onFieldRemarkChange(fieldId, remark) {
  if (!state.inspectSession.answers[fieldId]) return;
  state.inspectSession.answers[fieldId].remark = remark;
}

function compressImageFile(file, maxWidth = 1280, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = e => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({
          dataUrl,
          width,
          height,
          originalSize: file.size,
          compressedSize: Math.round((dataUrl.length * 3) / 4)
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

async function onFieldPhotoUpload(fieldId, inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;
  const prev = document.getElementById(`photo-preview-${fieldId}`);
  if (prev) prev.innerHTML = `<span class="text-xs text-amber-600 font-bold animate-pulse">⏳ กำลังบีบอัดรูปภาพ...</span>`;
  try {
    const res = await compressImageFile(file, 1280, 0.75);
    if (!state.inspectSession.answers[fieldId]) {
      state.inspectSession.answers[fieldId] = { field_id: fieldId };
    }
    state.inspectSession.answers[fieldId].photo = res.dataUrl;
    const kb = Math.round(res.compressedSize / 1024);
    if (prev) {
      prev.innerHTML = `
        <div class="inline-flex items-center gap-1.5">
          <span class="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
            ✅ แนบรูปแล้ว (${kb} KB)
          </span>
          <button type="button" onclick="previewAnswerPhoto('${fieldId}')" class="text-xs text-blue-600 hover:underline font-semibold cursor-pointer">🔍 ดูรูป</button>
          <button type="button" onclick="removeAnswerPhoto('${fieldId}')" class="text-xs text-rose-600 hover:underline font-semibold cursor-pointer">✕ ลบ</button>
        </div>
      `;
    }
    showToast(`แนบรูปถ่ายหลักฐานสำเร็จ (บีบอัดเหลือ ${kb} KB ป้องกันหน่วยความจำเต็ม)`, 'success');
  } catch (err) {
    console.error('Image compression error:', err);
    showToast('ไม่สามารถประมวลผลรูปภาพได้: ' + (err.message || 'เกิดข้อผิดพลาด'), 'error');
  }
}

function removeAnswerPhoto(fieldId) {
  if (state.inspectSession.answers[fieldId]) {
    delete state.inspectSession.answers[fieldId].photo;
  }
  const prev = document.getElementById(`photo-preview-${fieldId}`);
  if (prev) prev.innerHTML = '';
  showToast('ลบรูปภาพที่แนบเรียบร้อย', 'info');
}

function previewAnswerPhoto(fieldId) {
  const photo = state.inspectSession.answers[fieldId]?.photo;
  if (!photo) return;
  openModal('📷 รูปถ่ายหลักฐานหน้างาน', `
    <div class="space-y-4 text-center">
      <div class="overflow-hidden rounded-2xl border border-slate-300 shadow-md bg-slate-950 flex items-center justify-center p-2">
        <img src="${photo}" class="max-h-[65vh] w-auto max-w-full rounded-xl object-contain mx-auto" alt="Inspection proof" />
      </div>
      <div class="flex items-center justify-center gap-3">
        <a href="${photo}" download="inspect_${fieldId}_${Date.now()}.jpg" class="px-4 py-2 bg-[#1f760e] hover:bg-[#154c0c] text-white text-xs font-bold rounded-xl shadow-xs transition">
          📥 บันทึกรูปภาพลงเครื่อง
        </a>
        <button onclick="closeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition cursor-pointer">
          ปิดหน้าต่าง
        </button>
      </div>
    </div>
  `);
}

function initSignaturePad() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas) return;
  signatureCtx = canvas.getContext('2d');
  signatureCtx.strokeStyle = '#1e3a8a';
  signatureCtx.lineWidth = 2.2;
  signatureCtx.lineCap = 'round';
  hasSignatureStroke = false;

  const getPos = e => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  const start = e => {
    isDrawingSignature = true;
    hasSignatureStroke = true;
    const pos = getPos(e);
    signatureCtx.beginPath();
    signatureCtx.moveTo(pos.x, pos.y);
  };
  const move = e => {
    if (!isDrawingSignature) return;
    e.preventDefault();
    const pos = getPos(e);
    signatureCtx.lineTo(pos.x, pos.y);
    signatureCtx.stroke();
  };
  const end = () => { isDrawingSignature = false; };

  canvas.onmousedown = start;
  canvas.onmousemove = move;
  window.addEventListener('mouseup', end);
  canvas.ontouchstart = start;
  canvas.ontouchmove = move;
  canvas.ontouchend = end;
}

function clearSignaturePad() {
  const canvas = document.getElementById('signature-canvas');
  if (!canvas || !signatureCtx) return;
  signatureCtx.clearRect(0, 0, canvas.width, canvas.height);
  hasSignatureStroke = false;
}

async function submitInspectionForm() {
  const form = state.data.forms.find(f => f.id === Number(state.inspectSession.form_id));
  if (!form) return;

  const noteEl = document.getElementById('inspect-overall-note');
  const inspectorNote = noteEl ? noteEl.value.trim() : '';

  const allFields = [];
  for (const sec of form.sections || []) {
    for (const f of sec.fields || []) allFields.push(f);
  }

  const answersArray = [];
  const coInspectorSet = new Set(state.inspectSession.co_inspectors || []);
  if (state.activeUser?.full_name) coInspectorSet.add(state.activeUser.full_name);

  for (const f of allFields) {
    const ans = state.inspectSession.answers[f.id];
    if ((!ans || ans.value === '' || !ans.status) && f.required) {
      showToast(`กรุณากรอกข้อมูลข้อ: "${f.label}" ให้ครบถ้วน (หรือใช้ปุ่ม ⚡ ลงค่าฉุกเฉินเฉพาะจุด)`, 'warning');
      return;
    }
    if (ans && ans.value !== '') {
      if (ans.checked_by) coInspectorSet.add(ans.checked_by);
      answersArray.push(ans);
    }
  }

  const canvas = document.getElementById('signature-canvas');
  const sigData = (canvas && hasSignatureStroke) ? canvas.toDataURL('image/png') : '';
  const wasInRouteRound = state.inspectSession.route_round_id;

  try {
    const res = await apiRequest('/api/inspections', 'POST', {
      machine_id: state.inspectSession.machine_id,
      form_id: form.id,
      department_id: form.department_id,
      route_id: state.inspectSession.route_id || null,
      route_round_id: state.inspectSession.route_round_id || null,
      inspection_type: 'routine',
      co_inspectors: Array.from(coInspectorSet),
      inspector_name: state.activeUser?.full_name || 'สมชาย ใจเพชร',
      inspector_code: state.activeUser?.emp_code || 'EMP-1002',
      shift: state.inspectSession.shift,
      machine_state_at_check: state.inspectSession.machine_state_at_check,
      checkin_method: state.inspectSession.checkin_method,
      answers: answersArray,
      inspector_note: inspectorNote,
      signature_data: sigData
    });

    updateStateData(res.data);

    if (res.created_ticket_no) {
      showToast(`บันทึกใบตรวจ ${res.doc_no} และเปิดใบแจ้งซ่อมอัตโนมัติ ${res.created_ticket_no} เรียบร้อย!`, 'warning');
    } else {
      showToast(`บันทึกผลการตรวจเช็ค ${res.doc_no} สำเร็จ!`, 'success');
    }

    if (wasInRouteRound) {
      switchTab('routes');
    } else {
      switchTab('history');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
}

window.saveMachinePlacementToApi = async function (machineCode, payload) {
  const res = await apiRequest(`/api/machine-placements/${encodeURIComponent(machineCode)}`, 'PUT', {
    ...payload,
    actor: state.activeUser?.full_name || 'System Admin'
  });
  if (res && res.data) {
    updateStateData(res.data);
  }
  return res;
};

