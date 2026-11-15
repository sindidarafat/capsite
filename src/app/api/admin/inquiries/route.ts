import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { getInquiries, saveInquiries } from "@/lib/store";

export async function GET() {
  const { error } = await requireRole("editor");
  if (error) return error;
  return NextResponse.json({ inquiries: await getInquiries() });
}

export async function PATCH(req: Request) {
  const { error } = await requireRole("editor");
  if (error) return error;
  const { id, read } = await req.json().catch(() => ({}));
  const all = await getInquiries();
  const item = all.find((i) => i.id === id);
  if (item) item.read = Boolean(read);
  await saveInquiries(all);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { error } = await requireRole("editor");
  if (error) return error;
  const id = new URL(req.url).searchParams.get("id");
  await saveInquiries((await getInquiries()).filter((i) => i.id !== id));
  return NextResponse.json({ ok: true });
}
