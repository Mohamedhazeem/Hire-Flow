import { ShieldCheckIcon } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description: "HireFlow privacy policy",
};

const sections = [
  {
    title: "Information we collect",
    content:
      "We collect the information you provide when creating an account, submitting applications, uploading resumes, and communicating with employers. This includes your name, email, work history, and other profile details.",
  },
  {
    title: "How we use your information",
    content:
      "Your information helps us run the platform, match you with relevant jobs, process applications, and enable communication. We do not sell your personal data to third parties.",
  },
  {
    title: "Data sharing & security",
    content:
      "We share data only as required to operate the service, such as showing employers your application materials. We protect your data with industry-standard security practices.",
  },
  {
    title: "Your rights",
    content:
      "You can access, update, or delete your account information at any time. Contact us if you need support with your data or account.",
  },
  {
    title: "Contact",
    content: "For privacy questions, email privacy@hireflow.example.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">Privacy Policy</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                Learn how HireFlow collects, uses, and protects your information.
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
