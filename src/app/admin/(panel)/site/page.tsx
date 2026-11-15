"use client";
import DocEditor from "@/components/admin/DocEditor";
import { SITE_TABS } from "@/components/admin/forms";

export default function SiteAdmin() {
  return (
    <DocEditor
      collection="site"
      title="Site settings"
      sub="Company details, homepage text, about page, FAQ and legal copy."
      tabs={SITE_TABS}
    />
  );
}
