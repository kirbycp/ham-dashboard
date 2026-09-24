# Ham-Dashboard

Live at: https://kirbycp.github.io/Ham-Dashboard/hamdash.html

Themed to match the [Station Dashboard](https://github.com/kirbycp/station-dashboard) — same dark
palette, fonts, and panel styling — while keeping the original multi-panel
live-image layout, slide-out menus, and per-item config-driven colors (now
shown as an accent stripe rather than a full button fill).

### Instructions
1. Just download the files from the Github repository (hamdash.html, config.js, and wheelzoom.js) and keep them together on the same folder.
2. Open hamdash.html with any browser of your preference and you done.
3. With any text editor (like Notepad) you can change the source images (can be more than one per box) or the menu options from the config.js file.

### Install as an app (PWA)
The page can be installed instead of just bookmarked:
- **macOS (Safari):** open the hosted URL above, then File → Add to Dock.
- **iPad/iPhone (Safari):** Share → Add to Home Screen.

Installed this way it opens in its own window with no browser chrome, and
`sw.js` caches the app shell so it still launches with no network — the dozen
live image feeds (radar, GOES, HamClock, solar data, etc.) always fetch fresh
over the network as before.

