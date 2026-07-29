"use client";

import { GlobeIcon, ChevronRightIcon, MapPinIcon } from "lucide-react";
import Image from "next/image";

type CompanyPreviewCardProps = {
  name: string;
  logo: string | null;
  website: string | null;
  description: string | null;
  locations: string[];
};

export function CompanyPreviewCard({
  name,
  logo,
  website,
  description,
  locations,
}: CompanyPreviewCardProps) {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6 transition-colors hover:border-brand/20">
      <div className="flex items-start gap-4">
        <div className="size-12 sm:size-14 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0 text-2xl font-bold">
          {logo ? (
            <Image
              src={logo}
              alt={`${name} logo`}
              width={56}
              height={56}
              className="size-full rounded-xl object-cover border border-white/10"
            />
          ) : (
            initial
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-text-heading truncate">{name}</h3>
          {locations.length > 0 && (
            <p className="text-sm text-text-muted mt-0.5">
              <MapPinIcon className="size-3.5 inline mr-1" />
              {locations.join(", ")}
            </p>
          )}
        </div>
      </div>
      {description && (
        <p className="text-sm text-text-body mt-4 leading-relaxed line-clamp-3">{description}</p>
      )}
      {website && (website.startsWith("https://") || website.startsWith("http://")) && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-brand hover:underline mt-3"
        >
          <GlobeIcon className="size-3.5" /> Visit website <ChevronRightIcon className="size-3.5" />
        </a>
      )}
    </div>
  );
}
