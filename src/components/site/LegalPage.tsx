import PageHero from "./PageHero";

export default function LegalPage({ label, title, items, email }: { label: string; title: string; items: { title: string; text: string }[]; email: string }) {
  return (
    <>
      <PageHero label={label} title={title} />
      <section className="wrap pb-28 md:pb-40">
        <div className="md:w-2/3">
          {items.map((it, i) => (
            <div key={it.title} className="grid gap-4 border-t hairline py-10 lg:grid-cols-12">
              <h2 className="t-label text-stone lg:col-span-4">
                <span className="mr-3 text-mist">{String(i + 1).padStart(2, "0")}</span>
                {it.title}
              </h2>
              <p className="t-lead lg:col-span-8">{it.text}</p>
            </div>
          ))}
          <p className="border-t hairline pt-10 text-stone">
            Questions? Write to <a className="link-u font-semibold text-ink" href={`mailto:${email}`}>{email}</a>.
          </p>
        </div>
      </section>
    </>
  );
}
