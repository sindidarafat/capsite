"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

export const inputCls =
  "w-full rounded-xl border border-ink/12 bg-paper px-3.5 py-2.5 text-[0.95rem] text-ink outline-none transition placeholder:text-mist focus:border-ink/50 focus:bg-white";

export function Button({
  variant = "ghost",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "soft" }) {
  const v = {
    primary: "bg-ink text-bone hover:bg-graphite",
    ghost: "border border-ink/15 hover:bg-ink hover:text-bone",
    soft: "bg-sand hover:bg-clay",
    danger: "border border-[#a4442a]/30 text-[#a4442a] hover:bg-[#a4442a] hover:text-white",
  }[variant];
  return (
    <button
      type="button"
      {...props}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-40 ${v} ${className}`}
    />
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-ink/10 bg-paper/70 p-5 md:p-6 ${className}`}>{children}</div>;
}

export function PageTitle({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">{title}</h1>
        {sub && <p className="mt-1.5 max-w-2xl text-sm text-stone">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ---- toasts --------------------------------------------------------------
type Toast = { id: number; text: string; kind: "ok" | "error" };
const ToastCtx = createContext<(text: string, kind?: Toast["kind"]) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, kind: Toast["kind"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === "error" ? 7000 : 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex flex-col gap-2" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto max-w-sm rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              t.kind === "error" ? "bg-[#a4442a] text-white" : "bg-ink text-bone"
            }`}
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/40 p-3 backdrop-blur-sm md:p-8" onMouseDown={onClose} role="dialog" aria-modal="true" aria-label={title}>
      <div
        className={`flex max-h-full w-full flex-col overflow-hidden rounded-2xl bg-bone shadow-2xl ${wide ? "max-w-5xl" : "max-w-lg"}`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand" aria-label="Close">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}
