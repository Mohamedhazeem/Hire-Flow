"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { JobCard, type JobCardProps } from "@/app/features/jobs/components/job-card";
import type { PublicJobRow } from "@/app/features/jobs/queries/public-job-queries";

type FeaturedJobsGridProps = {
  jobs: PublicJobRow[];
};

const parentVariants = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

function toCardProps(j: PublicJobRow): JobCardProps {
  return {
    id: j.id,
    slug: j.slug,
    title: j.title,
    companyName: j.companyName,
    companyLogo: j.companyLogo,
    locations: j.locations,
    workMode: j.workMode,
    employmentType: j.employmentType,
    salaryMin: j.salaryMin,
    salaryMax: j.salaryMax,
    salaryCurrency: j.salaryCurrency,
    skills: j.skills,
    experienceLevel: j.experienceLevel,
    applicationDeadline: j.applicationDeadline?.toISOString() ?? null,
    createdAt: j.createdAt.toISOString(),
  };
}

export function FeaturedJobsGrid({ jobs }: FeaturedJobsGridProps) {
  const cards = useMemo(() => jobs.map(toCardProps), [jobs]);

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={parentVariants}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {cards.map((job) => (
        <motion.div
          key={job.id}
          variants={childVariants}
        >
          <JobCard {...job} />
        </motion.div>
      ))}
    </motion.div>
  );
}
