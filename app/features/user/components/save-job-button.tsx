"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { BookmarkIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/app/features/auth/libs/auth-client";
import { useBookmarkedIds, useToggleBookmark } from "../hooks/use-saved-jobs";

type SaveJobButtonProps = {
  jobId: string;
  size?: "sm" | "md";
};

export function SaveJobButton({ jobId, size = "sm" }: SaveJobButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { data: bookmarkedIds = [], isLoading: idsLoading } = useBookmarkedIds(!!session?.user);
  const { mutate: toggle, isPending: toggling } = useToggleBookmark();

  const isBookmarked = bookmarkedIds.includes(jobId);
  const disabled = idsLoading || toggling;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!session?.user) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        router.push(`/login?returnUrl=${returnUrl}`);
        return;
      }

      if (!disabled) {
        toggle(jobId);
      }
    },
    [session, jobId, disabled, toggle, router],
  );

  const sizeClass = size === "md" ? "size-9" : "size-8";
  const iconSize = size === "md" ? "size-5" : "size-4";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={isBookmarked ? "Remove saved job" : "Save job"}
      className={cn(
        "inline-flex items-center justify-center rounded-lg shrink-0 transition-colors",
        sizeClass,
        isBookmarked ? "text-brand hover:text-brand/80" : "text-text-muted hover:text-brand",
        "disabled:opacity-50 disabled:cursor-not-allowed",
      )}
    >
      {toggling ? (
        <Loader2Icon className={cn(iconSize, "animate-spin")} />
      ) : (
        <BookmarkIcon className={iconSize} fill={isBookmarked ? "currentColor" : "none"} />
      )}
    </button>
  );
}
