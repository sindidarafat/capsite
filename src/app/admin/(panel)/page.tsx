import Link from "next/link";
import { getSession } from "@/lib/auth";
import { getCollection, getInquiries } from "@/lib/store";
import { isOpen } from "@/lib/jobs";

export default async function Dashboard() {
  const [session, works, team, jobs, inquiries] = await Promise.all([
    getSession(),
    getCollection("works"),
    getCollection("team"),
    getCollection("jobs"),
    getInquiries(),
  ]);
  const unread = inquiries.filter((i) => !i.read).length;

  const tiles = [
    { href: "/admin/works", label: "Showcase works", value: works.filter((w) => w.published).length, note: `${works.filter((w) => !w.published).length} hidden` },
    { href: "/admin/team", label: "Team members", value: team.filter((t) => t.published).length, note: "on the website" },
    { href: "/admin/careers", label: "Open jobs", value: jobs.filter((j) => isOpen(j)).length, note: `${jobs.length} total` },
    { href: "/admin/inquiries", label: "New inquiries", value: unread, note: `${inquiries.length} total` },
  ];

  return (
    <>
      <h1 className="text-3xl font-semibold tracking-[-0.035em] md:text-4xl">Hello, {session?.name?.split(" ")[0] || "there"}.</h1>
      <p className="mt-1.5 text-sm text-stone">Everything you change here goes live on the website as soon as you press Save.</p>

      <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href} className="rounded-2xl border border-ink/10 bg-paper/70 p-5 transition hover:border-ink/30">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone">{t.label}</p>
            <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">{t.value}</p>
            <p className="mt-1 text-xs text-stone">{t.note}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-ink/10 bg-paper/70 p-6">
          <h2 className="text-lg font-semibold tracking-tight">Quick actions</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              ["/admin/works", "Add a new showcase work"],
              ["/admin/team", "Add a team member"],
              ["/admin/careers", "Post a job"],
              ["/admin/media", "Upload videos & images"],
              ["/admin/site", "Edit homepage text"],
              ["/admin/site", "Update contact details"],
            ].map(([href, label]) => (
              <li key={label}>
                <Link href={href} className="block rounded-xl bg-sand/70 px-4 py-3 text-sm font-semibold hover:bg-clay">{label} →</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-ink/10 bg-paper/70 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Latest inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm font-semibold text-stone hover:text-ink">All →</Link>
          </div>
          {inquiries.length === 0 ? (
            <p className="mt-4 text-sm text-stone">No inquiries yet. They arrive here from the contact form.</p>
          ) : (
            <ul className="mt-4 divide-y divide-ink/10">
              {inquiries.slice(0, 5).map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {!i.read && <span className="mr-2 inline-block h-2 w-2 rounded-full bg-content" />}
                      {i.name} {i.company && <span className="font-normal text-stone">· {i.company}</span>}
                    </p>
                    <p className="truncate text-xs text-stone">{i.message}</p>
                  </div>
                  <span className="shrink-0 text-xs text-stone">{new Date(i.createdAt).toLocaleDateString("en-GB")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-dashed border-ink/20 p-6 text-sm leading-relaxed text-graphite">
        <h2 className="mb-2 text-base font-semibold text-ink">Adding big video files?</h2>
        Upload them in the <Link className="font-semibold underline" href="/admin/media">Media library</Link>, or copy them straight into the
        server&apos;s <code className="rounded bg-sand px-1.5">media/works/&lt;project&gt;/</code> folder. They show up in every file picker right away — no rebuild needed.
      </section>
    </>
  );
}
