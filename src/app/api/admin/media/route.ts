import fs from "node:fs/promises";
import { createWriteStream } from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { MEDIA_DIR, safeJoin } from "@/lib/paths";
import { UPLOAD_EXT } from "@/lib/mime";

export const runtime = "nodejs";

type Entry = { path: string; url: string; name: string; folder: string; size: number; modified: string };

async function walk(dir: string, rel = ""): Promise<Entry[]> {
  const out: Entry[] = [];
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    if (d.name.startsWith(".") || d.name.startsWith("_")) continue;
    const relPath = rel ? `${rel}/${d.name}` : d.name;
    const abs = path.join(dir, d.name);
    if (d.isDirectory()) out.push(...(await walk(abs, relPath)));
    else if (UPLOAD_EXT.includes(path.extname(d.name).toLowerCase())) {
      const st = await fs.stat(abs);
      out.push({
        path: relPath,
        url: `/media/${relPath.split("/").map(encodeURIComponent).join("/")}`,
        name: d.name,
        folder: rel,
        size: st.size,
        modified: st.mtime.toISOString(),
      });
    }
  }
  return out;
}

async function folders(dir: string, rel = ""): Promise<string[]> {
  const out: string[] = [];
  for (const d of await fs.readdir(dir, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith(".") || d.name.startsWith("_")) continue;
    const r = rel ? `${rel}/${d.name}` : d.name;
    out.push(r, ...(await folders(path.join(dir, d.name), r)));
  }
  return out;
}

/** List every file in /media (including ones dropped in by hand). */
export async function GET() {
  const { error } = await requireRole("editor");
  if (error) return error;
  await fs.mkdir(MEDIA_DIR, { recursive: true });
  const files = (await walk(MEDIA_DIR)).sort((a, b) => b.modified.localeCompare(a.modified));
  return NextResponse.json({ files, folders: (await folders(MEDIA_DIR)).sort() });
}

function cleanName(name: string) {
  const ext = path.extname(name).toLowerCase();
  const base = path
    .basename(name, path.extname(name))
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "file";
  return { base, ext };
}

function cleanFolder(folder: string) {
  return folder
    .split("/")
    .map((s) => s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, ""))
    .filter(Boolean)
    .join("/") || "uploads";
}

/** Upload one or more files: multipart form with `file` fields and an optional `folder`. */
export async function POST(req: Request) {
  const { error } = await requireRole("editor");
  if (error) return error;
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Upload could not be read — the file may be too large. Copy it into the media/ folder directly instead." },
      { status: 413 },
    );
  }
  const folder = cleanFolder(String(form.get("folder") ?? "uploads"));
  const dir = safeJoin(MEDIA_DIR, ...folder.split("/"));
  if (!dir) return NextResponse.json({ error: "Bad folder" }, { status: 400 });
  await fs.mkdir(dir, { recursive: true });

  const saved: Entry[] = [];
  for (const value of form.getAll("file")) {
    if (typeof value === "string") continue;
    const { base, ext } = cleanName(value.name);
    if (!UPLOAD_EXT.includes(ext)) {
      return NextResponse.json({ error: `File type ${ext || "(none)"} is not allowed.` }, { status: 400 });
    }
    let name = `${base}${ext}`;
    for (let i = 2; await fs.stat(path.join(dir, name)).then(() => true, () => false); i++) name = `${base}-${i}${ext}`;
    const abs = path.join(dir, name);
    await pipeline(Readable.fromWeb(value.stream() as never), createWriteStream(abs));
    const rel = `${folder}/${name}`;
    saved.push({ path: rel, url: `/media/${rel}`, name, folder, size: value.size, modified: new Date().toISOString() });
  }
  return NextResponse.json({ files: saved });
}

/** Delete a file (path relative to /media). */
export async function DELETE(req: Request) {
  const { error } = await requireRole("editor");
  if (error) return error;
  const rel = new URL(req.url).searchParams.get("path") ?? "";
  const abs = rel ? safeJoin(MEDIA_DIR, ...rel.split("/")) : null;
  if (!abs || abs === MEDIA_DIR) return NextResponse.json({ error: "Bad path" }, { status: 400 });
  await fs.unlink(abs).catch(() => {});
  return NextResponse.json({ ok: true });
}
