/**
 * prisma/seed.ts
 *
 * Populates the database with deterministic test data.
 * Run with:  npx prisma db seed
 *
 * Idempotent — uses upsert throughout, safe to re-run.
 */
import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Better Auth stores passwords inside the Account table using this format. */
const SEED_PASSWORD_HASH =
  // bcrypt hash of "Password1" — safe for development only
  "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

function userId(name: string) {
  // Deterministic fake CUID-like IDs so upserts work on re-runs
  return `seed_${name.toLowerCase().replace(/\s+/g, "_")}`;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const ADMIN = { id: userId("admin"), name: "Alice Admin", email: "admin@hireflow.dev" };

const RECRUITERS = [
  {
    id: userId("recruiter_1"),
    name: "Bob Recruiter",
    email: "bob@acmecorp.dev",
    company: { name: "Acme Corp", description: "We build the best products.", industry: "Software" },
  },
  {
    id: userId("recruiter_2"),
    name: "Carol Recruiter",
    email: "carol@globex.dev",
    company: { name: "Globex Inc", description: "Global excellence.", industry: "Finance" },
  },
  {
    id: userId("recruiter_3"),
    name: "Dave Recruiter",
    email: "dave@initech.dev",
    company: { name: "Initech", description: "Efficiency is our business.", industry: "Consulting" },
  },
];

const USERS = [
  { id: userId("user_1"), name: "Eve Applicant", email: "eve@example.dev", headline: "Full-Stack Engineer", skills: ["TypeScript", "React", "Node.js"] },
  { id: userId("user_2"), name: "Frank Applicant", email: "frank@example.dev", headline: "Backend Developer", skills: ["Go", "PostgreSQL", "Docker"] },
  { id: userId("user_3"), name: "Grace Applicant", email: "grace@example.dev", headline: "Frontend Engineer", skills: ["Vue.js", "CSS", "Figma"] },
];

const JOB_TEMPLATES = [
  { title: "Senior Software Engineer", experienceLevel: "senior", workMode: "remote" as const, employmentType: "full_time" as const },
  { title: "Product Manager", experienceLevel: "mid", workMode: "hybrid" as const, employmentType: "full_time" as const },
  { title: "DevOps Engineer", experienceLevel: "mid", workMode: "remote" as const, employmentType: "contract" as const },
  { title: "UX Designer", experienceLevel: "entry", workMode: "onsite" as const, employmentType: "full_time" as const },
  { title: "Data Analyst", experienceLevel: "entry", workMode: "hybrid" as const, employmentType: "part_time" as const },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Seeding database…");

  // ── 1. Admin user ────────────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: {},
    create: {
      id: ADMIN.id,
      name: ADMIN.name,
      email: ADMIN.email,
      emailVerified: true,
      role: "admin",
    },
  });

  await prisma.account.upsert({
    where: { id: `acc_${ADMIN.id}` },
    update: {},
    create: {
      id: `acc_${ADMIN.id}`,
      accountId: ADMIN.id,
      providerId: "credential",
      userId: ADMIN.id,
      password: SEED_PASSWORD_HASH,
    },
  });

  console.log("  ✔ Admin created");

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
      },
    });

    await prisma.account.upsert({
      where: { id: `acc_${rec.id}` },
      update: {},
      create: {
        id: `acc_${rec.id}`,
        accountId: rec.id,
        providerId: "credential",
        userId: rec.id,
        password: SEED_PASSWORD_HASH,
      },
    });

    const company = await prisma.company.upsert({
      where: { recruiterId: rec.id },
      update: {},
      create: {
        id: `comp_${rec.id}`,
        recruiterId: rec.id,
        name: rec.company.name,
        description: rec.company.description,
        industry: rec.company.industry,
        website: `https://www.${rec.company.name.toLowerCase().replace(/\s+/g, "")}.example.com`,
      },
    });

    // 5 jobs per recruiter
    for (let i = 0; i < JOB_TEMPLATES.length; i++) {
      const tpl = JOB_TEMPLATES[i];
      const jobId = `job_${rec.id}_${i}`;
      await prisma.job.upsert({
        where: { id: jobId },
        update: {},
        create: {
          id: jobId,
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
          isActive: true,
        },
      });
    }

    console.log(`  ✔ Recruiter "${rec.name}" + company + 5 jobs created`);
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
      },
    });

    await prisma.account.upsert({
      where: { id: `acc_${usr.id}` },
      update: {},
      create: {
        id: `acc_${usr.id}`,
        accountId: usr.id,
        providerId: "credential",
        userId: usr.id,
        password: SEED_PASSWORD_HASH,
      },
    });

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
        socialLinks: { linkedin: `https://linkedin.com/in/${usr.name.toLowerCase().replace(/\s+/g, "")}` },
      },
    });

    // 2 resumes per user
    for (let r = 0; r < 2; r++) {
      await prisma.resume.upsert({
        where: { id: `resume_${usr.id}_${r}` },
        update: {},
        create: {
          id: `resume_${usr.id}_${r}`,
          userProfileId: profile.id,
          label: r === 0 ? "General Resume" : "Tailored Resume",
          isPrimary: r === 0,
          fileUrl: null,
          builderData: { summary: `${usr.headline} with ${usr.skills.join(", ")} skills.` },
        },
      });
    }

    console.log(`  ✔ User "${usr.name}" + profile + 2 resumes created`);
  }

  // ── 4. Applications — each user applies to 3 jobs ────────────────────────────
  const allJobs = await prisma.job.findMany({ select: { id: true } });
  const statuses = ["applied", "viewed", "accepted"] as const;

  for (let u = 0; u < USERS.length; u++) {
    const usr = USERS[u];
    const targetJobs = allJobs.slice(u * 3, u * 3 + 3); // 3 different jobs per user

    for (let j = 0; j < targetJobs.length; j++) {
      const appId = `app_${usr.id}_${j}`;
      await prisma.application.upsert({
        where: { id: appId },
        update: {},
        create: {
          id: appId,
          userId: usr.id,
          jobId: targetJobs[j].id,
          status: statuses[j % statuses.length],
          resumeId: `resume_${usr.id}_0`,
        },
      });
    }
  }

  console.log("  ✔ Applications created");
  console.log("\n✅  Seed complete.");
  console.log("\n📋  Seed credentials (all accounts use password: Password1)");
  console.log(`   Admin      → ${ADMIN.email}`);
  RECRUITERS.forEach((r) => console.log(`   Recruiter  → ${r.email}`));
  USERS.forEach((u) => console.log(`   User       → ${u.email}`));
}

main()
  .catch((e) => {
    console.error("❌  Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
