import "server-only";
import nodemailer from "nodemailer";

/**
 * Sends email through SMTP (e.g. Gmail with an App Password).
 * Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS and optionally MAIL_FROM.
 * Returns false when email isn't configured, so callers can fall back.
 */
export async function sendMail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return false;
  const port = Number(SMTP_PORT || 465);
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  await transport.sendMail({ from: MAIL_FROM || `CAP website <${SMTP_USER}>`, to, subject, text, html });
  return true;
}
