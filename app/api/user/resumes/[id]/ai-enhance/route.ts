import { NextRequest } from "next/server";
import { ok } from "@/lib/api/api-response";
import { requireRole } from "@/app/features/shared/api/require-role";
import { prisma } from "@/lib/prisma";
import { NotFoundError, ForbiddenError, ValidationError } from "@/lib/api/api-error";
import { withErrorHandler } from "@/lib/api/api-wrapper";
import { withRateLimit } from "@/lib/rate-limiting/di";
import { callAI } from "@/lib/ai-client";
import { EnhancementsResponseSchema } from "@/app/features/user/schema/resume-ai.schema";

const handlePOST = withRateLimit(async (_request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  const session = await requireRole(["user"]);
  const { id } = await params;

  const resume = await prisma.resume.findUnique({ where: { id, deletedAt: null } });
  if (!resume) throw new NotFoundError("Resume not found");
  if (resume.userId !== session.id) throw new ForbiddenError("You do not own this resume");

  await prisma.resumeEnhancementLog.create({
    data: { userId: session.id, resumeId: id },
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
    try {
      if (type.includes("pdf")) {
        const { PDFParse } = await import("pdf-parse");
        const parser = new PDFParse({ data: buffer });
        const textResult = await parser.getText();
        resumeText = textResult.text;
        await parser.destroy();
      } else if (type.includes("wordprocessingml") || type.includes("docx") || type.includes("msword")) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ buffer });
        resumeText = result.value;
      } else {
        throw new ValidationError("File type not supported for AI analysis.");
      }
      if (!resumeText.trim()) {
        resumeText = "No text content found. This resume may be a scanned image.";
      }
    } catch (err) {
      if (err instanceof ValidationError) throw err;
      resumeText = "[Resume could not be parsed. Please enter builder mode for best results.]";
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
    "IMPORTANT — Write suggestions as clear, directly usable replacement text. For each suggestion:\n" +
    "- Include the exact recommended replacement wording or text the user should paste in.\n" +
    "- If a section is missing, provide the exact content to add (e.g. a full skills list, experience bullet, or education entry).\n" +
    "- If an existing bullet or phrase needs improvement, include both the original and the improved version.\n" +
    "- Keep suggestions scoped to a single actionable change — one bullet, one skill addition, one section.\n" +
    "- Avoid vague advice like 'add more metrics' — instead write the actual metric-driven bullet.\n\n" +
    "Respond ONLY with valid JSON matching this schema:\n" +
    '{ suggestions: [{ type: "bullet_improvement"|"skill_addition"|"section_expansion"|"ats_optimization"|"grammar", section: string, original?: string, suggestion: string, reasoning: string, priority: "high"|"medium"|"low" }], overallScore: number, projectedScore: number, keyStrengths: string[], improvementAreas: string[] }';

  let raw: string | null = null;
  try {
    raw = await callAI(resumeText, systemPrompt, 2048);
  } catch {
    // callAI throws ApiError on network/API failures — treat as graceful degradation
  }

  if (raw === null) {
    return ok(
      {
        suggestions: [],
        overallScore: null,
        projectedScore: null,
        keyStrengths: ["Could not reach AI service."],
        improvementAreas: ["Retry later."],
      },
      202,
    );
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

  return ok({
    ...validated.data,
    projectedScore: Math.max(validated.data.projectedScore, validated.data.overallScore),
  });
}, "resumes:ai-enhance");

export const POST = withErrorHandler(handlePOST);
