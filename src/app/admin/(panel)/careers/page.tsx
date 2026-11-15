"use client";
import CollectionEditor from "@/components/admin/CollectionEditor";
import { JOB_FIELDS, NEW_JOB } from "@/components/admin/forms";

export default function CareersAdmin() {
  return (
    <CollectionEditor
      collection="jobs"
      title="Careers"
      sub="Job posts on /careers. Published jobs close automatically after their deadline."
      fields={JOB_FIELDS}
      idKey="slug"
      titleKey="title"
      newItem={NEW_JOB}
      meta={(j) => [j.status, j.deadline && `until ${j.deadline}`].filter(Boolean).join(" · ")}
      viewUrl={(j) => (j.status !== "draft" && j.slug ? `/careers/${j.slug}` : null)}
    />
  );
}
