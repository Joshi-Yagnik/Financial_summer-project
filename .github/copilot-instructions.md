<!-- Copilot / AI agent instructions for Financial_summer-project -->
# Quick orientation for AI coding agents

This repository is a small static web project (HTML/CSS/JS). The goal of these instructions is to help an AI agent become productive quickly by describing the architecture, common patterns, and concrete edit points.

1) Big picture
- Static single-page-ish website composed of many HTML pages (e.g. [All.html](All.html), [assets.html](assets.html), [CreateAccount.html](CreateAccount.html)).
- Navigation is performed client-side via `window.location.href` calls (see [mic.js](mic.js) and per-page scripts like [current-assets.js](current-assets.js)).
- Shared behaviors live in small JS modules: `mic.js` (voice assistant), `script.js` (create-account form handling), and several per-page JS files. Many pages also include inline scripts — changing page logic may require editing the page HTML directly.

2) Key patterns and examples (do these exactly)
- Navigation: add or change routes by updating `window.location.href` strings. Example: to add voice navigation to a new page, add a branch in `handleCommand()` in [mic.js](mic.js).
- Local state: the site uses `localStorage` for lightweight persistence. Account records are stored under `accountList` (see [script.js](script.js)). When editing forms, keep the JSON shape consistent with existing entries (`id, accountName, description, parentEnabled, ...`).
- UI conventions:
  - Uses Google Material Icons and utility classes like `.kebab-menu`, `.favorite-icon` and `.fab` across many pages (see [assets.html](assets.html)).
  - Kebab/dropdown pattern: toggle uses `element.nextElementSibling` and a `.show` CSS class; closing is handled by a document `click` listener.
- Voice assistant: `mic.js` implements `handleCommand(cmd)` with many `if (cmd.includes(...)) window.location.href = '...';` rules. Edit this file to add/remove voice commands.
- Theming & layout variables are centralized in CSS files like [assets.css](assets.css). Prefer editing CSS variables in `:root` for theme changes.

3) Developer workflow — running & debugging
- No build step or package manager. To preview, open `index.html` or any page in a browser (live-server or simple file open is fine). Example quick test (recommended): run a Live Server extension or run a minimal HTTP server in the repo root:

```bash
# from repo root
python -m http.server 8000
# then open http://localhost:8000/All.html
```

- Debugging: use browser DevTools console and `localStorage` inspector. Many behaviors are implemented inline — toggling scripts and HTML changes are visible immediately when reloading.

4) Safe change checklist (always follow)
- Search for page-specific inline scripts before moving logic into a shared file. Many pages duplicate small handlers; preserve existing DOM id/class names (e.g. `parentToggle`, `accountName`) to avoid breaking bindings.
- When modifying stored objects, keep the same properties used by [script.js](script.js) to avoid runtime errors.
- If adding a new page: create the HTML, include Material Icons stylesheet, include any per-page JS, and add a voice command in [mic.js](mic.js) if voice navigation is desired.

5) Files to inspect for changes (highest-value)
- [mic.js](mic.js) — voice commands and routing
- [script.js](script.js) — form handling and `accountList` storage
- [assets.html](assets.html), [CreateAccount.html](CreateAccount.html) — examples of inline scripting and DOM ids used by scripts
- [assets.css](assets.css) — theme variables and layout patterns

6) Small examples
- Add a voice route: edit `handleCommand()` in [mic.js](mic.js):
  - copy an existing `else if` block and point `window.location.href` to the new page file.
- Persist a new account property: update the object literal in [script.js](script.js) and ensure `localStorage` consumers read the new field (search for `accountList`).

7) Restriction / things not present
- There is no backend API, no Node/npm toolchain, and no automated tests found. Do not attempt to run `npm` or expect server-side endpoints.

If anything above is unclear or you want me to expand any section (examples for adding a page, refactoring inline scripts to shared modules, or creating a tiny local dev server script), tell me which area to expand and I will iterate.
