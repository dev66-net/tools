const CACHE_VERSION = 'offline-cache-v1';
const APP_SHELL = ['/', '/index.html', '/offline.html', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((key) => (key !== CACHE_VERSION ? caches.delete(key) : undefined))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function handleNavigate(request) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(CACHE_VERSION);
    cache.put('/index.html', networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_VERSION);
    const cachedPage = await cache.match('/index.html');
    if (cachedPage) {
      return cachedPage;
    }
    const offlinePage = await cache.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    throw error;
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
      return networkResponse;
    }

    const cache = await caches.open(CACHE_VERSION);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    const cache = await caches.open(CACHE_VERSION);
    const fallback = await cache.match('/offline.html');
    if (fallback) {
      return fallback;
    }
    throw error;
  }
}
