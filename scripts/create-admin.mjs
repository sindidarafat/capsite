#!/usr/bin/env node
// Create an admin account, or reset the password of an existing one.
//   npm run admin -- you@cap.direct "a-long-password" "Your Name"
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const [email, password, name = "Admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error('Usage: npm run admin -- <email> "<password>" ["Name"]');
  process.exit(1);
}
if (password.length < 10) {
  console.error("Password must be at least 10 characters.");
  process.exit(1);
}

const dir = path.resolve(process.env.DATA_DIR || "data");
const file = path.join(dir, "users.json");
fs.mkdirSync(dir, { recursive: true });
const users = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : [];

const salt = crypto.randomBytes(16);
const key = crypto.scryptSync(password, salt, 64);
const passwordHash = `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
const normalized = email.trim().toLowerCase();

const existing = users.find((u) => u.email === normalized);
if (existing) {
  existing.passwordHash = passwordHash;
  existing.passwordChangedAt = new Date().toISOString(); // signs out every existing session
  existing.role = "admin";
  console.log(`Password reset — ${normalized} is an admin.`);
} else {
  users.push({ id: crypto.randomUUID(), email: normalized, name, role: "admin", passwordHash, createdAt: new Date().toISOString() });
  console.log(`Created admin ${normalized}.`);
}
fs.writeFileSync(file, JSON.stringify(users, null, 2) + "\n");
