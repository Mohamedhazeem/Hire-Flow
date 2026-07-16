import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockMutateAsync = vi.fn().mockResolvedValue({});
vi.mock("@/app/features/user/hooks/use-resumes", () => ({
  useUpdateBuilderData: () => ({ mutateAsync: mockMutateAsync, isPending: false }),
}));

const mockSaveResumeBuilder = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/app/features/user/actions/save-resume-builder", () => ({
  saveResumeBuilder: (...args: unknown[]) => mockSaveResumeBuilder(...args),
}));

import { ResumeBuilderForm } from "@/app/features/user/components/resume-builder-form";

describe("ResumeBuilderForm", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders the label and summary fields", () => {
    render(<ResumeBuilderForm />);
    expect(screen.getByLabelText(/Resume Label/)).toBeInTheDocument();
    expect(screen.getByLabelText("Professional Summary")).toBeInTheDocument();
  });

  it("shows empty-state text for education and experience", () => {
    render(<ResumeBuilderForm />);
    expect(screen.getByText("No education entries.")).toBeInTheDocument();
    expect(screen.getByText("No experience entries.")).toBeInTheDocument();
  });

  it("adds an education entry when Add is clicked", async () => {
    const user = userEvent.setup();
    render(<ResumeBuilderForm />);
    const eduSection = screen.getByText("Education").closest("div")!.parentElement!;
    await user.click(within(eduSection).getByRole("button", { name: "Add" }));
    expect(screen.getByPlaceholderText("School")).toBeInTheDocument();
    expect(screen.queryByText("No education entries.")).not.toBeInTheDocument();
  });

  it("adds an experience entry when Add is clicked", async () => {
    const user = userEvent.setup();
    render(<ResumeBuilderForm />);
    const expSection = screen.getByText("Experience").closest("div")!.parentElement!;
    await user.click(within(expSection).getByRole("button", { name: "Add" }));
    expect(screen.getByPlaceholderText("Company")).toBeInTheDocument();
  });

  it("adds and removes a skill chip", async () => {
    const user = userEvent.setup();
    render(<ResumeBuilderForm />);
    const skillInput = screen.getByPlaceholderText("Type a skill and press Enter");
    await user.type(skillInput, "TypeScript{Enter}");
    expect(screen.getByText("TypeScript")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Remove TypeScript"));
    expect(screen.queryByText("TypeScript")).not.toBeInTheDocument();
  });

  it("does not add duplicate skills", async () => {
    const user = userEvent.setup();
    render(<ResumeBuilderForm />);
    const skillInput = screen.getByPlaceholderText("Type a skill and press Enter");
    await user.type(skillInput, "React{Enter}");
    await user.type(skillInput, "React{Enter}");
    expect(screen.getAllByText("React")).toHaveLength(1);
  });

  it("shows the Save label for a new resume and Update for an edit", () => {
    const { rerender } = render(<ResumeBuilderForm />);
    expect(screen.getByRole("button", { name: "Save Resume" })).toBeInTheDocument();

    rerender(<ResumeBuilderForm resumeId="r-1" />);
    expect(screen.getByRole("button", { name: "Update Resume" })).toBeInTheDocument();
  });

  it("navigates away when Cancel is clicked", async () => {
    const user = userEvent.setup();
    render(<ResumeBuilderForm />);
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(mockPush).toHaveBeenCalledWith("/user/resumes");
  });
});
