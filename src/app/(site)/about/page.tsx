import type { Metadata } from "next";
import Link from "next/link";
import Media from "@/components/site/Media";
import PageHero from "@/components/site/PageHero";
import SectionHead from "@/components/site/SectionHead";
import { Reveal, RiseText } from "@/components/site/Reveal";
import { PillarDot } from "@/components/site/Pillar";
import { getSite } from "@/lib/store";
import Accent, { PILLAR_TEXT } from "@/components/site/Accent";
import SpaceBackdrop from "@/components/site/SpaceBackdrop";

export const metadata: Metadata = {
  title: "About",
  description: "CAP is a creative agency in Niketon, Dhaka, building marketing systems that scale with ambition — content, analytics and production in one team.",
};

export default async function AboutPage() {
  const site = await getSite();
  const { about } = site;

  return (
    <>
      <PageHero label="About the studio" title={`${about.headline} *${about.emphasis}* ${about.headlineEnd}`} />

      {about.teamImage && (
        <Reveal className="wrap">
          {/* natural aspect ratio: the whole team picture shows, nothing cropped */}
          <div className="overflow-hidden rounded-[1.5rem] bg-sand">
            <Media src={about.teamImage} alt={`The ${site.company.name} team`} priority className="block h-auto w-full" />
          </div>
        </Reveal>
      )}

      <section className="wrap grid gap-10 py-24 lg:grid-cols-12 md:py-36">
        <p className="t-label text-stone lg:col-span-3">Who we are</p>
        <div className="space-y-8 lg:col-span-8 lg:col-start-5">
          {about.paragraphs.map((p, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <p className={i === 0 ? "t-lead" : "t-body text-graphite md:text-lg"}>{p}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap">
        <div className="on-dark relative isolate overflow-hidden rounded-[1.75rem] bg-[#08080f] px-6 py-20 text-bone sm:px-10 md:px-14 md:py-28">
          <SpaceBackdrop className="-z-10" />
          <SectionHead label="The system" title="Three disciplines. *One* team." />
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
            {site.pillars.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1} className="h-full">
                <Link
                  href={`/services/${p.id}`}
                  aria-label={`${p.label}: ${p.kicker}. See ${p.label.toLowerCase()} services`}
                  className="group flex h-full flex-col rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-[2px] transition-[background-color,border-color,transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.08] md:p-10"
                >
                  <span className="flex items-center justify-between">
                    <PillarDot id={p.id} />
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-bone/80 transition-all duration-500 group-hover:border-transparent group-hover:bg-bone group-hover:text-ink">
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="M7 17L17 7M8 7h9v9" />
                      </svg>
                    </span>
                  </span>
                  <h3 className="t-h2 mt-10 lg:mt-16">{p.label}</h3>
                  <p className="mt-1 text-xl"><Accent text={p.kicker} color={PILLAR_TEXT[p.id]} /></p>
                  <p className="mt-6 leading-relaxed text-mist">{p.text}</p>
                  <span className="mt-auto pt-8 text-sm font-semibold text-bone/90">
                    <span className="link-u">Explore {p.label.toLowerCase()}</span> <span aria-hidden>→</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="wrap py-24 md:py-36">
        <SectionHead label="What we believe" title="Taste matters. So does *structure*." />
        <div className="grid gap-x-6 gap-y-12 md:grid-cols-3">
          {about.beliefs.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.1} className="border-t hairline pt-6">
              <span className="t-label text-mist">0{i + 1}</span>
              <h3 className="t-h3 mt-6">{b.title}</h3>
              <p className="mt-4 leading-relaxed text-graphite">{b.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap pb-24 md:pb-36">
        <SectionHead label="How we work" title="From first call to *final* cut." />
        <ol className="grid gap-4 md:gap-6 lg:grid-cols-3">
          {site.process.map((p, i) => (
            <Reveal as="li" key={p.title} delay={i * 0.1} className="rounded-[1.25rem] bg-paper p-8 md:p-10">
              <span className="t-label text-mist">Step 0{i + 1}</span>
              <h3 className="mt-10 text-[clamp(2.2rem,4vw,3.5rem)] lg:mt-16 font-semibold leading-none tracking-[-0.045em]">{p.title}.</h3>
              <p className="mt-6 leading-relaxed text-graphite">{p.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {about.quote && (
        <section className="border-t hairline">
          <div className="wrap py-24 md:py-36">
            <span className="mb-10 flex gap-1">
              <PillarDot id="content" /> <PillarDot id="analytics" /> <PillarDot id="production" />
            </span>
            <RiseText as="p" className="t-h1 max-w-[22ch]" text={`“${about.quote}”`} />
            <Reveal delay={0.3} className="mt-12 flex flex-wrap gap-3">
              <Link href="/team" className="pill pill-ink">Meet the team <span aria-hidden>→</span></Link>
              <Link href="/work" className="pill pill-line">See the work</Link>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
