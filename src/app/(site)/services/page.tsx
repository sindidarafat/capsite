import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/site/PageHero";
import { Reveal, RiseText } from "@/components/site/Reveal";
import { PillarDot } from "@/components/site/Pillar";
import { getServices, getSite } from "@/lib/store";
import Accent, { PILLAR_TEXT } from "@/components/site/Accent";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Content strategy, creative direction, analytics, media buying, video production, animation, photography and more — everything from strategy to launch.",
};

export default async function ServicesPage() {
  const [services, site] = await Promise.all([getServices(), getSite()]);
  const total = services.reduce((n, s) => n + s.items.length, 0);

  return (
    <>
      <PageHero
        label={`Services — ${total} disciplines`}
        title="Everything from *strategy* to launch."
        intro="Cinema-grade craft. Content people don't skip. Content, analytics and production — everything you need to plan, make and scale high-performing creative."
      >
        <nav aria-label="Service lines" className="flex flex-wrap gap-2 md:justify-end">
          {services.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="pill pill-line !py-2 !text-sm">
              <PillarDot id={s.id} className="!h-1.5 !w-1.5" /> {s.name}
            </a>
          ))}
        </nav>
      </PageHero>

      {services.map((group, gi) => {
        const pillar = site.pillars.find((p) => p.id === group.id);
        return (
          <section key={group.id} id={group.id} className="scroll-mt-24 border-t hairline">
            <div className="wrap grid gap-12 py-20 lg:grid-cols-12 md:py-32">
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-28">
                  <p className="mb-8 flex items-center gap-3">
                    <PillarDot id={group.id} />
                    <span className="t-label text-stone">0{gi + 1} / {group.name}</span>
                  </p>
                  <RiseText as="h2" className="t-h1" accent={PILLAR_TEXT[group.id]} text={`${group.name}${pillar ? `\n*${pillar.kicker.toLowerCase()}.*` : ""}`} />
                  <p className="mt-8 max-w-md leading-relaxed text-graphite">{group.intro}</p>
                  <Link href={`/services/${group.id}`} className="pill pill-line mt-8 !py-2.5 !text-sm">
                    Explore {group.name.toLowerCase()} <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
              <ol className="lg:col-span-7">
                {group.items.map((item, i) => (
                  <Reveal as="li" key={item.title} delay={i * 0.04} className="group grid grid-cols-[3rem_1fr] gap-4 border-t hairline py-8 first:border-t-0 md:grid-cols-[4rem_1fr] md:py-10 md:first:border-t">
                    <span className="t-label pt-2 text-mist">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="t-h3 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">{item.title}</h3>
                      <p className="mt-3 max-w-xl leading-relaxed text-stone">{item.description}</p>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </section>
        );
      })}

      <section className="wrap border-t hairline py-20 md:py-28">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <h2 className="t-h2 max-w-[20ch]">
            Need just one of these — or <Accent text="all of them?" />
          </h2>
          <Link href="/contact" className="pill pill-ink">
            Talk to CAP <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </>
  );
}
