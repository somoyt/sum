
const CACHE = 'somoytime-v1';
const ASSETS = [
  './offline.html',
  './',
  './index.html',
  './news.html',
  './assets/css/style.css',
  './assets/js/script.js',
  './assets/js/news.js'
];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch',e=>{
  const url = new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(res=>res||fetch(e.request)));
  }
});

self.addEventListener('fetch', e=>{
  e.respondWith(fetch(e.request).catch(()=>caches.match('./offline.html')));
});
