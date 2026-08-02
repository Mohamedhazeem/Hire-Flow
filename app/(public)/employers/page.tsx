import Link from "next/link";
import {
  ArrowRightIcon,
  Building2Icon,
  ClockIcon,
  ShieldCheckIcon,
  UserPlusIcon,
} from "lucide-react";
import { getSession } from "@/app/features/auth/libs/auth";

export const metadata = {
  title: "For Employers",
  description: "HireFlow for employers — access top talent and streamline your hiring.",
};

const sections = [
  {
    title: "Access top talent",
    content:
      "HireFlow gives you access to a curated pool of verified professionals. Every candidate is surfaced with the right skills and experience so your hiring team spends less time sorting resumes.",
    icon: Building2Icon,
  },
  {
    title: "Protected candidate experience",
    content:
      "We keep candidate outreach clean and respectful with invitation-only recruiter access and built-in communication controls.",
    icon: ShieldCheckIcon,
  },
  {
    title: "Faster hiring workflow",
    content:
      "Post jobs, review applicants, and message candidates in one place. Hiring moves faster with visibility across every stage.",
    icon: ClockIcon,
  },
];

export default async function EmployersPage() {
  const session = await getSession();
  const role = session?.user?.role;
  const showCta = !session || role !== "recruiter";

  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="relative overflow-hidden border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_22%),radial-gradient(circle_at_80%_15%,rgba(16,185,129,0.08),transparent_22%)]" />
        <div className="relative mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">For Employers</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                HireFlow helps employers discover quality candidates and manage hiring with
                confidence.
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-3">
            {sections.map((section) => (
              <div
                key={section.title}
                className="rounded-3xl border border-border-subtle bg-bg-surface p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                  <section.icon className="size-5" />
                </div>
                <h2 className="mt-5 text-lg font-semibold text-text-heading">{section.title}</h2>
                <p className="mt-3 text-sm text-text-muted leading-relaxed">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12">
        <div className="rounded-[2rem] border border-border-subtle bg-white/90 p-8 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950/80 dark:shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)]">
          <div className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
            <div className="space-y-6">
              <p className="text-sm text-text-muted">
                HireFlow makes it easy to post roles, manage applications, and communicate with
                candidates in one polished experience.
              </p>
              <div className="space-y-4">
                <p className="text-base text-text-body leading-relaxed">
                  Get started with a platform built for modern hiring teams. Keep candidate
                  experience high and make every stage of recruiting more transparent and reliable.
                </p>
                <ul className="space-y-3 text-sm text-text-body">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" />
                    Build job listings that attract the right applicants.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" />
                    Review candidate profiles, applications, and messages in one place.
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" />
                    Track hiring progress with clear next steps and status updates.
                  </li>
                </ul>
              </div>
            </div>
            <div className="rounded-[1.75rem] border border-border-subtle bg-bg-surface p-7 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80">
              <p className="text-sm uppercase tracking-[0.32em] text-brand mb-4">Employer toolkit</p>
              <div className="space-y-4 text-sm leading-relaxed text-text-body">
                <p>Post roles with rich descriptions and screening prompts.</p>
                <p>Manage applicants with recruiter-friendly dashboards.</p>
                <p>Message candidates privately from the same platform.</p>
              </div>
              {showCta && (
                <div className="mt-8 space-y-3">
                  <Link
                    href="/become-employer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark"
                  >
                    <UserPlusIcon className="size-4" />
                    Register as employer
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:text-brand-dark"
                  >
                    View pricing
                    <ArrowRightIcon className="size-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
