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
  if (!force && raw.settings.official_depts_v30 === '1') {
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
  if (!force && raw.settings.official_ml_machines_v28 === '1') {
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
  if (window.ComisStore?.raw) { const raw=JSON.parse(JSON.stringify(ComisStore.raw)); if (!raw.settings?.official_technicians_v212) { purgeMockupRecordsFromRaw(raw, false); saveLocalDb(raw); } return enrichRawData(raw); }
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
  for (const log of raw.auditLogs || []) {
    if (log.undo_payload?.snapshot_before && log.undo_payload.finalize_current) {
      log.undo_payload.changes = ComisDomain.localChanges(log.undo_payload.snapshot_before, cloneDataSnapshot(raw));
      delete log.undo_payload.snapshot_before;
      delete log.undo_payload.finalize_current;
      log.undo_payload.mode = 'local_row_changes';
    }
    if (log.undo_payload?.snapshot_before && !log.undo_payload.changes) log.can_undo = false;
  }
  if (window.SupabaseSync) {
    SupabaseSync.saveRemote(raw);
  }
  if (window.ComisStore) return ComisStore.save(raw);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(raw));
}

function nowStr() {
  return ComisDomain.timestamp();
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
  connectionMode: ComisDomain.isStandalone() ? 'local_file' : 'server',
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
        <span>ข้อมูลเก็บใน IndexedDB ของเครื่องนี้ (${state.lastSyncAt}) ไม่ได้ส่งเข้าฐานกลาง</span>
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
  try { await ComisSync.initialize(); } catch (err) { document.getElementById('main-content').textContent = err.message; return; }
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
  try { await loadBootstrap(); } catch (err) { showToast(err.message, 'error'); }
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
  return ComisSync.request(url, method, body);
}

async function loadBootstrap() {
  if (window.SupabaseSync && (ComisDomain.isStandalone?.() || location.protocol === 'file:')) {
    const remote = await SupabaseSync.fetchRemote();
    if (remote?.data) {
      if (window.ComisStore) await ComisStore.save(remote.data);
      updateStateData(remote.data);
      SupabaseSync.updateCloudBanner(true);
      SupabaseSync.startAutoSync();
      return;
    }
  }
  const res = await apiRequest('/api/bootstrap');
  updateStateData(res.data);
}

function updateStateData(newData) {
  if (newData?.dataRevision !== undefined && state.data.dataRevision !== undefined && newData.dataRevision < state.data.dataRevision) return;
  state.data = newData;
  if (newData.currentUser) state.activeUser = newData.users.find(u => u.id === newData.currentUser.id) || newData.currentUser;
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
  if (userSelect && !ComisDomain.isStandalone()) userSelect.disabled = true;
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
  if (!ComisDomain.isStandalone()) return;
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
  if (window.ComisSync?.applyPermissions) ComisSync.applyPermissions();
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
            <button type="button" onclick="openMachineDashboard(state.trendMachineId)" class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer" title="ดูแดชบอร์ดเฉพาะเครื่องนี้">
              <i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-emerald-600"></i> แดชบอร์ดเครื่องนี้
            </button>
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
                <button onclick="openMachineDashboard(${m.id})" class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer" title="ดูแดชบอร์ดเฉพาะเครื่องนี้">
                  <i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-emerald-600"></i> แดชบอร์ด
                </button>
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

// ============================================================================
// INDIVIDUAL MACHINE DASHBOARD (PER-MACHINE ADVANCED CBM & HISTORY DASHBOARD)
// ============================================================================
let machineDashboardChartInstance = null;
let currentMachineDashboardId = null;
let currentMachineDashboardTab = 'overview';
let currentMachineMetric = 'f_brg_de_temp';

window.closeMachineDashboard = function() {
  const modal = document.getElementById('machine-dashboard-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  if (machineDashboardChartInstance) {
    machineDashboardChartInstance.destroy();
    machineDashboardChartInstance = null;
  }
};

window.openMachineDashboard = function(machineId, activeTab = 'overview', metricField = null) {
  if (!machineId) return;
  const m = state.data.machines.find(x => x.id === Number(machineId));
  if (!m) {
    showToast('ไม่พบข้อมูลเครื่องจักรที่เลือก', 'error');
    return;
  }

  currentMachineDashboardId = Number(machineId);
  currentMachineDashboardTab = activeTab || 'overview';
  if (metricField) currentMachineMetric = metricField;

  const modal = document.getElementById('machine-dashboard-modal');
  const content = document.getElementById('machine-dashboard-content');
  if (!modal || !content) return;

  const dept = state.data.departments.find(d => d.id === m.department_id) || {};
  const insps = (state.data.inspections || [])
    .filter(i => Number(i.machine_id) === Number(m.id))
    .slice()
    .sort((a, b) => (b.inspected_at || '').localeCompare(a.inspected_at || ''));
  const defects = (state.data.defects || [])
    .filter(d => Number(d.machine_id) === Number(m.id))
    .slice()
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
  const openDefectsCount = defects.filter(d => d.status !== 'resolved' && d.status !== 'closed').length;
  const lastInsp = insps[0] || null;

  content.innerHTML = `
    <!-- Header -->
    <div class="px-6 py-4 bg-gradient-to-r from-[#064e3b] via-[#047857] to-[#022c22] text-white flex flex-wrap items-center justify-between gap-4 border-b border-emerald-800">
      <div class="flex items-center gap-3.5 min-w-0">
        <div class="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 font-extrabold text-lg shrink-0">
          <i data-lucide="cpu" class="w-6 h-6"></i>
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-mono text-xs font-bold px-2.5 py-0.5 rounded-full bg-black/40 text-emerald-300 border border-emerald-400/30">${m.machine_code}</span>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">${m.criticality || 'Normal'}</span>
            ${getOperatingBadge(m.operating_state)}
            ${getHealthBadge(m.health_status)}
          </div>
          <h2 class="text-lg sm:text-xl font-extrabold text-white mt-1 truncate" title="${m.name}">${m.name}</h2>
          <div class="text-xs text-emerald-100/80 flex flex-wrap items-center gap-3 mt-0.5">
            <span>📍 ${m.plant_area || 'ไม่ระบุพื้นที่'}</span>
            <span>🏢 ${dept.plant_name || 'วิศวกรรม'} &gt;&gt; [${dept.code || '-'}] ${dept.name || '-'}</span>
          </div>
        </div>
      </div>

      <!-- Machine Selector & Close -->
      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-xl border border-white/15">
          <span class="text-xs text-emerald-200 hidden sm:inline font-semibold">สลับเครื่อง:</span>
          <select onchange="openMachineDashboard(this.value, '${currentMachineDashboardTab}')" class="text-xs bg-slate-900/90 text-white font-bold px-2.5 py-1 rounded-lg border border-white/20 focus:outline-none">
            ${state.data.machines.map(item => `
              <option value="${item.id}" ${item.id === m.id ? 'selected' : ''}>[${item.machine_code}] ${item.name.slice(0, 26)}</option>
            `).join('')}
          </select>
        </div>
        <button onclick="closeMachineDashboard()" class="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer" title="ปิดหน้าต่าง">
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>
    </div>

    <!-- Top KPI Row -->
    <div class="px-6 py-4 bg-slate-50 border-b border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 shrink-0">
      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <span class="text-[11px] font-semibold text-slate-400 block">ดัชนีสุขภาพเครื่อง (Health)</span>
        <div class="mt-1 flex items-baseline gap-2">
          <span class="text-xl sm:text-2xl font-black ${m.health_status === 'abnormal' ? 'text-rose-600' : m.health_status === 'warning' ? 'text-amber-600' : 'text-emerald-600'}">
            ${m.health_status === 'abnormal' ? 'วิกฤต (Critical)' : m.health_status === 'warning' ? 'เฝ้าระวัง (Warning)' : 'สมบูรณ์ (Normal)'}
          </span>
        </div>
        <span class="text-[11px] text-slate-500 block mt-0.5">สถานะตามเกณฑ์ CBM ล่าสุด</span>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <span class="text-[11px] font-semibold text-slate-400 block">ชั่วโมงเดินเครื่องสะสม</span>
        <div class="mt-1 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black text-slate-800">${Number(m.running_hours || 0).toLocaleString()}</span>
          <span class="text-xs text-slate-500 font-semibold">ชม.</span>
        </div>
        <span class="text-[11px] text-slate-500 block mt-0.5">Running Hours สะสมทั้งฤดู</span>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <span class="text-[11px] font-semibold text-slate-400 block">ประวัติการตรวจเช็คสะสม</span>
        <div class="mt-1 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black text-indigo-600">${insps.length}</span>
          <span class="text-xs text-slate-500 font-semibold">ครั้ง</span>
        </div>
        <span class="text-[11px] text-slate-500 block mt-0.5">${lastInsp ? 'ล่าสุด: ' + lastInsp.inspected_at.slice(5, 16) : 'ยังไม่มีประวัติ'}</span>
      </div>

      <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <span class="text-[11px] font-semibold text-slate-400 block">ใบแจ้งซ่อม / F-Tag ค้าง</span>
        <div class="mt-1 flex items-baseline gap-1.5">
          <span class="text-xl sm:text-2xl font-black ${openDefectsCount > 0 ? 'text-rose-600' : 'text-emerald-600'}">${openDefectsCount}</span>
          <span class="text-xs text-slate-500 font-semibold">ใบ</span>
        </div>
        <span class="text-[11px] text-slate-500 block mt-0.5">จากประวัติทั้งหมด ${defects.length} รายการ</span>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="px-6 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
      <button onclick="openMachineDashboard(${m.id}, 'overview')" class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${currentMachineDashboardTab === 'overview' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}">
        <i data-lucide="activity" class="w-4 h-4"></i>
        แนวโน้ม CBM & กราฟพารามิเตอร์
      </button>
      <button onclick="openMachineDashboard(${m.id}, 'history')" class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${currentMachineDashboardTab === 'history' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}">
        <i data-lucide="clipboard-list" class="w-4 h-4"></i>
        ประวัติผลตรวจ (${insps.length})
      </button>
      <button onclick="openMachineDashboard(${m.id}, 'defects')" class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${currentMachineDashboardTab === 'defects' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}">
        <i data-lucide="alert-triangle" class="w-4 h-4"></i>
        ข้อบกพร่อง & F-Tag (${defects.length})
      </button>
      <button onclick="openMachineDashboard(${m.id}, 'specs')" class="px-4 py-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition cursor-pointer whitespace-nowrap ${currentMachineDashboardTab === 'specs' ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50' : 'border-transparent text-slate-500 hover:text-slate-800'}">
        <i data-lucide="sliders" class="w-4 h-4"></i>
        สเปก & งานหล่อลื่น
      </button>
    </div>

    <!-- Body Scrollable Content -->
    <div class="p-6 overflow-y-auto flex-1 bg-slate-50/60">
      ${renderMachineDashboardTabBody(m, insps, defects, dept)}
    </div>

    <!-- Action Toolbar Footer -->
    <div class="px-6 py-3.5 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
      <div class="flex items-center gap-2">
        <button onclick="openMachineQRModal(${m.id})" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition">
          <i data-lucide="qr-code" class="w-4 h-4"></i> ป้าย QR Code
        </button>
        <button onclick="closeMachineDashboard(); openMachineModal(${m.id});" class="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition">
          <i data-lucide="edit-3" class="w-4 h-4"></i> แก้ไขข้อมูล
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="closeMachineDashboard(); openDefectModal(null, ${m.id});" class="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition shadow-xs">
          <i data-lucide="alert-circle" class="w-4 h-4"></i> แจ้งซ่อม F-Tag
        </button>
        <button onclick="closeMachineDashboard(); openEmergencyQuickEntryModal(${m.id});" class="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs">
          <i data-lucide="zap" class="w-4 h-4"></i> ลงค่าด่วน
        </button>
        <button onclick="closeMachineDashboard(); startInspectionForMachine(${m.id});" class="px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-emerald-700/20">
          <i data-lucide="clipboard-check" class="w-4 h-4"></i> ตรวจเช็คเครื่องจักรทันที
        </button>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  if (window.lucide) window.lucide.createIcons();

  if (currentMachineDashboardTab === 'overview') {
    setTimeout(() => {
      initMachineTrendChart(m, insps);
    }, 60);
  }
};

window.renderMachineDashboardTabBody = function(m, insps, defects, dept) {
  if (currentMachineDashboardTab === 'history') {
    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i data-lucide="clipboard-list" class="w-4 h-4 text-emerald-600"></i>
            ประวัติการตรวจเช็คทั้งหมดของ ${m.machine_code} (${insps.length} รายการ)
          </h3>
          <span class="text-xs text-slate-400">เรียงตามวันที่ตรวจล่าสุด</span>
        </div>
        ${insps.length === 0 ? `
          <div class="p-8 text-center text-slate-400 text-xs">
            ยังไม่มีประวัติการบันทึกตรวจเช็คสำหรับเครื่องจักรนี้
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead>
                <tr class="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th class="py-2.5 px-3">วัน-เวลาตรวจ</th>
                  <th class="py-2.5 px-3">เลขที่เอกสาร</th>
                  <th class="py-2.5 px-3">ผู้ตรวจสอบ</th>
                  <th class="py-2.5 px-3">สถานะเครื่อง</th>
                  <th class="py-2.5 px-3">ผลการตรวจ</th>
                  <th class="py-2.5 px-3">การอนุมัติ</th>
                  <th class="py-2.5 px-3">หมายเหตุ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${insps.map(ins => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-2.5 px-3 font-mono font-medium text-slate-700">${ins.inspected_at ? ins.inspected_at.slice(0, 16) : '-'}</td>
                    <td class="py-2.5 px-3 font-mono font-bold text-blue-600">${ins.doc_no || '-'}</td>
                    <td class="py-2.5 px-3 text-slate-800">${ins.inspector_name || '-'}</td>
                    <td class="py-2.5 px-3">${getOperatingBadge(ins.machine_state_at_check)}</td>
                    <td class="py-2.5 px-3">${getHealthBadge(ins.overall_health || 'normal')}</td>
                    <td class="py-2.5 px-3">${getApprovalBadge(ins.approval_status)}</td>
                    <td class="py-2.5 px-3 text-slate-500 truncate max-w-xs" title="${ins.inspector_note || '-'}">${ins.inspector_note || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  if (currentMachineDashboardTab === 'defects') {
    return `
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i>
            รายการข้อบกพร่องและประวัติงานซ่อม F-Tag (${defects.length} รายการ)
          </h3>
          <button onclick="closeMachineDashboard(); openDefectModal(null, ${m.id});" class="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold hover:bg-rose-100 transition">
            + เปิดใบแจ้งซ่อมใหม่
          </button>
        </div>
        ${defects.length === 0 ? `
          <div class="p-8 text-center text-slate-400 text-xs">
            🎉 ไม่พบรายการข้อบกพร่องสำหรับเครื่องจักรนี้ (เครื่องจักรอยู่ในสภาพสมบูรณ์)
          </div>
        ` : `
          <div class="overflow-x-auto">
            <table class="w-full text-xs text-left">
              <thead>
                <tr class="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <th class="py-2.5 px-3">เลขที่ F-Tag</th>
                  <th class="py-2.5 px-3">อาการ / ความผิดปกติ</th>
                  <th class="py-2.5 px-3">ระดับความรุนแรง</th>
                  <th class="py-2.5 px-3">วันที่แจ้ง</th>
                  <th class="py-2.5 px-3">สถานะ</th>
                  <th class="py-2.5 px-3">การจัดการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${defects.map(d => `
                  <tr class="hover:bg-slate-50/80 transition">
                    <td class="py-2.5 px-3 font-mono font-bold text-rose-600">${d.ticket_no || '-'}</td>
                    <td class="py-2.5 px-3 font-medium text-slate-800">${d.symptom || d.description || '-'}</td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded font-bold text-[11px] ${d.severity === 'critical' ? 'bg-rose-100 text-rose-700' : d.severity === 'major' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'}">
                        ${d.severity || 'Normal'}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-slate-500 font-mono">${d.created_at ? d.created_at.slice(0, 16) : '-'}</td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded-full font-bold text-[11px] ${d.status === 'resolved' || d.status === 'closed' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}">
                        ${d.status === 'resolved' ? 'แก้ไขแล้ว' : d.status === 'closed' ? 'ปิดงานแล้ว' : 'รอดำเนินการ'}
                      </span>
                    </td>
                    <td class="py-2.5 px-3">
                      <button onclick="closeMachineDashboard(); openDefectModal(${d.id});" class="text-blue-600 font-bold hover:underline">
                        รายละเอียด →
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  }

  if (currentMachineDashboardTab === 'specs') {
    const specs = m.specs || {};
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <i data-lucide="sliders" class="w-4 h-4 text-emerald-600"></i>
            ข้อมูลจำเพาะทางวิศวกรรม (Engineering Specifications)
          </h3>
          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">รหัสเครื่องจักร (Code):</span>
              <span class="font-mono font-bold text-slate-800">${m.machine_code}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">ชื่อทางการ:</span>
              <span class="font-bold text-slate-800">${m.name}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">หมวดหมู่ / ประเภท:</span>
              <span class="font-semibold text-slate-700">${m.category || 'เครื่องจักรอุตสาหกรรม'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">ระดับความวิกฤต (Criticality):</span>
              <span class="font-bold text-slate-800">${m.criticality || 'B - Medium'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">กำลังมอเตอร์ / ม้าแรง:</span>
              <span class="font-semibold text-slate-800">${specs.motor_power || specs.power || '75 kW (100 HP)'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">ความเร็วรอบทำงาน (RPM):</span>
              <span class="font-mono font-semibold text-slate-800">${specs.rpm || '1,480 RPM'}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
            <i data-lucide="droplet" class="w-4 h-4 text-blue-600"></i>
            ตลับลูกปืนและงานหล่อลื่น (Bearings & Lubrication)
          </h3>
          <div class="space-y-3 text-xs">
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">ตลับลูกปืน DE (Drive End):</span>
              <span class="font-mono font-bold text-slate-800">${specs.bearing_de || 'SKF 22320 CC/W33'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">ตลับลูกปืน NDE (Non-Drive End):</span>
              <span class="font-mono font-bold text-slate-800">${specs.bearing_nde || 'SKF 22318 CC/W33'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">ชนิดจาระบี / สารหล่อลื่น:</span>
              <span class="font-semibold text-slate-800">${specs.lubricant || 'Mobil Polyrex EM (จาระบีสังเคราะห์ทนความร้อนสูง)'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">รอบการอัดจาระบี (Interval):</span>
              <span class="font-semibold text-emerald-700">${specs.greasing_interval || 'ทุก 15 วัน หรือ 360 ชม. เดินเครื่อง'}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-slate-100">
              <span class="text-slate-500">พิกัดผังโรงงาน 3D:</span>
              <span class="font-semibold text-indigo-700">${m.plant_area || 'โซนลูกหีบหลัก'}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Default 'overview' tab: CBM Trend Chart & Analytics
  return `
    <div class="space-y-5">
      <!-- Chart Card -->
      <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 class="font-bold text-slate-800 text-sm flex items-center gap-2">
              <i data-lucide="line-chart" class="w-4 h-4 text-emerald-600"></i>
              กราฟการวัดพารามิเตอร์เชิงคาดการณ์ (Condition-Based Monitoring)
            </h3>
            <p class="text-xs text-slate-500">กราฟเส้นแสดงประวัติเทียบกับเส้นเกณฑ์เตือน (Warning) และเกณฑ์วิกฤต (Critical Alarm)</p>
          </div>
          <div class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button onclick="changeMachineDashboardMetric('f_brg_de_temp')" class="px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${currentMachineMetric === 'f_brg_de_temp' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              🌡️ อุณหภูมิลูกปืน DE
            </button>
            <button onclick="changeMachineDashboardMetric('f_brg_nde_temp')" class="px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${currentMachineMetric === 'f_brg_nde_temp' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              🌡️ อุณหภูมิลูกปืน NDE
            </button>
            <button onclick="changeMachineDashboardMetric('f_vibration_rms')" class="px-2.5 py-1.5 text-xs font-bold rounded-lg transition ${currentMachineMetric === 'f_vibration_rms' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}">
              📈 การสั่นสะเทือน (Vibration)
            </button>
          </div>
        </div>

        <div class="h-64 sm:h-72">
          <canvas id="machineDetailTrendChart"></canvas>
        </div>
      </div>

      <!-- Diagnostic & Predictive Advice Box -->
      <div class="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-4 sm:p-5 flex items-start gap-4">
        <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
          <i data-lucide="shield-check" class="w-5 h-5"></i>
        </div>
        <div class="text-xs space-y-1">
          <h4 class="font-bold text-emerald-900 text-sm">การประเมินสภาพเครื่องจักร (Smart CBM Diagnosis)</h4>
          <p class="text-emerald-800 leading-relaxed">
            ${m.health_status === 'abnormal'
              ? '⚠️ เครื่องจักรตรวจพบค่าเกินพิกัดวิกฤต หรือมีอาการผิดปกติรุนแรง แนะนำให้หยุดตรวจสอบจุดสัมผัส ตลับลูกปืน และเปิดใบแจ้งซ่อม F-Tag ทันที'
              : m.health_status === 'warning'
              ? '⚡ เครื่องจักรเริ่มมีค่าพารามิเตอร์สูงแตะระดับเตือนเฝ้าระวัง ควรเพิ่มความถี่ในการตรวจเช็ค และวางแผนเติมสารหล่อลื่นในการบำรุงรักษารอบถัดไป'
              : '✅ เครื่องจักรทำงานในสภาวะปกติสมบูรณ์ อุณหภูมิและความสั่นสะเทือนอยู่ภายใต้เกณฑ์มาตรฐาน ISO 10816 และมาตรฐานกลุ่มน้ำตาลตะวันออก'}
          </p>
        </div>
      </div>
    </div>
  `;
};

window.changeMachineDashboardMetric = function(metricField) {
  currentMachineMetric = metricField;
  const m = state.data.machines.find(x => x.id === currentMachineDashboardId);
  if (!m) return;
  const insps = (state.data.inspections || []).filter(i => Number(i.machine_id) === Number(m.id));
  const content = document.getElementById('machine-dashboard-content');
  if (content) {
    const tabBody = content.querySelector('.p-6.overflow-y-auto');
    if (tabBody) {
      tabBody.innerHTML = renderMachineDashboardTabBody(m, insps, state.data.defects, {});
      if (window.lucide) window.lucide.createIcons();
      initMachineTrendChart(m, insps);
    }
  }
};

window.initMachineTrendChart = function(m, insps) {
  const canvas = document.getElementById('machineDetailTrendChart');
  if (!canvas || !window.Chart) return;
  if (machineDashboardChartInstance) {
    machineDashboardChartInstance.destroy();
    machineDashboardChartInstance = null;
  }

  const chronologicalInsps = insps.slice().reverse();
  const labels = [];
  const dataPoints = [];
  let unit = currentMachineMetric === 'f_vibration_rms' ? 'mm/s' : '°C';
  const warnLimit = currentMachineMetric === 'f_vibration_rms' ? 4.5 : 70;
  const critLimit = currentMachineMetric === 'f_vibration_rms' ? 7.1 : 80;

  for (const ins of chronologicalInsps) {
    const ans = (ins.answers || []).find(a => a.field_id === currentMachineMetric);
    if (ans && !isNaN(parseFloat(ans.value))) {
      labels.push(ins.inspected_at ? ins.inspected_at.slice(5, 16) : 'ล่าสุด');
      dataPoints.push(parseFloat(ans.value));
      if (ans.unit) unit = ans.unit;
    }
  }

  if (dataPoints.length === 0) {
    labels.push('ยังไม่มีการตรวจวัด');
    dataPoints.push(null);
  }

  const isDark = state.themeMode === 'dark';
  const chartTextColor = isDark ? '#94a3b8' : '#64748b';
  const chartGridColor = isDark ? '#1e293b' : '#f1f5f9';

  machineDashboardChartInstance = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: `ค่าที่วัดจริง (${unit})`,
          data: dataPoints,
          borderColor: '#059669',
          backgroundColor: 'rgba(5, 150, 105, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2.5,
          pointBackgroundColor: '#059669',
          pointRadius: 4
        },
        {
          label: `เกณฑ์เฝ้าระวัง (Warning: ${warnLimit} ${unit})`,
          data: labels.map(() => warnLimit),
          borderColor: '#f59e0b',
          borderDash: [5, 5],
          borderWidth: 1.5,
          pointRadius: 0,
          fill: false
        },
        {
          label: `เกณฑ์วิกฤต (Critical: ${critLimit} ${unit})`,
          data: labels.map(() => critLimit),
          borderColor: '#ef4444',
          borderDash: [3, 3],
          borderWidth: 1.5,
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
            font: { family: 'Prompt', size: 11 }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ${ctx.raw} ${unit}`
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
};

