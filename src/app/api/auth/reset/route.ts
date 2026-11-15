import { NextResponse } from "next/server";
import { MIN_PASSWORD, clearLoginFailures, setPassword } from "@/lib/auth";
import { consumeResetToken, isResetTokenValid } from "@/lib/passwordReset";

export const runtime = "nodejs";

/** Is this reset link still usable? (Used to show the form or an "expired" message.) */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  return NextResponse.json({ valid: await isResetTokenValid(token) });
}

/** Sets the new password from a reset link. The link is used up either way. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const token = String(body.token ?? "");
  const password = String(body.password ?? "");
  if (password.length < MIN_PASSWORD) {
    return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD} characters.` }, { status: 400 });
  }
  const userId = await consumeResetToken(token);
  if (!userId) {
    return NextResponse.json({ error: "This reset link has expired or was already used. Ask for a new one." }, { status: 400 });
  }
  await setPassword(userId, password); // also signs the account out everywhere
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  clearLoginFailures(ip);
  return NextResponse.json({ ok: true });
}
