import Link from "next/link";
import Hero from "@/components/site/Hero";
import WorkCard from "@/components/site/WorkCard";
import SectionHead from "@/components/site/SectionHead";
import CountUp from "@/components/site/CountUp";
import Marquee from "@/components/site/Marquee";
import Media from "@/components/site/Media";
import { Reveal, RiseText } from "@/components/site/Reveal";
import { PILLAR_BRAND } from "@/components/site/Pillar";
import { getJobs, getServices, getSite, getTeam, getWorks } from "@/lib/store";
import { isOpen } from "@/lib/jobs";
import Accent from "@/components/site/Accent";

export const revalidate = 3600; // re-check job deadlines hourly

export default async function Home() {
  const [site, works, services, team, jobs] = await Promise.all([getSite(), getWorks(), getServices(), getTeam(), getJobs()]);
  const featured = works.filter((w) => w.featured).slice(0, 5);
  const openJobs = jobs.filter((j) => isOpen(j));
  const serviceCount = services.reduce((n, s) => n + s.items.length, 0);

  return (
    <>
      <Hero hero={site.hero} />

      {/* Statement */}
      <section className="wrap py-28 md:py-44">
        <div className="grid gap-12 lg:grid-cols-12">
          <p className="t-label text-stone lg:col-span-3 lg:pt-4">What we believe</p>
          <div className="lg:col-span-9">
            <RiseText as="h2" className="t-h1 max-w-[16ch]" text={`${site.statement.text} *${site.statement.emphasis}*`} />
            <Reveal delay={0.2} className="mt-12 grid gap-8 md:grid-cols-2">
              <p className="t-lead text-graphite">{site.statement.body}</p>
              <div className="flex items-end">
                <Link href="/about" className="pill pill-line">
                  About the studio <span aria-hidden>→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Selected work */}
      {featured.length > 0 && (
        <section className="wrap pb-28 md:pb-44" id="work">
          <SectionHead index="01" label="Selected work" title="Work that *created* impact." link={{ href: "/work", label: "All work" }} />
          <div className="grid gap-x-6 gap-y-16 md:grid-cols-12 md:gap-y-24">
            {featured.map((w, i) => {
              const layout = [
                "md:col-span-12",
                "md:col-span-7",
                "md:col-span-5 md:mt-40",
                "md:col-span-5",
                "md:col-span-7 md:mt-40",
              ][i % 5];
              const aspect = i === 0 ? "aspect-[4/5] sm:aspect-[21/9]" : i % 5 === 2 || i % 5 === 3 ? "aspect-[4/5]" : "aspect-[4/3]";
              return (
                <Reveal key={w.slug} className={layout}>
                  <WorkCard work={w} index={i} aspect={aspect} sizes={i === 0 ? "text-[clamp(1.6rem,3vw,3rem)]" : undefined} />
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* Pillars */}
      <section className="wrap scroll-mt-24" id="what-we-do">
        <div className="on-dark rounded-[1.75rem] bg-ink px-6 py-20 text-bone sm:px-10 md:px-14 md:py-28">
          <SectionHead index="02" label="What we do" title="Three capabilities, *one* operating system." link={{ href: "/services", label: `All ${serviceCount} services` }} />
          {/* the three brand colours, joined like the CAP colour bar */}
          <Reveal className="grid overflow-hidden rounded-[1.25rem] lg:grid-cols-3">
            {site.pillars.map((p, i) => {
              const group = services.find((s) => s.id === p.id);
              return (
                <Link
                  key={p.id}
                  href={`/services/${p.id}`}
                  className="group flex flex-col p-8 text-white transition-[filter] duration-500 hover:brightness-[1.06] md:p-10"
                  style={{ background: PILLAR_BRAND[p.id] }}
                >
                  <span className="t-label text-white/70">0{i + 1}</span>
                  <h3 className="mt-14 font-display text-[clamp(1.5rem,2.2vw,2.4rem)] leading-none tracking-[-0.01em] lg:mt-24">{p.label}</h3>
                  <p className="em mt-3 text-2xl text-white/85">{p.kicker}</p>
                  <p className="mt-6 max-w-sm leading-relaxed text-white/85">{p.text}</p>
                  {group && (
                    <ul className="mt-8 space-y-2 border-t border-white/25 pt-6 text-[0.95rem]">
                      {group.items.slice(0, 4).map((it) => (
                        <li key={it.title} className="flex gap-3">
                          <span className="text-white/60">—</span>
                          {it.title}
                        </li>
                      ))}
                    </ul>
                  )}
                  <span className="mt-auto inline-flex items-center gap-2 pt-10 text-sm font-semibold">
                    <span className="link-u">Explore {p.label.toLowerCase()}</span>
                    <span aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">→</span>
                  </span>
                </Link>
              );
            })}
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="wrap py-28 md:py-44">
        <SectionHead index="03" label="In numbers" title="Numbers that speak for *themselves*." />
        <div className="grid grid-cols-2 gap-x-6 gap-y-14 lg:grid-cols-4">
          {site.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="border-t hairline pt-6">
              <p className="text-[clamp(3.5rem,8vw,7.5rem)] font-semibold leading-none tracking-[-0.06em]">
                <CountUp value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-4 max-w-[22ch] text-stone">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Clients */}
      <section className="border-y hairline py-14 md:py-20" aria-label="Clients" id="clients">
        <p className="wrap t-label mb-10 text-stone">Trusted by organizations building bold stories</p>
        <Marquee duration={Math.max(40, site.clients.length * 4.5)}>
          {site.clients.map((c) => (
            <span
              key={c.name}
              className="mx-2 flex h-20 items-center gap-4 rounded-full border hairline bg-paper/80 py-3 pl-3 pr-7 shadow-[0_1px_0_rgba(27,26,23,0.03)] backdrop-blur-sm md:mx-3 md:h-24 md:pl-4 md:pr-9"
            >
              {c.logo && c.wordmark ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={c.logo} alt={c.name} className="ml-4 h-7 w-auto max-w-[11rem] object-contain md:h-9" loading="lazy" />
              ) : (
                <>
                  {c.logo ? (
                    <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-white md:h-16 md:w-16">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.logo} alt="" className="block h-auto max-h-9 w-auto max-w-10 object-contain md:max-h-10 md:max-w-11" loading="lazy" />
                    </span>
                  ) : (
                    <span
                      className="grid h-14 w-14 shrink-0 place-items-center rounded-full font-display text-sm text-white md:h-16 md:w-16"
                      style={{ background: c.color || "var(--color-graphite)" }}
                      aria-hidden
                    >
                      {c.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                  )}
                  <span
                    className="whitespace-nowrap text-[1.15rem] font-bold tracking-[-0.025em] md:text-[1.35rem]"
                    style={{ color: c.color || "var(--color-graphite)" }}
                  >
                    {c.name}
                  </span>
                </>
              )}
            </span>
          ))}
        </Marquee>
      </section>

      {/* Process */}
      <section className="wrap py-28 md:py-44">
        <SectionHead index="04" label="How we work" title="A process that keeps the idea *alive*." />
        <ol className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {site.process.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.1} className="rounded-[1.25rem] bg-paper p-8 md:p-10">
              <span className="t-label text-mist">Step 0{i + 1}</span>
              <h3 className="mt-20 text-[clamp(2.2rem,4vw,3.5rem)] font-semibold leading-none tracking-[-0.045em]">
                {p.title}
                <span className="em text-stone">.</span>
              </h3>
              <p className="mt-6 leading-relaxed text-graphite">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* Team teaser */}
      {team.length > 0 && (
        <section className="pb-28 md:pb-44">
          <div className="wrap">
            <SectionHead index="05" label="The crew" title="The people who make it *happen*." link={{ href: "/team", label: "Meet everyone" }} />
          </div>
          <Marquee duration={60}>
            {team.filter((t) => t.photo).map((t) => (
              <Link href="/team" key={t.id} className="group mx-3 block w-[58vw] shrink-0 sm:w-[30vw] lg:w-[19vw]">
                <div className="aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-sand">
                  <Media src={t.photo} alt={t.name} className="h-full w-full grayscale transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0" />
                </div>
                <p className="mt-4 font-semibold tracking-tight">{t.name}</p>
                <p className="text-sm text-stone">{t.role}</p>
              </Link>
            ))}
          </Marquee>
        </section>
      )}

      {/* Careers teaser */}
      <section className="wrap pb-28 md:pb-36">
        <Reveal className="grid items-center gap-10 rounded-[1.5rem] bg-sand p-8 md:grid-cols-12 md:p-14">
          <div className="md:col-span-7">
            <p className="t-label mb-6 text-stone">Careers</p>
            <h2 className="t-h2">
              {site.careersIntro.headline} <Accent text={site.careersIntro.emphasis} />
            </h2>
          </div>
          <div className="md:col-span-5">
            <p className="leading-relaxed text-graphite">
              {openJobs.length > 0
                ? `${openJobs.length} open ${openJobs.length === 1 ? "role" : "roles"} right now — ${openJobs.map((j) => j.title).join(", ")}.`
                : "No open roles right now, but we always want to see great works. You can send your resume for future opportunities!"}
            </p>
            <Link href="/careers" className="pill pill-ink mt-6">
              See careers <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  );
}
