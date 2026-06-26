# 9292 for Linux GNOME

A clean, native **GNOME desktop web app** for [9292.nl](https://9292.nl/) — the Dutch
public transport journey planner — plus a landing page that documents it.

**Landing page: https://samantha-agi.github.io/9292/**

> **Not affiliated with 9292.** This is a thin launcher that shows the official
> 9292 website as-is. It does not modify the page, inject JavaScript, or call
> private APIs. The 9292 name and logo belong to their respective owners.

---

## Quick start (Ubuntu / Debian / any GNOME desktop)

**Install the desktop app (one command):**

```bash
curl -fsSL https://raw.githubusercontent.com/samantha-agi/9292/main/desktop-app/install.sh | bash
```

Or inspect first:

```bash
git clone https://github.com/samantha-agi/9292.git
cd 9292/desktop-app
./install.sh
```

The installer asks a few questions (window size, which title-bar buttons to
enable, window title), then installs to `~/.local/share/9292-app/` — **no sudo**
for the app itself. Find **9292** in your GNOME app grid when it's done.

**Uninstall:**

```bash
~/.local/share/9292-app/run.sh --uninstall
```

**View the landing page:** https://samantha-agi.github.io/9292/

---

## What's in this repo

```
.
├── desktop-app/          ← the actual Linux desktop app
│   ├── 9292-app.py       ← ~200 lines of Python + GTK 4 + WebKit2
│   ├── 9292.desktop      ← static .desktop template (install.sh fills paths)
│   ├── config.toml       ← user config (window size, title-bar buttons, UA)
│   ├── install.sh        ← interactive installer (no sudo for the app)
│   ├── icon.png          ← official 9292 PNG icon (from 9292.nl/icon-512.png)
│   └── README.md         ← full desktop-app docs
│
├── src/ + public/        ← the Next.js landing page (deployed to GitHub Pages)
└── .github/workflows/    ← GitHub Actions: auto-deploys the landing page on push
```

## The desktop app

A pure launcher — **zero frontend modification, zero API hacking, zero
telemetry**. It loads `https://9292.nl/` in a native GTK window with a
configurable title bar.

| What you want | What you get |
|---|---|
| "Looks like an app, not a browser tab" | Native GTK header bar, no URL bar, no tabs |
| "Clean window with min / max / close" | Each button toggleable in config |
| "Reload button in the title bar" | Plus Shift+click for hard reload |
| "Startup size I can configure" | `640x480`, `1280x720`, `maximized`, etc. |
| "No sudo" | Installs to `~/.local/share/9292-app/` only |
| "Doesn't tweak 9292's frontend" | Pure launcher, zero DOM modification |

### Requirements

Ubuntu 22.04+ / Debian 12+ / any GNOME 42+ desktop. Three system packages are
needed — the installer detects missing ones and offers to install them (only
this step needs sudo):

```bash
sudo apt install python3-gi gir1.2-gtk-4.0 gir1.2-webkit2-4.1
```

### Config

`~/.config/9292-app/config.toml`:

```toml
[window]
startup_size = "1280x720"   # "maximized" or "WxH"
title        = "auto"       # "auto" follows page <title>, or any string

[titlebar]
reload   = true             # each button independently toggleable
minimize = true
maximize = true
close    = true

[web]
url         = "https://9292.nl/"
user_agent  = ""             # empty = default; paste a UA to force mobile/desktop
```

See [`desktop-app/README.md`](desktop-app/README.md) for full docs, examples,
and keyboard shortcuts.

---

## The landing page

A [Next.js 16](https://nextjs.org/) + TypeScript + Tailwind CSS + shadcn/ui
site that documents the desktop app.

**Live:** https://samantha-agi.github.io/9292/

The site auto-deploys to GitHub Pages on every push to `main` (via
`.github/workflows/deploy.yml`). It's built as a static export with
`basePath: /9292` so all asset URLs resolve correctly under
`https://samantha-agi.github.io/9292/`.

To run it locally:

```bash
bun install
bun run dev    # http://localhost:3000 (no basePath locally)
```

The landing page reads the `desktop-app/` files from disk at build time (single
source of truth — no copy-paste drift between the docs and the actual code).

---

## Why WebKitGTK instead of Chrome / Firefox?

A clean native title bar with custom buttons (reload + per-button min/max/close
toggles) requires hosting the webview inside our own GTK window. Once you hand a
URL to Chrome or Firefox in `--app` mode, you no longer control the title bar —
the browser owns the window. So this app uses **WebKitGTK** (a system library,
the same engine GNOME Web / Epiphany uses), not the user's installed browser.
9292 doesn't require login, so the lack of cookie-sharing with your daily
browser is a non-issue.

---

## Licence

Code: **CC0 / public domain**. Do whatever you want.

**9292 and the 9292 logo are trademarks of their respective owners.** This
project is not affiliated with or endorsed by 9292. The icon file shipped in
`desktop-app/icon.png` is the official PNG that 9292 itself publishes at
`https://9292.nl/icon-512.png`, used here solely to make the desktop launcher
recognisable to users who already know 9292.
