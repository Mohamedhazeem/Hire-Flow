# Step 2.11 — Export Applicants (CSV)

## Goal
Add a per-job CSV export for the recruiter applicants table, delivering a correct, filter-aware, server-side generated file that triggers a browser download.

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CSV library | None — manual RFC 4180 string builder | `csv-stringify`/`papaparse` not installed. Manual implementation is ~30 lines and simpler than adding a dependency. |
| Large dataset handling | `ReadableStream` with cursor-batched fetches (1000 rows/batch) | Avoids OOM for 10K+ rows. Existing pagination lib's 100-row cap would require 100+ round trips. |
| Encoding | UTF-8 with BOM (`\uFEFF`) | Ensures Excel (Windows) detects UTF-8 automatically. Without BOM, CJK characters display as `???`. |
| Line endings | CRLF (`\r\n`) per RFC 4180 section 2 | Required for Excel compatibility. |
| Date format | `yyyy-MM-dd HH:mm:ss` UTC via `date-fns` `format()` | ISO-like, timezone-agnostic, sortable. `date-fns` v4.4.0 already installed. |
| Delivery | API route → `new NextResponse(csvString)` with `Content-Disposition: attachment` | Follows existing file download pattern at `app/api/files/download/route.ts`. |
| Filters | Respects `search` and `status` searchParams from the current view | Export mirrors what the recruiter sees in the table. Default = all applicants for the job. |

## Edge Cases Covered

- **Commas in names/emails** → RFC 4180 double-quote wrapping
- **Double-quotes in text** → escaped as `""` inside quoted field
- **Line breaks in notes/offerDetails** → wrapped in quotes per spec
- **Non-ASCII characters** → BOM prefix + UTF-8 Content-Type header
- **Null fields** (rejectionReason, interviewDate, etc.) → empty string
- **Array fields** (job locations) → joined with `; ` delimiter
- **Status labels** → snake_case → human-readable via lookup (e.g., `interview_scheduled` → "Interview Scheduled")
- **All fields quoted** → simplifies implementation; no perf concern for CSV
- **10K+ rows** → `ReadableStream` + cursor-batched `findMany` with batch_size=1000

## Files to Create (3)

### 1. `app/features/recruiter/libs/csv-builder.ts`

RFC 4180 CSV string builder utility:

```ts
function escapeCsvField(value: string): string
```
- Coalesces null/undefined to `""`
- Doubles any `"` → `""`
- Returns `"${escaped}"` (always quoted for simplicity)

```ts
function buildCsvRow(values: string[]): string
```
- Maps each value through `escapeCsvField`
- Joins with `,`
- Returns row + `\r\n`

```ts
export function buildCsvString(headers: string[], rows: string[][]): string
```
- Prepends `\uFEFF` (BOM)
- Writes header row
- Maps each row through `buildCsvRow`
- Concatenates all rows

### 2. `app/features/recruiter/queries/export-queries.ts`

Server-side query for CSV export data:

```ts
export type ExportApplicantRow = {
  name: string;
  email: string;
  jobTitle: string;
  locations: string;
  statusLabel: string;
  appliedAt: string;
  updatedAt: string;
  rejectionReason: string;
  recruiterNote: string;
  interviewDate: string;
  meetingLink: string;
  offerDetails: string;
};

const STATUS_LABELS: Record<string, string> = { ... };
const BATCH_SIZE = 1000;
const MAX_ROWS = 50_000;

export async function exportApplicantsAsCsv(
  jobId: string,
  companyId: string,
  filters: { search?: string; status?: string },
): Promise<ReadableStream<Uint8Array>>
```
- `ReadableStream` with `start(controller)`:
  1. Enqueue BOM + header row as Uint8Array
  2. Batch loop: fetch 1000 rows via cursor-based `findMany({ where: { jobId, job: { companyId }, status?, user: search? }, orderBy: { id: "asc" }, take: 1000, ...cursor, select: { id, status, rejectionReason, recruiterNote, interviewDate, meetingLink, offerDetails, appliedAt, updatedAt, user: { name, email }, job: { title, locations } } })`
  3. Map each row through `formatRow()` → format dates via `date-fns` `format()`, join locations, map status label
  4. Enqueue CSV rows via `buildCsvRow()`
  5. `controller.close()` when done (or `controller.error()` on failure)
  6. Counter check: if `totalRows > MAX_ROWS`, add `X-Export-Truncated: true` info (via `enqueue` a comment row `# Export truncated at 50,000 rows`)
- Select fields are efficient (no joins beyond `user` and `job`)

### 3. `app/api/recruiter/jobs/[id]/applicants/export/route.ts`

API route handler:

```ts
import { NextRequest } from "next/server";
import { requireRole } from "@/app/features/shared/api/require-role";
import { ValidationError, NotFoundError } from "@/lib/api-error";
import { withErrorHandler } from "@/lib/api-wrapper";
import { prisma } from "@/lib/prisma";
import { exportApplicantsAsCsv } from "@/app/features/recruiter/queries/export-queries";

async function handleGET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(["recruiter"]);
  const companyId = session.companyId;
  if (!companyId) throw new ValidationError("No company found for this recruiter");

  const { id: jobId } = await params;

  // Verify job belongs to company
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, title: true, companyId: true },
  });
  if (!job || job.companyId !== companyId) {
    throw new NotFoundError("Job not found");
  }

  // Parse optional filters
  const search = request.nextUrl.searchParams.get("search") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") ?? undefined;

  const stream = await exportApplicantsAsCsv(jobId, companyId, { search, status });

  const sanitizedTitle = job.title.replace(/[^a-zA-Z0-9_-]/g, "_");
  const dateStr = format(new Date(), "yyyy-MM-dd");

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="applicants-${sanitizedTitle}-${dateStr}.csv"`,
    },
  });
}

export const GET = withErrorHandler(handleGET);
```

## Files to Modify (1)

### 4. `app/features/recruiter/components/applicants-table.tsx`

Add "Export CSV" link in the filter toolbar (after the status Select):

```tsx
import { DownloadIcon } from "lucide-react";

// Inside the filter toolbar, after the status <Select>:
<a
  href={`/api/recruiter/jobs/${jobId}/applicants/export?${searchParams.toString()}`}
  download
  className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-bg-elevated border border-border-subtle text-sm font-medium text-text-body hover:bg-bg-elevated/80 transition-colors whitespace-nowrap"
>
  <DownloadIcon className="size-4" />
  <span className="hidden sm:inline">Export CSV</span>
</a>
```

The `download` attribute triggers native browser download. Using `<a>` instead of `<button>` avoids any JavaScript for the download flow.

## CSV Column Order

1. Name
2. Email
3. Job Title
4. Locations
5. Status
6. Applied Date
7. Last Updated
8. Rejection Reason
9. Recruiter Note
10. Interview Date
11. Meeting Link
12. Offer Details

## Security

- **Tenant isolation**: Job ownership verified (`job.companyId === companyId`) before any data is streamed. Same `requireRole` + `companyId` check as existing GET endpoint.
- **No PII leakage**: Only fields already visible in the applicants table. No new sensitive fields.
- **No unbounded queries**: `MAX_ROWS = 50_000` cap with truncation comment. Prevents server OOM.
- **`X-Export-Truncated` header**: If count exceeds cap, a CSV comment row `# Export truncated at 50,000 rows. Refine your filters.` is inserted.

## Validation

```bash
npx tsc --noEmit
npm run lint
```

Manual test checklist:
- [ ] Click Export CSV on a job with applicants → file downloads with correct filename
- [ ] Apply a status filter → export contains only matching rows
- [ ] Enter a search term → export contains only matching rows
- [ ] Open CSV in Excel → UTF-8 characters display correctly, columns aligned
- [ ] Open CSV in Google Sheets → same
- [ ] Export with a job that has no applicants → headers-only CSV
- [ ] Check CSV for proper quoting: create applicant with comma in name, verify `"Last, First"` in output
- [ ] Check CSV for special chars: create applicant with `"` in name, verify `""` escaping
