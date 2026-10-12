/* Antik Türkiye — offline-first service worker */

/**
 * v2 changes what a cached page is keyed by.
 *
 * v1 wrote every navigation into the single key "/index.html", so offline the
 * app answered *any* address with whichever page had been visited last: open
 * Efes offline after browsing Troya and you were served Troya. This app is
 * server-rendered, so there is no single shell document to fall back on —
 * each route has its own HTML and has to be cached under its own URL.
 */
const CACHE = "antik-tr-v2";
const APP_SHELL = ["/", "/manifest.webmanifest"];

/** Where a precache job reports back to, so the UI can show real progress. */
const PRECACHE_MESSAGE = "antik-tr-precache";

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

/**
 * Pages come from the network when there is one, because the content changes
 * and a stale ruin page is worse than a slow one. Offline, we answer with this
 * exact page if it was cached, and only then fall back to the home page — a
 * wrong-but-plausible page is the failure mode v1 shipped.
 */
async function pageFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy));
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    // Ignoring the query string catches the ?lang=en variant of a cached page.
    const loose = await caches.match(req, { ignoreSearch: true });
    if (loose) return loose;
    return (await caches.match("/")) ?? Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Third-party imagery (city photos + map tiles): cache-first, update in background.
  // The audio guide's recordings outside the app, served from GitHub Pages.
  if (
    url.hostname === "lotusdugun-ctrl.github.io" ||
    url.hostname === "upload.wikimedia.org" ||
    url.hostname.endsWith(".tile.openstreetmap.org") ||
    url.hostname === "tile.openstreetmap.org"
  ) {
    event.respondWith(cacheFirst(req));
    return;
  }

  if (req.mode === "navigate") {
    event.respondWith(pageFirst(req));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(req));
  }
});

/**
 * Explicit download, driven by the profile page.
 *
 * Ruins are where the signal is not, so the useful moment to fetch a city page
 * and its photographs is before setting off, not on arrival. Failures are
 * counted rather than thrown: one missing photo should not fail the trip.
 */
async function precache(urls, client) {
  const cache = await caches.open(CACHE);
  let done = 0;
  let failed = 0;

  for (const url of urls) {
    try {
      // `no-cors` keeps cross-origin photos fetchable; the opaque response is
      // still replayable from the cache, which is all an <img> needs.
      const request = new Request(url, {
        mode: url.startsWith(self.location.origin) ? "same-origin" : "no-cors",
        credentials: "omit",
      });
      const res = await fetch(request);
      if (res && (res.ok || res.type === "opaque")) await cache.put(request, res.clone());
      else failed += 1;
    } catch {
      failed += 1;
    }
    done += 1;
    if (client) client.postMessage({ type: PRECACHE_MESSAGE, done, total: urls.length, failed });
  }

  if (client) {
    client.postMessage({
      type: PRECACHE_MESSAGE,
      done,
      total: urls.length,
      failed,
      finished: true,
    });
  }
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== PRECACHE_MESSAGE || !Array.isArray(data.urls)) return;
  event.waitUntil(precache(data.urls, event.source));
});
