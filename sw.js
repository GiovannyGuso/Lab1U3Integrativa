// ---------- TechHub PWA • Service Worker ----------
const VERSION = 'v1.0.1';                     
const CACHE   = `techhub-${VERSION}`;

// Recurso mínimo para que la app siempre funcione
const REQUIRED_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './app.js',
  './style.css',
];


const OPTIONAL_ASSETS = [
  // Imágenes del sitio
  './assets/hero-tech.jpg',
  './assets/contacto-tech.jpg',
];

// ---------- INSTALL: precache (requeridos + opcionales best-effort) ----------
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Requeridos: si falla alguno, falla la instalación (como debe ser)
    await cache.addAll(REQUIRED_SHELL);
    // Opcionales: intenta, pero no rompas la instalación si no existen
    await Promise.all(
      OPTIONAL_ASSETS.map(url =>
        cache.add(url).catch(() => null)
      )
    );
  })());
  self.skipWaiting(); // toma control más rápido
});

// ---------- ACTIVATE: limpia versiones viejas ----------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ---------- FETCH: Cache First + runtime cache ----------
// - Devuelve desde caché si existe (rápido / offline)
// - Si no, ve a red; guarda una copia en caché para la próxima vez (incluye CDNs, SVG de iconos, etc.)
// - Para navegaciones offline, sirve index.html como fallback
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;                 // 1) CACHE FIRST

    try {
      const res = await fetch(req);            // 2) NETWORK
      const copy = res.clone();
      // Guarda en runtime (no bloquea la respuesta)
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    } catch (err) {
      // Fallback para navegaciones cuando no hay red
      if (req.mode === 'navigate') {
        const cachedIndex = await caches.match('./index.html');
        if (cachedIndex) return cachedIndex;
      }
      // Último recurso: texto simple
      return new Response('Offline: recurso no disponible en caché.', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      });
    }
  })());
});
