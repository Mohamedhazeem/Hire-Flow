"use client";

import Image from "next/image";

type Props = { name: string; image?: string | null; size?: number; className?: string };

export function AvatarFallback({ name, image, size = 36, className = "" }: Props) {
  const initials = name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const dim = `${size}`;
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={size}
        height={size}
        className={`rounded-full object-cover shrink-0 ${className}`}
      />
    );
  }
  return (
    <div
      className={`rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 ${className}`}
      style={{ width: size, height: size, minWidth: dim, minHeight: dim }}
    >
      {initials || "?"}
    </div>
  );
}
