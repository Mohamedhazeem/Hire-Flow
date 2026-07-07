"use client";

import {
  createUseMessages,
  createUseSendMessage,
  createUseDeleteMessage,
} from "@/app/features/shared/hooks/use-messages";

export type { MessageItem, SendMessagePayload } from "@/app/features/shared/hooks/use-messages";

export const useUserMessages = createUseMessages("user", "/api/recruiter");
export const useSendUserMessage = createUseSendMessage("user", "/api/recruiter");
export const useDeleteUserMessage = createUseDeleteMessage("user", "/api/recruiter");
