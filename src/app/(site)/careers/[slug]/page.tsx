import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Media from "@/components/site/Media";
import { Reveal, RiseText } from "@/components/site/Reveal";
import { getJob, getJobs } from "@/lib/store";
import { formatDeadline, isOpen } from "@/lib/jobs";
import Accent from "@/components/site/Accent";

export const revalidate = 3600; // re-check job deadlines hourly

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getJobs()).map((j) => ({ slug: j.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const job = await getJob((await params).slug);
  return job ? { title: `${job.title} — Careers`, description: job.intro.slice(0, 160) } : {};
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <Reveal className="grid gap-6 border-t hairline py-10 md:grid-cols-12">
      <h2 className="t-label text-stone md:col-span-4">{title}</h2>
      <ul className="space-y-3 md:col-span-8">
        {items.map((it) => (
          <li key={it} className="flex gap-4 leading-relaxed text-graphite">
            <span className="text-mist">—</span>
            {it}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default async function JobPage({ params }: Props) {
  const job = await getJob((await params).slug);
  if (!job) notFound();
  const open = isOpen(job);
  const mailto = `mailto:${job.applyEmail}?subject=${encodeURIComponent(job.subjectLine || `Application for ${job.title}`)}`;

  return (
    <article className="wrap pb-28 pt-[calc(var(--header-h)+3rem)] md:pb-40 md:pt-[calc(var(--header-h)+5rem)]">
      <Link href="/careers" className="t-label text-stone hover:text-ink">← All open positions</Link>
      <div className="mt-10 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          {job.tagline && <p className="mb-6 text-2xl"><Accent text={job.tagline} /></p>}
          <RiseText as="h1" immediate className="t-h1" text={job.title} />
          <Reveal delay={0.3}>
            <p className="t-lead mt-10 text-graphite">{job.intro}</p>
          </Reveal>
        </div>
        <aside className="lg:col-span-4">
          <div className="space-y-6 rounded-[1.25rem] bg-paper p-8 md:sticky md:top-28">
            <dl className="grid grid-cols-2 gap-5 text-sm">
              {[
                ["Department", job.department],
                ["Type", job.type],
                ["Location", job.location],
                ["Deadline", job.deadline ? formatDeadline(job.deadline) : "Open"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="t-label mb-2 text-mist">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            {open ? (
              <>
                <a href={mailto} className="pill pill-ink w-full justify-center">Apply by email <span aria-hidden>→</span></a>
                <p className="text-xs leading-relaxed text-stone">
                  Send to <strong>{job.applyEmail}</strong> with the subject “{job.subjectLine || `Application for ${job.title}`}”.
                </p>
              </>
            ) : (
              <p className="rounded-full bg-sand px-5 py-3 text-center text-sm font-semibold text-stone">Applications closed</p>
            )}
          </div>
        </aside>
      </div>

      <div className="mt-16 md:mt-24 md:w-2/3">
        <List title="Key responsibilities" items={job.responsibilities} />
        <List title="Requirements" items={job.requirements} />
        <List title="Preferred skills" items={job.preferred} />
        <List title="What we offer" items={job.offer} />
        {job.extra.length > 0 && <List title={job.extraHeading || "More"} items={job.extra} />}
      </div>

      {job.image && (
        <Reveal className="mt-16 max-w-md overflow-hidden rounded-[1.25rem] bg-sand">
          <Media src={job.image} alt={`${job.title} job circular`} className="h-auto w-full" />
        </Reveal>
      )}
    </article>
  );
}
