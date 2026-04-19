// MiniLife Service Worker — network-first with auto-update
// Cache name includes a version hash that changes when sw.js is re-deployed
const CACHE_NAME = 'minilife-v1776570192';

const PRECACHE_URLS = [
    '/minilife_logo.png',
    '/manifest.json',
];

// Install: precache essential static files, skip waiting immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
    );
    self.skipWaiting();
});

// Activate: delete ALL old caches, then claim all clients immediately
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        ).then(() => self.clients.claim())
    );
});

// Fetch: network-first for everything, cache fallback for offline only
self.addEventListener('fetch', (event) => {
    // Skip API calls, non-GET, and chrome-extension requests
    if (event.request.method !== 'GET' || event.request.url.includes('/api/')) return;

    // For navigation requests (HTML pages): ALWAYS go to network, never serve stale HTML
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() =>
                caches.match('/').then((cached) => cached || new Response('Offline', { status: 503 }))
            )
        );
        return;
    }

    // For other assets (JS/CSS/images): network-first with cache fallback
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(event.request).then(
                    (cached) => cached || new Response('Offline', { status: 503 })
                )
            )
    );
});
