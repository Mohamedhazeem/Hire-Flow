import { createThreadIdMessageHandlers } from "@/lib/handlers/messages";

export const { GET, POST, DELETE } = createThreadIdMessageHandlers({
  allowedRoles: ["admin", "super_admin"],
  requireValidUrl: true,
});
