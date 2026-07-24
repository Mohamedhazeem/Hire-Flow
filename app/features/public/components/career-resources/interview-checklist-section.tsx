"use client";

import { motion } from "motion/react";
import { CheckCircle2Icon } from "lucide-react";

const items = [
  "Research the company products, culture, and recent news",
  "Review the job description and match your experience to each requirement",
  "Prepare 3-5 stories using the STAR method (Situation, Task, Action, Result)",
  "Plan 3-5 thoughtful questions to ask the interviewer",
  "Test your camera, microphone, and internet connection beforehand",
  "Choose a quiet, well-lit space with a neutral background",
  "Send a thank-you email within 24 hours of the interview",
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function InterviewChecklistSection() {
  return (
    <section className="bg-bg-surface border-y border-border-subtle py-20 sm:py-24">
      <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.08 } },
            hidden: {},
          }}
        >
          <motion.div variants={sectionVariants}>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-heading flex items-center gap-2">
              <CheckCircle2Icon className="size-6 text-brand" />
              Interview Prep Checklist
            </h2>
            <p className="text-sm text-text-muted mt-1 mb-8">
              Walk into every interview confident and prepared.
            </p>
          </motion.div>

          <ul className="space-y-4">
            {items.map((item, i) => (
              <motion.li
                key={i}
                variants={sectionVariants}
                className="flex items-start gap-3"
              >
                <CheckCircle2Icon className="size-5 text-brand shrink-0 mt-0.5" />
                <p className="text-sm text-text-body leading-relaxed">{item}</p>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
