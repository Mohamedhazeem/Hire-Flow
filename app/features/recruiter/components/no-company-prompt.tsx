import Link from "next/link";
import { Building2Icon } from "lucide-react";

/**
 * Prompt shown to a recruiter who has not yet created a company profile.
 *
 * Presentational only — extracted verbatim from the recruiter dashboard page so
 * it can be unit-tested in isolation. Rendering and behavior are unchanged.
 */
export function NoCompanyPrompt() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="size-16 rounded-2xl bg-brand/10 flex items-center justify-center mx-auto mb-4">
          <Building2Icon className="size-8 text-brand" />
        </div>
        <h1 className="text-2xl font-bold text-text-heading mb-2">Welcome to HireFlow</h1>
        <p className="text-text-muted text-sm mb-6">
          You&apos;re almost ready to start hiring. Create your company profile first to manage jobs
          and applications.
        </p>
        <Link
          href="/recruiter/company"
          className="inline-flex items-center justify-center rounded-md bg-brand text-white px-5 py-2.5 text-sm font-medium hover:bg-brand/90 transition-all"
        >
          <Building2Icon className="size-4 mr-2" />
          Create Company Profile
        </Link>
      </div>
    </div>
  );
}
