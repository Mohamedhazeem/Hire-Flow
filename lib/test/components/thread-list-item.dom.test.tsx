import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { ThreadListItem, type ThreadListItemData } from "@/components/chat/thread-list-item";

function thread(overrides: Partial<ThreadListItemData> = {}): ThreadListItemData {
  return {
    threadId: "t-1",
    user: { id: "u-2", name: "Alice Recruiter" },
    lastMessage: {
      content: "Hey there",
      createdAt: new Date().toISOString(),
      senderId: "u-2",
      unread: true,
    },
    ...overrides,
  };
}

describe("ThreadListItem", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders the counterpart name and initial", () => {
    render(
      <ThreadListItem
        thread={thread()}
        currentUserId="u-1"
        active={false}
        basePath="/user/messages"
        isOnline={false}
      />,
    );
    expect(screen.getByText("Alice Recruiter")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("renders the last message content", () => {
    render(
      <ThreadListItem
        thread={thread()}
        currentUserId="u-1"
        active={false}
        basePath="/user/messages"
        isOnline={false}
      />,
    );
    expect(screen.getByText("Hey there")).toBeInTheDocument();
  });

  it("shows a placeholder when there are no messages", () => {
    render(
      <ThreadListItem
        thread={thread({ lastMessage: null })}
        currentUserId="u-1"
        active={false}
        basePath="/user/messages"
        isOnline={false}
      />,
    );
    expect(screen.getByText("No messages yet")).toBeInTheDocument();
  });

  it("navigates to the thread URL on click", async () => {
    const user = userEvent.setup();
    render(
      <ThreadListItem
        thread={thread()}
        currentUserId="u-1"
        active={false}
        basePath="/user/messages"
        isOnline={false}
      />,
    );
    await user.click(screen.getByRole("button"));
    expect(mockPush).toHaveBeenCalledWith("/user/messages?thread=t-1", { scroll: false });
  });

  it("marks unread when the last message is from the other user and unread", () => {
    const { container } = render(
      <ThreadListItem
        thread={thread({
          lastMessage: {
            content: "Unread msg",
            createdAt: new Date().toISOString(),
            senderId: "u-2",
            unread: true,
          },
        })}
        currentUserId="u-1"
        active={false}
        basePath="/user/messages"
        isOnline={false}
      />,
    );
    // The unread indicator dot uses the brand background.
    expect(container.querySelector(".bg-brand")).toBeInTheDocument();
  });

  it("is not unread when the last message was sent by the current user", () => {
    const { container } = render(
      <ThreadListItem
        thread={thread({
          lastMessage: {
            content: "My own msg",
            createdAt: new Date().toISOString(),
            senderId: "u-1",
            unread: true,
          },
        })}
        currentUserId="u-1"
        active={false}
        basePath="/user/messages"
        isOnline={false}
      />,
    );
    expect(container.querySelector(".bg-brand")).not.toBeInTheDocument();
  });

  it("renders the online indicator when isOnline", () => {
    const { container } = render(
      <ThreadListItem
        thread={thread()}
        currentUserId="u-1"
        active={false}
        basePath="/user/messages"
        isOnline
      />,
    );
    expect(container.querySelector(".bg-green-500")).toBeInTheDocument();
  });
});
