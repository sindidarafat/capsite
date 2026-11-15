"use client";
import { useState } from "react";
import { api } from "@/components/admin/api";
import { useAdminUser } from "@/components/admin/AdminShell";
import { Button, Card, PageTitle, inputCls, useToast } from "@/components/admin/ui";

/** Your account: the sign-in email is fixed; only the password can be changed. */
export default function AccountPage() {
  const me = useAdminUser();
  const toast = useToast();
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [show, setShow] = useState(false);

  async function savePw(e: React.FormEvent) {
    e.preventDefault();
    if (pw.newPassword !== pw.confirm) return toast("The new passwords don't match.", "error");
    setBusy(true);
    try {
      await api("/api/admin/me", { method: "PATCH", json: { currentPassword: pw.currentPassword, newPassword: pw.newPassword } });
      toast("Password changed. Other devices have been signed out.");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  }

  const type = show ? "text" : "password";
  return (
    <>
      <PageTitle title="Change password" sub="Your sign-in email stays the same — only the password changes." />
      <Card className="max-w-md">
        <label className="block text-sm font-semibold">
          Sign-in email
          <input className={`${inputCls} mt-1.5 cursor-not-allowed bg-sand/60 text-stone`} value={me?.email ?? ""} readOnly disabled aria-readonly />
        </label>
        <p className="mt-1.5 text-xs text-stone">The sign-in email can&apos;t be changed.</p>

        <form onSubmit={savePw} className="mt-6 space-y-4 border-t border-ink/10 pt-6">
          <label className="block text-sm font-semibold">
            Current password
            <input className={`${inputCls} mt-1.5`} type={type} autoComplete="current-password" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
          </label>
          <label className="block text-sm font-semibold">
            New password
            <input className={`${inputCls} mt-1.5`} type={type} autoComplete="new-password" placeholder="At least 10 characters" minLength={10} required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
          </label>
          <label className="block text-sm font-semibold">
            Repeat new password
            <input className={`${inputCls} mt-1.5`} type={type} autoComplete="new-password" minLength={10} required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </label>
          <label className="flex items-center gap-2 text-sm text-stone">
            <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> Show passwords
          </label>
          <Button variant="primary" type="submit" disabled={busy}>{busy ? "Saving…" : "Change password"}</Button>
        </form>
      </Card>
    </>
  );
}
