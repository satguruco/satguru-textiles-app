/* Satguru Textiles — Service Worker v2 (PWA)
   Fix: "network-first" — hamesha nayi file laata hai, cache sirf backup.
   Isse white-screen / purani file wali dikkat khatam. */

var CACHE = 'satguru-v2';
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
  var req = e.request;
  var url = req.url;
  if (req.method !== 'GET') return;

  if (url.indexOf('script.google.com') !== -1 ||
      url.indexOf('googleusercontent.com') !== -1 ||
      url.indexOf('forms.gle') !== -1 ||
      url.indexOf('docs.google.com') !== -1 ||
      url.indexOf('fonts.googleapis.com') !== -1 ||
      url.indexOf('fonts.gstatic.com') !== -1) {
    return;
  }

  // NETWORK FIRST: pehle internet se nayi file, na mile to cache
  e.respondWith(
    fetch(req).then(function(resp){
      try {
        var copy = resp.clone();
        caches.open(CACHE).then(function(c){ c.put(req, copy); });
      } catch(err){}
      return resp;
    }).catch(function(){
      return caches.match(req).then(function(hit){
        return hit || caches.match('./index.html');
      });
    })
  );
});
