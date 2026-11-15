import path from "node:path";

const root = process.cwd();

/** Editable site content (JSON). Safe to commit to git. */
export const CONTENT_DIR = path.resolve(process.env.CONTENT_DIR || path.join(root, "content"));
/** Private data: admin users and inquiries. Never served, never committed. */
export const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(root, "data"));
/** All images & videos. Served at /media/*. Drop files here or upload in the admin. */
export const MEDIA_DIR = path.resolve(process.env.MEDIA_DIR || path.join(root, "media"));

/** Resolve a path inside a base directory, refusing anything that escapes it. */
export function safeJoin(base: string, ...parts: string[]): string | null {
  const target = path.resolve(base, ...parts);
  const rel = path.relative(base, target);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return target;
}
