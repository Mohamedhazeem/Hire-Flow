import { createThreadListHandler } from "@/lib/handlers/messages";

export const { GET } = createThreadListHandler({
  allowedRoles: ["recruiter", "user"],
});
