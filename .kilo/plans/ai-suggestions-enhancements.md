# AI Suggestions Panel Enhancements

## Goal

Add score projection, session-based caching, improved non-builder UX, card border pulse during analysis, and cross-card panel claim guard to the AI resume suggestions panel. Apply feature removed (suggestions are advisory — copy, never auto-apply).

---

## Edge Cases

### projectedScore

- **AI omits projectedScore**: Schema requires it (`z.number().min(0).max(100)`). Zod fails → existing error path ("AI returned unexpected format"). Prompt includes clear instruction.
- **projectedScore < overallScore**: Route handler clamps by spreading `{ ...data, projectedScore: Math.max(data.projectedScore, data.overallScore) }` before returning.
- **projectedScore === overallScore**: Display `+0` delta with neutral (grey) styling.
- **projectedScore === 0 === overallScore**: Renders `0 → 0`, label "Needs Work".

### Cache (sessionStorage)

- **SSR / missing sessionStorage**: Wrapped in `isAvailable()` check (window + writability test) + try-catch.
- **QuotaExceededError / corrupted JSON**: try-catch → return null (cache miss).
- **builderData null/undefined**: `JSON.stringify(null)` → `"null"` hash input. Deterministic.
- **TTL boundary**: `Date.now() - cachedAt > 30 * 60 * 1000` strict `>`.
- **Multiple tabs**: Per-tab isolation. Acceptable.
- **Builder edit → hash change**: Hash-based cache key means builder edit auto-invalidates (new `builderData` → different hash → cache miss).

### Cross-Card Panel Claim

- **Simultaneous "AI Suggestions" clicks on different cards**: Module-level `let activeAiPanelId: string | null = null` with `tryClaimPanel(id)` returns `false` if another card already has an open panel — mutation is never started.
- **Panel close / error / AI-not-configured**: `releasePanel(id)` called in ALL terminal paths ensuring no orphaned claim.
- **Rapid-click on same card**: `if (enhanceMutation.isPending) return;` guard prevents starting a new mutation while one is in flight.

---

## Design Decisions

### Cache integration point

Cache check lives in `resume-card.tsx` `handleAiEnhance`, NOT inside the mutation hook:

```
handleAiEnhance:
  1. if enhanceMutation.isPending → return (rapid-click guard)
  2. if !tryClaimPanel(id) → return (cross-card guard)
  3. setAiError(null)
  4. const cached = getCachedResponse(resume.id, resume.builderData)
  5. if cached → setAiResult(cached); return
  6. enhanceMutation.mutate(undefined, {
       onSuccess: (res) => {
         if res → setCachedResponse(resume.id, resume.builderData, res); setAiResult(res)
         else → releasePanel(id); error
       },
       onError: releasePanel(id); error
     })
```

This keeps the TanStack Query mutation clean — it remains a pure API-call action. The cache is a higher-level concern.

### builderData hash

Simple djb2 string hash of `JSON.stringify(builderData ?? {})` to keep sessionStorage keys compact.

### Clamp in route handler

After `EnhancementsResponseSchema.safeParse` succeeds, spread the data with clamped `projectedScore` before returning:

```ts
return ok({ ...validated.data, projectedScore: Math.max(validated.data.projectedScore, validated.data.overallScore) });
```

### Cross-card panel coordination

Module-level `let activeAiPanelId: string | null = null` — synchronous, zero React re-renders, no parent component changes needed. Not zustand or prop-threading.

### Card border pulse

`motion.div` with `animate` prop keyframing `borderColor` between `rgba(99,102,241,0.2)` / `rgba(99,102,241,0.6)` at 2s loop — simpler than `useAnimation` hook, no ref needed.

### Why Apply was removed

The AI's output is advisory by nature — structural warnings ("Add a Skills section"), instructional text, and paragraph-length replacements. The `applyAiSuggestions` server action attempted to parse these into `builderData` mutations but failed for 3+ of 4 section types (education unhandled, skills stored as paragraphs, experience mismatched on `original`). The Copy button + manual editing (builder or file re-upload) is the honest UX.

---

## Changes

### 1. Schema — Add `projectedScore`

**`app/features/user/schema/resume-ai.schema.ts`**

```diff
 EnhancementsResponseSchema = z.object({
   suggestions: z.array(ResumeSuggestionSchema),
   overallScore: z.number().min(0).max(100),
+  projectedScore: z.number().min(0).max(100),
   keyStrengths: z.array(z.string()),
   improvementAreas: z.array(z.string()),
 });
```

Removed `AiEnhanceRequestSchema` and `ApplyAiSuggestionsSchema` (unused after Apply removal).

### 2. API Route — Update Prompt + Clamp

**`app/api/user/resumes/[id]/ai-enhance/route.ts`**

- System prompt: appended `projectedScore: number` to JSON schema, added instruction to write suggestions as directly usable replacement text with the exact recommended wording
- After Zod validation, clamps `projectedScore = Math.max(validated.data.projectedScore, validated.data.overallScore)`

### 3. Cache Layer — sessionStorage + 30min TTL

**New: `app/features/user/hooks/use-ai-suggestions-cache.ts`**

Exports:

- `getCachedResponse(resumeId: string, builderData: unknown): EnhancementsResponse | null`
- `setCachedResponse(resumeId: string, builderData: unknown, response: EnhancementsResponse): void`
- `clearCachedResponse(resumeId: string): void`

Implementation:

- Cache key: `ai-suggestions:{resumeId}:{hash(JSON.stringify(builderData ?? {}))}`
- Value: `{ response: EnhancementsResponse, cachedAt: number }`
- TTL: 30 minutes — compare `Date.now() - cachedAt > 30 * 60 * 1000`
- On read: `EnhancementsResponseSchema.safeParse` to reject stale/corrupted entries; check TTL
- All functions wrapped in `isAvailable()` check (window + sessionStorage writability test) + try-catch for SSR safety
- `clearCachedResponse` removes all entries matching `ai-suggestions:{resumeId}:*` pattern by iterating `sessionStorage`

Hash function (djb2):

```ts
function hash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}
```

### 4. Panel — Dual-Score Gauge

**`app/features/user/components/ai-suggestions-panel.tsx`**

`ScoreCircle({ score })` replaced with `ScoreGauge({ currentScore, projectedScore })`:

```
flex items-center gap-3 justify-center
  ┌────────────────┐     ┌────────────┐     ┌─────────────────┐
  │  size-20       │     │  ±N        │     │  size-24         │
  │  rounded-full  │  →  │  size-10   │  →  │  rounded-full    │
  │  (color by     │     │  rounded-  │     │  (color by       │
  │   scoreConfig) │     │  full      │     │   scoreConfig)   │
  │  25 / 100      │     │  delta     │     │  78 / 100        │
  └────────────────┘     └────────────┘     └─────────────────┘
  "Current"               "delta"            "Projected"
```

### 5. Panel — Per-Suggestion UX (Simplified)

**`app/features/user/components/ai-suggestions-panel.tsx`**

- Apply button, "Applied" badge, Apply All button, and per-card `NonBuilderInfo` removed
- Every suggestion card just shows: type/priority badge, original text (if any), suggestion text, reasoning, Copy button
- `isBuilder` prop kept only for the global bottom file-upload notice
- Props reduced to `{ result, isBuilder, onClose }`

### 6. ResumeCard — Cache + Cross-Card Guard + Border Pulse

**`app/features/user/components/resume-card.tsx`**

- Module-level `activeAiPanelId` with `tryClaimPanel`/`releasePanel`
- `handleAiEnhance`: rapid-click guard + cross-card claim + cache check before API call
- `motion.div` border pulse animation during analysis
- `useApplyAiSuggestions`, `handleApply`, `handleApplyAll`, `appliedKeys` state removed
- `clearCachedResponse` removed (no longer needed — Apply was the only caller)

### 7. Apply Feature Removed

**Deleted:** `app/features/user/actions/apply-ai-suggestions.ts`
**Cleaned:** `useApplyAiSuggestions` export removed from `use-ai-resume-enhance.ts`; `ApplyAiSuggestionsSchema` removed from schema

---

## Test Updates

### `lib/test/components/ai-suggestions-panel.dom.test.tsx`

**11 tests (reduced from 17):**

| #   | Test                                                                    | Notes                          |
| --- | ----------------------------------------------------------------------- | ------------------------------ |
| 1   | "renders the overall score"                                             | Unchanged                      |
| 2   | "renders the projected score and delta"                                 | Unchanged                      |
| 3   | "shows zero delta when projected equals overall score"                  | Unchanged                      |
| 4   | "renders key strengths and improvement areas"                           | Unchanged                      |
| 5   | "shows the empty state when there are no suggestions"                   | Unchanged                      |
| 6   | "renders the suggestion text and reasoning"                             | Unchanged                      |
| 7   | "renders the original text when present"                                | New — tests `original` display |
| 8   | "copies the suggestion to the clipboard"                                | Unchanged                      |
| 9   | "calls onClose when the close button is clicked"                        | Unchanged                      |
| 10  | "shows the file-upload notice for non-builder resumes with suggestions" | Unchanged                      |
| 11  | "hides the file-upload notice for builder resumes"                      | Was test 12                    |

**Removed (6 tests):**

- "shows the Apply button only in builder mode and calls onApply"
- "shows 'Applied' badge instead of Apply button for applied suggestions"
- "shows Apply All button for builder resumes with unapplied suggestions"
- "shows All Applied when all suggestions are applied"
- "calls onApplyAll with all unapplied suggestions"
- "hides per-card info for builder resumes"
- "shows per-card info for non-builder resumes"

---

## Files Changed

| File                                                    | Change                                                                                                                                                                     |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/features/user/schema/resume-ai.schema.ts`          | Add `projectedScore`; remove `AiEnhanceRequestSchema`, `ApplyAiSuggestionsSchema`                                                                                          |
| `app/api/user/resumes/[id]/ai-enhance/route.ts`         | Update prompt with replacement-text instruction + clamp projectedScore                                                                                                     |
| `app/features/user/hooks/use-ai-suggestions-cache.ts`   | **New** — sessionStorage cache layer                                                                                                                                       |
| `app/features/user/components/ai-suggestions-panel.tsx` | Remove Apply button, Applied badge, Apply All, `NonBuilderInfo`, `isApplying`/`appliedKeys`/`onApply`/`onApplyAll` props; keep ScoreGauge, Copy, file-upload bottom notice |
| `app/features/user/components/resume-card.tsx`          | Remove `handleApply`, `handleApplyAll`, `appliedKeys`, `useApplyAiSuggestions`, `clearCachedResponse`; keep cache reads, claim/release, border pulse                       |
| `app/features/user/hooks/use-ai-resume-enhance.ts`      | Remove `useApplyAiSuggestions` export                                                                                                                                      |
| `app/features/user/actions/apply-ai-suggestions.ts`     | **Deleted**                                                                                                                                                                |
| `lib/test/components/ai-suggestions-panel.dom.test.tsx` | Remove Apply-related props and 6 tests; add "renders the original text" and "hides the file-upload notice" tests; 11 total                                                 |
| `README.md`                                             | Remove "apply or copy" language; describe panel as suggestion-only                                                                                                         |
| `manifest.md`                                           | Update Step 3.2a entry and file list                                                                                                                                       |

## Validation

- `npx tsc --noEmit` — no new errors (5 pre-existing errors remain in unrelated files)
- `npm run lint` — clean
- `npx vitest run --project dom` — 11/11 pass
