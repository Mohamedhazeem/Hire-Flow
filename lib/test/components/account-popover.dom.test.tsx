import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";

const mockSignOut = vi.fn();
vi.mock("@/app/features/public/hooks/use-sign-out", () => ({
  useSignOut: () => mockSignOut,
}));

const mockGetUnreadCount = vi.fn();
vi.mock("@/app/features/messages/actions/get-unread-message-count", () => ({
  getUnreadMessageCount: (...args: unknown[]) => mockGetUnreadCount(...args),
}));

vi.mock("@/lib/pusher/pusher-client", () => ({
  getPusherClient: () => null,
}));

import { useSession } from "@/app/features/auth/libs/auth-client";
import { AccountPopover } from "@/app/features/public/components/account-popover";

type SessionResult = ReturnType<typeof useSession>;

function session(user: Record<string, unknown> | null): SessionResult {
  return { data: user ? { user } : null, isPending: false } as unknown as SessionResult;
}

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("AccountPopover", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "ResizeObserver",
      class {
        observe() {}
        unobserve() {}
        disconnect() {}
      },
    );
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    if (!Element.prototype.hasPointerCapture) {
      Element.prototype.hasPointerCapture = () => false;
    }
    if (!Element.prototype.scrollIntoView) {
      Element.prototype.scrollIntoView = () => {};
    }
    mockGetUnreadCount.mockResolvedValue(0);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders nothing when there is no authenticated user", () => {
    vi.mocked(useSession).mockReturnValue(session(null));
    const { container } = renderWithClient(<AccountPopover />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the avatar trigger when authenticated", () => {
    vi.mocked(useSession).mockReturnValue(
      session({ id: "u1", name: "Jane Doe", email: "jane@example.com", role: "user" }),
    );
    renderWithClient(<AccountPopover />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("opens the popover and shows user details, dashboard link and sign out", async () => {
    vi.mocked(useSession).mockReturnValue(
      session({ id: "u1", name: "Recruiter Rita", email: "rita@example.com", role: "recruiter" }),
    );
    const user = userEvent.setup();
    renderWithClient(<AccountPopover />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Recruiter Rita")).toBeInTheDocument();
    expect(screen.getByText("rita@example.com")).toBeInTheDocument();
    expect(screen.getByText("Recruiter")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute("href", "/recruiter");
  });

  it("routes admins to the admin dashboard", async () => {
    vi.mocked(useSession).mockReturnValue(
      session({ id: "a1", name: "Admin Al", email: "al@example.com", role: "admin" }),
    );
    const user = userEvent.setup();
    renderWithClient(<AccountPopover />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute("href", "/admin");
  });

  it("calls sign out when the Sign Out button is clicked", async () => {
    vi.mocked(useSession).mockReturnValue(
      session({ id: "u1", name: "Jane Doe", email: "jane@example.com", role: "user" }),
    );
    const user = userEvent.setup();
    renderWithClient(<AccountPopover />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /Sign Out/ }));
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  describe("message badge", () => {
    it("does not render badge when unread count is 0", async () => {
      mockGetUnreadCount.mockResolvedValue(0);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "u1", name: "User", email: "u@test.com", role: "user" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const messagesLink = screen.getByRole("link", { name: /Messages/ });
      expect(messagesLink).not.toHaveTextContent(/\d+/);
    });

    it("renders badge with correct number when count > 0", async () => {
      mockGetUnreadCount.mockResolvedValue(5);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "u1", name: "User", email: "u@test.com", role: "user" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const messagesLink = screen.getByRole("link", { name: /Messages/ });
      expect(messagesLink).toHaveTextContent("5");
    });

    it("caps badge at 99+ when count > 99", async () => {
      mockGetUnreadCount.mockResolvedValue(150);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "u1", name: "User", email: "u@test.com", role: "user" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const messagesLink = screen.getByRole("link", { name: /Messages/ });
      expect(messagesLink).toHaveTextContent("99+");
    });

    it("renders badge for user role messages link", async () => {
      mockGetUnreadCount.mockResolvedValue(3);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "u1", name: "User", email: "u@test.com", role: "user" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const messagesLink = screen.getByRole("link", { name: /Messages/ });
      expect(messagesLink).toHaveAttribute("href", "/user/messages");
      expect(messagesLink).toHaveTextContent("3");
    });

    it("renders badge for recruiter role messages link", async () => {
      mockGetUnreadCount.mockResolvedValue(2);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "r1", name: "Rec", email: "r@test.com", role: "recruiter" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const messagesLink = screen.getByRole("link", { name: /Messages/ });
      expect(messagesLink).toHaveAttribute("href", "/recruiter/messages");
      expect(messagesLink).toHaveTextContent("2");
    });

    it("renders badge for admin role messages link", async () => {
      mockGetUnreadCount.mockResolvedValue(1);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "a1", name: "Admin", email: "a@test.com", role: "admin" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const messagesLink = screen.getByRole("link", { name: /Messages/ });
      expect(messagesLink).toHaveAttribute("href", "/admin/messages");
      expect(messagesLink).toHaveTextContent("1");
    });

    it("does not show badge on non-message links like Dashboard", async () => {
      mockGetUnreadCount.mockResolvedValue(3);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "u1", name: "User", email: "u@test.com", role: "user" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const dashboardLink = screen.getByRole("link", { name: /Dashboard/ });
      expect(dashboardLink).not.toHaveTextContent(/\d/);
    });

    it("shows badge only on Messages link not on Team link (super_admin)", async () => {
      mockGetUnreadCount.mockResolvedValue(7);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "sa1", name: "Super", email: "s@test.com", role: "super_admin" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const teamLink = screen.getByRole("link", { name: /Team/ });
      expect(teamLink).not.toHaveTextContent(/\d/);
      const messagesLink = screen.getByRole("link", { name: /Messages/ });
      expect(messagesLink).toHaveTextContent("7");
    });

    it("has correct badge styling classes", async () => {
      mockGetUnreadCount.mockResolvedValue(1);
      vi.mocked(useSession).mockReturnValue(
        session({ id: "u1", name: "User", email: "u@test.com", role: "user" }),
      );
      const user = userEvent.setup();
      renderWithClient(<AccountPopover />);
      await user.click(screen.getByRole("button"));
      const messagesLink = screen.getByRole("link", { name: /Messages/ });
      const badge = messagesLink.querySelector("span");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-error");
      expect(badge).toHaveClass("rounded-full");
    });
  });
});
