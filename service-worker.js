const CACHE_NAME = 'atta-chakki-v4'; // Updated version
// List of all files that must be cached for offline use
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './service-worker.js',
    // External resources that must be cached
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic+Urdu:wght@400..700&display=swap'
];

self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installation started. Caching App Shell.');
    // Perform install steps and cache all necessary assets
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                // cache.addAll will ensure all critical files are downloaded.
                return cache.addAll(urlsToCache)
                    .then(() => {
                        console.log('[ServiceWorker] All critical resources cached successfully.');
                        return self.skipWaiting(); // Force the new service worker to activate immediately
                    })
                    .catch(err => {
                        console.error('[ServiceWorker] Failed to cache ALL resources. Offline capability may be limited:', err);
                    });
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Serve files from cache first (Cache-First Strategy)
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Cache hit - return response
                if (response) {
                    // console.log('[ServiceWorker] Serving from cache:', event.request.url);
                    return response;
                }
                
                // Important: Clone the request. A request is a stream and can only be consumed once.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    (response) => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Important: Clone the response. A response is a stream and can only be consumed once.
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // Only cache GET requests
                                if (event.request.method === 'GET') {
                                    cache.put(event.request, responseToCache);
                                }
                            });

                        return response;
                    }
                ).catch((error) => {
                    // This catch block handles network failures.
                    console.error('[ServiceWorker] Fetch failed; returning offline page or resource from cache:', error);
                    // No need for a specific offline page since the whole app is cached.
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activation started. Removing old caches.');
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
