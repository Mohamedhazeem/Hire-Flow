import { z } from "zod";

export const NotificationTypeSchema = z.enum(["application_status", "new_message", "profile_viewed", "ban_status"]);

export const MarkNotificationsReadSchema = z.object({
  ids: z.array(z.string()).min(1),
});
