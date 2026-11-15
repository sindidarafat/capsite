"use client";
import { useState } from "react";
import Logo from "@/components/site/Logo";
import { inputCls } from "@/components/admin/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Something went wrong. Try again.");
    setMsg(data.message);
  }

  return (
    <main className="grid min-h-screen place-items-center bg-bone p-6 text-ink">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-8 shadow-sm">
        <Logo className="h-8" />
        <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">Forgot password</h1>
        {msg ? (
          <p className="mt-4 rounded-xl bg-[#e3efe7] px-3 py-3 text-sm font-semibold text-[#21603f]" role="status">{msg}</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-stone">Enter your admin email. We&apos;ll send you a link to set a new password.</p>
            <label className="mt-8 block text-sm font-semibold">
              Email
              <input className={`${inputCls} mt-1.5`} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            {error && <p className="mt-4 text-sm font-semibold text-[#a4442a]" role="alert">{error}</p>}
            <button disabled={busy} className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-bone transition hover:bg-graphite disabled:opacity-50">
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </>
        )}
        <a href="/admin/login" className="mt-6 block text-center text-sm font-semibold text-stone hover:text-ink">← Back to sign in</a>
      </form>
    </main>
  );
}
