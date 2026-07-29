/**
 * prisma/seed.ts
 *
 * Populates the database with deterministic test data.
 *
 * Local / dev:
 *   npm run seed
 *   — or —
 *   npx prisma db seed
 *
 * Production (staging only — never against live user data without review):
 *   1. Point DATABASE_URL at the target database.
 *   2. Run migrations first:  npx prisma migrate deploy
 *   3. Set ALLOW_SEED=true to bypass the production guard.
 *   4. Run:  ALLOW_SEED=true npm run seed
 *
 * Idempotent — uses upsert throughout, safe to re-run.
 */
import "dotenv/config";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { logger } from "@/utils/logger";
import { env } from "@/utils/env";

const SEED_PASSWORD = "Password1";

const pool = new pg.Pool({ connectionString: env.data?.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function userId(name: string) {
  return `seed_${name.toLowerCase().replace(/\s+/g, "_")}`;
}

function jobSlug(companyName: string, title: string): string {
  const base = `${title
    .toLowerCase()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")}-${companyName
    .toLowerCase()
    .replace(/[^\w\s-]+/g, "")
    .replace(/\s+/g, "-")}`;
  return base
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

async function upsertCredentialAccount(userId: string, passwordHash: string) {
  await prisma.account.upsert({
    where: { id: `acc_${userId}` },
    update: { password: passwordHash },
    create: {
      id: `acc_${userId}`,
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
    },
  });
}

function avatarUrl(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  const seed = (Math.abs(hash) % 1000) + 1;
  return `https://i.pravatar.cc/150?u=${seed}`;
}

function companyLogoUrl(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e88e5&color=fff&size=128`;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const ADMIN = {
  id: userId("admin"),
  name: "Alice Admin",
  email: "admin@hireflow.dev",
};

const ADMIN_USER = {
  id: userId("admin_user"),
  name: "Diana Admin",
  email: "admin-user@hireflow.dev",
};

const RECRUITERS = [
  {
    id: userId("recruiter_1"),
    name: "Bob Recruiter",
    email: "bob@acmecorp.dev",
    company: {
      name: "Acme Corp",
      description: "We build the best products.",
      industry: "Software",
    },
  },
  {
    id: userId("recruiter_2"),
    name: "Carol Recruiter",
    email: "carol@globex.dev",
    company: {
      name: "Globex Inc",
      description: "Global excellence.",
      industry: "Finance",
    },
  },
];

const USERS = [
  {
    id: userId("user_1"),
    name: "Eve Applicant",
    email: "eve@example.dev",
    headline: "Full-Stack Engineer",
    skills: ["TypeScript", "React", "Node.js"],
  },
  {
    id: userId("user_2"),
    name: "Frank Applicant",
    email: "frank@example.dev",
    headline: "Backend Developer",
    skills: ["Go", "PostgreSQL", "Docker"],
  },
  {
    id: userId("user_3"),
    name: "Grace Applicant",
    email: "grace@example.dev",
    headline: "Frontend Engineer",
    skills: ["Vue.js", "CSS", "Figma"],
  },
];

const JOB_TEMPLATES = [
  {
    title: "Senior Software Engineer",
    experienceLevel: "senior",
    workMode: "remote" as const,
    employmentType: "full_time" as const,
  },
  {
    title: "Product Manager",
    experienceLevel: "mid",
    workMode: "hybrid" as const,
    employmentType: "full_time" as const,
  },
  {
    title: "DevOps Engineer",
    experienceLevel: "mid",
    workMode: "remote" as const,
    employmentType: "contract" as const,
  },
  {
    title: "UX Designer",
    experienceLevel: "entry",
    workMode: "onsite" as const,
    employmentType: "full_time" as const,
  },
  {
    title: "Data Analyst",
    experienceLevel: "entry",
    workMode: "hybrid" as const,
    employmentType: "part_time" as const,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (env.data?.NODE_ENV === "production" && env.data?.ALLOW_SEED !== "true") {
    logger.server.error(
      "Refusing to seed a production database. Set ALLOW_SEED=true if this is intentional (e.g. staging).",
    );
    process.exit(1);
  }

  const passwordHash = await hashPassword(SEED_PASSWORD);

  logger.server.info("🌱Seeding database…");

  // ── 1. Admin user ────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: {},
    create: {
      id: ADMIN.id,
      name: ADMIN.name,
      email: ADMIN.email,
      emailVerified: true,
      role: "super_admin",
      image: avatarUrl(ADMIN.name),
    },
  });

  await upsertCredentialAccount(ADMIN.id, passwordHash);
  logger.server.info("✔ Admin (super) created");

  // ── 1b. Admin user ──────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: ADMIN_USER.email },
    update: {},
    create: {
      id: ADMIN_USER.id,
      name: ADMIN_USER.name,
      email: ADMIN_USER.email,
      emailVerified: true,
      role: "admin",
      image: avatarUrl(ADMIN_USER.name),
    },
  });

  await upsertCredentialAccount(ADMIN_USER.id, passwordHash);
  logger.server.info("  ✔ Admin created");

  // ── 2. Recruiters + Companies + Jobs ─────────────────────────────────────────
  for (const rec of RECRUITERS) {
    await prisma.user.upsert({
      where: { email: rec.email },
      update: {},
      create: {
        id: rec.id,
        name: rec.name,
        email: rec.email,
        emailVerified: true,
        role: "recruiter",
        image: avatarUrl(rec.name),
      },
    });

    await upsertCredentialAccount(rec.id, passwordHash);

    const company = await prisma.company.upsert({
      where: { recruiterId: rec.id },
      update: {},
      create: {
        id: `comp_${rec.id}`,
        recruiterId: rec.id,
        name: rec.company.name,
        logoUrl: companyLogoUrl(rec.company.name),
        description: rec.company.description,
        industry: rec.company.industry,
        website: `https://www.${rec.company.name.toLowerCase().replace(/\s+/g, "")}.example.com`,
      },
    });

    await prisma.companyTeamMember.upsert({
      where: { userId: rec.id },
      update: {},
      create: {
        id: `ctm_${rec.id}`,
        companyId: company.id,
        userId: rec.id,
        role: "owner",
      },
    });

    for (let i = 0; i < JOB_TEMPLATES.length; i++) {
      const tpl = JOB_TEMPLATES[i];
      const jobId = `job_${rec.id}_${i}`;
      const slug = jobSlug(rec.company.name, tpl.title);
      await prisma.job.upsert({
        where: { id: jobId },
        update: { slug },
        create: {
          id: jobId,
          slug,
          recruiterId: rec.id,
          companyId: company.id,
          title: tpl.title,
          description: `Join ${rec.company.name} as a ${tpl.title}. We offer competitive salaries and great culture.`,
          locations: ["Remote", "New York, NY"],
          workMode: tpl.workMode,
          employmentType: tpl.employmentType,
          experienceLevel: tpl.experienceLevel,
          skills: USERS[i % USERS.length].skills,
          tags: [tpl.experienceLevel, tpl.workMode],
          salaryMin: 60_000 + i * 10_000,
          salaryMax: 100_000 + i * 15_000,
          salaryCurrency: "USD",
          status: "active",
          isActive: true,
        },
      });
    }

    logger.server.info(`  ✔ Recruiter "${rec.name}" + company + 5 jobs created`);
  }

  // ── 3. Users + Profiles + Resumes ────────────────────────────────────────────
  for (const usr of USERS) {
    await prisma.user.upsert({
      where: { email: usr.email },
      update: {},
      create: {
        id: usr.id,
        name: usr.name,
        email: usr.email,
        emailVerified: true,
        role: "user",
        image: avatarUrl(usr.name),
      },
    });

    await upsertCredentialAccount(usr.id, passwordHash);

    const profile = await prisma.userProfile.upsert({
      where: { userId: usr.id },
      update: {},
      create: {
        id: `prof_${usr.id}`,
        userId: usr.id,
        headline: usr.headline,
        bio: `Hi, I'm ${usr.name}. ${usr.headline} with a passion for building great products.`,
        skills: usr.skills,
        location: "San Francisco, CA",
        workMode: "remote",
        basePay: 80_000,
        socialLinks: [
          {
            platform: "linkedin",
            url: `https://linkedin.com/in/${usr.name.toLowerCase().replace(/\s+/g, "")}`,
            label: "",
          },
        ],
      },
    });

    for (let r = 0; r < 2; r++) {
      await prisma.resume.upsert({
        where: { id: `resume_${usr.id}_${r}` },
        update: {},
        create: {
          id: `resume_${usr.id}_${r}`,
          userId: usr.id,
          label: r === 0 ? "General Resume" : "Tailored Resume",
          isPrimary: r === 0,
          fileUrl: null,
          builderData: {
            summary: `${usr.headline} with ${usr.skills.join(", ")} skills.`,
          },
        },
      });
    }

    logger.server.info(`✔ User "${usr.name}" + profile ${profile.headline} + 2 resumes created`);
  }

  // ── 4. Applications — each user applies to 3 jobs ────────────────────────────
  const allJobs = await prisma.job.findMany({ select: { id: true } });
  const statuses = ["applied", "reviewing", "shortlisted", "interview_scheduled", "offered", "hired"] as const;

  for (let u = 0; u < USERS.length; u++) {
    const usr = USERS[u];
    const targetJobs = allJobs.slice(u * 3, u * 3 + 3);

    for (let j = 0; j < targetJobs.length; j++) {
      const appId = `app_${usr.id}_${j}`;
      await prisma.application.upsert({
        where: { id: appId },
        update: {},
        create: {
          id: appId,
          userId: usr.id,
          jobId: targetJobs[j].id,
          status: statuses[(u * 3 + j) % statuses.length],
          resumeId: `resume_${usr.id}_0`,
        },
      });
    }
  }

  // ── 5. Super Admin promotion ────────────────────────────────────────────────
  // Set PROMOTE_TO_SUPER_ADMINS as a comma-separated list of email addresses:
  //   PROMOTE_TO_SUPER_ADMINS="admin@hireflow.dev,bob@acmecorp.dev" npx prisma db seed
  const promoteEmails = (process.env.PROMOTE_TO_SUPER_ADMINS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const email of promoteEmails) {
    await prisma.user.update({
      where: { email },
      data: { role: "super_admin" },
    });
    logger.server.info(`  ✔ "${email}" promoted to super_admin`);
  }

  logger.server.info("  ✔ Applications created");
  logger.server.info("\n✅Seed complete.");
  logger.server.info(`\n📋  Seed credentials (all accounts use password: ${SEED_PASSWORD})`);
  logger.server.info(`Admin (super) → ${ADMIN.email}`);
  logger.server.info(`Admin→ ${ADMIN_USER.email}`);
  RECRUITERS.forEach((r) => logger.server.info(`   Recruiter  → ${r.email}`));
  USERS.forEach((u) => logger.server.info(`   User       → ${u.email}`));
}

main()
  .catch((e) => {
    logger.server.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
