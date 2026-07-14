import { describe, it, expect, vi, beforeEach } from "vitest";

const mockPusherClient = {
  subscribe: vi.fn().mockReturnValue({
    bind: vi.fn(),
  }),
  unsubscribe: vi.fn(),
};

vi.mock("@/lib/pusher/pusher-client", () => ({
  getPusherClient: vi.fn(() => mockPusherClient),
}));

describe("usePresenceStore", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { usePresenceStore } = await import("@/features/messages/stores/presence-store");
    usePresenceStore.getState().clear();
  });

  it("isOnline returns false initially", async () => {
    const { usePresenceStore } = await import("@/features/messages/stores/presence-store");
    expect(usePresenceStore.getState().isOnline("user-1")).toBe(false);
  });

  it("subscribeToUser calls getPusherClient and subscribes", async () => {
    const { usePresenceStore } = await import("@/features/messages/stores/presence-store");
    const { getPusherClient } = await import("@/lib/pusher/pusher-client");
    usePresenceStore.getState().subscribeToUser("user-1");
    expect(getPusherClient).toHaveBeenCalled();
    expect(mockPusherClient.subscribe).toHaveBeenCalledWith("presence-online-user-1");
  });

  it("subscribeToUser is idempotent for the same userId", async () => {
    const { usePresenceStore } = await import("@/features/messages/stores/presence-store");
    usePresenceStore.getState().subscribeToUser("user-1");
    usePresenceStore.getState().subscribeToUser("user-1");
    expect(mockPusherClient.subscribe).toHaveBeenCalledTimes(1);
  });

  it("unsubscribeFromUser calls pusher.unsubscribe", async () => {
    const { usePresenceStore } = await import("@/features/messages/stores/presence-store");
    usePresenceStore.getState().subscribeToUser("user-1");
    usePresenceStore.getState().unsubscribeFromUser("user-1");
    expect(mockPusherClient.unsubscribe).toHaveBeenCalledWith("presence-online-user-1");
  });

  it("clear unsubscribes all channels and resets state", async () => {
    const { usePresenceStore } = await import("@/features/messages/stores/presence-store");
    usePresenceStore.getState().subscribeToUser("user-1");
    usePresenceStore.getState().subscribeToUser("user-2");
    usePresenceStore.getState().clear();
    expect(mockPusherClient.unsubscribe).toHaveBeenCalledTimes(2);
    expect(usePresenceStore.getState().onlineUserIds.size).toBe(0);
    expect(Object.keys(usePresenceStore.getState()._subscriptions).length).toBe(0);
  });
});
