import { NextResponse } from "next/server";
import { loginRateLimited, recordLoginFailure } from "@/lib/auth";
import { getUsers } from "@/lib/store";
import { createResetToken, RESET_TTL_MIN } from "@/lib/passwordReset";
import { sendMail } from "@/lib/mail";

export const runtime = "nodejs";

/** Where reset links point: ADMIN_URL if set, otherwise the (admin-only) host this request came in on. */
function adminOrigin(req: Request) {
  if (process.env.ADMIN_URL) return process.env.ADMIN_URL.replace(/\/+$/, "");
  const host = req.headers.get("host") || "localhost:3000";
  const proto = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") || /^\d/.test(host) ? "http" : "https");
  return `${proto}://${host}`;
}

/**
 * "Forgot password": emails a one-time reset link. Always answers the same way,
 * so it can't be used to find out which emails have accounts.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const key = `forgot:${ip}`;
  if (loginRateLimited(key)) {
    return NextResponse.json({ error: "Too many requests. Try again in 15 minutes." }, { status: 429 });
  }
  recordLoginFailure(key); // counts every request: max 8 per 15 minutes

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const user = (await getUsers()).find((u) => u.email === email);

  if (user) {
    const token = await createResetToken(user.id);
    const link = `${adminOrigin(req)}/admin/reset?token=${token}`;
    const text = `Hi ${user.name},\n\nSomeone (hopefully you) asked to reset the password for the CAP website admin.\n\nSet a new password here (the link works once and expires in ${RESET_TTL_MIN} minutes):\n${link}\n\nIf you didn't ask for this, ignore this email — your password stays the same.\n`;
    const html = `<p>Hi ${user.name},</p><p>Someone (hopefully you) asked to reset the password for the CAP website admin.</p><p><a href="${link}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:#1b1a17;color:#f2eee7;text-decoration:none;font-weight:600">Set a new password</a></p><p style="color:#77716a">The link works once and expires in ${RESET_TTL_MIN} minutes. If you didn't ask for this, ignore this email — your password stays the same.</p>`;
    let sent = false;
    try {
      sent = await sendMail(user.email, "Reset your CAP admin password", text, html);
    } catch (e) {
      console.error("[forgot-password] email failed:", (e as Error).message);
    }
    if (!sent && process.env.NODE_ENV !== "production") {
      console.warn(`\n[forgot-password] Email isn't set up (SMTP_*), so here is the reset link for ${user.email}:\n${link}\n`);
    }
  }

  return NextResponse.json({
    ok: true,
    message: "If that email has an admin account, a reset link is on its way. Check your inbox (and spam).",
  });
}
