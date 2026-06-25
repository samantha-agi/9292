import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  Command,
  Cpu,
  Download,
  FileCode2,
  Gauge,
  Github,
  Globe,
  Heart,
  Layers,
  Lock,
  Minus,
  Monitor,
  MousePointerClick,
  Package,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Square,
  Terminal,
  Triangle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import { CopyButton } from "@/components/copy-button";
import { CodeBlock } from "@/components/code-block";

// ---------------------------------------------------------------------------
// Load the desktop-app files from disk (single source of truth).
// ---------------------------------------------------------------------------

async function loadDesktopFiles() {
  const root = process.cwd();
  const [appPy, installSh, configToml, readme] = await Promise.all([
    readFile(join(root, "desktop-app", "9292-app.py"), "utf8"),
    readFile(join(root, "desktop-app", "install.sh"), "utf8"),
    readFile(join(root, "desktop-app", "config.toml"), "utf8"),
    readFile(join(root, "desktop-app", "README.md"), "utf8"),
  ]);
  return { appPy, installSh, configToml, readme };
}

// ---------------------------------------------------------------------------
// Static config snippets for the "examples" section
// ---------------------------------------------------------------------------

const EXAMPLE_MOBILE = `# Mobile layout (phone-sized window + mobile site)
[window]
startup_size = "375x812"
title        = "9292"

[titlebar]
reload   = true
minimize = false
maximize = false
close    = true

[web]
user_agent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"`;

const EXAMPLE_KIOSK = `# Kiosk-lite: maximized, only the close button
[window]
startup_size = "maximized"

[titlebar]
reload   = false
minimize = false
maximize = false
close    = true`;

const EXAMPLE_TINY = `# Tiny corner widget: 640x480, reload + close only
[window]
startup_size = "640x480"

[titlebar]
reload   = true
minimize = false
maximize = false
close    = true`;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function Home() {
  const files = await loadDesktopFiles();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <WindowMockup />
        <Install />
        <ConfigSection configToml={files.configToml} />
        <SourceBrowser files={files} />
        <KeyboardShortcuts />
        <FAQ />
        <Disclaimer />
      </main>
      <SiteFooter />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="#top" className="flex items-center gap-2.5 group">
          <span className="checker-2x2 h-7 w-7 rounded-md ring-1 ring-border transition-transform group-hover:scale-105" />
          <span className="font-mono text-base font-bold tracking-tight">
            9292
            <span className="text-muted-foreground font-normal"> for Linux</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {[
            ["Features", "#features"],
            ["Install", "#install"],
            ["Config", "#config"],
            ["Source", "#source"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-accent/60"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Button asChild size="sm" className="ml-1 gap-1.5">
            <a href="#install">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Install</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b">
      {/* Subtle checker background */}
      <div
        aria-hidden
        className="checker-tile pointer-events-none absolute inset-0 text-foreground opacity-[0.015]"
      />
      {/* Radial fade */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start">
            <Badge variant="secondary" className="mb-5 gap-1.5 font-mono text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              v1.0 · GTK 4 · WebKit2 4.1
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              9292, <span className="text-muted-foreground">as a real</span>
              <br />
              GNOME app.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">
              A clean, native desktop window for{" "}
              <a
                href="https://9292.nl"
                className="font-medium text-foreground underline decoration-amber-500/60 underline-offset-4 hover:decoration-amber-500"
              >
                9292.nl
              </a>
              . No Electron. No browser chrome. No frontend tweaks. Just the
              website, in a configurable GTK window with the buttons you choose.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <a href="#install">
                  <Download className="h-4 w-4" />
                  Install in 30 seconds
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <a href="#config">
                  <Settings2 className="h-4 w-4" />
                  See the config
                </a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                No sudo
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-emerald-500" />
                No telemetry
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5 text-emerald-500" />
                User-local install
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-emerald-500" />
                ~200 lines of Python
              </span>
            </div>
          </div>

          {/* Right: stylised 9292 checker logo card */}
          <div className="relative">
            <div className="checker-2x2 relative mx-auto aspect-square w-full max-w-md rounded-2xl shadow-2xl ring-1 ring-border overflow-hidden">
              <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                {/* The "9292" text overlaid in the four quadrants */}
                <div className="flex items-center justify-center">
                  <span className="text-white font-mono font-bold text-7xl sm:text-8xl lg:text-9xl">
                    9
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-black font-mono font-bold text-7xl sm:text-8xl lg:text-9xl">
                    2
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-black font-mono font-bold text-7xl sm:text-8xl lg:text-9xl">
                    9
                  </span>
                </div>
                <div className="flex items-center justify-center">
                  <span className="text-white font-mono font-bold text-7xl sm:text-8xl lg:text-9xl">
                    2
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-center text-xs text-muted-foreground font-mono">
              official 9292 icon · used as the .desktop launcher icon
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Features
// ---------------------------------------------------------------------------

const FEATURES = [
  {
    icon: Monitor,
    title: "Native GNOME window",
    body: "Built with GTK 4 and WebKit2 — the same engine GNOME Web (Epiphany) uses. Honors your theme, your fonts, your window manager.",
  },
  {
    icon: MousePointerClick,
    title: "Configurable title bar",
    body: "Toggle reload, minimize, maximize, and close independently. Want just reload + close? One line in the config.",
  },
  {
    icon: Gauge,
    title: "Startup size presets",
    body: "Pick 640×480, 1280×720, maximized, or any custom WxH. The responsive 9292 site adapts to the size you choose.",
  },
  {
    icon: RefreshCw,
    title: "Reload in the title bar",
    body: "A proper reload button where an app button belongs — not buried in a menu. Shift+click bypasses the cache.",
  },
  {
    icon: ShieldCheck,
    title: "No frontend modification",
    body: "Pure launcher. Zero JavaScript injection, zero DOM tweaks, zero private-API hacking. 9292 has nothing to object to.",
  },
  {
    icon: Lock,
    title: "User-local, no sudo",
    body: "Installs to ~/.local/share/9292-app/ and ~/.config/9292-app/. Uninstall with one command. Nothing touches /usr.",
  },
];

function Features() {
  return (
    <section id="features" className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Why this exists"
          title="9292 has no Linux app. This fills the gap — cleanly."
          subtitle="No Electron. No Chromium. No full browser window. Just a thin GTK wrapper around the website you already use."
        />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.body}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Window mockup (pure CSS, no screenshot needed)
// ---------------------------------------------------------------------------

function WindowMockup() {
  return (
    <section className="border-b bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="What you get"
          title="A window that looks like an app, not a browser tab."
          subtitle="No URL bar. No tabs. No bookmarks. Just the page and the buttons you opted into."
        />
        <div className="mt-12 mx-auto max-w-3xl">
          <MockWindow />
        </div>
      </div>
    </section>
  );
}

function MockWindow() {
  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-2xl ring-1 ring-border">
      {/* Header bar */}
      <div className="flex h-11 items-center justify-between border-b bg-muted/40 px-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Reload"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <span className="checker-2x2 h-3.5 w-3.5 rounded-[3px]" />
          <span className="text-xs font-medium text-foreground">
            Plan je reis met het OV en deelvervoer | 9292
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Minimize"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label="Maximize"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <Square className="h-3 w-3" />
          </button>
          <button
            type="button"
            aria-label="Close"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      {/* Page content (stylised 9292 form) */}
      <div className="bg-background p-6 sm:p-10">
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <div className="checker-2x2 mx-auto mb-3 h-10 w-10 rounded" />
            <div className="text-xl font-bold">Plan je reis</div>
            <div className="text-sm text-muted-foreground">
              met het OV en deelvervoer
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-lg border p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Van
              </div>
              <div className="text-sm text-foreground/70">
                adres, station, halte
              </div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Naar
              </div>
              <div className="text-sm text-foreground/70">
                adres, station, halte
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg border p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Vertrek / Aankomst
                </div>
                <div className="text-sm text-foreground/70">Nu</div>
              </div>
              <div className="flex-1 rounded-lg border p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Datum
                </div>
                <div className="text-sm text-foreground/70">Vandaag</div>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-lg bg-foreground py-3 text-sm font-semibold text-background"
            >
              Plan reis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Install
// ---------------------------------------------------------------------------

function Install() {
  const curlCmd = "curl -fsSL https://9292-linux.example/desktop-app/install.sh | bash";
  const manualCmd = `git clone https://9292-linux.example/9292-linux.git
cd 9292-linux/desktop-app
./install.sh`;

  return (
    <section id="install" className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Install"
          title="Three steps. No sudo for the app itself."
          subtitle="The installer asks you a few questions, writes the config, drops the files in ~/.local/share/9292-app/, and registers a .desktop entry."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          <InstallStep
            n={1}
            icon={Download}
            title="Get the installer"
            body="Download the install.sh script (or clone the repo for the full source)."
          >
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                One-liner:
              </div>
              <div className="flex items-stretch gap-2">
                <pre className="scroll-thin flex-1 overflow-x-auto rounded-md border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed">
                  <code>{curlCmd}</code>
                </pre>
                <CopyButton text={curlCmd} label="" />
              </div>
            </div>
          </InstallStep>

          <InstallStep
            n={2}
            icon={Terminal}
            title="Run it"
            body="The installer checks deps, asks about size & buttons, writes the config and .desktop entry."
          >
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">
                Or from a clone:
              </div>
              <pre className="scroll-thin overflow-x-auto rounded-md border bg-muted/40 p-2.5 font-mono text-[11px] leading-relaxed">
                <code>{manualCmd}</code>
              </pre>
            </div>
          </InstallStep>

          <InstallStep
            n={3}
            icon={Package}
            title="Find it in GNOME"
            body="Open the app grid and search “9292”, or run ~/.local/share/9292-app/run.sh."
          >
            <div className="rounded-md border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
              <div className="mb-2 font-medium text-foreground">
                Files written:
              </div>
              <ul className="space-y-1 font-mono">
                <li>~/.local/share/9292-app/9292-app.py</li>
                <li>~/.local/share/9292-app/icon.png</li>
                <li>~/.local/share/9292-app/run.sh</li>
                <li>~/.config/9292-app/config.toml</li>
                <li>~/.local/share/applications/9292.desktop</li>
              </ul>
            </div>
          </InstallStep>
        </div>

        <div className="mt-8 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <div className="flex gap-3">
            <Cpu className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-500" />
            <div className="text-sm">
              <div className="font-medium">System dependencies</div>
              <p className="mt-1 text-muted-foreground">
                The app needs{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  python3-gi
                </code>
                ,{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  gir1.2-gtk-4.0
                </code>
                , and{" "}
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                  gir1.2-webkit2-4.1
                </code>
                . The installer detects missing ones and offers to install them
                with <code className="font-mono text-xs">apt install</code>{" "}
                (only that step needs sudo).
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button asChild variant="outline" className="gap-2">
            <a href="/desktop-app/install.sh" download>
              <Download className="h-4 w-4" />
              Download install.sh
            </a>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <a href="/desktop-app/README.md" download>
              <FileCode2 className="h-4 w-4" />
              Download README
            </a>
          </Button>
          <CopyButton
            text="./install.sh --uninstall"
            label="Copy uninstall command"
          />
        </div>
      </div>
    </section>
  );
}

function InstallStep({
  n,
  icon: Icon,
  title,
  body,
  children,
}: {
  n: number;
  icon: React.ElementType;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-foreground text-background">
            <Icon className="h-4 w-4" />
          </div>
          <span className="font-mono text-3xl font-bold text-muted-foreground/30">
            {n}
          </span>
        </div>
        <CardTitle className="mt-2 text-base">{title}</CardTitle>
        <CardDescription className="text-sm">{body}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Config section
// ---------------------------------------------------------------------------

function ConfigSection({ configToml }: { configToml: string }) {
  const examples = [
    { id: "default", label: "Default", code: configToml },
    { id: "mobile", label: "Mobile", code: EXAMPLE_MOBILE },
    { id: "kiosk", label: "Kiosk-lite", code: EXAMPLE_KIOSK },
    { id: "tiny", label: "Tiny widget", code: EXAMPLE_TINY },
  ];

  return (
    <section id="config" className="border-b bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Configuration"
          title="One TOML file. Everything you might want to tweak."
          subtitle="Lives at ~/.config/9292-app/config.toml. Edit it, save, restart the app. Anything you leave out falls back to the defaults."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <ConfigReference />
          </div>
          <div className="lg:col-span-3">
            <ConfigExamples examples={examples} />
          </div>
        </div>
      </div>
    </section>
  );
}

function ConfigReference() {
  const fields = [
    {
      path: "window.startup_size",
      type: "string",
      desc: '"maximized" or "WxH" (e.g. "640x480")',
    },
    {
      path: "window.title",
      type: "string",
      desc: '"auto" (follows page) or any literal text',
    },
    {
      path: "titlebar.reload",
      type: "bool",
      desc: "Show the reload button (left side)",
    },
    {
      path: "titlebar.minimize",
      type: "bool",
      desc: "Show the minimize button",
    },
    {
      path: "titlebar.maximize",
      type: "bool",
      desc: "Show the maximize button",
    },
    {
      path: "titlebar.close",
      type: "bool",
      desc: "Show the close button",
    },
    {
      path: "web.url",
      type: "string",
      desc: "URL the app loads (default: https://9292.nl/)",
    },
    {
      path: "web.user_agent",
      type: "string",
      desc: 'Override UA. Empty = WebKitGTK default. Use to force mobile/desktop site.',
    },
  ];
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4" />
          Field reference
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {fields.map((f) => (
            <li key={f.path} className="text-sm">
              <div className="flex flex-wrap items-baseline gap-2">
                <code className="font-mono text-xs font-semibold text-foreground">
                  {f.path}
                </code>
                <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">
                  {f.type}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{f.desc}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ConfigExamples({
  examples,
}: {
  examples: { id: string; label: string; code: string }[];
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {examples.map((e, i) => (
          <a
            key={e.id}
            href={`#cfg-${e.id}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              i === 0
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {e.label}
          </a>
        ))}
      </div>
      <div className="space-y-8">
        {examples.map((e) => (
          <div key={e.id} id={`cfg-${e.id}`} className="scroll-mt-20">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              {e.label === "Default"
                ? "The default config (what the installer writes)"
                : `Example: ${e.label}`}
            </div>
            <CodeBlock
              code={e.code}
              filename="config.toml"
              downloadHref="/desktop-app/config.toml"
              language="toml"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Source browser
// ---------------------------------------------------------------------------

function SourceBrowser({
  files,
}: {
  files: { appPy: string; installSh: string; configToml: string; readme: string };
}) {
  const tabs = [
    {
      id: "app",
      label: "9292-app.py",
      icon: FileCode2,
      filename: "9292-app.py",
      lang: "python",
      code: files.appPy,
      href: "/desktop-app/9292-app.py",
      desc: "The whole app — ~200 lines of Python + GTK 4 + WebKit2.",
    },
    {
      id: "install",
      label: "install.sh",
      icon: Terminal,
      filename: "install.sh",
      lang: "bash",
      code: files.installSh,
      href: "/desktop-app/install.sh",
      desc: "Interactive installer. Asks questions, writes files, no sudo for the app.",
    },
    {
      id: "config",
      label: "config.toml",
      icon: Settings2,
      filename: "config.toml",
      lang: "toml",
      code: files.configToml,
      href: "/desktop-app/config.toml",
      desc: "Default config. Heavily commented — every option explained inline.",
    },
  ];

  return (
    <section id="source" className="border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Source"
          title="Read every line before you run it."
          subtitle="Three files. No build step. No obfuscation. Copy them onto your machine, audit them, then run install.sh."
        />
        <div className="mt-12 grid gap-3 lg:grid-cols-[260px_1fr]">
          {/* Tab nav (vertical on desktop, horizontal scroll on mobile) */}
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {tabs.map((t, i) => (
              <a
                key={t.id}
                href={`#src-${t.id}`}
                className={`flex min-w-[180px] items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                  i === 0
                    ? "border-foreground/20 bg-muted/40"
                    : "hover:bg-accent/60"
                }`}
              >
                <t.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <div className="truncate font-mono text-xs font-medium">
                    {t.label}
                  </div>
                  <div className="truncate text-[10px] text-muted-foreground">
                    {t.desc}
                  </div>
                </div>
              </a>
            ))}
          </nav>
          {/* Tab panels */}
          <div className="space-y-8">
            {tabs.map((t) => (
              <div key={t.id} id={`src-${t.id}`} className="scroll-mt-20">
                <CodeBlock
                  code={t.code}
                  filename={t.filename}
                  downloadHref={t.href}
                  language={t.lang}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Keyboard shortcuts
// ---------------------------------------------------------------------------

const SHORTCUTS: [string, string][] = [
  ["F5", "Reload"],
  ["Ctrl + R", "Reload"],
  ["Ctrl + Shift + R", "Hard reload (bypass cache)"],
  ["Shift + click reload", "Hard reload"],
  ["Ctrl + Q", "Quit"],
];

function KeyboardShortcuts() {
  return (
    <section className="border-b bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="Keyboard"
          title="Five shortcuts. That's the whole manual."
          subtitle=""
        />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHORTCUTS.map(([key, action]) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border bg-background p-4"
            >
              <span className="text-sm text-muted-foreground">{action}</span>
              <kbd className="inline-flex items-center gap-1 rounded-md border bg-muted px-2 py-1 font-mono text-xs font-medium shadow-[0_2px_0] shadow-border">
                {key.split(" ").map((part, i) => (
                  <span key={i} className="flex items-center gap-1">
                    {i > 0 && <span className="text-muted-foreground">+</span>}
                    {part}
                  </span>
                ))}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

const FAQ_ITEMS = [
  {
    q: "Why WebKitGTK instead of Chrome / Firefox?",
    a: "A clean native title bar with custom buttons requires hosting the webview inside our own GTK window. Once you hand a URL to Chrome or Firefox in --app mode, you no longer control the title bar — the browser owns the window. WebKitGTK is a system library (no separate browser install), it's the same engine GNOME Web (Epiphany) uses, and it integrates with your GNOME theme. 9292 doesn't require login, so lack of cookie-sharing with your daily browser is a non-issue.",
  },
  {
    q: "Is this affiliated with 9292?",
    a: "No. This is a thin launcher that shows the official 9292 website exactly as 9292 serves it. It does not modify the page, inject JavaScript, or call any private API. The 9292 name and logo belong to their respective owners; the icon shipped here is the same PNG 9292 itself publishes at https://9292.nl/icon-512.png, used solely to make the launcher recognisable.",
  },
  {
    q: "Will 9292 block or break this app?",
    a: "There is nothing to block. The app is a regular webview loading https://9292.nl/ — no different from a user opening the site in any browser. We don't scrape, we don't call hidden APIs, we don't bypass anything. If 9292 works in GNOME Web, it works here.",
  },
  {
    q: "Where is the config file?",
    a: "After install: ~/.config/9292-app/config.toml. Edit it with any text editor, save, restart the app. Anything you leave out falls back to the defaults. Delete the file to reset.",
  },
  {
    q: "How do I uninstall?",
    a: "Run ./install.sh --uninstall. It removes the app, the icon, the launcher, and the .desktop menu entry. Your config at ~/.config/9292-app/ is kept in case you reinstall — delete that folder manually for a full clean slate.",
  },
  {
    q: "Does it work on Wayland?",
    a: "Yes. GTK 4 and WebKit2 4.1 are fully Wayland-native. The window controls are drawn by GTK (not the WM), so they look identical on Wayland and X11.",
  },
  {
    q: "Can I run multiple instances?",
    a: "No, by design. The app is single-instance — clicking the .desktop icon while it's already running just focuses the existing window. This matches how GNOME app grids behave for native apps.",
  },
  {
    q: "Why no SVG icon?",
    a: "Some GNOME icon caches and older app menus render SVG poorly. A 512×512 PNG is universally supported and looks crisp at every size the launcher needs. We use the official 9292 PNG straight from their site.",
  },
];

function FAQ() {
  return (
    <section id="faq" className="border-b">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-20">
        <SectionHeading
          eyebrow="FAQ"
          title="Honest answers."
          subtitle=""
        />
        <Accordion type="single" collapsible className="mt-10">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Disclaimer
// ---------------------------------------------------------------------------

function Disclaimer() {
  return (
    <section className="border-b bg-muted/30">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="flex gap-3">
          <ShieldCheck className="h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong className="text-foreground">Not affiliated with 9292.</strong>{" "}
            9292 and the 9292 logo are trademarks of their respective owners. This
            project is an independent launcher that shows the official 9292
            website in a native GNOME window. The source code is released to the
            public domain (CC0).
          </p>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------

function SiteFooter() {
  return (
    <footer className="mt-auto border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="checker-2x2 h-6 w-6 rounded ring-1 ring-border" />
            <span className="font-mono text-sm font-medium">
              9292 <span className="text-muted-foreground">for Linux</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <a
              href="https://9292.nl"
              className="hover:text-foreground transition-colors"
            >
              9292.nl
            </a>
            <Separator orientation="vertical" className="h-3" />
            <a
              href="/desktop-app/README.md"
              className="hover:text-foreground transition-colors"
            >
              README
            </a>
            <Separator orientation="vertical" className="h-3" />
            <span className="font-mono">CC0 / public domain</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ---------------------------------------------------------------------------
// Shared section heading
// ---------------------------------------------------------------------------

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="mb-3 font-mono text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {subtitle && (
        <p className="mt-4 text-base text-muted-foreground sm:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
