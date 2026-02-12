const CACHE_NAME = 'skycast-v40'; // Güncelleme yaptıkça buradaki sayıyı arttır (v39, v40...)
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    '/icons/favicon-96x96.png',
    '/icons/apple-touch-icon.png',
    '/icons/favicon.svg',
    '/icons/favicon.ico',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700;800&display=swap'
];

// Kurulum (Install) - Dosyaları önbelleğe al
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Dosyalar önbelleğe alınıyor...');
            return cache.addAll(urlsToCache);
        })
    );
});

// Aktifleştirme (Activate) - Eski versiyonları temizle
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

// İstek Yakalama (Fetch) - Önce Cache, yoksa Network
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            return response || fetch(event.request);
        })
    );
});

// GÜNCELLEME MESAJINI DİNLE
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});