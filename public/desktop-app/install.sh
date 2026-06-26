#!/usr/bin/env bash
# =====================================================================
# 9292 Desktop App — installer for Ubuntu / Debian / GNOME
# =====================================================================
# Installs the 9292 desktop web app for the CURRENT USER only:
#
#   ~/.local/share/9292-app/9292-app.py    (the app)
#   ~/.local/share/9292-app/icon.png       (official 9292 PNG icon)
#   ~/.local/share/9292-app/run.sh         (launcher script)
#   ~/.config/9292-app/config.toml         (your config)
#   ~/.local/share/applications/9292.desktop (app menu entry)
#
# No sudo for the app itself. To remove: ./install.sh --uninstall
#
# Three ways to run:
#   1. Piped:   curl -fsSL <URL> | bash
#   2. Download: curl -fsSL <URL> -o install.sh && bash install.sh
#   3. Cloned:  git clone ... && cd 9292/desktop-app && ./install.sh
#
# In modes 1 and 2 the companion files (9292-app.py, icon.png,
# 9292.desktop, config.toml) are not on disk — this script downloads
# them automatically from the GitHub repo.
# =====================================================================
set -euo pipefail

# ----- paths ----------------------------------------------------------
APP_NAME="9292"
APP_ID="nl.9292.desktopapp"
WM_CLASS="9292ov"
DATA_DIR="${HOME}/.local/share/9292-app"
CONFIG_DIR="${HOME}/.config/9292-app"
APPS_DIR="${HOME}/.local/share/applications"
DATA_FILE="${DATA_DIR}/9292-app.py"
ICON_FILE="${DATA_DIR}/icon.png"
RUN_FILE="${DATA_DIR}/run.sh"
CONFIG_FILE="${CONFIG_DIR}/config.toml"
DESKTOP_FILE="${APPS_DIR}/9292.desktop"

# GitHub raw base URL for fetching companion files in piped/download mode.
REPO_RAW_BASE="https://raw.githubusercontent.com/samantha-agi/9292/main/desktop-app"

# Where this script lives — used to find the bundled app files.
# When piped via `curl ... | bash`, BASH_SOURCE[0] is empty (no file), so we
# detect that and download companion files from GitHub instead.
# Use ${VAR:-} form so `set -u` doesn't abort on unset BASH_SOURCE.
SCRIPT_SOURCE="${BASH_SOURCE[0]:-}"
if [[ -n "$SCRIPT_SOURCE" ]]; then
    SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_SOURCE")" && pwd)"
else
    SCRIPT_DIR=""
fi

# ----- pretty printing ------------------------------------------------
if [[ -t 1 ]]; then
    C_RESET=$'\033[0m';  C_BOLD=$'\033[1m'
    C_BLUE=$'\033[34m';  C_GREEN=$'\033[32m';  C_YELLOW=$'\033[33m';  C_RED=$'\033[31m'
else
    C_RESET=""; C_BOLD=""; C_BLUE=""; C_GREEN=""; C_YELLOW=""; C_RED=""
fi
say()    { printf '%s\n' "${C_BOLD}${C_BLUE}[$APP_NAME]${C_RESET} $*"; }
ok()     { printf '%s\n' "${C_BOLD}${C_GREEN}✓${C_RESET} $*"; }
warn()   { printf '%s\n' "${C_BOLD}${C_YELLOW}!${C_RESET} $*"; }
die()    { printf '%s\n' "${C_BOLD}${C_RED}✗${C_RESET} $*" >&2; exit 1; }
prompt() { printf '%s' "${C_BOLD}${C_BLUE}>>>${C_RESET} $* "; }

# ----- dependency check ----------------------------------------------
# Checks three things separately so we diagnose correctly:
#   - python3 binary
#   - python3-gi (PyGObject — `import gi`)
#   - gir1.2-gtk-4.0 typelib (gi.require_version Gtk 4.0)
#   - gir1.2-webkit2-4.1 typelib (gi.require_version WebKit2 4.1)
# Each is its own apt package on Ubuntu/Debian.
check_dependencies() {
    local missing=()

    command -v python3 >/dev/null 2>&1 || missing+=("python3")

    # Check PyGObject itself (the python3-gi package) — distinct from the GIR typelibs.
    if ! python3 -c 'import gi' 2>/dev/null; then
        missing+=("python3-gi")
    fi

    # Now check the GTK4 typelib. Only meaningful if python3-gi is present.
    if [[ " ${missing[*]} " != *" python3-gi "* ]]; then
        if ! python3 -c 'import gi; gi.require_version("Gtk","4.0")' 2>/dev/null; then
            missing+=("gir1.2-gtk-4.0")
        fi
        if ! python3 -c 'import gi; gi.require_version("WebKit2","4.1")' 2>/dev/null; then
            missing+=("gir1.2-webkit2-4.1")
        fi
    fi

    if [[ ${#missing[@]} -gt 0 ]]; then
        echo
        warn "Missing system packages: ${missing[*]}"
        say "Install them with:"
        printf '    %ssudo apt install %s%s\n' \
            "${C_BOLD}" "${missing[*]}" "${C_RESET}"
        prompt "Install them now? [Y/n]"
        local answer; read -r answer
        if [[ "${answer:-Y}" =~ ^[Yy]$ ]]; then
            sudo apt update
            sudo apt install -y "${missing[@]}"
            # Re-check after install.
            local still_missing=()
            command -v python3 >/dev/null 2>&1 || still_missing+=("python3")
            if ! python3 -c 'import gi' 2>/dev/null; then
                still_missing+=("python3-gi")
            else
                if ! python3 -c 'import gi; gi.require_version("Gtk","4.0")' 2>/dev/null; then
                    still_missing+=("gir1.2-gtk-4.0")
                fi
                if ! python3 -c 'import gi; gi.require_version("WebKit2","4.1")' 2>/dev/null; then
                    still_missing+=("gir1.2-webkit2-4.1")
                fi
            fi
            if [[ ${#still_missing[@]} -gt 0 ]]; then
                die "These packages still couldn't be loaded: ${still_missing[*]}"
            fi
            ok "Dependencies installed."
        else
            die "Cannot continue without these packages. Aborting."
        fi
    fi
}

# ----- companion file acquisition ------------------------------------
# Returns 0 if 9292-app.py is available in $SCRIPT_DIR (cloned mode),
# otherwise downloads all companion files from GitHub into a temp dir
# and repoints $SCRIPT_DIR at it.
acquire_companion_files() {
    # Cloned mode: files are already on disk next to this script.
    if [[ -n "$SCRIPT_DIR" && -f "$SCRIPT_DIR/9292-app.py" ]]; then
        return 0
    fi

    # Piped or download mode: fetch from GitHub.
    say "Fetching app files from GitHub…"
    command -v curl >/dev/null 2>&1 || die "curl is required to download the app files."
    local tmp; tmp="$(mktemp -d)"
    # Ensure the temp dir is cleaned up on exit (any exit path).
    trap 'rm -rf "$tmp"' EXIT

    local f
    for f in 9292-app.py 9292.desktop config.toml icon.png; do
        printf '  %s downloading %s\n' "${C_BOLD}${C_BLUE}→${C_RESET}" "$f"
        if ! curl -fsSL "$REPO_RAW_BASE/$f" -o "$tmp/$f"; then
            die "Failed to download $f from $REPO_RAW_BASE/$f"
        fi
    done
    SCRIPT_DIR="$tmp"
    ok "App files downloaded."
}

# ----- uninstall ------------------------------------------------------
do_uninstall() {
    say "Removing the 9292 desktop app for the current user…"
    rm -rfv "$DATA_DIR" 2>/dev/null || true
    rm -fv  "$DESKTOP_FILE" 2>/dev/null || true
    say "Your config at $CONFIG_DIR was left in place."
    say "To remove it too:  rm -rf \"$CONFIG_DIR\""
    if command -v update-desktop-database >/dev/null 2>&1; then
        update-desktop-database "$APPS_DIR" 2>/dev/null || true
    fi
    if command -v gtk-update-icon-cache >/dev/null 2>&1; then
        gtk-update-icon-cache -f -t "$HOME/.local/share/icons" 2>/dev/null || true
    fi
    ok "Uninstalled."
}

# ----- interactive helpers -------------------------------------------
ask_size() {
    cat <<EOF

Choose the window startup size:
  1) 640x480      (small — mobile-ish layout)
  2) 800x600
  3) 1024x768
  4) 1280x720     (default — desktop layout)
  5) 1920x1080    (large)
  6) maximized    (100% — fills the screen)
  X) custom       (enter WIDTHxHEIGHT yourself)
EOF
    while true; do
        prompt "Pick 1-6 or X:"
        local a; read -r a
        case "${a,,}" in
            1) SIZE="640x480"; break ;;
            2) SIZE="800x600"; break ;;
            3) SIZE="1024x768"; break ;;
            4) SIZE="1280x720"; break ;;
            5) SIZE="1920x1080"; break ;;
            6) SIZE="maximized"; break ;;
            x) prompt "Enter WIDTHxHEIGHT (e.g. 1440x900):"
               read -r custom
               if [[ "$custom" =~ ^[0-9]{3,5}x[0-9]{3,5}$ ]]; then
                   SIZE="$custom"; break
               else
                   warn "Must look like 1024x768. Try again."
               fi ;;
            *) warn "Please answer 1-6 or X." ;;
        esac
    done
}

ask_yn() {
    local question="$1" default="${2:-y}"
    local hint
    if [[ "$default" == "y" ]]; then hint="[Y/n]"; else hint="[y/N]"; fi
    while true; do
        prompt "$question $hint"
        local a; read -r a
        a="${a:-$default}"
        case "${a,,}" in
            y|yes) return 0 ;;
            n|no)  return 1 ;;
            *) warn "Please answer y or n." ;;
        esac
    done
}

ask_titlebar() {
    echo
    say "Title bar buttons:"
    if ask_yn "Show reload button?"    y; then TB_RELOAD="true";   else TB_RELOAD="false"; fi
    if ask_yn "Show minimize button?"  y; then TB_MIN="true";      else TB_MIN="false";    fi
    if ask_yn "Show maximize button?"  y; then TB_MAX="true";      else TB_MAX="false";    fi
    if ask_yn "Show close button?"     y; then TB_CLOSE="true";    else TB_CLOSE="false";  fi
}

ask_title() {
    echo
    prompt 'Window title: "auto" (follows page title) or type your own [auto]:'
    read -r TITLE
    TITLE="${TITLE:-auto}"
}

ask_ua() {
    echo
    say "Optional user-agent override (forces the mobile/desktop site regardless of window size)."
    prompt "Press Enter to skip, or paste a User-Agent string:"
    read -r UA
    UA="${UA:-}"
}

# ----- config file writer --------------------------------------------
write_config() {
    mkdir -p "$CONFIG_DIR"
    # Escape any double-quotes in the title / UA for TOML string safety.
    local title_esc ua_esc
    title_esc="${TITLE//\"/\\\"}"
    ua_esc="${UA//\"/\\\"}"
    cat > "$CONFIG_FILE" <<EOF
# 9292 Desktop App — generated by install.sh on $(date -u +%Y-%m-%dT%H:%M:%SZ)
# Edit freely; restart the app to apply changes.

[window]
startup_size = "$SIZE"
title        = "$title_esc"

[titlebar]
reload   = $TB_RELOAD
minimize = $TB_MIN
maximize = $TB_MAX
close    = $TB_CLOSE

[web]
url         = "https://9292.nl/"
user_agent  = "$ua_esc"
EOF
    ok "Config written to $CONFIG_FILE"
}

# ----- main install ---------------------------------------------------
do_install() {
    say "9292 desktop app — installer"
    say "(user-local; no sudo needed for the app itself)"
    echo

    check_dependencies
    acquire_companion_files

    ask_size
    ask_titlebar
    ask_title
    ask_ua

    echo
    say "Installing…"

    mkdir -p "$DATA_DIR" "$APPS_DIR"

    # 1) The app itself
    cp -f "$SCRIPT_DIR/9292-app.py" "$DATA_FILE"
    ok "App:     $DATA_FILE"

    # 2) The icon (official 9292 PNG — no SVG, per design)
    if [[ -f "$SCRIPT_DIR/icon.png" ]]; then
        cp -f "$SCRIPT_DIR/icon.png" "$ICON_FILE"
        ok "Icon:    $ICON_FILE"
    else
        warn "icon.png not found — app will have a generic icon."
    fi

    # 3) Launcher wrapper
    cat > "$RUN_FILE" <<EOF
#!/usr/bin/env bash
# Launcher for the 9292 desktop app.
exec python3 "$DATA_FILE" "\$@"
EOF
    chmod +x "$RUN_FILE"
    ok "Launcher: $RUN_FILE"

    # 4) Config file
    write_config

    # 5) .desktop entry — copy the static template and substitute paths.
    if [[ -f "$SCRIPT_DIR/9292.desktop" ]]; then
        cp -f "$SCRIPT_DIR/9292.desktop" "$DESKTOP_FILE"
        sed -i \
            -e "s|__RUN_FILE__|$RUN_FILE|g" \
            -e "s|__ICON_FILE__|$ICON_FILE|g" \
            "$DESKTOP_FILE"
        ok "Menu entry: $DESKTOP_FILE"
    else
        warn "9292.desktop template not found — skipping menu entry."
    fi

    # 6) Refresh desktop / icon databases if the tools exist
    command -v update-desktop-database >/dev/null 2>&1 && \
        update-desktop-database "$APPS_DIR" 2>/dev/null || true
    command -v gtk-update-icon-cache  >/dev/null 2>&1 && \
        gtk-update-icon-cache -f -t "$HOME/.local/share/icons" 2>/dev/null || true

    echo
    ok "Done. Find “9292” in your GNOME app grid, or run:  $RUN_FILE"
    say "Edit config:  \$EDITOR $CONFIG_FILE"
}

# ----- entry point ----------------------------------------------------
case "${1:-}" in
    -h|--help)
        cat <<EOF
9292 desktop app installer

Usage:
  ./install.sh             Interactive install (user-local, no sudo)
  ./install.sh --uninstall Remove the app and its menu entry
  ./install.sh -h|--help   Show this help

Installed paths:
  $DATA_DIR/
  $CONFIG_DIR/
  $DESKTOP_FILE
EOF
        ;;
    --uninstall|-u)
        do_uninstall
        ;;
    "")
        do_install
        ;;
    *)
        die "Unknown argument: $1 (try --help)"
        ;;
esac
