"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";

type StatsCounterProps = {
  target: number;
  suffix?: string;
  label: string;
};

export function StatsCounter({ target, suffix = "", label }: StatsCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isInView || hasAnimated.current) return;
    hasAnimated.current = true;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = prefersReduced ? 1 : 1500;
    const start = performance.now();
    let raf: number;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isInView, target]);

  return (
    <div className="text-center">
      <span ref={ref} className="text-3xl sm:text-4xl font-bold text-text-heading tabular-nums">
        {display.toLocaleString()}
        {suffix}
      </span>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}
