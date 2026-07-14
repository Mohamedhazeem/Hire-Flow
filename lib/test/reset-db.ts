/**
 * Truncates all tables and restarts identity sequences.
 *
 * Call in `beforeEach` of every integration test to guarantee a clean slate.
 * Tables are listed in child-first order to satisfy foreign key constraints
 * before CASCADE handles the rest.
 */
import { prisma } from "@/lib/prisma";

export async function resetDb(): Promise<void> {
  await prisma.$executeRaw`
    TRUNCATE TABLE
      "admin_invite",
      "resume_enhancement_log",
      "application_status_change",
      "bookmark",
      "notification",
      "message",
      "application",
      "job",
      "recruiter_invite",
      "company_team_member",
      "company",
      "resume",
      "user_profile",
      "verification",
      "account",
      "session",
      "user",
      "rate_limit"
    RESTART IDENTITY CASCADE;
  `;
}
