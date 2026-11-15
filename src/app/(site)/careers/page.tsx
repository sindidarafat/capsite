import type { Metadata } from "next";
import Link from "next/link";
import Media from "@/components/site/Media";
import PageHero from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { getJobs, getSite } from "@/lib/store";
import { formatDeadline, isOpen } from "@/lib/jobs";
import EmailLink from "@/components/site/EmailLink";
import Accent from "@/components/site/Accent";

export const revalidate = 3600; // re-check job deadlines hourly

export const metadata: Metadata = {
  title: "Careers",
  description: "Join CAP and build impactful work in content, analytics and production. Explore open positions in Dhaka.",
};

export default async function CareersPage() {
  const [jobs, site] = await Promise.all([getJobs(), getSite()]);
  const open = jobs.filter((j) => isOpen(j));
  const { careersIntro, company } = site;

  return (
    <>
      <PageHero label="Careers at CAP" title={`${careersIntro.headline} *${careersIntro.emphasis}*`} intro={careersIntro.text} />

      {site.about.teamImage && (
        <Reveal className="wrap">
          {/* natural aspect ratio: the whole team picture shows on every screen, nothing cropped */}
          <div className="overflow-hidden rounded-[1.5rem] bg-sand">
            <Media src={site.about.teamImage} alt="Life at CAP" className="block h-auto w-full" />
          </div>
        </Reveal>
      )}

      <section className="wrap py-24 md:py-32" aria-labelledby="open-roles">
        <div className="mb-8 flex items-center justify-between border-t hairline pt-5">
          <h2 id="open-roles" className="t-label text-stone">Open positions</h2>
          <span className="t-label text-mist">{String(open.length).padStart(2, "0")}</span>
        </div>

        {open.length === 0 ? (
          <div className="rounded-[1.25rem] bg-paper p-10 text-center md:p-16">
            <p className="t-h3">
              Our team is full. Our curiosity isn&apos;t.
              <br />
              <Accent text="Still listening." />
            </p>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-stone">
              No open seats at the moment, but we believe great people can create opportunities that don&apos;t exist yet. Introduce yourself
              at <EmailLink email={company.careersEmail} subject="Introducing myself to CAP" className="link-u font-semibold text-ink" /> and
              we would love to hear from you!
            </p>
          </div>
        ) : (
          <ul className="divide-y hairline border-y hairline">
            {open.map((j) => (
              <li key={j.slug}>
                <Link href={`/careers/${j.slug}`} className="group grid gap-3 py-8 lg:grid-cols-12 lg:items-center md:py-10">
                  <span className="t-h2 lg:col-span-6 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:translate-x-2">{j.title}</span>
                  <span className="text-stone lg:col-span-2">{j.department}</span>
                  <span className="text-stone lg:col-span-2">{[j.type, j.location].filter(Boolean).join(" · ")}</span>
                  <span className="flex items-center justify-between gap-4 lg:col-span-2 lg:justify-end">
                    {j.deadline && <span className="text-sm text-stone">Apply by {formatDeadline(j.deadline)}</span>}
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-bone transition-transform duration-500 group-hover:rotate-45">↗</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
