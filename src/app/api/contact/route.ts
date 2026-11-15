import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { inquirySchema } from "@/lib/schemas";
import { addInquiry } from "@/lib/store";

const recent = new Map<string, number[]>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 60 * 60_000);
  if (hits.length >= 5) return NextResponse.json({ error: "Too many messages — please email us directly." }, { status: 429 });

  const parsed = inquirySchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  }
  const { website: _honeypot, ...data } = parsed.data;
  if (_honeypot) return NextResponse.json({ ok: true }); // silently drop bots

  hits.push(now);
  recent.set(ip, hits);
  await addInquiry({ id: crypto.randomUUID(), createdAt: new Date().toISOString(), read: false, ...data });
  return NextResponse.json({ ok: true });
}
