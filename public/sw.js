const CACHE_NAME = "monprojetsolidaire-shell-v2";
const SHELL_FILES = ["/", "/home", "/manifest.webmanifest", "/favicon.svg", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).catch(() => undefined));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("monprojetsolidaire-") && key !== CACHE_NAME).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  // Development servers manage their own modules and hot reload requests.
  if (url.pathname.startsWith("/@vite") || url.pathname.startsWith("/src/") || url.pathname.startsWith("/@react-refresh")) return;

  if (request.mode === "navigate") {
    const protectedPath = /^\/(?:home|search|profile|history|wallet|notifications|cagnotte\/create)(?:\/|$)/.test(url.pathname);
    if (protectedPath || url.search) {
      event.respondWith(fetch(request).catch(async () => (await caches.match("/")) || Response.error()));
      return;
    }
    event.respondWith(fetch(request).then((response) => {
      if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
      return response;
    }).catch(async () => (await caches.match(request)) || (await caches.match("/home")) || (await caches.match("/")) || Response.error()));
    return;
  }

  const isAppAsset = /\.(?:js|css|woff2?|png|svg|ico|webp|avif)$/i.test(url.pathname);
  if (!isAppAsset) return;
  // Network-first keeps deployed scripts and styles current; cached copies are offline fallbacks.
  event.respondWith(fetch(request).then((response) => {
    if (response.ok) caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
    return response;
  }).catch(async () => (await caches.match(request)) || Response.error()));
});
