import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Media from "@/components/site/Media";
import WorkCard from "@/components/site/WorkCard";
import { Reveal, RiseText } from "@/components/site/Reveal";
import { PILLAR_LABEL, PillarDot } from "@/components/site/Pillar";
import { getWork, getWorks } from "@/lib/store";
import { isVideo } from "@/lib/mime";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getWorks()).map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const work = await getWork((await params).slug);
  if (!work) return {};
  return {
    title: work.title,
    description: work.summary,
    openGraph: { images: work.cover && !isVideo(work.cover) ? [work.cover] : undefined },
  };
}

function Chapter({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <Reveal className="grid gap-6 border-t hairline py-12 lg:grid-cols-12 md:py-20">
      <p className="t-label text-stone lg:col-span-3">
        <span className="mr-3 text-mist">{n}</span>
        {title}
      </p>
      <div className="lg:col-span-8 lg:col-start-5">{children}</div>
    </Reveal>
  );
}

export default async function WorkDetail({ params }: Props) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) notFound();

  const all = await getWorks();
  const idx = all.findIndex((w) => w.slug === slug);
  const next = all[(idx + 1) % all.length];
  const more = all.filter((w) => w.slug !== slug).slice(0, 2);
  const heroMedia = work.video || work.cover;

  return (
    <article>
      <header className="wrap pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]">
        <Reveal className="mb-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <Link href="/work" className="t-label text-stone hover:text-ink">← All work</Link>
          <span className="flex flex-wrap items-center gap-4">
            {work.pillars.map((p) => (
              <span key={p} className="t-label flex items-center gap-2 text-stone">
                <PillarDot id={p} className="!h-1.5 !w-1.5" /> {PILLAR_LABEL[p]}
              </span>
            ))}
          </span>
        </Reveal>
        <RiseText as="h1" immediate className="t-h1 max-w-[18ch]" text={work.title} />
        <Reveal delay={0.3} className="mt-10 grid gap-10 lg:grid-cols-12">
          <p className="t-lead text-graphite lg:col-span-6">{work.summary}</p>
          <dl className="grid grid-cols-2 gap-6 text-sm sm:grid-cols-4 lg:col-span-5 lg:col-start-8 lg:grid-cols-2">
            {[
              ["Client", work.client],
              ["Category", work.category],
              ["Date", work.date],
              ["Focus", work.focus],
            ]
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="t-label mb-2 text-mist">{k}</dt>
                  <dd className="font-semibold leading-snug">{v}</dd>
                </div>
              ))}
          </dl>
        </Reveal>
      </header>

      <Reveal className="wrap mt-14 md:mt-20">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-sand md:aspect-[16/8]">
          <Media src={heroMedia} poster={work.video ? work.cover : undefined} alt={work.title} priority className="absolute inset-0 h-full w-full" />
        </div>
      </Reveal>

      {work.metrics.length > 0 && (
        <section className="wrap mt-16 grid grid-cols-2 gap-6 md:mt-24 md:grid-cols-4" aria-label="Results">
          {work.metrics.map((m, i) => (
            <Reveal key={m.label} delay={i * 0.08} className="border-t hairline pt-5">
              <p className="text-[clamp(2.8rem,6vw,5.5rem)] font-semibold leading-none tracking-[-0.055em]">{m.value}</p>
              <p className="mt-3 text-stone">{m.label}</p>
            </Reveal>
          ))}
        </section>
      )}

      <div className="wrap mt-16 md:mt-28">
        <Chapter n="01" title="Overview">
          <p className="t-lead">{work.description}</p>
        </Chapter>
        {work.challenge && (
          <Chapter n="02" title="The challenge">
            <p className="t-body text-graphite md:text-lg">{work.challenge}</p>
          </Chapter>
        )}
        {work.execution && (
          <Chapter n="03" title="What we did">
            <p className="t-body text-graphite md:text-lg">{work.execution}</p>
            {work.scope.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2">
                {work.scope.map((s) => (
                  <li key={s} className="rounded-full bg-paper px-4 py-2 text-sm font-semibold">{s}</li>
                ))}
              </ul>
            )}
          </Chapter>
        )}
        {work.gallery.length > 0 && (
          <div className="grid gap-6 py-10 md:grid-cols-2">
            {work.gallery.map((g, i) => (
              <Reveal key={g + i} className={`overflow-hidden rounded-[1.25rem] bg-sand ${i % 3 === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/5]"}`}>
                <Media src={g} alt={`${work.title} — image ${i + 1}`} className="h-full w-full" />
              </Reveal>
            ))}
          </div>
        )}
        {work.outcome && (
          <Chapter n="04" title="The outcome">
            <p className="t-lead">{work.outcome}</p>
            {work.highlights.length > 0 && (
              <ul className="mt-10 divide-y hairline border-y hairline">
                {work.highlights.map((h) => (
                  <li key={h} className="flex gap-4 py-4 text-graphite">
                    <span className="em text-xl text-stone">✦</span>
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </Chapter>
        )}
      </div>

      {next && next.slug !== slug && (
        <Link href={`/work/${next.slug}`} className="group mt-16 block border-t hairline md:mt-24">
          <div className="wrap flex flex-col gap-6 py-16 md:flex-row md:items-end md:justify-between md:py-24">
            <div>
              <p className="t-label mb-6 text-stone">Next project</p>
              <p className="t-h1 max-w-[16ch] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-3">
                {next.title}
              </p>
            </div>
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-ink text-bone transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:rotate-45 md:h-28 md:w-28">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                <path d="M7 17L17 7M8 7h9v9" />
              </svg>
            </span>
          </div>
        </Link>
      )}

      {more.length > 1 && (
        <section className="wrap pb-28 md:pb-40" aria-label="More work">
          <div className="grid gap-6 md:grid-cols-2">
            {more.map((w) => (
              <WorkCard key={w.slug} work={w} aspect="aspect-[16/10]" />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
