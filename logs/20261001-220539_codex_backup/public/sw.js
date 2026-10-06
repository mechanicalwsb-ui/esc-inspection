// ============================================================================
// ESC Machine Inspection Center — Offline Service Worker (v2.13.0)
// Eastern Sugar & Cane Group
// ============================================================================
const CACHE_NAME = 'esc-comis-cache-v213';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './css/custom.css',
  './css/factory-overview.css',
  './js/app.js',
  './js/views-and-crud.js',
  './js/factory-map-config.js',
  './js/factory-3d-scene.js',
  './js/factory-overview.js',
  './assets/factory/three.r128.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS).catch(err => {
        console.warn('Pre-cache warning (some assets may be cached on demand):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // For API endpoints, prefer network, fall back to offline message if network fails
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req).catch(() => {
        return new Response(JSON.stringify({ ok: false, offline: true, error: 'ออฟไลน์: ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ในขณะนี้' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // For static assets, try cache first, fallback to network
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Fetch in background to revalidate cache
        fetch(req).then(networkRes => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then(cache => cache.put(req, networkRes));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).then(networkRes => {
        if (networkRes && networkRes.status === 200 && req.method === 'GET') {
          const resClone = networkRes.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, resClone));
        }
        return networkRes;
      }).catch(() => {
        // If html request fails and offline, return cached index.html
        if (req.headers.get('accept') && req.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});
