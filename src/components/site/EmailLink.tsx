"use client";
import { useEffect, useRef, useState } from "react";

/**
 * An email address that always works. A plain mailto: link does nothing on computers without
 * an email app set up (common on Windows), so clicking opens a small menu instead:
 * write in Gmail, write in Outlook, use the email app, or copy the address.
 */
export default function EmailLink({
  email,
  subject = "",
  className = "",
  wrapClassName = "",
  children,
}: {
  email: string;
  subject?: string;
  className?: string;
  /** classes for the outer wrapper, e.g. "block w-full" for a full-width button */
  wrapClassName?: string;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [alignRight, setAlignRight] = useState(false);
  const wrap = useRef<HTMLSpanElement>(null);

  const q = (s: string) => encodeURIComponent(s);
  const mailto = `mailto:${email}${subject ? `?subject=${q(subject)}` : ""}`;
  const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${q(email)}${subject ? `&su=${q(subject)}` : ""}`;
  const outlook = `https://outlook.live.com/mail/0/deeplink/compose?to=${q(email)}${subject ? `&subject=${q(subject)}` : ""}`;

  useEffect(() => {
    if (!open) return;
    const r = wrap.current?.getBoundingClientRect();
    if (r) setAlignRight(r.left + 250 > window.innerWidth);
    const onDown = (e: PointerEvent) => !wrap.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const t = document.createElement("textarea");
      t.value = email;
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setOpen(false);
    }, 1400);
  }

  const item = "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[0.95rem] font-semibold text-ink transition-colors hover:bg-sand";

  return (
    <span ref={wrap} className={`relative ${wrapClassName || "inline-block"}`}>
      <a
        href={mailto}
        className={className}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          e.preventDefault();
          setOpen((o) => !o);
        }}
      >
        {children ?? email}
      </a>
      {open && (
        <span
          role="menu"
          className={`absolute top-full z-[80] mt-2 block w-60 rounded-2xl border border-ink/10 bg-paper p-1.5 text-left normal-case tracking-normal shadow-[0_18px_50px_-12px_rgba(27,26,23,0.35)] ${
            alignRight ? "right-0" : "left-0"
          }`}
        >
          <span className="block truncate px-3 pb-1.5 pt-2 text-xs font-medium text-stone">{email}</span>
          <a role="menuitem" href={gmail} target="_blank" rel="noreferrer" className={item} onClick={() => setOpen(false)}>
            <span aria-hidden className="w-5 text-center">✉</span> Write in Gmail
          </a>
          <a role="menuitem" href={outlook} target="_blank" rel="noreferrer" className={item} onClick={() => setOpen(false)}>
            <span aria-hidden className="w-5 text-center">✉</span> Write in Outlook
          </a>
          <a role="menuitem" href={mailto} className={item} onClick={() => setOpen(false)}>
            <span aria-hidden className="w-5 text-center">↗</span> Use email app
          </a>
          <button type="button" role="menuitem" className={item} onClick={copy}>
            <span aria-hidden className="w-5 text-center">{copied ? "✓" : "⧉"}</span> {copied ? "Copied!" : "Copy address"}
          </button>
        </span>
      )}
    </span>
  );
}
