import { ParticleConfig } from "./particle-types";

export const particles: ParticleConfig[] = [
  {
    id: "brand",
    position: { x: 10, y: 5 },
    duration: 24,
    appearance: {
      variant: "brand",
    },
    animation: {
      x: [0, 400, -150, 600, 50, -250, 0],
      y: [0, -250, 180, 500, -100, 400, 0],
    },
  },

  {
    id: "accent",
    position: { x: 80, y: 90 },
    duration: 18,
    delay: 2.5,
    appearance: {
      variant: "accent",
    },
    animation: {
      x: [0, -550, 250, -350, 450, -100, 0],
      y: [0, 350, -200, -450, 300, 250, 0],
    },
  },

  {
    id: "purple",
    position: { x: 45, y: 30 },
    duration: 22,
    delay: 1.2,
    appearance: {
      variant: "purple",
    },
    animation: {
      x: [0, 300, -400, 500, -150, 200, 0],
      y: [0, -400, 100, -500, 200, -300, 0],
      scale: [1, 0.9, 1.1, 0.95, 1.05, 0.98, 1],
    },
  },

  {
    id: "cyan",
    position: { x: 70, y: 15 },
    duration: 28,
    delay: 3.8,
    appearance: {
      variant: "cyan",
    },
    animation: {
      x: [0, -450, 350, -200, 600, -50, 0],
      y: [0, 300, -350, 250, -100, 500, 0],
      opacity: [0.1, 0.45, 0.25, 0.55, 0.15, 0.4, 0.1],
    },
  },

  {
    id: "pink",
    position: { x: 25, y: 70 },
    duration: 26,
    delay: 5,
    appearance: {
      variant: "pink",
    },
    animation: {
      x: [0, 500, -200, 700, 100, -300, 0],
      y: [0, -300, 200, 600, -100, 500, 0],
    },
  },
];
