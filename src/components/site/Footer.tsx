import Link from "next/link";
import type { Site } from "@/lib/types";
import { NAV } from "./nav";
import Logo from "./Logo";
import Accent, { accentColor } from "./Accent";
import EmailLink from "@/components/site/EmailLink";

/** Compact footer: CAP colour stripe, a strong invitation line, four columns, one legal line. */
export default function Footer({ site }: { site: Site }) {
  const { company, socials, cta } = site;
  const year = new Date().getFullYear();

  // each column title gets a CAP colour dot, in brand order
  const Title = ({ children, i }: { children: React.ReactNode; i: number }) => (
    <p className="mb-5 flex items-center gap-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-graphite">
      <span className="h-2 w-2 rounded-full" style={{ background: accentColor(i) }} aria-hidden />
      {children}
    </p>
  );
  const link = "group/l inline-flex items-center gap-1.5 text-[1.02rem] font-semibold tracking-[-0.01em] text-ink transition-colors";

  return (
    <footer className="wrap pb-8 pt-20 md:pt-28">
      {/* CAP colour stripe, as on the brand deck */}
      <div className="flex h-1.5 overflow-hidden rounded-full" aria-hidden>
        <span className="flex-1 bg-content-brand" />
        <span className="flex-1 bg-analytics-brand" />
        <span className="flex-1 bg-production-brand" />
      </div>

      {/* invitation */}
      <div className="flex flex-col gap-8 pt-12 md:flex-row md:items-end md:justify-between md:pt-16">
        <div>
          <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-stone">Have a project in mind?</p>
          <p className="max-w-3xl text-[clamp(2.1rem,4.6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.045em]">
            {cta.headline} <Accent text={cta.emphasis} />
          </p>
        </div>
        <div className="flex flex-col items-start gap-3 md:items-end">
          <Link href="/contact" className="pill pill-ink !px-6 !py-3.5">
            Start a project <span aria-hidden>→</span>
          </Link>
          <EmailLink email={company.email} className="link-u text-[1.05rem] font-semibold text-graphite hover:text-ink" />
        </div>
      </div>

      {/* columns */}
      <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-9 rounded-[1.5rem] border hairline bg-paper/70 p-6 sm:p-7 backdrop-blur-sm md:mt-16 md:p-10 lg:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Title i={0}>Studio</Title>
          <address className="not-italic text-[1.02rem] leading-relaxed text-graphite">
            {company.addressLines.map((l, i) => (
              <span key={l} className={`block ${i === 0 ? "font-semibold text-ink" : ""}`}>{l}</span>
            ))}
          </address>
          {company.mapUrl && (
            <a href={company.mapUrl} target="_blank" rel="noreferrer" className={`${link} mt-3 hover:text-content-text`}>
              Get directions <span aria-hidden className="transition-transform group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5">↗</span>
            </a>
          )}
        </div>
        <div className="col-span-2 sm:col-span-1">
          <Title i={1}>Contact</Title>
          <ul className="space-y-1.5">
            <li><EmailLink email={company.email} className={`${link} hover:text-analytics-text`} /></li>
            <li><a href={`tel:${company.phone.replace(/[^+\d]/g, "")}`} className={`${link} hover:text-analytics-text`}>{company.phone}</a></li>
          </ul>
          {company.hours && <p className="mt-3 text-[0.95rem] text-stone">{company.hours}</p>}
        </div>
        <nav aria-label="Footer">
          <Title i={2}>Explore</Title>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            {[...NAV, { href: "/contact", label: "Contact" }].map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={`${link} hover:text-production-text`}>{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <Title i={3}>Follow</Title>
          <ul className="space-y-1.5">
            {socials.map((s) => (
              <li key={s.label}>
                <a href={s.url} target="_blank" rel="noreferrer" className={`${link} hover:text-content-text`}>
                  {s.label}
                  <span aria-hidden className="text-mist transition-transform group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* legal line */}
      <div className="mt-10 flex flex-col gap-4 text-[0.8rem] text-stone md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Logo className="h-5 text-content-brand" />
          <span>© {year} {company.legalName}</span>
        </div>
        <div className="flex gap-5">
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
          <Link href="/mascots" className="hover:text-ink">Meet the crew</Link>
        </div>
      </div>
    </footer>
  );
}
