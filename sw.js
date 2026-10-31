// ==============================================================================================================================
// === SERVICE WORKER (PWA) ===
// ==============================================================================================================================

const CACHE_NAME = 'territorios-cache-v76';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/territoriobase.js',
  './js/territoriosData.js',
  './js/territoriosManager.js',
  './js/notas.js',
  './js/capitanManager.js',
  './js/app.js',
  './js/pwa.js',
  './logo.png',
  './icon-192.png',
  './icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js',
  'https://unpkg.com/@turf/turf/turf.min.js',
  // Pre-caché offline de los mapas base de la zona de Congregación Rosario (Zoom 13 y 14)
  'https://a.tile.openstreetmap.org/13/1681/3415.png',
  'https://a.tile.openstreetmap.org/13/1682/3415.png',
  'https://a.tile.openstreetmap.org/13/1681/3416.png',
  'https://a.tile.openstreetmap.org/13/1682/3416.png',
  'https://b.tile.openstreetmap.org/14/3363/6831.png',
  'https://b.tile.openstreetmap.org/14/3364/6831.png',
  'https://b.tile.openstreetmap.org/14/3365/6831.png',
  'https://b.tile.openstreetmap.org/14/3363/6832.png',
  'https://b.tile.openstreetmap.org/14/3364/6832.png',
  'https://b.tile.openstreetmap.org/14/3365/6832.png'
];

// Instalación: cachear archivos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Usar allSettled para no abortar si alguna tile falla
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url => cache.add(url).catch(e => console.warn("Cache fail:", url, e)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Activación: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Cache-First para mosaicos del mapa (OSM) y Network-First para la app
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar llamadas dinámicas a la API de Google Sheets o QR externo
  if (url.hostname.includes('script.google') || url.hostname.includes('googleusercontent.com') || url.hostname.includes('qrserver.com')) {
    return;
  }

  // Mosaicos de OpenStreetMap: Cache-First para máximo rendimiento offline y velocidad
  if (url.hostname.includes('tile.openstreetmap.org') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => null);
        });
      })
    );
    return;
  }

  // Archivos de la aplicación: Network-First con tiempo límite (4s) y fallback a Caché
  const fetchConTimeout = () => {
    if (typeof AbortController === 'undefined') return fetch(event.request);
    const ctrl = new AbortController();
    const tid = setTimeout(() => ctrl.abort(), 4000);
    return fetch(event.request, { signal: ctrl.signal }).finally(() => clearTimeout(tid));
  };

  event.respondWith(
    fetchConTimeout()
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request, { ignoreSearch: true });
      })
  );
});
