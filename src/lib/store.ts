import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { CONTENT_DIR, DATA_DIR, MEDIA_DIR } from "./paths";
import { VIDEO_EXT } from "./mime";
import type { CollectionName, Collections, Inquiry, User } from "./types";

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw err;
  }
}

/** Write via a temp file + rename so a crash never leaves half-written JSON. */
async function writeJson(file: string, data: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  await fs.rename(tmp, file);
}

const contentFile = (name: CollectionName) => path.join(CONTENT_DIR, `${name}.json`);

export async function getCollection<K extends CollectionName>(name: K): Promise<Collections[K]> {
  const fallback = (name === "site" ? {} : []) as Collections[K];
  return readJson(contentFile(name), fallback);
}

export async function saveCollection<K extends CollectionName>(name: K, data: Collections[K]) {
  // keep a rolling backup of the previous version
  try {
    await fs.mkdir(path.join(DATA_DIR, "backups"), { recursive: true });
    await fs.copyFile(
      contentFile(name),
      path.join(DATA_DIR, "backups", `${name}-${new Date().toISOString().replace(/[:.]/g, "-")}.json`),
    );
    await pruneBackups(name);
  } catch {
    /* first save — nothing to back up */
  }
  await writeJson(contentFile(name), data);
}

async function pruneBackups(name: string, keep = 30) {
  const dir = path.join(DATA_DIR, "backups");
  const files = (await fs.readdir(dir)).filter((f) => f.startsWith(`${name}-`)).sort();
  await Promise.all(files.slice(0, Math.max(0, files.length - keep)).map((f) => fs.unlink(path.join(dir, f))));
}

// ---- convenience readers for public pages -------------------------------
const byOrder = <T extends { order: number }>(a: T, b: T) => a.order - b.order;

export const getSite = () => getCollection("site");
export const getServices = () => getCollection("services");

/**
 * If a work has no video set in the admin, use the first video found in its
 * drop folder (media/works/<slug>/). Files named like "hover" or "preview"
 * win. So dropping a clip into the folder is enough to make the card play it.
 */
async function folderVideo(slug: string): Promise<string> {
  const dir = path.join(MEDIA_DIR, "works", slug);
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return "";
  }
  const vids = files.filter((f) => VIDEO_EXT.includes(path.extname(f).toLowerCase()) && !f.startsWith("."));
  if (!vids.length) return "";
  vids.sort((a, b) => Number(/hover|preview/i.test(b)) - Number(/hover|preview/i.test(a)) || a.localeCompare(b));
  return `/media/works/${encodeURIComponent(slug)}/${encodeURIComponent(vids[0])}`;
}

export async function getWorks({ includeDrafts = false } = {}) {
  const works = (await getCollection("works")).filter((w) => includeDrafts || w.published).sort(byOrder);
  return Promise.all(works.map(async (w) => (w.video ? w : { ...w, video: await folderVideo(w.slug) })));
}
export async function getWork(slug: string) {
  return (await getWorks()).find((w) => w.slug === slug) ?? null;
}
export async function getTeam() {
  return (await getCollection("team")).filter((t) => t.published).sort(byOrder);
}
export async function getJobs() {
  return (await getCollection("jobs")).filter((j) => j.status !== "draft").sort(byOrder);
}
export async function getJob(slug: string) {
  return (await getJobs()).find((j) => j.slug === slug) ?? null;
}

// ---- private data --------------------------------------------------------
const usersFile = () => path.join(DATA_DIR, "users.json");
const inquiriesFile = () => path.join(DATA_DIR, "inquiries.json");

export const getUsers = () => readJson<User[]>(usersFile(), []);
export const saveUsers = (users: User[]) => writeJson(usersFile(), users);

export const getInquiries = () => readJson<Inquiry[]>(inquiriesFile(), []);
export const saveInquiries = (items: Inquiry[]) => writeJson(inquiriesFile(), items);

let inquiryLock: Promise<void> = Promise.resolve();
export function addInquiry(item: Inquiry) {
  inquiryLock = inquiryLock.then(async () => {
    const all = await getInquiries();
    all.unshift(item);
    await saveInquiries(all.slice(0, 5000));
  });
  return inquiryLock;
}
