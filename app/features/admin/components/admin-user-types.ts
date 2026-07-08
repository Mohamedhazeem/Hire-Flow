export type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  banReason: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UsersApiResponse = {
  success: boolean;
  data: {
    users: UserRow[];
    total: number;
    totalPages: number;
    page: number;
    pageSize: number;
  };
};

export function parseUsersResponse(data: unknown): UsersApiResponse["data"] {
  const r = data as UsersApiResponse | undefined;
  return {
    users: r?.data?.users ?? [],
    total: r?.data?.total ?? 0,
    totalPages: r?.data?.totalPages ?? 0,
    page: r?.data?.page ?? 1,
    pageSize: r?.data?.pageSize ?? 20,
  };
}
