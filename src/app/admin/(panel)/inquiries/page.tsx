"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/components/admin/api";
import { Button, Card, PageTitle, useToast } from "@/components/admin/ui";
import type { Inquiry } from "@/lib/types";

export default function InquiriesAdmin() {
  const toast = useToast();
  const [items, setItems] = useState<Inquiry[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => setItems((await api<{ inquiries: Inquiry[] }>("/api/admin/inquiries")).inquiries), []);
  useEffect(() => {
    load().catch((e) => toast(e.message, "error"));
  }, [load, toast]);

  async function mark(i: Inquiry, read: boolean) {
    await api("/api/admin/inquiries", { method: "PATCH", json: { id: i.id, read } });
    setItems((s) => s?.map((x) => (x.id === i.id ? { ...x, read } : x)) ?? null);
  }
  async function remove(i: Inquiry) {
    if (!confirm(`Delete the inquiry from ${i.name}?`)) return;
    await api(`/api/admin/inquiries?id=${i.id}`, { method: "DELETE" });
    setItems((s) => s?.filter((x) => x.id !== i.id) ?? null);
  }
  function exportCsv() {
    if (!items?.length) return;
    const cols: (keyof Inquiry)[] = ["createdAt", "name", "email", "company", "phone", "services", "budget", "timeline", "message"];
    const esc = (v: unknown) => `"${String(Array.isArray(v) ? v.join("; ") : v ?? "").replace(/"/g, '""')}"`;
    const csv = [cols.join(","), ...items.map((i) => cols.map((c) => esc(i[c])).join(","))].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `cap-inquiries-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <>
      <PageTitle title="Inquiries" sub="Project briefs sent through the contact form." actions={<Button onClick={exportCsv} disabled={!items?.length}>Export CSV</Button>} />
      {!items ? (
        <p className="text-stone">Loading…</p>
      ) : items.length === 0 ? (
        <Card><p className="text-stone">No inquiries yet.</p></Card>
      ) : (
        <ul className="space-y-2">
          {items.map((i) => (
            <li key={i.id}>
              <Card className="!p-0">
                <button
                  type="button"
                  className="flex w-full items-center gap-4 p-4 text-left"
                  onClick={() => {
                    setOpen(open === i.id ? null : i.id);
                    if (!i.read) mark(i, true);
                  }}
                  aria-expanded={open === i.id}
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${i.read ? "bg-clay" : "bg-content"}`} aria-label={i.read ? "Read" : "Unread"} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {i.name} {i.company && <span className="font-normal text-stone">· {i.company}</span>}
                    </span>
                    <span className="block truncate text-sm text-stone">{i.services.join(", ") || i.message}</span>
                  </span>
                  <span className="shrink-0 text-xs text-stone">{new Date(i.createdAt).toLocaleString("en-GB")}</span>
                </button>
                {open === i.id && (
                  <div className="border-t border-ink/10 p-5">
                    <dl className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ["Email", <a key="e" className="font-semibold underline" href={`mailto:${i.email}`}>{i.email}</a>],
                        ["Phone", i.phone || "—"],
                        ["Budget", i.budget || "—"],
                        ["Timeline", i.timeline || "—"],
                      ].map(([k, v]) => (
                        <div key={String(k)}>
                          <dt className="text-xs font-semibold uppercase tracking-[0.06em] text-stone">{k}</dt>
                          <dd className="mt-1">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {i.services.length > 0 && <p className="mt-4 text-sm"><strong>Needs:</strong> {i.services.join(", ")}</p>}
                    <p className="mt-4 whitespace-pre-wrap rounded-xl bg-bone p-4 leading-relaxed">{i.message}</p>
                    <div className="mt-4 flex gap-2">
                      <a href={`mailto:${i.email}?subject=${encodeURIComponent("Re: your project brief for CAP")}`} className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bone">Reply by email</a>
                      <Button onClick={() => mark(i, false)}>Mark unread</Button>
                      <Button variant="danger" onClick={() => remove(i)}>Delete</Button>
                    </div>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
