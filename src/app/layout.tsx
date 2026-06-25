import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "9292 for Linux GNOME — Desktop Web App",
  description:
    "A clean, native GNOME desktop app for 9292.nl. No Electron, no browser window. Just the website in a configurable GTK window with a custom title bar.",
  keywords: [
    "9292",
    "Linux",
    "GNOME",
    "Ubuntu",
    "desktop app",
    "WebKitGTK",
    "travel planner",
    "Dutch public transport",
  ],
  authors: [{ name: "9292 Desktop App" }],
  openGraph: {
    title: "9292 for Linux GNOME",
    description:
      "A clean, native GNOME desktop app for 9292.nl — no Electron, no browser window.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "9292 for Linux GNOME",
    description: "A clean, native GNOME desktop app for 9292.nl",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
