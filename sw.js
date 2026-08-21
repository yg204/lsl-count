/* LSL Container Count — service worker
 *
 * The app is a single self-contained file: the product library, the styles and all the
 * logic live inside index.html, and there are no fonts, CDNs or API calls to fetch. So
 * this worker only has to do one thing well — hold the shell in cache and serve it
 * whether or not the phone has signal.
 *
 * TO SHIP AN UPDATE: bump CACHE_VERSION below, then push. The running app spots the new
 * worker, shows the "newer version is ready" bar, and only swaps over when it's tapped —
 * never mid-count.
 */

const CACHE_VERSION = 'v16';
const CACHE_NAME = `lsl-count-${CACHE_VERSION}`;

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
];

// ---------- install: pull the whole shell down while there's still signal ----------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // reload bypasses the HTTP cache so a fresh install never picks up a stale index.html
      cache.addAll(SHELL.map((url) => new Request(url, { cache: 'reload' })))
    )
  );
});

// ---------- activate: drop old versions ----------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith('lsl-count-') && k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------- the page asks to swap in a waiting worker ----------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

// ---------- fetch ----------
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // nothing off-origin to serve

  // Navigations: serve the cached shell immediately and refresh it in the background.
  //
  // This used to try the network first. That's fine on wifi and miserable on one bar in a
  // shipping container — every launch sat waiting for a request that would eventually
  // time out, which read as the app being slow when it was really just waiting. Now the
  // app opens at cache speed regardless of signal, and any update is picked up quietly
  // for next launch, which is what the update bar is for anyway.
  if (req.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html', { ignoreSearch: true }).then((cached) => {
        const fresh = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put('./index.html', copy));
            }
            return res;
          })
          .catch(() => cached || caches.match('./'));
        // cached copy wins the race when we have one; otherwise wait for the network
        return cached || fresh;
      })
    );
    return;
  }

  // Everything else (icons, manifest): cache first — it never changes without a version bump.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
