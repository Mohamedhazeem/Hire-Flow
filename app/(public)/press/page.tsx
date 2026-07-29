/* TODO: Replace with real copy before launch */

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
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">Press</h1>
      <p className="text-sm text-text-muted mb-10">
        News, mentions, and media resources for HireFlow.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-text-heading mb-2">In the news</h2>
          <div className="space-y-3">
            {mentions.map((m) => (
              <div
                key={m.outlet}
                className="rounded-lg border border-border-subtle bg-bg-surface px-4 py-3"
              >
                <p className="text-sm font-medium text-text-heading">{m.title}</p>
                <p className="text-xs text-text-muted mt-1">
                  {m.outlet} · {m.date}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-heading mb-2">Media kit</h2>
          <p className="text-sm text-text-body leading-relaxed">
            Logos, brand guidelines, and founder headshots are available on request. Email{" "}
            <a href="mailto:press@hireflow.example" className="text-brand hover:underline">
              press@hireflow.example
            </a>{" "}
            for access.
          </p>
        </div>
      </div>

      <p className="text-xs text-text-muted mt-12 border-t border-border-subtle pt-4">
        This is a placeholder press page. It must be reviewed and replaced with real press content
        before any launch.
      </p>
    </div>
  );
}
