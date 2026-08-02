export const metadata = {
  title: "Terms of Service",
  description: "HireFlow terms of service",
};

const sections = [
  {
    title: "Acceptance of terms",
    content:
      "By accessing or using HireFlow, you agree to follow these Terms of Service. If you do not agree, please do not use the platform.",
  },
  {
    title: "User accounts & responsibilities",
    content:
      "You are responsible for keeping your login credentials secure and for all activity on your account. Provide accurate information and update it as needed.",
  },
  {
    title: "Job listings & applications",
    content:
      "Employers are responsible for the accuracy of their job listings. Job seekers apply at their own discretion. HireFlow does not guarantee any hiring outcome.",
  },
  {
    title: "Prohibited conduct",
    content:
      "Do not use HireFlow for unlawful activity, harassment, fraud, or unauthorized data collection. Violations may result in account suspension or termination.",
  },
  {
    title: "Limitation of liability",
    content:
      "HireFlow is provided as-is without warranties. To the maximum extent permitted by law, we are not liable for damages resulting from your use of the platform.",
  },
  {
    title: "Governing law",
    content:
      "These terms are governed by the laws of the jurisdiction where HireFlow operates. Disputes will be resolved in the applicable courts.",
  },
  {
    title: "Contact",
    content: "For questions about these terms, email legal@hireflow.example.",
  },
];

export default function TermsPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">Terms of Service</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                Review HireFlow’s terms, responsibilities, and the rules for using our service.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12 space-y-8">
        {sections.map((section) => (
          <div
            key={section.title}
            className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80"
          >
            <h2 className="text-lg font-semibold text-text-heading mb-3">{section.title}</h2>
            <p className="text-sm text-text-body leading-relaxed">{section.content}</p>
          </div>
        ))}
      </main>
    </div>
  );
}
