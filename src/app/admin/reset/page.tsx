"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/site/Logo";
import { inputCls } from "@/components/admin/ui";

function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [valid, setValid] = useState<boolean | null>(null);
  const [pw, setPw] = useState({ password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch(`/api/auth/reset?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((d) => setValid(!!d.valid))
      .catch(() => setValid(false));
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.password !== pw.confirm) return setError("The passwords don't match.");
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password: pw.password }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Couldn't reset the password.");
    window.location.href = "/admin/login?reset=1";
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-8 shadow-sm">
      <Logo className="h-8" />
      <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">Set a new password</h1>
      {valid === null && <p className="mt-4 text-sm text-stone">Checking your link…</p>}
      {valid === false && (
        <>
          <p className="mt-4 rounded-xl bg-[#f6e3dc] px-3 py-3 text-sm font-semibold text-[#a4442a]" role="alert">
            This reset link has expired or was already used.
          </p>
          <a href="/admin/forgot" className="mt-6 block w-full rounded-full bg-ink py-3 text-center text-sm font-semibold text-bone hover:bg-graphite">
            Send a new link
          </a>
        </>
      )}
      {valid && (
        <>
          <p className="mt-1 text-sm text-stone">At least 10 characters. You&apos;ll be signed out on every other device.</p>
          <label className="mt-8 block text-sm font-semibold">
            New password
            <input className={`${inputCls} mt-1.5`} type="password" autoComplete="new-password" minLength={10} required value={pw.password} onChange={(e) => setPw({ ...pw, password: e.target.value })} />
          </label>
          <label className="mt-4 block text-sm font-semibold">
            Repeat new password
            <input className={`${inputCls} mt-1.5`} type="password" autoComplete="new-password" minLength={10} required value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
          </label>
          {error && <p className="mt-4 text-sm font-semibold text-[#a4442a]" role="alert">{error}</p>}
          <button disabled={busy} className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-bone transition hover:bg-graphite disabled:opacity-50">
            {busy ? "Saving…" : "Save new password"}
          </button>
        </>
      )}
      <a href="/admin/login" className="mt-6 block text-center text-sm font-semibold text-stone hover:text-ink">← Back to sign in</a>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-bone p-6 text-ink">
      <Suspense>
        <ResetForm />
      </Suspense>
    </main>
  );
}
