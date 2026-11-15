import type { Metadata } from "next";
import LegalPage from "@/components/site/LegalPage";
import { getSite } from "@/lib/store";

export const metadata: Metadata = { title: "Privacy" };

export default async function PrivacyPage() {
  const site = await getSite();
  return <LegalPage label="Legal" title="Privacy *policy*." items={site.legal.privacy} email={site.company.email} />;
}
