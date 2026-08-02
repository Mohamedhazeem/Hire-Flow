import { Suspense } from "react";
import Link from "next/link";
import { ArrowRightIcon, BriefcaseIcon, SparklesIcon, TargetIcon } from "lucide-react";
import { JobListPage } from "@/app/features/jobs/components/job-list-page";
import { JobListSkeleton } from "@/app/features/jobs/components/job-list-skeleton";

export const metadata = {
  title: "Browse Jobs",
  description: "Find your next opportunity with HireFlow.",
};

const features = [
  {
    title: "Curated listings",
    description: "High-quality jobs matched to your skills and career goals.",
    icon: BriefcaseIcon,
  },
  {
    title: "Fast application flow",
    description: "Save your profile, apply in seconds, and track your progress.",
    icon: SparklesIcon,
  },
  {
    title: "Intent-driven search",
    description: "Filter by role, location, skills, and company fit.",
    icon: TargetIcon,
  },
];

export default function JobsPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="relative overflow-hidden border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.14),transparent_22%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_22%)]" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-brand">
              Browse jobs
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">Browse jobs</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                Discover opportunities from high-growth companies and apply with confidence.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-3xl border border-border-subtle bg-bg-surface p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <feature.icon className="size-5" />
                </div>
                <h2 className="mt-5 text-base font-semibold text-text-heading">{feature.title}</h2>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12">
        <div className="rounded-[2rem] border border-border-subtle bg-white/90 p-6 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)]">
          <Suspense fallback={<JobListSkeleton />}>
            <JobListPage />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
