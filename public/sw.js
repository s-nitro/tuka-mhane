// Service worker: lets the app open instantly and work offline once visited.
// - the page itself and the app files are kept after the first visit
// - abhangs.json is always fetched fresh when online (so new abhangs show up),
//   and the last copy is used when offline
// Change VERSION to throw away everything this worker has stored.

const VERSION = 'v1';
const CACHE = `gatha-${VERSION}`;
const SHELL = self.registration.scope; // the app's index page, e.g. https://you.github.io/repo/

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll([SHELL]))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Any page address (/repo/p/57 included) is answered with the app's index page;
// the app reads the number from the address itself.
async function appShell(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(SHELL);
  const refresh = fetch(SHELL)
    .then((res) => {
      if (res.ok) cache.put(SHELL, res.clone());
      return res;
    })
    .catch(() => null);
  if (cached) return cached;
  return (await refresh) || fetch(request);
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const res = await fetch(request, { cache: 'no-cache' });
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  const refresh = fetch(request)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(request, res.clone());
      return res;
    })
    .catch(() => cached);
  return cached || refresh;
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  if (request.mode === 'navigate') {
    event.respondWith(appShell(request));
    return;
  }

  const sameOrigin = url.origin === self.location.origin;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  if (sameOrigin && url.pathname.endsWith('.json')) {
    event.respondWith(networkFirst(request));
  } else {
    event.respondWith(staleWhileRevalidate(request));
  }
});
