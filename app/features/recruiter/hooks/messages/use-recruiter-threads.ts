"use client";

import { createUseThreads, createUseInvalidateThreads } from "@/app/features/shared/hooks/use-threads";

export type { ThreadUser, ThreadLastMessage, ThreadItem } from "@/app/features/shared/hooks/use-threads";

export const useRecruiterThreads = createUseThreads("recruiter", "/api/recruiter");
export const useInvalidateRecruiterThreads = createUseInvalidateThreads("recruiter");
