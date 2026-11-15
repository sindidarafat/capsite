"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { api, slugify } from "./api";
import { FieldsForm, type Field } from "./Fields";
import { Thumb } from "./MediaPicker";
import { Button, Card, PageTitle, inputCls, useToast } from "./ui";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Item = Record<string, any>;

/**
 * Generic list editor: pick an item on the left, edit it on the right,
 * reorder, add, duplicate, delete — then Save publishes everything at once.
 */
export default function CollectionEditor({
  collection,
  title,
  sub,
  fields,
  idKey,
  titleKey,
  newItem,
  thumbKey,
  meta,
  viewUrl,
}: {
  collection: "works" | "team" | "jobs";
  title: string;
  sub: string;
  fields: Field[];
  idKey: string;
  titleKey: string;
  newItem: () => Item;
  thumbKey?: string;
  meta?: (it: Item) => string;
  viewUrl?: (it: Item) => string | null;
}) {
  const toast = useToast();
  const [items, setItems] = useState<Item[] | null>(null);
  const [saved, setSaved] = useState("");
  const [sel, setSel] = useState(0);
  const [q, setQ] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await api<{ data: Item[] }>(`/api/admin/content/${collection}`);
    const sorted = [...data].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setItems(sorted);
    setSaved(JSON.stringify(sorted));
  }, [collection]);

  useEffect(() => {
    load().catch((e) => toast(e.message, "error"));
  }, [load, toast]);

  const dirty = items !== null && JSON.stringify(items) !== saved;

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = useCallback(async () => {
    if (!items) return;
    // auto-fill missing slugs, keep order in sync with list position
    const prepared = items.map((it, i) => ({ ...it, [idKey]: it[idKey] || slugify(String(it[titleKey] ?? "")) || `item-${i + 1}`, order: i }));
    setSaving(true);
    try {
      const { data } = await api<{ data: Item[] }>(`/api/admin/content/${collection}`, { method: "PUT", json: { data: prepared } });
      setItems(data);
      setSaved(JSON.stringify(data));
      toast("Saved — the website is updated.");
    } catch (e) {
      toast((e as Error).message, "error");
    } finally {
      setSaving(false);
    }
  }, [items, idKey, titleKey, collection, toast]);

  // Ctrl/Cmd + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save]);

  const filtered = useMemo(
    () => (items ?? []).map((it, i) => ({ it, i })).filter(({ it }) => JSON.stringify(it).toLowerCase().includes(q.toLowerCase())),
    [items, q],
  );

  if (!items) return <p className="text-stone">Loading…</p>;
  const current = items[sel];

  const update = (v: Item) => setItems(items.map((x, i) => (i === sel ? v : x)));
  const move = (d: number) => {
    const j = sel + d;
    if (j < 0 || j >= items.length) return;
    const n = [...items];
    [n[sel], n[j]] = [n[j], n[sel]];
    setItems(n);
    setSel(j);
  };
  const add = () => {
    setItems([newItem(), ...items]);
    setSel(0);
  };
  const duplicate = () => {
    if (!current) return;
    const copy = { ...structuredClone(current), [idKey]: `${current[idKey]}-copy`, [titleKey]: `${current[titleKey]} (copy)` };
    const n = [...items];
    n.splice(sel + 1, 0, copy);
    setItems(n);
    setSel(sel + 1);
  };
  const remove = () => {
    if (!current || !confirm(`Delete “${current[titleKey]}”? This takes effect when you press Save.`)) return;
    setItems(items.filter((_, i) => i !== sel));
    setSel(Math.max(0, sel - 1));
  };
  const link = current && viewUrl?.(current);

  return (
    <>
      <PageTitle
        title={title}
        sub={sub}
        actions={
          <>
            {dirty && <span className="rounded-full bg-[#f3e2c9] px-3 py-1 text-xs font-semibold text-[#8a5a1d]">Unsaved changes</span>}
            <Button onClick={() => (dirty && !confirm("Discard your unsaved changes?") ? null : load())} disabled={!dirty}>Discard</Button>
            <Button variant="primary" onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save & publish"}</Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit !p-3 lg:sticky lg:top-6">
          <div className="mb-3 flex gap-2">
            <input className={inputCls} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button variant="primary" onClick={add} className="shrink-0">＋ New</Button>
          </div>
          <ul className="max-h-[65vh] space-y-1 overflow-y-auto">
            {filtered.map(({ it, i }) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setSel(i)}
                  className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition ${i === sel ? "bg-ink text-bone" : "hover:bg-sand"}`}
                >
                  {thumbKey && <Thumb src={it[thumbKey]} className="h-11 w-11 shrink-0 rounded-lg" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{it[titleKey] || "Untitled"}</span>
                    <span className={`block truncate text-xs ${i === sel ? "text-mist" : "text-stone"}`}>{meta?.(it)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 px-2 text-xs text-stone">The order here is the order on the website.</p>
        </Card>

        {current ? (
          <Card>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
              <h2 className="text-xl font-semibold tracking-tight">{current[titleKey] || "Untitled"}</h2>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => move(-1)} disabled={sel === 0}>↑ Up</Button>
                <Button onClick={() => move(1)} disabled={sel === items.length - 1}>↓ Down</Button>
                <Button onClick={duplicate}>Duplicate</Button>
                {link && (
                  <a href={link} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-full border border-ink/15 px-4 py-2 text-sm font-semibold hover:bg-ink hover:text-bone">
                    View ↗
                  </a>
                )}
                <Button variant="danger" onClick={remove}>Delete</Button>
              </div>
            </div>
            <FieldsForm fields={fields} value={current} onChange={update} />
            <div className="mt-8 flex justify-end border-t border-ink/10 pt-5">
              <Button variant="primary" onClick={save} disabled={!dirty || saving}>{saving ? "Saving…" : "Save & publish"}</Button>
            </div>
          </Card>
        ) : (
          <Card><p className="text-stone">Nothing here yet — press “＋ New”.</p></Card>
        )}
      </div>
    </>
  );
}
