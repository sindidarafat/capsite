import type { ReactNode } from "react";

/** Infinite horizontal ticker. Content is duplicated for a seamless loop. */
export default function Marquee({ children, duration = 40, className = "" }: { children: ReactNode; duration?: number; className?: string }) {
  return (
    <div className={`group relative flex overflow-hidden ${className}`} style={{ ["--marquee-duration" as string]: `${duration}s` }}>
      <div className="flex w-max shrink-0 animate-marquee items-center group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden>{children}</div>
      </div>
    </div>
  );
}
