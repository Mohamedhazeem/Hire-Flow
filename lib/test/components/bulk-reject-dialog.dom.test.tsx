import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BulkRejectDialog } from "@/app/features/recruiter/components/bulk-reject-dialog";

describe("BulkRejectDialog", () => {
  it("renders selected count in title and description", () => {
    render(
      <BulkRejectDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedCount={3}
        onConfirm={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByText("Reject 3 Applicants")).toBeInTheDocument();
    expect(screen.getByText(/all 3 selected/)).toBeInTheDocument();
  });

  it("submit button is disabled when reason is empty", () => {
    render(
      <BulkRejectDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedCount={1}
        onConfirm={vi.fn()}
        isPending={false}
      />,
    );
    expect(screen.getByRole("button", { name: "Reject All" })).toBeDisabled();
  });

  it("submit button is enabled after typing a reason", async () => {
    const user = userEvent.setup();
    render(
      <BulkRejectDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedCount={1}
        onConfirm={vi.fn()}
        isPending={false}
      />,
    );

    const textarea = screen.getByPlaceholderText(/Didn't meet/);
    await user.type(textarea, "Not a good fit");

    expect(screen.getByRole("button", { name: "Reject All" })).toBeEnabled();
  });

  it("calls onConfirm with the typed reason on submit", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();

    render(
      <BulkRejectDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedCount={1}
        onConfirm={onConfirm}
        isPending={false}
      />,
    );

    const textarea = screen.getByPlaceholderText(/Didn't meet/);
    await user.type(textarea, "Position filled");

    await user.click(screen.getByRole("button", { name: "Reject All" }));
    expect(onConfirm).toHaveBeenCalledWith("Position filled");
  });

  it("shows spinner when isPending", () => {
    render(
      <BulkRejectDialog
        open={true}
        onOpenChange={vi.fn()}
        selectedCount={1}
        onConfirm={vi.fn()}
        isPending={true}
      />,
    );
    const button = screen.getByRole("button", { name: /Reject/ });
    expect(button.querySelector(".animate-spin")).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
