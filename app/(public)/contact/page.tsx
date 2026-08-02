import Link from "next/link";
import { MailIcon, MessageSquareIcon, ZapIcon } from "lucide-react";

export const metadata = {
  title: "Contact",
  description: "Get in touch with the HireFlow team.",
};

const contacts = [
  {
    title: "General inquiries",
    description:
      "Questions about the platform, partnerships, or product feedback? Drop us a message.",
    contact: "hello@hireflow.example",
    icon: MailIcon,
  },
  {
    title: "Support",
    description:
      "Need help with your account, applications, or hiring flow? Our team is ready to assist.",
    contact: "support@hireflow.example",
    icon: MessageSquareIcon,
  },
  {
    title: "Press & media",
    description: "Looking for brand assets or press information? Our media team is available.",
    contact: "press@hireflow.example",
    icon: ZapIcon,
  },
];

export default function ContactPage() {
  return (
    <div className="bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-border-subtle bg-white/80 dark:bg-slate-950/80">
        <div className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-text-heading">Contact</h1>
              <p className="mt-4 text-base text-text-muted leading-relaxed">
                We’d love to hear from you. Reach out for support, press inquiries, or employer
                partnerships.
              </p>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 md:px-6 lg:px-8 py-12">
        <div className="grid gap-6 md:grid-cols-3">
          {contacts.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-border-subtle bg-bg-surface p-8 shadow-sm shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-950/80"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <item.icon className="size-5" />
              </div>
              <h2 className="mt-6 text-lg font-semibold text-text-heading">{item.title}</h2>
              <p className="mt-3 text-sm text-text-body leading-relaxed">{item.description}</p>
              <a
                href={`mailto:${item.contact}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
              >
                {item.contact}
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
