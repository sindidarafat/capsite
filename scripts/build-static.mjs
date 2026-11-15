// Builds the PUBLIC website as plain static files in out/ — for free hosting on Cloudflare Pages.
//
//   npm run build:static
//
// The admin panel, the APIs and the middleware need a Node server, so they are left out of this
// build (they keep working locally with `npm run dev`). Their folders are moved aside for the
// duration of the build and always put back afterwards.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")), "..");
const r = (...p) => path.join(root, ...p);
const MAX_FILE = 25 * 1024 * 1024; // Cloudflare Pages limit per file

// server-only parts: [original, parked]
const PARK = [
  ["src/app/admin", "src/app/_admin"],
  ["src/app/api", "src/app/_api"],
  ["src/app/media", "src/app/_media"],
  ["src/middleware.ts", "src/_middleware.ts.off"],
];

function park() {
  for (const [from, to] of PARK) if (fs.existsSync(r(from))) fs.renameSync(r(from), r(to));
}
function unpark() {
  for (const [from, to] of PARK) if (fs.existsSync(r(to)) && !fs.existsSync(r(from))) fs.renameSync(r(to), r(from));
}

function copyMedia(src, dest) {
  let copied = 0;
  const skipped = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith(".")) continue;
      const abs = path.join(dir, e.name);
      const rel = path.relative(src, abs);
      if (e.isDirectory()) walk(abs);
      else if (rel === "README.md") continue;
      else if (fs.statSync(abs).size > MAX_FILE) skipped.push(rel);
      else {
        fs.mkdirSync(path.join(dest, path.dirname(rel)), { recursive: true });
        fs.copyFileSync(abs, path.join(dest, rel));
        copied++;
      }
    }
  };
  walk(src);
  return { copied, skipped };
}

unpark(); // recover from an interrupted earlier run
park();
let status = 1;
try {
  fs.rmSync(r("out"), { recursive: true, force: true });
  fs.rmSync(r(".next"), { recursive: true, force: true });
  const nextBin = r("node_modules", "next", "dist", "bin", "next");
  const res = spawnSync(process.execPath, [nextBin, "build"], {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      STATIC_EXPORT: "1",
      NEXT_PUBLIC_STATIC_SITE: "1",
      // the live address (not the localhost one from .env.local); override with SITE_URL if needed
      NEXT_PUBLIC_SITE_URL: process.env.SITE_URL || "https://www.cap.direct",
    },
  });
  status = res.status ?? 1;
} finally {
  unpark();
}
if (status !== 0) process.exit(status);

// media → out/media (served at the same /media/... URLs as in development)
const media = process.env.MEDIA_DIR || r("media");
const { copied, skipped } = copyMedia(media, r("out", "media"));
console.log(`\nCopied ${copied} media files.`);
if (skipped.length) console.warn(`Skipped (over 25 MB, too big for Cloudflare Pages):\n  ${skipped.join("\n  ")}`);

// Cloudflare Pages: old-site redirects and security headers
fs.writeFileSync(
  r("out", "_redirects"),
  ["/cases /work 301", "/cases/* /work/:splat 301", "/contacts /contact 301", ""].join("\n"),
);
fs.writeFileSync(
  r("out", "_headers"),
  [
    "/*",
    "  X-Frame-Options: SAMEORIGIN",
    "  X-Content-Type-Options: nosniff",
    "  Referrer-Policy: strict-origin-when-cross-origin",
    "/media/*",
    "  Cache-Control: public, max-age=86400, stale-while-revalidate=604800",
    "/_next/static/*",
    "  Cache-Control: public, max-age=31536000, immutable",
    "",
  ].join("\n"),
);
console.log("Static site ready in out/ — deploy that folder to Cloudflare Pages.");
