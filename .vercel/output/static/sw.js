/* Antik Türkiye — offline-first service worker */
const CACHE = "antik-tr-v1";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  const fetched = fetch(req)
    .then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })
    .catch(() => cached);
  return cached || fetched;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Third-party imagery (city photos + map tiles): cache-first, update in background.
  if (
    url.hostname === "upload.wikimedia.org" ||
    url.hostname.endsWith(".tile.openstreetmap.org") ||
    url.hostname === "tile.openstreetmap.org"
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  // Page navigations: network-first, fall back to the cached app shell.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/index.html", copy));
          return res;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  // Same-origin static assets: cache-first.
  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
  }
});
