"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Logo from "./Logo";
import { getLenis } from "./SmoothScroll";
import { NAV } from "./nav";
import EmailLink from "./EmailLink";

const EASE = [0.76, 0, 0.24, 1] as const;

export default function Header({ email, socials }: { email: string; socials: { label: string; url: string }[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > 200 && y > last + 4 ? true : y < last - 4 ? false : (h) => h);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const light = open; // light-on-dark only while the full-screen menu is open

  useEffect(() => {
    const l = getLenis();
    if (open) l?.stop();
    else l?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] pill pill-ink">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-[70] transition-transform duration-700 ease-[var(--ease-out-expo)] ${
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <div
          className={`wrap flex h-[var(--header-h)] items-center justify-between gap-6 transition-colors duration-500 ${
            scrolled && !light ? "bg-bone/80 backdrop-blur-md" : ""
          } ${light ? "text-bone" : "text-ink"}`}
        >
          <Link href="/" aria-label="CAP — home" className="relative z-[70]">
            {/* CAP orange, as in the brand deck; turns off-white over the open (dark) menu */}
            <Logo className={`h-7 transition-colors duration-500 md:h-8 ${open ? "text-bone" : "text-content-brand"}`} />
          </Link>

          <nav aria-label="Main" className="hidden items-center gap-8 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`link-u text-[0.95rem] font-semibold tracking-tight ${isActive(n.href) ? "bg-[length:100%_1px]" : ""}`}
                aria-current={isActive(n.href) ? "page" : undefined}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="relative z-[70] flex items-center gap-3">
            <Link href="/contact" className={`pill hidden sm:inline-flex !py-2.5 !text-sm ${light ? "bg-bone text-ink hover:bg-sand" : "pill-ink"}`}>
              Start a project <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={`grid h-11 w-11 place-items-center rounded-full transition-colors lg:hidden ${
                light ? "bg-bone text-ink" : "bg-ink text-bone"
              }`}
            >
              <span className="relative block h-3 w-5">
                <span className={`absolute left-0 h-[1.5px] w-full bg-current transition-all duration-500 ${open ? "top-1.5 rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 h-[1.5px] w-full bg-current transition-all duration-500 ${open ? "top-1.5 -rotate-45" : "top-3"}`} />
              </span>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="site-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="on-dark fixed inset-0 z-[65] flex flex-col bg-ink text-bone lg:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <nav aria-label="Mobile" className="wrap mt-[calc(var(--header-h)+2rem)] flex flex-1 flex-col gap-1">
              {[...NAV, { href: "/contact", label: "Contact" }].map((n, i) => (
                <div key={n.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.25 + i * 0.05 }}
                  >
                    <Link href={n.href} className="flex items-baseline gap-4 py-1 text-[clamp(2.6rem,11vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
                      <span className="t-label text-mist">0{i + 1}</span>
                      {n.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <motion.div
              className="wrap flex flex-wrap items-end justify-between gap-6 pb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <EmailLink email={email} className="text-lg font-semibold" />
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-mist">
                {socials.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noreferrer" className="hover:text-bone">{s.label}</a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
