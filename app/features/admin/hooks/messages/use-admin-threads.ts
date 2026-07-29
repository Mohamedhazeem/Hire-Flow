import {
  createUseThreads,
  createUseInvalidateThreads,
} from "@/app/features/shared/hooks/use-threads";

export type {
  ThreadUser,
  ThreadLastMessage,
  ThreadItem,
} from "@/app/features/shared/hooks/use-threads";

export const useAdminThreads = createUseThreads("admin", "/api/admin");
export const useInvalidateThreads = createUseInvalidateThreads("admin");
