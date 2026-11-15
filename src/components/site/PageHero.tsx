import { RiseText, Reveal } from "./Reveal";

export default function PageHero({
  label,
  title,
  intro,
  children,
}: {
  label: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="wrap pb-16 pt-[calc(var(--header-h)+3.5rem)] md:pb-24 md:pt-[calc(var(--header-h)+6rem)]">
      <Reveal>
        <p className="t-label mb-8 text-stone">{label}</p>
      </Reveal>
      <RiseText as="h1" immediate className="t-mega max-w-[14ch]" text={title} />
      {(intro || children) && (
        <Reveal delay={0.4} className="mt-10 grid gap-8 md:mt-16 md:grid-cols-12">
          {intro && <p className="t-lead text-graphite md:col-span-7 lg:col-span-6">{intro}</p>}
          {children && <div className="md:col-span-5 md:col-start-8 lg:col-span-6 lg:col-start-7">{children}</div>}
        </Reveal>
      )}
    </section>
  );
}
