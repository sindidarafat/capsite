"use client";
import { useEffect, useRef } from "react";

/**
 * CAP's own background: hairline pill-shaped contours — the outline of the
 * CAP logo — rippling slowly outward from the centre of the screen, echoing
 * the brand's concentric-pill banner. Scrolling nudges the ripple forward.
 * The centre stays clear for reading; rings only gain presence toward the edges.
 * One <canvas>, paused when the tab is hidden, static for reduced motion.
 */

const GAP = 46; // distance between rings (px)
const ASPECT = 337 / 160; // the CAP logo pill
const INK = "27, 26, 23";
// every 9th ring carries a whisper of a CAP colour (muted)
const ACCENTS = ["207, 138, 95", "111, 174, 139", "138, 123, 181"];

export default function BrandRings() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = !reduce;

    function pill(cx: number, cy: number, halfH: number) {
      const halfW = halfH * ASPECT;
      const r = halfH;
      ctx.beginPath();
      ctx.moveTo(cx - halfW + r, cy - halfH);
      ctx.lineTo(cx + halfW - r, cy - halfH);
      ctx.arc(cx + halfW - r, cy, r, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(cx - halfW + r, cy + halfH);
      ctx.arc(cx - halfW + r, cy, r, Math.PI / 2, (3 * Math.PI) / 2);
      ctx.closePath();
    }

    function draw(t: number) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      // how far the rings must reach to leave the screen
      const maxHalfH = Math.hypot(w / ASPECT, h) * 0.75;
      const flow = reduce ? 0 : (t / 1000) * 7 + window.scrollY * 0.08; // px of outward travel
      const offset = flow % GAP;
      const base = Math.floor(flow / GAP);
      const count = Math.ceil(maxHalfH / GAP) + 1;
      // radius where rings start to appear, so the reading area stays calm
      const quiet = Math.min(w, h) * 0.16;

      ctx.lineWidth = 1;
      for (let i = 0; i < count; i++) {
        const halfH = i * GAP + offset;
        if (halfH < 4) continue;
        const reach = halfH / maxHalfH; // 0 centre → 1 edge
        const fadeIn = Math.min(1, Math.max(0, (halfH - quiet) / (quiet * 1.6)));
        const alpha = fadeIn * (0.035 + reach * 0.075);
        if (alpha <= 0.002) continue;
        const ringId = i - base; // stable identity as rings travel outward
        const accent = ((ringId % 9) + 9) % 9 === 0;
        const color = accent ? ACCENTS[(((Math.floor(ringId / 9) % 3) + 3) % 3)] : INK;
        ctx.strokeStyle = `rgba(${color}, ${accent ? Math.min(0.32, alpha * 3.2) : alpha})`;
        pill(cx, cy, halfH);
        ctx.stroke();
      }
    }

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      draw(performance.now());
    };

    const loop = (t: number) => {
      if (!running) return;
      draw(t);
      raf = requestAnimationFrame(loop);
    };
    const onVis = () => {
      running = !document.hidden && !reduce;
      cancelAnimationFrame(raf);
      if (running) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (running) raf = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0" />;
}
