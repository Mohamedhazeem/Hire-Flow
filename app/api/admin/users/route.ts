import { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api-response";
import { requireAdmin } from "@/app/features/admin/api/require-admin";
import { AdminListUsersParamsSchema } from "@/app/features/admin/schema/admin.schema";
import { listUsers } from "@/app/features/admin/queries/user-queries";
import { withErrorHandler } from "@/lib/api-wrapper";

async function handleGET(request: NextRequest) {
  await requireAdmin();

  const { searchParams } = request.nextUrl;
  const params = AdminListUsersParamsSchema.safeParse({
    page: searchParams.get("page") ?? undefined,
    pageSize: searchParams.get("pageSize") ?? undefined,
    search: searchParams.get("search") ?? undefined,
    role: searchParams.get("role") ?? undefined,
    banned: searchParams.get("banned") ?? undefined,
    sortBy: searchParams.get("sortBy") ?? undefined,
    sortOrder: searchParams.get("sortOrder") ?? undefined,
  });

  if (!params.success) {
    return fail("Invalid query parameters", 400);
  }

  const result = await listUsers(params.data);
  return ok(result);
}

export const GET = withErrorHandler(handleGET);
