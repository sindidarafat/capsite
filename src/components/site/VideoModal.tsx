"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { getLenis } from "./SmoothScroll";

/** Full-screen player with sound and controls. Pass an empty src to close. */
export default function VideoModal({ src, onClose }: { src: string; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!src) return;
    const prev = document.activeElement as HTMLElement | null;
    getLenis()?.stop();
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      getLenis()?.start();
      document.documentElement.style.overflow = "";
      prev?.focus();
    };
  }, [src, onClose]);

  // Rendered into <body> so no page section or the fixed header can sit on top of it.
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {src && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Video player"
          className="fixed inset-0 z-[200] grid place-items-center bg-ink/95 p-4 md:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={onClose}
        >
          <motion.video
            className="max-h-[calc(100svh-7rem)] w-full max-w-7xl rounded-xl bg-black md:max-h-[calc(100svh-5rem)]"
            src={src}
            controls
            autoPlay
            playsInline
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.94, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
          <button
            ref={closeRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="absolute right-4 top-4 z-10 grid h-12 w-12 cursor-pointer place-items-center rounded-full bg-bone text-ink md:right-8 md:top-8"
            aria-label="Close video"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
              <path d="M5 5l14 14M19 5L5 19" />
            </svg>
          </button>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
