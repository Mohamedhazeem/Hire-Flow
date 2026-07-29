import prisma from "@/lib/prisma";
import { buildCsvRow } from "@/app/features/recruiter/libs/csv-builder";
import { format } from "date-fns";

const STATUS_LABELS: Record<string, string> = {
  applied: "Applied",
  reviewing: "Reviewing",
  shortlisted: "Shortlisted",
  interview_scheduled: "Interview Scheduled",
  offered: "Offered",
  hired: "Hired",
  rejected: "Rejected",
};

const MAX_ROWS = 50_000;
const BATCH_SIZE = 1000;

const HEADERS = [
  "Name",
  "Email",
  "Job Title",
  "Locations",
  "Status",
  "Applied Date",
  "Rejection Reason",
  "Recruiter Note",
  "Interview Date",
  "Meeting Link",
  "Offer Details",
];

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return format(d, "yyyy-MM-dd HH:mm:ss");
}

function mapRow(a: {
  status: string;
  rejectionReason: string | null;
  recruiterNote: string | null;
  interviewDate: Date | null;
  meetingLink: string | null;
  offerDetails: string | null;
  appliedAt: Date;
  user: { name: string | null; email: string };
  job: { title: string; locations: string[] };
}): string[] {
  return [
    a.user.name ?? "",
    a.user.email,
    a.job.title,
    a.job.locations.join("; "),
    STATUS_LABELS[a.status] ?? a.status,
    formatDate(a.appliedAt),
    a.rejectionReason ?? "",
    a.recruiterNote ?? "",
    formatDate(a.interviewDate),
    a.meetingLink ?? "",
    a.offerDetails ?? "",
  ];
}

export async function exportApplicantsAsCsv(
  jobId: string,
  companyId: string,
  filters: { search?: string; status?: string },
  signal?: AbortSignal,
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  let totalWritten = 0;
  let cursor: string | undefined;
  let hasMore = true;
  let aborted = false;

  if (signal) {
    signal.addEventListener("abort", () => {
      aborted = true;
    });
  }

  const where: Record<string, unknown> = {
    jobId,
    job: { companyId },
  };

  if (filters.search) {
    where.user = {
      OR: [
        { name: { contains: filters.search, mode: "insensitive" as const } },
        { email: { contains: filters.search, mode: "insensitive" as const } },
      ],
    };
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(encoder.encode("\uFEFF" + buildCsvRow(HEADERS)));

        while (hasMore && totalWritten < MAX_ROWS && !aborted) {
          const take = Math.min(BATCH_SIZE, MAX_ROWS - totalWritten);
          const rows = await prisma.application.findMany({
            where,
            take: take + 1,
            ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
            orderBy: { id: "asc" },
            select: {
              id: true,
              status: true,
              rejectionReason: true,
              recruiterNote: true,
              interviewDate: true,
              meetingLink: true,
              offerDetails: true,
              appliedAt: true,
              user: { select: { name: true, email: true } },
              job: { select: { title: true, locations: true } },
            },
          });

          hasMore = rows.length > take;
          const batch = hasMore ? rows.slice(0, take) : rows;

          for (const row of batch) {
            if (aborted) break;
            controller.enqueue(encoder.encode(buildCsvRow(mapRow(row))));
          }

          totalWritten += batch.length;
          cursor = batch[batch.length - 1]?.id;

          if (totalWritten >= MAX_ROWS && hasMore) {
            controller.enqueue(
              encoder.encode(
                buildCsvRow([
                  `# Export truncated at ${MAX_ROWS.toLocaleString()} rows. Refine your filters.`,
                ]),
              ),
            );
          }
        }

        controller.close();
      } catch (e) {
        if (!aborted) {
          controller.error(e);
        }
      }
    },
  });
}
