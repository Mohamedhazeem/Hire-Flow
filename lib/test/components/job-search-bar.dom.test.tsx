import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
let currentParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => currentParams,
}));

import { JobSearchBar } from "@/app/features/jobs/components/job-search-bar";

describe("JobSearchBar", () => {
  afterEach(() => {
    vi.clearAllMocks();
    currentParams = new URLSearchParams();
  });

  it("renders with the current search value from the URL", () => {
    currentParams = new URLSearchParams("search=engineer");
    render(<JobSearchBar />);
    expect(screen.getByPlaceholderText("Search jobs...")).toHaveValue("engineer");
  });

  it("navigates to /jobs with the search param on submit", async () => {
    const user = userEvent.setup();
    render(<JobSearchBar />);
    await user.type(screen.getByPlaceholderText("Search jobs..."), "designer");
    await user.keyboard("{Enter}");
    expect(mockPush).toHaveBeenCalledWith("/jobs?search=designer");
  });

  it("does not navigate on submit when the field is empty", async () => {
    const user = userEvent.setup();
    render(<JobSearchBar />);
    // Focus the input and press Enter without typing.
    await user.click(screen.getByPlaceholderText("Search jobs..."));
    await user.keyboard("{Enter}");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("clears the search and navigates without the search param", async () => {
    currentParams = new URLSearchParams("search=engineer&workMode=remote");
    const user = userEvent.setup();
    render(<JobSearchBar />);
    await user.click(screen.getByLabelText("Clear search"));
    expect(mockPush).toHaveBeenCalledWith("/jobs?workMode=remote");
  });

  it("resets pagination when navigating", async () => {
    currentParams = new URLSearchParams("page=3");
    const user = userEvent.setup();
    render(<JobSearchBar />);
    await user.type(screen.getByPlaceholderText("Search jobs..."), "qa");
    await user.keyboard("{Enter}");
    const url = mockPush.mock.calls[0][0] as string;
    expect(url).toContain("search=qa");
    expect(url).not.toContain("page=");
  });
});
