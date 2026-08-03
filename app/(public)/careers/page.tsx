import Link from "next/link";
import { ArrowRightIcon, BriefcaseIcon, SparklesIcon, UsersIcon } from "lucide-react";

export const metadata = {
  title: "Careers",
  description: "Join the HireFlow team and help us build the future of hiring.",
};

const openings = [
  {
    role: "Full-stack Engineer",
    location: "Remote",
    type: "Full-time",
  },
  {
    role: "Product Designer",
    location: "Remote",
    type: "Full-time",
  },
  {
    role: "Customer Success Lead",
    location: "Hybrid — NYC",
    type: "Full-time",
  },
];

const benefits = [
  "Competitive pay and remote-friendly culture.",
  "Flexible hours with team collaboration built in.",
  "A small team that values craftsmanship and real impact.",
];

export default function CareersPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">Careers</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                Help us build the future of hiring with a team that ships fast and cares deeply
                about product and people.
              </p>
            </div>
            <div>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark"
              >
                Apply now
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12 space-y-10">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80">
            <h2 className="text-lg font-semibold text-text-heading mb-5">Open roles</h2>
            <div className="space-y-4">
              {openings.map((job) => (
                <div
                  key={job.role}
                  className="rounded-3xl border border-border-subtle bg-white p-5 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div>
                      <p className="text-base font-semibold text-text-heading">{job.role}</p>
                      <p className="text-sm text-text-muted mt-1">
                        {job.location} · {job.type}
                      </p>
                    </div>
                    <span className="self-start sm:self-center rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                      Apply soon
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-border-subtle bg-linear-to-r from-brand/5 to-transparent p-8 shadow-sm shadow-brand/10 dark:border-slate-800">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-6">
              <UsersIcon className="size-5" />
            </div>
            <h2 className="text-lg font-semibold text-text-heading mb-4">Why join HireFlow?</h2>
            <div className="space-y-4 text-sm text-text-body leading-relaxed">
              {benefits.map((benefit) => (
                <p key={benefit}>{benefit}</p>
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark"
              >
                Talk to us
                <SparklesIcon className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80">
          <h2 className="text-lg font-semibold text-text-heading mb-4">What we offer</h2>
          <ul className="space-y-3 text-sm text-text-body leading-relaxed">
            {benefits.map((offer) => (
              <li key={offer} className="flex gap-3">
                <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" />
                {offer}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
