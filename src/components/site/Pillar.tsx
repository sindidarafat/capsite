import type { PillarId } from "@/lib/types";

export const PILLAR_COLOR: Record<PillarId, string> = {
  content: "var(--color-content)",
  analytics: "var(--color-analytics)",
  production: "var(--color-production)",
};

export const PILLAR_LABEL: Record<PillarId, string> = {
  content: "Content",
  analytics: "Analytics",
  production: "Production",
};

export function PillarDot({ id, className = "" }: { id: PillarId; className?: string }) {
  return <span className={`dot ${className}`} style={{ background: PILLAR_COLOR[id] }} aria-hidden />;
}

export function PillarDots({ ids }: { ids: PillarId[] }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={ids.map((i) => PILLAR_LABEL[i]).join(", ")}>
      {ids.map((id) => (
        <PillarDot key={id} id={id} className="!h-1.5 !w-1.5" />
      ))}
    </span>
  );
}

/** Full-strength CAP brand colours (Content orange, Analytics green, Production purple). */
export const PILLAR_BRAND: Record<PillarId, string> = {
  content: "var(--color-content-brand)",
  analytics: "var(--color-analytics-brand)",
  production: "var(--color-production-brand)",
};
