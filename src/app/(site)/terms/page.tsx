import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import { getSite } from "@/lib/store";

export const metadata: Metadata = { title: "Terms" };

export default async function TermsPage() {
  const site = await getSite();
  return <LegalPage label="Legal" title="Terms of *engagement*." items={site.legal.terms} email={site.company.email} />;
}
