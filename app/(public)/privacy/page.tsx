/* TODO: Replace with real legally-reviewed privacy policy before launch */

export const metadata = {
  title: "Privacy Policy",
  description: "HireFlow privacy policy",
};

const sections = [
  {
    title: "Information We Collect",
    content:
      "We collect information you provide when creating an account, submitting job applications, uploading resumes, and communicating with other users. This includes your name, email address, professional history, and any files you upload.",
  },
  {
    title: "How We Use Your Information",
    content:
      "Your information is used to operate the platform, match job seekers with employers, process applications, facilitate messaging between users, and improve our services. We do not sell your personal data to third parties.",
  },
  {
    title: "Data Sharing & Security",
    content:
      "We share your information only as necessary to provide the service: employers see your application materials, and messages are visible to the conversation participants. We implement industry-standard security measures to protect your data.",
  },
  {
    title: "Your Rights",
    content:
      "You may access, update, or delete your account information at any time. You can download your data, close your account, or request removal from our systems by contacting us.",
  },
  {
    title: "Contact",
    content:
      "If you have questions about this policy, please contact us at privacy@hireflow.example.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">Privacy Policy</h1>
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
        This is a placeholder privacy policy. It must be reviewed and replaced with legally-reviewed
        copy before any real launch.
      </p>
    </div>
  );
}
