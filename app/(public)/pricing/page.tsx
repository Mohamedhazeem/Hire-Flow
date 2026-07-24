/* TODO: Replace with real copy before launch */

export const metadata = {
  title: "Pricing",
  description: "HireFlow pricing plans for employers and recruiters.",
};

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    features: [
      "Up to 3 active job posts",
      "Basic applicant tracking",
      "Email support",
    ],
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
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">
        Pricing
      </h1>
      <p className="text-sm text-text-muted mb-10">
        Simple, transparent pricing for every stage of your hiring journey.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="rounded-xl border border-border-subtle bg-bg-surface p-6"
          >
            <h3 className="text-lg font-semibold text-text-heading">
              {plan.name}
            </h3>
            <p className="mt-2 text-2xl font-bold text-text-heading">
              {plan.price}
              <span className="text-sm font-normal text-text-muted">
                {plan.period}
              </span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-text-body">
              {plan.features.map((f) => (
                <li key={f}>• {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted mt-12 border-t border-border-subtle pt-4">
        This is placeholder pricing. Actual plans and pricing are subject to
        change before launch.
      </p>
    </div>
  );
}
