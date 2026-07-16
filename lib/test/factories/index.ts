/**
 * Factories barrel — re-exports all domain factory functions.
 *
 * Import from here rather than from individual factory files:
 *   import { createTestUser, createTestJob } from "@/lib/test/factories";
 */
export { createTestUser } from "./user.factory";
export { createTestCompany } from "./company.factory";
export { createTestJob } from "./job.factory";
export { createTestApplication } from "./application.factory";
export { createTestResume } from "./resume.factory";
export { createTestMessage } from "./message.factory";
export { seedApplications, seedJobs } from "./seed-factories";
