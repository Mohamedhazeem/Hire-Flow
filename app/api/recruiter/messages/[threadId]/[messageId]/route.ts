import { createMessageIdDeleteHandler } from "@/lib/handlers/messages";

export const { DELETE } = createMessageIdDeleteHandler({
  allowedRoles: ["recruiter", "user"],
});
