import { NextResponse } from "next/server";
import { MIN_PASSWORD, requireRole, setPassword, verifyPassword } from "@/lib/auth";
import { getUsers } from "@/lib/store";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export async function GET() {
  const { session, error } = await requireRole("editor");
  if (error) return error;
  return NextResponse.json({ user: session });
}

/**
 * Change your own password. The sign-in email is fixed and can't be changed here.
 * Every other device is signed out; this browser gets a fresh session.
 */
export async function PATCH(req: Request) {
  const { session, error } = await requireRole("editor");
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const currentPassword = String(body.currentPassword ?? "");
  const newPassword = String(body.newPassword ?? "");

  const user = (await getUsers()).find((u) => u.id === session.sub);
  if (!user) return NextResponse.json({ error: "Account not found" }, { status: 404 });
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is wrong." }, { status: 400 });
  }
  if (newPassword.length < MIN_PASSWORD) {
    return NextResponse.json({ error: `New password must be at least ${MIN_PASSWORD} characters.` }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: "Choose a password you haven't just used." }, { status: 400 });
  }

  const updated = await setPassword(user.id, newPassword);
  // wait a beat so the new session's issue time is after the change time
  await new Promise((r) => setTimeout(r, 1100));
  const token = await signSession({ sub: updated.id, email: updated.email, name: updated.name, role: updated.role });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
