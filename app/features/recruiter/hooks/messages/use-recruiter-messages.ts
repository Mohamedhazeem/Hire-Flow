"use client";

import {
  createUseMessages,
  createUseSendMessage,
  createUseDeleteMessage,
  createUseDeleteThread,
} from "@/app/features/shared/hooks/use-messages";

export type { MessageItem, SendMessagePayload } from "@/app/features/shared/hooks/use-messages";

export const useRecruiterMessages = createUseMessages("recruiter", "/api/recruiter");
export const useSendRecruiterMessage = createUseSendMessage("recruiter", "/api/recruiter");
export const useDeleteRecruiterMessage = createUseDeleteMessage("recruiter", "/api/recruiter");
export const useDeleteRecruiterThread = createUseDeleteThread("recruiter", "/api/recruiter");
