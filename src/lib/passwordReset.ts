import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { DATA_DIR } from "./paths";

/**
 * One-time password-reset links. Only a SHA-256 hash of each token is stored
 * (data/password-resets.json), so a leaked file can't be used to reset anything.
 */
type ResetRecord = { userId: string; hash: string; expires: number };

const FILE = () => path.join(DATA_DIR, "password-resets.json");
export const RESET_TTL_MIN = 30;
const sha = (t: string) => crypto.createHash("sha256").update(t).digest("hex");

async function read(): Promise<ResetRecord[]> {
  try {
    const list = JSON.parse(await fs.readFile(FILE(), "utf8")) as ResetRecord[];
    return list.filter((r) => r.expires > Date.now());
  } catch {
    return [];
  }
}
async function write(list: ResetRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE(), JSON.stringify(list, null, 2));
}

/** Creates a new reset token for the user (older ones for that user stop working). */
export async function createResetToken(userId: string) {
  const token = crypto.randomBytes(32).toString("base64url");
  const list = (await read()).filter((r) => r.userId !== userId);
  list.push({ userId, hash: sha(token), expires: Date.now() + RESET_TTL_MIN * 60_000 });
  await write(list);
  return token;
}

/** Returns the user id if the token is valid, and burns it so it can't be reused. */
export async function consumeResetToken(token: string): Promise<string | null> {
  if (!token) return null;
  const list = await read();
  const hit = list.find((r) => r.hash === sha(token));
  if (!hit) return null;
  await write(list.filter((r) => r.userId !== hit.userId));
  return hit.userId;
}

/** Checks a token without using it up (for showing the reset form). */
export async function isResetTokenValid(token: string) {
  return !!token && (await read()).some((r) => r.hash === sha(token));
}
