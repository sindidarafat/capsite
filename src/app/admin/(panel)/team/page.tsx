"use client";
import CollectionEditor from "@/components/admin/CollectionEditor";
import { NEW_MEMBER, TEAM_FIELDS } from "@/components/admin/forms";

export default function TeamAdmin() {
  return (
    <CollectionEditor
      collection="team"
      title="Team"
      sub="Everyone shown on /team and the homepage crew strip. Upload portraits into media/team/."
      fields={TEAM_FIELDS}
      idKey="id"
      titleKey="name"
      thumbKey="photo"
      newItem={NEW_MEMBER}
      meta={(t) => [t.role, t.published ? "" : "Hidden"].filter(Boolean).join(" · ")}
      viewUrl={() => "/team"}
    />
  );
}
