"use client";

import { motion } from "motion/react";

export function LandingGlow() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-hero-hex-grid opacity-30 dark:opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.08),transparent_28%),radial-gradient(circle_at_50%_75%,rgba(236,72,153,0.1),transparent_28%)]" />
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-160 w-160 rounded-full bg-brand/20 blur-3xl opacity-70 mix-blend-screen dark:bg-brand/30"
        animate={{ y: [0, 12, 0], opacity: [0.8, 0.45, 0.8] }}
        transition={{ duration: 14, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute right-6 top-64 h-112 w-md rounded-full bg-cyan/20 blur-3xl opacity-60 mix-blend-screen dark:bg-cyan/30"
        animate={{ x: [0, -10, 0], opacity: [0.7, 0.35, 0.7] }}
        transition={{ duration: 16, ease: "easeInOut", repeat: Infinity }}
      />
      <motion.div
        className="pointer-events-none absolute left-[12%] bottom-0 h-104 w-104 rounded-full bg-fuchsia/15 blur-3xl opacity-55 mix-blend-screen dark:bg-fuchsia/25"
        animate={{ y: [0, -8, 0], opacity: [0.6, 0.3, 0.6] }}
        transition={{ duration: 18, ease: "easeInOut", repeat: Infinity }}
      />
    </>
  );
}
