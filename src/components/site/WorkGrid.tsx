"use client";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { PillarId, Work } from "@/lib/types";
import WorkCard from "./WorkCard";
import { PILLAR_LABEL, PillarDot } from "./Pillar";

const FILTERS: ("all" | PillarId)[] = ["all", "content", "analytics", "production"];

export default function WorkGrid({ works }: { works: Work[] }) {
  const [filter, setFilter] = useState<"all" | PillarId>("all");
  const list = useMemo(() => (filter === "all" ? works : works.filter((w) => w.pillars.includes(filter))), [works, filter]);

  return (
    <>
      <div className="mb-12 flex flex-wrap items-center justify-between gap-4 border-t hairline pt-5 md:mb-16">
        <div role="group" aria-label="Filter work" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`pill !py-2 !text-sm ${filter === f ? "pill-ink" : "pill-line"}`}
            >
              {f !== "all" && <PillarDot id={f} className="!h-1.5 !w-1.5" />}
              {f === "all" ? "All work" : PILLAR_LABEL[f]}
            </button>
          ))}
        </div>
        <p className="t-label text-stone" aria-live="polite">
          {list.length} {list.length === 1 ? "project" : "projects"}
        </p>
      </div>

      <motion.div layout className="grid gap-x-6 gap-y-16 md:grid-cols-2 md:gap-y-24">
        <AnimatePresence mode="popLayout">
          {list.map((w, i) => (
            <motion.div
              layout
              key={w.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.04 }}
              className={i % 2 === 1 ? "md:mt-32" : ""}
            >
              <WorkCard work={w} index={i} aspect="aspect-[4/3]" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
      {list.length === 0 && <p className="py-20 text-center text-stone">Nothing here yet — new work is on the way.</p>}
    </>
  );
}
