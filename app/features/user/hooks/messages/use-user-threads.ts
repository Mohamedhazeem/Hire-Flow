"use client";

import {
  createUseThreads,
  createUseInvalidateThreads,
} from "@/app/features/shared/hooks/use-threads";

export type {
  ThreadUser as UserThreadUser,
  ThreadLastMessage as UserThreadLastMessage,
  ThreadItem as UserThreadItem,
} from "@/app/features/shared/hooks/use-threads";

export const useUserThreads = createUseThreads("user", "/api/recruiter");
export const useInvalidateUserThreads = createUseInvalidateThreads("user");
