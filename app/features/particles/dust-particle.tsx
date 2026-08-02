import { motion } from "motion/react";
import { cn } from "@/lib/utils";

import { ParticleConfig } from "./particle-types";
import { createDurationJitter } from "./hash";
import { particleVariants } from "./particle-varient";

type Props = {
  particle: ParticleConfig;
};

export function DustParticle({ particle }: Props) {
  const seed = particle.position.x + "|" + particle.position.y + "|" + particle.appearance.variant;

  return (
    <motion.div
      className={cn(
        "absolute hidden sm:block rounded-full blur-3xl -z-10",
        particle.appearance.size ?? "w-72 h-72",
        particleVariants[particle.appearance.variant],
      )}
      style={{
        left: `${particle.position.x}%`,
        top: `${particle.position.y}%`,
      }}
      animate={{
        x: particle.animation.x,
        y: particle.animation.y,
        scale: particle.animation.scale ?? [1, 1.1, 0.9, 1.05, 0.95, 1.08, 1],
        opacity: particle.animation.opacity ?? [0.3, 0.7, 0.5, 0.8, 0.4, 0.65, 0.3],
      }}
      initial={{ opacity: 0 }}
      transition={{
        repeat: Infinity,
        ease: "linear",
        delay: particle.delay ?? 0,
        duration: particle.duration + createDurationJitter(seed),
      }}
    />
  );
}
