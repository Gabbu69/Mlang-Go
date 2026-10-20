// Generated alongside each production build, including hashed JS and CSS.
importScripts('./precache-manifest.js');
const CACHE_PREFIX = 'mlang-pocket-';
const CACHE_NAME = CACHE_PREFIX + self.__MLANG_PRECACHE.version;
const INDEX_URL = new URL('index.html', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then((cache) => cache.addAll(self.__MLANG_PRECACHE.urls))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys
      .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
      .map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin ||
      !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Keep one build's HTML and assets together; updates activate atomically.
    // Precached same-origin static files do not vary by request headers.
    // Hosts may add Vary: Origin, while module/style requests add an Origin
    // header that cache.addAll's requests did not include.
    const cached = await cache.match(event.request, { ignoreVary: true });
    if (cached) return cached;
    if (event.request.mode === 'navigate') {
      const index = await cache.match(INDEX_URL, { ignoreVary: true });
      if (index) return index;
    }
    return fetch(event.request);
  })());
});
