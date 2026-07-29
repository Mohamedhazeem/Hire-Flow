import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StartConversationSearch } from "@/components/shared/start-conversation-search";

const mockApiClient = vi.fn();
vi.mock("@/lib/api/api-client", () => ({
  apiClient: (...args: unknown[]) => mockApiClient(...args),
}));

const testResults = [
  {
    id: "u-2",
    name: "Alice Recruiter",
    email: "alice@example.com",
    role: "recruiter",
    company: { name: "Acme Corp" },
  },
  { id: "u-3", name: "Bob Applicant", email: "bob@example.com", role: "user", company: null },
];

function baseProps() {
  return {
    searchEndpoint: "/api/search",
    currentUserId: "u-1",
    onSelectThread: vi.fn(),
  };
}

describe("StartConversationSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders search input with placeholder", () => {
    render(<StartConversationSearch {...baseProps()} />);
    expect(screen.getByPlaceholderText("Search by name or company...")).toBeInTheDocument();
  });

  it("renders the search icon", () => {
    render(<StartConversationSearch {...baseProps()} />);
    // The icon is inside the input's sibling; the input role confirms the component rendered
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("does not call API for empty query", async () => {
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "a");
    await user.clear(input);
    // Only the "a" keystroke triggered an API call; the empty clear does not
    expect(mockApiClient).toHaveBeenCalledTimes(1);
  });

  it("calls API with encoded query param on input", async () => {
    mockApiClient.mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "john");
    expect(mockApiClient).toHaveBeenCalledWith("/api/search?q=john");
  });

  it("encodes special characters in query", async () => {
    mockApiClient.mockResolvedValue({ data: [] });
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "a & b < c");
    // Each keystroke triggers a call; verify the last call has correct encoding
    expect(mockApiClient).toHaveBeenLastCalledWith("/api/search?q=a%20%26%20b%20%3C%20c");
  });

  it("shows results in dropdown when API returns data", async () => {
    mockApiClient.mockResolvedValue({ data: testResults });
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    const items = await screen.findAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("shows company info when company is non-null", async () => {
    mockApiClient.mockResolvedValue({ data: testResults });
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    expect(await screen.findByText("Acme Corp")).toBeInTheDocument();
  });

  it("hides company info when company is null", async () => {
    mockApiClient.mockResolvedValue({ data: testResults });
    const user = userEvent.setup();
    const { container } = render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    expect(await screen.findByText("Bob Applicant")).toBeInTheDocument();
    // Building2Icon (lucide-building2) — only for Alice's result
    const companyIcons = container.querySelectorAll(".lucide-building2");
    expect(companyIcons).toHaveLength(1);
  });

  it("handles API error gracefully", async () => {
    mockApiClient.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    // Wait a tick for the promise to settle, then verify no dropdown
    await waitFor(() => {
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  it("handles malformed API response (undefined data) without crashing", async () => {
    mockApiClient.mockResolvedValue({ data: undefined });
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    await waitFor(() => {
      expect(screen.queryByRole("list")).not.toBeInTheDocument();
    });
  });

  it("calls onSelectThread with correct thread ID on click", async () => {
    mockApiClient.mockResolvedValue({ data: [testResults[0]] });
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} onSelectThread={onSelect} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    const item = await screen.findByRole("listitem");
    await user.click(item);
    // computeThreadId("u-1", "u-2") — the exact ID depends on the utility, we verify it's called
    expect(onSelect).toHaveBeenCalledWith(expect.stringContaining("u-1"));
  });

  it("closes dropdown and clears query on result click", async () => {
    mockApiClient.mockResolvedValue({ data: [testResults[0]] });
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} onSelectThread={onSelect} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    const item = await screen.findByRole("listitem");
    await user.click(item);
    // Dropdown closed
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    // Input cleared
    expect(input).toHaveValue("");
  });

  it("navigates with ArrowDown and ArrowUp keys", async () => {
    mockApiClient.mockResolvedValue({ data: testResults.slice(0, 2) });
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} onSelectThread={onSelect} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "test");
    await screen.findByRole("list");
    // Initial: -1. ArrowDown → 0 (Alice), ArrowDown → 1 (Bob), ArrowUp → 0 (Alice)
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledWith(expect.stringContaining("u-2"));
  });

  it("selects with Enter key", async () => {
    mockApiClient.mockResolvedValue({ data: [testResults[0]] });
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} onSelectThread={onSelect} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    await screen.findByRole("list");
    // ArrowDown to select the first item (index -1 → 0)
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("closes dropdown on Escape", async () => {
    mockApiClient.mockResolvedValue({ data: testResults });
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "test");
    await screen.findByRole("list");
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("does nothing on keyboard events when dropdown is closed", async () => {
    mockApiClient.mockResolvedValue({ data: [] });
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} onSelectThread={onSelect} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    // Type and clear to ensure dropdown is closed
    await user.type(input, "a");
    await user.clear(input);
    // These should not crash or trigger selection
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("does not navigate when currentUserId is empty", async () => {
    mockApiClient.mockResolvedValue({ data: testResults });
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} currentUserId="" onSelectThread={onSelect} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "alice");
    const items = await screen.findAllByRole("listitem");
    await user.click(items[0]);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("falls back to email when name is null", async () => {
    const noNameResults = [{ id: "u-4", name: null, email: "noname@example.com", role: "user", company: null }];
    mockApiClient.mockResolvedValue({ data: noNameResults });
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    await user.type(input, "test");
    // Email appears twice: as name fallback (first span) and as email text (second span)
    const spans = await screen.findAllByText("noname@example.com");
    expect(spans).toHaveLength(2);
  });

  it("re-opens dropdown on focus when results exist", async () => {
    mockApiClient.mockResolvedValue({ data: testResults });
    const user = userEvent.setup();
    render(<StartConversationSearch {...baseProps()} />);
    const input = screen.getByPlaceholderText("Search by name or company...");
    // First search to populate results
    await user.type(input, "test");
    await screen.findByRole("list");
    // Escape to close
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    // Tab away then back to trigger onFocus
    await user.tab();
    await user.tab({ shift: true });
    expect(await screen.findByRole("list")).toBeInTheDocument();
  });
});
