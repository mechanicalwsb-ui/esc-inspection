/* Durable browser storage. Server cache and queue are separate from standalone data. */
(function () {
  let database; let pending = Promise.resolve(); let raw = null;
  function open() {
    if (database) return Promise.resolve(database);
    return new Promise((resolve, reject) => {
      const req = indexedDB.open('ESC_COMIS_V3', 1);
      req.onupgradeneeded = () => { for (const name of ['standalone', 'cache', 'queue']) if (!req.result.objectStoreNames.contains(name)) req.result.createObjectStore(name, { keyPath: 'id' }); };
      req.onerror = () => reject(new Error('เปิดพื้นที่เก็บข้อมูลไม่ได้ กรุณาเปิดสิทธิ์เก็บข้อมูลของเบราว์เซอร์'));
      req.onsuccess = () => { database = req.result; database.onversionchange = () => { database.close(); database = null; }; resolve(database); };
    });
  }
  async function operation(store, mode, action) {
    const db = await open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, mode); let value; const request = action(tx.objectStore(store));
      request.onsuccess = () => { value = request.result; };
      tx.oncomplete = () => resolve(value);
      tx.onerror = tx.onabort = () => reject(new Error('บันทึกข้อมูลในเครื่องไม่สำเร็จ พื้นที่อาจเต็ม กรุณาส่งออกข้อมูลหรือเพิ่มพื้นที่'));
    });
  }
  const get = (store, id) => operation(store, 'readonly', s => s.get(id));
  const put = (store, value) => operation(store, 'readwrite', s => s.put(value));
  const list = store => operation(store, 'readonly', s => s.getAll());
  const remove = (store, id) => operation(store, 'readwrite', s => s.delete(id));
  async function initialize() {
    const saved = await get('standalone', 'database');
    if (saved) raw = saved.data;
    else {
      const legacy = localStorage.getItem('ESC_COMIS_CENTER_DB_V2');
      if (legacy) { raw = JSON.parse(legacy); await put('standalone', { id: 'database', data: raw }); /* retain legacy until user verifies migration */ }
    }
  }
  function save(value) { const copy = JSON.parse(JSON.stringify(value)); pending = pending.catch(() => {}).then(async () => { await put('standalone', { id: 'database', data: copy }); raw = copy; }); return pending; }
  function requestId() { return Array.from(crypto.getRandomValues(new Uint8Array(20)), n => n.toString(16).padStart(2, '0')).join(''); }
  window.ComisStore = { initialize, get, put, list, remove, save, requestId, get raw() { return raw; }, get pending() { return pending; } };
})();
