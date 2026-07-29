/* TODO: Replace with real copy before launch */

export const metadata = {
  title: "Contact",
  description: "Get in touch with the HireFlow team.",
};

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">Contact</h1>
      <p className="text-sm text-text-muted mb-10">We&rsquo;d love to hear from you.</p>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-text-heading mb-2">General inquiries</h2>
          <p className="text-sm text-text-body leading-relaxed">
            For general questions, feedback, or partnership inquiries, email us at{" "}
            <a href="mailto:hello@hireflow.example" className="text-brand hover:underline">
              hello@hireflow.example
            </a>
            .
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-heading mb-2">Support</h2>
          <p className="text-sm text-text-body leading-relaxed">
            Need help using HireFlow? Reach out to{" "}
            <a href="mailto:support@hireflow.example" className="text-brand hover:underline">
              support@hireflow.example
            </a>{" "}
            and we&rsquo;ll get back to you as soon as possible.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-heading mb-2">Press & media</h2>
          <p className="text-sm text-text-body leading-relaxed">
            For press inquiries, please contact{" "}
            <a href="mailto:press@hireflow.example" className="text-brand hover:underline">
              press@hireflow.example
            </a>
            .
          </p>
        </div>
      </div>

      <p className="text-xs text-text-muted mt-12 border-t border-border-subtle pt-4">
        This is a placeholder contact page. It must be reviewed and replaced with real contact
        details before any launch.
      </p>
    </div>
  );
}
