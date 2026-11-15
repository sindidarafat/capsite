import type { NextConfig } from "next";
import path from "node:path";

// `npm run build:static` sets STATIC_EXPORT=1: plain HTML/JS for Cloudflare Pages (public site only).
// On Cloudflare Pages the security headers come from out/_headers instead of headers() below.
const STATIC = process.env.STATIC_EXPORT === "1";

async function headers() {
  return [
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
  ];
}

const nextConfig: NextConfig = {
  ...(STATIC ? { output: "export" as const, images: { unoptimized: true } } : { headers }),
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
  // dev only: let phones/tablets on the local Wi-Fi (and Cloudflare preview tunnels) load the dev server
  allowedDevOrigins: ["192.168.*.*", "*.trycloudflare.com"],
  experimental: {
    // Admin uploads pass through middleware (auth check), which caps request bodies at 10 MB by default.
    // Without this, larger videos get truncated and the upload fails with a 500.
    middlewareClientMaxBodySize: "1gb",
  },
};

export default nextConfig;
