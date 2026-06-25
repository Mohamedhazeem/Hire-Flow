"use client";

import { Button } from "@base-ui/react/button";
import { useRouter } from "next/navigation";

export default function BackButton({ path, message }: { path?: string; message: string }) {
  const router = useRouter();
  return (
    <Button
      className="inline-flex items-center justify-center rounded-full bg-button-primary px-4 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-button-primary-text transition hover:bg-button-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 max-w-full"
      onClick={() => (path ? router.push(path) : router.back())}
    >
      <span className="truncate">{message}</span>
    </Button>
  );
}
