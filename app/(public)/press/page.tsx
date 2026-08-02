import Link from "next/link";
import { MegaphoneIcon, NewspaperIcon } from "lucide-react";

export const metadata = {
  title: "Press",
  description: "HireFlow press mentions, news, and media resources.",
};

const mentions = [
  {
    outlet: "TechCrunch",
    title: "HireFlow raises seed to modernize recruiting tech",
    date: "June 2026",
  },
  {
    outlet: "Product Hunt",
    title: "HireFlow launches curated job platform for tech roles",
    date: "May 2026",
  },
  {
    outlet: "Remote Work Digest",
    title: "Why remote-first hiring platforms are the future",
    date: "April 2026",
  },
];

export default function PressPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">Press</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                News, mentions, and media resources from HireFlow.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark"
            >
              Reach our press team
              <MegaphoneIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12 space-y-10">
        <div className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80">
          <h2 className="text-lg font-semibold text-text-heading mb-6">In the news</h2>
          <div className="space-y-4">
            {mentions.map((item) => (
              <div
                key={item.outlet}
                className="rounded-3xl border border-border-subtle bg-white p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80"
              >
                <p className="text-base font-semibold text-text-heading">{item.title}</p>
                <p className="mt-2 text-xs text-text-muted">
                  {item.outlet} · {item.date}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-border-subtle bg-white p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand mb-4">
              <NewspaperIcon className="size-5" />
            </div>
            <h2 className="text-lg font-semibold text-text-heading">Media kit</h2>
            <p className="mt-3 text-sm text-text-body leading-relaxed">
              Logos, brand guidelines, and founder headshots are available on request. Email us for
              access and asset downloads.
            </p>
            <Link
              href="mailto:press@hireflow.example"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
            >
              press@hireflow.example
            </Link>
          </div>

          <div className="rounded-3xl border border-border-subtle bg-brand/5 p-8 shadow-sm shadow-brand/10 dark:border-slate-800">
            <h2 className="text-lg font-semibold text-text-heading">Stay informed</h2>
            <p className="mt-3 text-sm text-text-body leading-relaxed">
              Want the latest HireFlow news? Follow our launch and product updates to stay ahead of
              the next wave of recruiting innovation.
            </p>
            <Link
              href="/resources"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
            >
              Explore resources
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
