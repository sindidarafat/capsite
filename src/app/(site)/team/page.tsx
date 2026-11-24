import type { Metadata } from "next";
import Link from "next/link";
import Media from "@/components/site/Media";
import PageHero from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Reveal";
import { getTeam } from "@/lib/store";
import Accent from "@/components/site/Accent";

export const metadata: Metadata = {
  title: "Team",
  description: "Meet the strategists, writers, analysts, designers and filmmakers behind CAP's campaigns and productions.",
};

function initials(name: string) {
  return name
    .replace(/^(md\.?|mr\.?|ms\.?)\s+/i, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export default async function TeamPage() {
  const team = await getTeam();

  return (
    <>
      <PageHero
        title="The people who bring *ideas* to life."
        intro="From planning to final execution, we work as one team — shaping the work together, start to finish."
      />

      {/* everyone together, in the order set in the admin (Team → order) */}
      <section className="wrap pb-20 md:pb-28" aria-label="Team members">
        <ul className="grid grid-cols-2 gap-x-4 gap-y-8 border-t hairline pt-10 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 md:gap-y-10 lg:grid-cols-7 lg:gap-x-4">
          {team.map((p, i) => (
              <Reveal as="li" key={p.id} delay={(i % 7) * 0.05} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[1rem] bg-sand">
                  {p.photo ? (
                    <Media
                      src={p.photo}
                      alt={p.name}
                      className="h-full w-full grayscale-[0.85] transition duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:grayscale-0"
                    />
                  ) : (
                    <span className="grid h-full w-full place-items-center bg-clay/60 font-display text-4xl text-bone lg:text-3xl">{initials(p.name)}</span>
                  )}
                  {p.linkedin && (
                    <a
                      href={p.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute right-2 top-2 rounded-full bg-bone px-2.5 py-1.5 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 [@media(hover:none)]:opacity-100 sm:right-3 sm:top-3 sm:px-3"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                </div>
                <h3 className="mt-3 text-base font-semibold leading-tight tracking-tight lg:text-[0.95rem]">{p.name}</h3>
                <p className="mt-0.5 text-sm leading-snug text-stone lg:text-[0.8rem]">{p.role}</p>
                {p.bio && <p className="mt-2 line-clamp-5 text-sm leading-relaxed text-graphite sm:line-clamp-none" title={p.bio}>{p.bio}</p>}
              </Reveal>
          ))}
        </ul>
      </section>

      <section className="wrap pb-28 md:pb-36">
        <Reveal className="flex flex-col gap-8 rounded-[1.5rem] bg-sand p-8 md:flex-row md:items-center md:justify-between md:p-14">
          <h2 className="t-h2 max-w-[18ch]">
            Want to be <Accent text="on this page" />?
          </h2>
          <Link href="/careers" className="pill pill-ink">See careers <span aria-hidden>→</span></Link>
        </Reveal>
      </section>
    </>
  );
}
