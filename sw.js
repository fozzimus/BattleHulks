// C3 Hulks (Battle Hulks PT-BR) - service worker
// Ao publicar uma versão nova do app, aumente o número abaixo.
const CACHE = 'battlehulks-v4';
const FILES = ['./', './index.html', './manifest.json',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Página: tenta a rede primeiro (pega atualizações); sem internet, usa o cache.
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put('./index.html', copy));
        return r;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }
  // Demais arquivos: cache primeiro.
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
