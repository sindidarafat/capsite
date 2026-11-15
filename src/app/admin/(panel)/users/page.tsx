"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { useAdminUser } from "@/components/admin/AdminShell";
import { Button, Card, PageTitle, inputCls, useToast } from "@/components/admin/ui";
import type { User } from "@/lib/types";

type PublicUser = Omit<User, "passwordHash">;

export default function UsersAdmin() {
  const me = useAdminUser();
  const toast = useToast();
  const [users, setUsers] = useState<PublicUser[] | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });

  const load = useCallback(async () => setUsers((await api<{ users: PublicUser[] }>("/api/admin/users")).users), []);
  useEffect(() => {
    if (me?.role === "admin") load().catch((e) => toast(e.message, "error"));
  }, [load, toast, me]);

  if (me?.role !== "admin") return <Card><p>Only admins can manage users.</p></Card>;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/api/admin/users", { method: "POST", json: form });
      toast(`Account created for ${form.email}`);
      setForm({ name: "", email: "", password: "", role: "editor" });
      load();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }
  async function patch(id: string, body: object, msg: string) {
    try {
      await api("/api/admin/users", { method: "PATCH", json: { id, ...body } });
      toast(msg);
      load();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }
  async function remove(u: PublicUser) {
    if (!confirm(`Remove ${u.email}? They will be signed out immediately.`)) return;
    try {
      await api(`/api/admin/users?id=${u.id}`, { method: "DELETE" });
      load();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  }
  const genPassword = () => setForm((f) => ({ ...f, password: Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => "abcdefghjkmnpqrstuvwxyzACDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 56]).join("") }));

  return (
    <>
      <PageTitle title="Users & roles" sub="Admins can do everything, including managing users. Editors can edit all website content, media and inquiries, but can't manage users." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card className="!p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-left text-xs uppercase tracking-[0.06em] text-stone">
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users?.map((u) => (
                <tr key={u.id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4">
                    <p className="font-semibold">{u.name} {u.id === me.sub && <span className="text-xs text-stone">(you)</span>}</p>
                    <p className="text-stone">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <select
                      className={`${inputCls} !w-auto !py-1.5`}
                      value={u.role}
                      disabled={u.id === me.sub}
                      onChange={(e) => patch(u.id, { role: e.target.value }, "Role updated")}
                      aria-label={`Role for ${u.email}`}
                    >
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        className="!py-1.5"
                        onClick={() => {
                          const pw = prompt(`New password for ${u.email} (10+ characters):`);
                          if (pw) patch(u.id, { password: pw }, "Password reset");
                        }}
                      >
                        Reset password
                      </Button>
                      {u.id !== me.sub && <Button variant="danger" className="!py-1.5" onClick={() => remove(u)}>Remove</Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card className="h-fit">
          <h2 className="mb-4 text-lg font-semibold tracking-tight">Add a person</h2>
          <form onSubmit={create} className="space-y-3">
            <input className={inputCls} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className={inputCls} placeholder="Email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Password (10+ characters)" required minLength={10} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <Button variant="soft" onClick={genPassword}>Generate</Button>
            </div>
            <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} aria-label="Role">
              <option value="editor">Editor — can edit content</option>
              <option value="admin">Admin — full access</option>
            </select>
            <Button variant="primary" type="submit" className="w-full">Create account</Button>
            <p className="text-xs text-stone">Share the email and password with them privately. They can change the password under “My account”.</p>
          </form>
        </Card>
      </div>
    </>
  );
}
