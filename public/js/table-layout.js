// Resizable table columns and stored layout preferences.
const TABLE_COL_WIDTHS_STORAGE_KEY = 'esc_comis_table_col_widths_v1';

function getStoredTableWidths(tableKey) {
  try {
    const raw = localStorage.getItem(TABLE_COL_WIDTHS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed[tableKey] || null;
  } catch (e) {
    return null;
  }
}

function saveStoredTableWidths(tableKey, widths) {
  try {
    const raw = localStorage.getItem(TABLE_COL_WIDTHS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[tableKey] = widths;
    localStorage.setItem(TABLE_COL_WIDTHS_STORAGE_KEY, JSON.stringify(parsed));
  } catch (e) {
    console.warn('Failed to save table widths:', e);
  }
}

function resetTableColumnWidths(tableKey) {
  try {
    const raw = localStorage.getItem(TABLE_COL_WIDTHS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    delete parsed[tableKey];
    localStorage.setItem(TABLE_COL_WIDTHS_STORAGE_KEY, JSON.stringify(parsed));
    showToast('🔄 คืนค่าความกว้างคอลัมน์ตารางเป็นค่าเริ่มต้นแล้ว', 'info');
    renderCurrentTab();
  } catch (e) {
    console.warn('Failed to reset table widths:', e);
  }
}

function autoFitTableColumns(tableKey, tableId = null) {
  try {
    let tbl = tableId ? document.getElementById(tableId) : null;
    if (!tbl) {
      tbl = document.querySelector(`table[data-resizable-key="${tableKey}"]`);
    }
    if (!tbl) {
      // If table element not in DOM, clear stored width so it defaults to auto
      resetTableColumnWidths(tableKey);
      return;
    }

    const thead = tbl.querySelector('thead');
    if (!thead) return;
    const thList = Array.from(thead.querySelectorAll('th'));
    if (thList.length === 0) return;

    // Temporarily switch to auto layout and measure natural widths
    tbl.style.tableLayout = 'auto';
    tbl.style.width = 'auto';
    thList.forEach(th => {
      th.style.width = 'auto';
    });

    // Sample first rows in tbody to get real text widths
    const rows = Array.from(tbl.querySelectorAll('tbody tr')).slice(0, 15);
    const measuredWidths = thList.map((th, colIdx) => {
      let maxW = th.scrollWidth || th.offsetWidth;
      for (const row of rows) {
        const cell = row.children[colIdx];
        if (cell) {
          maxW = Math.max(maxW, cell.scrollWidth || cell.offsetWidth);
        }
      }
      return Math.max(75, maxW + 24);
    });

    const container = tbl.parentElement;
    const availableWidth = container ? (container.clientWidth - 2) : window.innerWidth;
    const totalNatural = measuredWidths.reduce((a, b) => a + b, 0);

    let finalWidths = [];
    if (availableWidth > totalNatural) {
      // Scale proportionally to fill 100% of visible container
      const scale = availableWidth / totalNatural;
      finalWidths = measuredWidths.map(w => Math.floor(w * scale));
    } else {
      finalWidths = measuredWidths;
    }

    // Apply calculated widths & restore fixed layout
    tbl.style.width = '100%';
    tbl.style.tableLayout = 'fixed';
    thList.forEach((th, idx) => {
      th.style.width = finalWidths[idx] + 'px';
    });

    // Save to localStorage
    saveStoredTableWidths(tableKey, finalWidths);
    showToast('📐 ปรับขนาดคอลัมน์ตารางพอดีหน้าจอและเนื้อหาแล้ว', 'success');
  } catch (err) {
    console.error('Error auto-fitting table columns:', err);
    showToast('⚠️ ไม่สามารถปรับขนาดคอลัมน์ได้', 'error');
  }
}

function makeTableResizable(tableEl, tableKey) {
  if (!tableEl || !tableKey) return;
  tableEl.classList.add('table-resizable');
  tableEl.setAttribute('data-resizable-key', tableKey);

  const thead = tableEl.querySelector('thead');
  if (!thead) return;
  const thList = Array.from(thead.querySelectorAll('th'));
  if (thList.length === 0) return;

  const savedWidths = getStoredTableWidths(tableKey);

  // If saved widths exist, apply them immediately
  if (Array.isArray(savedWidths) && savedWidths.length === thList.length) {
    thList.forEach((th, idx) => {
      if (savedWidths[idx] && typeof savedWidths[idx] === 'number' && savedWidths[idx] > 30) {
        th.style.width = savedWidths[idx] + 'px';
      }
    });
  }

  // Attach resizer handles to each th (except last column if desired, or all columns)
  thList.forEach((th, colIdx) => {
    // Prevent duplicate handles
    if (th.querySelector('.col-resizer')) return;

    // Do not put resizer on last column
    if (colIdx === thList.length - 1) return;

    const resizer = document.createElement('div');
    resizer.className = 'col-resizer';
    resizer.title = 'คลิกแล้วลากเพื่อปรับขนาดคอลัมน์ (บันทึกอัตโนมัติ)';
    th.appendChild(resizer);

    let startX = 0;
    let startWidth = 0;
    let nextStartWidth = 0;
    const nextTh = thList[colIdx + 1];

    const startResize = function (pageX) {
      startX = pageX;
      startWidth = th.offsetWidth;
      nextStartWidth = nextTh ? nextTh.offsetWidth : 0;
      resizer.classList.add('is-resizing');
      document.body.classList.add('resizing-col');
    };

    const updateResize = function (pageX) {
      const deltaX = pageX - startX;
      const newWidth = Math.max(50, startWidth + deltaX);
      th.style.width = newWidth + 'px';
    };

    const stopResize = function () {
      resizer.classList.remove('is-resizing');
      document.body.classList.remove('resizing-col');
      const currentWidths = thList.map(item => Math.round(item.offsetWidth));
      saveStoredTableWidths(tableKey, currentWidths);
    };

    const onMouseDown = function (e) {
      e.preventDefault();
      e.stopPropagation();
      startResize(e.pageX);

      const onMouseMove = function (moveEvent) {
        updateResize(moveEvent.pageX);
      };

      const onMouseUp = function () {
        stopResize();
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onTouchStart = function (e) {
      if (!e.touches || e.touches.length === 0) return;
      e.stopPropagation();
      startResize(e.touches[0].pageX);

      const onTouchMove = function (moveEvent) {
        if (!moveEvent.touches || moveEvent.touches.length === 0) return;
        moveEvent.preventDefault();
        updateResize(moveEvent.touches[0].pageX);
      };

      const onTouchEnd = function () {
        stopResize();
        document.removeEventListener('touchmove', onTouchMove);
        document.removeEventListener('touchend', onTouchEnd);
        document.removeEventListener('touchcancel', onTouchEnd);
      };

      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
      document.addEventListener('touchcancel', onTouchEnd);
    };

    resizer.addEventListener('mousedown', onMouseDown);
    resizer.addEventListener('touchstart', onTouchStart, { passive: true });
  });
}

function initAllResizableTables(container = document) {
  const tables = container.querySelectorAll('table[data-resizable-key]');
  tables.forEach(tbl => {
    const key = tbl.getAttribute('data-resizable-key');
    if (key) makeTableResizable(tbl, key);
  });
}

// Expose globally
window.makeTableResizable = makeTableResizable;
window.initAllResizableTables = initAllResizableTables;
window.resetTableColumnWidths = resetTableColumnWidths;
window.autoFitTableColumns = autoFitTableColumns;

// ============================================================================
// SEARCH INPUT DEBOUNCE HELPER
// ============================================================================
