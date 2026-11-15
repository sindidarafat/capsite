"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { FieldsForm, type Field } from "./Fields";
import { Button, Card, PageTitle, useToast } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** Editor for a single document (site settings) or a fixed list (services), with tabs. */
export default function DocEditor({
  collection,
  title,
  sub,
  tabs,
  viewUrl = "/",
}: {
  collection: "site" | "services";
  title: string;
  sub: string;
  tabs: { id: string; label: string; fields: Field[]; path?: number }[];
  viewUrl?: string;
}) {
  const toast = useToast();
  const [doc, setDoc] = useState<any>(null);
  const [saved, setSaved] = useState("");
  const [tab, setTab] = useState(tabs[0].id);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api<{ data: any }>(`/api/admin/content/${collection}`);
    setDoc(data);
    setSaved(JSON.stringify(data));
  }, [collection]);
  useEffect(() => {
    load().catch((e) => toast(e.message, "error"));
  }, [load, toast]);

  const dirty = doc !== null && JSON.stringify(doc) !== saved;

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const { data } = await api<{ data: any }>(`/api/admin/content/${collection}`, { method: "PUT", json: { data: doc } });
      setDoc(data);
      setSaved(JSON.stringify(data));
      toast("Saved — the website is updated.");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }, [collection, doc, toast]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty) save();
      }
    };
    const warn = (e: BeforeUnloadEvent) => dirty && e.preventDefault();
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", warn);
    };
  }, [dirty, save]);

  if (!doc) return <p className="text-stone">Loading…</p>;
  const current = tabs.find((t) => t.id === tab)!;
  // services: each tab edits one array element; site: each tab edits the whole object
  const value = current.path !== undefined ? doc[current.path] : doc;
  const onChange = (v: any) =>
    setDoc(current.path !== undefined ? doc.map((x: any, i: number) => (i === current.path ? v : x)) : v);

  return (
    <>
      <PageTitle
        title={title}
        sub={sub}
        actions={
          <>
            {dirty && <span className="rounded-full bg-[#f3e2c9] px-3 py-1 text-xs font-semibold text-[#8a5a1d]">Unsaved changes</span>}
            <a href={viewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-bone">View ↗</a>
            <Button onClick={() => (!confirm("Discard your unsaved changes?") ? null : load())} disabled={!dirty}>Discard</Button>
            <Button variant="primary" onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save & publish"}</Button>
          </>
        }
      />
      <div role="tablist" className="mb-6 flex flex-wrap gap-1.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={t.id === tab}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${t.id === tab ? "bg-ink text-bone" : "bg-sand/70 hover:bg-clay"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Card>
        <FieldsForm key={tab} fields={current.fields} value={value} onChange={onChange} />
        <div className="mt-8 flex justify-end border-t border-ink/10 pt-5">
          <Button variant="primary" onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save & publish"}</Button>
        </div>
      </Card>
    </>
  );
}
