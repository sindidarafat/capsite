import { NextResponse } from "next/server";
import { authenticate, clearLoginFailures, loginRateLimited, publicUser, recordLoginFailure } from "@/lib/auth";
import { SESSION_COOKIE, sessionCookieOptions, signSession } from "@/lib/session";

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (loginRateLimited(ip)) {
    return NextResponse.json({ error: "Too many attempts. Try again in 15 minutes." }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "");
  const password = String(body.password ?? "");
  const user = email && password ? await authenticate(email, password) : null;
  if (!user) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }
  clearLoginFailures(ip);
  const token = await signSession({ sub: user.id, email: user.email, name: user.name, role: user.role });
  const res = NextResponse.json({ user: publicUser(user) });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
