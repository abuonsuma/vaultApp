const CACHE = 'momo-agent-v2';
const ASSETS = [
  './',
  './index.html',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap',
  'https://unpkg.com/preact@10.20.2/dist/preact.min.js',
  'https://unpkg.com/preact@10.20.2/hooks/dist/hooks.umd.js',
  'https://unpkg.com/htm@3.1.1/dist/htm.umd.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => {
      // Cache local files reliably, external ones best-effort
      return c.addAll(['./','./index.html']).then(() =>
        Promise.allSettled(ASSETS.slice(2).map(url => c.add(url)))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => cached || new Response('Offline', {status: 503}));
    })
  );
});
