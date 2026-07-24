/* TODO: Replace with real copy before launch */

export const metadata = {
  title: "Careers",
  description: "Join the HireFlow team and help us build the future of hiring.",
};

const openings = [
  {
    role: "Full-stack Engineer",
    location: "Remote",
    type: "Full-time",
  },
  {
    role: "Product Designer",
    location: "Remote",
    type: "Full-time",
  },
  {
    role: "Customer Success Lead",
    location: "Hybrid — NYC",
    type: "Full-time",
  },
];

export default function CareersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">
        Careers
      </h1>
      <p className="text-sm text-text-muted mb-10">
        Help us build the future of hiring.
      </p>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-text-heading mb-2">
            Open roles
          </h2>
          <div className="space-y-3">
            {openings.map((job) => (
              <div
                key={job.role}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-surface px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-heading">
                    {job.role}
                  </p>
                  <p className="text-xs text-text-muted">
                    {job.location} · {job.type}
                  </p>
                </div>
                <span className="text-xs text-brand font-medium">
                  Apply soon
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-text-heading mb-2">
            What we offer
          </h2>
          <p className="text-sm text-text-body leading-relaxed">
            Competitive compensation, flexible hours, remote-first culture, and
            a team that cares about craft and impact. We hire people who ship
            and treat each other well.
          </p>
        </div>
      </div>

      <p className="text-xs text-text-muted mt-12 border-t border-border-subtle pt-4">
        This is a placeholder careers page. It must be reviewed and replaced
        with real job listings and company details before any launch.
      </p>
    </div>
  );
}
