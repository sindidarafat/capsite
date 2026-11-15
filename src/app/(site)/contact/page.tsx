import type { Metadata } from "next";
import BriefForm from "@/components/site/BriefForm";
import PageHero from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { getSite } from "@/lib/store";
import Accent from "@/components/site/Accent";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with CAP. Tell us what you're building — content, analytics or production — and we'll shape the quickest route from brief to launch.",
};

export default async function ContactPage() {
  const site = await getSite();
  const { company } = site;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: site.faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <PageHero
        label="Start a project"
        title="Tell us the *shape* of the work."
        intro="Whether it's content, analytics or production, we keep the process sharp and the handoffs simple. Four quick steps — or just email us."
      />

      <section className="wrap grid gap-12 pb-24 lg:grid-cols-12 md:pb-36">
        <div className="lg:col-span-8">
          <BriefForm inbox={site.company.email} />
        </div>
        <aside className="grid gap-10 sm:grid-cols-2 lg:col-span-4 lg:block lg:space-y-10">
          <Reveal>
            <p className="t-label mb-4 text-stone">Email</p>
            <a href={`mailto:${company.email}`} className="t-h3 link-u">{company.email}</a>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="t-label mb-4 text-stone">Phone</p>
            <a href={`tel:${company.phone.replace(/[^+\d]/g, "")}`} className="t-h3 link-u">{company.phone}</a>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="t-label mb-4 text-stone">Studio</p>
            <address className="not-italic leading-relaxed text-graphite">
              {company.addressLines.map((l) => <span key={l} className="block">{l}</span>)}
            </address>
            {company.mapUrl && (
              <a href={company.mapUrl} target="_blank" rel="noreferrer" className="link-u mt-3 inline-block text-sm font-semibold">Open in Maps ↗</a>
            )}
          </Reveal>
          {company.hours && (
            <Reveal delay={0.15}>
              <p className="t-label mb-4 text-stone">Hours</p>
              <p className="text-graphite">{company.hours}</p>
            </Reveal>
          )}
        </aside>
      </section>

      {site.faq.length > 0 && (
        <section className="wrap border-t hairline py-20 md:py-28" aria-labelledby="faq">
          <div className="grid gap-10 md:grid-cols-12">
            <h2 id="faq" className="t-h2 md:col-span-4">
              Good <Accent text="questions." />
            </h2>
            <div className="divide-y hairline border-y hairline md:col-span-8">
              {site.faq.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-semibold tracking-tight md:text-xl">
                    {f.q}
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border hairline transition-transform duration-500 group-open:rotate-45" aria-hidden>+</span>
                  </summary>
                  <p className="mt-4 max-w-2xl leading-relaxed text-graphite">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        </section>
      )}
    </>
  );
}
