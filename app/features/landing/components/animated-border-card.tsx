"use client";

import { useRef, useLayoutEffect, type ReactNode } from "react";

type AnimatedBorderCardProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedBorderCard({ children, className }: AnimatedBorderCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    ref.current?.classList.add("is-animated");
  }, []);

  return (
    <div ref={ref} className={`animated-gradient-border ${className ?? ""}`}>
      {children}
    </div>
  );
}
