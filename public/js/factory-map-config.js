// ============================================================================
// ESC Factory World — Isometric 3D Spatial Layout & Zone Configuration (v2.3.0)
// ============================================================================
// ที่ตั้งโรงงานจริง: บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) สาขาวังสมบูรณ์
// เลขที่ 1573 หมู่ที่ 1 ตำบลวังใหม่ อำเภอวังสมบูรณ์ จังหวัดสระแก้ว 27250
// อ้างอิงตามเอกสาร: logs/2026-09-25_codex_FACTORY_3D_CONCEPT_FOR_AGY.md
// และภาพถ่ายมุมสูง: public/assets/factory/esc-aerial-reference.jpg
// ============================================================================

const FACTORY_PLANT_INFO = {
  nameTh: 'บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) — สาขาวังสมบูรณ์',
  nameEn: 'Eastern Sugar & Cane Public Company Limited (Wang Sombun Complex)',
  coLocated: 'บริษัท อี เอส พลังงาน จำกัด (โรงไฟฟ้าชีวมวลพลังความร้อนร่วม)',
  address: '1573 หมู่ที่ 1 ตำบลวังใหม่ อำเภอวังสมบูรณ์ จังหวัดสระแก้ว 27250',
  shortAddress: '1573 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250',
  highway: 'ทางหลวงแผ่นดินหมายเลข 317 (สระแก้ว – จันทบุรี)',
  phone: '037-261-510',
  viewStyle: 'Isometric 3D Industrial Map (มุมมองไอโซเมตริก)'
};

const FACTORY_WORLD_PALETTE = {
  skyTop: '#CFE8DA',
  skyBottom: '#EEF6EF',
  groundMain: '#7FA96B',
  groundDark: '#567B47',
  groundField: '#8CB476',
  concreteYard: '#DDD6C9',
  asphaltDark: '#6E6A63',
  roadMain: '#918A7F',
  roadEdge: '#B9B1A5',
  brickPath: '#B86B52',
  waterShallow: '#6FA9B8',
  waterDeep: '#4B7F8F',
  buildingWhite: '#F4F1EA',
  buildingShadow: '#D9D3C7',
  roofSteel: '#B7C0C7',
  trimBlue: '#2B6CB0',
  buildingRed: '#CC625A',
  buildingRedRoof: '#9E4740',
  rearGreenRoof: '#4D946E',
  rearBlueWall: '#2E77AE',
  bagasseGold: '#C29B61',
  siloBlue: '#8EC5D6',
  horizonMist: '#B6CFCE',
  statusOk: '#2EAD6B',
  statusPending: '#E9A93B',
  statusDefect: '#E25555',
  statusNeutral: '#7B8793'
};

// โซนพื้นที่หลักในผังไอโซเมตริกโรงงาน (1573 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250)
// อ้างอิงตามคำยืนยันล่าสุดของผู้ใช้ใน USER_CONFIRMED_OVERRIDES.md
const FACTORY_ZONES = [
  {
    id: 'front-building',
    code: 'ZONE-A1',
    name: 'อาคารสำนักงาน (ตึกแดง)',
    shortName: 'อาคารสำนักงาน (ตึกแดง)',
    type: 'operational',
    nameVerified: true,
    description: 'อาคารสำนักงาน (ตึกแดง) เลขที่ 1573 หมู่ 1 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250 อาคารสีแดงโดดเด่นพร้อมกันสาดสีเทาเข้ม วงเวียนหน้าลาน และถนนทางเข้าหลัก (อ้างอิงภาพ 3, 17, 19)',
    center: { x: 2, y: 8, z: 34 },
    bounds: { w: 22, d: 16 },
    cameraTarget: { x: 2, y: 2, z: 32 },
    cameraZoom: 1.85,
    bays: ['อาคารสำนักงาน (ตึกแดง)', 'โถงต้อนรับและประสานงาน', 'ห้องระบบไฟฟ้าอาคาร']
  },
  {
    id: 'front-pond',
    code: 'LAND-W1',
    name: 'สระน้ำพักหน้าโครงการ & สวนภูมิทัศน์ (ฝั่งซ้ายทางเข้า)',
    shortName: 'สระน้ำพักหน้าโรงงาน',
    type: 'landmark',
    nameVerified: false,
    description: 'สระน้ำทรงโค้งมนด้านหน้าฝั่งซ้ายของถนนทางเข้า ล้อมรอบด้วยทางเดินอิฐสีน้ำตาลแดง สวนหย่อม และแนวต้นสนริมรั้ว (ไม่รวมชุดบ่อและท่อในภาพ 4, 5, 6, 8 และ VIS-11 ซึ่งตัดออกจากโมเดลแล้ว)',
    center: { x: -28, y: 4, z: 42 },
    bounds: { w: 26, d: 18 },
    cameraTarget: { x: -26, y: 0, z: 40 },
    cameraZoom: 1.75,
    bays: ['สถานีสูบน้ำดิบริมสระหน้า', 'จุดวัดระดับน้ำและคุณภาพน้ำหน้าโรงงาน']
  },
  {
    id: 'front-left-block',
    code: 'ZONE-A2',
    name: 'ด่านชั่งอ้อย (ซุ้ม ESC), อาคารซ่อมบำรุง & โรงจอดรถหน้าซ้าย',
    shortName: 'ด่านชั่งอ้อย & อาคารหน้าซ้าย',
    type: 'operational',
    nameVerified: false,
    description: 'ซุ้มหลังคาคร่อมถนนจุดชั่งน้ำหนักรถอ้อยพร้อมป้ายพุ่มไม้ "ESC" อาคารซ่อมบำรุงหลังคาจั่วขาว และโรงจอดรถฝั่งซ้าย (ผังถนนทางเข้าอ้างอิงภาพ 19–21 โดยตัดภาพ 18 และกลุ่มถังโลหะ 4 ใบของโรงงานอื่นออกตามคำยืนยันผู้ใช้)',
    center: { x: -34, y: 7, z: 20 },
    bounds: { w: 30, d: 22 },
    cameraTarget: { x: -32, y: 2, z: 20 },
    cameraZoom: 1.78,
    bays: ['ซุ้มตราชั่งรถอ้อยฝั่งซ้าย (ป้าย ESC)', 'อาคารซ่อมบำรุงและเครื่องมือกลหน้าซ้าย', 'ลานรับวัตถุดิบและโรงจอดรถหน้าซ้าย']
  },
  {
    id: 'production-west',
    code: 'ZONE-B1',
    name: 'โรงไฟฟ้าชีวมวล (อี เอส พลังงาน), หม้อไอน้ำแรงดันสูง & โกดังตะวันตก',
    shortName: 'โรงไฟฟ้าชีวมวล & หม้อไอน้ำ',
    type: 'operational',
    nameVerified: false,
    description: 'กลุ่มอาคารโรงไฟฟ้าพลังความร้อนร่วมจากชานอ้อย หม้อไอน้ำแรงดันสูง ถังทรงกระบอกแนวตั้งสีฟ้าอ่อน (คงรูปทรงตามภาพ 45 โดยไม่ใส่ป้ายชื่อ) ระบบดักฝุ่น ESP ปล่องสูง และโกดังน้ำตาลฝั่งซ้ายสุด',
    center: { x: -36, y: 17, z: -12 },
    bounds: { w: 36, d: 28 },
    cameraTarget: { x: -34, y: 5, z: -12 },
    cameraZoom: 1.55,
    bays: ['โถงหม้อไอน้ำแรงดันสูง (Boiler Hall)', 'โถงเทอร์ไบน์เครื่องกำเนิดไฟฟ้า (CHP)', 'ระบบดักฝุ่น ESP & ปล่องระบายความร้อนสูง', 'โกดังเก็บน้ำตาลทรายฝั่งตะวันตก']
  },
  {
    id: 'production-center',
    code: 'ZONE-B2',
    name: 'อาคารลูกหีบอ้อยหลัก, โถงต้มเคี่ยว-ปั่นน้ำตาล & รางดัมพ์อ้อย',
    shortName: 'อาคารลูกหีบ & เคี่ยวน้ำตาล',
    type: 'operational',
    nameVerified: false,
    description: 'โถงอาคารลูกหีบอ้อยแนวยาวขนาบลานกลาง อาคารต้มเคี่ยวและปั่นน้ำตาลหลายระดับชั้น อาคารแล็บด้านหน้า และรางดัมพ์อ้อยท้ายอาคาร',
    center: { x: -6, y: 18, z: -14 },
    bounds: { w: 38, d: 26 },
    cameraTarget: { x: -6, y: 5, z: -14 },
    cameraZoom: 1.5,
    bays: ['โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', 'อาคารต้มเคี่ยวและหม้อปั่นน้ำตาล (Centrifugal)', 'สะพานสายพานลำเลียงชานอ้อยหลัก', 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต']
  },
  {
    id: 'central-yard',
    code: 'ZONE-C1',
    name: 'ลานคอนกรีตกลางโรงงาน & ลานจอดรถบรรทุกอ้อย',
    shortName: 'ลานคอนกรีตกลางโรงงาน',
    type: 'operational',
    nameVerified: false,
    description: 'ลานคอนกรีตเสริมเหล็กเปิดโล่งขนาดใหญ่ใจกลางโรงงาน (1573 วังสมบูรณ์) สำหรับขนถ่ายอ้อย จุดติดตั้งปั๊มสนาม และเส้นทางเดินตรวจหลัก',
    center: { x: 6, y: 5, z: 8 },
    bounds: { w: 42, d: 28 },
    cameraTarget: { x: 6, y: 1, z: 8 },
    cameraZoom: 1.62,
    bays: ['ลานปั๊มน้ำหมุนเวียนกลางแจ้ง', 'สถานีอัดอากาศและท่อร่วมกลางลาน', 'ลานพักรถบรรทุกอ้อยและเครื่องจักรกลหนัก']
  },
  {
    id: 'water-east',
    code: 'ZONE-D1',
    name: 'กลุ่มบ่อบำบัดน้ำเสีย (บ่อปรับเสถียร), บ่อหล่อเย็น & อ่างเก็บน้ำดิบ',
    shortName: 'กลุ่มบ่อบำบัด & บ่อพักน้ำ (ขวา)',
    type: 'operational',
    nameVerified: false,
    description: 'ระบบจัดการน้ำมาตรฐานอุตสาหกรรมสีเขียว (Zero Discharge) ประกอบด้วยกลุ่มบ่อสี่เหลี่ยมหลายช่อง หอควบคุมน้ำสีฟ้า อ่างเก็บน้ำดิบด้านหลัง และถังโมลาส (ถังสีเหลืองตามภาพ 14, 39)',
    center: { x: 44, y: 5, z: -2 },
    bounds: { w: 32, d: 60 },
    cameraTarget: { x: 42, y: 1, z: -2 },
    cameraZoom: 1.42,
    bays: ['บ่อพักน้ำหล่อเย็นช่อง 1-3', 'บ่อปรับเสถียรและเติมอากาศช่อง 4-9', 'สถานีสูบน้ำหมุนเวียนและหอควบคุมน้ำสีฟ้า', 'ถังโมลาส']
  },
  {
    id: 'rear-block',
    code: 'ZONE-E1',
    name: 'ลานกองชานอ้อย (กำแพงกันฝุ่นสีน้ำเงิน) & อาคารคลังหลังคาเขียว',
    shortName: 'ลานชานอ้อยสีน้ำเงิน & คลังหลัง',
    type: 'operational',
    nameVerified: false,
    description: 'ลานเก็บชานอ้อยเชื้อเพลิงชีวมวลขนาดใหญ่ล้อมด้วยตาข่ายกันฝุ่นสีน้ำเงินและแนวต้นสนประดิพัทธ์ พร้อมอาคารคลังหลังคาเขียวด้านหลัง และลานแคบข้างลานกากอ้อย (คงพื้นที่ตามภาพ 27–29 โดยไม่ใส่ชื่อลาน)',
    center: { x: 8, y: 10, z: -42 },
    bounds: { w: 56, d: 22 },
    cameraTarget: { x: 8, y: 2, z: -40 },
    cameraZoom: 1.48,
    bays: ['ลานกองชานอ้อยในกรอบกำแพงกันฝุ่นสีน้ำเงิน', 'อาคารคลังหลังคาเขียวด้านหลัง', 'แนวสนกันลมและสถานีสูบน้ำท้ายโรงงาน']
  }
];

// มุมกล้องมาตรฐาน (Isometric Camera Presets)
const FACTORY_CAMERA_PRESETS = {
  overview: {
    id: 'overview',
    label: 'มุมไอโซเมตริกหลัก (Iso 45°)',
    icon: 'fa-cube',
    spherical: { theta: -0.54, phi: 0.92, radius: 132 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1.04
  },
  aerial: {
    id: 'aerial',
    label: 'มุมภาพถ่ายโดรน (1573 วังสมบูรณ์)',
    icon: 'fa-helicopter',
    spherical: { theta: 0.16, phi: 0.88, radius: 132 },
    target: { x: 0, y: 0, z: 0 },
    zoom: 1.02
  },
  production: {
    id: 'production',
    label: 'โซนโรงงานผลิต & โรงไฟฟ้า',
    icon: 'fa-industry',
    spherical: { theta: -0.44, phi: 0.84, radius: 125 },
    target: { x: -18, y: 4, z: -12 },
    zoom: 1.52
  },
  water: {
    id: 'water',
    label: 'โซนบ่อบำบัด & ลานชานอ้อย',
    icon: 'fa-water',
    spherical: { theta: 0.52, phi: 0.86, radius: 125 },
    target: { x: 28, y: 1, z: -8 },
    zoom: 1.38
  },
  topplan: {
    id: 'topplan',
    label: 'ผังบริเวณด้านบน (Top Plan)',
    icon: 'fa-map',
    spherical: { theta: 0.0, phi: 0.22, radius: 140 },
    target: { x: 0, y: 0, z: -2 },
    zoom: 0.96
  }
};


// ชั้นข้อมูลแผนที่ 3D (Layer Switcher & Dynamic Legend ตามเอกสารวิจัย P1-1)
const FACTORY_MAP_LAYERS = {
  health: {
    id: 'health',
    label: '🩺 สุขภาพเครื่องจักร',
    description: 'แยกสีตามผลตรวจสุขภาพล่าสุด (ปกติ / เฝ้าระวัง / ผิดปกติ) โดยไม่นำสถานะการเดินตรวจมาปน',
    legend: [
      { cls: 'bg-emerald-500', label: 'ปกติ (Normal)' },
      { cls: 'bg-amber-500', label: 'เฝ้าระวัง (Warning)' },
      { cls: 'bg-rose-500', label: 'ผิดปกติ/วิกฤต (Abnormal)' },
      { cls: 'bg-slate-400', label: 'ยังไม่ระบุพิกัดโซน' }
    ]
  },
  inspection: {
    id: 'inspection',
    label: '📋 สถานะตรวจเช็ควันนี้',
    description: 'แยกสีตามความครบถ้วนของการตรวจเช็คในวันที่เลือก (ตรวจครบทั้งฟอร์ม / ลงค่าด่วนบางจุด / รอเข้าตรวจ)',
    legend: [
      { cls: 'bg-emerald-500', label: 'ตรวจครบตามรอบแล้ว (Full Check)' },
      { cls: 'bg-amber-500', label: 'ลงค่าด่วนเฉพาะจุด (Partial / Quick Log)' },
      { cls: 'bg-slate-500', label: 'รอเข้าตรวจในวันนี้ (Pending Today)' }
    ]
  },
  defect: {
    id: 'defect',
    label: '🚨 ใบแจ้งซ่อม F-Tag',
    description: 'เน้นเฉพาะเครื่องจักรที่มีใบแจ้งซ่อมคงค้าง (Open / In Progress Defect Tickets)',
    legend: [
      { cls: 'bg-rose-500', label: 'มีใบแจ้งซ่อมคงค้าง (Open F-Tag)' },
      { cls: 'bg-emerald-500', label: 'ไม่มีใบแจ้งซ่อมค้าง (Clear)' }
    ]
  },
  freshness: {
    id: 'freshness',
    label: '🕒 ความสดใหม่ของข้อมูล',
    description: 'ตรวจสอบว่าเครื่องจักรใดมีข้อมูลตรวจเช็คล่าสุดภายใน 24 ชม. หรือข้อมูลเก่าค้างเกินกำหนด',
    legend: [
      { cls: 'bg-emerald-500', label: 'ข้อมูลสดใหม่ (< 24 ชม.)' },
      { cls: 'bg-amber-500', label: 'เริ่มเก่า (24–72 ชม.)' },
      { cls: 'bg-slate-500', label: 'ข้อมูลเก่า/ต้องอัปเดต (> 72 ชม.)' }
    ]
  },
  route: {
    id: 'route',
    label: '🗺️ ลำดับสายเดินตรวจ',
    description: 'แสดงเส้นเชื่อมลำดับจุดเดินตรวจเชิงผัง (Schematic Sequence) และความคืบหน้าของทีมช่างในกะนี้',
    legend: [
      { cls: 'bg-emerald-500', label: 'ตรวจเสร็จในรอบกะนี้แล้ว' },
      { cls: 'bg-amber-500', label: 'อยู่ในลำดับสายเดินตรวจที่เลือก' },
      { cls: 'bg-slate-400', label: 'ไม่อยู่ในสายเดินตรวจที่เลือก' }
    ]
  }
};

// ข้อมูลผังตำแหน่งเครื่องจักรจริงเริ่มต้น — แผนกลูกหีบ (ML) ในโซนอาคารลูกหีบ (production-center) ตามรหัสเครื่องจักรทางการ
const DEFAULT_MACHINE_PLACEMENTS = [
  // กลุ่มที่ 1: ระบบรับอ้อย ดั๊มพ์อ้อย และสะพานดั๊มพ์
  { machineCode: 'ML-TTP-01', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: -14, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-TTP-02', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: -11.5, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-TTP-03', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: -9, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-PUN-01', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: -6.5, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-CAR-01', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: -4, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-CAR-02', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: -1.5, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-SCC-01', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: 1, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-LFS-01', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: 3.5, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-SND-01', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: 6, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-SND-02', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: 8.5, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-KCK-01', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: 11, offsetZ: 9 }, locationVerified: true },
  { machineCode: 'ML-KCK-02', zoneId: 'production-center', bayLabel: 'รางดัมพ์อ้อยและอาคารปฏิบัติการหน้าโถงผลิต', anchorOffset: { offsetX: 13.5, offsetZ: 9 }, locationVerified: true },

  // กลุ่มที่ 2: ระบบสะพานเมน มีดสับอ้อย และเครื่องเชร็ดเดอร์
  { machineCode: 'ML-MCC-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: -14, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-PCT-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: -11.5, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-CUT-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: -9, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-CUT-02', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: -6.5, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-CUT-03', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: -4, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-CUT-04', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: -1.5, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-LFM-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 1, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-KCK-03', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 3.5, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-MAS-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 6, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-TUR-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 8.5, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-SHR-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 11, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-SHE-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 13.5, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-HSB-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 15.5, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-MAS-02', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 17.5, offsetZ: 3 }, locationVerified: true },
  { machineCode: 'ML-LFH-01', zoneId: 'production-center', bayLabel: 'สะพานสายพานลำเลียงชานอ้อยหลัก', anchorOffset: { offsetX: 19.5, offsetZ: 3 }, locationVerified: true },

  // กลุ่มที่ 3: ระบบชุดลูกหีบสกัดน้ำอ้อย สะพานข้ามชุด และโรตารี่สกรีน
  { machineCode: 'ML-INT-01', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: -14, offsetZ: -3 }, locationVerified: true },
  { machineCode: 'ML-INT-02', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: -11, offsetZ: -3 }, locationVerified: true },
  { machineCode: 'ML-INT-03', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: -8, offsetZ: -3 }, locationVerified: true },
  { machineCode: 'ML-RSC-01', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: -5, offsetZ: -3 }, locationVerified: true },
  { machineCode: 'ML-SCY-01', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: -2, offsetZ: -3 }, locationVerified: true },
  { machineCode: 'ML-MIL-02', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: 1, offsetZ: -3 }, locationVerified: true },
  { machineCode: 'ML-MIL-03', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: 4, offsetZ: -3 }, locationVerified: true },
  { machineCode: 'ML-MIL-04', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: 7, offsetZ: -3 }, locationVerified: true },
  { machineCode: 'ML-MIL-05', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: 10, offsetZ: -3 }, locationVerified: true },

  // กลุ่มที่ 4: เครนเหนือศีรษะและรอกไฟฟ้าประจำอาคารลูกหีบ
  { machineCode: 'ML-CRN-01', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: -10, offsetZ: -8 }, locationVerified: true },
  { machineCode: 'ML-CRN-02', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: -5, offsetZ: -8 }, locationVerified: true },
  { machineCode: 'ML-CRN-03', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: 0, offsetZ: -8 }, locationVerified: true },
  { machineCode: 'ML-OHC-10', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: 5, offsetZ: -8 }, locationVerified: true },
  { machineCode: 'ML-OHC-11', zoneId: 'production-center', bayLabel: 'โถงลูกหีบอ้อยชุดที่ 1-2 (Milling Tandem)', anchorOffset: { offsetX: 10, offsetZ: -8 }, locationVerified: true }
];

window.FACTORY_WORLD_CONFIG = {
  PLANT_INFO: FACTORY_PLANT_INFO,
  PALETTE: FACTORY_WORLD_PALETTE,
  ZONES: FACTORY_ZONES,
  CAMERA_PRESETS: FACTORY_CAMERA_PRESETS,
  MAP_LAYERS: FACTORY_MAP_LAYERS,
  DEFAULT_MACHINE_PLACEMENTS: DEFAULT_MACHINE_PLACEMENTS
};

