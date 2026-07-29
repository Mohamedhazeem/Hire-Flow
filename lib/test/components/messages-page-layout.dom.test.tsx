import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useSession } from "@/app/features/auth/libs/auth-client";

const mockReplace = vi.fn();
const mockSearchParamsGet = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => ({ get: mockSearchParamsGet }),
  usePathname: () => "/recruiter/messages",
}));

const mockOwnPresence = vi.fn();
const mockThreadPresence = vi.fn();
vi.mock("@/stores/messages/presence-store", () => ({
  usePresenceStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) => {
    const state = { isOnline: () => false };
    return selector(state);
  }),
}));
vi.mock("@/stores/messages/use-thread-presence", () => ({
  useOwnPresence: (...args: unknown[]) => mockOwnPresence(...args),
  useThreadPresence: (...args: unknown[]) => mockThreadPresence(...args),
}));

const mockStartConversationSearchProps: {
  currentUserId?: string;
  onSelectThread?: (id: string) => void;
  searchEndpoint?: string;
}[] = [];
vi.mock("@/components/shared/start-conversation-search", () => ({
  StartConversationSearch: (props: {
    currentUserId: string;
    onSelectThread: (id: string) => void;
    searchEndpoint: string;
  }) => {
    mockStartConversationSearchProps.push(props);
    return <div data-testid="start-conversation-search" />;
  },
}));

vi.mock("@/components/chat/thread-list-item", () => ({
  ThreadListItem: ({ thread }: { thread: { threadId: string; user: { name: string } } }) => (
    <div data-testid="thread-list-item">{thread.user.name}</div>
  ),
}));

import {
  MessagesPageLayout,
  type MessagesPageConfig,
} from "@/components/chat/messages-page-layout";
import type { ThreadListItemData } from "@/components/chat/thread-list-item";

function makeConfig(overrides: Partial<MessagesPageConfig> = {}): MessagesPageConfig {
  return {
    queryKey: "messages",
    basePath: "/recruiter/messages",
    searchEndpoint: "/api/recruiter/messages/search",
    panelDescription: "Messages with applicants",
    emptyListTitle: "No conversations yet",
    emptyListDescription: "Your messages will appear here",
    emptySelectDescription: "Select a conversation to start chatting",
    ...overrides,
  };
}

function makeThread(id = "t-1", name = "Alice Applicant"): ThreadListItemData {
  return {
    threadId: id,
    user: { id: "u-2", name },
    lastMessage: {
      content: "Hello!",
      createdAt: new Date().toISOString(),
      senderId: "u-2",
      unread: false,
    },
  };
}

const MockThreadView = ({ threadId, onBack }: { threadId: string; onBack?: () => void }) => (
  <div data-testid="thread-view" data-thread-id={threadId}>
    {onBack && (
      <button data-testid="back-button" onClick={onBack}>
        Back
      </button>
    )}
  </div>
);

describe("MessagesPageLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsGet.mockReturnValue(null);
    vi.mocked(useSession).mockReturnValue({
      data: { user: { id: "user-1" } },
      isPending: false,
    } as never);
  });

  afterEach(() => {
    mockStartConversationSearchProps.length = 0;
  });

  describe("render states", () => {
    it("renders the heading and panel description", () => {
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.getByText("Messages with applicants")).toBeInTheDocument();
    });

    it("shows skeleton items when isLoading", () => {
      const { container } = render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={undefined}
          isLoading
          ThreadViewComponent={MockThreadView}
        />,
      );
      // Skeleton renders 5 items with data-slot="skeleton"
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThanOrEqual(5);
    });

    it("shows empty state when threads array is empty", () => {
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.getByText("No conversations yet")).toBeInTheDocument();
      expect(screen.getByText("Your messages will appear here")).toBeInTheDocument();
    });

    it("renders a thread list item for each thread", () => {
      const threads = [makeThread("t-1", "Alice"), makeThread("t-2", "Bob")];
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={threads}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      const items = screen.getAllByTestId("thread-list-item");
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveTextContent("Alice");
      expect(items[1]).toHaveTextContent("Bob");
    });

    it("renders StartConversationSearch when searchEndpoint is provided", () => {
      render(
        <MessagesPageLayout
          config={makeConfig({ searchEndpoint: "/api/search" })}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.getByTestId("start-conversation-search")).toBeInTheDocument();
    });

    it("hides search box when searchEndpoint is undefined", () => {
      render(
        <MessagesPageLayout
          config={makeConfig({ searchEndpoint: undefined })}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.queryByTestId("start-conversation-search")).not.toBeInTheDocument();
    });
  });

  describe("thread selection state", () => {
    it("initializes activeThreadId from URL ?thread= param", () => {
      mockSearchParamsGet.mockReturnValue("t-42");
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.getByTestId("thread-view")).toBeInTheDocument();
      expect(screen.getByTestId("thread-view")).toHaveAttribute("data-thread-id", "t-42");
    });

    it("shows select placeholder when no thread is selected", () => {
      mockSearchParamsGet.mockReturnValue(null);
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.getByText("Select a conversation to start chatting")).toBeInTheDocument();
    });

    it("uses first value when multiple ?thread= params exist", () => {
      mockSearchParamsGet.mockImplementation((key: string) => {
        if (key === "thread") return "t-1";
        return null;
      });
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.getByTestId("thread-view")).toHaveAttribute("data-thread-id", "t-1");
    });

    it("handleSelectThread sets state and calls router.replace", async () => {
      mockSearchParamsGet.mockReturnValue(null);
      const { rerender } = render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      const props = mockStartConversationSearchProps[0];
      props.onSelectThread!("t-new");
      expect(mockReplace).toHaveBeenCalledWith("/recruiter/messages?thread=t-new", {
        scroll: false,
      });
      // Simulate URL change from router.replace — update mock then re-render
      // so useEffect sync doesn't override the state
      mockSearchParamsGet.mockReturnValue("t-new");
      rerender(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      await waitFor(() => {
        expect(screen.getByTestId("thread-view")).toHaveAttribute("data-thread-id", "t-new");
      });
    });

    it("handleSelectThread is no-op when thread ID unchanged", async () => {
      mockSearchParamsGet.mockReturnValue("t-current");
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      const props = mockStartConversationSearchProps[0];
      const replaceCallsBefore = mockReplace.mock.calls.length;
      props.onSelectThread!("t-current");
      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledTimes(replaceCallsBefore);
      });
    });

    it("handleBack clears thread and calls router.replace", async () => {
      mockSearchParamsGet.mockReturnValue("t-1");
      const user = userEvent.setup();
      const { rerender } = render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.getByTestId("thread-view")).toHaveAttribute("data-thread-id", "t-1");
      await user.click(screen.getByTestId("back-button"));
      expect(mockReplace).toHaveBeenCalledWith("/recruiter/messages", { scroll: false });
      // Simulate URL change from router.replace
      mockSearchParamsGet.mockReturnValue(null);
      rerender(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      await waitFor(() => {
        expect(screen.queryByTestId("thread-view")).not.toBeInTheDocument();
      });
      expect(screen.getByText("Select a conversation to start chatting")).toBeInTheDocument();
    });
  });

  describe("browser navigation sync", () => {
    it("syncs activeThreadId when searchParams change (browser back/forward)", () => {
      mockSearchParamsGet.mockReturnValue("t-1");
      const { rerender } = render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(screen.getByTestId("thread-view")).toHaveAttribute("data-thread-id", "t-1");

      // Simulate browser back — URL changes, searchParams mock returns null
      mockSearchParamsGet.mockReturnValue(null);
      rerender(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      // Thread view hidden, placeholder shown
      expect(screen.queryByTestId("thread-view")).not.toBeInTheDocument();
      expect(screen.getByText("Select a conversation to start chatting")).toBeInTheDocument();
    });
  });

  describe("prop drilling", () => {
    it("passes currentUserId through ThreadListPanel to StartConversationSearch", () => {
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      const props = mockStartConversationSearchProps[0];
      expect(props.currentUserId).toBe("user-1");
    });

    it("passes searchEndpoint to StartConversationSearch", () => {
      render(
        <MessagesPageLayout
          config={makeConfig({ searchEndpoint: "/api/recruiter/messages/search" })}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      const props = mockStartConversationSearchProps[0];
      expect(props.searchEndpoint).toBe("/api/recruiter/messages/search");
    });
  });

  describe("mobile responsiveness", () => {
    function getOuterFlexChildren(container: HTMLElement): Element[] {
      return Array.from(container.querySelector(".flex")?.children ?? []);
    }

    it("shows thread list and hides thread view on mobile when no thread active", () => {
      mockSearchParamsGet.mockReturnValue(null);
      const { container } = render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      // First child (panel) has class "flex" (visible), second child (view) has "hidden lg:flex"
      const children = getOuterFlexChildren(container);
      expect(children[0].className).toContain("flex");
      expect(children[1].className).toContain("hidden lg:flex");
    });

    it("shows thread view and hides thread list on mobile when thread active", () => {
      mockSearchParamsGet.mockReturnValue("t-1");
      const { container } = render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      const children = getOuterFlexChildren(container);
      // Panel has "hidden lg:flex lg:w-80", view has "flex"
      expect(children[0].className).toContain("hidden lg:flex lg:w-80");
      expect(children[1].className).toContain("flex");
    });
  });

  describe("hooks integration", () => {
    it("calls useOwnPresence with userId", () => {
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(mockOwnPresence).toHaveBeenCalledWith("user-1");
    });

    it("calls useOwnPresence with empty string when session has no user", () => {
      vi.mocked(useSession).mockReturnValue({ data: { user: null }, isPending: false } as never);
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(mockOwnPresence).toHaveBeenCalledWith("");
    });

    it("calls useThreadPresence with threads array", () => {
      const threads = [makeThread()];
      render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={threads}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(mockThreadPresence).toHaveBeenCalledWith(threads);
    });

    it("handles threads=undefined without crashing (useThreadPresence receives undefined)", () => {
      expect(() =>
        render(
          <MessagesPageLayout
            config={makeConfig()}
            threads={undefined}
            isLoading
            ThreadViewComponent={MockThreadView}
          />,
        ),
      ).not.toThrow();
      expect(mockThreadPresence).toHaveBeenCalledWith(undefined);
    });
  });

  describe("unmount safety", () => {
    it("unmounts without errors when a thread is selected", () => {
      mockSearchParamsGet.mockReturnValue("t-1");
      const { unmount } = render(
        <MessagesPageLayout
          config={makeConfig()}
          threads={[]}
          isLoading={false}
          ThreadViewComponent={MockThreadView}
        />,
      );
      expect(() => unmount()).not.toThrow();
    });
  });
});
