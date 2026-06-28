import { motion } from "motion/react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

function hashToFloat(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 1000) / 1000) * 5 - 2.5;
}

function DustParticle({
  initialX = 0,
  initialY = 0,
  colorLight = "bg-brand-light",
  colorDark = "bg-brand-default/15",
  blendLight = "mix-blend-multiply",
  blendDark = "mix-blend-screen",
  size = "w-72 h-72",
  duration = 20,
  delay = 0,
  xPath = [0, 500, -200, 700, 100, -300, 0],
  yPath = [0, -300, 200, 600, -100, 500, 0],
  scalePath = [1, 1.1, 0.9, 1.05, 0.95, 1.08, 1],
  opacityPath = [0.3, 0.7, 0.5, 0.8, 0.4, 0.65, 0.3],
}) {
  const seed = `${initialX}|${initialY}|${colorLight}|${colorDark}|${duration}`;
  const jitter = hashToFloat(seed);
  const finalDuration = duration + jitter;

  return (
    <motion.div
      className={`z-0 hidden sm:block absolute rounded-full ${size} ${colorLight} ${blendLight} filter blur-3xl dark:${colorDark} dark:${blendDark}`}
      style={{ left: `${initialX}%`, top: `${initialY}%` }}
      animate={{
        x: xPath,
        y: yPath,
        scale: scalePath,
        opacity: opacityPath,
      }}
      transition={{
        duration: finalDuration,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
    />
  );
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-page px-4 relative overflow-hidden">
      {/* Dust particles – now with z-0 */}
      <DustParticle
        initialX={10}
        initialY={5}
        colorLight="bg-brand-light"
        colorDark="bg-brand-default/15"
        duration={24}
        delay={0}
        xPath={[0, 400, -150, 600, 50, -250, 0]}
        yPath={[0, -250, 180, 500, -100, 400, 0]}
      />
      <DustParticle
        initialX={80}
        initialY={90}
        colorLight="bg-accent-light"
        colorDark="bg-accent-default/15"
        duration={18}
        delay={2.5}
        xPath={[0, -550, 250, -350, 450, -100, 0]}
        yPath={[0, 350, -200, -450, 300, 250, 0]}
      />
      <DustParticle
        initialX={45}
        initialY={30}
        colorLight="bg-purple-300"
        colorDark="bg-purple-500/15"
        duration={22}
        delay={1.2}
        xPath={[0, 300, -400, 500, -150, 200, 0]}
        yPath={[0, -400, 100, -500, 200, -300, 0]}
        scalePath={[1, 0.9, 1.1, 0.95, 1.05, 0.98, 1]}
      />
      <DustParticle
        initialX={70}
        initialY={15}
        colorLight="bg-cyan-200"
        colorDark="bg-cyan-400/15"
        duration={28}
        delay={3.8}
        xPath={[0, -450, 350, -200, 600, -50, 0]}
        yPath={[0, 300, -350, 250, -100, 500, 0]}
        opacityPath={[0.1, 0.45, 0.25, 0.55, 0.15, 0.4, 0.1]}
      />
      <DustParticle
        initialX={25}
        initialY={70}
        colorLight="bg-pink-200"
        colorDark="bg-pink-400/15"
        duration={26}
        delay={5}
        xPath={[0, 500, -200, 700, 100, -300, 0]}
        yPath={[0, -300, 200, 600, -100, 500, 0]}
      />

      {/* Auth card – now opaque with a higher z-index */}
      <div className="relative w-full max-w-md bg-bg-elevated border border-border/50 rounded-2xl shadow-brand p-6 sm:p-8 space-y-6 z-20 dark:bg-bg-elevated dark:border-border-strong/50 dark:shadow-[0_0_40px_rgba(112,116,219,0.15)]">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-heading">{title}</h1>
          <p className="text-text-muted">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
