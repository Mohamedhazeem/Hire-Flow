import { StatsCounter } from "./stats-counter";

const stats = [
  { target: 10000, suffix: "+", label: "Jobs Posted" },
  { target: 5000, suffix: "+", label: "Companies" },
  { target: 50000, suffix: "+", label: "Applicants" },
  { target: 95, suffix: "%", label: "Satisfaction Rate" },
];

export function StatsBanner() {
  return (
    <section className="bg-bg-surface border-y border-border-subtle py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {stats.map((s) => (
            <StatsCounter key={s.label} target={s.target} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>
    </section>
  );
}
