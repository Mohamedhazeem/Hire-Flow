// ─── Offset-based pagination ──────────────────────────────────────────────────

export type OffsetPaginationParams = {
  page?: number;
  pageSize?: number;
};

export type OffsetPaginationMeta = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export function parseOffsetParams(
  params: OffsetPaginationParams,
  defaultPageSize = 20,
): { skip: number; take: number; page: number; pageSize: number } {
  const page = Math.max(1, params.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, params.pageSize ?? defaultPageSize));
  const skip = (page - 1) * pageSize;
  return { skip, take: pageSize, page, pageSize };
}

export function buildOffsetMeta(
  total: number,
  page: number,
  pageSize: number,
): OffsetPaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

// ─── Cursor-based pagination ──────────────────────────────────────────────────

export type CursorPaginationParams = {
  cursor?: string;
  limit?: number;
};

export type CursorPaginationMeta = {
  nextCursor: string | null;
  hasNextPage: boolean;
};

/**
 * Returns Prisma-compatible cursor args and a helper to build the meta.
 * Usage:
 *   const { take, cursor } = parseCursorParams({ cursor, limit });
 *   const rows = await prisma.xxx.findMany({ take, cursor: cursor ? { id: cursor } : undefined, ... });
 *   const meta = buildCursorMeta(rows, take);
 */
export function parseCursorParams(
  params: CursorPaginationParams,
  defaultLimit = 20,
): { take: number; cursor: string | undefined } {
  const take = Math.min(100, Math.max(1, params.limit ?? defaultLimit));
  return { take: take + 1, cursor: params.cursor }; // +1 to detect hasNextPage
}

export function buildCursorMeta<T extends { id: string }>(
  rows: T[],
  take: number, // the original limit (without +1)
): { items: T[]; meta: CursorPaginationMeta } {
  const hasNextPage = rows.length > take;
  const items = hasNextPage ? rows.slice(0, take) : rows;
  const nextCursor = hasNextPage ? (items[items.length - 1]?.id ?? null) : null;
  return { items, meta: { nextCursor, hasNextPage } };
}

// ─── Dual-mode pagination resolver ─────────────────────────────────────────────

export type DualModePaginationParams = {
  page?: number;
  pageSize?: number;
  cursor?: string;
  limit?: number;
};

export type DualModeResult =
  | { mode: "offset"; skip: number; take: number; page: number; pageSize: number }
  | { mode: "cursor"; take: number; cursor: string | undefined };

export function parseDualModePagination(
  params: DualModePaginationParams,
  defaultLimit = 20,
): DualModeResult {
  if (params.cursor) {
    const cursorResult = parseCursorParams(
      { cursor: params.cursor, limit: params.limit },
      defaultLimit,
    );
    return { mode: "cursor", ...cursorResult };
  }
  const offset = parseOffsetParams(
    { page: params.page, pageSize: params.pageSize },
    defaultLimit,
  );
  return { mode: "offset", ...offset };
}
