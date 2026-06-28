import type { NextConfig } from "next";

// GitHub Pages serves at https://<user>.github.io/<repo>/, so we need
// basePath = "/9292" for the Pages build. Locally (dev), no basePath.
const isPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = isPagesBuild ? "/9292" : "";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages when GITHUB_PAGES=true; otherwise
  // standalone (for the local dev server / preview).
  output: isPagesBuild ? "export" : "standalone",
  // Images: disable optimization for static export (Pages can't optimize).
  images: isPagesBuild ? { unoptimized: true } : undefined,
  // basePath so asset URLs resolve under /9292/ on GitHub Pages.
  basePath,
  // Trailing slash so /9292/ serves index.html cleanly on Pages.
  trailingSlash: isPagesBuild,
  // Expose basePath to client/server code via process.env.NEXT_BASE_PATH
  // so <Image src=...> and other manual URLs can prepend it.
  env: {
    NEXT_BASE_PATH: basePath,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
