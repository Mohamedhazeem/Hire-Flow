import Link from "next/link";
import { ArrowRightIcon, UserPlusIcon } from "lucide-react";
import { getSession } from "@/app/features/auth/libs/auth";

export const metadata = {
  title: "For Employers",
  description: "HireFlow for employers — access top talent and streamline your hiring.",
};

const sections = [
  {
    title: "Access top talent",
    content:
      "HireFlow gives you access to a curated pool of verified professionals. Every candidate has been screened for relevant skills and experience, so you spend less time sorting through noise and more time interviewing great people.",
  },
  {
    title: "Invitation-only recruiter access",
    content:
      "To keep the candidate experience high and spam low, recruiter accounts are currently invitation-only. Reach out and we'll get you set up with full access to search, message, and manage applicants.",
  },
  {
    title: "Streamlined hiring workflow",
    content:
      "From posting a job to sending an offer, HireFlow guides you through every step. Manage applicants, track status changes, and communicate directly — all in one place.",
  },
  {
    title: "Pricing",
    content:
      "We offer flexible plans for teams of every size. See our pricing page for full details on what's included in each tier.",
  },
  {
    title: "Get started",
    content:
      "Ready to hire? Reach out to our team and we'll help you get set up with a recruiter account.",
  },
];

export default async function EmployersPage() {
  const session = await getSession();
  const role = session?.user?.role;
  const showCta = !session || role !== "recruiter";

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20">
      <h1 className="text-3xl sm:text-4xl font-bold text-text-heading mb-2">For Employers</h1>
      <p className="text-sm text-text-muted mb-10">Last updated: July 2026</p>

      <div className="space-y-8">
        {sections.map((s) => (
          <div key={s.title}>
            <h2 className="text-lg font-semibold text-text-heading mb-2">{s.title}</h2>
            <p className="text-sm text-text-body leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>

      {showCta && (
        <div className="mt-12 flex flex-col sm:flex-row items-center gap-4">
          <a
            href="/become-employer"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
          >
            <UserPlusIcon className="size-4" />
            Register as Employer
            <ArrowRightIcon className="size-4" />
          </a>
          <Link
            href="/pricing"
            className="text-sm text-text-muted hover:text-text-heading transition-colors"
          >
            View pricing
          </Link>
        </div>
      )}

      <p className="text-xs text-text-muted mt-12 border-t border-border-subtle pt-4">
        This is a placeholder employers page. It must be reviewed and updated with real copy before
        any launch.
      </p>
    </div>
  );
}
