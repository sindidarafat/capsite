"use client";
import { useState } from "react";
import { MediaInput, Thumb, type Accept } from "./MediaPicker";
import { Button, Modal, inputCls } from "./ui";
import { MediaLibrary } from "./MediaPicker";
import { slugify } from "./api";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Obj = Record<string, any>;

export type Field =
  | { key: string; label: string; type: "text" | "textarea" | "email" | "url" | "date"; help?: string; placeholder?: string; rows?: number; wide?: boolean }
  | { key: string; label: string; type: "number"; help?: string; step?: number }
  | { key: string; label: string; type: "toggle"; help?: string }
  | { key: string; label: string; type: "slug"; from: string; help?: string }
  | { key: string; label: string; type: "select"; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: "multiselect"; options: { value: string; label: string }[]; help?: string }
  | { key: string; label: string; type: "media"; accept?: Accept; folder?: (item: Obj) => string; help?: string; wide?: boolean }
  | { key: string; label: string; type: "gallery"; folder?: (item: Obj) => string; help?: string }
  | { key: string; label: string; type: "strings"; help?: string; placeholder?: string }
  | { key: string; label: string; type: "group"; fields: Field[]; help?: string }
  | { key: string; label: string; type: "list"; fields: Field[]; itemLabel?: (it: Obj, i: number) => string; help?: string; newItem?: () => Obj };

const isWide = (f: Field) =>
  ["textarea", "strings", "group", "list", "gallery", "multiselect"].includes(f.type) || ("wide" in f && f.wide);

function Label({ f, htmlFor }: { f: Field; htmlFor?: string }) {
  return (
    <div className="mb-1.5">
      <label htmlFor={htmlFor} className="text-[0.8rem] font-semibold uppercase tracking-[0.06em] text-graphite">{f.label}</label>
      {f.help && <p className="text-xs text-stone">{f.help}</p>}
    </div>
  );
}

function StringList({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const list = value ?? [];
  const set = (i: number, v: string) => onChange(list.map((x, j) => (j === i ? v : x)));
  const move = (i: number, d: number) => {
    const n = [...list];
    const [it] = n.splice(i, 1);
    n.splice(i + d, 0, it);
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {list.map((s, i) => (
        <div key={i} className="flex gap-2">
          <textarea rows={1} className={`${inputCls} min-h-[2.75rem] resize-y`} value={s} placeholder={placeholder} onChange={(e) => set(i, e.target.value)} />
          <div className="flex shrink-0 gap-1">
            <Button className="!px-2.5" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</Button>
            <Button className="!px-2.5" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</Button>
            <Button variant="danger" className="!px-2.5" onClick={() => onChange(list.filter((_, j) => j !== i))} aria-label="Remove">✕</Button>
          </div>
        </div>
      ))}
      <Button variant="soft" onClick={() => onChange([...list, ""])}>＋ Add line</Button>
    </div>
  );
}

function Gallery({ value, onChange, folder }: { value: string[]; onChange: (v: string[]) => void; folder?: string }) {
  const [open, setOpen] = useState(false);
  const list = value ?? [];
  return (
    <div>
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {list.map((src, i) => (
          <li key={src + i} className="group relative aspect-square overflow-hidden rounded-lg border border-ink/10">
            <Thumb src={src} className="absolute inset-0 h-full w-full" />
            <div className="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition group-hover:opacity-100">
              <Button variant="soft" className="!px-2 !py-0.5 !text-xs" disabled={i === 0} onClick={() => { const n = [...list]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; onChange(n); }}>←</Button>
              <Button variant="danger" className="!bg-white !px-2 !py-0.5 !text-xs" onClick={() => onChange(list.filter((_, j) => j !== i))}>✕</Button>
            </div>
          </li>
        ))}
        <li>
          <button type="button" onClick={() => setOpen(true)} className="grid aspect-square w-full place-items-center rounded-lg border border-dashed border-ink/25 text-sm font-semibold text-stone hover:bg-sand">
            ＋ Add
          </button>
        </li>
      </ul>
      <Modal open={open} onClose={() => setOpen(false)} title="Add to gallery" wide>
        <MediaLibrary accept="any" folder={folder} pickLabel="Add" onPick={(f) => onChange([...list, f.url])} />
      </Modal>
    </div>
  );
}

function ObjList({ field, value, onChange, root }: { field: Extract<Field, { type: "list" }>; value: Obj[]; onChange: (v: Obj[]) => void; root: Obj }) {
  const list = value ?? [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const blank = () => field.newItem?.() ?? Object.fromEntries(field.fields.map((f) => [f.key, f.type === "strings" || f.type === "list" || f.type === "gallery" || f.type === "multiselect" ? [] : f.type === "toggle" ? false : f.type === "number" ? 0 : ""]));
  const move = (i: number, d: number) => {
    const n = [...list];
    const [it] = n.splice(i, 1);
    n.splice(i + d, 0, it);
    onChange(n);
  };
  return (
    <div className="space-y-2">
      {list.map((it, i) => {
        const label = field.itemLabel?.(it, i) || it.title || it.name || it.label || it.q || `Item ${i + 1}`;
        const open = openIdx === i;
        return (
          <div key={i} className="rounded-xl border border-ink/10 bg-bone/60">
            <div className="flex items-center gap-2 p-2 pl-4">
              <button type="button" className="min-w-0 flex-1 truncate text-left text-sm font-semibold" onClick={() => setOpenIdx(open ? null : i)} aria-expanded={open}>
                <span className="mr-2 text-mist">{open ? "▾" : "▸"}</span>
                {label}
              </button>
              <Button className="!px-2.5 !py-1" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">↑</Button>
              <Button className="!px-2.5 !py-1" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label="Move down">↓</Button>
              <Button variant="danger" className="!px-2.5 !py-1" onClick={() => confirm(`Remove “${label}”?`) && onChange(list.filter((_, j) => j !== i))} aria-label="Remove">✕</Button>
            </div>
            {open && (
              <div className="border-t border-ink/10 p-4">
                <FieldsForm fields={field.fields} value={it} root={root} onChange={(v) => onChange(list.map((x, j) => (j === i ? v : x)))} />
              </div>
            )}
          </div>
        );
      })}
      <Button
        variant="soft"
        onClick={() => {
          onChange([...list, blank()]);
          setOpenIdx(list.length);
        }}
      >
        ＋ Add {field.label.replace(/s$/, "").toLowerCase()}
      </Button>
    </div>
  );
}

export function FieldsForm({ fields, value, onChange, root }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void; root?: Obj }) {
  const r = root ?? value;
  const set = (k: string, v: unknown) => onChange({ ...value, [k]: v });

  return (
    <div className="grid gap-x-5 gap-y-5 md:grid-cols-2">
      {fields.map((f) => {
        const id = `f-${f.key}-${Math.abs(hash(JSON.stringify(f.label)))}`;
        const v = value?.[f.key];
        let control: React.ReactNode;
        switch (f.type) {
          case "text":
          case "email":
          case "url":
          case "date":
            control = <input id={id} type={f.type} className={inputCls} value={v ?? ""} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />;
            break;
          case "textarea":
            control = <textarea id={id} rows={f.rows ?? 4} className={`${inputCls} resize-y leading-relaxed`} value={v ?? ""} placeholder={f.placeholder} onChange={(e) => set(f.key, e.target.value)} />;
            break;
          case "number":
            control = <input id={id} type="number" step={f.step ?? "any"} className={inputCls} value={v ?? 0} onChange={(e) => set(f.key, e.target.value === "" ? 0 : Number(e.target.value))} />;
            break;
          case "toggle":
            control = (
              <button
                id={id}
                type="button"
                role="switch"
                aria-checked={!!v}
                onClick={() => set(f.key, !v)}
                className={`relative h-7 w-12 rounded-full transition ${v ? "bg-ink" : "bg-clay"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-bone transition-all ${v ? "left-6" : "left-1"}`} />
              </button>
            );
            break;
          case "slug":
            control = (
              <div className="flex gap-2">
                <input id={id} className={inputCls} value={v ?? ""} onChange={(e) => set(f.key, slugify(e.target.value))} />
                <Button variant="soft" onClick={() => set(f.key, slugify(String(value?.[f.from] ?? "")))}>From {f.from}</Button>
              </div>
            );
            break;
          case "select":
            control = (
              <select id={id} className={inputCls} value={v ?? ""} onChange={(e) => set(f.key, e.target.value)}>
                {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            );
            break;
          case "multiselect":
            control = (
              <div className="flex flex-wrap gap-2">
                {f.options.map((o) => {
                  const on = (v ?? []).includes(o.value);
                  return (
                    <button
                      key={o.value}
                      type="button"
                      aria-pressed={on}
                      onClick={() => set(f.key, on ? (v as string[]).filter((x) => x !== o.value) : [...(v ?? []), o.value])}
                      className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition ${on ? "bg-ink text-bone" : "border border-ink/15 hover:bg-sand"}`}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            );
            break;
          case "media":
            control = <MediaInput value={v ?? ""} onChange={(x) => set(f.key, x)} accept={f.accept} folder={f.folder?.(r)} />;
            break;
          case "gallery":
            control = <Gallery value={v ?? []} onChange={(x) => set(f.key, x)} folder={f.folder?.(r)} />;
            break;
          case "strings":
            control = <StringList value={v ?? []} onChange={(x) => set(f.key, x)} placeholder={f.placeholder} />;
            break;
          case "group":
            control = (
              <div className="rounded-xl border border-ink/10 p-4">
                <FieldsForm fields={f.fields} value={v ?? {}} root={r} onChange={(x) => set(f.key, x)} />
              </div>
            );
            break;
          case "list":
            control = <ObjList field={f} value={v ?? []} root={r} onChange={(x) => set(f.key, x)} />;
            break;
        }
        return (
          <div key={f.key} className={isWide(f) ? "md:col-span-2" : ""}>
            <Label f={f} htmlFor={id} />
            {control}
          </div>
        );
      })}
    </div>
  );
}

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
