import { NextResponse } from "next/server";
import { MIN_PASSWORD, createUser, publicUser, requireRole, setPassword } from "@/lib/auth";
import { getUsers, saveUsers } from "@/lib/store";

export async function GET() {
  const { error } = await requireRole("admin");
  if (error) return error;
  return NextResponse.json({ users: (await getUsers()).map(publicUser) });
}

export async function POST(req: Request) {
  const { error } = await requireRole("admin");
  if (error) return error;
  const b = await req.json().catch(() => ({}));
  const email = String(b.email ?? "").trim();
  const password = String(b.password ?? "");
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  if (password.length < MIN_PASSWORD) return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD} characters.` }, { status: 400 });
  try {
    const user = await createUser({ email, password, name: String(b.name ?? ""), role: b.role === "admin" ? "admin" : "editor" });
    return NextResponse.json({ user: publicUser(user) });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}

/** Change a user's role or reset their password. */
export async function PATCH(req: Request) {
  const { session, error } = await requireRole("admin");
  if (error) return error;
  const b = await req.json().catch(() => ({}));
  const users = await getUsers();
  const user = users.find((u) => u.id === b.id);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (b.role === "admin" || b.role === "editor") {
    if (user.id === session.sub && b.role !== "admin") {
      return NextResponse.json({ error: "You can't remove your own admin role." }, { status: 400 });
    }
    user.role = b.role;
  }
  await saveUsers(users);
  // sign-in emails are fixed; admins can only set a new password (this signs that user out everywhere)
  if (b.password) {
    if (String(b.password).length < MIN_PASSWORD) return NextResponse.json({ error: `Password must be at least ${MIN_PASSWORD} characters.` }, { status: 400 });
    return NextResponse.json({ user: publicUser(await setPassword(user.id, String(b.password))) });
  }
  return NextResponse.json({ user: publicUser(user) });
}

export async function DELETE(req: Request) {
  const { session, error } = await requireRole("admin");
  if (error) return error;
  const id = new URL(req.url).searchParams.get("id");
  if (id === session.sub) return NextResponse.json({ error: "You can't delete your own account." }, { status: 400 });
  const users = await getUsers();
  await saveUsers(users.filter((u) => u.id !== id));
  return NextResponse.json({ ok: true });
}
