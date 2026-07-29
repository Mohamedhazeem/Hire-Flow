# Step 3.2a — AI-Powered Resume Assistance

## Goal

Users can request AI-powered suggestions on their builder or uploaded resumes. The AI analyzes the resume content and returns structured improvements (bullet rewrites, skill relevance, ATS optimization, grammar, section expansion). Suggestions are never auto-applied — the user reviews and manually applies each one. Builder resumes support inline application; file-uploaded resumes require download/edit/re-upload.

## Architecture

```
[ResumeCard "AI Suggestions" button] → useAiResumeEnhance(resumeId) → POST /api/user/resumes/[id]/ai-enhance
  → requireRole(['user'])
  → count ResumeEnhancementLog today (if ≥5: throw TooManyRequestsError)
  → fetch resume (builderData OR extract text from PDF/DOCX)
  → callClaudeAPI(resumeText, systemPrompt)
  → parse with EnhancementsResponseSchema
  → log ResumeEnhancementLog entry
  → return { suggestions[], overallScore, keyStrengths[], improvementAreas[] }

[SuggestionsPanel modal] → user clicks "Apply" → applyAiSuggestions(resumeId, suggestionIds)
  → requireRole(['user'])
  → fetch resume
  → if fileUrl is not null: throw ValidationError("file-uploaded resumes cannot auto-apply")
  → for each suggestion: update builderData field
  → return updated resume
```

## AI Client (Generic)

`lib/ai-client.ts` reads `AI_PROVIDER` env var (default: `anthropic`). Supports `anthropic`, `openai`, `google` providers via config map. Each provider maps to its own API URL, auth header name, and message format. The system prompt is the same across all providers — only the transport differs. If `AI_PROVIDER` is not set and no API key for any provider is found, `callAI` returns null and the client-side UI shows "AI features temporarily unavailable."

## Files to Create (9 files, all ≤150 lines)

| #   | File                                                    | Est. Lines | Type          | Purpose                                                                                                                                                      |
| --- | ------------------------------------------------------- | ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | `lib/ai-client.ts`                                      | ~75        | Shared        | Generic AI API wrapper supporting Anthropic, OpenAI, Google. `callAI(userPrompt, systemPrompt, opts) → string`. Reads `AI_PROVIDER` + provider key from env. |
| 2   | `app/features/user/schema/resume-ai.schema.ts`          | ~30        | Zod           | `ResumeSuggestionSchema`, `EnhancementsResponseSchema`                                                                                                       |
| 3   | `app/api/user/resumes/[id]/ai-enhance/route.ts`         | ~150       | API Route     | POST handler: auth, rate-limit check, resume fetch, text extraction, AI call, response parse, log, return                                                    |
| 4   | `app/features/user/actions/apply-ai-suggestions.ts`     | ~50        | Server Action | Apply selected suggestions to builderData                                                                                                                    |
| 5   | `app/features/user/hooks/use-ai-resume-enhance.ts`      | ~30        | Hook          | `useMutation` calling the API route                                                                                                                          |
| 6   | `app/features/user/components/ai-suggestions-panel.tsx` | ~150       | Client        | Modal/panel displaying suggestions grouped by section + priority, with Copy + Apply buttons                                                                  |
| 7   | `prisma/schema.prisma` (modify)                         | +5 lines   | Schema        | Add `ResumeEnhancementLog` model                                                                                                                             |
| 8   | `utils/env.ts` (modify)                                 | +5 lines   | Env           | Add `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY` to env schema                                                                     |
| 9   | `.env.example` (create)                                 | ~15        | Env           | Document all AI env vars                                                                                                                                     |

## File-by-File Design

### 1. `lib/ai-client.ts` (~75 lines)

```ts
type AIProvider = "anthropic" | "openai" | "google";

const PROVIDER_CONFIG: Record<
  AIProvider,
  {
    apiUrl: string;
    authHeader: string;
    buildBody: (sys: string, user: string, maxTokens: number) => unknown;
    extractText: (response: unknown) => string;
  }
> = {
  anthropic: {
    apiUrl: "https://api.anthropic.com/v1/messages",
    authHeader: "x-api-key",
    buildBody: (sys, user, maxTokens) => ({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: sys,
      messages: [{ role: "user", content: user }],
    }),
    extractText: (data: any) => data.content?.[0]?.text ?? "",
  },
  openai: {
    apiUrl: "https://api.openai.com/v1/chat/completions",
    authHeader: "Authorization",
    buildBody: (sys, user, maxTokens) => ({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
    extractText: (data: any) => data.choices?.[0]?.message?.content ?? "",
  },
  google: {
    apiUrl: `https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.0-flash"}:generateContent`,
    authHeader: "x-goog-api-key", // passed as query param instead
    buildBody: (sys, user, maxTokens) => ({
      system_instruction: { parts: [{ text: sys }] },
      contents: [{ parts: [{ text: user }] }],
      generationConfig: { maxOutputTokens: maxTokens },
    }),
    extractText: (data: any) => data.candidates?.[0]?.content?.parts?.[0]?.text ?? "",
  },
};

export async function callAI(
  userPrompt: string,
  systemPrompt?: string,
  maxTokens = 1024,
): Promise<string | null> {
  const provider = (process.env.AI_PROVIDER || "anthropic") as AIProvider;
  const config = PROVIDER_CONFIG[provider];
  if (!config) return null;

  const apiKey =
    process.env[`${provider.toUpperCase()}_API_KEY`] ||
    process.env.ANTHROPIC_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const body = config.buildBody(systemPrompt || "", userPrompt, maxTokens);
  const headers: Record<string, string> = { "Content-Type": "application/json" };

  if (provider !== "google") {
    headers[config.authHeader] = apiKey.startsWith("Bearer ") ? apiKey : `Bearer ${apiKey}`;
  }

  let url = config.apiUrl;
  if (provider === "google") {
    url += `?key=${apiKey}`;
  }

  const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`${provider} API error: ${res.status}`);

  const data = await res.json();
  return config.extractText(data);
}
```

**Key decisions:**

- Provider resolved once per call via `AI_PROVIDER` env var (or `anthropic` default).
- API key resolved by precedence: provider-specific key → generic fallback `ANTHROPIC_API_KEY` → `OPENAI_API_KEY` → `GEMINI_API_KEY`.
- Google uses query param auth, not Bearer header.
- Returns `null` if no key found — caller (the route handler) returns `{ success: false, message: "AI features temporarily unavailable" }` to client.
- Error is thrown on API failure — caught by `withErrorHandler` in the route.

### 2. `resume-ai.schema.ts` (~30 lines)

```ts
export const ResumeSuggestionSchema = z.object({
  type: z.enum([
    "bullet_improvement",
    "skill_addition",
    "section_expansion",
    "ats_optimization",
    "grammar",
  ]),
  section: z.string(), // 'experience', 'education', 'skills', 'summary'
  original: z.string().optional(),
  suggestion: z.string(),
  reasoning: z.string().max(500),
  priority: z.enum(["high", "medium", "low"]),
});

export const EnhancementsResponseSchema = z.object({
  suggestions: z.array(ResumeSuggestionSchema),
  overallScore: z.number().min(0).max(100),
  keyStrengths: z.array(z.string()),
  improvementAreas: z.array(z.string()),
});

export type ResumeSuggestion = z.infer<typeof ResumeSuggestionSchema>;
export type EnhancementsResponse = z.infer<typeof EnhancementsResponseSchema>;
```

### 3. `ai-enhance/route.ts` (~150 lines)

**Flow:**

1. `requireRole(['user'])` → get session
2. `params.id` → `prisma.resume.findUnique({ where: { id } })` — `NotFoundError` if missing, `ForbiddenError` if `userId !== session.id`
3. Count today's logs: `prisma.resumeEnhancementLog.count({ where: { userId: session.id, createdAt: { gte: startOfDay } } })` — if ≥5 → throw `TooManyRequestsError`
4. Extract text:
   - If `builderData !== null`: serialize `{ summary, educations[], experiences[], skills[] }` to JSON string
   - If `fileUrl !== null`: determine type from `fileType`. PDF → `pdf-parse`. DOCX → `mammoth`. Unknown → `ValidationError`
5. Build system prompt (hardcoded in route, ~15 lines):

   ```
   You are a professional resume coach. Analyze the resume and provide specific, actionable suggestions for:
   1. Improving experience descriptions with strong action verbs and quantifiable results.
   2. Highlighting relevant skills for tech/non-tech roles.
   3. ATS (Applicant Tracking System) optimization (proper formatting, keyword density, section clarity).
   4. Grammar, clarity, and professional tone.

   Respond ONLY with valid JSON matching this schema:
   { suggestions: [{ type, section, original?, suggestion, reasoning, priority }], overallScore, keyStrengths: string[], improvementAreas: string[] }
   ```

6. `const result = await callAI(resumeText, systemPrompt, 2048)` — if null → return `{ success: false, message: "AI features temporarily unavailable" }`
7. Parse with `EnhancementsResponseSchema.safeParse(JSON.parse(result))` — `ValidationError` if malformed
8. Create `ResumeEnhancementLog` entry
9. Return `ok({ data: parsed })`

**Edge case: scanned PDF (no text)**: `pdf-parse` returns empty string → AI gets "No text content found." → Response includes suggestions like "Your resume appears to be a scanned image. AI enhancement works best on text-based resumes."

### 4. `apply-ai-suggestions.ts` (~50 lines)

- `requireRole(['user'])`
- `input: { resumeId: string, suggestionIds: string[], suggestions: ResumeSuggestion[] }` — clients send the full suggestion objects to avoid re-fetching
- Fetch resume, check ownership
- If `resume.fileUrl !== null` → `ValidationError("File-uploaded resumes cannot apply suggestions automatically. Download the resume, apply the changes, and re-upload.")`
- If `resume.builderData === null` → same error
- For each suggestion: update builderData field based on `section` + `type`:
  - `experience`: find the matching experience entry by `original` text → update description
  - `education`: find matching entry → similar
  - `skills`: add skill to array (if not already present)
  - `summary`: replace summary text
- `prisma.resume.update({ where: { id }, data: { builderData: updatedData } })`
- `revalidatePath('/user/resumes')`

### 5. `use-ai-resume-enhance.ts` (~30 lines)

```ts
export function useAiResumeEnhance(resumeId: string) {
  return useMutation({
    mutationFn: async (): Promise<{ data: EnhancementsResponse }> =>
      apiClient(`/api/user/resumes/${resumeId}/ai-enhance`, { method: "POST" }),
  });
}
```

Also export `useApplyAiSuggestions`:

```ts
export function useApplyAiSuggestions(resumeId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { suggestionIds: string[]; suggestions: ResumeSuggestion[] }) =>
      apiClient(`/api/user/resumes/${resumeId}/apply-ai-suggestions`, {
        method: "POST",
        body: input,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", "resumes"] }),
  });
}
```

### 6. `ai-suggestions-panel.tsx` (~150 lines)

**Props:** `suggestions: ResumeSuggestion[]`, `overallScore: number`, `keyStrengths: string[]`, `improvementAreas: string[]`, `isBuilder: boolean`, `onApply: (suggestionId: string) => void`, `onClose: () => void`

**Layout (mobile-first):**

```
┌─────────────────────────────────────────┐
│ ✨ AI Suggestions     [X]               │
│ Score: 78/100                           │
│ ✅ Key strengths: concise, impactful    │
│ 🔧 Areas to improve: ATS keywords      │
│ ──────────────────────────────────────── │
│ ┌─ Experience ────────────────────────┐ │
│ │ [🔴 bullet_improvement] High        │ │
│ │ Original: "Worked on stuff"         │ │
│ │ Suggestion: "Led team of 5..."      │ │
│ │ [Copy] [Apply → builder]           │ │
│ └─────────────────────────────────────┘ │
│ ┌─ Skills ───────────────────────────┐ │
│ │ [🟡 skill_addition] Medium          │ │
│ │ Suggestion: "Add TypeScript"        │ │
│ │ Reason: Listed in 80% of jobs       │ │
│ │ [Copy]                              │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

- Suggestions grouped by `section` (experience, education, skills, summary).
- Within each section: sorted by `priority` (high → medium → low).
- Each card shows: type badge with icon/color, priority badge, original text (if available), suggestion text, reasoning.
- Actions: "Copy" (copies suggestion text to clipboard), "Apply to builder" (only if `isBuilder === true` — disabled with tooltip for file-uploaded resumes).
- Score gauge: colored ring (`<50` red, `50-75` amber, `>75` green) with the number.
- Mobile: full-width cards, stacked. Desktop: wider panel.

**Edge cases:**

- Empty suggestions (zero length): show encouraging message with score
- Copy to clipboard fails: inline fallback text "Copy manually: [suggestion]"
- `isBuilder === false`: Apply buttons are disabled/removed, explanatory note shown
- Score 0 or 100: edge of gauge range, handled by min/max

### 7. Schema Migration

Add to `prisma/schema.prisma`:

```prisma
model ResumeEnhancementLog {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  resumeId  String
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

### 8. `utils/env.ts` — Add AI env vars

```ts
AI_PROVIDER: z.enum(['anthropic', 'openai', 'google']).default('anthropic'),
ANTHROPIC_API_KEY: z.string().optional(),
OPENAI_API_KEY: z.string().optional(),
GEMINI_API_KEY: z.string().optional(),
ANTHROPIC_MODEL: z.string().optional(),
OPENAI_MODEL: z.string().optional(),
GEMINI_MODEL: z.string().optional(),
```

### 9. `resume-card.tsx` — Add "AI Suggestions" button

Add a new action button to each resume card (both builder and file-uploaded):

- Sparkles icon `✨` / `SparklesIcon` from lucide
- `onClick` calls `useAiResumeEnhance(resume.id).mutate()`
- Disabled during mutation `isPending` and when daily limit is suspected (client-side can't know — server returns error, shown as toast)
- Opens `AiSuggestionsPanel` modal on success via `useState<EnhancementsResponse | null>`

## NPM Dependencies to Install

```
npm install pdf-parse mammoth
```

## Env Vars to Document

```bash
# AI Provider (optional, defaults to 'anthropic')
AI_PROVIDER=anthropic|openai|google
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
ANTHROPIC_MODEL=claude-sonnet-4-20250514
OPENAI_MODEL=gpt-4o
GEMINI_MODEL=gemini-2.0-flash
```

## Edge Cases (37 total)

| #   | Edge Case                                         | Handling                                                                                                                                             |
| --- | ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `ANTHROPIC_API_KEY` / `AI_API_KEY` not set        | `callAI()` returns null → route returns `{ success: false, message: "AI features temporarily unavailable" }`. UI shows friendly message, no crash.   |
| 2   | Claude/API 429                                    | `withErrorHandler` catches → 429 shown as "AI service is busy. Please try again shortly."                                                            |
| 3   | Claude/API 500                                    | Logged server-side. User sees generic "AI service temporarily unavailable."                                                                          |
| 4   | AI response not valid JSON                        | `JSON.parse` throws → caught by `withErrorHandler` → 400 "AI returned an unexpected format. Please try again."                                       |
| 5   | AI response doesn't match Zod schema              | `safeParse` fails → ValidationError                                                                                                                  |
| 6   | API timeout (>30s)                                | Next.js default timeout → 504. UI: "AI enhancement timed out."                                                                                       |
| 7   | Network failure to AI provider                    | `fetch` throws → caught by `withErrorHandler` → 500 "Unable to contact AI service."                                                                  |
| 8   | Rate limit: 5/day user                            | Count check before calling API. Throw `TooManyRequestsError`.                                                                                        |
| 9   | Builder resume (no fileUrl)                       | Serialize builderData JSON to plain text for prompt                                                                                                  |
| 10  | PDF resume                                        | Extract via `pdf-parse`                                                                                                                              |
| 11  | DOCX resume                                       | Extract via `mammoth`                                                                                                                                |
| 12  | Large PDF/DOCX (<5MB, upload already limited)     | Acceptable — extraction may be slow but within timeouts                                                                                              |
| 13  | Scanned PDF (no extractable text)                 | `pdf-parse` returns empty → AI gets "No text content found" → response shows "scanned image" message                                                 |
| 14  | Empty builder resume (no data)                    | AI gets empty data → returns general suggestions like "Add your first experience"                                                                    |
| 15  | Soft-deleted resume (deletedAt set)               | `NotFoundError` — route's `findUnique` returns null, falls through to ownership check naturally                                                      |
| 16  | Unauthenticated user                              | `requireRole` throws `UnauthorizedError` → 401                                                                                                       |
| 17  | User enhances another user's resume               | Ownership check → `ForbiddenError` → 403                                                                                                             |
| 18  | Rapid double-click on AI button                   | Mutation `isPending` prevents duplicate call. Button disabled during pending                                                                         |
| 19  | Modal closed during analysis                      | Mutation completes server-side. Re-opening modal starts fresh                                                                                        |
| 20  | Apply suggestion to file-uploaded resume          | `apply-ai-suggestions` throws `ValidationError`: "File-uploaded resumes cannot auto-apply..."                                                        |
| 21  | Apply suggestion to builder resume after edit     | Each suggestion targets specific fields via section+type. No race condition — manual application                                                     |
| 22  | Copy to clipboard blocked by browser              | `.catch()` on `navigator.clipboard.writeText` → show raw text fallback                                                                               |
| 23  | Apply single suggestion                           | Updates one field in builderData                                                                                                                     |
| 24  | Apply multiple suggestions at once                | Updates each field sequentially                                                                                                                      |
| 25  | Suggestion.section doesn't exist in builderData   | e.g., suggestion targets "skills" but no skills key → skip with warning? Or throw? Decision: throw ValidationError (safer — user sees why it failed) |
| 26  | Apply to deleted resume                           | `NotFoundError`                                                                                                                                      |
| 27  | Apply to resume owned by another user             | `ForbiddenError`                                                                                                                                     |
| 28  | Loading state                                     | Button shows spinner "Analyzing your resume..."                                                                                                      |
| 29  | Empty suggestions (array length 0)                | Show "No specific suggestions found. Your resume looks well-optimized!" with score                                                                   |
| 30  | Zero suggestions + low score                      | Contradictory but possible. Show score + improvementAreas as the actionable content                                                                  |
| 31  | All 5 daily requests used                         | Button tooltip: "Daily limit reached (5/5). Try again tomorrow."                                                                                     |
| 32  | Mobile suggestions panel                          | Scrollable modal, cards stack vertically, priority badges visible                                                                                    |
| 33  | Mobile copy/apply buttons                         | Full-width on mobile, inline on desktop                                                                                                              |
| 34  | No AI provider configured at all                  | UI disabled with "AI features temporarily unavailable" message. No crash on server or client                                                         |
| 35  | `pdf-parse` / `mammoth` not installed             | Module not found → 500. Install at setup.                                                                                                            |
| 36  | Unrecognized fileType on resume                   | Defensive: return `ValidationError("File type not supported for AI analysis.")`                                                                      |
| 37  | AiSuggestionsPanel receives non-array suggestions | Zod ensures array; TypeScript ensures compile-time safety                                                                                            |

## Prerequisites

1. `npm install pdf-parse mammoth`
2. Add env vars to `.env.example` and `utils/env.ts`
3. Add `ResumeEnhancementLog` to `prisma/schema.prisma` → `npx prisma migrate dev --name add_resume_enhancement_log`
4. `npx prisma generate`

## Validation Steps

1. `npx tsc --noEmit` — zero type errors
2. Request AI enhancement on builder resume with valid API key → returns structured suggestions
3. Request AI enhancement on PDF resume → returns suggestions (text extracted)
4. Request AI enhancement on builder resume without API key → returns "AI features temporarily unavailable"
5. Make 5 requests → 6th returns 429
6. Apply suggestion to builder resume → builderData updated
7. Apply suggestion to file-uploaded resume → 400 "File-uploaded resumes cannot auto-apply"
8. Copy suggestion to clipboard → clipboard has suggestion text
9. All files ≤150 lines
10. Mobile responsive: suggestions stack vertically, no horizontal overflow
