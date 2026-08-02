export type ParticleVariant = "brand" | "accent" | "purple" | "cyan" | "pink" | "emerald" | "violet" | "amber" | "rose" | "sky" | "indigo";

export type ParticleAnimation = {
  x: number[];
  y: number[];
  scale?: number[];
  opacity?: number[];
};

export type ParticleAppearance = {
  variant: ParticleVariant;
  size?: string;
};

export type ParticleConfig = {
  id: string;

  position: {
    x: number;
    y: number;
  };

  duration: number;
  delay?: number;

  appearance: ParticleAppearance;

  animation: ParticleAnimation;
};
