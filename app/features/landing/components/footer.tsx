import Link from "next/link";
import { HeartIcon, XIcon } from "lucide-react";
import { env } from "@/utils/env";

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const GitHubIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const columns = [
  {
    title: "Product",
    links: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "For Employers", href: "/employers" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [{ label: "Career Resources", href: "/resources" }],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

const linkedinUrl = env.data?.NEXT_PUBLIC_LINKEDIN_URL;
const twitterUrl = env.data?.NEXT_PUBLIC_TWITTER_URL;
const githubUrl = env.data?.NEXT_PUBLIC_GITHUB_URL;
const contactEmail = env.data?.NEXT_PUBLIC_CONTACT_EMAIL;

const socials = [
  {
    icon: LinkedInIcon,
    label: "LinkedIn",
    href: linkedinUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
  {
    icon: XIcon,
    label: "Twitter",
    href: twitterUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
  {
    icon: GitHubIcon,
    label: "GitHub",
    href: githubUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
];

export function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-200 border-t border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3 underline underline-offset-4">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-400 flex items-center gap-1">
            &copy; {new Date().getFullYear()} HireFlow. Made with
            <HeartIcon className="size-3 fill-red-500 text-red-500" />
            for job seekers by Mohammed Hazeem.
          </p>
          <div className="flex items-center gap-3">
            {socials
              .filter((s) => s.href !== null)
              .map((s) => (
                <a
                  key={s.label}
                  href={s.href!}
                  aria-label={s.label}
                  className="size-8 flex items-center justify-center rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-all"
                >
                  <s.icon className="size-4" />
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
