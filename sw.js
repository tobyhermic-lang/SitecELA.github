
/* =========================================
   ENGLISH LEARNING HUB
   SERVICE WORKER — GITHUB PAGES
   Version: 2
   ========================================= */

"use strict";

/*
  IMPORTANT:
  Increase CACHE_VERSION whenever you make a
  new service-worker release.
*/
const CACHE_VERSION = "elh-v2";

const APP_CACHE = `${CACHE_VERSION}-app`;
const ASSET_CACHE = `${CACHE_VERSION}-assets`;

/*
  These files are present in your supplied ZIP.
  Keep these paths relative to the repository root.
*/
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./listening.js",
  "./festive.js",
  "./festive.css"
];

/* -----------------------------------------
   INSTALL
   Download the application shell.
   ----------------------------------------- */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

/* -----------------------------------------
   ACTIVATE
   Remove caches from older releases.
   ----------------------------------------- */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        const keep = [APP_CACHE, ASSET_CACHE];

        return Promise.all(
          cacheNames
            .filter(name =>
              name.startsWith("elh-") &&
              !keep.includes(name)
            )
            .map(name => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

/* -----------------------------------------
   HELPERS
   ----------------------------------------- */

async function saveInCache(cacheName, request, response) {
  if (!response || response.status !== 200) return;
  if (response.type === "opaque") return;

  const cache = await caches.open(cacheName);
  await cache.put(request, response.clone());
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);

  try {
    const response = await fetch(request);

    if (response.ok) {
      await saveInCache(cacheName, request, response);
    }

    return response;
  } catch (error) {
    const cached = await cache.match(request);

    if (cached) return cached;

    throw error;
  }
}

async function assetFirst(request) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(request);

  if (cached) {
    /*
      Use the cached asset immediately.
      Check the server in the background.
    */
    fetch(request)
      .then(response => {
        if (response.ok) {
          saveInCache(ASSET_CACHE, request, response);
        }
      })
      .catch(() => {});

    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    await saveInCache(ASSET_CACHE, request, response);
  }

  return response;
}

/* -----------------------------------------
   FETCH
   ----------------------------------------- */

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  /* Do not intercept external websites or CDNs. */
  if (url.origin !== self.location.origin) return;

  /*
    HTML pages:
    Always try the server first so visitors receive
    the newest published page whenever online.
  */
  if (
    request.mode === "navigate" ||
    request.destination === "document"
  ) {
    event.respondWith(
      networkFirst(request, APP_CACHE)
        .catch(async () => {
          const cache = await caches.open(APP_CACHE);

          const offlinePage = await cache.match("./index.html");

          if (offlinePage) return offlinePage;

          return new Response(
            "You are offline. Please reconnect to open the English Learning Hub.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          );
        })
    );

    return;
  }

  /*
    JavaScript, CSS and the manifest:
    Check the server first to avoid mixing old code
    with a newly published HTML page.
  */
  if (
    request.destination === "script" ||
    request.destination === "style" ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".json")
  ) {
    event.respondWith(
      networkFirst(request, ASSET_CACHE)
        .catch(() => caches.match(request))
        .then(response =>
          response || new Response(
            "This resource is unavailable offline.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          )
        )
    );

    return;
  }

  /*
    Images, audio and video:
    Use cached files first for faster loading.
    Previously visited media can remain available
    offline.
  */
  if (
    request.destination === "image" ||
    request.destination === "audio" ||
    request.destination === "video" ||
    /\.(mp3|mp4|png|jpe?g|gif|webp|svg|ico)$/i.test(url.pathname)
  ) {
    event.respondWith(
      assetFirst(request).catch(() =>
        caches.match(request).then(cached =>
          cached || new Response(
            "This media file is unavailable offline.",
            {
              status: 503,
              headers: {
                "Content-Type": "text/plain; charset=utf-8"
              }
            }
          )
        )
      )
    );

    return;
  }

  /*
    Other same-origin requests:
    Try the network, then use a matching cache entry.
  */
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
