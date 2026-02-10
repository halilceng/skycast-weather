const CACHE_NAME = 'skycast-v38'; // GÜNCELLEME YAPARKEN BU SAYIYI ARTTIR
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/favicon-96x96.png',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Kurulum (Install)
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => cache.addAll(urlsToCache))
    );
});

// Aktifleştirme (Activate) - Eski Cache'leri Sil
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Eski önbellek siliniyor:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch (İstek Yakalama)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Önbellekte varsa döndür, yoksa internetten çek
            return response || fetch(event.request);
        })
    );
});

// GÜNCELLEME MESAJINI DİNLE (Burası Çok Önemli)
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});