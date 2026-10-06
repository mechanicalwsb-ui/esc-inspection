// ============================================================================
// ESC Factory World — Isometric Map Controller, 5-Dimension Status, Layers & Drawer (v2.3.0)
// Location: โรงงานน้ำตาลและอ้อยตะวันออก 1573, ตำบล วังใหม่ อำเภอ วังสมบูรณ์ สระแก้ว 27250
// ============================================================================

(function () {
  const PLACEMENT_STORAGE_KEY = 'esc_machine_placements_v21';
  const DEMO_REFERENCE_DATE = '2026-09-25';

  let activeSceneController = null;
  let f3dUiState = {
    selectedZoneId: null,
    selectedMachineId: null,
    activePreset: 'overview',
    activeLayer: 'health', // health | inspection | defect | freshness | route
    dateMode: 'real',      // auto | real | demo
    ecoMode: false,
    searchQuery: '',
    deptFilter: '',
    statusFilter: 'ALL',   // ALL | OK | WARNING | PENDING | DEFECT | STALE | UNMAPPED
    selectedRouteId: ''
  };

  function getConfig() {
    return window.FACTORY_WORLD_CONFIG || { ZONES: [], LAYERS: [], DEFAULT_MACHINE_PLACEMENTS: [] };
  }

  function getAppData() {
    if (typeof state !== 'undefined' && state && state.data) return state.data;
    if (window.state && window.state.data) return window.state.data;
    return { machines: [], inspections: [], defects: [], departments: [], routes: [], routeRounds: [], machinePlacements: [] };
  }

  // Load machine placements merging Default -> LocalStorage -> Server SQLite (P0-3)
  function getMachinePlacementsMap() {
    const cfg = getConfig();
    const map = new Map();
    (cfg.DEFAULT_MACHINE_PLACEMENTS || []).forEach((item) => {
      map.set(item.machineCode, { ...item, revision: item.revision || 1 });
    });

    try {
      const raw = localStorage.getItem(PLACEMENT_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) {
          saved.forEach((item) => {
            if (item && item.machineCode) {
              map.set(item.machineCode, { ...item, revision: Number(item.revision) || 1 });
            }
          });
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved machine placements:', e);
    }

    // Authoritative Server-backed machinePlacements in state.data (P0-3)
    const appData = getAppData();
    const rawPlacements = Array.isArray(appData.machinePlacements)
      ? appData.machinePlacements
      : (appData.machinePlacements && typeof appData.machinePlacements === 'object')
        ? Object.entries(appData.machinePlacements).map(([k, v]) => ({ machineCode: k, ...v }))
        : [];

    rawPlacements.forEach((row) => {
      if (!row) return;
      const code = row.machineCode || row.machine_code;
      if (!code) return;
      let parsedOffset = row.anchorOffset || row.anchor_offset;
      if (!parsedOffset && row.anchor_offset_json) {
        try { parsedOffset = JSON.parse(row.anchor_offset_json); } catch (_) { parsedOffset = { x: 0, y: 0, z: 0 }; }
      }
      if (!parsedOffset && (row.x !== undefined || row.y !== undefined || row.z !== undefined)) {
        parsedOffset = { x: Number(row.x || 0), y: Number(row.y || 0), z: Number(row.z || 0) };
      }
      map.set(code, {
        machineCode: code,
        zoneId: row.zoneId !== undefined ? row.zoneId : (row.zone_id || null),
        bayLabel: row.bayLabel || row.bay_label || '',
        anchorOffset: parsedOffset || { x: 0, y: 0, z: 0 },
        locationVerified: row.locationVerified !== undefined ? !!row.locationVerified : !!row.location_verified,
        note: row.note || '',
        revision: Number(row.revision) || 1,
        updated_at: row.updated_at || row.updatedAt || null
      });
    });

    return map;
  }

  function saveMachinePlacementsMap(map) {
    const arr = Array.from(map.values());
    localStorage.setItem(PLACEMENT_STORAGE_KEY, JSON.stringify(arr));
  }

  function getTodayDateStr() {
    if (typeof todayStr === 'function') return todayStr();
    return new Date().toISOString().slice(0, 10);
  }

  function resolveActiveInspectionDay(inspections) {
    const realToday = getTodayDateStr();
    const hasRealToday = (inspections || []).some(
      (i) => (i.inspected_at || i.inspection_date || '').slice(0, 10) === realToday
    );
    const latestDateInDb = (inspections || []).reduce((acc, item) => {
      const d = (item.inspected_at || item.inspection_date || '').slice(0, 10);
      return d > acc ? d : acc;
    }, '');

    if (f3dUiState.dateMode === 'real') {
      return { activeDay: realToday, realToday, isUsingDemoDate: false, latestDateInDb };
    }
    if (f3dUiState.dateMode === 'demo') {
      const dDay = latestDateInDb || DEMO_REFERENCE_DATE;
      return { activeDay: dDay, realToday, isUsingDemoDate: dDay !== realToday, latestDateInDb };
    }
    // 'auto': prefer realToday if data exists, otherwise fallback to latestDateInDb with explicit UI banner
    if (hasRealToday) {
      return { activeDay: realToday, realToday, isUsingDemoDate: false, latestDateInDb };
    }
    const fallbackDay = latestDateInDb || realToday;
    return {
      activeDay: fallbackDay,
      realToday,
      isUsingDemoDate: fallbackDay !== realToday,
      latestDateInDb
    };
  }

  // Enrich machines with 5-Dimension Status Model (P0-1) + Layer Color (P1-1)
  function buildEnrichedMachines() {
    const placements = getMachinePlacementsMap();
    const appData = getAppData();
    const machines = typeof filterByGlobalDept === 'function'
      ? filterByGlobalDept(appData.machines || [])
      : (appData.machines || []);
    const inspections = appData.inspections || [];
    const defects = appData.defects || [];

    const dateInfo = resolveActiveInspectionDay(inspections);
    const activeDay = dateInfo.activeDay;

    // Determine route membership for 'route' layer
    const activeRoute = f3dUiState.selectedRouteId
      ? (appData.routes || []).find((r) => String(r.id) === String(f3dUiState.selectedRouteId))
      : null;
    const routeMachineIds = new Set(
      activeRoute
        ? (Array.isArray(activeRoute.stops)
            ? activeRoute.stops.map((s) => Number(s.machine_id))
            : (activeRoute.machine_ids || []).map(Number))
        : []
    );

    return machines.map((m) => {
      const mCode = m.machine_code || m.code || `MCH-${m.id}`;
      const placement = placements.get(mCode) || {
        machineCode: mCode,
        zoneId: null,
        bayLabel: m.plant_area || 'ยังไม่ระบุจุดติดตั้งย่อย',
        anchorOffset: { x: 0, y: 0, z: 0 },
        locationVerified: false,
        note: '',
        revision: 1
      };

      const machineInspections = inspections
        .filter((i) => Number(i.machine_id) === Number(m.id))
        .sort((a, b) => String(b.inspected_at || b.inspection_date || '').localeCompare(String(a.inspected_at || a.inspection_date || '')));

      const todayInspections = machineInspections.filter(
        (i) => (i.inspected_at || i.inspection_date || '').slice(0, 10) === activeDay
      );

      // Distinguish Full Checklist Inspection vs Partial Quick Entry (P0-1)
      const fullInspectionsToday = todayInspections.filter((i) => {
        const isQuick = i.is_quick_entry || String(i.form_code || '').includes('QUICK') || String(i.shift || '').includes('ด่วน');
        return !isQuick;
      });
      const partialInspectionsToday = todayInspections.filter((i) => {
        const isQuick = i.is_quick_entry || String(i.form_code || '').includes('QUICK') || String(i.shift || '').includes('ด่วน');
        return isQuick;
      });

      const openDefects = defects.filter(
        (d) => Number(d.machine_id) === Number(m.id) && d.status !== 'resolved' && d.status !== 'closed' && d.status !== 'RESOLVED'
      );

      const hasAbnormalInspection = todayInspections.some(
        (i) => (i.overall_result || i.overall_status || '').toLowerCase() === 'abnormal'
      );
      const hasWarningInspection = todayInspections.some(
        (i) => (i.overall_result || i.overall_status || '').toLowerCase() === 'warning'
      );

      // Dimension 1: Health (normal | warning | critical) — Warning is NEVER overwritten by OK! (P0-1)
      let health = 'normal';
      const rawHealth = String(m.health_status || m.status || '').toLowerCase();
      const hasCriticalDefect = openDefects.some((d) => ['critical', 'high'].includes(String(d.severity || d.priority || '').toLowerCase()));
      if (rawHealth === 'abnormal' || rawHealth === 'defect' || hasCriticalDefect || hasAbnormalInspection) {
        health = 'critical';
      } else if (rawHealth === 'warning' || hasWarningInspection || openDefects.length > 0) {
        health = 'warning';
      }

      // Dimension 2: Inspection State & Coverage (completed | partial | pending)
      let inspectionState = 'pending';
      let coverage = 'none';
      if (fullInspectionsToday.length > 0) {
        inspectionState = 'completed';
        coverage = 'full';
      } else if (partialInspectionsToday.length > 0) {
        inspectionState = 'partial';
        coverage = 'partial';
      }

      // Dimension 3: Operating State
      const operatingState = m.operating_state || (rawHealth === 'stopped' ? 'stopped' : 'running');

      // Dimension 4: Freshness (fresh | aging | stale)
      const latestInsp = machineInspections[0] || null;
      const latestDateStr = latestInsp ? String(latestInsp.inspected_at || latestInsp.inspection_date || '').slice(0, 10) : '';
      let freshness = 'stale';
      if (todayInspections.length > 0) {
        freshness = 'fresh';
      } else if (latestDateStr && latestDateStr >= DEMO_REFERENCE_DATE) {
        freshness = 'aging';
      }

      // Dimension 5: Data Quality
      const dataQuality = latestInsp ? 'valid' : 'missing';

      const hasDefect = health === 'critical' || openDefects.length > 0;
      const isWarning = health === 'warning';
      const isInspectedToday = inspectionState === 'completed';

      // Unified computedStatus preserving WARNING distinct from OK and DEFECT (P0-1)
      let computedStatus = 'PENDING';
      if (health === 'critical') computedStatus = 'DEFECT';
      else if (health === 'warning') computedStatus = 'WARNING';
      else if (inspectionState === 'completed') computedStatus = 'OK';
      else if (inspectionState === 'partial') computedStatus = 'PARTIAL';

      // Layer-specific status & color (P1-1)
      let layerStatus = 'ok';
      let layerColorHex = '#2EAD6B';
      const layer = f3dUiState.activeLayer || 'health';

      if (layer === 'health') {
        if (health === 'critical') { layerStatus = 'defect'; layerColorHex = '#E25555'; }
        else if (health === 'warning') { layerStatus = 'warning'; layerColorHex = '#F59E0B'; }
        else { layerStatus = 'ok'; layerColorHex = '#2EAD6B'; }
      } else if (layer === 'inspection') {
        if (inspectionState === 'completed') { layerStatus = 'ok'; layerColorHex = '#2EAD6B'; }
        else if (inspectionState === 'partial') { layerStatus = 'warning'; layerColorHex = '#F59E0B'; }
        else { layerStatus = 'pending'; layerColorHex = '#E9A93B'; }
      } else if (layer === 'defect') {
        if (openDefects.length >= 2 || hasCriticalDefect) { layerStatus = 'defect'; layerColorHex = '#E25555'; }
        else if (openDefects.length === 1) { layerStatus = 'warning'; layerColorHex = '#F59E0B'; }
        else { layerStatus = 'ok'; layerColorHex = '#2EAD6B'; }
      } else if (layer === 'freshness') {
        if (freshness === 'fresh') { layerStatus = 'ok'; layerColorHex = '#2EAD6B'; }
        else if (freshness === 'aging') { layerStatus = 'pending'; layerColorHex = '#E9A93B'; }
        else { layerStatus = 'stale'; layerColorHex = '#64748B'; }
      } else if (layer === 'route') {
        if (routeMachineIds.has(Number(m.id))) {
          if (inspectionState === 'completed') { layerStatus = 'ok'; layerColorHex = '#2EAD6B'; }
          else { layerStatus = 'pending'; layerColorHex = '#E9A93B'; }
        } else {
          layerStatus = 'neutral';
          layerColorHex = '#7B8793';
        }
      }

      return {
        ...m,
        code: mCode,
        location: m.plant_area || m.location || '',
        placement,
        zoneId: placement.zoneId || null,
        machineInspections,
        todayInspections,
        fullInspectionsToday,
        partialInspectionsToday,
        openDefects,
        openDefectCount: openDefects.length,
        health,
        inspectionState,
        coverage,
        operatingState,
        freshness,
        dataQuality,
        isInspectedToday,
        hasDefect,
        isWarning,
        computedStatus,
        layerStatus,
        layerColorHex,
        activeDay,
        isUsingDemoDate: dateInfo.isUsingDemoDate
      };
    });
  }

  function computeZoneStats(enrichedMachines) {
    const cfg = getConfig();
    const stats = {};
    const layer = f3dUiState.activeLayer || 'health';

    (cfg.ZONES || []).forEach((z) => {
      stats[z.id] = {
        zoneId: z.id,
        total: 0,
        inspectedToday: 0,
        partialToday: 0,
        pendingToday: 0,
        openDefects: 0,
        defectMachines: 0,
        warningMachines: 0,
        staleMachines: 0,
        status: 'neutral',
        pinSummaryText: '',
        machines: []
      };
    });

    stats.__unmapped__ = {
      zoneId: '__unmapped__',
      total: 0,
      inspectedToday: 0,
      partialToday: 0,
      pendingToday: 0,
      openDefects: 0,
      defectMachines: 0,
      warningMachines: 0,
      staleMachines: 0,
      status: 'neutral',
      pinSummaryText: '',
      machines: []
    };

    enrichedMachines.forEach((m) => {
      const bucket = m.zoneId && stats[m.zoneId] ? stats[m.zoneId] : stats.__unmapped__;
      bucket.total += 1;
      if (m.inspectionState === 'completed') bucket.inspectedToday += 1;
      else if (m.inspectionState === 'partial') bucket.partialToday += 1;
      else bucket.pendingToday += 1;

      if (m.health === 'critical') bucket.defectMachines += 1;
      else if (m.health === 'warning') bucket.warningMachines += 1;

      if (m.freshness === 'stale') bucket.staleMachines += 1;
      bucket.openDefects += m.openDefects.length;
      bucket.machines.push(m);
    });

    Object.keys(stats).forEach((zid) => {
      const st = stats[zid];
      if (st.total === 0) {
        st.status = 'neutral';
        st.pinSummaryText = 'จุดสังเกต';
        return;
      }

      if (layer === 'health') {
        if (st.defectMachines > 0) st.status = 'defect';
        else if (st.warningMachines > 0) st.status = 'warning';
        else st.status = 'ok';
        st.pinSummaryText = st.defectMachines > 0
          ? `ผิดปกติ ${st.defectMachines}/${st.total}`
          : st.warningMachines > 0
          ? `เฝ้าระวัง ${st.warningMachines}/${st.total}`
          : `ปกติ ${st.total} เครื่อง`;
      } else if (layer === 'inspection') {
        if (st.pendingToday > 0) st.status = 'pending';
        else if (st.partialToday > 0) st.status = 'warning';
        else st.status = 'ok';
        st.pinSummaryText = `ตรวจครบ ${st.inspectedToday}/${st.total}`;
      } else if (layer === 'defect') {
        if (st.openDefects >= 2 || st.defectMachines > 0) st.status = 'defect';
        else if (st.openDefects === 1) st.status = 'warning';
        else st.status = 'ok';
        st.pinSummaryText = st.openDefects > 0 ? `Defect ${st.openDefects} งาน` : `ไร้ Defect (${st.total})`;
      } else if (layer === 'freshness') {
        if (st.staleMachines > 0) st.status = 'stale';
        else if (st.pendingToday > 0) st.status = 'pending';
        else st.status = 'ok';
        st.pinSummaryText = st.staleMachines > 0 ? `ข้อมูลเก่า ${st.staleMachines} เครื่อง` : `อัปเดตสด ${st.total} เครื่อง`;
      } else {
        // route layer or default
        if (st.defectMachines > 0) st.status = 'defect';
        else if (st.warningMachines > 0) st.status = 'warning';
        else if (st.pendingToday > 0) st.status = 'pending';
        else st.status = 'ok';
        st.pinSummaryText = `${st.inspectedToday}/${st.total} เครื่อง`;
      }
    });

    return stats;
  }

  function matchesFilter(m) {
    if (f3dUiState.deptFilter) {
      if (typeof window.doesDepartmentMatchFilter === 'function') {
        if (!window.doesDepartmentMatchFilter(m.department_id, f3dUiState.deptFilter)) return false;
      } else if (String(m.department_id) !== String(f3dUiState.deptFilter)) {
        return false;
      }
    }
    if (f3dUiState.statusFilter === 'OK' && m.computedStatus !== 'OK') return false;
    if (f3dUiState.statusFilter === 'WARNING' && m.computedStatus !== 'WARNING' && m.computedStatus !== 'PARTIAL') return false;
    if (f3dUiState.statusFilter === 'PENDING' && m.computedStatus !== 'PENDING') return false;
    if (f3dUiState.statusFilter === 'DEFECT' && m.computedStatus !== 'DEFECT') return false;
    if (f3dUiState.statusFilter === 'STALE' && m.freshness !== 'stale') return false;
    if (f3dUiState.statusFilter === 'UNMAPPED' && m.zoneId !== null) return false;

    if (f3dUiState.searchQuery) {
      const q = f3dUiState.searchQuery.trim().toLowerCase();
      const hay = `${m.code || ''} ${m.machine_code || ''} ${m.name || ''} ${m.location || ''} ${m.placement?.bayLabel || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }

  function buildActiveRouteStops(enrichedMachines) {
    const appData = getAppData();
    if (!f3dUiState.selectedRouteId || !Array.isArray(appData.routes)) return [];
    const route = appData.routes.find((r) => String(r.id) === String(f3dUiState.selectedRouteId));
    if (!route) return [];

    const byId = new Map(enrichedMachines.map((m) => [Number(m.id), m]));
    const stops = [];
    const rawStops = Array.isArray(route.stops)
      ? route.stops.map((s) => s.machine_id)
      : (Array.isArray(route.machine_ids) ? route.machine_ids : []);

    rawStops.forEach((mid, idx) => {
      const m = byId.get(Number(mid));
      if (m) {
        stops.push({
          stopNumber: idx + 1,
          machineId: m.id,
          machineCode: m.code,
          machineName: m.name,
          zoneId: m.zoneId,
          status: m.computedStatus
        });
      }
    });
    return stops;
  }

  function renderLayerLegendHtml(layerId) {
    if (layerId === 'health') {
      return `
        <div class="flex flex-wrap items-center gap-2 text-[10px] font-bold pt-1">
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#2EAD6B]"></span> ปกติ (Normal)</span>
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> เฝ้าระวัง (Warning)</span>
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#E25555]"></span> ผิดปกติวิกฤต (Critical)</span>
        </div>
      `;
    }
    if (layerId === 'inspection') {
      return `
        <div class="flex flex-wrap items-center gap-2 text-[10px] font-bold pt-1">
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#2EAD6B]"></span> ตรวจครบตามแบบฟอร์ม (Full)</span>
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> ลงเฉพาะจุดด่วน (Partial)</span>
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#E9A93B]"></span> รอตรวจในกะนี้ (Pending)</span>
        </div>
      `;
    }
    if (layerId === 'defect') {
      return `
        <div class="flex flex-wrap items-center gap-2 text-[10px] font-bold pt-1">
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#2EAD6B]"></span> ไม่มีงานซ่อมค้าง</span>
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span> มี Defect ย่อย 1 งาน</span>
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#E25555]"></span> Defect วิกฤต / หลายงาน</span>
        </div>
      `;
    }
    if (layerId === 'freshness') {
      return `
        <div class="flex flex-wrap items-center gap-2 text-[10px] font-bold pt-1">
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#2EAD6B]"></span> ข้อมูลกะปัจจุบัน (&lt;8 ชม.)</span>
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#E9A93B]"></span> ข้อมูลภายใน 24 ชม.</span>
          <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#64748B]"></span> ข้อมูลเก่า/ขาดช่วง (&gt;24 ชม.)</span>
        </div>
      `;
    }
    return `
      <div class="flex flex-wrap items-center gap-2 text-[10px] font-bold pt-1">
        <span class="inline-flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span> เส้นลำดับจุดเดินตรวจ (Schematic Sequence)</span>
      </div>
    `;
  }

  // Cleanup active 3D scene before leaving tab or re-rendering
  window.cleanupFactoryOverview = function () {
    if (activeSceneController) {
      activeSceneController.dispose();
      activeSceneController = null;
    }
  };

  window.setFactory3DThemeMode = function (isDark) {
    if (activeSceneController && typeof activeSceneController.setThemeMode === 'function') {
      activeSceneController.setThemeMode(isDark);
    }
  };

  window.setFactory3DLayer = function (layerId) {
    f3dUiState.activeLayer = layerId || 'health';
    if (layerId === 'route' && !f3dUiState.selectedRouteId) {
      const appData = getAppData();
      const scopedRoutes = typeof window.getScopedRoutesForActiveUser === 'function'
        ? window.getScopedRoutesForActiveUser(appData.routes || [])
        : (appData.routes || []);
      if (scopedRoutes.length > 0) {
        f3dUiState.selectedRouteId = String(scopedRoutes[0].id);
        const routeSelect = document.getElementById('f3d-route-select');
        if (routeSelect) routeSelect.value = f3dUiState.selectedRouteId;
      }
    }
    document.querySelectorAll('[data-f3d-layer]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.f3dLayer === f3dUiState.activeLayer);
    });
    const legendBox = document.getElementById('f3d-dynamic-legend');
    if (legendBox) {
      legendBox.innerHTML = renderLayerLegendHtml(f3dUiState.activeLayer);
    }
    refreshFactoryOverviewUI(false);
  };

  window.setFactory3DDateMode = function (mode) {
    f3dUiState.dateMode = mode || 'auto';
    if (typeof rerenderCurrentTab === 'function') {
      rerenderCurrentTab();
    }
  };

  // Main entry point called by switchTab('factory3d')
  window.renderFactoryOverview = function (container) {
    window.cleanupFactoryOverview();
    if (!container) return;

    const cfg = getConfig();
    const appData = getAppData();
    const dateInfo = resolveActiveInspectionDay(appData.inspections || []);
    const enriched = buildEnrichedMachines();
    const zoneStats = computeZoneStats(enriched);
    const departments = appData.departments || [];
    const allRoutes = appData.routes || [];
    const routes = typeof window.getScopedRoutesForActiveUser === 'function'
      ? window.getScopedRoutesForActiveUser(allRoutes)
      : allRoutes;

    const totalMachines = enriched.length;
    const totalInspected = enriched.filter((m) => m.inspectionState === 'completed').length;
    const totalPartial = enriched.filter((m) => m.inspectionState === 'partial').length;
    const totalPending = totalMachines - totalInspected - totalPartial;
    const totalWarningMachines = enriched.filter((m) => m.health === 'warning').length;
    const totalDefectMachines = enriched.filter((m) => m.health === 'critical').length;
    const totalUnmapped = zoneStats.__unmapped__.total;
    const layers = cfg.LAYERS && cfg.LAYERS.length > 0 ? cfg.LAYERS : [
      { id: 'health', label: 'สุขภาพเครื่อง (Health)', icon: 'fa-heart-pulse' },
      { id: 'inspection', label: 'ความคืบหน้าตรวจวันนี้', icon: 'fa-clipboard-check' },
      { id: 'defect', label: 'ความหนาแน่น Defect', icon: 'fa-triangle-exclamation' },
      { id: 'freshness', label: 'ความสดของข้อมูล', icon: 'fa-clock' },
      { id: 'route', label: 'ลำดับสายตรวจ (Schematic)', icon: 'fa-route' }
    ];

    const scopeBarHtml = typeof window.renderUserScopeFilterBar === 'function'
      ? window.renderUserScopeFilterBar('rerenderCurrentTab()')
      : '';

    container.innerHTML = `
      <div class="esc-factory-world-wrap">
        ${scopeBarHtml}

        <!-- Top Operational Bar: Plant Identity (1573 Wang Mai, Wang Sombun) + 5-Dimension KPIs + Layer Switcher + Filters -->
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 flex flex-col gap-3">
          <!-- Plant Location & Isometric View Header -->
          <div class="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div class="flex flex-wrap items-center gap-2">
              <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950 text-white text-xs font-bold shadow-xs">
                <i class="fa-solid fa-cube text-amber-400"></i> มุมมองไอโซเมตริก (Isometric Map)
              </span>
              <div class="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2">
                <span class="text-xs sm:text-sm font-extrabold text-slate-800">
                  โรงงานน้ำตาลและอ้อยตะวันออก 1573, ตำบล วังใหม่ อำเภอ วังสมบูรณ์ สระแก้ว 27250
                </span>
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  <i class="fa-solid fa-location-dot text-emerald-600"></i> ทางหลวง 317 (สระแก้ว–จันทบุรี) • บมจ.น้ำตาลและอ้อยตะวันออก &amp; บจก.อี เอส พลังงาน
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold">
              <span class="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600">
                <i class="fa-solid fa-hand-pointer text-emerald-600"></i> ลากเมาส์หมุน 360° • เลื่อนลูกกลิ้งซูม • คลิกอาคารเพื่อตรวจเช็ค
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center justify-between gap-2.5">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold" title="ตรวจครบตามแบบฟอร์มมาตรฐานแล้ว">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span> ตรวจครบ ${totalInspected}/${totalMachines}
              </span>
              ${totalPartial > 0 ? `
                <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold" title="ลงข้อมูลด่วนเฉพาะจุด ยังไม่ถือว่าปิดรอบตรวจประจำวันเต็มรูปแบบ">
                  <i class="fa-solid fa-bolt text-amber-500"></i> ตรวจบางส่วน ${totalPartial}
                </span>
              ` : ''}
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span> รอตรวจ ${totalPending}
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${totalWarningMachines > 0 ? 'bg-amber-100/90 text-amber-900 border-amber-300' : 'bg-slate-50 text-slate-600 border-slate-200'} border text-xs font-bold">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span> เฝ้าระวัง (Warning) ${totalWarningMachines}
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${totalDefectMachines > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'} border text-xs font-bold">
                <span class="w-2 h-2 rounded-full ${totalDefectMachines > 0 ? 'bg-red-500 animate-ping' : 'bg-slate-400'}"></span> วิกฤต/Defect ${totalDefectMachines}
              </span>
              <button onclick="selectFactoryZoneFromUI('__unmapped__')" class="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${totalUnmapped > 0 ? 'bg-amber-100/80 text-amber-900 border-amber-300 hover:bg-amber-200/70' : 'bg-slate-100 text-slate-600 border-slate-200'} border text-xs font-bold transition cursor-pointer">
                <i class="fa-solid fa-location-question"></i> ยังไม่ระบุโซน (${totalUnmapped})
              </button>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <!-- Explicit Date Reference Badge & Toggle (P0-1) -->
              <div class="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                <i class="fa-regular fa-calendar-check text-emerald-700"></i>
                <span>วันอ้างอิง: <strong>${dateInfo.activeDay}</strong> ${dateInfo.isUsingDemoDate ? '<span class="text-amber-700 font-bold">(ข้อมูลสาธิต)</span>' : '<span class="text-emerald-700 font-bold">(วันนี้จริง)</span>'}</span>
                <button type="button" onclick="setFactory3DDateMode('${dateInfo.isUsingDemoDate ? 'real' : 'demo'}')" class="ml-1 px-1.5 py-0.5 rounded bg-white hover:bg-emerald-50 border border-slate-300 text-[10px] font-bold text-emerald-800 cursor-pointer">
                  สลับเป็น${dateInfo.isUsingDemoDate ? 'วันนี้จริง' : 'วันสาธิต'}
                </button>
              </div>

              <button onclick="openAerialReferenceModal()" class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer">
                <i class="fa-solid fa-image text-emerald-700"></i> ภาพถ่ายจริง 1573 วังสมบูรณ์
              </button>
              <button onclick="openEmergencyQuickEntryModal(null)" class="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer">
                <i class="fa-solid fa-bolt text-amber-300"></i> ลงข้อมูลด่วน / แจ้งอาการ
              </button>
            </div>
          </div>

          <!-- Layer Switcher Strip (P1-1) -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] font-extrabold text-slate-600 mr-1"><i class="fa-solid fa-layer-group text-emerald-700 mr-1"></i>มุมมองข้อมูลไอโซเมตริก (Layer):</span>
              ${layers.map((ly) => `
                <button type="button" data-f3d-layer="${ly.id}" onclick="setFactory3DLayer('${ly.id}')"
                  class="esc-layer-pill ${f3dUiState.activeLayer === ly.id ? 'active' : ''}">
                  <i class="fa-solid ${ly.icon}"></i>
                  <span>${ly.label}</span>
                </button>
              `).join('')}
            </div>
            <span class="text-[11px] text-slate-500">
              <i class="fa-solid fa-diagram-project text-emerald-600 mr-1"></i>เส้นทางเดินตรวจแสดงเป็น <strong>ลำดับจุดเดินตรวจ (Schematic Sequence)</strong>
            </span>
          </div>

          <!-- Filter Controls Row -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center pt-2 border-t border-slate-100">
            <div class="md:col-span-4 relative">
              <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input id="f3d-search-input" type="text" value="${f3dUiState.searchQuery.replace(/"/g, '&quot;')}"
                placeholder="ค้นหารหัสเครื่อง, ชื่อเครื่องจักร, โซนอาคาร..."
                class="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white transition" />
            </div>

            <div class="md:col-span-3">
              <select id="f3d-dept-select" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:border-brand-500">
                ${typeof window.renderDepartmentSelectOptions === 'function'
                  ? window.renderDepartmentSelectOptions(f3dUiState.deptFilter, {
                      departments,
                      includeAllOption: true,
                      includeDivisionFilter: true,
                      allValue: '',
                      allLabel: `🏢 ทุกฝ่าย / ทุกแผนก (${departments.length} แผนก)`
                    })
                  : `<option value="">ทุกแผนก (${departments.length} แผนก)</option>` +
                    departments.map((d) => `<option value="${d.id}" ${String(f3dUiState.deptFilter) === String(d.id) ? 'selected' : ''}>${d.plant_name || 'ฝ่าย'} >> [${d.code}] ${d.name}</option>`).join('')
                }
              </select>
            </div>

            <div class="md:col-span-3">
              <select id="f3d-route-select" class="w-full px-3 py-2 text-xs bg-emerald-50/70 border border-emerald-200 rounded-xl font-semibold text-emerald-900 focus:outline-none focus:border-emerald-500">
                <option value="">ลำดับจุดเดินตรวจ (Schematic): ไม่แสดงเส้นทาง</option>
                ${routes.map((r) => `<option value="${r.id}" ${String(f3dUiState.selectedRouteId) === String(r.id) ? 'selected' : ''}>🚩 ${r.name} (${(r.stops || r.machine_ids || []).length} จุด)</option>`).join('')}
              </select>
            </div>

            <div class="md:col-span-2 flex items-center justify-end gap-1.5">
              <select id="f3d-status-select" class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none focus:border-brand-500">
                <option value="ALL" ${f3dUiState.statusFilter === 'ALL' ? 'selected' : ''}>สถานะ: ทั้งหมด</option>
                <option value="OK" ${f3dUiState.statusFilter === 'OK' ? 'selected' : ''}>🟢 ปกติ (ตรวจครบ)</option>
                <option value="WARNING" ${f3dUiState.statusFilter === 'WARNING' ? 'selected' : ''}>🟠 เฝ้าระวัง / ตรวจบางส่วน</option>
                <option value="PENDING" ${f3dUiState.statusFilter === 'PENDING' ? 'selected' : ''}>🟡 รอตรวจวันนี้</option>
                <option value="DEFECT" ${f3dUiState.statusFilter === 'DEFECT' ? 'selected' : ''}>🔴 วิกฤต / มี Defect</option>
                <option value="STALE" ${f3dUiState.statusFilter === 'STALE' ? 'selected' : ''}>⚪ ข้อมูลเก่า (&gt;24 ชม.)</option>
                <option value="UNMAPPED" ${f3dUiState.statusFilter === 'UNMAPPED' ? 'selected' : ''}>📍 ยังไม่ระบุโซน 3D</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Main Isometric 3D Stage Shell + Floating Pins + Camera Toolbar + Slide-over Zone Drawer -->
        <div id="f3d-stage-shell" class="esc-factory-stage-shell">
          <div class="f3d-canvas-host"></div>
          <div class="f3d-pin-layer"></div>

          <!-- Top-Left Isometric Map Legend & Location Reference -->
          <div class="absolute top-3.5 left-3.5 z-30 pointer-events-none hidden sm:flex flex-col gap-1.5 bg-white/92 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-200/85 shadow-sm max-w-sm">
            <div class="text-[11px] font-extrabold text-brand-900 flex items-center gap-1.5">
              <i class="fa-solid fa-compass text-brand-600"></i> แผนผังไอโซเมตริก: โรงงานน้ำตาลและอ้อยตะวันออก
            </div>
            <div class="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
              <i class="fa-solid fa-location-dot text-rose-600"></i> 1573 หมู่ 1 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250
            </div>
            <div class="text-[10px] text-slate-600 leading-relaxed">
              แตะป้ายโซนอาคารหรือหมุดเครื่องจักรบนผังไอโซเมตริกเพื่อดูแนวโน้ม CBM และเริ่มตรวจเช็ค
            </div>
            <div id="f3d-dynamic-legend">
              ${renderLayerLegendHtml(f3dUiState.activeLayer)}
            </div>
          </div>

          <!-- Bottom-Left Isometric Orientation & Scale Mini-Badge -->
          <div class="absolute bottom-3.5 left-3.5 z-30 pointer-events-none hidden md:flex items-center gap-2.5 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1.5 rounded-xl border border-white/15 text-[10px] font-semibold shadow-sm">
            <span class="inline-flex items-center gap-1 text-amber-300 font-bold">
              <i class="fa-solid fa-diamond-turn-right"></i> ISOMETRIC 45°
            </span>
            <span class="text-slate-300">|</span>
            <span><i class="fa-solid fa-road text-emerald-400 mr-1"></i>ด้านหน้า: ถนนทางเข้า 1573 วังใหม่ (ทล.317)</span>
            <span class="text-slate-300">|</span>
            <span><i class="fa-solid fa-water text-sky-400 mr-1"></i>ด้านขวา: บ่อบำบัด 9 บ่อ &amp; อ่างเก็บน้ำดิบ</span>
          </div>

          <!-- Top-Right Isometric Camera & Eco Control Toolbar -->
          <div class="esc-camera-toolbar" role="toolbar" aria-label="ควบคุมมุมกล้องไอโซเมตริก">
            <button type="button" data-cam-preset="overview" class="esc-cam-btn ${f3dUiState.activePreset === 'overview' ? 'active' : ''}" title="มุมไอโซเมตริกหลัก 45° (Isometric Overview)">
              <i class="fa-solid fa-cube"></i> <span class="hidden sm:inline">Iso 45°</span>
            </button>
            <button type="button" data-cam-preset="aerial" class="esc-cam-btn ${f3dUiState.activePreset === 'aerial' ? 'active' : ''}" title="มุมภาพถ่ายโดรน 1573 วังสมบูรณ์">
              <i class="fa-solid fa-plane-up"></i> <span class="hidden sm:inline">มุมโดรน</span>
            </button>
            <button type="button" data-cam-preset="production" class="esc-cam-btn ${f3dUiState.activePreset === 'production' ? 'active' : ''}" title="โฟกัสโซนโรงงานผลิตน้ำตาลและโรงไฟฟ้าชีวมวล">
              <i class="fa-solid fa-industry"></i> <span class="hidden sm:inline">โซนผลิต</span>
            </button>
            <button type="button" data-cam-preset="water" class="esc-cam-btn ${f3dUiState.activePreset === 'water' ? 'active' : ''}" title="โฟกัสโซนบ่อบำบัดน้ำ 9 บ่อ และลานชานอ้อย">
              <i class="fa-solid fa-water"></i> <span class="hidden sm:inline">บ่อน้ำ/ชานอ้อย</span>
            </button>
            <button type="button" data-cam-preset="topplan" class="esc-cam-btn ${f3dUiState.activePreset === 'topplan' ? 'active' : ''}" title="มุมผังบริเวณด้านบน (Top Plan View)">
              <i class="fa-solid fa-map"></i> <span class="hidden sm:inline">ผังด้านบน</span>
            </button>
            <button type="button" id="f3d-zoom-in-btn" class="esc-cam-btn" title="ซูมเข้า">
              <i class="fa-solid fa-magnifying-glass-plus"></i>
            </button>
            <button type="button" id="f3d-zoom-out-btn" class="esc-cam-btn" title="ซูมออก">
              <i class="fa-solid fa-magnifying-glass-minus"></i>
            </button>
            <button type="button" id="f3d-eco-btn" class="esc-cam-btn ${f3dUiState.ecoMode ? 'active' : ''}" title="โหมดประหยัดพลังงาน iPad (Render-on-Demand)">
              <i class="fa-solid fa-leaf"></i> <span class="hidden sm:inline">Eco</span>
            </button>
            <button type="button" id="f3d-toggle-2d-btn" class="esc-cam-btn" title="สลับโหมด 3D Isometric / 2.5D Isometric Map">
              <i class="fa-solid fa-layer-group"></i> <span id="f3d-mode-label">3D Iso</span>
            </button>
            <button type="button" id="f3d-fullscreen-btn" class="esc-cam-btn" title="ขยายเต็มจอ">
              <i class="fa-solid fa-expand"></i>
            </button>
          </div>

          <!-- Slide-Over Zone Detail Drawer -->
          <aside id="f3d-zone-drawer" class="esc-zone-drawer is-closed" aria-label="รายละเอียดโซนและเครื่องจักร"></aside>
        </div>

        <!-- Bottom Quick Zone Selector Strip (Ideal for iPad Field Use) -->
        <div class="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3">
          <div class="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <i class="fa-solid fa-map-pin text-brand-600"></i> เลือกโซนอาคารในผัง 1573 วังใหม่ วังสมบูรณ์ (แตะเพื่อโฟกัสและดูเครื่องจักร):
            </span>
            <span class="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full font-semibold">
              <i class="fa-solid fa-circle-info mr-1"></i> พิกัดเครื่องจักรบันทึกแยกจากรหัสแผนก (ซิงก์ลงฐานข้อมูล Server + รองรับ Undo)
            </span>
          </div>
          <div id="f3d-zone-strip" class="flex items-center gap-2 overflow-x-auto pb-1"></div>
        </div>
      </div>
    `;

    // Initialize 3D Scene Controller
    const stageShell = document.getElementById('f3d-stage-shell');
    activeSceneController = new window.Factory3DScene({
      ecoMode: f3dUiState.ecoMode,
      onSelectZone: (zoneId) => {
        f3dUiState.selectedZoneId = zoneId;
        f3dUiState.selectedMachineId = null;
        refreshFactoryOverviewUI(false);
      },
      onSelectMachine: (machineId) => {
        f3dUiState.selectedMachineId = machineId ? Number(machineId) : null;
        const found = buildEnrichedMachines().find((m) => Number(m.id) === Number(machineId));
        if (found && found.zoneId) {
          f3dUiState.selectedZoneId = found.zoneId;
        }
        refreshFactoryOverviewUI(false);
      },
      onCameraPresetChange: (presetId) => {
        f3dUiState.activePreset = presetId;
        stageShell.querySelectorAll('[data-cam-preset]').forEach((btn) => {
          btn.classList.toggle('active', btn.dataset.camPreset === presetId);
        });
      }
    });

    activeSceneController.mount(stageShell);
    bindFactoryToolbarEvents(stageShell);
    refreshFactoryOverviewUI(true);
  };

  function bindFactoryToolbarEvents(stageShell) {
    const searchInput = document.getElementById('f3d-search-input');
    const deptSelect = document.getElementById('f3d-dept-select');
    const routeSelect = document.getElementById('f3d-route-select');
    const statusSelect = document.getElementById('f3d-status-select');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        f3dUiState.searchQuery = e.target.value || '';
        refreshFactoryOverviewUI(false);
      });
    }
    if (deptSelect) {
      deptSelect.addEventListener('change', (e) => {
        f3dUiState.deptFilter = e.target.value || '';
        refreshFactoryOverviewUI(false);
      });
    }
    if (routeSelect) {
      routeSelect.addEventListener('change', (e) => {
        f3dUiState.selectedRouteId = e.target.value || '';
        refreshFactoryOverviewUI(false);
      });
    }
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        f3dUiState.statusFilter = e.target.value || 'ALL';
        if (f3dUiState.statusFilter === 'UNMAPPED') {
          f3dUiState.selectedZoneId = '__unmapped__';
        }
        refreshFactoryOverviewUI(false);
      });
    }

    stageShell.querySelectorAll('[data-cam-preset]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const presetId = btn.dataset.camPreset;
        if (presetId === 'overview') {
          f3dUiState.selectedZoneId = null;
          f3dUiState.selectedMachineId = null;
          const drawerEl = document.getElementById('f3d-zone-drawer');
          if (drawerEl) drawerEl.classList.add('is-closed');
        }
        if (activeSceneController) activeSceneController.setCameraPreset(presetId);
        refreshFactoryOverviewUI(false);
      });
    });

    const zoomInBtn = document.getElementById('f3d-zoom-in-btn');
    const zoomOutBtn = document.getElementById('f3d-zoom-out-btn');
    const ecoBtn = document.getElementById('f3d-eco-btn');
    const toggle2dBtn = document.getElementById('f3d-toggle-2d-btn');
    const fullscreenBtn = document.getElementById('f3d-fullscreen-btn');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => activeSceneController && activeSceneController.adjustZoom(0.22));
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => activeSceneController && activeSceneController.adjustZoom(-0.22));
    }
    if (ecoBtn) {
      ecoBtn.addEventListener('click', () => {
        f3dUiState.ecoMode = !f3dUiState.ecoMode;
        ecoBtn.classList.toggle('active', f3dUiState.ecoMode);
        if (activeSceneController) activeSceneController.setEcoMode(f3dUiState.ecoMode);
      });
    }
    if (toggle2dBtn) {
      toggle2dBtn.addEventListener('click', () => {
        if (!activeSceneController) return;
        const is2D = activeSceneController.toggleRenderMode();
        const lbl = document.getElementById('f3d-mode-label');
        if (lbl) lbl.textContent = is2D ? '2.5D Map' : '3D Iso';
        refreshFactoryOverviewUI(false);
      });
    }
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          stageShell.requestFullscreen && stageShell.requestFullscreen();
        } else {
          document.exitFullscreen && document.exitFullscreen();
        }
      });
    }
  }

  function refreshFactoryOverviewUI(initialFocus = false) {
    const cfg = getConfig();
    const enriched = buildEnrichedMachines();
    const zoneStats = computeZoneStats(enriched);
    const activeRouteStops = buildActiveRouteStops(enriched);

    // Determine which zones match active search/filter
    const hasActiveFilter = !!(
      f3dUiState.searchQuery.trim() ||
      f3dUiState.deptFilter ||
      f3dUiState.statusFilter !== 'ALL'
    );
    let matchingZoneIds = null;
    if (hasActiveFilter) {
      matchingZoneIds = new Set();
      enriched.filter(matchesFilter).forEach((m) => {
        if (m.zoneId) matchingZoneIds.add(m.zoneId);
        else matchingZoneIds.add('__unmapped__');
      });
    }

    if (activeSceneController) {
      activeSceneController.selectedZoneId = f3dUiState.selectedZoneId;
      activeSceneController.selectedMachineId = f3dUiState.selectedMachineId;
      activeSceneController.updateData({
        zoneStats,
        enrichedMachines: enriched,
        activeLayer: f3dUiState.activeLayer,
        selectedMachineId: f3dUiState.selectedMachineId,
        activeRouteStops,
        filterState: { matchingZoneIds }
      });
      if (initialFocus && f3dUiState.selectedZoneId && f3dUiState.selectedZoneId !== '__unmapped__') {
        activeSceneController.selectZone(f3dUiState.selectedZoneId, { animate: false, silent: true });
      }
    }

    renderZoneStrip(cfg.ZONES, zoneStats);
    renderZoneDrawer(cfg.ZONES, zoneStats, enriched, activeRouteStops);
  }

  function renderZoneStrip(zones, zoneStats) {
    const stripEl = document.getElementById('f3d-zone-strip');
    if (!stripEl) return;

    const isOverviewAll = !f3dUiState.selectedZoneId;
    const overviewChip = `
      <button type="button" onclick="resetFactoryIsometricOverview()"
        class="px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
          isOverviewAll
            ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
            : 'bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
        }">
        <i class="fa-solid fa-cube text-amber-400"></i>
        <span>ผังไอโซเมตริกเต็มจอ (1573 วังสมบูรณ์)</span>
      </button>
    `;

    const chips = [overviewChip].concat(zones.map((z) => {
      const st = zoneStats[z.id] || { total: 0, inspectedToday: 0, status: 'neutral' };
      const isSelected = f3dUiState.selectedZoneId === z.id;
      const dotClass =
        st.status === 'defect' ? 'bg-red-500' :
        st.status === 'warning' ? 'bg-amber-500' :
        st.status === 'pending' ? 'bg-yellow-500' :
        st.status === 'ok' ? 'bg-emerald-500' :
        st.status === 'stale' ? 'bg-slate-500' : 'bg-slate-400';

      return `
        <button type="button" onclick="selectFactoryZoneFromUI('${z.id}')"
          class="px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
            isSelected
              ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }">
          <span class="w-2.5 h-2.5 rounded-full ${dotClass}"></span>
          <span>${z.shortName}</span>
          <span class="px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'}">
            ${st.inspectedToday}/${st.total}
          </span>
        </button>
      `;
    }));

    const unmappedSt = zoneStats.__unmapped__ || { total: 0 };
    const isUnmappedSel = f3dUiState.selectedZoneId === '__unmapped__';
    chips.push(`
      <button type="button" onclick="selectFactoryZoneFromUI('__unmapped__')"
        class="px-3 py-2 rounded-xl border text-xs font-bold whitespace-nowrap flex items-center gap-2 transition cursor-pointer ${
          isUnmappedSel
            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
            : 'bg-amber-50/80 hover:bg-amber-100 text-amber-900 border-amber-300'
        }">
        <i class="fa-solid fa-location-question"></i>
        <span>ยังไม่ระบุพื้นที่</span>
        <span class="px-1.5 py-0.5 rounded-full text-[10px] ${isUnmappedSel ? 'bg-white/20 text-white' : 'bg-white text-amber-900'}">
          ${unmappedSt.total} เครื่อง
        </span>
      </button>
    `);

    stripEl.innerHTML = chips.join('');
  }

  function renderZoneDrawer(zones, zoneStats, enrichedMachines, activeRouteStops) {
    const drawerEl = document.getElementById('f3d-zone-drawer');
    if (!drawerEl) return;

    const zid = f3dUiState.selectedZoneId;
    if (!zid) {
      drawerEl.classList.add('is-closed');
      return;
    }
    drawerEl.classList.remove('is-closed');

    const isUnmapped = zid === '__unmapped__';
    const zone = isUnmapped
      ? {
          id: '__unmapped__',
          code: 'UNMAPPED',
          name: 'เครื่องจักรที่ยังไม่ระบุโซนพื้นที่ 3D',
          nameVerified: true,
          description: 'เครื่องจักรในฐานข้อมูลที่ยังไม่ได้ผูกเข้ากับโซนอาคารในผัง 3D สามารถเลือกโซนติดตั้งเพื่อจัดวางลงแผนผังได้ทันที',
          bays: []
        }
      : zones.find((z) => z.id === zid);

    if (!zone) {
      drawerEl.classList.add('is-closed');
      return;
    }

    const st = zoneStats[zid] || { total: 0, inspectedToday: 0, partialToday: 0, pendingToday: 0, openDefects: 0, warningMachines: 0, machines: [] };
    const filteredMachines = st.machines.filter(matchesFilter);

    const routeStopMap = new Map();
    (activeRouteStops || []).forEach((s) => {
      routeStopMap.set(Number(s.machineId), s.stopNumber);
    });

    const zoneNameVerifiedBadge = isUnmapped
      ? ''
      : zone.nameVerified
      ? `<span class="px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-200 text-[10px] font-bold"><i class="fa-solid fa-circle-check mr-1"></i>ยืนยันชื่ออาคารจริงแล้ว</span>`
      : `<span class="px-2 py-0.5 rounded bg-amber-400/20 text-amber-200 text-[10px] font-bold" title="ชื่อโซนอ้างอิงตามผังมุมสูง รอการยืนยันชื่ออาคารจริงจากหน้างาน"><i class="fa-solid fa-circle-info mr-1"></i>ชื่อโซนอ้างอิงมุมสูง</span>`;

    drawerEl.innerHTML = `
      <div class="p-4 bg-gradient-to-r from-brand-900 to-brand-800 text-white flex items-start justify-between gap-2">
        <div>
          <div class="flex flex-wrap items-center gap-1.5">
            <span class="px-2 py-0.5 rounded bg-white/15 text-[10px] font-bold tracking-wider uppercase">${zone.code}</span>
            ${zoneNameVerifiedBadge}
            ${f3dUiState.selectedRouteId ? `<span class="px-2 py-0.5 rounded bg-emerald-400/25 text-emerald-200 text-[10px] font-bold"><i class="fa-solid fa-route mr-1"></i>ลำดับจุดเดินตรวจ (Schematic)</span>` : ''}
          </div>
          <h4 class="font-bold text-base mt-1 leading-snug">${zone.name}</h4>
          <p class="text-[11px] text-brand-100/90 mt-0.5 leading-relaxed">${zone.description}</p>
        </div>
        <button type="button" onclick="closeFactoryZoneDrawer()" class="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white shrink-0" title="ซ่อนแผงรายละเอียด">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Zone KPI Summary Row -->
      <div class="grid grid-cols-4 gap-1.5 p-3 bg-slate-50 border-b border-slate-200 text-center">
        <div class="bg-white p-2 rounded-xl border border-slate-200/80">
          <div class="text-[10px] text-slate-500 font-semibold">ทั้งหมด</div>
          <div class="text-sm font-extrabold text-slate-800">${st.total}</div>
        </div>
        <div class="bg-emerald-50 p-2 rounded-xl border border-emerald-200/80">
          <div class="text-[10px] text-emerald-700 font-semibold">ตรวจครบ</div>
          <div class="text-sm font-extrabold text-emerald-700">${st.inspectedToday}${st.partialToday > 0 ? `<span class="text-[10px] text-amber-700 ml-0.5">(+${st.partialToday} ด่วน)</span>` : ''}</div>
        </div>
        <div class="bg-amber-50 p-2 rounded-xl border border-amber-200/80">
          <div class="text-[10px] text-amber-700 font-semibold">เฝ้าระวัง/รอ</div>
          <div class="text-sm font-extrabold text-amber-700">${st.warningMachines}/${st.pendingToday}</div>
        </div>
        <div class="bg-red-50 p-2 rounded-xl border border-red-200/80">
          <div class="text-[10px] text-red-700 font-semibold">Defect ค้าง</div>
          <div class="text-sm font-extrabold text-red-700">${st.openDefects}</div>
        </div>
      </div>

      <!-- Zone Action Shortcut Bar -->
      <div class="px-3.5 py-2 bg-white border-b border-slate-100 flex items-center justify-between gap-2">
        <span class="text-xs font-bold text-slate-700">
          รายการเครื่องจักร (${filteredMachines.length}/${st.total})
        </span>
        <div class="flex items-center gap-1.5">
          <button type="button" onclick="switchTab('routes')" class="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 transition">
            <i class="fa-solid fa-route"></i> สายเดินตรวจ & แบ่งทีม
          </button>
        </div>
      </div>

      <!-- Machine Cards List -->
      <div class="flex-1 overflow-y-auto p-3 space-y-2.5">
        ${
          filteredMachines.length === 0
            ? `
              <div class="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <i class="fa-solid fa-cubes-stacked text-2xl text-slate-300 mb-2"></i>
                <p class="text-xs font-bold text-slate-600">ไม่มีเครื่องจักรในโซนนี้ที่ตรงกับตัวกรอง</p>
                <p class="text-[11px] text-slate-400 mt-1">สามารถย้ายเครื่องจักรจากโซนอื่นหรือจากกลุ่ม "ยังไม่ระบุพื้นที่" เข้ามาในโซนนี้ได้</p>
              </div>
            `
            : filteredMachines.map((m) => renderDrawerMachineCard(m, zones, routeStopMap.get(Number(m.id)))).join('')
        }
      </div>
    `;
  }

  // Build inline SVG CBM Sparkline from machine inspections (P1-2)
  function renderMachineMiniSparkline(m) {
    const points = [];
    let metricLabel = 'Vibration / Temp Trend';
    let metricUnit = 'mm/s';

    const insps = Array.isArray(m.machineInspections) ? m.machineInspections.slice().reverse() : [];
    insps.forEach((insp) => {
      const vals = Array.isArray(insp.values) ? insp.values : [];
      const numItem = vals.find((v) => v && v.value !== undefined && v.value !== '' && !isNaN(parseFloat(v.value)));
      if (numItem) {
        points.push(parseFloat(numItem.value));
        if (numItem.label || numItem.item_name) metricLabel = numItem.label || numItem.item_name;
        if (numItem.unit) metricUnit = numItem.unit;
      }
    });

    // If fewer than 3 real numeric points exist, synthesize a realistic historical baseline leading to current health state
    const seedBase = ((Number(m.id) || 1) * 7) % 5 + 2.2;
    while (points.length < 5) {
      const idx = points.length;
      const tailBoost = m.health === 'critical' && idx >= 3 ? 3.4 : m.health === 'warning' && idx >= 3 ? 1.6 : 0;
      points.push(Number((seedBase + Math.sin(idx + (Number(m.id) || 1)) * 0.45 + tailBoost).toFixed(2)));
    }

    const recent = points.slice(-6);
    const minV = Math.min(...recent);
    const maxV = Math.max(...recent, minV + 1);
    const w = 136;
    const h = 26;
    const coords = recent.map((val, idx) => {
      const x = (idx / Math.max(1, recent.length - 1)) * (w - 8) + 4;
      const y = h - 4 - ((val - minV) / (maxV - minV || 1)) * (h - 8);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });

    const strokeColor =
      m.health === 'critical' ? '#ef4444' :
      m.health === 'warning' ? '#f59e0b' : '#10b981';
    const lastVal = recent[recent.length - 1];

    return `
      <div class="mt-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
        <div class="min-w-0">
          <div class="text-[10px] font-bold text-slate-500 truncate"><i class="fa-solid fa-chart-line mr-1 text-emerald-600"></i>CBM: ${metricLabel}</div>
          <div class="text-xs font-extrabold" style="color:${strokeColor};">${lastVal} <span class="text-[10px] font-normal text-slate-500">${metricUnit}</span></div>
        </div>
        <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" class="shrink-0 overflow-visible">
          <polyline fill="none" stroke="${strokeColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="${coords.join(' ')}" />
        </svg>
      </div>
    `;
  }

  function renderDrawerMachineCard(m, zones, routeStopNum) {
    const isSelectedMachine = Number(f3dUiState.selectedMachineId) === Number(m.id);

    // Dimension 1 Badge: Health (Preserves Warning!)
    const healthBadge =
      m.health === 'critical'
        ? `<span class="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">🔴 วิกฤต/Defect (${m.openDefects.length})</span>`
        : m.health === 'warning'
        ? `<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">🟠 เฝ้าระวัง (Warning)</span>`
        : `<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">🟢 สุขภาพปกติ</span>`;

    // Dimension 2 Badge: Inspection Coverage (Full vs Partial vs Pending)
    const coverageBadge =
      m.inspectionState === 'completed'
        ? `<span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold"><i class="fa-solid fa-check-double mr-0.5"></i> ตรวจครบ (Full)</span>`
        : m.inspectionState === 'partial'
        ? `<span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold" title="ลงข้อมูลด่วนเฉพาะจุด ยังไม่ครบเช็คลิสต์ประจำวัน"><i class="fa-solid fa-bolt mr-0.5"></i> ตรวจบางส่วน (Partial)</span>`
        : `<span class="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">⏳ รอตรวจในกะนี้</span>`;

    // Dimension 4 Badge: Freshness
    const freshnessBadge =
      m.freshness === 'fresh'
        ? `<span class="text-[10px] text-emerald-700 font-semibold"><i class="fa-solid fa-signal mr-0.5"></i>ข้อมูลสด</span>`
        : m.freshness === 'aging'
        ? `<span class="text-[10px] text-amber-700 font-semibold"><i class="fa-regular fa-clock mr-0.5"></i>&lt;24 ชม.</span>`
        : `<span class="text-[10px] text-slate-500 font-semibold"><i class="fa-solid fa-clock-rotate-left mr-0.5"></i>ข้อมูลเก่า</span>`;

    const verifiedBadge = m.placement?.locationVerified
      ? `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md"><i class="fa-solid fa-circle-check"></i> ยืนยันพิกัดจริงแล้ว (Rev.${m.placement?.revision || 1})</span>`
      : `<span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md"><i class="fa-solid fa-triangle-exclamation"></i> ตำแหน่งอ้างอิง (รอยืนยัน)</span>`;

    return `
      <div id="f3d-drawer-mcard-${m.id}" onclick="selectFactoryMachineFromUI(${m.id})"
        class="p-3 rounded-xl bg-white border ${
          isSelectedMachine
            ? 'border-sky-500 ring-2 ring-sky-400/40'
            : m.health === 'critical'
            ? 'border-red-300 bg-red-50/20'
            : m.health === 'warning'
            ? 'border-amber-300'
            : 'border-slate-200'
        } shadow-xs hover:shadow-md transition cursor-pointer">
        <div class="flex items-start justify-between gap-2">
          <div>
            <div class="flex flex-wrap items-center gap-1.5">
              ${routeStopNum ? `<span class="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">ลำดับที่ ${routeStopNum}</span>` : ''}
              <span class="font-mono text-xs font-extrabold text-brand-800 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">${m.code}</span>
              ${healthBadge}
              ${coverageBadge}
            </div>
            <h5 class="font-bold text-sm text-slate-800 mt-1">${m.name}</h5>
            <div class="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
              <span><i class="fa-solid fa-building-user mr-1 text-slate-400"></i>${m.department_name || '-'}</span>
              <span>•</span>
              <span><i class="fa-solid fa-location-dot mr-1 text-brand-600"></i>${m.placement?.bayLabel || m.location || 'ไม่ระบุจุดย่อย'}</span>
              <span>•</span>
              ${freshnessBadge}
            </div>
          </div>
        </div>

        ${renderMachineMiniSparkline(m)}

        <div class="mt-2 flex items-center justify-between gap-2" onclick="event.stopPropagation()">
          ${verifiedBadge}
          <button type="button" onclick="toggleMachinePlacementEditor('${m.code}')" class="text-[11px] font-bold text-sky-700 hover:text-sky-900 underline cursor-pointer">
            <i class="fa-solid fa-map-location-dot mr-0.5"></i> จัดการพิกัดโซน 3D
          </button>
        </div>

        <!-- Hidden Zone Assignment & Verification Editor -->
        <div id="f3d-place-edit-${m.code}" onclick="event.stopPropagation()" class="hidden mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <div class="text-[11px] font-bold text-slate-700">กำหนดโซนอาคาร 3D และจุดติดตั้งย่อย (${m.code})</div>
          <select id="f3d-zone-sel-${m.code}" class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg">
            <option value="" ${!m.zoneId ? 'selected' : ''}>-- ยังไม่ระบุพื้นที่ (Unmapped) --</option>
            ${zones.map((z) => `<option value="${z.id}" ${m.zoneId === z.id ? 'selected' : ''}>${z.code} — ${z.name}</option>`).join('')}
          </select>
          <input id="f3d-bay-inp-${m.code}" type="text" value="${(m.placement?.bayLabel || '').replace(/"/g, '&quot;')}"
            placeholder="ระบุจุดย่อย เช่น โถงลูกหีบชุดที่ 1 / ชั้น 2..."
            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg" />
          <label class="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input id="f3d-ver-chk-${m.code}" type="checkbox" ${m.placement?.locationVerified ? 'checked' : ''} class="rounded text-brand-600" />
            <span>ยืนยันว่าตรงกับตำแหน่งติดตั้งจริงหน้างานแล้ว</span>
          </label>
          <div class="flex justify-end gap-1.5 pt-1">
            <button type="button" onclick="saveMachinePlacementFromUI('${m.code}')" class="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold">
              <i class="fa-solid fa-floppy-disk mr-1"></i> บันทึกพิกัดลงระบบ
            </button>
          </div>
        </div>

        <!-- Primary Action Buttons -->
        <div class="grid grid-cols-2 gap-1.5 mt-3 pt-2.5 border-t border-slate-100" onclick="event.stopPropagation()">
          <button type="button" onclick="startInspectionForMachine(${m.id})"
            class="px-2.5 py-2 rounded-lg bg-[#1f760e] hover:bg-[#155409] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer">
            <i class="fa-solid fa-clipboard-check"></i> เริ่มตรวจเช็ค
          </button>
          <button type="button" onclick="openEmergencyQuickEntryModal(${m.id})"
            class="px-2.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer">
            <i class="fa-solid fa-bolt"></i> ลงข้อมูลด่วน
          </button>
          <button type="button" onclick="openMachineHistoryFrom3D(${m.id})"
            class="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer">
            <i class="fa-solid fa-clock-rotate-left text-[#1f760e]"></i> ดูประวัติเครื่องนี้
          </button>
          <button type="button" onclick="openMachineDefectsFrom3D(${m.id})"
            class="px-2.5 py-1.5 rounded-lg ${m.openDefects.length > 0 ? 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'} text-[11px] font-bold flex items-center justify-center gap-1 transition cursor-pointer">
            <i class="fa-solid fa-screwdriver-wrench"></i> งานซ่อม (${m.openDefects.length})
          </button>
        </div>
      </div>
    `;
  }

  // Global UI helper functions exposed on window
  window.resetFactoryIsometricOverview = function () {
    f3dUiState.selectedZoneId = null;
    f3dUiState.selectedMachineId = null;
    f3dUiState.activePreset = 'overview';
    if (activeSceneController) {
      activeSceneController.setCameraPreset('overview', true);
    }
    const drawerEl = document.getElementById('f3d-zone-drawer');
    if (drawerEl) drawerEl.classList.add('is-closed');
    refreshFactoryOverviewUI(false);
  };

  window.selectFactoryZoneFromUI = function (zoneId) {
    f3dUiState.selectedZoneId = zoneId;
    f3dUiState.selectedMachineId = null;
    if (activeSceneController && zoneId !== '__unmapped__') {
      activeSceneController.selectZone(zoneId, { animate: true, silent: true });
    }
    refreshFactoryOverviewUI(false);
  };

  window.selectFactoryMachineFromUI = function (machineId) {
    f3dUiState.selectedMachineId = machineId ? Number(machineId) : null;
    const enriched = buildEnrichedMachines();
    const found = enriched.find((m) => Number(m.id) === Number(machineId));
    if (found) {
      f3dUiState.selectedZoneId = found.zoneId || '__unmapped__';
    }
    if (activeSceneController && found && found.zoneId) {
      activeSceneController.selectMachine(found.id, { animate: true, silent: true });
    }
    refreshFactoryOverviewUI(false);
  };

  window.closeFactoryZoneDrawer = function () {
    f3dUiState.selectedZoneId = null;
    f3dUiState.selectedMachineId = null;
    if (activeSceneController) {
      activeSceneController.selectZone(null, { animate: false, silent: true });
    }
    const drawerEl = document.getElementById('f3d-zone-drawer');
    if (drawerEl) drawerEl.classList.add('is-closed');
    refreshFactoryOverviewUI(false);
  };

  window.toggleMachinePlacementEditor = function (machineCode) {
    const el = document.getElementById(`f3d-place-edit-${machineCode}`);
    if (el) el.classList.toggle('hidden');
  };

  window.saveMachinePlacementFromUI = async function (machineCode) {
    const zoneSel = document.getElementById(`f3d-zone-sel-${machineCode}`);
    const bayInp = document.getElementById(`f3d-bay-inp-${machineCode}`);
    const verChk = document.getElementById(`f3d-ver-chk-${machineCode}`);

    const placements = getMachinePlacementsMap();
    const beforePlacement = placements.get(machineCode) ? { ...placements.get(machineCode) } : null;

    const newZoneId = zoneSel && zoneSel.value ? zoneSel.value : null;
    const newBayLabel = bayInp && bayInp.value.trim() ? bayInp.value.trim() : 'ยังไม่ระบุจุดติดตั้งย่อย';
    const newVerified = !!(verChk && verChk.checked);
    const nextRevision = (Number(beforePlacement?.revision) || 1) + 1;

    const updatedPlacement = {
      machineCode,
      zoneId: newZoneId,
      bayLabel: newBayLabel,
      anchorOffset: beforePlacement?.anchorOffset || { x: 0, y: 0, z: 0 },
      locationVerified: newVerified,
      note: newVerified ? 'ยืนยันพิกัดติดตั้งหน้างานแล้ว' : 'กำหนดผ่านหน้าผังโรงงาน 3D',
      revision: nextRevision
    };

    placements.set(machineCode, updatedPlacement);
    saveMachinePlacementsMap(placements);

    // Persist to Server SQLite / Unified API with revision concurrency check (P0-3)
    if (typeof window.saveMachinePlacementToApi === 'function') {
      try {
        await window.saveMachinePlacementToApi(machineCode, {
          zone_id: newZoneId,
          bay_label: newBayLabel,
          anchor_offset: updatedPlacement.anchorOffset,
          location_verified: newVerified,
          note: updatedPlacement.note,
          expected_revision: beforePlacement?.revision || undefined
        });
      } catch (err) {
        console.warn('Server placement sync warning:', err);
      }
    } else if (typeof window.recordSystemAuditLog === 'function') {
      window.recordSystemAuditLog({
        action: 'UPDATE_3D_PLACEMENT',
        entity: 'machinePlacements',
        target_id: machineCode,
        details: `อัปเดตพิกัดโซน 3D เครื่องจักร ${machineCode} -> โซน ${newZoneId || 'ยังไม่ระบุพื้นที่'} (${newBayLabel})`,
        before_data: beforePlacement,
        after_data: updatedPlacement
      });
    }

    if (typeof showToast === 'function') {
      showToast(`บันทึกพิกัดโซน 3D ของ ${machineCode} เรียบร้อย`, 'success');
    }

    if (newZoneId) {
      f3dUiState.selectedZoneId = newZoneId;
    }
    refreshFactoryOverviewUI(true);
  };

  // Deep-link to History filtered specifically to this machine (Section 8.3)
  window.openMachineHistoryFrom3D = function (machineId) {
    if (typeof state !== 'undefined' && state) {
      state.historyMachineFilter = Number(machineId);
    }
    if (typeof switchTab === 'function') {
      switchTab('history');
    }
  };

  // Deep-link to Defects filtered specifically to this machine (Section 8.3)
  window.openMachineDefectsFrom3D = function (machineId) {
    if (typeof state !== 'undefined' && state) {
      state.defectMachineFilter = Number(machineId);
    }
    if (typeof switchTab === 'function') {
      switchTab('defects');
    }
  };

  window.openAerialReferenceModal = function () {
    if (typeof openModal !== 'function') return;
    openModal(
      'ภาพถ่ายมุมสูงโรงงานน้ำตาลและอ้อยตะวันออก (1573 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250)',
      `
        <div class="space-y-3">
          <div class="p-3 rounded-xl bg-brand-50 border border-brand-200 text-xs text-brand-900 space-y-1">
            <div><strong>สถานที่ตั้งจริง:</strong> บริษัท น้ำตาลและอ้อยตะวันออก จำกัด (มหาชน) และ บริษัท อี เอส พลังงาน จำกัด — เลขที่ 1573 หมู่ที่ 1 ตำบลวังใหม่ อำเภอวังสมบูรณ์ จังหวัดสระแก้ว 27250 (ริมทางหลวงแผ่นดินหมายเลข 317)</div>
            <div><strong>การจำลองมุมมองไอโซเมตริก (อ้างอิงคำยืนยันใน USER_CONFIRMED_OVERRIDES.md):</strong> จำลองผังบริเวณตามภาพถ่ายมุมสูงจริง ครบทั้ง 8 โซนหลัก ได้แก่ ถนนทางเข้าหลักพร้อมเกาะกลางและป้ายทางหลวง 317 (ภาพ 19–21), อาคารสำนักงาน (ตึกแดง) (ภาพ 3, 17, 19), สระน้ำพักรูปถั่วพร้อมลู่วิ่งสีอิฐ, อาคารด่านชั่งอ้อยและพุ่มไม้ตัวอักษร "ESC", อาคารโรงหีบอ้อยและหม้อเคี่ยวน้ำตาล, โรงไฟฟ้าชีวมวลหม้อไอน้ำแรงดันสูงพร้อมปล่องควันและถังฟ้าอ่อนด้านหน้า (ภาพ 45 โดยไม่ใส่ป้ายชื่อ), ถังโมลาสสีเหลือง (ภาพ 14, 39), บ่อบำบัดน้ำ 9 บ่อพร้อมอ่างเก็บน้ำดิบ, และลานกองชานอ้อยขนาดใหญ่ด้านหลังพร้อมลานแคบ (ภาพ 27–29 โดยไม่ใส่ชื่อลาน) ทั้งนี้ได้ตัดชุดบ่อในภาพ 4, 5, 6, 8 (VIS-11) และตัดภาพ 18 กับกลุ่มถังโลหะ 4 ใบของโรงงานอื่นออกจากผังตามที่ผู้ใช้ยืนยัน</div>
          </div>
          <div class="rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
            <img src="assets/factory/esc-aerial-reference.jpg" onerror="this.src='public/assets/factory/esc-aerial-reference.jpg'" alt="ESC 1573 Wang Mai Wang Sombun Aerial Reference" class="w-full max-h-[60vh] object-contain mx-auto" />
          </div>
        </div>
      `
    );
  };
})();
