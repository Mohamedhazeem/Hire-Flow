import Link from "next/link";
import { HeartIcon, LinkIcon, XIcon, GitBranchIcon } from "lucide-react";
import { env } from "@/utils/env";

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
    icon: LinkIcon,
    label: "LinkedIn",
    href: linkedinUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
  {
    icon: XIcon,
    label: "Twitter",
    href: twitterUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
  {
    icon: GitBranchIcon,
    label: "GitHub",
    href: githubUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
];

export function Footer() {
  return (
    <footer className="bg-neutral-900 dark:bg-neutral-950 text-neutral-300 border-t border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-neutral-800">
          <p className="text-xs text-neutral-500 flex items-center gap-1">
            &copy; {new Date().getFullYear()} HireFlow. Made with
            <HeartIcon className="size-3 fill-red-400 text-red-400" />
            for job seekers.
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
