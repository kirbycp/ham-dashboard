// Service worker: makes hamdash.html launchable with no network (e.g. from
// the macOS Dock or a Home Screen). It only caches the app shell — the page's
// dozen live image feeds (radar, GOES, HamClock captures, solar data, etc.)
// and the menu iframe targets are all cross-origin and deliberately NOT
// intercepted, so they always hit the network fresh like the original page.
//
// Bump CACHE_VERSION whenever the SHELL list below changes.
const CACHE_VERSION = 'v1';
const SHELL_CACHE = 'ham-dashboard-shell-' + CACHE_VERSION;
const FONT_CACHE = 'ham-dashboard-fonts-v1';

const SHELL = [
  './hamdash.html',
  './config.js',
  './wheelzoom.js',
  './manifest.json',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// If the network hasn't answered in this long, serve the cached shell instead.
const NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('ham-dashboard-shell-') && k !== SHELL_CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    // Page loads: network first (so edits show up when online), cache when offline.
    if (req.mode === 'navigate') {
      event.respondWith(networkFirst(req));
      return;
    }
    event.respondWith(staleWhileRevalidate(req, SHELL_CACHE));
    return;
  }

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(staleWhileRevalidate(req, FONT_CACHE));
  }
  // Anything else (radar/satellite/solar images, iframe menu targets) falls
  // through to the network untouched.
});

async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), NETWORK_TIMEOUT_MS))
    ]);
    if (res.ok) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(req, { ignoreSearch: true }) || await cache.match('./hamdash.html');
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  const refresh = fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
    return res;
  });
  if (cached) {
    refresh.catch(() => {});
    return cached;
  }
  return refresh;
}
