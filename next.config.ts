import type { NextConfig } from "next";

// GitHub Pages serves at https://<user>.github.io/<repo>/, so we need
// basePath = "/9292" for the Pages build. Locally (dev), no basePath.
const isPagesBuild = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages when GITHUB_PAGES=true; otherwise
  // standalone (for the local dev server / preview).
  output: isPagesBuild ? "export" : "standalone",
  // Images: disable optimization for static export (Pages can't optimize).
  images: isPagesBuild ? { unoptimized: true } : undefined,
  // basePath so asset URLs resolve under /9292/ on GitHub Pages.
  basePath: isPagesBuild ? "/9292" : "",
  // Trailing slash so /9292/ serves index.html cleanly on Pages.
  trailingSlash: isPagesBuild,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
