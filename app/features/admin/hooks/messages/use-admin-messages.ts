import {
  createUseMessages,
  createUseSendMessage,
  createUseDeleteMessage,
  createUseDeleteThread,
} from "@/app/features/shared/hooks/use-messages";

export type { MessageItem, SendMessagePayload } from "@/app/features/shared/hooks/use-messages";

export const useAdminMessages = createUseMessages("admin", "/api/admin");
export const useSendMessage = createUseSendMessage("admin", "/api/admin");
export const useDeleteMessage = createUseDeleteMessage("admin", "/api/admin");
export const useDeleteThread = createUseDeleteThread("admin", "/api/admin");
