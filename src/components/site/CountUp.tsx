"use client";
import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

export default function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const decimals = Number.isInteger(value) ? 0 : 1;
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) return void setN(value);
    const c = animate(0, value, { duration: 2.2, ease: [0.16, 1, 0.3, 1], onUpdate: setN });
    return () => c.stop();
  }, [inView, value, reduce]);

  return (
    <span ref={ref} className="tabular-nums">
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}
