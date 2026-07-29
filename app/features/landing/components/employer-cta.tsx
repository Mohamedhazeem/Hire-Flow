import Link from "next/link";
import { MailIcon, ArrowRightIcon } from "lucide-react";

export function EmployerCTA() {
  return (
    <section id="for-employers" className="bg-neutral-900 dark:bg-neutral-950 py-16 sm:py-20">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Hiring? Let&rsquo;s talk.</h2>
        <p className="text-sm sm:text-base text-neutral-400 mt-4 max-w-xl mx-auto leading-relaxed">
          HireFlow gives you access to a curated pool of top talent. Recruiter access is currently by invitation only
          &mdash; reach out and we&rsquo;ll get you set up.
        </p>
        <a
          href="/register"
          className="inline-flex items-center gap-2 mt-8 px-8 py-3 text-sm font-semibold text-white bg-brand hover:bg-brand-dark rounded-xl transition-all hover:scale-[1.03] active:scale-[0.97]"
        >
          <MailIcon className="size-4" />
          Recruiter Access
          <ArrowRightIcon className="size-4" />
        </a>
        <p className="text-xs text-neutral-500 mt-4">
          Already a recruiter?{" "}
          <Link href="/login" className="text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}
