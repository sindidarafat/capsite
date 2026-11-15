"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { preload } from "react-dom";
import { motion, useScroll, useTransform } from "motion/react";
import type { Site } from "@/lib/types";
import { RiseText } from "./Reveal";
import { PillarDot } from "./Pillar";
import VideoModal from "./VideoModal";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Homepage opening: full-screen showreel first, then the headline. */
export default function Hero({ hero }: { hero: Site["hero"] }) {
  // The reel is the first media on the page: fetch its poster at top priority so a frame shows instantly.
  if (hero.poster) preload(hero.poster, { as: "image", fetchPriority: "high" });
  const reelRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Make sure the reel starts on landing. The autoplay attribute alone can be skipped
  // (hydration timing, power-saving modes), so start it explicitly once it can play,
  // and as a last resort on the visitor's first touch/scroll/key.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // browsers only autoplay muted video
    const tryPlay = () => {
      if (v.paused) v.play().catch(() => {});
    };
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    const events = ["pointerdown", "touchstart", "scroll", "keydown"] as const;
    const onFirst = () => {
      tryPlay();
      events.forEach((e) => window.removeEventListener(e, onFirst));
    };
    events.forEach((e) => window.addEventListener(e, onFirst, { passive: true }));
    return () => {
      v.removeEventListener("canplay", tryPlay);
      events.forEach((e) => window.removeEventListener(e, onFirst));
    };
  }, [hero.showreel]);
  // as you scroll past, the reel drifts slower than the page and dims slightly
  const { scrollYProgress } = useScroll({ target: reelRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const dim = useTransform(scrollYProgress, [0, 1], [0, 0.45]);

  return (
    <>
      {hero.showreel && (
        <div className="px-[var(--gutter)] pt-[var(--header-h)]">
        <section
          ref={reelRef}
          className="relative mx-auto aspect-video max-w-[calc(1560px-var(--gutter)*2)] overflow-hidden rounded-[1.25rem] bg-ink md:rounded-[1.75rem] lg:aspect-auto lg:h-[calc(100svh-var(--header-h)-var(--gutter)*0.6)] lg:min-h-[460px]"
          aria-label="Showreel"
        >
          <motion.div style={{ y, scale }} className="absolute inset-0">
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              src={hero.showreel}
              poster={hero.poster || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
            />
          </motion.div>
          <motion.div style={{ opacity: dim }} className="absolute inset-0 bg-ink" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t md:h-56 from-ink/55 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 pb-4 text-bone md:gap-6 md:px-12 md:pb-10">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}>
              <p className="t-label flex items-center gap-2 max-sm:!text-[0.62rem] sm:mb-3 sm:gap-3">
                <span className="flex gap-1">
                  <PillarDot id="content" /> <PillarDot id="analytics" /> <PillarDot id="production" />
                </span>
                Showreel — {new Date().getFullYear()}
              </p>
              <p className="hidden text-sm text-bone/70 sm:block">Scroll to explore ↓</p>
            </motion.div>

            <motion.button
              type="button"
              onClick={() => setPlaying(true)}
              className="group flex items-center gap-4"
              aria-label="Play the CAP showreel with sound"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
            >
              <span className="hidden text-sm font-semibold sm:inline">Watch with sound</span>
              <span className="grid h-12 w-12 place-items-center rounded-full bg-bone text-ink sm:h-16 sm:w-16 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-110 md:h-24 md:w-24">
                <svg viewBox="0 0 24 24" className="ml-0.5 h-4 w-4 sm:ml-1 sm:h-5 sm:w-5 md:h-6 md:w-6" fill="currentColor" aria-hidden>
                  <path d="M7 4.5v15l13-7.5z" />
                </svg>
              </span>
            </motion.button>
          </div>
        </section>
        </div>
      )}

      <section className={`relative ${hero.showreel ? "pt-16 md:pt-36" : "pt-[calc(var(--header-h)+3rem)] md:pt-[calc(var(--header-h)+5rem)]"}`}>
        <div className="wrap">
          <p className="t-label mb-8 flex items-center gap-3 text-stone md:mb-10">
            <span className="flex gap-1">
              <PillarDot id="content" /> <PillarDot id="analytics" /> <PillarDot id="production" />
            </span>
            {hero.eyebrow}
          </p>

          <RiseText as="h1" stagger={0.07} className="t-hero" text={`${hero.lineOne} *${hero.emphasis}*\n${hero.lineTwo}`} />

          <motion.div
            className="mt-10 grid gap-8 md:mt-16 md:grid-cols-12 md:items-end"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
          >
            <p className="t-lead text-graphite md:col-span-6 lg:col-span-5">{hero.intro}</p>
            <div className="flex flex-wrap gap-3 md:col-span-6 md:justify-end lg:col-span-7">
              <Link href="/contact" className="pill pill-ink">
                Start a project <span aria-hidden>→</span>
              </Link>
              <Link href="/work" className="pill pill-line">
                See the work <span aria-hidden>↓</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <VideoModal src={playing ? hero.showreel : ""} onClose={() => setPlaying(false)} />
    </>
  );
}
