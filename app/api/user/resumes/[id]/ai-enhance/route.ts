import { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import {
  NotFoundError,
  ForbiddenError,
  TooManyRequestsError,
  ValidationError,
} from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { callAI } from "@/lib/ai-client";
import { EnhancementsResponseSchema } from "@/app/features/user/schema/resume-ai.schema";

const DAILY_ENHANCE_LIMIT = 5;

async function handlePOST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id, deletedAt: null } });
  if (!resume) throw new NotFoundError("Resume not found");
  if (resume.userId !== session.id) throw new ForbiddenError("You do not own this resume");

  // Enforce the 5/day AI-enhance limit with a concurrency-safe guard.
  // A per-(user, day) quota row is upserted, then incremented with a single
  // atomic `UPDATE … WHERE used < 5 RETURNING` statement. Because the UPDATE
  // itself is the gate, two concurrent requests cannot both pass: the second
  // transaction's UPDATE finds `used` already at the limit and affects 0 rows,
  // so it is rejected. This avoids the read-then-write TOCTOU race that a
  // separate SELECT + INSERT would have.
  const day = new Date().toISOString().slice(0, 10);

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `INSERT INTO "resume_enhancement_quota" ("id", "userId", "day", "used")
       VALUES ($1, $2, $3, 0)
       ON CONFLICT ("userId", "day") DO NOTHING`,
      randomUUID(),
      session.id,
      day,
    );

    const incremented = await tx.$queryRawUnsafe<Array<{ used: number }>>(
      `UPDATE "resume_enhancement_quota"
       SET "used" = "used" + 1
       WHERE "userId" = $1 AND "day" = $2 AND "used" < $3
       RETURNING "used"`,
      session.id,
      day,
      DAILY_ENHANCE_LIMIT,
    );

    if (incremented.length === 0) {
      throw new TooManyRequestsError(
        `Daily limit reached (${DAILY_ENHANCE_LIMIT}/${DAILY_ENHANCE_LIMIT}). Try again tomorrow.`,
      );
    }

    await tx.resumeEnhancementLog.create({
      data: { userId: session.id, resumeId: id },
    });
  });

  let resumeText = "";
  if (resume.builderData !== null) {
    const data = resume.builderData as Record<string, unknown> | null;
    resumeText = JSON.stringify(
      {
        summary: data?.summary ?? "",
        educations: data?.educations ?? [],
        experiences: data?.experiences ?? [],
        skills: data?.skills ?? [],
      },
      null,
      2,
    );
  } else if (resume.fileUrl !== null && resume.fileType) {
    const resolved = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/files/download?path=${encodeURIComponent(resume.fileUrl)}`,
      { headers: { cookie: _request.headers.get("cookie") ?? "" } },
    );
    if (!resolved.ok) throw new ValidationError("Could not read resume file");
    const buffer = Buffer.from(await resolved.arrayBuffer());
    const type = resume.fileType.toLowerCase();
    if (type.includes("pdf")) {
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const textResult = await parser.getText();
      resumeText = textResult.text;
      await parser.destroy();
    } else if (
      type.includes("wordprocessingml") ||
      type.includes("docx") ||
      type.includes("msword")
    ) {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      resumeText = result.value;
    } else {
      throw new ValidationError("File type not supported for AI analysis.");
    }
    if (!resumeText.trim()) {
      resumeText = "No text content found. This resume may be a scanned image.";
    }
  } else {
    resumeText = "No resume content available.";
  }

  const systemPrompt =
    "You are a professional resume coach. Analyze the resume and provide specific, actionable suggestions for:\n" +
    "1. Improving experience descriptions with strong action verbs and quantifiable results.\n" +
    "2. Highlighting relevant skills for tech/non-tech roles.\n" +
    "3. ATS (Applicant Tracking System) optimization (proper formatting, keyword density, section clarity).\n" +
    "4. Grammar, clarity, and professional tone.\n\n" +
    "Respond ONLY with valid JSON matching this schema:\n" +
    '{ suggestions: [{ type: "bullet_improvement"|"skill_addition"|"section_expansion"|"ats_optimization"|"grammar", section: string, original?: string, suggestion: string, reasoning: string, priority: "high"|"medium"|"low" }], overallScore: number, keyStrengths: string[], improvementAreas: string[] }';

  const raw = await callAI(resumeText, systemPrompt, 2048);
  if (raw === null) {
    return ok(null, 503);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new ValidationError("AI returned an unexpected format. Please try again.");
  }

  const validated = EnhancementsResponseSchema.safeParse(parsed);
  if (!validated.success) {
    throw new ValidationError("AI returned an unexpected format. Please try again.");
  }

  return ok(validated.data);
}

export const POST = withErrorHandler(handlePOST);
