// ============================================================================
// ESC Factory World — Three.js Soft Cartoon Industrial Diorama + 2D Fallback
// ============================================================================
// Lifecycle contract:
//   const controller = new window.Factory3DScene(options);
//   controller.mount(stageEl);
//   controller.updateData(payload);
//   controller.resize();
//   controller.dispose();
// ============================================================================

(function () {
  const CONFIG = window.FACTORY_WORLD_CONFIG || {};
  const PALETTE = CONFIG.PALETTE || {};
  const ZONES = CONFIG.ZONES || [];
  const PRESETS = CONFIG.CAMERA_PRESETS || {};

  function hexToInt(hex, fallback = 0xffffff) {
    if (!hex || typeof hex !== 'string') return fallback;
    return parseInt(hex.replace('#', ''), 16);
  }

  class Factory3DScene {
    constructor(options = {}) {
      this.options = options;
      this.onSelectZone = options.onSelectZone || function () {};
      this.onSelectMachine = options.onSelectMachine || function () {};
      this.onCameraPresetChange = options.onCameraPresetChange || function () {};
      this.container = null;
      this.canvasHost = null;
      this.pinLayer = null;
      this.usingFallback2D = false;
      this.force2D = false;
      this.ecoMode = !!options.ecoMode;
      this.isDarkMode = document.body && document.body.classList.contains('dark-theme');

      // Three.js core objects
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.raycaster = null;
      this.rafId = null;
      this.resizeObserver = null;
      this.isDisposed = false;
      this.needsRender = true;
      this.activeUntil = performance.now() + 2000;
      this._lastPinCameraKey = '';

      // Scene state
      this.zoneMeshes = new Map(); // zoneId -> { group, hitMesh, padMesh, ringMesh, zone }
      this.machineMarkerMeshes = new Map(); // machineId -> { group, hitMesh, bodyMesh, ringMesh, machine }
      this.machineMarkersGroup = null;
      this.interactables = [];
      this.pinElements = new Map(); // zoneId -> HTMLElement
      this.steamParticles = [];
      this.waterMeshes = [];
      this.routeGroup = null;
      this.hemiLight = null;
      this.dirLight = null;

      // Data state
      this.zoneStats = new Map();
      this.enrichedMachines = [];
      this.activeLayer = 'health';
      this.selectedZoneId = null;
      this.selectedMachineId = null;
      this.hoveredZoneId = null;
      this.hoveredMachineId = null;
      this.activeRouteStops = []; // [{ stopNumber, zoneId, machineCode, status }]
      this.filterState = { matchingZoneIds: null };

      // Camera spherical / orthographic isometric rig around target
      // Default: True Isometric 45° angle looking across 1573 Wang Mai, Wang Sombun complex
      const defaultPreset = PRESETS.overview || {};
      const initSpherical = defaultPreset.spherical || { theta: -0.54, phi: 0.92, radius: 132 };
      this.target = { x: 0, y: 0, z: 0 };
      this.desiredTarget = { x: 0, y: 0, z: 0 };
      this.spherical = {
        theta: initSpherical.theta, // horizontal azimuth angle (radians) — isometric diagonal
        phi: initSpherical.phi,     // vertical elevation angle from Y axis (~52.7° = 37.3° isometric pitch)
        radius: initSpherical.radius || 132
      };
      this.desiredSpherical = {
        theta: initSpherical.theta,
        phi: initSpherical.phi,
        radius: initSpherical.radius || 132
      };
      this.zoom = defaultPreset.zoom || 1.04;
      this.desiredZoom = defaultPreset.zoom || 1.04;
      this.frustumSize = 118;
      this.show2DAerialUnderlay = false;

      // Pointer / Touch interaction state
      this.pointerState = {
        isDown: false,
        button: 0,
        startX: 0,
        startY: 0,
        lastX: 0,
        lastY: 0,
        movedDistance: 0,
        activePointers: new Map(),
        lastPinchDist: 0,
        lastPinchCenter: null
      };

      this.reducedMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      this._boundAnimate = this._animate.bind(this);
      this._boundWindowResize = this.resize.bind(this);
      this._boundVisibilityChange = this._onVisibilityChange.bind(this);
    }

    invalidate(reason = 'manual', durationMs = 650) {
      if (this.isDisposed || this.usingFallback2D) return;
      this.needsRender = true;
      this.activeUntil = Math.max(this.activeUntil || 0, performance.now() + durationMs);
      if (!this.rafId && !document.hidden) {
        this.rafId = requestAnimationFrame(this._boundAnimate);
      }
    }

    setEcoMode(enabled) {
      this.ecoMode = !!enabled;
      this.invalidate('eco-toggle', 400);
      return this.ecoMode;
    }

    setThemeMode(isDark) {
      this.isDarkMode = !!isDark;
      if (this.scene && this.scene.fog) {
        this.scene.fog.color.setHex(this.isDarkMode ? 0x06140e : hexToInt(PALETTE.skyBottom, 0xeef6ef));
      }
      if (this.hemiLight) {
        this.hemiLight.intensity = this.isDarkMode ? 0.55 : 0.78;
      }
      if (this.dirLight) {
        this.dirLight.intensity = this.isDarkMode ? 0.58 : 0.72;
      }
      this.invalidate('theme-mode', 400);
    }

    _onVisibilityChange() {
      if (this.isDisposed) return;
      if (document.hidden) {
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      } else {
        this.invalidate('tab-visible', 600);
      }
    }

    mount(containerEl) {
      this.container = containerEl;
      this.isDisposed = false;
      if (!this.container) return;

      this.canvasHost = this.container.querySelector('.f3d-canvas-host') || this.container;
      this.pinLayer = this.container.querySelector('.f3d-pin-layer');

      const canUseWebGL = !this.force2D && typeof window.THREE !== 'undefined' && this._checkWebGLAvailable();

      if (!canUseWebGL) {
        this.usingFallback2D = true;
        this._mount2DFallback();
      } else {
        this.usingFallback2D = false;
        try {
          this._mountThreeScene();
        } catch (err) {
          console.warn('WebGL 3D initialization failed, falling back to 2D SVG map:', err);
          this.usingFallback2D = true;
          this._mount2DFallback();
        }
      }

      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(() => {
          if (!this.isDisposed) this.resize();
        });
        this.resizeObserver.observe(this.container);
      }
      window.addEventListener('resize', this._boundWindowResize);
      document.addEventListener('visibilitychange', this._boundVisibilityChange);
    }

    _checkWebGLAvailable() {
      try {
        const canvas = document.createElement('canvas');
        return !!(
          window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
        );
      } catch (e) {
        return false;
      }
    }

    toggleRenderMode(force2D) {
      this.force2D = typeof force2D === 'boolean' ? force2D : !this.usingFallback2D;
      const savedContainer = this.container;
      const savedPayload = this._lastPayload;
      const savedZone = this.selectedZoneId;
      const savedMachine = this.selectedMachineId;
      this.dispose();
      if (savedContainer) {
        this.mount(savedContainer);
        if (savedPayload) this.updateData(savedPayload);
        if (savedZone) this.selectZone(savedZone, { animate: false, silent: true });
        if (savedMachine) this.selectMachine(savedMachine, { animate: false, silent: true });
      }
      return this.usingFallback2D;
    }

    // ========================================================================
    // THREE.JS DIORAMA BUILDER
    // ========================================================================
    _mountThreeScene() {
      const THREE = window.THREE;
      this.canvasHost.innerHTML = '';
      if (this.pinLayer) this.pinLayer.innerHTML = '';

      const width = Math.max(this.canvasHost.clientWidth || 800, 300);
      const height = Math.max(this.canvasHost.clientHeight || 540, 300);
      const aspect = width / height;

      this.isDarkMode = document.body && document.body.classList.contains('dark-theme');
      this.scene = new THREE.Scene();
      this.scene.fog = new THREE.FogExp2(
        this.isDarkMode ? 0x06140e : hexToInt(PALETTE.skyBottom, 0xeef6ef),
        0.0022
      );

      const halfF = this.frustumSize / 2;
      this.camera = new THREE.OrthographicCamera(
        -halfF * aspect,
        halfF * aspect,
        halfF,
        -halfF,
        -250,
        500
      );
      this.camera.zoom = this.zoom;
      this._applyCameraTransform(true);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.setSize(width, height);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      if (this.renderer.outputEncoding !== undefined && THREE.sRGBEncoding !== undefined) {
        this.renderer.outputEncoding = THREE.sRGBEncoding;
      }

      this.canvasHost.appendChild(this.renderer.domElement);
      this.raycaster = new THREE.Raycaster();

      this._setupLights();
      this._buildDioramaBase();
      this._buildRoadsAndYard();
      this._buildWaterFeatures();
      this._buildFactoryZones();
      this.machineMarkersGroup = new THREE.Group();
      this.machineMarkersGroup.name = 'machine-markers-group';
      this.scene.add(this.machineMarkersGroup);
      this._buildLandscapingAndHills();
      this._buildHTMLPins();
      this._bindPointerEvents(this.renderer.domElement);

      this.clockStart = performance.now();
      this.invalidate('mount', 1800);
    }

    _setupLights() {
      const THREE = window.THREE;
      const hemiLight = new THREE.HemisphereLight(
        0xffffff,
        hexToInt(PALETTE.groundMain, 0x7fa96b),
        this.isDarkMode ? 0.55 : 0.78
      );
      hemiLight.position.set(0, 120, 0);
      this.scene.add(hemiLight);
      this.hemiLight = hemiLight;

      const dirLight = new THREE.DirectionalLight(0xfffaf0, this.isDarkMode ? 0.58 : 0.72);
      dirLight.position.set(68, 115, 75);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      const d = 88;
      dirLight.shadow.camera.left = -d;
      dirLight.shadow.camera.right = d;
      dirLight.shadow.camera.top = d;
      dirLight.shadow.camera.bottom = -d;
      dirLight.shadow.camera.near = 20;
      dirLight.shadow.camera.far = 260;
      dirLight.shadow.bias = -0.0005;
      this.scene.add(dirLight);
      this.dirLight = dirLight;

      const fillLight = new THREE.DirectionalLight(0xdbeafe, 0.25);
      fillLight.position.set(-70, 60, -50);
      this.scene.add(fillLight);
    }

    _mat(colorHex, opts = {}) {
      const THREE = window.THREE;
      return new THREE.MeshStandardMaterial({
        color: hexToInt(colorHex),
        roughness: opts.roughness !== undefined ? opts.roughness : 0.78,
        metalness: opts.metalness !== undefined ? opts.metalness : 0.06,
        transparent: !!opts.transparent,
        opacity: opts.opacity !== undefined ? opts.opacity : 1.0,
        emissive: opts.emissive ? hexToInt(opts.emissive) : 0x000000,
        emissiveIntensity: opts.emissiveIntensity || 0
      });
    }

    _addBox(parent, w, h, d, x, y, z, mat, castShadow = true, receiveShadow = true) {
      const THREE = window.THREE;
      const geom = new THREE.BoxGeometry(w, h, d);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y + h / 2, z);
      mesh.castShadow = castShadow;
      mesh.receiveShadow = receiveShadow;
      parent.add(mesh);
      return mesh;
    }

    _addGableRoof(parent, w, h, d, x, y, z, mat, ridgeAlongX = false) {
      const THREE = window.THREE;
      const shape = new THREE.Shape();
      if (!ridgeAlongX) {
        shape.moveTo(-w / 2, 0);
        shape.lineTo(0, h);
        shape.lineTo(w / 2, 0);
        shape.closePath();
        const geom = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: false });
        geom.translate(0, 0, -d / 2);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
      } else {
        shape.moveTo(-d / 2, 0);
        shape.lineTo(0, h);
        shape.lineTo(d / 2, 0);
        shape.closePath();
        const geom = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false });
        geom.translate(0, 0, -w / 2);
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.y = Math.PI / 2;
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
      }
    }

    _buildDioramaBase() {
      const THREE = window.THREE;
      const baseGroup = new THREE.Group();

      // Lower dark earth isometric map pedestal (1573 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว)
      const soilMat = this._mat(PALETTE.groundDark || '#567B47', { roughness: 0.92 });
      this._addBox(baseGroup, 158, 5.5, 138, 0, -6.5, -2, soilMat, false, true);

      // Upper green campus island platform
      const grassMat = this._mat(PALETTE.groundMain || '#7FA96B', { roughness: 0.88 });
      this._addBox(baseGroup, 154, 1.5, 134, 0, -1.5, -2, grassMat, false, true);

      // Subtle Isometric Engineering Map Grid on the ground plane
      const gridHelper = new THREE.GridHelper(148, 37, 0x2f5e27, 0x46733b);
      gridHelper.position.set(0, 0.06, -2);
      if (gridHelper.material) {
        gridHelper.material.transparent = true;
        gridHelper.material.opacity = 0.16;
        gridHelper.material.depthWrite = false;
      }
      baseGroup.add(gridHelper);

      // Agricultural sugarcane & plowed field patches on left & front flanks (ตามภาพมุมสูงจริง)
      const fieldMat = this._mat(PALETTE.groundField || '#8CB476', { roughness: 0.9 });
      const plowedMat = this._mat('#9E8C6C', { roughness: 0.94 });
      this._addBox(baseGroup, 22, 0.16, 44, -62, 0, 28, plowedMat, false, true);
      this._addBox(baseGroup, 20, 0.16, 48, -63, 0, -22, fieldMat, false, true);
      this._addBox(baseGroup, 38, 0.16, 22, 38, 0, 44, fieldMat, false, true);

      // Circular sludge/soil drying pad on the middle-right outside pine line (ตามภาพมุมสูงขวา)
      const padOuterGeom = new THREE.CylinderGeometry(8.5, 8.5, 0.22, 28);
      const padOuter = new THREE.Mesh(padOuterGeom, this._mat('#E2DCD0'));
      padOuter.position.set(64, 0.11, 14);
      baseGroup.add(padOuter);
      const padInnerGeom = new THREE.RingGeometry(2.5, 6.8, 24);
      padInnerGeom.rotateX(-Math.PI / 2);
      const padInner = new THREE.Mesh(padInnerGeom, this._mat('#5C4D42'));
      padInner.position.set(64, 0.25, 14);
      baseGroup.add(padInner);

      this.scene.add(baseGroup);
    }

    _buildRoadsAndYard() {
      const THREE = window.THREE;
      const roadGroup = new THREE.Group();
      const roadMat = this._mat(PALETTE.roadMain || '#918A7F', { roughness: 0.85 });
      const edgeMat = this._mat(PALETTE.roadEdge || '#B9B1A5', { roughness: 0.85 });
      const yardMat = this._mat(PALETTE.concreteYard || '#DDD6C9', { roughness: 0.82 });
      const asphaltMat = this._mat(PALETTE.asphaltDark || '#6E6A63', { roughness: 0.88 });
      const markMat = this._mat('#F8FAFC', { roughness: 0.6 });
      const medianMat = this._mat('#558B46', { roughness: 0.85 });

      // 1. Massive Central Concrete Yard (ลานคอนกรีตกลางโรงงาน 1573 วังสมบูรณ์)
      this._addBox(roadGroup, 46, 0.24, 30, 5, 0, 10, yardMat, false, true);
      // Dark asphalt staging & cane truck lane behind the concrete yard (แถบพื้นสีเข้มด้านหลังลานกลาง)
      this._addBox(roadGroup, 46, 0.25, 8.5, 5, 0, -8, asphaltMat, false, true);
      // Concrete apron under West & Center production buildings
      this._addBox(roadGroup, 68, 0.22, 30, -18, 0, -15, yardMat, false, true);

      // 2. Main Divided Entrance Avenue from Highway 317 (ทางเข้าหลัก เลขที่ 1573 ต.วังใหม่)
      this._addBox(roadGroup, 11.5, 0.28, 26, 2, 0, 51, edgeMat, false, true);
      this._addBox(roadGroup, 10.0, 0.32, 26, 2, 0, 51, roadMat, false, true);
      // Green center median strip with street lamp posts on entrance road
      this._addBox(roadGroup, 1.1, 0.42, 18, 2, 0, 52, medianMat, false, true);
      for (let z = 45; z <= 59; z += 7) {
        this._addBox(roadGroup, 0.22, 3.8, 0.22, 2, 0.4, z, this._mat('#CBD5E1'));
        this._addBox(roadGroup, 0.9, 0.2, 0.35, 2, 4.1, z, markMat);
      }

      // Blue Highway-style Directional Signboard on left side of entrance road (ป้ายบอกทางสีน้ำเงินในภาพจริง)
      this._addBox(roadGroup, 0.2, 2.2, 0.2, -4.2, 0.3, 52, this._mat('#94A3B8'));
      this._addBox(roadGroup, 0.2, 2.2, 0.2, -2.6, 0.3, 52, this._mat('#94A3B8'));
      this._addBox(roadGroup, 2.2, 1.3, 0.25, -3.4, 1.6, 52, this._mat('#1D4ED8'));

      // 3. Circular Driveway / Forecourt in front of Red Building (วงเวียนหน้าอาคารสำนักงานสีแดง)
      const ringGeom = new THREE.CylinderGeometry(11.5, 11.5, 0.32, 32);
      const ringMesh = new THREE.Mesh(ringGeom, roadMat);
      ringMesh.position.set(2, 0.16, 37);
      ringMesh.receiveShadow = true;
      roadGroup.add(ringMesh);

      const islandGeom = new THREE.CylinderGeometry(4.6, 4.9, 0.52, 24);
      const islandMesh = new THREE.Mesh(islandGeom, medianMat);
      islandMesh.position.set(2, 0.26, 37);
      roadGroup.add(islandMesh);

      // 4. Y-Junction Split Left & Right (ถนนแยกซ้าย-ขวาตามผังจริง)
      // Left diagonal branch road heading past front-pond & ESC weighbridge canopy to production-west
      const leftRoad = this._addBox(roadGroup, 7.8, 0.32, 42, -16, 0, 26, roadMat, false, true);
      leftRoad.rotation.y = 0.56;

      // Far-left service road running along the West Warehouse & Biomass Power Plant
      this._addBox(roadGroup, 6.8, 0.32, 62, -44, 0, -4, roadMat, false, true);

      // Right diagonal branch road heading toward central yard & water treatment ponds
      const rightRoad = this._addBox(roadGroup, 7.6, 0.32, 38, 18, 0, 26, roadMat, false, true);
      rightRoad.rotation.y = -0.52;

      // Perimeter road between central yard and eastern water treatment ponds
      this._addBox(roadGroup, 6.5, 0.32, 68, 28, 0, -4, roadMat, false, true);

      // Rear service road connecting west, center, and rear blue bagasse yard
      this._addBox(roadGroup, 78, 0.30, 6.0, -4, 0, -30, roadMat, false, true);

      // 5. High-Mast Floodlight Towers in Central Yard (เสาสปอตไลท์สูงในลานคอนกรีตกลาง)
      const mastCoords = [
        [-10, 18], [16, 18], [-10, 0], [18, 0]
      ];
      mastCoords.forEach(([mx, mz]) => {
        this._addBox(roadGroup, 0.35, 9.5, 0.35, mx, 0.2, mz, this._mat('#94A3B8'));
        this._addBox(roadGroup, 1.8, 0.35, 0.8, mx, 9.6, mz, markMat);
      });

      // 6. Miniature Scale Vehicles (รถบรรทุกอ้อยและรถยนต์จอดหน้าอาคารแดง)
      // 3 white sedans parked in front of Red Building canopy
      [-0.2, 2.0, 4.2].forEach((cx) => {
        this._addBox(roadGroup, 1.3, 0.75, 2.4, cx, 0.35, 34.2, markMat);
      });
      // Sugarcane trucks on staging road
      this._addCaneTruck(roadGroup, -6, -7.5, 0);
      this._addCaneTruck(roadGroup, 8, -7.5, 0);

      this.scene.add(roadGroup);
    }

    _addCaneTruck(parent, x, z, rotY = 0) {
      const THREE = window.THREE;
      const g = new THREE.Group();
      // Cab
      this._addBox(g, 2.2, 1.9, 2.2, -2.6, 0.4, 0, this._mat('#F8FAFC'));
      this._addBox(g, 0.4, 0.8, 1.9, -3.55, 1.1, 0, this._mat('#1E293B'));
      // Trailer cage filled with sugarcane
      this._addBox(g, 5.4, 2.4, 2.4, 1.4, 0.5, 0, this._mat('#2B6CB0'));
      this._addBox(g, 5.0, 0.8, 2.1, 1.4, 2.6, 0, this._mat('#A3B86C'));
      g.position.set(x, 0, z);
      g.rotation.y = rotY;
      parent.add(g);
    }

    _buildWaterFeatures() {
      const THREE = window.THREE;
      const waterGroup = new THREE.Group();
      const dikeMat = this._mat('#C8C1B4', { roughness: 0.86 });
      const brickPathMat = this._mat(PALETTE.brickPath || '#B86B52', { roughness: 0.85 });
      const waterShallowMat = this._mat(PALETTE.waterShallow || '#6FA9B8', {
        roughness: 0.22,
        metalness: 0.18
      });
      const waterDeepMat = this._mat(PALETTE.waterDeep || '#4B7F8F', {
        roughness: 0.25,
        metalness: 0.15
      });

      // 1. Front-Left Kidney Retention Pond with Terracotta Jogging Path (สระน้ำหน้าโรงงาน + ทางเดินอิฐแดง)
      const pondShape = new THREE.Shape();
      pondShape.moveTo(-39, 36);
      pondShape.quadraticCurveTo(-42, 48, -30, 50);
      pondShape.quadraticCurveTo(-15, 51, -15, 42);
      pondShape.quadraticCurveTo(-15, 34, -27, 34);
      pondShape.quadraticCurveTo(-37, 34, -39, 36);

      // Reddish-brown walking path loop around front pond (ตามภาพมุมสูงจริง)
      const pathGeom = new THREE.ExtrudeGeometry(pondShape, {
        depth: 0.45,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 1.8,
        bevelThickness: 0.15
      });
      pathGeom.rotateX(Math.PI / 2);
      const pathMesh = new THREE.Mesh(pathGeom, brickPathMat);
      pathMesh.position.y = 0.45;
      pathMesh.receiveShadow = true;
      waterGroup.add(pathMesh);

      const bankGeom = new THREE.ExtrudeGeometry(pondShape, {
        depth: 0.62,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.65,
        bevelThickness: 0.22
      });
      bankGeom.rotateX(Math.PI / 2);
      const bankMesh = new THREE.Mesh(bankGeom, dikeMat);
      bankMesh.position.y = 0.62;
      bankMesh.receiveShadow = true;
      waterGroup.add(bankMesh);

      const waterGeom = new THREE.ExtrudeGeometry(pondShape, { depth: 0.3, bevelEnabled: false });
      waterGeom.rotateX(Math.PI / 2);
      const frontWaterMesh = new THREE.Mesh(waterGeom, waterShallowMat);
      frontWaterMesh.position.y = 0.56;
      waterGroup.add(frontWaterMesh);
      this.waterMeshes.push(frontWaterMesh);

      // 2. Eastern 9-Cell Stabilization & Cooling Water Ponds (กลุ่มบ่อบำบัดน้ำเสียและบ่อหล่อเย็น 9 ช่องฝั่งขวา)
      // Outer embankment pad for eastern multi-cell ponds
      this._addBox(waterGroup, 30, 0.6, 56, 44, 0, -2, dikeMat, false, true);

      const pondCells = [
        // Row 1 (North / Back)
        { x: 36.5, z: -21, w: 12.5, d: 11, mat: waterDeepMat, aerator: false },
        { x: 50.5, z: -21, w: 12.5, d: 11, mat: waterShallowMat, aerator: true },
        // Row 2
        { x: 36.5, z: -8.5, w: 12.5, d: 11.5, mat: waterShallowMat, aerator: true },
        { x: 50.5, z: -8.5, w: 12.5, d: 11.5, mat: waterDeepMat, aerator: true },
        // Row 3
        { x: 36.5, z: 4.5, w: 12.5, d: 11.5, mat: waterDeepMat, aerator: false },
        { x: 50.5, z: 4.5, w: 12.5, d: 11.5, mat: waterShallowMat, aerator: true },
        // Row 4 (South / Front smaller polishing cells)
        { x: 34.5, z: 18, w: 8.5, d: 12, mat: waterShallowMat, aerator: false },
        { x: 44.0, z: 18, w: 8.5, d: 12, mat: waterDeepMat, aerator: false },
        { x: 53.5, z: 18, w: 8.5, d: 12, mat: waterShallowMat, aerator: false }
      ];

      pondCells.forEach((cell) => {
        const wMesh = this._addBox(
          waterGroup,
          cell.w - 1.1,
          0.36,
          cell.d - 1.1,
          cell.x,
          0.42,
          cell.z,
          cell.mat,
          false,
          true
        );
        this.waterMeshes.push(wMesh);

        if (cell.aerator) {
          this._addBox(waterGroup, 1.3, 0.5, 1.3, cell.x - 2.6, 0.62, cell.z, this._mat('#F8FAFC'));
          this._addBox(waterGroup, 1.3, 0.5, 1.3, cell.x + 2.6, 0.62, cell.z, this._mat('#F8FAFC'));
        }
      });

      // 3. North-East Large Raw Water Reservoir Lake (อ่างเก็บน้ำดิบขนาดใหญ่ด้านหลังขวาตามภาพจริง)
      this._addBox(waterGroup, 26, 0.55, 15, 48, 0, -41, dikeMat, false, true);
      const rearLake = this._addBox(waterGroup, 23.5, 0.36, 12.6, 48, 0.38, -41, waterDeepMat, false, true);
      this.waterMeshes.push(rearLake);

      this.scene.add(waterGroup);
    }

    _buildFactoryZones() {
      const THREE = window.THREE;
      this.zoneMeshes.clear();
      this.interactables = [];

      ZONES.forEach((zone) => {
        const group = new THREE.Group();
        group.name = `zone-${zone.id}`;

        // Zone selection highlight ring / pad on the ground
        const padMat = new THREE.MeshBasicMaterial({
          color: hexToInt(PALETTE.statusOk || '#2EAD6B'),
          transparent: true,
          opacity: 0.0,
          depthWrite: false
        });
        const padGeom = new THREE.PlaneGeometry(zone.bounds.w + 2, zone.bounds.d + 2);
        padGeom.rotateX(-Math.PI / 2);
        const padMesh = new THREE.Mesh(padGeom, padMat);
        padMesh.position.set(zone.center.x, 0.48, zone.center.z);
        group.add(padMesh);

        // Border frame around zone when selected/hovered
        const borderGeom = new THREE.EdgesGeometry(new THREE.BoxGeometry(zone.bounds.w + 2, 0.6, zone.bounds.d + 2));
        const borderMat = new THREE.LineBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.0
        });
        const ringMesh = new THREE.LineSegments(borderGeom, borderMat);
        ringMesh.position.set(zone.center.x, 0.65, zone.center.z);
        group.add(ringMesh);

        // Build specific architectural landmarks per zone ID
        this._populateZoneArchitecture(zone.id, group);

        // Invisible bounding volume for forgiving touch/click raycasting on iPad
        const hitGeom = new THREE.BoxGeometry(zone.bounds.w, Math.max(zone.center.y + 8, 12), zone.bounds.d);
        const hitMat = new THREE.MeshBasicMaterial({
          visible: false
        });
        const hitMesh = new THREE.Mesh(hitGeom, hitMat);
        hitMesh.position.set(zone.center.x, Math.max(zone.center.y + 8, 12) / 2, zone.center.z);
        hitMesh.userData = { zoneId: zone.id };
        group.add(hitMesh);

        // Also tag all visible child meshes with zoneId for accurate raycasting
        group.traverse((child) => {
          if (child.isMesh) {
            child.userData.zoneId = zone.id;
          }
        });

        this.interactables.push(hitMesh);
        this.zoneMeshes.set(zone.id, {
          zone,
          group,
          hitMesh,
          padMesh,
          ringMesh
        });
        this.scene.add(group);
      });
    }

    _populateZoneArchitecture(zoneId, group) {
      const THREE = window.THREE;
      const whiteWall = this._mat(PALETTE.buildingWhite || '#F4F1EA');
      const shadowWall = this._mat(PALETTE.buildingShadow || '#D9D3C7');
      const steelRoof = this._mat(PALETTE.roofSteel || '#B7C0C7', { roughness: 0.55, metalness: 0.22 });
      const darkRoof = this._mat('#475569', { roughness: 0.5, metalness: 0.25 });
      const darkWindow = this._mat('#1E293B', { roughness: 0.3, metalness: 0.4 });
      const trimBlue = this._mat(PALETTE.trimBlue || '#2B6CB0');
      const redWall = this._mat(PALETTE.buildingRed || '#CC625A');
      const redRoof = this._mat(PALETTE.buildingRedRoof || '#9E4740');
      const greenRoof = this._mat(PALETTE.rearGreenRoof || '#4D946E');
      const blueWall = this._mat(PALETTE.rearBlueWall || '#2E77AE');
      const bagasseMat = this._mat(PALETTE.bagasseGold || '#C29B61', { roughness: 0.92 });
      const siloBlue = this._mat(PALETTE.siloBlue || '#8EC5D6', { roughness: 0.42, metalness: 0.22 });

      if (zoneId === 'front-building') {
        // ZONE-A1: อาคารสำนักงาน (ตึกแดง) ตรงกลางทางเข้า 1573 ต.วังใหม่ + กันสาดเทาเข้ม + สวนทางเดินขาว (ภาพ 3, 17, 19)
        const redBldgMesh = this._addBox(group, 15.5, 6.0, 8.8, 2, 0.2, 29.5, redWall);
        redBldgMesh.userData = { zoneId: 'front-building', label: 'อาคารสำนักงาน (ตึกแดง)' };
        this._addBox(group, 16.2, 0.7, 9.4, 2, 6.2, 29.5, redRoof);
        this._addGableRoof(group, 16.0, 1.8, 9.2, 2, 6.9, 29.5, redRoof, true);
        // Dark glass curtain wall & window bands
        this._addBox(group, 13.6, 1.6, 9.0, 2, 3.3, 29.5, darkWindow);
        this._addBox(group, 8.2, 2.2, 0.4, 2, 0.2, 33.9, darkWindow);
        // Dark-grey cantilevered drop-off canopy in front
        this._addBox(group, 9.8, 0.65, 5.6, 2, 3.4, 35.8, darkRoof);
        this._addBox(group, 0.45, 3.4, 0.45, -2.2, 0.2, 37.8, whiteWall);
        this._addBox(group, 0.45, 3.4, 0.45, 6.2, 0.2, 37.8, whiteWall);
        // White geometric landscaped walkways flanking the red building (ตามภาพถ่ายจริง)
        this._addBox(group, 6.5, 0.28, 0.7, -8.2, 0, 31.5, whiteWall, false, true);
        this._addBox(group, 6.5, 0.28, 0.7, 12.2, 0, 31.5, whiteWall, false, true);
      } else if (zoneId === 'front-left-block') {
        // ZONE-A2: ด่านชั่งอ้อย (Weighbridge ซุ้มคร่อมถนนซ้าย + ป้ายพุ่มไม้ ESC) & อาคารซ่อมบำรุง/โรงจอดรถหน้าซ้าย
        // 1. Outer-left large white gable-roof Workshop & Maintenance building (อาคารขาวหลังคาจั่วฝั่งซ้ายนอกถนน)
        const outerHall = new THREE.Group();
        this._addBox(outerHall, 14.5, 5.8, 9.5, 0, 0.2, 0, whiteWall);
        this._addGableRoof(outerHall, 15.2, 2.4, 10.2, 0, 6.0, 0, steelRoof, false);
        // Lower front white office bay attached to outer building
        this._addBox(outerHall, 14.0, 3.4, 4.0, 0, 0.2, 6.4, whiteWall);
        this._addBox(outerHall, 14.4, 0.4, 4.4, 0, 3.6, 6.4, steelRoof);
        outerHall.position.set(-46, 0, 22);
        group.add(outerHall);

        // Covered car parking shed behind outer-left building (โรงจอดรถหลังคาคลุมฝั่งซ้าย)
        this._addBox(group, 14, 2.6, 4.2, -47, 0.2, 9, steelRoof);
        // Parked white cars in left parking lot
        for (let px = -51; px <= -43; px += 2.6) {
          this._addBox(group, 1.2, 0.7, 2.1, px, 0.3, 12.5, whiteWall);
        }

        // 2. Drive-Thru Weighbridge Canopy spanning the left diagonal road (ซุ้มตราชั่งอ้อยคร่อมถนน)
        const canopyGroup = new THREE.Group();
        this._addBox(canopyGroup, 13.5, 0.75, 7.5, 0, 5.2, 0, steelRoof);
        this._addGableRoof(canopyGroup, 13.8, 1.2, 7.8, 0, 5.95, 0, steelRoof, true);
        this._addBox(canopyGroup, 0.6, 5.2, 0.6, -5.8, 0.2, -2.5, shadowWall);
        this._addBox(canopyGroup, 0.6, 5.2, 0.6, -5.8, 0.2, 2.5, shadowWall);
        this._addBox(canopyGroup, 0.6, 5.2, 0.6, 5.8, 0.2, -2.5, shadowWall);
        this._addBox(canopyGroup, 0.6, 5.2, 0.6, 5.8, 0.2, 2.5, shadowWall);
        // Weighbridge control booth
        this._addBox(canopyGroup, 3.2, 3.2, 2.8, -4.2, 0.2, 0, whiteWall);
        canopyGroup.position.set(-22, 0, 23);
        canopyGroup.rotation.y = 0.56;
        group.add(canopyGroup);

        // 3. Iconic "ESC" Topiary Bush Letters on lawn in front of weighbridge (พุ่มไม้ตัดแต่งตัวอักษร ESC)
        const bushMat = this._mat('#2E6F21');
        this._addBox(group, 1.6, 0.85, 0.9, -28.5, 0.2, 28.5, bushMat);
        this._addBox(group, 1.6, 0.85, 0.9, -26.2, 0.2, 27.3, bushMat);
        this._addBox(group, 1.6, 0.85, 0.9, -23.9, 0.2, 26.1, bushMat);

        // 4. Inner-left operational/utility white buildings (อาคารปฏิบัติการย่อยด้านในถนนซ้าย)
        this._addBox(group, 11.5, 3.8, 5.5, -24, 0.2, 11, whiteWall);
        this._addGableRoof(group, 12.0, 1.3, 6.0, -24, 4.0, 11, steelRoof, true);
      } else if (zoneId === 'production-west') {
        // ZONE-B1: โรงไฟฟ้าชีวมวล (อี เอส พลังงาน), หม้อไอน้ำแรงดันสูง, ถังไซโลสีฟ้าอ่อน, ปล่องสูง & โกดังตะวันตกสุด
        // 1. Far-West Sugar Warehouse with steep barn/gable roof (โกดังน้ำตาลฝั่งซ้ายสุดในภาพจริง)
        this._addBox(group, 14, 8.5, 20, -52, 0.2, -16, whiteWall);
        this._addGableRoof(group, 14.8, 4.6, 20.8, -52, 8.7, -16, steelRoof, false);

        // 2. Tall Square Multi-Story Biomass Power Plant & Boiler Building (อาคารหม้อไอน้ำแรงดันสูงและโรงไฟฟ้าชีวมวล)
        this._addBox(group, 15.5, 15.5, 14.5, -35, 0.2, -10, whiteWall);
        this._addGableRoof(group, 16.2, 2.8, 15.2, -35, 15.7, -10, steelRoof, true);
        // Industrial horizontal louvre & window bands
        this._addBox(group, 15.8, 1.5, 12.8, -35, 11.8, -10, darkWindow);
        this._addBox(group, 15.8, 1.2, 12.8, -35, 7.2, -10, darkWindow);
        // Blue roof/eave trim band
        this._addBox(group, 16.0, 0.65, 14.9, -35, 15.1, -10, trimBlue);

        // 3. Iconic Vertical Light-Blue Cylindrical Silo/Tank mounted in front of Boiler Building (ถังไซโลแนวตั้งสีฟ้าอ่อนด้านหน้าซ้ายตามภาพจริง!)
        const siloGeom = new THREE.CylinderGeometry(2.4, 2.4, 14.2, 24);
        const siloMesh = new THREE.Mesh(siloGeom, siloBlue);
        siloMesh.position.set(-37.5, 7.3, -1.2);
        siloMesh.castShadow = true;
        siloMesh.receiveShadow = true;
        group.add(siloMesh);

        const domeGeom = new THREE.SphereGeometry(2.4, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMesh = new THREE.Mesh(domeGeom, whiteWall);
        domeMesh.position.set(-37.5, 14.4, -1.2);
        group.add(domeMesh);

        // 4. Electrostatic Precipitator (ESP) & Tall Chimney Stack behind Boiler House (ถังดักฝุ่น ESP และปล่องระบายความร้อนสูง)
        this._addBox(group, 11, 11.5, 10, -31, 0.2, -23, shadowWall);
        this._addBox(group, 11.4, 0.6, 10.4, -31, 11.7, -23, steelRoof);

        const stackGeom = new THREE.CylinderGeometry(1.05, 1.75, 28, 20);
        const stackMesh = new THREE.Mesh(stackGeom, whiteWall);
        stackMesh.position.set(-25, 14.2, -26);
        stackMesh.castShadow = true;
        group.add(stackMesh);

        const bandGeom = new THREE.CylinderGeometry(1.1, 1.2, 2.5, 20);
        const bandMesh = new THREE.Mesh(bandGeom, redWall);
        bandMesh.position.set(-25, 26.2, -26);
        group.add(bandMesh);

        // Soft steam puffs above chimney stack
        for (let i = 0; i < 3; i++) {
          const puffGeom = new THREE.SphereGeometry(1.2 + i * 0.45, 12, 12);
          const puffMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.45 - i * 0.1
          });
          const puff = new THREE.Mesh(puffGeom, puffMat);
          puff.position.set(-25 + i * 0.8, 29.5 + i * 2.4, -26 - i * 0.5);
          group.add(puff);
          this.steamParticles.push({
            mesh: puff,
            baseY: 29.5 + i * 2.4,
            baseX: -25 + i * 0.8,
            phase: i * 2.1
          });
        }
      } else if (zoneId === 'production-center') {
        // ZONE-B2: อาคารต้มเคี่ยว-ปั่นน้ำตาล, โถงอาคารลูกหีบอ้อยแนวยาว, อาคารแล็บด้านหน้า & รางดัมพ์อ้อย
        // 1. Stepped Tall Sugar Boiling & Centrifugal Hall (อาคารต้มเคี่ยวและปั่นน้ำตาลหลายระดับชั้น)
        this._addBox(group, 13.5, 15.0, 14.0, -19, 0.2, -14, whiteWall);
        this._addGableRoof(group, 14.2, 2.8, 14.6, -19, 15.2, -14, steelRoof, false);
        this._addBox(group, 13.8, 1.4, 12.5, -19, 11.2, -14, darkWindow);
        // Lower front bay of Boiling Hall
        this._addBox(group, 11.0, 7.5, 6.5, -19, 0.2, -4.5, shadowWall);
        this._addGableRoof(group, 11.4, 1.5, 6.8, -19, 7.7, -4.5, steelRoof, true);

        // Structural steel bridge connecting West Boiler House (-35) to Boiling Hall (-19)
        this._addBox(group, 8.5, 2.4, 2.8, -27, 9.2, -12, steelRoof);

        // 2. Very Long Main Cane Milling & Extraction Hall (โถงอาคารลูกหีบอ้อยแนวยาวขนาบลานคอนกรีตกลางตามภาพจริง!)
        this._addBox(group, 28.0, 11.5, 13.5, -1, 0.2, -15, whiteWall);
        this._addGableRoof(group, 28.8, 3.2, 14.2, -1, 11.7, -15, steelRoof, true);
        // Characteristic blue fascia trim and dark ventilation strip along the long hall
        this._addBox(group, 28.4, 0.75, 13.9, -1, 11.0, -15, trimBlue);
        this._addBox(group, 26.5, 1.5, 13.8, -1, 8.2, -15, darkWindow);

        // 3. Cane Dumper / Unloading Bay Annex at East end of Milling Hall (จุดดัมพ์อ้อยและรางรับอ้อยท้ายโถงผลิต)
        this._addBox(group, 10.5, 8.2, 11.5, 17, 0.2, -14, shadowWall);
        this._addGableRoof(group, 11.2, 2.0, 12.0, 17, 8.4, -14, steelRoof, true);
        this._addBox(group, 8.5, 4.5, 9.5, 18.2, 0.2, -14, darkWindow);

        // 4. White Quality Lab & Operational Building in front of Milling Hall (อาคารขาวหลังคาจั่วหน้าโถงลูกหีบในภาพจริง)
        this._addBox(group, 13.5, 4.5, 6.2, -9, 0.2, -1.5, whiteWall);
        this._addGableRoof(group, 14.0, 1.5, 6.6, -9, 4.7, -1.5, steelRoof, true);
      } else if (zoneId === 'central-yard') {
        // ZONE-C1: ลานคอนกรีตกลางโรงงาน: สถานีอัดอากาศ ปั๊มสนาม และแนวต้นไม้คั่นลาน
        this._addBox(group, 7.2, 3.2, 5.0, -2, 0.2, 4, whiteWall);
        this._addBox(group, 7.6, 0.45, 5.4, -2, 3.4, 4, steelRoof);

        // Cooling / Transfer Pump Skid in yard
        this._addBox(group, 6.2, 0.6, 4.0, 12, 0.2, 8, shadowWall);
        this._addBox(group, 1.8, 1.6, 1.8, 10.5, 0.8, 8, siloBlue);
        this._addBox(group, 1.8, 1.6, 1.8, 13.5, 0.8, 8, siloBlue);
      } else if (zoneId === 'rear-block') {
        // ZONE-E1: อาคารคลังหลังคาเขียวด้านหลัง + ลานกองชานอ้อยในกรอบกำแพงกันฝุ่นสีน้ำเงินขนาดใหญ่
        // 1. Bright Green-Roofed Warehouse on Rear-Left (อาคารคลังหลังคาสีเขียวสดด้านหลัง)
        this._addBox(group, 18, 6.8, 11.5, -18, 0.2, -37, whiteWall);
        this._addGableRoof(group, 18.8, 2.8, 12.2, -18, 7.0, -37, greenRoof, true);

        // 2. Curved/Arched White Warehouse next to Green Roof (อาคารหลังคาโค้งสีขาวด้านหลัง)
        this._addBox(group, 13, 6.5, 10.5, -2, 0.2, -38, whiteWall);
        this._addGableRoof(group, 13.6, 2.2, 11.0, -2, 6.7, -38, steelRoof, true);

        // 3. Massive Rectangular Blue-Netted Bagasse Storage Yard (ลานกองชานอ้อยกรอบตาข่ายกันฝุ่นสีน้ำเงินขนาดใหญ่)
        const bx = 18, bz = -38, bw = 32, bd = 17, bh = 5.4;
        this._addBox(group, bw, 0.35, bd, bx, 0.2, bz, this._mat('#CBD5E1'));
        this._addBox(group, bw, bh, 0.7, bx, 0.2, bz - bd / 2, blueWall);
        this._addBox(group, bw, bh, 0.7, bx, 0.2, bz + bd / 2, blueWall);
        this._addBox(group, 0.7, bh, bd, bx - bw / 2, 0.2, bz, blueWall);
        this._addBox(group, 0.7, bh, bd, bx + bw / 2, 0.2, bz, blueWall);

        // Golden-brown 3D Bagasse Fuel Mounds inside the blue windbreak enclosure (กองชานอ้อยชีวมวล)
        const mound1 = new THREE.Mesh(new THREE.ConeGeometry(6.2, 4.8, 14), bagasseMat);
        mound1.position.set(bx - 6, 2.6, bz);
        group.add(mound1);
        const mound2 = new THREE.Mesh(new THREE.ConeGeometry(7.0, 5.2, 14), bagasseMat);
        mound2.position.set(bx + 5, 2.8, bz - 1);
        group.add(mound2);

        // Elevated Bagasse Conveyor Bridge linking Milling Hall & Blue Bagasse Yard
        const bagasseBridge = this._addBox(group, 22, 1.8, 2.2, 8, 7.2, -26, steelRoof);
        bagasseBridge.rotation.y = -0.35;
      } else if (zoneId === 'water-east') {
        // ZONE-D1: หอควบคุมน้ำสีฟ้า สถานีสูบน้ำริมบ่อบำบัด และถังโมลาส (ถังสีเหลืองตามภาพ 14, 39 ใน USER_CONFIRMED_OVERRIDES.md)
        // Elevated Blue Water Control House at NW corner of ponds (อาคารควบคุมน้ำสีฟ้าตามภาพจริง)
        this._addBox(group, 3.8, 3.2, 3.8, 28.5, 0.5, -16, trimBlue);
        this._addBox(group, 4.2, 0.4, 4.2, 28.5, 3.7, -16, steelRoof);

        // White pump station building along pond dike
        this._addBox(group, 7.5, 3.6, 5.2, 29, 0.5, 11, whiteWall);
        this._addGableRoof(group, 8.0, 1.2, 5.6, 29, 4.1, 11, steelRoof, false);

        // Twin Cylindrical Molasses Storage Tanks in Front-Right Corner:
        // ตาม USER_CONFIRMED_OVERRIDES.md ให้ใช้ชื่อ "ถังโมลาส" สำหรับถังสีเหลืองในภาพ 14, 39
        const molassesYellow = this._mat('#EAB308', { roughness: 0.52, metalness: 0.12 });
        const molassesRoof = this._mat('#CA8A04', { roughness: 0.55, metalness: 0.15 });
        [48, 55].forEach((sx, idx) => {
          const r = idx === 0 ? 3.8 : 3.4;
          const h = idx === 0 ? 7.5 : 6.2;
          const tankGeom = new THREE.CylinderGeometry(r, r, h, 24);
          const tankMesh = new THREE.Mesh(tankGeom, molassesYellow);
          tankMesh.position.set(sx, h / 2 + 0.2, 46);
          tankMesh.castShadow = true;
          tankMesh.userData = { zoneId: 'water-east', label: 'ถังโมลาส' };
          group.add(tankMesh);

          const roofGeom = new THREE.ConeGeometry(r + 0.2, 1.8, 24);
          const roofMesh = new THREE.Mesh(roofGeom, molassesRoof);
          roofMesh.position.set(sx, h + 1.1, 46);
          roofMesh.userData = { zoneId: 'water-east', label: 'ถังโมลาส' };
          group.add(roofMesh);
        });
      }
    }

    _buildLandscapingAndHills() {
      const THREE = window.THREE;
      const natureGroup = new THREE.Group();

      // 1. Soft Distant Horizon Mountains of Wang Sombun / Soi Dao (แนวภูเขาอำเภอวังสมบูรณ์ด้านหลัง #B6CFCE)
      const hillMat = this._mat(PALETTE.horizonMist || '#B6CFCE', { roughness: 0.95 });
      const hills = [
        { x: -52, z: -66, r: 28, h: 18 },
        { x: -18, z: -68, r: 34, h: 22 },
        { x: 18,  z: -67, r: 30, h: 17 },
        { x: 52,  z: -65, r: 26, h: 15 }
      ];
      hills.forEach((h) => {
        const geom = new THREE.ConeGeometry(h.r, h.h, 16);
        const mesh = new THREE.Mesh(geom, hillMat);
        mesh.position.set(h.x, h.h / 2 - 1, h.z);
        natureGroup.add(mesh);
      });

      // 2. Tall Pine / Casuarina Windbreak Rows via THREE.InstancedMesh (แนวสนประดิพัทธ์รอบลานชานอ้อย ขอบขวา และขอบซ้ายตามภาพจริง)
      const trunkMat = this._mat('#6D4C41');
      const pineMat = this._mat('#3B6E4C');
      const treeMat = this._mat('#558B56');

      const pinePositions = [];
      // Rear windbreak row behind Blue Bagasse Enclosure
      for (let x = -36; x <= 42; x += 4.2) {
        pinePositions.push({ x, z: -53 + (Math.abs(x) % 2), scale: 1.05 + (Math.abs(x) % 3) * 0.14 });
      }
      // Front- wall of Blue Bagasse Enclosure (pine screen in front of blue wall as seen in aerial photo)
      for (let x = 2; x <= 32; x += 4.5) {
        pinePositions.push({ x, z: -28.5, scale: 0.95 });
      }
      // Continuous Right-hand perimeter windbreak line (แนวต้นสนยาวด้านขวาของโรงงานในภาพจริง)
      for (let z = -18; z <= 48; z += 4.2) {
        pinePositions.push({ x: 56 - (z + 18) * 0.22, z, scale: 1.0 + (Math.abs(z) % 2) * 0.18 });
      }
      // Left-front perimeter hedge along front pond
      for (let z = 28; z <= 56; z += 4.2) {
        pinePositions.push({ x: -45, z, scale: 0.92 });
      }

      if (typeof THREE.InstancedMesh === 'function' && pinePositions.length > 0) {
        const count = pinePositions.length;
        const trunkGeom = new THREE.CylinderGeometry(0.35, 0.5, 2.6, 7);
        const cone1Geom = new THREE.ConeGeometry(1.8, 5.5, 8);
        const cone2Geom = new THREE.ConeGeometry(1.35, 4.5, 8);

        const trunkInst = new THREE.InstancedMesh(trunkGeom, trunkMat, count);
        const cone1Inst = new THREE.InstancedMesh(cone1Geom, pineMat, count);
        const cone2Inst = new THREE.InstancedMesh(cone2Geom, pineMat, count);
        cone1Inst.castShadow = true;
        cone2Inst.castShadow = true;

        const mat4 = new THREE.Matrix4();
        const posV = new THREE.Vector3();
        const quat = new THREE.Quaternion();
        const scaleV = new THREE.Vector3();

        pinePositions.forEach((p, idx) => {
          const s = p.scale;
          scaleV.set(s, s, s);

          posV.set(p.x, 1.3 * s, p.z);
          mat4.compose(posV, quat, scaleV);
          trunkInst.setMatrixAt(idx, mat4);

          posV.set(p.x, 4.6 * s, p.z);
          mat4.compose(posV, quat, scaleV);
          cone1Inst.setMatrixAt(idx, mat4);

          posV.set(p.x, 7.2 * s, p.z);
          mat4.compose(posV, quat, scaleV);
          cone2Inst.setMatrixAt(idx, mat4);
        });

        trunkInst.instanceMatrix.needsUpdate = true;
        cone1Inst.instanceMatrix.needsUpdate = true;
        cone2Inst.instanceMatrix.needsUpdate = true;
        natureGroup.add(trunkInst);
        natureGroup.add(cone1Inst);
        natureGroup.add(cone2Inst);
      } else {
        pinePositions.forEach((p) => {
          this._addPineTree(natureGroup, p.x, p.z, trunkMat, pineMat, p.scale);
        });
      }

      // 3. Stylized Shade Trees lining the Central Concrete Yard, Red Building, and Pond
      const treeCoords = [
        // Avenue of shade trees dividing the Central Yard and Pond/Staging Road (แนวต้นไม้ร่มรื่นริมลานคอนกรีตในภาพจริง)
        [2, -10], [8, -10], [14, -10], [20, -10], [25, -8], [25, 0], [25, 8], [25, 16],
        // Shade trees along left side of Central Yard & Red Building
        [-14, 28], [-11, 22], [-8, 16], [12, 28], [16, 22],
        // Around Front Pond
        [-38, 48], [-22, 50], [-14, 42]
      ];
      treeCoords.forEach(([tx, tz], idx) => {
        this._addRoundTree(natureGroup, tx, tz, trunkMat, idx % 2 === 0 ? treeMat : pineMat, 0.88 + (idx % 3) * 0.14);
      });

      this.scene.add(natureGroup);
    }

    _addPineTree(parent, x, z, trunkMat, foliageMat, scale = 1) {
      const THREE = window.THREE;
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.6, 7), trunkMat);
      trunk.position.y = 1.3;
      g.add(trunk);

      const cone1 = new THREE.Mesh(new THREE.ConeGeometry(1.8, 5.5, 8), foliageMat);
      cone1.position.y = 4.6;
      cone1.castShadow = true;
      g.add(cone1);

      const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.35, 4.5, 8), foliageMat);
      cone2.position.y = 7.2;
      cone2.castShadow = true;
      g.add(cone2);

      g.position.set(x, 0, z);
      g.scale.setScalar(scale);
      parent.add(g);
    }

    _addRoundTree(parent, x, z, trunkMat, foliageMat, scale = 1) {
      const THREE = window.THREE;
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 2.2, 7), trunkMat);
      trunk.position.y = 1.1;
      g.add(trunk);

      const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(2.1, 1), foliageMat);
      crown.position.y = 3.4;
      crown.castShadow = true;
      g.add(crown);

      g.position.set(x, 0, z);
      g.scale.setScalar(scale);
      parent.add(g);
    }

    // ========================================================================
    // HTML OVERLAY PINS & WALKING ROUTE OVERLAY
    // ========================================================================
    _buildHTMLPins() {
      if (!this.pinLayer) return;
      this.pinLayer.innerHTML = '';
      this.pinElements.clear();
      this._lastPinCameraKey = '';

      ZONES.forEach((zone) => {
        const pin = document.createElement('div');
        pin.className = 'f3d-zone-pin status-neutral';
        pin.dataset.zoneId = zone.id;
        pin.setAttribute('role', 'button');
        pin.setAttribute('tabindex', '0');
        pin.innerHTML = `
          <div class="f3d-pin-card">
            <span class="f3d-pin-dot"></span>
            <span class="f3d-pin-name">${zone.shortName || zone.name}</span>
            <span class="f3d-pin-count">0</span>
            <span class="f3d-pin-route-badge" style="display:none;"></span>
          </div>
          <div class="f3d-pin-stem"></div>
        `;
        pin.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectZone(zone.id, { animate: true });
        });
        pin.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.selectZone(zone.id, { animate: true });
          }
        });
        this.pinLayer.appendChild(pin);
        this.pinElements.set(zone.id, pin);
      });
    }

    _updatePinPositions(force = false) {
      if (this.usingFallback2D || !this.camera || !this.renderer || !this.pinLayer) return;
      const THREE = window.THREE;
      const width = this.renderer.domElement.clientWidth;
      const height = this.renderer.domElement.clientHeight;
      if (!width || !height) return;

      const camKey = `${width}x${height}:${this.target.x.toFixed(2)},${this.target.y.toFixed(2)},${this.target.z.toFixed(2)}:${this.spherical.theta.toFixed(4)},${this.spherical.phi.toFixed(4)}:${this.zoom.toFixed(4)}`;
      if (!force && camKey === this._lastPinCameraKey) return;
      this._lastPinCameraKey = camKey;

      const tempV = new THREE.Vector3();
      ZONES.forEach((zone) => {
        const pin = this.pinElements.get(zone.id);
        if (!pin) return;
        tempV.set(zone.center.x, zone.center.y, zone.center.z);
        tempV.project(this.camera);

        const x = (tempV.x * 0.5 + 0.5) * width;
        const y = (-(tempV.y * 0.5) + 0.5) * height;
        if (pin._lastX === undefined || Math.abs(x - pin._lastX) > 0.2 || Math.abs(y - pin._lastY) > 0.2) {
          pin.style.left = `${x.toFixed(1)}px`;
          pin.style.top = `${y.toFixed(1)}px`;
          pin._lastX = x;
          pin._lastY = y;
        }
      });
    }

    // ========================================================================
    // DATA UPDATE & ROUTE VISUALIZATION
    // ========================================================================
    updateData(payload = {}) {
      this._lastPayload = payload;
      const zoneStatsObj = payload.zoneStats || {};
      this.enrichedMachines = Array.isArray(payload.enrichedMachines) ? payload.enrichedMachines : [];
      this.activeLayer = payload.activeLayer || 'health';
      if (payload.selectedMachineId !== undefined) {
        this.selectedMachineId = payload.selectedMachineId;
      }
      this.activeRouteStops = payload.activeRouteStops || [];
      this.filterState = payload.filterState || { matchingZoneIds: null };

      this.zoneStats.clear();
      Object.keys(zoneStatsObj).forEach((zid) => {
        this.zoneStats.set(zid, zoneStatsObj[zid]);
      });

      // Map route stop numbers per zone
      const routeStopByZone = new Map();
      this.activeRouteStops.forEach((stop) => {
        if (stop.zoneId) {
          if (!routeStopByZone.has(stop.zoneId)) routeStopByZone.set(stop.zoneId, []);
          routeStopByZone.get(stop.zoneId).push(stop.stopNumber);
        }
      });

      ZONES.forEach((zone) => {
        const st = this.zoneStats.get(zone.id) || {
          total: 0,
          inspectedToday: 0,
          pendingToday: 0,
          openDefects: 0,
          status: 'neutral',
          pinSummaryText: ''
        };

        const statusClass =
          st.status === 'defect' ? 'status-defect' :
          st.status === 'warning' ? 'status-warning' :
          st.status === 'pending' ? 'status-pending' :
          st.status === 'ok' ? 'status-ok' :
          st.status === 'stale' ? 'status-stale' : 'status-neutral';

        const statusHex =
          st.status === 'defect' ? (PALETTE.statusDefect || '#E25555') :
          st.status === 'warning' ? '#F59E0B' :
          st.status === 'pending' ? (PALETTE.statusPending || '#E9A93B') :
          st.status === 'ok' ? (PALETTE.statusOk || '#2EAD6B') :
          st.status === 'stale' ? '#64748B' : (PALETTE.statusNeutral || '#7B8793');

        const isDimmed = this.filterState.matchingZoneIds &&
          !this.filterState.matchingZoneIds.has(zone.id);

        // Update HTML pin with DOM diffing (P1-3)
        const pin = this.pinElements.get(zone.id);
        if (pin) {
          const nextClass = `f3d-zone-pin ${statusClass}` +
            (this.selectedZoneId === zone.id ? ' selected' : '') +
            (isDimmed ? ' dimmed' : '');
          if (pin._lastClass !== nextClass) {
            pin.className = nextClass;
            pin._lastClass = nextClass;
          }

          const countEl = pin.querySelector('.f3d-pin-count');
          const nextCountText = st.pinSummaryText ||
            (st.total > 0 ? `${st.inspectedToday}/${st.total} เครื่อง` : (zone.type === 'landmark' ? 'จุดสังเกต' : '0 เครื่อง'));
          if (countEl && pin._lastCountText !== nextCountText) {
            countEl.textContent = nextCountText;
            pin._lastCountText = nextCountText;
          }

          const routeBadge = pin.querySelector('.f3d-pin-route-badge');
          const stops = routeStopByZone.get(zone.id);
          const nextRouteText = stops && stops.length > 0 ? `ลำดับ ${stops.join(',')}` : '';
          if (routeBadge && pin._lastRouteText !== nextRouteText) {
            if (nextRouteText) {
              routeBadge.style.display = 'inline-flex';
              routeBadge.textContent = nextRouteText;
            } else {
              routeBadge.style.display = 'none';
            }
            pin._lastRouteText = nextRouteText;
          }
        }

        // Update 3D pad color
        const zm = this.zoneMeshes.get(zone.id);
        if (zm && zm.padMesh) {
          zm.padMesh.material.color.setHex(hexToInt(statusHex));
          const isSelected = this.selectedZoneId === zone.id;
          const isHovered = this.hoveredZoneId === zone.id;
          zm.padMesh.material.opacity = isSelected ? 0.38 : isHovered ? 0.24 : (st.status === 'defect' ? 0.2 : st.status === 'warning' ? 0.14 : 0.0);
          zm.ringMesh.material.opacity = isSelected ? 0.95 : isHovered ? 0.55 : 0.0;
        }
      });

      if (this.usingFallback2D) {
        this._update2DFallbackData();
      } else {
        this._rebuild3DMachineMarkers();
        this._rebuild3DRouteLine();
        this._updatePinPositions(true);
        this.invalidate('updateData', 800);
      }
    }

    _rebuild3DMachineMarkers() {
      if (!this.scene || !this.machineMarkersGroup || !window.THREE) return;
      const THREE = window.THREE;

      // Remove old machine markers from interactables & dispose
      this.interactables = this.interactables.filter((obj) => !obj.userData || !obj.userData.machineId);
      while (this.machineMarkersGroup.children.length > 0) {
        const child = this.machineMarkersGroup.children[0];
        this.machineMarkersGroup.remove(child);
        child.traverse((o) => {
          if (o.geometry) o.geometry.dispose();
          if (o.material) o.material.dispose();
        });
      }
      this.machineMarkerMeshes.clear();

      if (!Array.isArray(this.enrichedMachines) || this.enrichedMachines.length === 0) return;

      // Group machines by zone to offset any machines sharing {0,0,0}
      const zoneBuckets = new Map();
      this.enrichedMachines.forEach((m) => {
        if (!m.zoneId) return;
        if (!zoneBuckets.has(m.zoneId)) zoneBuckets.set(m.zoneId, []);
        zoneBuckets.get(m.zoneId).push(m);
      });

      zoneBuckets.forEach((machinesInZone, zoneId) => {
        const zone = ZONES.find((z) => z.id === zoneId);
        if (!zone) return;

        machinesInZone.forEach((m, idx) => {
          const offset = m.placement && m.placement.anchorOffset ? m.placement.anchorOffset : { x: 0, y: 0, z: 0 };
          let ox = Number(offset.x) || 0;
          let oy = Number(offset.y) || 1.2;
          let oz = Number(offset.z) || 0;
          if (ox === 0 && oz === 0 && machinesInZone.length > 1) {
            const angle = (idx / machinesInZone.length) * Math.PI * 2;
            ox = Math.cos(angle) * 4.2;
            oz = Math.sin(angle) * 4.2;
          }

          const wx = zone.center.x + ox;
          const wy = Math.max(1.4, oy + 1.2);
          const wz = zone.center.z + oz;

          const colorHex = m.layerColorHex || '#2EAD6B';
          const isSelected = Number(this.selectedMachineId) === Number(m.id);

          const mGroup = new THREE.Group();
          mGroup.position.set(wx, wy, wz);

          // Pedestal pin cylinder
          const bodyGeom = new THREE.CylinderGeometry(isSelected ? 1.25 : 0.95, 0.55, isSelected ? 3.2 : 2.4, 14);
          const bodyMat = new THREE.MeshStandardMaterial({
            color: hexToInt(colorHex),
            roughness: 0.35,
            metalness: 0.15,
            emissive: hexToInt(colorHex),
            emissiveIntensity: isSelected ? 0.45 : 0.18
          });
          const bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
          bodyMesh.castShadow = true;
          bodyMesh.userData = { zoneId: zone.id, machineId: m.id };
          mGroup.add(bodyMesh);

          // Selection ring around machine marker
          const ringGeom = new THREE.RingGeometry(1.3, 1.9, 20);
          ringGeom.rotateX(-Math.PI / 2);
          const ringMat = new THREE.MeshBasicMaterial({
            color: isSelected ? 0xffffff : hexToInt(colorHex),
            side: THREE.DoubleSide,
            transparent: true,
            opacity: isSelected ? 0.95 : 0.45
          });
          const ringMesh = new THREE.Mesh(ringGeom, ringMat);
          ringMesh.position.y = -0.8;
          mGroup.add(ringMesh);

          // Forgiving touch hit sphere for iPad
          const hitGeom = new THREE.SphereGeometry(2.4, 8, 8);
          const hitMat = new THREE.MeshBasicMaterial({ visible: false });
          const hitMesh = new THREE.Mesh(hitGeom, hitMat);
          hitMesh.userData = { zoneId: zone.id, machineId: m.id };
          mGroup.add(hitMesh);

          this.interactables.push(hitMesh);
          this.machineMarkersGroup.add(mGroup);
          this.machineMarkerMeshes.set(Number(m.id), {
            machine: m,
            group: mGroup,
            hitMesh,
            bodyMesh,
            ringMesh,
            worldPos: { x: wx, y: wy, z: wz }
          });
        });
      });
    }

    _rebuild3DRouteLine() {
      if (!this.scene || !window.THREE) return;
      const THREE = window.THREE;
      if (this.routeGroup) {
        this.scene.remove(this.routeGroup);
        this.routeGroup.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) obj.material.dispose();
        });
        this.routeGroup = null;
      }

      if (!this.activeRouteStops || this.activeRouteStops.length < 1) return;

      const points = [];
      this.activeRouteStops.forEach((stop) => {
        const markerEntry = this.machineMarkerMeshes.get(Number(stop.machineId));
        if (markerEntry && markerEntry.worldPos) {
          points.push(new THREE.Vector3(markerEntry.worldPos.x, markerEntry.worldPos.y + 1.2, markerEntry.worldPos.z));
        } else {
          const z = ZONES.find((item) => item.id === stop.zoneId);
          if (z) {
            points.push(new THREE.Vector3(z.center.x, 2.5, z.center.z));
          }
        }
      });

      if (points.length < 1) return;

      this.routeGroup = new THREE.Group();
      if (points.length >= 2) {
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeom = new THREE.TubeGeometry(curve, Math.max(points.length * 12, 24), 0.52, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({
          color: 0x059669,
          transparent: true,
          opacity: 0.88
        });
        const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
        this.routeGroup.add(tubeMesh);
      }

      points.forEach((pt) => {
        const markerGeom = new THREE.SphereGeometry(1.15, 14, 14);
        const markerMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
        const marker = new THREE.Mesh(markerGeom, markerMat);
        marker.position.copy(pt);
        this.routeGroup.add(marker);
      });

      this.scene.add(this.routeGroup);
    }

    // ========================================================================
    // CAMERA & SELECTION CONTROLS
    // ========================================================================
    selectZone(zoneId, opts = { animate: true, silent: false }) {
      this.selectedZoneId = zoneId;
      const zone = ZONES.find((z) => z.id === zoneId);

      ZONES.forEach((z) => {
        const pin = this.pinElements.get(z.id);
        if (pin) pin.classList.toggle('selected', z.id === zoneId);

        const zm = this.zoneMeshes.get(z.id);
        if (zm) {
          const isSel = z.id === zoneId;
          zm.padMesh.material.opacity = isSel ? 0.38 : 0.0;
          zm.ringMesh.material.opacity = isSel ? 0.95 : 0.0;
        }
      });

      if (this.usingFallback2D) {
        this._update2DFallbackSelection();
      } else if (zone && opts.animate !== false) {
        this.desiredTarget = { ...zone.cameraTarget };
        this.desiredZoom = zone.cameraZoom || 1.6;
        if (this.reducedMotion) {
          this._applyCameraTransform(true);
        }
        this.invalidate('selectZone', 900);
      } else {
        this.invalidate('selectZone-static', 300);
      }

      if (!opts.silent && this.onSelectZone) {
        this.onSelectZone(zoneId);
      }
    }

    selectMachine(machineId, opts = { animate: true, silent: false }) {
      this.selectedMachineId = machineId ? Number(machineId) : null;
      const markerEntry = this.selectedMachineId ? this.machineMarkerMeshes.get(this.selectedMachineId) : null;

      if (markerEntry && markerEntry.machine && markerEntry.machine.zoneId) {
        this.selectedZoneId = markerEntry.machine.zoneId;
        if (!this.usingFallback2D && opts.animate !== false) {
          this.desiredTarget = {
            x: markerEntry.worldPos.x,
            y: Math.max(2, markerEntry.worldPos.y),
            z: markerEntry.worldPos.z
          };
          this.desiredZoom = Math.max(this.desiredZoom, 1.85);
          if (this.reducedMotion) {
            this._applyCameraTransform(true);
          }
        }
      }

      this._rebuild3DMachineMarkers();
      this.invalidate('selectMachine', 900);

      if (!opts.silent && this.onSelectMachine) {
        this.onSelectMachine(this.selectedMachineId);
      }
    }

    setCameraPreset(presetId) {
      const preset = PRESETS[presetId] || PRESETS.overview;
      if (!preset) return;

      this.desiredTarget = { ...(preset.target || { x: 0, y: 0, z: 0 }) };
      this.desiredZoom = preset.zoom || 1.04;

      if (preset.spherical) {
        this.desiredSpherical = {
          theta: preset.spherical.theta,
          phi: preset.spherical.phi,
          radius: preset.spherical.radius || 132
        };
      } else if (presetId === 'overview') {
        this.desiredSpherical = { theta: -0.54, phi: 0.92, radius: 132 };
      } else if (presetId === 'aerial') {
        this.desiredSpherical = { theta: 0.16, phi: 0.88, radius: 132 };
      } else if (presetId === 'production') {
        this.desiredSpherical = { theta: -0.44, phi: 0.84, radius: 125 };
      } else if (presetId === 'water') {
        this.desiredSpherical = { theta: 0.52, phi: 0.86, radius: 125 };
      } else if (presetId === 'topplan') {
        this.desiredSpherical = { theta: 0.0, phi: 0.22, radius: 140 };
      }

      if (this.reducedMotion && !this.usingFallback2D) {
        this._applyCameraTransform(true);
      }
      this.invalidate('cameraPreset', 950);
      if (this.onCameraPresetChange) {
        this.onCameraPresetChange(presetId);
      }
    }

    adjustZoom(delta) {
      this.desiredZoom = Math.max(0.68, Math.min(2.6, this.desiredZoom + delta));
      if (this.reducedMotion && !this.usingFallback2D) {
        this._applyCameraTransform(true);
      }
      this.invalidate('adjustZoom', 600);
    }

    _applyCameraTransform(immediate = false) {
      if (!this.camera) return false;
      const lerp = immediate ? 1.0 : 0.14;

      const dx = this.desiredTarget.x - this.target.x;
      const dy = this.desiredTarget.y - this.target.y;
      const dz = this.desiredTarget.z - this.target.z;
      const dTheta = this.desiredSpherical.theta - this.spherical.theta;
      const dPhi = this.desiredSpherical.phi - this.spherical.phi;
      const dZoom = this.desiredZoom - this.zoom;

      const deltaMag = Math.abs(dx) + Math.abs(dy) + Math.abs(dz) + Math.abs(dTheta) * 20 + Math.abs(dPhi) * 20 + Math.abs(dZoom) * 10;

      this.target.x += dx * lerp;
      this.target.y += dy * lerp;
      this.target.z += dz * lerp;

      this.spherical.theta += dTheta * lerp;
      this.spherical.phi += dPhi * lerp;
      this.zoom += dZoom * lerp;

      const r = this.spherical.radius;
      const sinPhi = Math.sin(this.spherical.phi);
      const cx = this.target.x + r * sinPhi * Math.sin(this.spherical.theta);
      const cy = this.target.y + r * Math.cos(this.spherical.phi);
      const cz = this.target.z + r * sinPhi * Math.cos(this.spherical.theta);

      this.camera.position.set(cx, cy, cz);
      this.camera.lookAt(this.target.x, this.target.y, this.target.z);
      if (Math.abs(this.camera.zoom - this.zoom) > 0.0005 || immediate) {
        this.camera.zoom = this.zoom;
        this.camera.updateProjectionMatrix();
      }
      return deltaMag > 0.002;
    }

    // ========================================================================
    // POINTER & TOUCH INTERACTION (iPad + Mouse + Context Recovery)
    // ========================================================================
    _bindPointerEvents(domEl) {
      this._onPointerDown = (e) => {
        this.pointerState.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (this.pointerState.activePointers.size === 1) {
          this.pointerState.isDown = true;
          this.pointerState.button = e.button || 0;
          this.pointerState.startX = e.clientX;
          this.pointerState.startY = e.clientY;
          this.pointerState.lastX = e.clientX;
          this.pointerState.lastY = e.clientY;
          this.pointerState.movedDistance = 0;
        } else if (this.pointerState.activePointers.size === 2) {
          const pts = Array.from(this.pointerState.activePointers.values());
          this.pointerState.lastPinchDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          this.pointerState.lastPinchCenter = {
            x: (pts[0].x + pts[1].x) / 2,
            y: (pts[0].y + pts[1].y) / 2
          };
        }
        this.invalidate('pointerdown', 500);
      };

      this._onPointerMove = (e) => {
        if (this.pointerState.activePointers.has(e.pointerId)) {
          this.pointerState.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        }

        if (this.pointerState.activePointers.size === 2) {
          // 2-finger pinch zoom & pan on iPad
          const pts = Array.from(this.pointerState.activePointers.values());
          const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
          const center = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };

          if (this.pointerState.lastPinchDist > 0) {
            const zoomDelta = (dist - this.pointerState.lastPinchDist) * 0.005;
            this.desiredZoom = Math.max(0.68, Math.min(2.6, this.desiredZoom + zoomDelta));
          }
          if (this.pointerState.lastPinchCenter) {
            const dx = center.x - this.pointerState.lastPinchCenter.x;
            const dy = center.y - this.pointerState.lastPinchCenter.y;
            this._panTargetByScreenDelta(dx, dy);
          }
          this.pointerState.lastPinchDist = dist;
          this.pointerState.lastPinchCenter = center;
          this.pointerState.movedDistance = 99;
          this.invalidate('pinch', 500);
          return;
        }

        if (!this.pointerState.isDown) {
          this._handleHoverRaycast(e);
          return;
        }

        const dx = e.clientX - this.pointerState.lastX;
        const dy = e.clientY - this.pointerState.lastY;
        this.pointerState.lastX = e.clientX;
        this.pointerState.lastY = e.clientY;
        this.pointerState.movedDistance += Math.hypot(dx, dy);

        if (this.pointerState.button === 2 || e.shiftKey) {
          this._panTargetByScreenDelta(dx, dy);
        } else {
          // Smooth 360° Isometric Orbit Rotation
          this.desiredSpherical.theta -= dx * 0.0055;
          this.desiredSpherical.phi = Math.max(0.18, Math.min(1.18, this.desiredSpherical.phi - dy * 0.0045));
        }
        this.invalidate('drag', 500);
      };

      this._onPointerUp = (e) => {
        this.pointerState.activePointers.delete(e.pointerId);
        if (this.pointerState.activePointers.size === 0) {
          const wasTap = this.pointerState.isDown && this.pointerState.movedDistance <= 6;
          this.pointerState.isDown = false;
          if (wasTap && this.pointerState.button === 0) {
            this._handleTapRaycast(e);
          }
        }
      };

      this._onPointerCancel = () => {
        this.pointerState.activePointers.clear();
        this.pointerState.isDown = false;
        this.pointerState.lastPinchDist = 0;
        this.pointerState.lastPinchCenter = null;
      };

      this._onWheel = (e) => {
        e.preventDefault();
        const delta = e.deltaY < 0 ? 0.12 : -0.12;
        this.adjustZoom(delta);
      };

      this._onContextMenu = (e) => e.preventDefault();

      this._onWebGLContextLost = (e) => {
        e.preventDefault();
        console.warn('WebGL context lost on Factory3DScene; pausing loop.');
        if (this.rafId) {
          cancelAnimationFrame(this.rafId);
          this.rafId = null;
        }
      };

      this._onWebGLContextRestored = () => {
        console.info('WebGL context restored; rebuilding 3D scene.');
        this.invalidate('context-restored', 1000);
      };

      domEl.addEventListener('pointerdown', this._onPointerDown);
      domEl.addEventListener('pointermove', this._onPointerMove);
      window.addEventListener('pointerup', this._onPointerUp);
      window.addEventListener('pointercancel', this._onPointerCancel);
      window.addEventListener('blur', this._onPointerCancel);
      domEl.addEventListener('wheel', this._onWheel, { passive: false });
      domEl.addEventListener('contextmenu', this._onContextMenu);
      domEl.addEventListener('webglcontextlost', this._onWebGLContextLost, false);
      domEl.addEventListener('webglcontextrestored', this._onWebGLContextRestored, false);
    }

    _panTargetByScreenDelta(dx, dy) {
      const panScale = 0.11 / Math.max(this.zoom, 0.7);
      const cosT = Math.cos(this.spherical.theta);
      const sinT = Math.sin(this.spherical.theta);

      this.desiredTarget.x -= (dx * cosT + dy * sinT) * panScale;
      this.desiredTarget.z -= (-dx * sinT + dy * cosT) * panScale;

      this.desiredTarget.x = Math.max(-55, Math.min(55, this.desiredTarget.x));
      this.desiredTarget.z = Math.max(-55, Math.min(55, this.desiredTarget.z));
    }

    _raycastHit(clientX, clientY) {
      if (!this.renderer || !this.camera || !this.raycaster) return null;
      const rect = this.renderer.domElement.getBoundingClientRect();
      const x = ((clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((clientY - rect.top) / rect.height) * 2 + 1;
      this.raycaster.setFromCamera({ x, y }, this.camera);
      const hits = this.raycaster.intersectObjects(this.interactables, false);
      if (hits.length > 0) {
        // Prioritize machine marker hit over broad zone hit box
        const machineHit = hits.find((h) => h.object && h.object.userData && h.object.userData.machineId);
        if (machineHit) {
          return {
            zoneId: machineHit.object.userData.zoneId,
            machineId: machineHit.object.userData.machineId
          };
        }
        if (hits[0].object && hits[0].object.userData && hits[0].object.userData.zoneId) {
          return {
            zoneId: hits[0].object.userData.zoneId,
            machineId: null
          };
        }
      }
      return null;
    }

    _handleHoverRaycast(e) {
      const hit = this._raycastHit(e.clientX, e.clientY);
      const zoneId = hit ? hit.zoneId : null;
      const machineId = hit ? hit.machineId : null;
      if (zoneId !== this.hoveredZoneId || machineId !== this.hoveredMachineId) {
        this.hoveredZoneId = zoneId;
        this.hoveredMachineId = machineId;
        if (this.renderer && this.renderer.domElement) {
          this.renderer.domElement.style.cursor = zoneId ? 'pointer' : 'grab';
        }
        ZONES.forEach((z) => {
          const zm = this.zoneMeshes.get(z.id);
          if (zm) {
            const isSel = z.id === this.selectedZoneId;
            const isHov = z.id === this.hoveredZoneId;
            zm.padMesh.material.opacity = isSel ? 0.38 : isHov ? 0.24 : 0.0;
            zm.ringMesh.material.opacity = isSel ? 0.95 : isHov ? 0.55 : 0.0;
          }
        });
        this.invalidate('hover', 250);
      }
    }

    _handleTapRaycast(e) {
      const hit = this._raycastHit(e.clientX, e.clientY);
      if (hit && hit.machineId) {
        this.selectMachine(hit.machineId, { animate: true });
      } else if (hit && hit.zoneId) {
        this.selectZone(hit.zoneId, { animate: true });
      }
    }

    // ========================================================================
    // ANIMATION LOOP (RENDER-ON-DEMAND + ECO MODE SUPPORT) & RESIZE
    // ========================================================================
    _animate(now) {
      if (this.isDisposed || this.usingFallback2D || document.hidden) {
        this.rafId = null;
        return;
      }

      const elapsed = (now - (this.clockStart || now)) * 0.001;
      const cameraMoving = this._applyCameraTransform(false);

      const animateAmbient = !this.reducedMotion && !this.ecoMode;
      if (animateAmbient) {
        // Subtle chimney steam animation
        this.steamParticles.forEach((sp) => {
          const cycle = (elapsed * 0.6 + sp.phase) % 3.0;
          sp.mesh.position.y = sp.baseY + cycle * 2.2;
          sp.mesh.position.x = sp.baseX + Math.sin(elapsed + sp.phase) * 0.6;
          sp.mesh.material.opacity = Math.max(0, 0.42 * (1 - cycle / 3.0));
        });
      }

      this._updatePinPositions();
      this.renderer.render(this.scene, this.camera);
      this.needsRender = false;

      // Render-on-Demand: keep looping if ambient steam is active, or while camera/interaction is settling
      if (animateAmbient || cameraMoving || now < (this.activeUntil || 0)) {
        this.rafId = requestAnimationFrame(this._boundAnimate);
      } else {
        this.rafId = null;
      }
    }

    resize() {
      if (this.isDisposed || !this.container) return;
      if (this.usingFallback2D) return;
      if (!this.renderer || !this.camera || !this.canvasHost) return;

      const width = Math.max(this.canvasHost.clientWidth || 800, 300);
      const height = Math.max(this.canvasHost.clientHeight || 540, 300);
      const aspect = width / height;
      const halfF = this.frustumSize / 2;

      this.camera.left = -halfF * aspect;
      this.camera.right = halfF * aspect;
      this.camera.top = halfF;
      this.camera.bottom = -halfF;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height);
      this._updatePinPositions(true);
      this.invalidate('resize', 400);
    }

    // ========================================================================
    // 2D ISOMETRIC ILLUSTRATED MAP (1573 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250)
    // ========================================================================
    _mount2DFallback() {
      if (!this.canvasHost) return;
      if (this.pinLayer) this.pinLayer.innerHTML = '';

      this.canvasHost.innerHTML = `
        <div class="f3d-fallback-wrap relative">
          <div class="f3d-fallback-banner flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-map-location-dot text-emerald-700"></i>
              <span>แผนผังไอโซเมตริก 2.5D — บมจ.น้ำตาลและอ้อยตะวันออก (1573 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250)</span>
            </div>
            <button type="button" id="f3d-toggle-aerial-bg" class="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold cursor-pointer">
              <i class="fa-solid fa-satellite mr-1"></i> ซ้อนภาพถ่ายมุมสูงจริง
            </button>
          </div>
          <svg class="f3d-fallback-svg" viewBox="-82 -68 164 136" preserveAspectRatio="xMidYMid meet">
            <defs>
              <pattern id="isoGrid" width="8" height="8" patternUnits="userSpaceOnUse">
                <path d="M 8 0 L 0 4 L 8 8 L 16 4 Z" fill="none" stroke="#4D7840" stroke-width="0.25" stroke-opacity="0.35"/>
              </pattern>
            </defs>
            <!-- Isometric Diamond Campus Platform -->
            <polygon points="0,-64 76,-8 4,62 -76,4" fill="#567B47" />
            <polygon points="0,-66 76,-11 4,58 -76,1" fill="#7FA96B" stroke="#466839" stroke-width="1.2"/>
            <polygon points="0,-66 76,-11 4,58 -76,1" fill="url(#isoGrid)" />

            <!-- Optional Real Aerial Photo Underlay -->
            <image id="f3d-svg-aerial-img" href="assets/factory/esc-aerial-reference.jpg" x="-76" y="-64" width="152" height="122" preserveAspectRatio="none" opacity="0" />

            <!-- Central Concrete Yard & Staging Apron (Isometric) -->
            <polygon points="-14,-8 28,-2 24,22 -18,16" fill="#DDD6C9" stroke="#C5BEB0" stroke-width="0.6"/>
            <polygon points="-50,-26 16,-22 12,-6 -54,-10" fill="#D5CEC0" stroke="#BEB6A6" stroke-width="0.5"/>

            <!-- Main Roads & Entrance 1573 -->
            <path d="M 2 56 L 2 34 M 2 34 L -26 20 L -46 -8 L -40 -34 L 24 -34 L 28 20 L 2 34" stroke="#918A7F" stroke-width="4.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <ellipse cx="2" cy="36" rx="8.5" ry="5.5" fill="#918A7F"/>
            <ellipse cx="2" cy="36" rx="3.8" ry="2.4" fill="#659B5E"/>

            <!-- Cylindrical Yellow Molasses Storage Tanks (ถังโมลาส ตามภาพ 14, 39 ใน USER_CONFIRMED_OVERRIDES.md) -->
            <g class="f3d-svg-molasses-tanks">
              <ellipse cx="44" cy="30" rx="3.8" ry="2.2" fill="#CA8A04"/>
              <path d="M 40.2 30 L 40.2 35 A 3.8 2.2 0 0 0 47.8 35 L 47.8 30 Z" fill="#EAB308" stroke="#CA8A04" stroke-width="0.3"/>
              <ellipse cx="44" cy="30" rx="3.8" ry="2.2" fill="#FACC15" stroke="#CA8A04" stroke-width="0.3"/>
              
              <ellipse cx="51" cy="31" rx="3.4" ry="2.0" fill="#CA8A04"/>
              <path d="M 47.6 31 L 47.6 35.5 A 3.4 2.0 0 0 0 54.4 35.5 L 54.4 31 Z" fill="#EAB308" stroke="#CA8A04" stroke-width="0.3"/>
              <ellipse cx="51" cy="31" rx="3.4" ry="2.0" fill="#FACC15" stroke="#CA8A04" stroke-width="0.3"/>

              <rect x="40" y="38" width="16" height="4.5" rx="1.5" fill="#0F2E09" fill-opacity="0.88"/>
              <text x="48" y="41.2" text-anchor="middle" fill="#FDE047" font-size="2.1" font-weight="800">ถังโมลาส</text>
            </g>

            <!-- Compass & Address Stamp -->
            <g transform="translate(-66, -52)">
              <circle cx="0" cy="0" r="6" fill="#0F2E09" fill-opacity="0.85" stroke="#8CE617" stroke-width="0.6"/>
              <polygon points="0,-4.5 1.6,1.5 0,0.4 -1.6,1.5" fill="#8CE617"/>
              <text x="0" y="4.2" text-anchor="middle" fill="#FFFFFF" font-size="2.4" font-weight="800">N</text>
            </g>
            <text x="0" y="64" text-anchor="middle" fill="#0F2E09" font-size="2.8" font-weight="800">ทางเข้าหลัก เลขที่ 1573 หมู่ 1 ต.วังใหม่ อ.วังสมบูรณ์ จ.สระแก้ว 27250</text>

            <g class="f3d-svg-route-layer"></g>
            <g class="f3d-svg-zones-layer"></g>
          </svg>
        </div>
      `;

      const aerialBtn = this.canvasHost.querySelector('#f3d-toggle-aerial-bg');
      const aerialImg = this.canvasHost.querySelector('#f3d-svg-aerial-img');
      if (aerialBtn && aerialImg) {
        aerialBtn.addEventListener('click', () => {
          this.show2DAerialUnderlay = !this.show2DAerialUnderlay;
          aerialImg.setAttribute('opacity', this.show2DAerialUnderlay ? '0.55' : '0');
          aerialBtn.innerHTML = this.show2DAerialUnderlay
            ? '<i class="fa-solid fa-eye-slash mr-1"></i> ซ่อนภาพถ่ายจริง'
            : '<i class="fa-solid fa-satellite mr-1"></i> ซ้อนภาพถ่ายมุมสูงจริง';
        });
      }

      const zonesLayer = this.canvasHost.querySelector('.f3d-svg-zones-layer');
      ZONES.forEach((zone) => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'f3d-svg-zone');
        g.dataset.zoneId = zone.id;
        g.style.cursor = 'pointer';

        const roofColor =
          zone.id === 'front-building' ? '#CC625A' :
          zone.id === 'front-pond' || zone.id === 'water-east' ? '#5BA1B0' :
          zone.id === 'rear-block' ? '#2E77AE' :
          zone.id === 'central-yard' ? '#DDD6C9' : '#E2E8F0';

        const wallColor =
          zone.id === 'front-building' ? '#9E4740' :
          zone.id === 'front-pond' || zone.id === 'water-east' ? '#3E7582' :
          zone.id === 'rear-block' ? '#4D946E' :
          zone.id === 'central-yard' ? '#C7BFB0' : '#F8FAFC';

        const cx = zone.center.x;
        const cz = zone.center.z * 0.78;
        const hw = Math.min(zone.bounds.w * 0.42, 16);
        const hd = Math.min(zone.bounds.d * 0.34, 12);
        const h = zone.id === 'production-west' || zone.id === 'production-center' ? 7 : zone.id === 'front-pond' || zone.id === 'central-yard' ? 1.5 : 4;

        // Isometric 2.5D extruded block per zone
        const topPts = `${cx},${cz - hd - h} ${cx + hw},${cz - h} ${cx},${cz + hd - h} ${cx - hw},${cz - h}`;
        const leftPts = `${cx - hw},${cz - h} ${cx},${cz + hd - h} ${cx},${cz + hd} ${cx - hw},${cz}`;
        const rightPts = `${cx},${cz + hd - h} ${cx + hw},${cz - h} ${cx + hw},${cz} ${cx},${cz + hd}`;

        g.innerHTML = `
          <polygon points="${leftPts}" fill="${wallColor}" stroke="#334155" stroke-width="0.6"/>
          <polygon points="${rightPts}" fill="#CBD5E1" stroke="#334155" stroke-width="0.6"/>
          <polygon class="f3d-svg-zone-rect" points="${topPts}" fill="${roofColor}" stroke="#1E293B" stroke-width="1.1"/>
          <rect x="${cx - 13}" y="${cz - h - 4.2}" width="26" height="7.5" rx="2.2" fill="#0F2E09" fill-opacity="0.86"/>
          <text x="${cx}" y="${cz - h - 1.0}" text-anchor="middle" fill="#FFFFFF" font-size="2.45" font-weight="700">${zone.shortName}</text>
          <text class="f3d-svg-zone-sub" x="${cx}" y="${cz - h + 2.1}" text-anchor="middle" fill="#8CE617" font-size="2.1" font-weight="700">แตะเพื่อดูข้อมูล</text>
        `;
        g.addEventListener('click', () => this.selectZone(zone.id, { animate: true }));
        zonesLayer.appendChild(g);
      });
    }

    _update2DFallbackData() {
      if (!this.canvasHost) return;
      ZONES.forEach((zone) => {
        const g = this.canvasHost.querySelector(`.f3d-svg-zone[data-zone-id="${zone.id}"]`);
        if (!g) return;
        const st = this.zoneStats.get(zone.id) || { total: 0, inspectedToday: 0, status: 'neutral', pinSummaryText: '' };
        const sub = g.querySelector('.f3d-svg-zone-sub');
        if (sub) {
          sub.textContent = st.pinSummaryText || (st.total > 0 ? `${st.inspectedToday}/${st.total} เครื่อง` : 'จุดสังเกต');
        }
        const rect = g.querySelector('.f3d-svg-zone-rect');
        if (rect) {
          const stroke =
            st.status === 'defect' ? '#E25555' :
            st.status === 'warning' ? '#F59E0B' :
            st.status === 'pending' ? '#E9A93B' :
            st.status === 'ok' ? '#2EAD6B' :
            st.status === 'stale' ? '#64748B' : '#475569';
          rect.setAttribute('stroke', stroke);
          rect.setAttribute('stroke-width', this.selectedZoneId === zone.id ? '2.6' : '1.4');
        }
      });
    }

    _update2DFallbackSelection() {
      this._update2DFallbackData();
    }

    // ========================================================================
    // CLEANUP / DISPOSE (ZERO MEMORY LEAK GUARANTEE)
    // ========================================================================
    dispose() {
      this.isDisposed = true;
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }
      window.removeEventListener('resize', this._boundWindowResize);
      document.removeEventListener('visibilitychange', this._boundVisibilityChange);
      window.removeEventListener('pointerup', this._onPointerUp);
      window.removeEventListener('pointercancel', this._onPointerCancel);
      window.removeEventListener('blur', this._onPointerCancel);

      if (this.renderer && this.renderer.domElement) {
        const domEl = this.renderer.domElement;
        domEl.removeEventListener('pointerdown', this._onPointerDown);
        domEl.removeEventListener('pointermove', this._onPointerMove);
        domEl.removeEventListener('wheel', this._onWheel);
        domEl.removeEventListener('contextmenu', this._onContextMenu);
        domEl.removeEventListener('webglcontextlost', this._onWebGLContextLost);
        domEl.removeEventListener('webglcontextrestored', this._onWebGLContextRestored);
      }

      if (this.scene) {
        this.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m && m.dispose && m.dispose());
            } else if (obj.material.dispose) {
              obj.material.dispose();
            }
          }
        });
      }

      if (this.renderer) {
        this.renderer.dispose();
        this.renderer = null;
      }

      this.scene = null;
      this.camera = null;
      this.zoneMeshes.clear();
      this.machineMarkerMeshes.clear();
      this.interactables = [];
      this.pinElements.clear();
      this.steamParticles = [];
      this.waterMeshes = [];
    }
  }

  window.Factory3DScene = Factory3DScene;
})();
