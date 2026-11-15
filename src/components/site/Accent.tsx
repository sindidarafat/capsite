import type { PillarId } from "@/lib/types";

/**
 * CAP colour code for the italic accent words:
 * Content orange → Analytics green → Production purple, repeating word by word.
 */
export const ACCENT_COLORS = ["var(--color-content-text)", "var(--color-analytics-text)", "var(--color-production-text)"];
export const PILLAR_TEXT: Record<PillarId, string> = {
  content: "var(--color-content-text)",
  analytics: "var(--color-analytics-text)",
  production: "var(--color-production-text)",
};

export const accentColor = (i: number) => ACCENT_COLORS[((i % 3) + 3) % 3];

/** Italic serif words, each coloured in CAP order. Pass `color` to use one colour for all. */
export default function Accent({ text, color, start = 0 }: { text: string; color?: string; start?: number }) {
  const words = text.split(/(\s+)/);
  let n = start;
  return (
    <>
      {words.map((w, i) =>
        /^\s+$/.test(w) || !w ? (
          w
        ) : (
          <span key={i} className="em" style={{ color: color ?? accentColor(n++) }}>
            {w}
          </span>
        ),
      )}
    </>
  );
}
