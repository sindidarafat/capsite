import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { getCollection, saveCollection } from "@/lib/store";
import { SCHEMAS } from "@/lib/schemas";
import { COLLECTIONS, type CollectionName, type Collections } from "@/lib/types";

type Ctx = { params: Promise<{ name: string }> };

async function resolveName(ctx: Ctx) {
  const { name } = await ctx.params;
  return (COLLECTIONS as string[]).includes(name) ? (name as CollectionName) : null;
}

export async function GET(_req: Request, ctx: Ctx) {
  const { error } = await requireRole("editor");
  if (error) return error;
  const name = await resolveName(ctx);
  if (!name) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  return NextResponse.json({ data: await getCollection(name) });
}

export async function PUT(req: Request, ctx: Ctx) {
  const { error } = await requireRole("editor");
  if (error) return error;
  const name = await resolveName(ctx);
  if (!name) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = SCHEMAS[name].safeParse(body?.data);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const where = issue?.path?.length ? ` (at ${issue.path.join(" › ")})` : "";
    return NextResponse.json({ error: `${issue?.message ?? "Invalid data"}${where}` }, { status: 400 });
  }
  await saveCollection(name, parsed.data as Collections[typeof name]);
  revalidatePath("/", "layout"); // refresh every public page
  return NextResponse.json({ data: parsed.data });
}
