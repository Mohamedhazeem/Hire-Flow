# Step 3.1 — User Profile

## Goal

Build a user profile CRUD page with headline, bio, location, skills, work mode, pay expectations, social links, and dynamic experience entries.

## Architecture

- **Server Action** (`upsert-profile.ts`) — plain form submission, matches recruiter `upsert-company.ts` pattern
- **Client form** (`profile-form.tsx`) — RHF + Zod, mirrors `CompanyForm` design language
- **Experience list editor** (`experience-list-editor.tsx`) — `useFieldArray`, add/remove rows, "Present" toggle for endDate
- **Social links editor** (`social-links-editor.tsx`) — `useFieldArray`, platform selector + URL input
- **TanStack Query hook** (`use-profile.ts`) — fetch profile data via `apiClient`
- **Page** (`/user/profile/page.tsx`) — server component, fetches session, renders `PageHeader` + `ProfileForm`

## Data Flow

```
UserProfile (Prisma) → page.tsx (server: fetch via prisma) → ProfileForm (defaultValues)
ProfileForm (submit) → upsert-profile.ts (Server Action) → prisma.userProfile.upsert → revalidatePath
```

## Files to Create (7 files, all ≤150 lines)

| # | File | Est. Lines | Purpose |
|---|------|-----------|---------|
| 1 | `app/features/user/schema/profile.schema.ts` | ~40 | Zod schemas + inferred types |
| 2 | `app/features/user/actions/upsert-profile.ts` | ~40 | Server Action |
| 3 | `app/features/user/components/experience-list-editor.tsx` | ~120 | `useFieldArray` for experiences |
| 4 | `app/features/user/components/social-links-editor.tsx` | ~80 | `useFieldArray` for social links |
| 5 | `app/features/user/components/profile-form.tsx` | ~150 | Main RHF form |
| 6 | `app/features/user/hooks/use-profile.ts` | ~20 | TanStack Query hook |
| 7 | `app/(roles)/user/profile/page.tsx` | ~70 | Page wrapper |

## Schema Details

### `profile.schema.ts`

```ts
// ExperienceSchema: company, title, startDate, endDate (nullable = "Present"), description (max 2000)
// SocialLinkSchema: platform (selector: LinkedIn|GitHub|Portfolio|Other), url (string().url())
// ProfileSchema:
//   headline: z.string().max(200).optional()
//   bio: z.string().max(2000).optional()
//   location: z.string().max(200).optional()
//   skills: z.array(z.string().min(1)).max(50).transform(arr => [...new Set(arr)])
//   workMode: z.nativeEnum(WorkMode).nullable().optional()
//   basePay: z.coerce.number().int().nonnegative().optional().nullable()
//   ctc: z.coerce.number().int().nonnegative().optional().nullable()
//   ectc: z.coerce.number().int().nonnegative().optional().nullable()
//   experiences: z.array(ExperienceSchema).max(20).optional()
//   socialLinks: z.array(SocialLinkSchema).max(10).optional()
```

### `upsert-profile.ts`

- `"use server"`
- `requireRole(['user'])` from `@/app/features/shared/api/require-role`
- `ProfileSchema.safeParse()` → throw `ValidationError` on failure
- `prisma.userProfile.upsert({ where: { userId: session.id }, create: { userId: session.id, ...data }, update: data })`
- `revalidatePath('/user/profile')`

## UI & Styling

- **Mobile-first:** `flex-col sm:flex-row` field rows, `w-full sm:w-auto` buttons, `px-4 md:px-6` padding
- **Skills:** tag input — text input + Enter/X button badges, `flex-wrap gap-1`
- **Experiences:** add/remove rows, date inputs with "Present" checkbox clearing endDate
- **Social links:** platform dropdown (LinkedIn, GitHub, Portfolio, Other) + URL input
- **Pay:** three number inputs side-by-side (Base, CTC, Expected CTC), `grid grid-cols-1 sm:grid-cols-3 gap-4`
- **Icons:** `UserIcon` (headline), `FileText` (bio), `MapPin` (location), `Wrench` (skills), `Briefcase` (experiences), `Link` (social), `DollarSign` (pay)
- **Status:** inline success checkmark + server error alert, same as CompanyForm
- **Work mode:** shadcn `Select` with WorkMode enum options (Remote, Hybrid, On-site)

## Edge Cases Covered

| Edge Case | Handling |
|-----------|----------|
| No profile exists yet | `findUnique` returns null → empty form; `upsert` creates row |
| Cross-user access | `where: { userId: session.id }` in both fetch and upsert |
| Empty skills after dedupe | Zod `.min(1)` on each element; no empty-string entry survives |
| Experiences > 20 | `.max(20)` → field-level Zod error |
| Negative pay | `.nonnegative()` → field-level error |
| Bio > 2000 chars | `.max(2000)` → field-level error |
| Non-user role calls action | `requireRole(['user'])` throws UnauthorizedError |
| Banned user | Layout + action both check session status |
| null vs undefined in optional fields | Server maps null to undefined before passing to form; Prisma handles undefined as skip |
| Concurrent tabs | Last-write-wins (acceptable for single-user profile) |

## Dependencies

- `@/app/features/shared/api/require-role` — exists (`features/shared/api/require-role.ts`)
- `@/app/generated/prisma/enums` — generated in Step 3.0b for `WorkMode`
- `@/lib/api-error` — exists for `ValidationError`
- `@/lib/prisma` — singleton
- `@/components/layout/page-header` — shared
- `@/components/ui/*` — Button, Input, Textarea, Badge, Select, Popover
- `@/app/features/recruiter/schema/company.schema` — reference pattern only

## Verification

1. `npx tsc --noEmit` — zero type errors
2. Malformed `payExpectations` (negative) returns field-level Zod error, not 500
3. Re-submitting updates in place (no duplicate rows via `upsert`)
4. Form stacks on mobile, side-by-side on `sm:`+
5. Empty social links array → stored as `[]` in JSON, displayed as "Add social link" prompt
6. "Present" toggle sets `endDate` to null; saving and reloading shows `endDate` is null and "Present" is checked
