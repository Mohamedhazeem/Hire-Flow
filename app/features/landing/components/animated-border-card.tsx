"use client";

import { type ReactNode } from "react";

type AnimatedBorderCardProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedBorderCard({ children, className }: AnimatedBorderCardProps) {
  return (
    <div className={`animated-gradient-border ${className ?? ""}`}>
      {children}
    </div>
  );
}
