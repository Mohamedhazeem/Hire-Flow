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

  const startInterval = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

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
    <section className="py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80')]" />
      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <QuoteIcon className="size-8 text-brand/30 mx-auto mb-4" />
        <h2 className="text-2xl sm:text-3xl font-bold text-text-heading mb-8">
          What Our Users Say
        </h2>

        {testimonials.length > 1 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              <blockquote className="text-base sm:text-lg text-text-body leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Image
                  src={t.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full object-cover"
                />
                <div className="text-left">
                  <p className="text-sm font-semibold text-text-heading">{t.name}</p>
                  <p className="text-xs text-text-muted">
                    {t.role} at {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div>
            <blockquote className="text-base sm:text-lg text-text-body leading-relaxed italic">
              &ldquo;{testimonials[0].quote}&rdquo;
            </blockquote>
            <div className="flex items-center justify-center gap-3 mt-6">
              <Image
                src={testimonials[0].avatar}
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
              <div className="text-left">
                <p className="text-sm font-semibold text-text-heading">{testimonials[0].name}</p>
                <p className="text-xs text-text-muted">
                  {testimonials[0].role} at {testimonials[0].company}
                </p>
              </div>
            </div>
          </div>
        )}

        {testimonials.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleDotClick(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`size-2 rounded-full transition-all ${
                  i === current ? "bg-brand w-6" : "bg-border-subtle hover:bg-text-muted"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
