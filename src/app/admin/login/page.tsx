"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/site/Logo";
import { inputCls } from "@/components/admin/ui";

function LoginForm() {
  const params = useSearchParams();
  const notice = params.get("reset") === "1" ? "Password updated. Sign in with your new password." : "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error || "Sign-in failed.");
    const next = params.get("next");
    window.location.href = next && next.startsWith("/admin") ? next : "/admin";
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-ink/10 bg-paper p-8 shadow-sm">
      <Logo className="h-8" />
      <h1 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">Studio admin</h1>
      <p className="mt-1 text-sm text-stone">Sign in to edit the CAP website.</p>
      <label className="mt-8 block text-sm font-semibold">
        Email
        <input className={`${inputCls} mt-1.5`} type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="mt-4 block text-sm font-semibold">
        <span className="flex items-center justify-between">
          Password
          <a href="/admin/forgot" className="text-xs font-semibold text-stone underline-offset-4 hover:text-ink hover:underline">
            Forgot password?
          </a>
        </span>
        <input className={`${inputCls} mt-1.5`} type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </label>
      {notice && !error && <p className="mt-4 rounded-xl bg-[#e3efe7] px-3 py-2 text-sm font-semibold text-[#21603f]" role="status">{notice}</p>}
      {error && <p className="mt-4 text-sm font-semibold text-[#a4442a]" role="alert">{error}</p>}
      <button disabled={busy} className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-bone transition hover:bg-graphite disabled:opacity-50">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-bone p-6 text-ink">
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
