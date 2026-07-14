import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

const mockState = {
  bookmarkedIds: [] as string[],
  toggle: vi.fn(),
};

vi.mock("@/app/features/auth/libs/auth-client", () => ({
  useSession: vi.fn(),
}));

import { useSession } from "@/app/features/auth/libs/auth-client";

vi.mock("@/app/features/user/hooks/use-saved-jobs", () => ({
  useBookmarkedIds: () => ({ data: mockState.bookmarkedIds, isLoading: false }),
  useToggleBookmark: () => ({
    mutate: mockState.toggle,
    isPending: false,
  }),
}));

import { SaveJobButton } from "@/app/features/user/components/save-job-button";

describe("SaveJobButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockState.bookmarkedIds = [];
  });

  it("redirects to login when no session on click", async () => {
    vi.mocked(useSession).mockReturnValue({ data: null, isPending: false } as any);
    const user = userEvent.setup();

    render(<SaveJobButton jobId="job-1" />);
    await user.click(screen.getByLabelText("Save job"));

    expect(mockPush).toHaveBeenCalledWith("/login?returnUrl=%2F");
  });

  it("shows not-bookmarked state when not in bookmarkedIds", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "u1" } }, isPending: false } as any);
    mockState.bookmarkedIds = [];

    const { container } = render(<SaveJobButton jobId="job-1" />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("shows bookmarked state when in bookmarkedIds", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "u1" } }, isPending: false } as any);
    mockState.bookmarkedIds = ["job-1"];

    const { container } = render(<SaveJobButton jobId="job-1" />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("calls toggle mutation on click when authenticated", async () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "u1" } }, isPending: false } as any);
    mockState.bookmarkedIds = ["job-1"];
    const user = userEvent.setup();

    render(<SaveJobButton jobId="job-1" />);
    await user.click(screen.getByLabelText("Remove saved job"));

    expect(mockState.toggle).toHaveBeenCalledWith("job-1");
  });
});
