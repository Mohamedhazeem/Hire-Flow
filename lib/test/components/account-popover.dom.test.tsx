import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// use-sign-out returns an async fn; we only need a stable spy.
const mockSignOut = vi.fn();
vi.mock("@/app/features/public/hooks/use-sign-out", () => ({
  useSignOut: () => mockSignOut,
}));

// useSession is globally mocked in vitest.setup; import the mocked symbol to control it.
import { useSession } from "@/app/features/auth/libs/auth-client";
import { AccountPopover } from "@/app/features/public/components/account-popover";

type SessionResult = ReturnType<typeof useSession>;

function session(user: Record<string, unknown> | null): SessionResult {
  return { data: user ? { user } : null, isPending: false } as unknown as SessionResult;
}

describe("AccountPopover", () => {
  beforeEach(() => {
    // Radix Popover + ThemeToggle rely on DOM APIs jsdom does not implement.
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
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it("renders nothing when there is no authenticated user", () => {
    vi.mocked(useSession).mockReturnValue(session(null));
    const { container } = render(<AccountPopover />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the avatar trigger when authenticated", () => {
    vi.mocked(useSession).mockReturnValue(
      session({ id: "u1", name: "Jane Doe", email: "jane@example.com", role: "user" }),
    );
    render(<AccountPopover />);
    // The trigger renders the user's initials via AvatarFallback.
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("opens the popover and shows user details, dashboard link and sign out", async () => {
    vi.mocked(useSession).mockReturnValue(
      session({ id: "u1", name: "Recruiter Rita", email: "rita@example.com", role: "recruiter" }),
    );
    const user = userEvent.setup();
    render(<AccountPopover />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByText("Recruiter Rita")).toBeInTheDocument();
    expect(screen.getByText("rita@example.com")).toBeInTheDocument();
    expect(screen.getByText("Recruiter")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/recruiter",
    );
  });

  it("routes admins to the admin dashboard", async () => {
    vi.mocked(useSession).mockReturnValue(
      session({ id: "a1", name: "Admin Al", email: "al@example.com", role: "admin" }),
    );
    const user = userEvent.setup();
    render(<AccountPopover />);
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("link", { name: /Dashboard/ })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  it("calls sign out when the Sign Out button is clicked", async () => {
    vi.mocked(useSession).mockReturnValue(
      session({ id: "u1", name: "Jane Doe", email: "jane@example.com", role: "user" }),
    );
    const user = userEvent.setup();
    render(<AccountPopover />);
    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("button", { name: /Sign Out/ }));
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});
