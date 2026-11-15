"use client";
import { useEffect, useRef } from "react";
import { isVideo } from "@/lib/mime";

/** Renders an image or a muted looping video depending on the file type. */
export default function Media({
  src,
  alt = "",
  className = "",
  poster,
  autoPlay = true,
  priority = false,
}: {
  src: string;
  alt?: string;
  className?: string;
  poster?: string;
  autoPlay?: boolean;
  priority?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  // play only while on screen — saves battery & bandwidth
  useEffect(() => {
    const v = ref.current;
    if (!v || !autoPlay) return;
    const io = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()),
      { threshold: 0.15 },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [autoPlay, src]);

  if (!src) return <div className={`bg-sand ${className}`} aria-hidden />;

  if (isVideo(src)) {
    return (
      <video
        ref={ref}
        className={`object-cover ${className}`}
        src={src}
        poster={poster || undefined}
        muted
        loop
        playsInline
        preload={priority ? "auto" : "metadata"}
        aria-label={alt || undefined}
      />
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className={`object-cover ${className}`} src={src} alt={alt} loading={priority ? "eager" : "lazy"} decoding="async" />;
}
