"use client";
import CollectionEditor from "@/components/admin/CollectionEditor";
import { NEW_WORK, WORK_FIELDS } from "@/components/admin/forms";

export default function WorksAdmin() {
  return (
    <CollectionEditor
      collection="works"
      title="Showcase works"
      sub="Case studies shown on the homepage and /work. Drop new project videos into media/works/<slug>/ or upload them from the cover / video fields."
      fields={WORK_FIELDS}
      idKey="slug"
      titleKey="title"
      thumbKey="cover"
      newItem={NEW_WORK}
      meta={(w) => [w.published ? "Live" : "Hidden", w.featured ? "Featured" : "", w.client].filter(Boolean).join(" · ")}
      viewUrl={(w) => (w.published && w.slug ? `/work/${w.slug}` : null)}
    />
  );
}
