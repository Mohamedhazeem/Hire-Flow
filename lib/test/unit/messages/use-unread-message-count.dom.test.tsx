import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

const mockGetUnreadCount = vi.fn();
vi.mock("@/app/features/messages/actions/get-unread-message-count", () => ({
  getUnreadMessageCount: (...args: unknown[]) => mockGetUnreadCount(...args),
}));

const capturedBindings: string[] = [];
const capturedUnbindings: string[] = [];

vi.mock("@/lib/pusher/pusher-client", () => ({
  getPusherClient: vi.fn(() => ({
    subscribe: vi.fn(() => ({
      bind: (event: string, _handler: unknown) => { capturedBindings.push(event); },
      unbind: (event: string, _handler: unknown) => { capturedUnbindings.push(event); },
    })),
    unsubscribe: vi.fn(),
  })),
}));

const { useUnreadMessageCount } = await import(
  "@/app/features/public/hooks/use-unread-message-count"
);

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useUnreadMessageCount", () => {
  beforeEach(() => {
    capturedBindings.length = 0;
    capturedUnbindings.length = 0;
    mockGetUnreadCount.mockResolvedValue(0);
  });

  it("returns count from server action", async () => {
    mockGetUnreadCount.mockResolvedValue(5);
    const { result } = renderHook(() => useUnreadMessageCount("user-1"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.data).toBe(5));
  });

  it("returns undefined before fetch completes (loading state)", () => {
    mockGetUnreadCount.mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useUnreadMessageCount("user-1"), {
      wrapper: createWrapper(),
    });
    expect(result.current.data).toBeUndefined();
  });

  it("does not subscribe or return data when userId is undefined", () => {
    const { result } = renderHook(() => useUnreadMessageCount(undefined), {
      wrapper: createWrapper(),
    });
    expect(result.current.data).toBeUndefined();
    expect(capturedBindings).toHaveLength(0);
  });

  it("binds both Pusher events on mount", () => {
    renderHook(() => useUnreadMessageCount("user-1"), {
      wrapper: createWrapper(),
    });
    expect(capturedBindings).toContain("message-unread-increment");
    expect(capturedBindings).toContain("message-unread-update");
  });

  it("does not bind when userId is undefined", () => {
    renderHook(() => useUnreadMessageCount(undefined), {
      wrapper: createWrapper(),
    });
    expect(capturedBindings).toHaveLength(0);
  });

  it("unbinds events on unmount", () => {
    const { unmount } = renderHook(() => useUnreadMessageCount("user-1"), {
      wrapper: createWrapper(),
    });
    unmount();
    expect(capturedUnbindings).toContain("message-unread-increment");
    expect(capturedUnbindings).toContain("message-unread-update");
  });
});
