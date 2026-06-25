# 9292 Desktop App

A clean, native **GNOME desktop app** for [9292.nl](https://9292.nl/) — the Dutch
public transport journey planner. No Electron, no Chromium, no full browser
window. Just the website, in a native GTK window, with a configurable title bar.

> **Not affiliated with 9292.** This is a thin launcher that shows the official
> 9292 website as-is. It does not modify the page, inject JavaScript, or call
> private APIs. The 9292 logo belongs to its respective owners.

---

## Why this exists

9292 has no Linux app — only iOS and Android. This project fills that gap with a
~200-line Python wrapper around the same WebKit engine that ships with GNOME.
It's small, fast, native, and respects your GNOME theme.

| What you want | What you get |
|---|---|
| "Looks like an app, not a browser tab" | ✅ Native GTK header bar, no URL bar, no tabs |
| "Clean window with min / max / close" | ✅ Each button toggleable in config |
| "Reload button in the title bar" | ✅ Plus Shift+click for hard reload |
| "Startup size I can configure" | ✅ `640x480`, `1280x720`, `maximized`, etc. |
| "No sudo" | ✅ Installs to `~/.local/share/9292-app/` only |
| "Doesn't tweak 9292's frontend" | ✅ Pure launcher, zero DOM modification |

---

## Requirements

Ubuntu 22.04+ / Debian 12+ / any GNOME 42+ desktop.

System packages (the installer will offer to install them for you if missing):

```bash
sudo apt install python3-gi gir1.2-gtk-4.0 gir1.2-webkit2-4.1
```

That's it. No Rust toolchain, no Electron, no Node.

---

## Install

```bash
# From this folder:
./install.sh
```

The installer asks you:

1. **Startup size** — pick a preset (1–6) or `X` for a custom `WxH`.
2. **Title-bar buttons** — toggle reload / minimize / maximize / close, each Y/n.
3. **Window title** — `"auto"` (follows the page title) or your own text.
4. **User-Agent override** (optional) — paste a UA to force the mobile or
   desktop site regardless of window size. Press Enter to skip.

Then it writes everything to:

```
~/.local/share/9292-app/9292-app.py
~/.local/share/9292-app/icon.png
~/.local/share/9292-app/run.sh
~/.config/9292-app/config.toml
~/.local/share/applications/9292.desktop
```

Find **9292** in your GNOME app grid, or run `~/.local/share/9292-app/run.sh`.

### Uninstall

```bash
./install.sh --uninstall
```

Removes the app, icon, launcher, and `.desktop` entry. Your config at
`~/.config/9292-app/` is kept in case you reinstall — delete it manually if you
want a full clean slate.

---

## Configuration

The config lives at `~/.config/9292-app/config.toml`. Edit it, save, restart
the app. Anything you omit falls back to the defaults.

```toml
[window]
# "maximized" (100%), or "<width>x<height>" like "640x480"
startup_size = "1280x720"
# "auto" follows the page's <title>, or use any string verbatim
title        = "auto"

[titlebar]
# Each button is independently toggleable.
reload   = true
minimize = true
maximize = true
close    = true

[web]
url         = "https://9292.nl/"
# Empty = WebKitGTK's default UA. Paste a mobile UA to force the mobile layout.
user_agent  = ""
```

### Examples

**Mobile layout** (phone-sized window, mobile site):

```toml
[window]
startup_size = "375x812"
title        = "9292"

[web]
user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
```

**Kiosk-lite** (maximized, only the close button — no reload/min/max):

```toml
[window]
startup_size = "maximized"

[titlebar]
reload   = false
minimize = false
maximize = false
close    = true
```

**Tiny corner widget** (640×480, just reload + close):

```toml
[window]
startup_size = "640x480"

[titlebar]
reload   = true
minimize = false
maximize = false
close    = true
```

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `F5` | Reload |
| `Ctrl+R` | Reload |
| `Ctrl+Shift+R` | Hard reload (bypass cache) |
| `Shift+click` reload button | Hard reload |
| `Ctrl+Q` | Quit |

---

## How it works

The app is a single Python file (`9292-app.py`) using:

- **GTK 4** for the window, header bar, and window controls.
- **WebKit2 4.1** (the GTK port of Apple's WebKit, also used by GNOME Web /
  Epiphany) for rendering `https://9292.nl/`.
- **`tomllib`** (Python 3.11+ stdlib) for the config file — no extra deps.

The window's title bar is built with `Gtk.HeaderBar` + `Gtk.WindowControls`. The
per-button toggles work by building a [decoration
layout](https://docs.gtk.org/gtk4/property.Settings.gtk-decoration-layout.html)
string like `"minimize,maximize,close"` from the config flags.

**About "use my own browser":** a clean native title bar with custom buttons
*requires* hosting the webview inside our own GTK window. Once we hand the URL
to Chrome or Firefox in `--app` mode, we no longer control the title bar — the
browser owns the window. So this app uses WebKitGTK (a system library, not a
separate browser install). 9292 doesn't log users in, so the lack of cookie
sharing with your daily browser is not an issue.

---

## File layout of this folder

```
desktop-app/
├── 9292-app.py     # the app (~200 lines of Python)
├── config.toml     # default config (also embedded in the installer)
├── install.sh      # interactive installer + --uninstall
├── icon.png        # official 9292 PNG icon (no SVG shipped)
└── README.md       # this file
```

---

## Licence & trademark

Code: public domain / CC0. Do whatever you want.

**9292 and the 9292 logo are trademarks of their respective owners.** This
project is not affiliated with or endorsed by 9292. The icon file shipped here
is the official PNG that 9292 itself publishes at
`https://9292.nl/icon-512.png` and is used here solely to make the desktop
launcher recognisable to users who already know 9292.
