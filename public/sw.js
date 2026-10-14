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

/**
 * Only a whole, successful response is worth keeping: a 206 is a slice of a
 * file (and `cache.put` rejects it), a 304 has no body. A failed write — the
 * quota, a body that errors halfway — must not surface as an unhandled
 * rejection or fail the response the page is waiting for.
 */
function store(req, res) {
  if (!res || res.status !== 200) return;
  const copy = res.clone();
  caches
    .open(CACHE)
    .then((c) => c.put(req, copy))
    .catch(() => {});
}

/*
 * `ignoreVary`: a photo precached with a CORS request carries an Origin
 * header, the <img> asking for it later does not, and a `Vary: Origin` on the
 * response would otherwise make the cached copy invisible to it.
 */
async function cacheFirst(req) {
  const cached = await caches.match(req, { ignoreVary: true });
  const fetched = fetch(req)
    .then((res) => {
      store(req, res);
      return res;
    })
    .catch(() => cached);
  return cached || fetched;
}

/**
 * An <audio> element asks for its file in byte ranges. Those responses are
 * never cached (they are slices), but a recording precached whole can answer
 * them: offline, that slice is the only way the guide's recordings play, and
 * Safari will not play media from a 200 given to a range request.
 */
async function rangeFromCache(req) {
  const cached = await caches.match(req, { ignoreVary: true });
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.get("range") || "");
  // An opaque copy (from an older precache) has no readable body to slice.
  if (!cached || cached.type === "opaque" || !range || (!range[1] && !range[2])) return fetch(req);
  const body = await cached.blob();
  const size = body.size;
  // "bytes=-500" is a suffix: the last 500 bytes (Safari asks for these).
  const start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;
  if (start >= size || start > end) {
    return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${size}` } });
  }
  return new Response(body.slice(start, end + 1), {
    status: 206,
    headers: {
      "Content-Type": cached.headers.get("Content-Type") || body.type,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
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
    store(req, res);
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
  const thirdParty =
    url.hostname === "lotusdugun-ctrl.github.io" ||
    url.hostname === "upload.wikimedia.org" ||
    url.hostname.endsWith(".tile.openstreetmap.org") ||
    url.hostname === "tile.openstreetmap.org";

  // Byte ranges (audio, video) never go through the caching paths below.
  if (req.headers.has("range")) {
    if (thirdParty || url.origin === self.location.origin) event.respondWith(rangeFromCache(req));
    return;
  }

  // Third-party imagery (city photos + map tiles): cache-first, update in background.
  // The audio guide's recordings outside the app, served from GitHub Pages.
  if (thirdParty) {
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
 * The scripts and stylesheets a server-rendered page loads, same-origin only.
 * A page cached without them displays offline but does nothing: no player, no
 * map, no buttons — so they are downloaded along with it.
 */
function pageAssets(html, base) {
  const found = [];
  const attr = (tag, name) => {
    const m = new RegExp(`\\s${name}\\s*=\\s*["']([^"']+)["']`, "i").exec(tag);
    return m ? m[1] : undefined;
  };
  for (const [tag] of html.matchAll(/<script\b[^>]*>/gi)) {
    const src = attr(tag, "src");
    if (src) found.push(src);
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const rel = (attr(tag, "rel") || "").toLowerCase().split(/\s+/);
    const href = attr(tag, "href");
    if (href && (rel.includes("modulepreload") || rel.includes("stylesheet"))) found.push(href);
  }
  return found
    .map((href) => {
      try {
        return new URL(href, base);
      } catch {
        return undefined;
      }
    })
    .filter((url) => url && url.origin === self.location.origin)
    .map((url) => url.href);
}

/**
 * Explicit download, driven by the profile page.
 *
 * Ruins are where the signal is not, so the useful moment to fetch a city page
 * and its photographs is before setting off, not on arrival. Failures are
 * counted rather than thrown: one missing photo should not fail the trip.
 *
 * Cross-origin files are fetched with CORS (Wikimedia and GitHub Pages both
 * allow any origin). An opaque `no-cors` response hides its status, so a 404
 * was counted as downloaded, and it pads the storage quota by megabytes each.
 *
 * `packId` is echoed back on every message, so two downloads running at once
 * (a region and the favourites) each follow only their own progress.
 */
async function precache(urls, client, packId) {
  const cache = await caches.open(CACHE);
  const queue = [...urls];
  const seen = new Set(queue);
  let done = 0;
  let failed = 0;
  const report = (extra) =>
    client &&
    client.postMessage({
      type: PRECACHE_MESSAGE,
      packId,
      done,
      total: queue.length,
      failed,
      ...extra,
    });

  // `queue` grows as pages name their scripts; a plain index keeps up with it.
  for (let i = 0; i < queue.length; i += 1) {
    const url = queue[i];
    try {
      const sameOrigin = new URL(url).origin === self.location.origin;
      const request = new Request(url, {
        mode: sameOrigin ? "same-origin" : "cors",
        credentials: "omit",
      });
      const res = await fetch(request);
      if (res && res.ok) {
        const type = res.headers.get("Content-Type") || "";
        if (sameOrigin && type.includes("text/html")) {
          for (const asset of pageAssets(await res.clone().text(), url)) {
            if (!seen.has(asset)) {
              seen.add(asset);
              queue.push(asset);
            }
          }
        }
        await cache.put(request, res);
      } else {
        failed += 1;
      }
    } catch {
      failed += 1;
    }
    done += 1;
    report();
  }

  report({ finished: true });
}

self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== PRECACHE_MESSAGE || !Array.isArray(data.urls)) return;
  event.waitUntil(precache(data.urls, event.source, data.packId));
});
