"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useState } from "react";
import Logo from "@/components/site/Logo";
import type { Session } from "@/lib/session";
import { ToastProvider } from "./ui";

const UserCtx = createContext<Session | null>(null);
export const useAdminUser = () => useContext(UserCtx);

const NAV: { href: string; label: string; icon: string; adminOnly?: boolean }[] = [
  { href: "/admin", label: "Dashboard", icon: "◎" },
  { href: "/admin/works", label: "Works", icon: "▦" },
  { href: "/admin/team", label: "Team", icon: "☺" },
  { href: "/admin/careers", label: "Careers", icon: "✎" },
  { href: "/admin/services", label: "Services", icon: "≡" },
  { href: "/admin/site", label: "Site settings", icon: "⚙" },
  { href: "/admin/media", label: "Media library", icon: "▣" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "✉" },
  { href: "/admin/users", label: "Users & roles", icon: "☷", adminOnly: true },
  { href: "/admin/account", label: "Change password", icon: "⚿" },
];

export default function AdminShell({ user, children }: { user: Session; children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === href : pathname.startsWith(href));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <UserCtx.Provider value={user}>
      <ToastProvider>
        <div className="min-h-screen bg-bone text-ink lg:grid lg:grid-cols-[250px_1fr]">
          <aside className={`fixed inset-y-0 left-0 z-40 w-[250px] border-r border-ink/10 bg-paper p-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="mb-8 flex items-center justify-between px-2 pt-2">
              <Link href="/admin" className="flex items-center gap-3">
                <Logo className="h-7" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-stone">Admin</span>
              </Link>
            </div>
            <nav className="space-y-0.5" aria-label="Admin">
              {NAV.filter((n) => !n.adminOnly || user.role === "admin").map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  aria-current={active(n.href) ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active(n.href) ? "bg-ink text-bone" : "text-graphite hover:bg-sand"}`}
                >
                  <span className="w-4 text-center opacity-70" aria-hidden>{n.icon}</span>
                  {n.label}
                </Link>
              ))}
            </nav>
            <div className="absolute inset-x-4 bottom-4 space-y-2">
              <a href={process.env.NEXT_PUBLIC_SITE_URL || "/"} target="_blank" rel="noreferrer" className="block rounded-xl bg-sand px-3 py-2.5 text-center text-sm font-semibold hover:bg-clay">
                View website ↗
              </a>
              <div className="rounded-xl border border-ink/10 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold" title={user.email}>{user.email}</p>
                    <p className="text-xs capitalize text-stone">{user.role}</p>
                  </div>
                  <button type="button" onClick={logout} className="shrink-0 text-xs font-semibold text-stone hover:text-ink">Sign out</button>
                </div>
                <Link href="/admin/account" className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-ink px-3 py-2 text-xs font-semibold text-bone hover:bg-graphite">
                  <span aria-hidden>⚿</span> Change password
                </Link>
              </div>
            </div>
          </aside>
          {open && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setOpen(false)} />}

          <div className="min-w-0">
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-bone/90 px-4 py-3 backdrop-blur lg:hidden">
              <button type="button" onClick={() => setOpen(true)} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bone">☰ Menu</button>
              <Logo className="h-6" />
            </div>
            <main className="mx-auto max-w-[1400px] p-4 md:p-8 lg:p-10">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </UserCtx.Provider>
  );
}
