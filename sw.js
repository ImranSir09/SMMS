// sw.js
const CACHE_NAME = 'sms-mobile-v2';
// These are the core files that make up the "app shell".
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/index.tsx'
];

// Install event: open cache and add all shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(APP_SHELL_URLS);
    })
  );
  self.skipWaiting();
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event: handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // For navigation requests, use a Network-First strategy.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          // If the fetch is successful, cache the response and return it.
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // If the network fails, serve the cached index.html.
          return caches.match(request).then(cachedResponse => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // For all other requests (assets like JS, CSS, images, fonts), use a Cache-First strategy.
  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // If not in cache, fetch from the network, cache it, and then return it.
      return fetch(request).then(networkResponse => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseToCache);
        });
        return networkResponse;
      });
    })
  );
});