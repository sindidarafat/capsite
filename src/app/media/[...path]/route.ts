import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { MEDIA_DIR, safeJoin } from "@/lib/paths";
import { mimeFor } from "@/lib/mime";

export const runtime = "nodejs";

/**
 * Serves everything in /media — including files dropped in after the site
 * was built. Supports HTTP range requests so videos can stream and seek.
 */
export async function GET(req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path.map((p) => decodeURIComponent(p));
  if (parts.some((p) => p.startsWith("."))) return new Response("Not found", { status: 404 });
  const file = safeJoin(MEDIA_DIR, ...parts);
  if (!file) return new Response("Not found", { status: 404 });

  let stat: fs.Stats;
  try {
    stat = await fsp.stat(file);
    if (!stat.isFile()) throw new Error();
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const type = mimeFor(path.extname(file));
  const etag = `W/"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
  const baseHeaders: Record<string, string> = {
    "Content-Type": type,
    "Accept-Ranges": "bytes",
    ETag: etag,
    "Last-Modified": stat.mtime.toUTCString(),
    "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    "X-Content-Type-Options": "nosniff",
  };
  // SVGs can carry scripts — render them inert.
  if (type === "image/svg+xml") baseHeaders["Content-Security-Policy"] = "default-src 'none'; style-src 'unsafe-inline'; sandbox";

  if (req.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers: baseHeaders });

  const range = req.headers.get("range");
  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    if (m) {
      let start = m[1] ? parseInt(m[1], 10) : NaN;
      let end = m[2] ? parseInt(m[2], 10) : NaN;
      if (isNaN(start)) {
        start = stat.size - end; // suffix range: last N bytes
        end = stat.size - 1;
      } else if (isNaN(end) || end >= stat.size) {
        end = stat.size - 1;
      }
      if (start < 0 || start > end || start >= stat.size) {
        return new Response(null, { status: 416, headers: { "Content-Range": `bytes */${stat.size}` } });
      }
      const stream = fs.createReadStream(file, { start, end });
      return new Response(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          ...baseHeaders,
          "Content-Range": `bytes ${start}-${end}/${stat.size}`,
          "Content-Length": String(end - start + 1),
        },
      });
    }
  }

  const stream = fs.createReadStream(file);
  return new Response(Readable.toWeb(stream) as ReadableStream, {
    headers: { ...baseHeaders, "Content-Length": String(stat.size) },
  });
}
