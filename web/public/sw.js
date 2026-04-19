// Minimal service worker to prevent 404 errors during development
self.addEventListener("install", () => {
  // console.log('[Service Worker] Installed');
});

self.addEventListener("activate", () => {
  // console.log('[Service Worker] Activated');
});

self.addEventListener("fetch", () => {
  // No-op
});
