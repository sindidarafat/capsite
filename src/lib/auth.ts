import "server-only";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getUsers, saveUsers } from "./store";
import { SESSION_COOKIE, verifySession, type Session } from "./session";
import type { Role, User } from "./types";

const scrypt = promisify(crypto.scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export async function hashPassword(password: string) {
  const salt = crypto.randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [algo, saltHex, keyHex] = stored.split("$");
  if (algo !== "scrypt" || !saltHex || !keyHex) return false;
  const key = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(keyHex, "hex");
  return expected.length === key.length && crypto.timingSafeEqual(expected, key);
}

export const MIN_PASSWORD = 10;

/** Sets a new password and signs the account out of every existing session. */
export async function setPassword(userId: string, password: string) {
  const users = await getUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("Account not found");
  user.passwordHash = await hashPassword(password);
  user.passwordChangedAt = new Date().toISOString();
  await saveUsers(users);
  return user;
}

export const publicUser = (user: User): Omit<User, "passwordHash"> => {
  const { passwordHash, ...u } = user;
  void passwordHash;
  return u;
};

export async function createUser(input: { email: string; name: string; password: string; role: Role }) {
  const users = await getUsers();
  const email = input.email.trim().toLowerCase();
  if (users.some((u) => u.email === email)) throw new Error("A user with that email already exists.");
  const user: User = {
    id: crypto.randomUUID(),
    email,
    name: input.name.trim() || email,
    role: input.role,
    passwordHash: await hashPassword(input.password),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  await saveUsers(users);
  return user;
}

/**
 * Login. If no users exist yet, the first successful login with
 * ADMIN_EMAIL / ADMIN_PASSWORD from the environment creates the owner account.
 */
export async function authenticate(email: string, password: string): Promise<User | null> {
  const users = await getUsers();
  const normalized = email.trim().toLowerCase();

  if (users.length === 0) {
    const envEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envPass = process.env.ADMIN_PASSWORD;
    if (envEmail && envPass && normalized === envEmail && password === envPass) {
      return createUser({ email: envEmail, name: "Owner", password: envPass, role: "admin" });
    }
    return null;
  }

  const user = users.find((u) => u.email === normalized);
  if (!user) {
    await hashPassword(password); // even out timing
    return null;
  }
  return (await verifyPassword(password, user.passwordHash)) ? user : null;
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const session = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  // make sure the account still exists (deleted users lose access immediately)
  const users = await getUsers();
  const user = users.find((u) => u.id === session.sub);
  if (!user) return null;
  // a password change signs out every session that was issued before it
  if (user.passwordChangedAt && (session.iat ?? 0) < Math.floor(Date.parse(user.passwordChangedAt) / 1000)) return null;
  return { sub: user.id, email: user.email, name: user.name, role: user.role };
}

/** Guard for admin API routes. Returns either the session or an error response. */
export async function requireRole(role: Role = "editor") {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Not signed in" }, { status: 401 }) };
  if (role === "admin" && session.role !== "admin") {
    return { error: NextResponse.json({ error: "Admins only" }, { status: 403 }) };
  }
  return { session };
}

// ---- tiny in-memory login rate limiter ----------------------------------
const attempts = new Map<string, { n: number; until: number }>();
export function loginRateLimited(key: string) {
  const now = Date.now();
  const a = attempts.get(key);
  if (a && a.until > now && a.n >= 8) return true;
  return false;
}
export function recordLoginFailure(key: string) {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a || a.until < now) attempts.set(key, { n: 1, until: now + 15 * 60_000 });
  else a.n++;
}
export const clearLoginFailures = (key: string) => attempts.delete(key);
