export const JOB_CATEGORIES = [
  { label: "Technology", filter: { industry: "Technology" } },
  { label: "Healthcare", filter: { industry: "Healthcare" } },
  { label: "Finance", filter: { industry: "Finance" } },
  { label: "Marketing", filter: { industry: "Marketing" } },
  { label: "Remote", filter: { workMode: "remote" } },
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number];
