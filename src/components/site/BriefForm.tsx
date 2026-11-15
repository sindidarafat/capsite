"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Accent from "./Accent";

const SERVICES = ["Content & strategy", "Campaign", "Video production", "Animation", "Photography", "Analytics & reporting", "Media buying", "Website / web app", "Influencer marketing", "Music & sound"];
const TIMELINES = ["ASAP", "Within a month", "1–3 months", "Just exploring"];

type Form = {
  services: string[];
  budget: string;
  timeline: string;
  message: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  website: string;
};

const EMPTY: Form = { services: [], budget: "", timeline: "", message: "", name: "", email: "", company: "", phone: "", website: "" };
const STEPS = ["What do you need?", "Budget & timing", "Tell us about it", "How do we reach you?"];

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={`pill !py-2.5 !text-[0.95rem] ${active ? "pill-ink" : "pill-line"}`}>
      {children}
    </button>
  );
}

const field =
  "w-full border-b hairline bg-transparent py-4 text-xl font-semibold tracking-tight outline-none transition-colors placeholder:font-normal placeholder:text-mist focus:border-ink md:text-2xl";

export default function BriefForm() {
  const [step, setStep] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((s) => ({ ...s, [k]: v }));

  const canNext = [f.services.length > 0, !!f.budget.trim() && !!f.timeline, f.message.trim().length > 4, !!f.name.trim() && /\S+@\S+\.\S+/.test(f.email)][step];

  async function submit() {
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setStatus("done");
    } catch (e) {
      setError((e as Error).message);
      setStatus("idle");
    }
  }

  if (status === "done") {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-[1.5rem] bg-paper p-10 md:p-16" role="status">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-ink text-xl text-bone">✓</span>
        <h3 className="t-h2 mt-8">
          Got it. <Accent text="Thank you." />
        </h3>
        <p className="mt-4 max-w-md text-graphite">We read every brief. Someone from the team will get back to you within one working day.</p>
      </motion.div>
    );
  }

  return (
    <form
      className="rounded-[1.5rem] bg-paper p-6 sm:p-10 md:p-14"
      onSubmit={(e) => {
        e.preventDefault();
        if (!canNext) return;
        if (step < STEPS.length - 1) setStep(step + 1);
        else submit();
      }}
    >
      <div className="mb-10 flex items-center justify-between gap-6">
        <p className="t-label text-stone">
          Step {step + 1} of {STEPS.length}
        </p>
        <div className="flex flex-1 gap-1.5 md:max-w-xs" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={`h-[3px] flex-1 rounded-full transition-colors duration-500 ${i <= step ? "bg-ink" : "bg-clay"}`} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.fieldset
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="min-h-[19rem]"
        >
          <legend className="t-h2 mb-10">{STEPS[step]}</legend>

          {step === 0 && (
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => (
                <Chip key={s} active={f.services.includes(s)} onClick={() => set("services", f.services.includes(s) ? f.services.filter((x) => x !== s) : [...f.services, s])}>
                  {s}
                </Chip>
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-10">
              <label className="block">
                <span className="t-label text-stone">What&apos;s your budget?</span>
                <input
                  autoFocus
                  value={f.budget}
                  onChange={(e) => set("budget", e.target.value)}
                  className={field}
                  placeholder="Your budget"
                  maxLength={120}
                />
              </label>
              <div>
                <p className="t-label mb-4 text-stone">Timeline</p>
                <div className="flex flex-wrap gap-2">
                  {TIMELINES.map((t) => (
                    <Chip key={t} active={f.timeline === t} onClick={() => set("timeline", t)}>{t}</Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <label className="block">
              <span className="sr-only">Project description</span>
              <textarea
                autoFocus
                rows={6}
                value={f.message}
                onChange={(e) => set("message", e.target.value)}
                placeholder="The brand, the goal, the audience — whatever you know so far."
                className={`${field} resize-none !text-lg leading-relaxed md:!text-xl`}
                maxLength={5000}
              />
            </label>
          )}

          {step === 3 && (
            <div className="grid gap-x-8 gap-y-2 md:grid-cols-2">
              <label className="block">
                <span className="t-label text-stone">Name *</span>
                <input autoFocus required autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} className={field} placeholder="Your name" />
              </label>
              <label className="block">
                <span className="t-label text-stone">Email *</span>
                <input required type="email" autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} className={field} placeholder="you@company.com" />
              </label>
              <label className="block">
                <span className="t-label text-stone">Company</span>
                <input autoComplete="organization" value={f.company} onChange={(e) => set("company", e.target.value)} className={field} placeholder="Optional" />
              </label>
              <label className="block">
                <span className="t-label text-stone">Phone</span>
                <input type="tel" autoComplete="tel" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={field} placeholder="Optional" />
              </label>
              {/* honeypot */}
              <input tabIndex={-1} autoComplete="off" aria-hidden value={f.website} onChange={(e) => set("website", e.target.value)} className="hidden" name="website" />
            </div>
          )}
        </motion.fieldset>
      </AnimatePresence>

      {error && <p className="mt-6 text-sm font-semibold text-[#a4442a]" role="alert">{error}</p>}

      <div className="mt-10 flex items-center justify-between gap-4">
        <button type="button" onClick={() => setStep(step - 1)} disabled={step === 0} className="pill pill-line disabled:invisible">
          ← Back
        </button>
        <button type="submit" disabled={!canNext || status === "sending"} className="pill pill-ink disabled:opacity-40">
          {step < STEPS.length - 1 ? "Next" : status === "sending" ? "Sending…" : "Send brief"} <span aria-hidden>→</span>
        </button>
      </div>
    </form>
  );
}
