import Link from "next/link";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";

export const metadata = {
  title: "About",
  description: "Learn more about HireFlow and our mission.",
};

const sections = [
  {
    title: "Our mission",
    content:
      "HireFlow exists to make hiring simpler, fairer, and faster for job seekers and employers. We build tools that remove noise, spotlight relevant opportunities, and help teams hire more confidently.",
  },
  {
    title: "What we build",
    content:
      "We create a hiring experience that respects candidates and helps hiring teams stay organized. From rich job listings to direct communication, every interaction is designed to move faster and feel better.",
  },
  {
    title: "Our team",
    content:
      "HireFlow is built by a small team of product thinkers, engineers, and recruiting experts who have lived hiring challenges firsthand. We ship fast, learn from users, and keep the experience human.",
  },
  {
    title: "Reach out",
    content:
      "Have questions or feedback? Connect with us at hello@hireflow.example and we’ll get back to you quickly.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-brand">
              About HireFlow
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">About HireFlow</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                We believe hiring should be fast, fair, and meaningful. Here's how we are building it.
              </p>
            </div>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark"
            >
              Contact us
              <SparklesIcon className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12 space-y-10">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80"
          >
            <h2 className="text-xl font-semibold text-text-heading">{section.title}</h2>
            <p className="mt-4 text-sm text-text-body leading-relaxed">{section.content}</p>
          </div>
        ))}

        <div className="rounded-3xl border border-border-subtle bg-brand/5 p-8 shadow-sm shadow-brand/10 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-text-heading">Want to stay in the loop?</h2>
          <p className="mt-3 text-sm text-text-muted leading-relaxed">
            Follow our launch updates, product improvements, and hiring insights designed to help
            job seekers and employers succeed.
          </p>
          <Link href="/resources" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">
            Explore resources
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
