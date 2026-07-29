/* TODO: Replace with real copy before launch */

export const metadata = {
  title: "About",
  description: "Learn more about HireFlow and our mission.",
};

const sections = [
  {
    title: "Our Mission",
    content:
      "HireFlow exists to make hiring simpler, fairer, and faster for both job seekers and employers. We believe the right tools can transform how people find work and how companies build teams.",
  },
  {
    title: "What We Build",
    content:
      "We build tools that help job seekers discover relevant opportunities, showcase their experience, and connect directly with hiring teams. For employers, we provide a focused platform to find and evaluate candidates without the noise of traditional job boards.",
  },
  {
    title: "Our Team",
    content:
      "HireFlow is built by a small, distributed team with backgrounds in engineering, product design, and recruiting. We've lived the hiring pain on both sides and are fixing it.",
  },
  {
    title: "Contact",
    content:
      "Have questions or feedback? Reach out at hello@hireflow.example — we read every message.",
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">About</h1>
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
        This is a placeholder about page. It must be reviewed and replaced with real company copy
        before any launch.
      </p>
    </div>
  );
}
