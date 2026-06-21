"use client";

import { FcGoogle } from "react-icons/fc";
import { useState, useTransition } from "react";
import { socialSignInAction } from "@/app/features/auth/actions/social-signin-action";

const providers = [
  {
    id: "google" as const,
    label: "Continue with Google",
    icon: FcGoogle,
    // Google brand styles
    styles: "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
    iconStyles: "text-white",
  },
];

type SocialProvider = (typeof providers)[number]["id"];

export function SocialSignInButtons({ isVertical }: { isVertical?: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = (provider: SocialProvider) => {
    setError(null);
    startTransition(async () => {
      try {
        await socialSignInAction(provider);
      } catch (err) {
        if (err instanceof Error && err.message.includes("NEXT_REDIRECT")) {
          return;
        }
        setError("Unable to connect with that provider. Please try again.");
      }
    });
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : null}
      <div
        className={`w-full ${isVertical ? "flex flex-col gap-3" : "flex flex-row items-center justify-center gap-3"}`}
      >
        {providers.map(({ id, label, icon: Icon, styles, iconStyles }) => (
          <button
            key={id}
            type="button"
            onClick={() => handleSignIn(id)}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold 
            transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${styles}`}
          >
            <Icon className={`${isVertical ? "size-5" : "size-10"} ${iconStyles}`} />
            {isVertical ? label : ""}
          </button>
        ))}
      </div>
    </div>
  );
}
