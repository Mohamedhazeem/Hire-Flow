/* TODO: Replace with real legally-reviewed terms of service before launch */

export const metadata = {
  title: "Terms of Service",
  description: "HireFlow terms of service",
};

const sections = [
  {
    title: "Acceptance of Terms",
    content:
      "By accessing or using HireFlow, you agree to be bound by these Terms of Service. If you do not agree, you may not use the platform.",
  },
  {
    title: "User Accounts & Responsibilities",
    content:
      "You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate information and keep it up to date.",
  },
  {
    title: "Job Listings & Applications",
    content:
      "Employers are responsible for the accuracy of their job listings. Job seekers apply at their own discretion. HireFlow does not guarantee employment outcomes or the legitimacy of any listing.",
  },
  {
    title: "Prohibited Conduct",
    content:
      "You may not use HireFlow for any unlawful purpose, to harass others, to post fraudulent listings, or to collect user data without authorization. Violations may result in account suspension or termination.",
  },
  {
    title: "Limitation of Liability",
    content:
      'HireFlow is provided "as is" without warranties of any kind. To the maximum extent permitted by law, we are not liable for any damages arising from your use of the platform.',
  },
  {
    title: "Governing Law",
    content:
      "These terms are governed by the laws of the jurisdiction in which HireFlow operates. Any disputes shall be resolved in the courts of that jurisdiction.",
  },
  {
    title: "Contact",
    content: "For questions about these terms, please contact us at legal@hireflow.example.",
  },
];

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">Terms of Service</h1>
      <p className="text-sm text-text-muted mb-10">Last updated: July 2026</p>

      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-semibold text-text-heading mb-2">{s.title}</h2>
            <p className="text-sm text-text-body leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-text-muted mt-12 border-t border-border-subtle pt-4">
        These are placeholder terms of service. They must be reviewed and replaced with legally-reviewed copy before any
        real launch.
      </p>
    </div>
  );
}
