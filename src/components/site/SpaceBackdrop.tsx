"use client";
import { useEffect, useRef } from "react";

type Star = { x: number; y: number; r: number; a: number; tw: number; ph: number; vx: number };
type Shooter = { x: number; y: number; vx: number; vy: number; life: number };

/**
 * Deep-space backdrop for dark panels: a twinkling, slowly drifting starfield,
 * faint nebula glows in the CAP colours, and the odd shooting star.
 * Sits behind the panel's content (absolute, pointer-events: none).
 * Animates only while on screen; still frame for reduced-motion visitors.
 */
export default function SpaceBackdrop({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let shooter: Shooter | null = null;
    let nextShooter = performance.now() + 2500;
    let raf = 0;
    let visible = false;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(420, (w * h) / 2600));
      stars = Array.from({ length: count }, () => {
        const big = Math.random() < 0.06;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: big ? 1.1 + Math.random() * 0.9 : 0.35 + Math.random() * 0.7,
          a: big ? 0.75 + Math.random() * 0.25 : 0.25 + Math.random() * 0.55,
          tw: 0.6 + Math.random() * 1.8,
          ph: Math.random() * Math.PI * 2,
          vx: (big ? 0.012 : 0.004) + Math.random() * 0.008, // far stars drift slower: a little parallax
        };
      });
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, w, h);
      const time = t / 1000;
      for (const s of stars) {
        if (!reduced) {
          s.x += s.vx;
          if (s.x > w + 2) s.x = -2;
        }
        const tw = reduced ? 1 : 0.65 + 0.35 * Math.sin(time * s.tw + s.ph);
        ctx.globalAlpha = s.a * tw;
        ctx.fillStyle = "#fbf8f2";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.1) {
          // soft halo on the brightest stars
          ctx.globalAlpha = s.a * tw * 0.18;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (!reduced) {
        if (!shooter && t > nextShooter) {
          const fromLeft = Math.random() < 0.5;
          shooter = {
            x: fromLeft ? Math.random() * w * 0.5 : w * 0.5 + Math.random() * w * 0.5,
            y: Math.random() * h * 0.4,
            vx: (fromLeft ? 1 : -1) * (7 + Math.random() * 4),
            vy: 2.5 + Math.random() * 2,
            life: 1,
          };
        }
        if (shooter) {
          const s = shooter;
          const tail = 14;
          const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * tail, s.y - s.vy * tail);
          g.addColorStop(0, `rgba(255,250,240,${0.85 * s.life})`);
          g.addColorStop(1, "rgba(255,250,240,0)");
          ctx.globalAlpha = 1;
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * tail, s.y - s.vy * tail);
          ctx.stroke();
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.012;
          if (s.life <= 0 || s.x < -200 || s.x > w + 200 || s.y > h + 200) {
            shooter = null;
            nextShooter = t + 5000 + Math.random() * 7000;
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const loop = (t: number) => {
      draw(t);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    };

    build();
    draw(performance.now());

    const ro = new ResizeObserver(() => {
      build();
      draw(performance.now());
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* deep-space base + faint nebulae in the three CAP colours */}
      <div
        className="absolute inset-0"
        style={{
          background: [
            "radial-gradient(60% 50% at 12% 18%, color-mix(in oklab, var(--color-production-brand) 38%, transparent), transparent 70%)",
            "radial-gradient(45% 40% at 88% 30%, color-mix(in oklab, var(--color-content-brand) 22%, transparent), transparent 70%)",
            "radial-gradient(55% 45% at 70% 95%, color-mix(in oklab, var(--color-analytics-brand) 18%, transparent), transparent 70%)",
            "radial-gradient(120% 90% at 50% 50%, #12111f 0%, #08080f 60%, #040408 100%)",
          ].join(","),
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {/* soft vignette keeps the edges deep and the text readable */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
