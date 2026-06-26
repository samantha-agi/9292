# 9292 for Linux GNOME

A clean, native **GNOME desktop web app** for [9292.nl](https://9292.nl/) — the Dutch
public transport journey planner — plus a landing page that documents it.

> **Not affiliated with 9292.** This is a thin launcher that shows the official
> 9292 website as-is. It does not modify the page, inject JavaScript, or call
> private APIs. The 9292 name and logo belong to their respective owners.

---

## What's in this repo

```
.
├── desktop-app/          ← the actual Linux desktop app
│   ├── 9292-app.py       ← ~200 lines of Python + GTK 4 + WebKit2
│   ├── config.toml       ← user config (window size, title-bar buttons, UA)
│   ├── install.sh        ← interactive installer (no sudo for the app)
│   ├── icon.png          ← official 9292 PNG icon (from 9292.nl/icon-512.png)
│   └── README.md         ← full desktop-app docs
│
└── src/ + public/        ← the Next.js landing page that documents the app
                            (served at / — see "Landing page" below)
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

### Quick install

```bash
cd desktop-app
./install.sh
```

The installer asks you a few questions (size, which title-bar buttons to enable,
window title, optional user-agent override), then writes everything to:

```
~/.local/share/9292-app/          (app, icon, launcher)
~/.config/9292-app/config.toml    (your config)
~/.local/share/applications/9292.desktop  (GNOME menu entry)
```

Find **9292** in your GNOME app grid, or run `~/.local/share/9292-app/run.sh`.

### Requirements

Ubuntu 22.04+ / Debian 12+ / any GNOME 42+ desktop.

```bash
sudo apt install python3-gi gir1.2-gtk-4.0 gir1.2-webkit2-4.1
```

(The installer detects missing packages and offers to install them.)

### Uninstall

```bash
./install.sh --uninstall
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
site that documents the desktop app. It's the page served at `/` when you run
the dev server.

```bash
bun install
bun run dev    # http://localhost:3000
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
