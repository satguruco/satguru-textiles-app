/* Satguru Textiles — Service Worker (PWA offline support)
   Ye file app ka "khol" (frontend) phone me save rakhti hai,
   taaki app tez khule aur bina internet bhi kholne par kuch dikhe.
   Data (links, login) to hamesha internet se hi aayega. */

var CACHE = 'satguru-v1';
var ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(ASSETS); })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if (k !== CACHE) return caches.delete(k);
      }));
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;
  // API (Apps Script) aur forms ko kabhi cache mat karo — hamesha live lao
  if (url.indexOf('script.google.com') !== -1 ||
      url.indexOf('googleusercontent.com') !== -1 ||
      url.indexOf('forms.gle') !== -1 ||
      url.indexOf('docs.google.com') !== -1) {
    return; // browser normal tareeke se laayega (live)
  }
  // Baaki (app ka khol) — pehle cache, phir network
  e.respondWith(
    caches.match(e.request).then(function(hit){
      return hit || fetch(e.request).then(function(resp){
        return caches.open(CACHE).then(function(c){
          try{ c.put(e.request, resp.clone()); }catch(err){}
          return resp;
        });
      }).catch(function(){ return caches.match('./index.html'); });
    })
  );
});
