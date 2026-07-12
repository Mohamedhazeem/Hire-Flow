import { describe, it, expect } from "vitest";
import { NotificationTypeSchema, MarkNotificationsReadSchema } from "@/app/features/notifications/schema/notification.schema";

describe("NotificationTypeSchema", () => {
  it("accepts valid notification types", () => {
    for (const t of ["application_status", "new_message", "profile_viewed", "ban_status"]) {
      expect(NotificationTypeSchema.safeParse(t).success).toBe(true);
    }
  });

  it("rejects an invalid notification type", () => {
    expect(NotificationTypeSchema.safeParse("invalid_type").success).toBe(false);
  });
});

describe("MarkNotificationsReadSchema", () => {
  it("accepts a valid payload", () => {
    const result = MarkNotificationsReadSchema.safeParse({ ids: ["id1", "id2"] });
    expect(result.success).toBe(true);
  });

  it("rejects empty ids array", () => {
    const result = MarkNotificationsReadSchema.safeParse({ ids: [] });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0].path).toContain("ids");
  });
});
