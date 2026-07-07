import { createMessageIdDeleteHandler } from "@/lib/handlers/messages";

export const { DELETE } = createMessageIdDeleteHandler({
  allowedRoles: ["admin", "super_admin"],
});
