import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import WorkCard from "@/components/site/WorkCard";
import SectionHead from "@/components/site/SectionHead";
import { Reveal, RiseText } from "@/components/site/Reveal";
import { PillarDot } from "@/components/site/Pillar";
import Accent, { PILLAR_TEXT } from "@/components/site/Accent";
import { getServices, getSite, getWorks } from "@/lib/store";
import type { PillarId } from "@/lib/types";

const PILLARS: PillarId[] = ["content", "analytics", "production"];
type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return PILLARS.map((id) => ({ id }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const [site, services] = await Promise.all([getSite(), getServices()]);
  const pillar = site.pillars.find((p) => p.id === id);
  const group = services.find((s) => s.id === id);
  if (!pillar) return {};
  return { title: pillar.label, description: group?.intro || pillar.text };
}

/** One service line (Content / Analytics / Production): what it covers, its services, and the work behind it. */
export default async function PillarPage({ params }: Props) {
  const { id } = await params;
  const [site, services, works] = await Promise.all([getSite(), getServices(), getWorks()]);
  const pillar = site.pillars.find((p) => p.id === id);
  if (!pillar) notFound();
  const group = services.find((s) => s.id === pillar.id);
  const index = PILLARS.indexOf(pillar.id);
  const related = works.filter((w) => w.pillars.includes(pillar.id)).slice(0, 6);
  const others = site.pillars.filter((p) => p.id !== pillar.id);

  return (
    <>
      <section className="wrap pb-16 pt-[calc(var(--header-h)+3rem)] md:pb-24 md:pt-[calc(var(--header-h)+6rem)]">
        <Reveal>
          <p className="t-label mb-8 flex items-center gap-3 text-stone">
            <Link href="/services" className="link-u">Services</Link>
            <span aria-hidden className="text-mist">/</span>
            <PillarDot id={pillar.id} />
            <span>0{index + 1} — {pillar.label}</span>
          </p>
        </Reveal>
        <RiseText
          as="h1"
          immediate
          className="t-mega max-w-[14ch]"
          accent={PILLAR_TEXT[pillar.id]}
          text={`${pillar.label}\n*${pillar.kicker.split("·").map((s) => s.trim().toLowerCase()).join(", ")}.*`}
        />
        <Reveal delay={0.4} className="mt-10 grid gap-8 md:mt-16 md:grid-cols-12">
          <p className="t-lead text-graphite md:col-span-7 lg:col-span-6">{group?.intro || pillar.text}</p>
          <div className="flex flex-wrap items-end gap-3 md:col-span-5 md:col-start-8 md:justify-end lg:col-span-6 lg:col-start-7">
            <Link href="/contact" className="pill pill-ink">
              Start a {pillar.label.toLowerCase()} project <span aria-hidden>→</span>
            </Link>
          </div>
        </Reveal>
      </section>

      {group && group.items.length > 0 && (
        <section className="wrap border-t hairline py-20 md:py-32">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                <p className="t-label text-stone">What&apos;s included</p>
                <p className="mt-6 max-w-sm leading-relaxed text-graphite">{pillar.text}</p>
              </div>
            </div>
            <ol className="lg:col-span-8">
              {group.items.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.title}
                  delay={i * 0.04}
                  className="group grid grid-cols-[2.5rem_1fr] gap-4 border-t hairline py-8 first:border-t-0 md:grid-cols-[4rem_1fr] md:py-10 md:first:border-t"
                >
                  <span className="t-label pt-2 text-mist">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h2 className="t-h3 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">{item.title}</h2>
                    <p className="mt-3 max-w-xl leading-relaxed text-stone">{item.description}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="wrap pb-20 md:pb-32">
          <SectionHead label={`${pillar.label} in action`} title="Selected *work*." link={{ href: "/work", label: "All work" }} />
          <div className="grid gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {related.map((w, i) => (
              <Reveal key={w.slug} delay={(i % 3) * 0.08}>
                <WorkCard work={w} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <section className="wrap border-t hairline py-20 md:py-28">
        <p className="t-label mb-8 text-stone">The other two disciplines</p>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6">
          {others.map((p) => (
            <Link
              key={p.id}
              href={`/services/${p.id}`}
              className="group flex items-center justify-between gap-6 rounded-[1.25rem] bg-paper p-7 transition-colors duration-500 hover:bg-sand md:p-10"
            >
              <span>
                <span className="flex items-center gap-3">
                  <PillarDot id={p.id} />
                  <span className="t-h2">{p.label}</span>
                </span>
                <span className="mt-2 block text-lg"><Accent text={p.kicker} color={PILLAR_TEXT[p.id]} /></span>
              </span>
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:rotate-45">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="M7 17L17 7M8 7h9v9" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
