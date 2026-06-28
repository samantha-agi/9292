# 9292 for Linux GNOME

A clean, native **GNOME desktop app** for [9292.nl](https://9292.nl/) — the Dutch
public transport journey planner. No Electron, no browser chrome, no frontend
tweaks. Just the website in a native GTK window with the buttons you choose.

**Project page:** https://samantha-agi.github.io/9292/

> **Not affiliated with 9292.** This is a thin launcher that shows the official
> 9292 website as-is. The 9292 name and logo belong to their respective owners.

---

## Download & install on Ubuntu (one command)

```bash
curl -fsSL https://raw.githubusercontent.com/samantha-agi/9292/main/desktop-app/install.sh | bash
```

That downloads the installer, asks you a few questions (window size, which
title-bar buttons to enable, window title), and installs the app for your user
only — **no sudo** for the app itself.

When it finishes, open your GNOME app grid and search **9292**, or run:

```bash
~/.local/share/9292-app/run.sh
```

### Don't trust the pipe? Do it in two steps instead:

```bash
# 1. Download the installer (and the files it needs)
git clone https://github.com/samantha-agi/9292.git
cd 9292/desktop-app

# 2. Run it
./install.sh
```

### Uninstall

```bash
~/.local/share/9292-app/run.sh --uninstall
# or, from the cloned repo:
./install.sh --uninstall
```

---

## What gets installed

```
~/.local/share/9292-app/
├── 9292-app.py        ← the app (Python + GTK 4 + WebKit)
├── icon.png           ← official 9292 PNG icon
├── run.sh             ← launcher script (what the .desktop file calls)
└── (9292.desktop is installed to ~/.local/share/applications/)

~/.config/9292-app/
└── config.toml        ← your config

~/.local/share/applications/
└── 9292.desktop       ← makes 9292 appear in the GNOME app grid
```

The `.desktop` file is what makes GNOME treat this as an app (not a Python
script). It points `Exec=` at `run.sh` (which calls `python3 9292-app.py`) and
sets `StartupWMClass=9292ov` so GNOME groups the running window under the
launcher icon.

---

## System requirements

Ubuntu 22.04+ / Debian 12+ / any GNOME 42+ desktop. Three system packages are
needed — the installer detects missing ones and offers to install them (only
this step needs sudo):

```bash
sudo apt install python3-gi gir1.2-gtk-4.0 gir1.2-webkit-6.0
```

---

## Configuration

Config lives at `~/.config/9292-app/config.toml`. Edit it, save, restart the
app. Anything you leave out falls back to the defaults.

```toml
[window]
# "maximized" (100%) or "<width>x<height>" like "640x480"
startup_size = "1280x720"
# "auto" follows the page's <title>, or use any literal string
title        = "auto"

[titlebar]
# Each button is independently toggleable.
reload   = true
minimize = true
maximize = true
close    = true

[web]
url         = "https://9292.nl/"
# Empty = WebKitGTK's default UA. Paste a mobile UA to force the mobile site.
user_agent  = ""
```

### Examples

**Mobile layout** (phone-sized window + mobile site):

```toml
[window]
startup_size = "375x812"
title        = "9292"

[titlebar]
reload   = true
minimize = false
maximize = false
close    = true

[web]
user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
```

**Kiosk-lite** (maximized, only the close button):

```toml
[window]
startup_size = "maximized"

[titlebar]
reload   = false
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

## Why WebKitGTK instead of Chrome / Firefox?

A clean native title bar with custom buttons (reload + per-button min/max/close
toggles) requires hosting the webview inside our own GTK window. Once you hand a
URL to Chrome or Firefox in `--app` mode, you no longer control the title bar —
the browser owns the window. So this app uses **WebKitGTK** (a system library,
the same engine GNOME Web / Epiphany uses), not the user's installed browser.
9292 doesn't require login, so the lack of cookie-sharing with your daily
browser is a non-issue.

---

## File layout of this folder

```
desktop-app/
├── 9292-app.py     ← the app (~200 lines of Python + GTK 4 + WebKit)
├── 9292.desktop    ← static .desktop template (install.sh fills in paths)
├── config.toml     ← default config (heavily commented)
├── install.sh      ← interactive installer + --uninstall
├── icon.png        ← official 9292 PNG icon (no SVG shipped)
└── README.md       ← this file
```

---

## Licence & trademark

Code: public domain / CC0. Do whatever you want.

**9292 and the 9292 logo are trademarks of their respective owners.** This
project is not affiliated with or endorsed by 9292. The icon file shipped here
is the official PNG that 9292 itself publishes at
`https://9292.nl/icon-512.png` and is used solely to make the desktop launcher
recognisable to users who already know 9292.
