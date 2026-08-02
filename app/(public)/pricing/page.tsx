import Link from "next/link";
import { ArrowRightIcon, TagIcon } from "lucide-react";

export const metadata = {
  title: "Pricing",
  description: "HireFlow pricing plans for employers and recruiters.",
};

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    features: ["Up to 3 active job posts", "Basic applicant tracking", "Email support"],
  },
  {
    name: "Growth",
    price: "$99",
    period: "/month",
    features: [
      "Up to 15 active job posts",
      "Advanced filters and analytics",
      "Priority support",
      "Team collaboration",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    features: [
      "Unlimited job posts",
      "Dedicated account manager",
      "Custom integrations",
      "SLA-backed uptime",
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">Pricing</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                Choose a plan that fits your hiring goals and scale with confidence.
              </p>
            </div>
            <div className="inline-flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-brand/20 transition hover:bg-brand-dark"
              >
                Contact sales
                <TagIcon className="size-4" />
              </Link>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-sm text-text-muted">
            Simple, transparent pricing with flexible plans designed for companies that want to hire
            faster without sacrificing candidate experience.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-[1.75rem] border border-border-subtle bg-bg-surface p-6 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80"
            >
              <h3 className="text-lg font-semibold text-text-heading">{plan.name}</h3>
              <p className="mt-4 text-3xl font-bold text-text-heading">
                {plan.price}
                <span className="text-base font-medium text-text-muted">{plan.period}</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-text-body">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl border border-border-subtle bg-white/90 p-8 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950/80">
          <p className="text-sm text-text-body leading-relaxed">
            Need something custom? We offer flexible enterprise plans for teams that need more
            capacity, dedicated support, or bespoke integrations.
          </p>
          <Link
            href="/contact"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            Contact our team
            <ArrowRightIcon className="size-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
