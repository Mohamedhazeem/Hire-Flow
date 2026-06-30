"use client";

import { motion } from "motion/react";
import { JobCard, type JobCardProps } from "@/app/features/jobs/components/job-card";

type FeaturedJobsGridProps = {
  jobs: JobCardProps[];
};

export function FeaturedJobsGrid({ jobs }: FeaturedJobsGridProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {jobs.map((job) => (
        <motion.div
          key={job.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <JobCard {...job} />
        </motion.div>
      ))}
    </motion.div>
  );
}
