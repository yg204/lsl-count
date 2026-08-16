# LSL Container Count — PWA

Offline tire counting for container work. Everything the app needs, including the full
product library, is inside `index.html` — no server, no database, no signal required once
it's installed.

## Files

| File | What it does |
| --- | --- |
| `index.html` | The whole app: library, search, log, CSV export |
| `sw.js` | Service worker — holds the app in cache so it opens with no signal |
| `manifest.webmanifest` | Name, icon and colours for the home-screen install |
| `icon-180.png` | iPhone home-screen icon |
| `icon-192.png` / `icon-512.png` | Android and browser icons |
| `icon-maskable-512.png` | Android circle-crop icon |

All seven files go in the **same folder**, at the top level of the repo.

## Putting it online (GitHub, browser only — no command line)

1. Go to github.com and make a new repository. Public. Any name, e.g. `lsl-count`.
2. On the repo page, **Add file → Upload files**, drag in all seven files, then
   **Commit changes**.
3. **Settings → Pages**. Under *Source* pick **Deploy from a branch**, branch `main`,
   folder `/ (root)`. Save.
4. Wait about a minute, then reload the Settings → Pages screen. It shows the live
   address, something like `https://yourname.github.io/lsl-count/`.

## Installing it on the iPhone

1. Open that address in **Safari** (not Chrome — only Safari can install to the home
   screen on iOS).
2. Tap the share button, scroll down, tap **Add to Home Screen**, then **Add**.
3. Open it once from the home screen while you still have signal. That first open is what
   downloads the app into cache.

After that it opens full screen with no address bar, and works with the phone in
airplane mode or a container with no bars.

## Shipping a change later

1. Edit or re-upload `index.html`.
2. Open `sw.js`, change `const CACHE_VERSION = 'v1';` to `'v2'` (then `'v3'`, and so on).
   **This step is what makes phones pick up the change** — without it they keep serving
   the cached copy.
3. Commit. Next time the app is opened with signal, a bar appears at the top offering the
   update. Nothing swaps until it's tapped, so an update can't interrupt a count.

## Your data

The session log and any library edits are saved on the phone itself, and survive closing
the app, a reload, and a dead battery. They are *not* in the cloud — the only copies that
leave the phone are the ones you make with **Export CSV** and **Backup file**. Export at
the end of each container.
