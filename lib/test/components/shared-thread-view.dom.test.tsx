import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createRef } from "react";

// Control the composed view hook so the presentational shell can be tested in
// isolation from data fetching, Pusher, and message pagination.
const viewState = { isError: false };

function makeView() {
  return {
    chatName: "Alice",
    isOnlineUser: false,
    confirmDeleteThread: false,
    setConfirmDeleteThread: vi.fn(),
    deleteThread: { isPending: false },
    handleDeleteThread: vi.fn(),
    isLoading: false,
    isFetchingNextPage: false,
    allMessages: [],
    currentUserId: "u-1",
    deletingMessageIds: new Set<string>(),
    handleDeleteMessage: vi.fn(),
    scrollRef: createRef<HTMLDivElement>(),
    bottomRef: createRef<HTMLDivElement>(),
    handleScroll: vi.fn(),
    input: "",
    setInput: vi.fn(),
    handleSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
    selectedFile: null,
    fileError: null,
    isSending: false,
    handleFileSelect: vi.fn(),
    removeSelectedFile: vi.fn(),
    fileInputRef: createRef<HTMLInputElement>(),
    isError: viewState.isError,
  };
}

vi.mock("@/components/chat/use-thread-view", () => ({
  useThreadView: () => makeView(),
}));

import { SharedThreadView } from "@/components/chat/shared-thread-view";

const config = {
  roleLabel: "Recruiter",
  queryKey: "messages",
  apiBasePath: "/api/recruiter",
  returnPath: "/user/messages",
  emptyMessage: "No messages yet",
};
const hooks = {
  useMessages: vi.fn(),
  useSendMessage: vi.fn(),
  useDeleteMessage: vi.fn(),
} as unknown as Parameters<typeof SharedThreadView>[0]["hooks"];

describe("SharedThreadView", () => {
  afterEach(() => {
    vi.clearAllMocks();
    viewState.isError = false;
  });

  it("shows an invalid-thread message for a malformed thread id", () => {
    render(
      <SharedThreadView threadId="nodelimiter" hooks={hooks} config={config} />,
    );
    expect(screen.getByText("Invalid thread identifier.")).toBeInTheDocument();
  });

  it("shows an error message when the view reports an error", () => {
    viewState.isError = true;
    render(<SharedThreadView threadId="a_b" hooks={hooks} config={config} />);
    expect(screen.getByText("Failed to load messages.")).toBeInTheDocument();
  });

  it("renders the chat shell (header + input) for a valid thread", () => {
    render(<SharedThreadView threadId="a_b" hooks={hooks} config={config} />);
    // Header shows the chat name and the input area shows the message field.
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Type a message...")).toBeInTheDocument();
  });
});
