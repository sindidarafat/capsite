import type { Metadata } from "next";
import MascotStage from "@/components/site/MascotStage";
import PageHero from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { PillarDot } from "@/components/site/Pillar";
import { getSite } from "@/lib/store";

export const metadata: Metadata = {
  title: "Meet the crew",
  description: "The three CAP characters: Content, Analytics and Production.",
};

export default async function MascotsPage() {
  const site = await getSite();
  return (
    <>
      <PageHero label="Mascot lab" title="Meet the *crew*." intro="Three caps, one head for business. Move your cursor, or drag a finger — they're watching." />
      <section className="wrap">
        <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-paper lg:aspect-auto lg:h-[75vh] lg:min-h-[420px]">
          <MascotStage />
        </div>
      </section>
      <section className="wrap grid gap-6 py-20 lg:grid-cols-3 md:py-28">
        {site.pillars.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className="border-t hairline pt-6">
            <p className="flex items-center gap-3">
              <PillarDot id={p.id} /> <span className="t-label text-stone">{p.kicker}</span>
            </p>
            <h2 className="t-h2 mt-6">{p.label}</h2>
            <p className="mt-4 leading-relaxed text-graphite">{p.text}</p>
          </Reveal>
        ))}
      </section>
    </>
  );
}
