"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Work } from "@/lib/types";
import { isVideo } from "@/lib/mime";
import { PillarDots } from "./Pillar";

/**
 * Work tile. The cover stays still; hovering the card (image or title) plays
 * the work's showcase video. On touch screens, which have no hover, the video
 * plays while the card sits in the middle of the screen.
 */
export default function WorkCard({
  work,
  index,
  aspect = "aspect-[4/3]",
  sizes = "text-[clamp(1.4rem,2.2vw,2.1rem)]",
}: {
  work: Work;
  index?: number;
  aspect?: string;
  sizes?: string;
}) {
  const vid = useRef<HTMLVideoElement>(null);
  const card = useRef<HTMLAnchorElement>(null);
  const [playing, setPlaying] = useState(false);
  const coverIsVideo = isVideo(work.cover);
  // the clip to play: the showcase video, or the cover itself if the cover is a video
  const clip = work.video && isVideo(work.video) ? work.video : coverIsVideo ? work.cover : "";

  const start = () => {
    const v = vid.current;
    if (!v) return;
    v.play().catch(() => {});
  };
  const stop = () => {
    const v = vid.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setPlaying(false);
  };

  // touch screens: play while the card is centred in the viewport
  useEffect(() => {
    if (!clip || window.matchMedia("(hover: hover)").matches) return;
    const el = card.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
      rootMargin: "-35% 0px -35% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [clip]);

  return (
    <Link ref={card} href={`/work/${work.slug}`} className="group block" onMouseEnter={start} onMouseLeave={stop} onFocus={start} onBlur={stop}>
      <div className={`relative overflow-hidden rounded-[1.25rem] bg-sand ${aspect}`}>
        {!coverIsVideo && work.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={work.cover}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.045]"
          />
        )}
        {clip && (
          <video
            ref={vid}
            src={clip}
            muted
            loop
            playsInline
            // hover clips only load when needed, so the homepage showreel gets the bandwidth first
            preload={coverIsVideo ? "metadata" : "none"}
            onPlaying={() => setPlaying(true)}
            aria-hidden
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              playing || coverIsVideo ? "opacity-100" : "opacity-0"
            }`}
          />
        )}

        {clip && (
          <span
            className={`pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-bone/90 px-3 py-1.5 text-xs font-semibold text-ink backdrop-blur transition-opacity duration-500 ${
              playing ? "opacity-0" : "opacity-100"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden>
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
            Video
          </span>
        )}
        <span className="pointer-events-none absolute right-4 top-4 grid h-11 w-11 translate-y-2 place-items-center rounded-full bg-bone text-ink opacity-0 transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
            <path d="M7 17L17 7M8 7h9v9" />
          </svg>
        </span>
      </div>
      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <h3 className={`font-semibold leading-[1.08] tracking-[-0.03em] ${sizes}`}>{work.title}</h3>
          <p className="mt-2 text-[0.95rem] text-stone">
            {[work.title.includes(work.client) ? "" : work.client, work.category].filter(Boolean).join(" · ")}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3 pt-2">
          <PillarDots ids={work.pillars} />
          {typeof index === "number" && <span className="t-label text-mist">{String(index + 1).padStart(2, "0")}</span>}
        </div>
      </div>
    </Link>
  );
}
