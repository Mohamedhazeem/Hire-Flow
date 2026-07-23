/**
 * Deterministic accounts created by prisma/seed.ts (password: "Password1").
 * Reuse these in all e2e specs — never inline email/password strings.
 */
export const ACCOUNTS = {
  admin: {
    email: "admin@hireflow.dev",
    password: "Password1",
    name: "Alice Admin",
  },
  recruiter: {
    email: "bob@acmecorp.dev",
    password: "Password1",
    name: "Bob Recruiter",
    companyId: "comp_seed_recruiter_1",
  },
  recruiter2: {
    email: "carol@globex.dev",
    password: "Password1",
    name: "Carol Recruiter",
  },
  user: {
    email: "eve@example.dev",
    password: "Password1",
    name: "Eve Applicant",
    resumeIds: ["resume_seed_user_1_0", "resume_seed_user_1_1"],
  },
  user2: {
    email: "frank@example.dev",
    password: "Password1",
    name: "Frank Applicant",
  },
  user3: {
    email: "grace@example.dev",
    password: "Password1",
    name: "Grace Applicant",
  },
} as const;

/** Known job IDs seeded by prisma/seed.ts (recruiter_1 / Acme Corp). */
export const JOBS = {
  /** DB ID for API calls that need raw IDs */
  acme_senior_engineer: "job_seed_recruiter_1_0",
  acme_product_manager: "job_seed_recruiter_1_1",
  acme_devops: "job_seed_recruiter_1_2",
} as const;

/** Known job slugs seeded by prisma/seed.ts. Used in public URL navigation. */
export const JOB_SLUGS = {
  acme_senior_engineer: "senior-software-engineer-acme-corp",
  acme_product_manager: "product-manager-acme-corp",
  acme_devops: "devops-engineer-acme-corp",
} as const;

/** Known application IDs seeded by prisma/seed.ts (eve / user_1). */
export const APPLICATIONS = {
  eve_applied: "app_seed_user_1_0",
  eve_reviewing: "app_seed_user_1_1",
  eve_shortlisted: "app_seed_user_1_2",
} as const;

export const SEED_PASSWORD = "Password1";
