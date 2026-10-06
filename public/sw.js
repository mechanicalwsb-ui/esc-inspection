// ============================================================================
// ESC Machine Inspection Center — Offline Service Worker (v2.13.0)
// Eastern Sugar & Cane Group
// ============================================================================
const CACHE_NAME = 'esc-comis-cache-v302-hub-accounts';
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './source-forms.html',
  './css/source-forms.css',
  './js/source-forms.js',
  './css/custom.css',
  './assets/vendor/font-0.ttf',
  './assets/vendor/font-1.ttf',
  './assets/vendor/font-2.ttf',
  './assets/vendor/font-3.ttf',
  './assets/vendor/font-4.ttf',
  './assets/vendor/font-5.ttf',
  './assets/vendor/font-6.ttf',
  './assets/vendor/font-7.ttf',
  './assets/vendor/font-8.ttf',
  './assets/vendor/font-9.ttf',
  './css/factory-overview.css',
  './assets/vendor/tailwind-3.4.17.js',
  './css/reliability.css',
  './js/domain.js',
  './js/persistence.js',
  './js/session-and-sync.js',
  './js/qr-scanner.js',
  './js/release-updates.js',
  './assets/vendor/chart.umd.min.js',
  './assets/vendor/qrcode.min.js',
  './assets/vendor/lucide.min.js',
  './assets/vendor/jsQR.js',
  './assets/vendor/fonts.css',
  './assets/vendor/fontawesome/css/all.min.css',
  './assets/vendor/fontawesome/webfonts/fa-solid-900.woff2',
  './assets/vendor/fontawesome/webfonts/fa-regular-400.woff2',
  './assets/vendor/fontawesome/webfonts/fa-brands-400.woff2',
  './assets/brand/logo.png',
  './assets/brand/favicon.ico',
  './assets/brand/badge.webp',
  './js/app.js',
  './js/standalone-api.js',
  './js/inspection.js',
  './js/table-layout.js',
  './js/views-and-crud.js',
  './js/factory-map-config.js',
  './js/factory-3d-scene.js',
  './js/factory-overview.js',
  './assets/factory/three.r128.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k.startsWith('esc-comis-cache-') && k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // For API endpoints, prefer network, fall back to offline message if network fails
  if (url.pathname.startsWith('/api/') || url.pathname === '/assets/source-forms/catalogue.js' || req.method !== 'GET' || url.origin !== self.location.origin) return;

  // For static assets, try cache first, fallback to network
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Keep a consistent release until a new worker is activated.
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
          return caches.match('./index.html').then(html => html || caches.match('./'));
        }
      });
    })
  );
});
self.addEventListener('message', event => { if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting(); });
