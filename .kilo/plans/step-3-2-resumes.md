# Step 3.2 — Resumes & In-App Builder

## Goal

Users can upload PDF/DOCX resumes (file-based) or build lightweight JSON resumes (builder-based) in a unified list. Max 5 resumes, one primary. Soft-delete with 60-day retention for snapshot integrity.

## Prerequisite Changes (3 files)

| File | Change |
|------|--------|
| `lib/upload.ts` | Add `application/msword` and `application/vnd.openxmlformats-officedocument.wordprocessingml.document` to `ALLOWED_MIME_TYPES` |
| `app/api/files/download/route.ts` | Add `"user"` to `requireRole`, then verify resume ownership before serving |
| `prisma/schema.prisma` | Add `userId String`, `fileName String?`, `fileSize Int?`, `fileType String?` to Resume; remove `userProfileId String` and relation to UserProfile; add `@@index([userId, deletedAt])` |

### Resume model (after migration)

```prisma
model Resume {
  id          String      @id @default(cuid())
  userId      String
  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  label       String
  fileUrl     String?
  fileName    String?
  fileSize    Int?
  fileType    String?
  builderData Json?
  isPrimary   Boolean     @default(false)
  createdAt   DateTime    @default(now())
  deletedAt   DateTime?

  @@index([userId, deletedAt])
  @@map("resume")
}
```

## Architecture

- **File upload** → REST `POST /api/user/resumes` (multipart/form-data) — complex mutation
- **List resumes** → REST `GET /api/user/resumes` — fetches with `deletedAt: null`
- **Set primary** → REST `PATCH /api/user/resumes/[id]` — `$transaction(unsetAll, setThisOne)`
- **Soft-delete** → REST `DELETE /api/user/resumes/[id]` — sets `deletedAt = new Date()`
- **Builder save** → Server Action `save-resume-builder.ts` — plain form submission
- **Builder edit** → REST `PATCH /api/user/resumes/[id]/builder-data` — updates builderData for builder-type resumes

## Files to Create (14 files)

| # | File | Est. Lines | Purpose |
|---|------|-----------|---------|
| 1 | `app/features/user/schema/resume.schema.ts` | ~35 | BuilderEducationSchema, BuilderExperienceSchema, BuilderResumeSchema |
| 2 | `app/features/user/actions/save-resume-builder.ts` | ~45 | Server Action: validate BuilderResumeSchema, ensure ≤5, create builder-type Resume |
| 3 | `app/api/user/resumes/route.ts` | ~45 | GET list (deletedAt:null), POST upload with file |
| 4 | `app/api/user/resumes/[id]/route.ts` | ~55 | PATCH set-primary, DELETE soft-delete |
| 5 | `app/api/user/resumes/[id]/builder-data/route.ts` | ~35 | PATCH update builderData (builder-type only) |
| 6 | `app/features/user/hooks/use-resumes.ts` | ~45 | TanStack Query: list, upload, setPrimary, delete, updateBuilderData |
| 7 | `app/features/user/components/resume-card.tsx` | ~120 | Individual resume card: label, type badge, primary badge, actions menu |
| 8 | `app/features/user/components/resume-list.tsx` | ~150 | Unified list with grid layout, empty state, header actions |
| 9 | `app/features/user/components/resume-upload-button.tsx` | ~55 | File input → POST /api/upload → POST /api/user/resumes |
| 10 | `app/features/user/components/resume-builder-form.tsx` | ~150 | RHF form: summary, educations, experiences, skills — uses Server Action or PATCH |
| 11 | `app/(roles)/user/resumes/page.tsx` | ~25 | Page wrapper, renders ResumeList |
| 12 | `app/(roles)/user/resumes/builder/page.tsx` | ~20 | New builder page, renders ResumeBuilderForm (create mode) |
| 13 | `app/(roles)/user/resumes/builder/[id]/page.tsx` | ~30 | Edit builder page, fetches existing builderData, passes as defaultValues |

## Data Flow

### Upload flow
```
File input → POST /api/upload (returns url) → POST /api/user/resumes (file metadata + url) → prisma.resume.create
```

### Builder flow
```
ResumeBuilderForm (RHF) → save-resume-builder.ts (Server Action) → prisma.resume.create (builderData populated, fileUrl: null)
Edit: ResumeBuilderForm (loaded from PATCH route) → PATCH /api/user/resumes/[id]/builder-data → prisma.resume.update
```

## Key Design Decisions

1. **Builder is a separate route** (`/builder` and `/builder/[id]`) — not a modal. Cleaner navigation, bookmarkable.
2. **Unified card grid** — both upload and builder resumes display in the same responsive grid. Cards have type badges showing "Uploaded PDF" vs "Builder Resume".
3. **Primary badge** — the primary resume shows a prominent "Primary" badge. Only one can be primary.
4. **Soft-delete dialog** — uses the shared `ConfirmActionButton` component. User confirms deletion; UI shows the list without it.

## UI Layout

### `/user/resumes`
```
[PageHeader: "Resumes" "description"]
[Upload Resume button] [Build Resume button]
--- grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ---
[ResumeCard] [ResumeCard] [ResumeCard]
--- empty state if no resumes ---
```

### ResumeCard
```
+-----------------------------------+
| [Badge: Uploaded PDF / Builder]   |
| label                              |
| Created: June 30, 2026           |
| 1.2 MB (uploaded) | - (builder)  |
| [★ Primary] (if isPrimary)        |
| ---                                |
| [Download] [Edit] [Set Primary] [X]|
+-----------------------------------+
```

### `/user/resumes/builder`
```
[PageHeader: "Build Resume"]
[form: label, summary, skills (tag input)]
[Educations section: add/remove, school|degree|field|graduationYear]
[Experiences section: add/remove, company|title|startYear|endYear|description]
[Save] [Cancel]
```

## Edge Cases Covered

| # | Edge Case | Handling |
|---|-----------|----------|
| 1 | Upload 6th resume → 422 | Count check before insert in POST route |
| 2 | Builder creates 6th → 422 | Same count check in save-resume-builder.ts |
| 3 | Upload `.exe` file | `accept` attribute + server MIME validation in upload route |
| 4 | 5MB file size | `saveUpload()` in `lib/upload.ts` enforces 5MB |
| 5 | Soft-delete preserves snapshots | `DELETE` sets `deletedAt`, doesn't remove row |
| 6 | GET filters soft-deleted | `where: { deletedAt: null }` on list query |
| 7 | Set primary: atomically unset old | `$transaction([unsetAll, setThisOne])` |
| 8 | Delete the only primary | Acceptable; no primary exists, user can re-set one |
| 9 | Builder: empty required fields | Zod schema allows empty arrays; save still succeeds |
| 10 | Resume with null fileUrl AND null builderData | Server Action validates: at least one must be non-null |
| 11 | Builder educations/experiences cap | `.max(10)` in Zod schema |
| 12 | Empty resume list | "No resumes yet" with Upload/Build buttons |
| 13 | Self-download via `/api/files/download` | Route checks resume ownership after adding "user" role |
| 14 | Non-owner download | 403 Forbidden from ownership check |
| 15 | Concurrent upload filenames | `Date.now() + random` in saveUpload — no collision |
| 16 | Upload loading state | Button shows spinner + "Uploading..." during upload |
| 17 | Edit builder resume | PATCH route: only when `fileUrl === null` |
| 18 | File-type resume shows "Edit" → disabled | Edit button renders disabled with tooltip |
| 19 | Builder form: cancel unsaved changes | `beforeunload` event + React Router guard |
| 20 | Large PDF preview | `ResumePreviewDialog` handles page-by-page PDF rendering |
| 21 | DOCX preview | Preview shows "Preview not available" + Download button |
| 22 | No UserProfile exists for user | `userId` FK is direct to User now — no UserProfile dependency |
| 23 | SQL injection in file path | Existing path traversal protection in download route |
| 24 | Upload error handling | API error → inline error message on list page |

## Validation Steps

1. `npx prisma validate` + `npx prisma generate` — schema changes pass
2. `npx tsc --noEmit` — zero type errors
3. Upload `.docx` → 201 with resume record. Upload `.exe` → 422.
4. 5 resumes → 6th returns 422 for both upload and builder
5. Soft-delete → list no longer shows it. GET with deleted param shows it.
6. Set primary → old primary becomes false, new one becomes true
7. Builder form creates resume with `fileUrl: null`, `builderData` populated
8. Edit builder resume → PATCH updates builderData in place
9. Self-download → 200. Other user's resume → 403.
10. All files ≤150 lines

## Dependencies

- `@/app/features/shared/api/require-role` — exists
- `@/lib/api-error` — ValidationError, NotFoundError, ForbiddenError
- `@/lib/api-response` — ok(), fail()
- `@/lib/api-wrapper` — withErrorHandler()
- `@/lib/api-client` — apiClient()
- `@/lib/upload` — saveUpload (modified to accept DOC/DOCX)
- `@/lib/prisma` — singleton
- `@/components/ui/*` — Button, Input, Textarea, Badge, Dialog
- `@/components/shared/confirm-action-button` — exists
- `components/shared/resume-preview-dialog` — exists (for file preview)

## Migration / Rollout

- Run `npx prisma migrate dev --name add-resume-user-id-fields` (or `db push` if migration infra is unavailable)
- Existing Resume rows will need `userId` backfilled from `userProfileId → UserProfile.userId`. Write a one-time script if prod data exists.

## Open / Deferred

- 60-day cleanup cron (Vercel cron job): query `deletedAt < now - 60 days`, hard-delete, clean storage. Documented as implementation note but not built in this step.
- AI resume enhancement (Step 3.2a, optional). Not in scope.
