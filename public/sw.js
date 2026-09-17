/**
 * Kleine service worker.
 *
 * Doel: (1) Android mag de app dan "installeren" op het startscherm, en
 * (2) de app opent nog als je even geen internet hebt.
 *
 * Strategie is bewust "eerst het netwerk": we halen altijd de nieuwste
 * versie op, en vallen alleen terug op de cache als dat mislukt. Zo kan je
 * nooit vastzitten op een oude versie na een update.
 */
const CACHE = 'bs21-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(['/', '/manifest.json']).catch(() => undefined))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Supabase e.d. nooit cachen

  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => undefined);
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        // Diepe link zonder internet? Val terug op de startpagina.
        if (request.mode === 'navigate') {
          const shell = await caches.match('/');
          if (shell) return shell;
        }
        return Response.error();
      })
  );
});
