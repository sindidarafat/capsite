"use client";
import { motion, useInView } from "motion/react";
import { Fragment, useRef, type ReactNode } from "react";
import { accentColor } from "./Accent";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Fades + lifts its children into view once. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  as?: "div" | "li" | "section" | "p" | "span";
}) {
  const M = motion[as];
  return (
    <M
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: EASE, delay }}
    >
      {children}
    </M>
  );
}

type Token = { text: string; italic: boolean; tail: string };

/** "*word*." → italic "word" followed by a plain "." with no gap. */
function tokenize(line: string): Token[] {
  const out: Token[] = [];
  const re = /\*([^*]+)\*([^\s*]*)|(\S+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    if (m[1] !== undefined) {
      // an italic phrase may contain spaces — split it so each word still rises
      const words = m[1].split(/\s+/).filter(Boolean);
      words.forEach((w, i) => out.push({ text: w, italic: true, tail: i === words.length - 1 ? m![2] : "" }));
    } else out.push({ text: m[3], italic: false, tail: "" });
  }
  return out;
}

/**
 * Headline that rises word by word from behind a mask.
 * Wrap words in *asterisks* to set them in the italic serif accent; use \n for line breaks.
 */
export function RiseText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  as = "h2",
  immediate = false,
  accent,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p";
  immediate?: boolean;
  /** one colour for every italic word; by default they cycle through the CAP colours */
  accent?: string;
}) {
  const Tag = as;
  let ai = 0; // italic word counter → CAP colour order
  // Observe the whole headline — the individual words start clipped by their
  // masks, so observing them directly is unreliable.
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const show = immediate || inView;
  let i = 0;
  return (
    <Tag ref={ref} className={className} aria-label={text.replace(/\*/g, "").replace(/\n/g, " ")}>
      {text.split("\n").map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {tokenize(line).map((t, wi, arr) => {
            const d = delay + i++ * stagger;
            return (
              <Fragment key={wi}>
                <span className="inline-block overflow-hidden pb-[0.1em] -mb-[0.1em] align-bottom">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "115%" }}
                    animate={{ y: show ? "0%" : "115%" }}
                    transition={{ duration: 1.15, ease: EASE, delay: d }}
                  >
                    {t.italic ? (
                      <span className="em" style={{ color: accent ?? accentColor(ai++) }}>
                        {t.text}
                        {t.tail}
                      </span>
                    ) : (
                      <>
                        {t.text}
                        {t.tail}
                      </>
                    )}
                  </motion.span>
                </span>
                {wi < arr.length - 1 ? " " : null}
              </Fragment>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
