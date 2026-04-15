const CACHE = 'jpp-v8';
const STATIC = [
  './', './index.html', './app.html', './dashboard.html',
  './css/style.css',
  './js/app.js', './js/gtfs.js', './js/sheets.js', './js/kontrola.js',
  './js/dashboard.js', './js/vozila.js',
  './manifest.json',
  './data/routes.json', './data/trips.json', './data/stops.json',
  './icon-192.png', './icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  // Pass through Apps Script API calls
  if (url.hostname.includes('script.google.com') || url.hostname.includes('googleusercontent.com')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Cache data files on first load
        if (url.pathname.includes('/data/')) {
          caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
