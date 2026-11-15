"use client";
import DocEditor from "@/components/admin/DocEditor";
import { SERVICE_FIELDS } from "@/components/admin/forms";

export default function ServicesAdmin() {
  return (
    <DocEditor
      collection="services"
      title="Services"
      sub="The three service lines and everything listed under each one on /services."
      viewUrl="/services"
      tabs={[
        { id: "content", label: "Content", fields: SERVICE_FIELDS, path: 0 },
        { id: "analytics", label: "Analytics", fields: SERVICE_FIELDS, path: 1 },
        { id: "production", label: "Production", fields: SERVICE_FIELDS, path: 2 },
      ]}
    />
  );
}
