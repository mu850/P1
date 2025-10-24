const CACHE_NAME = 'atta-chakki-v3';
// List of all files that must be cached for offline use
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './service-worker.js',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic+Urdu:wght@400..700&display=swap'
];

self.addEventListener('install', (event) => {
    // Perform install steps and cache all necessary assets
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching App Shell.');
                // Note: The caching process may fail if external URLs are unreachable.
                return cache.addAll(urlsToCache).catch(err => {
                    console.error('[ServiceWorker] Failed to cache resources. URLs might be down or blocked.', err);
                });
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Serve files from cache first, then fall back to network
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                // No cache match - fetch from network
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    // Remove old caches when a new service worker is activated
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

