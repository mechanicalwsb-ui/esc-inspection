const { exec } = require('node:child_process');
const path = require('node:path');

// เปิดเบราว์เซอร์ไปยัง http://localhost:3000 อัตโนมัติ และรันเซิร์ฟเวอร์
exec('start "" "http://localhost:3000"');
require(path.join(__dirname, 'server.js'));
