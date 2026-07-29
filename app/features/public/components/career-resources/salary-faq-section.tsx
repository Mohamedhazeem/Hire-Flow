"use client";

import { motion } from "motion/react";
import { DollarSignIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type FAQ = {
  q: string;
  a: string;
};

const faqs: FAQ[] = [
  {
    q: "How do I research fair compensation?",
    a: "Use Glassdoor, Levels.fyi, LinkedIn Salary, and industry-specific surveys. Factor in location, company size, and years of experience.",
  },
  {
    q: "Should I share my current salary?",
    a: "Avoid sharing your current or expected salary first. If pressed, give a range based on market research rather than your current pay.",
  },
  {
    q: "What should I consider beyond base salary?",
    a: "Equity, bonuses, 401k matching, health benefits, remote flexibility, PTO, and professional development budgets all affect total compensation.",
  },
  {
    q: "How do I negotiate professionally?",
    a: 'Be specific, gracious, and data-backed. Say "Based on my research, the market range for this role is X to Y. Given my experience in Z, I am targeting Y."',
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function SalaryFAQSection() {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
            hidden: {},
          }}
        >
          <motion.div variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-heading flex items-center gap-2">
              <DollarSignIcon className="size-6 text-brand" />
              Salary Negotiation Basics
            </h2>
            <p className="text-sm text-text-muted mt-1 mb-8">Know your worth and negotiate with confidence.</p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                variants={sectionVariants}
                className="rounded-2xl border border-border-subtle bg-bg-surface"
              >
                <details className="group">
                  <summary
                    className={cn(
                      "flex items-center justify-between gap-2 px-5 py-4 cursor-pointer",
                      "text-sm font-semibold text-text-heading",
                      "list-none [&::-webkit-details-marker]:hidden",
                    )}
                  >
                    {faq.q}
                    <ChevronRightIcon className="size-4 text-text-muted shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <p className="px-5 pb-4 text-sm text-text-muted leading-relaxed border-t border-border-subtle pt-3">
                    {faq.a}
                  </p>
                </details>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
