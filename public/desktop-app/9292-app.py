#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
9292 — A clean GNOME desktop web app for 9292.nl
=================================================

Loads https://9292.nl/ in a native GTK4 + WebKit2 window with a
configurable title bar (reload / minimize / maximize / close) and a
configurable startup size.

This is a *launcher*, not a modifier. The 9292 website is shown exactly
as 9292 serves it — no JavaScript injection, no API hacking, no DOM
tweaks, no telemetry added. Just a clean native window.

Config:    ~/.config/9292-app/config.toml
Data dir:  ~/.local/share/9292-app/

Requires on Ubuntu / Debian:
    sudo apt install python3-gi gir1.2-gtk-4.0 gir1.2-webkit2-4.1

Copyright: Public domain — do whatever you want with this.
9292 and the 9292 logo are trademarks of their respective owners; this
project is not affiliated with or endorsed by 9292.
"""

from __future__ import annotations

import sys
import tomllib
from pathlib import Path

import gi

gi.require_version("Gtk", "4.0")
gi.require_version("WebKit2", "4.1")

from gi.repository import Gtk, WebKit2, GLib, Gdk, Gio  # noqa: E402

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

APP_ID = "nl.9292.desktopapp"
APP_NAME = "9292"
DEFAULT_URL = "https://9292.nl/"

CONFIG_DIR = Path.home() / ".config" / "9292-app"
CONFIG_PATH = CONFIG_DIR / "config.toml"

DEFAULT_CONFIG: dict = {
    "window": {
        # "maximized" (a.k.a. "100%") or "<width>x<height>" (e.g. "640x480")
        "startup_size": "1280x720",
        # "auto" follows the page title; any other string is used verbatim
        "title": "auto",
    },
    "titlebar": {
        "reload": True,
        "minimize": True,
        "maximize": True,
        "close": True,
    },
    "web": {
        "url": DEFAULT_URL,
        # Empty string = use WebKitGTK's default user agent.
        # Set this to force the mobile or desktop site regardless of size.
        "user_agent": "",
    },
}


# ---------------------------------------------------------------------------
# Config loading (TOML, deep-merged over defaults)
# ---------------------------------------------------------------------------

def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge ``override`` into ``base`` (override wins)."""
    out = dict(base)
    for k, v in override.items():
        if k in out and isinstance(out[k], dict) and isinstance(v, dict):
            out[k] = _deep_merge(out[k], v)
        else:
            out[k] = v
    return out


def load_config() -> dict:
    """Load the user's config, deep-merged on top of the defaults."""
    if not CONFIG_PATH.exists():
        return DEFAULT_CONFIG
    try:
        with CONFIG_PATH.open("rb") as f:
            user_cfg = tomllib.load(f)
        return _deep_merge(DEFAULT_CONFIG, user_cfg)
    except Exception as exc:  # noqa: BLE001
        print(
            f"[9292] Warning: could not parse {CONFIG_PATH}: {exc}\n"
            "[9292] Falling back to default config.",
            file=sys.stderr,
        )
        return DEFAULT_CONFIG


# ---------------------------------------------------------------------------
# Main window
# ---------------------------------------------------------------------------

class NineTwoNineWindow(Gtk.ApplicationWindow):
    """The application window: header bar + WebKit WebView."""

    def __init__(self, app: "NineTwoNineApp"):
        super().__init__(application=app, title=APP_NAME)
        self.app = app
        self.cfg = app.cfg

        # ----- Header bar ------------------------------------------------
        header = Gtk.HeaderBar()
        # We add our own window controls so per-button toggles work.
        header.set_show_title_buttons(False)

        # Reload button (left side). Shift+click bypasses the cache.
        if self.cfg["titlebar"].get("reload", True):
            self.reload_btn = Gtk.Button.new_from_icon_name("view-refresh-symbolic")
            self.reload_btn.set_tooltip_text(
                "Reload  (Shift+click: bypass cache)"
            )
            self.reload_btn.set_has_frame(False)
            gesture = Gtk.GestureClick.new()
            gesture.connect("pressed", self._on_reload_pressed)
            self.reload_btn.add_controller(gesture)
            header.pack_start(self.reload_btn)

        # Title label (updates with the page's <title> if configured "auto")
        self.title_label = Gtk.Label(label=APP_NAME)
        self.title_label.add_css_class("title")
        header.set_title_widget(self.title_label)

        # Window controls (right side), built from the config toggles.
        # Gtk.WindowControls understands a "decoration layout" string like
        # "minimize,maximize,close" — we build it from the enabled buttons.
        layout_parts: list[str] = []
        if self.cfg["titlebar"].get("minimize", True):
            layout_parts.append("minimize")
        if self.cfg["titlebar"].get("maximize", True):
            layout_parts.append("maximize")
        if self.cfg["titlebar"].get("close", True):
            layout_parts.append("close")
        if layout_parts:
            controls = Gtk.WindowControls.new(Gtk.Pack.END)
            controls.set_decoration_layout(",".join(layout_parts))
            header.pack_end(controls)

        self.set_titlebar(header)

        # ----- WebView ---------------------------------------------------
        self.webview = WebKit2.WebView()
        self.webview.set_vexpand(True)
        self.webview.set_hexpand(True)

        settings = self.webview.get_settings()
        settings.set_enable_developer_extras(False)
        settings.set_enable_fullscreen(True)
        ua = str(self.cfg["web"].get("user_agent", "")).strip()
        if ua:
            settings.set_user_agent(ua)

        # Live title sync
        self.webview.connect("notify::title", self._on_notify_title)

        self.webview.load_uri(self.cfg["web"].get("url", DEFAULT_URL))
        self.set_child(self.webview)

        # ----- Startup size ---------------------------------------------
        size = str(self.cfg["window"].get("startup_size", "1280x720")).strip().lower()
        if size in ("maximized", "100%", "full", "fullscreen"):
            # Sensible fallback size before maximise kicks in
            self.set_default_size(1024, 720)
            GLib.idle_add(lambda: self.maximize())
        else:
            try:
                w_s, h_s = size.split("x")
                w, h = int(w_s), int(h_s)
                if w < 320 or h < 240:
                    raise ValueError("size too small")
                self.set_default_size(w, h)
            except Exception:  # noqa: BLE001
                print(
                    f"[9292] Invalid startup_size '{size}' — defaulting to 1280x720",
                    file=sys.stderr,
                )
                self.set_default_size(1280, 720)

        # ----- Keyboard shortcuts ---------------------------------------
        # F5 / Ctrl+R       -> reload
        # Ctrl+Shift+R      -> hard reload (bypass cache)
        # Ctrl+Q            -> quit
        key_ctrl = Gtk.EventControllerKey.new()
        key_ctrl.connect("key-pressed", self._on_key_pressed)
        self.add_controller(key_ctrl)

    # ----- signal handlers -----------------------------------------------

    def _on_reload_pressed(self, gesture: Gtk.GestureClick, _n_press, _x, _y):
        event = gesture.get_current_event()
        hard = False
        if event is not None:
            state = event.get_state()
            hard = bool(state & Gdk.ModifierType.SHIFT_MASK)
        if hard:
            self.webview.reload_bypass_cache()
        else:
            self.webview.reload()

    def _on_key_pressed(self, _ctrl, keyval, _keycode, state):
        key = Gdk.keyval_name(keyval).lower()
        ctrl = bool(state & Gdk.ModifierType.CONTROL_MASK)
        shift = bool(state & Gdk.ModifierType.SHIFT_MASK)
        if key == "f5":
            self.webview.reload_bypass_cache() if shift else self.webview.reload()
            return True
        if ctrl and key == "r":
            self.webview.reload_bypass_cache() if shift else self.webview.reload()
            return True
        if ctrl and key == "q":
            self.app.quit()
            return True
        return False

    def _on_notify_title(self, wv: WebKit2.WebView, _param):
        page_title = wv.get_title() or ""
        configured = str(self.cfg["window"].get("title", "auto"))
        display = page_title or APP_NAME if configured == "auto" else configured
        self.title_label.set_text(display)
        self.set_title(display)


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

class NineTwoNineApp(Gtk.Application):
    """Single-instance GTK application."""

    def __init__(self):
        super().__init__(application_id=APP_ID, flags=Gio.ApplicationFlags.FLAGS_NONE)
        self.cfg = load_config()
        self.win: NineTwoNineWindow | None = None

    def do_activate(self):  # type: ignore[override]
        if self.win is not None:
            # Single-instance behaviour: just focus the existing window.
            self.win.present()
            return
        self.win = NineTwoNineWindow(self)
        self.win.connect("close-request", lambda _w: self.quit())
        self.win.present()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

def main() -> int:
    app = NineTwoNineApp()
    return app.run(sys.argv)


if __name__ == "__main__":
    sys.exit(main())
