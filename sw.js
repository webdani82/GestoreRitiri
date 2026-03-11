const CACHE = 'gestore-ritiri-v2';
const ASSETS = [
  './',
  './router-manager.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap'
];

// Installa e metti in cache tutti i file
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      // Cache i file locali (obbligatori)
      return cache.addAll([
        './',
        './router-manager.html',
        './manifest.json',
        './icon-192.png',
        './icon-512.png'
      ]);
    }).then(() => self.skipWaiting())
  );
});

// Attiva e rimuovi cache vecchie
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Intercetta richieste: cache first, poi rete
self.addEventListener('fetch', e => {
  // Ignora richieste non GET
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      // Non in cache: prova la rete e salva in cache
      return fetch(e.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline e non in cache: restituisce la pagina principale
        return caches.match('./router-manager.html');
      });
    })
  );
});
