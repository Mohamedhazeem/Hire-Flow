"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { QuoteIcon } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Senior Frontend Engineer",
    company: "TechCorp",
    quote:
      "HireFlow made my job search effortless. I found my dream role within two weeks. The application tracking and resume builder are game-changers.",
    avatar: "https://i.pravatar.cc/80?u=sarah",
  },
  {
    name: "Marcus Johnson",
    role: "Engineering Manager",
    company: "StartupInc",
    quote:
      "As a hiring manager, HireFlow streamlined our recruitment pipeline. The quality of candidates and the filtering tools saved us countless hours.",
    avatar: "https://i.pravatar.cc/80?u=marcus",
  },
  {
    name: "Priya Patel",
    role: "Product Designer",
    company: "DesignStudio",
    quote:
      "The platform's UX is incredible. From creating my portfolio to applying with saved resumes, every step felt intuitive and professional.",
    avatar: "https://i.pravatar.cc/80?u=priya",
  },
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInterval = useCallback(() => {
    stopInterval();
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5500);
  }, [stopInterval]);

  useEffect(() => {
    startInterval();
    return stopInterval;
  }, [startInterval, stopInterval]);

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) stopInterval();
      else startInterval();
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stopInterval();
    };
  }, [startInterval, stopInterval]);

  const handleDotClick = (i: number) => {
    stopInterval();
    setCurrent(i);
    startInterval();
  };

  if (testimonials.length === 0) return null;

  const t = testimonials[current];

  return (
    <section className="relative py-12 sm:py-16 overflow-hidden text-slate-950 dark:text-white">
      <div className="relative z-10 mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
        <p className="text-xs uppercase tracking-[0.32em] text-brand-light mb-3">
          Community stories
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white mb-4">
          What professionals love about HireFlow
        </h2>
        <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          Real feedback from candidates and hiring teams who use HireFlow to move faster and stay
          organized.
        </p>

        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_35px_120px_-80px_rgba(15,23,42,0.1)] dark:border-slate-800 dark:bg-slate-900"
          >
            <QuoteIcon className="size-10 text-brand/40 mx-auto mb-6" />
            <blockquote className="text-lg sm:text-xl font-medium leading-relaxed text-slate-900 dark:text-slate-100 italic">
              “{t.quote}”
            </blockquote>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Image
                src={t.avatar}
                alt={t.name}
                width={56}
                height={56}
                className="size-14 rounded-full object-cover"
              />
              <div className="text-center sm:text-left">
                <p className="text-base font-semibold text-slate-950 dark:text-white">{t.name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {t.role} at {t.company}
                </p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex items-center justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleDotClick(i)}
              aria-label={`Go to testimonial ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === current ? "w-8 bg-brand" : "w-2.5 bg-slate-300 dark:bg-slate-600"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
