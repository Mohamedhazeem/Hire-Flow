import Link from "next/link";
import { HeartIcon, GlobeIcon, MessageCircleIcon, TerminalIcon } from "lucide-react";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Browse Jobs", href: "/jobs" },
      { label: "For Employers", href: "/#for-employers" },
      { label: "Pricing", href: "#" },
      { label: "About", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Career Resources", href: "/resources" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Press", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
  },
];

const socials = [
  { icon: GlobeIcon, label: "LinkedIn", href: "#" },
  { icon: MessageCircleIcon, label: "Twitter", href: "#" },
  { icon: TerminalIcon, label: "GitHub", href: "#" },
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
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
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
