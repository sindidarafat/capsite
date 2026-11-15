import type { Metadata } from "next";
import PageHero from "@/components/site/PageHero";
import WorkGrid from "@/components/site/WorkGrid";
import { getWorks } from "@/lib/store";

export const metadata: Metadata = {
  title: "Work",
  description: "Selected campaigns, films, launches and public-information work by CAP — strategy, production and delivery.",
};

export default async function WorkPage() {
  const works = await getWorks();
  return (
    <>
      <PageHero
        label="Selected work"
        title="Work that *moves* people."
        intro="Structured breakdowns of selected projects across strategy, production and delivery — the same rigor we bring to every brief, shown through finished work."
      />
      <section className="wrap pb-28 md:pb-44">
        <WorkGrid works={works} />
      </section>
    </>
  );
}
