"use client";

import { DustParticle } from "@/app/features/particles/dust-particle";
import { landingParticles } from "./landing-particles";

export function LandingGlow() {
  return (
    <div className="absolute inset-0 z-0">
      <div className="pointer-events-none absolute inset-0 bg-hero-hex-grid opacity-30 dark:opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.14),transparent_28%),radial-gradient(circle_at_50%_75%,rgba(236,72,153,0.16),transparent_28%)]" />

      {landingParticles.map((particle) => (
        <DustParticle key={particle.id} particle={particle} />
      ))}
    </div>
  );
}
