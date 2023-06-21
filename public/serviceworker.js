const cacheName = "omni-pop-v1";
const staticFiles = ["./", "./index.html", "./app.js", "./styles.css"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(staticFiles);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      return r || fetch(e.request);
    })
  );
});
