import prisma from "@/lib/prisma";
import { buildOffsetMeta, parseOffsetParams } from "@/lib/pagination";
import type { AdminListUsersParams } from "../schema/admin.schema";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminUserListResult = {
  users: AdminUserRow[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export async function listUsers(params: AdminListUsersParams): Promise<AdminUserListResult> {
  const { skip, take, page, pageSize } = parseOffsetParams(
    { page: params.page, pageSize: params.pageSize },
    20,
  );

  const where: Record<string, unknown> = {};

  if (params.search) {
    where.OR = [
      { name: { contains: params.search, mode: "insensitive" } },
      { email: { contains: params.search, mode: "insensitive" } },
    ];
  }

  if (params.role) {
    where.role = params.role;
  }

  if (params.banned === "true") {
    where.banned = true;
  } else if (params.banned === "false") {
    where.banned = false;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        banned: true,
        banReason: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, ...buildOffsetMeta(total, page, pageSize) };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      banned: true,
      banReason: true,
      banExpiresAt: true,
      emailVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export type AdminUserDetail = Awaited<ReturnType<typeof getUserById>>;

export async function listUserSessions(userId: string) {
  return prisma.session.findMany({
    where: { userId },
    select: {
      id: true,
      token: true,
      createdAt: true,
      expiresAt: true,
      ipAddress: true,
      userAgent: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
