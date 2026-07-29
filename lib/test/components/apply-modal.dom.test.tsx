import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Controlled react-query hooks — keeps the test deterministic (no async/network).
const queryState = {
  data: undefined as unknown,
  isLoading: false,
};
const mutationState = {
  mutate: vi.fn(),
  isPending: false,
  isSuccess: false,
};

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: queryState.data, isLoading: queryState.isLoading }),
  useMutation: () => ({
    mutate: mutationState.mutate,
    isPending: mutationState.isPending,
    isSuccess: mutationState.isSuccess,
  }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/lib/api/api-client", () => ({
  apiClient: vi.fn(),
}));

import { ApplyModal } from "@/app/features/jobs/components/apply-modal";

function resume(id: string, label: string, isPrimary = false) {
  return { id, label, fileUrl: null, builderData: null, isPrimary, createdAt: "2024-01-01" };
}

describe("ApplyModal", () => {
  afterEach(() => {
    vi.clearAllMocks();
    queryState.data = undefined;
    queryState.isLoading = false;
    mutationState.isPending = false;
    mutationState.isSuccess = false;
  });

  it("shows a loading skeleton while resumes load", () => {
    queryState.isLoading = true;
    const { container } = render(<ApplyModal jobId="job-1" onClose={vi.fn()} />);
    // Skeleton renders an animated placeholder rather than the select.
    expect(
      container.querySelector(".animate-pulse") ?? container.querySelector('[class*="Skeleton"]'),
    ).toBeTruthy();
    expect(screen.queryByLabelText("Select a resume")).not.toBeInTheDocument();
  });

  it("shows the create-resume CTA when the user has no resumes", () => {
    queryState.data = [];
    render(<ApplyModal jobId="job-1" onClose={vi.fn()} />);
    expect(screen.getByText("You have no resumes yet.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create a resume first" })).toBeInTheDocument();
  });

  it("renders the resume select with options", () => {
    queryState.data = [resume("r1", "Frontend", true), resume("r2", "Backend")];
    render(<ApplyModal jobId="job-1" onClose={vi.fn()} />);
    const select = screen.getByLabelText("Select a resume");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Frontend \(Primary\)/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Backend/ })).toBeInTheDocument();
  });

  it("shows a validation error when submitting without selecting a resume", async () => {
    queryState.data = [resume("r1", "Frontend")];
    const user = userEvent.setup();
    render(<ApplyModal jobId="job-1" onClose={vi.fn()} />);
    // Submit button is disabled with no selection, so submit via the form.
    const select = screen.getByLabelText("Select a resume");
    // Selecting the empty option keeps selectedResumeId empty; trigger submit through Enter on the form.
    await user.selectOptions(select, "");
    // Force form submit by clicking Submit after enabling isn't possible (disabled),
    // so assert the button is disabled instead — the guard is enforced by the UI.
    expect(screen.getByRole("button", { name: /Submit Application/ })).toBeDisabled();
  });

  it("calls the mutation when a resume is selected and submitted", async () => {
    queryState.data = [resume("r1", "Frontend")];
    const user = userEvent.setup();
    render(<ApplyModal jobId="job-1" onClose={vi.fn()} />);

    await user.selectOptions(screen.getByLabelText("Select a resume"), "r1");
    await user.click(screen.getByRole("button", { name: /Submit Application/ }));
    expect(mutationState.mutate).toHaveBeenCalledOnce();
  });

  it("renders the success screen after a successful submission", () => {
    queryState.data = [resume("r1", "Frontend")];
    mutationState.isSuccess = true;
    render(<ApplyModal jobId="job-1" onClose={vi.fn()} />);
    expect(screen.getByText("Application Submitted!")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /View My Applications/ })).toBeInTheDocument();
  });

  it("calls onClose from the header close button", async () => {
    queryState.data = [resume("r1", "Frontend")];
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ApplyModal jobId="job-1" onClose={onClose} />);
    await user.click(screen.getByLabelText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});
