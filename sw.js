const CACHE_NAME = 'homehelp-v2';
const ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// Install Service Worker and cache core assets
self.addEventListener('install', (e) => {
  self.skipWaiting(); // Force immediate activation of the new service worker
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activate Service Worker and clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Take control of all pages immediately
    })
  );
});

// Network-First strategy: Fetch fresh assets, fallback to cache if offline
self.addEventListener('fetch', (e) => {
  // Only handle GET requests (avoid caching POST or external APIs if any)
  if (e.request.method !== 'GET') return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // If successful network response, cache a copy and return it
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network request fails (offline)
        return caches.match(e.request);
      })
  );
});
