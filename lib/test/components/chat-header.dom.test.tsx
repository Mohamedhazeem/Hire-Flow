import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatHeader } from "@/components/chat/chat-header";

function baseProps() {
  return {
    chatName: "Jane Doe",
    roleLabel: "Recruiter",
    isOnline: false,
    hasDeleteThread: false,
    confirmDelete: false,
    isDeletingThread: false,
    onDeleteClick: vi.fn(),
    onCancelDelete: vi.fn(),
    onConfirmDelete: vi.fn(),
  };
}

describe("ChatHeader", () => {
  it("renders the chat name and its initial", () => {
    render(<ChatHeader {...baseProps()} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("shows Online when isOnline, role label otherwise", () => {
    const { rerender } = render(<ChatHeader {...baseProps()} isOnline />);
    expect(screen.getByText("Online")).toBeInTheDocument();

    rerender(<ChatHeader {...baseProps()} isOnline={false} />);
    expect(screen.getByText("Recruiter")).toBeInTheDocument();
  });

  it("renders a back button that calls onBack", async () => {
    const onBack = vi.fn();
    const user = userEvent.setup();
    render(<ChatHeader {...baseProps()} onBack={onBack} />);
    await user.click(screen.getByLabelText("Back to messages"));
    expect(onBack).toHaveBeenCalledOnce();
  });

  it("does not render a back button when onBack is omitted", () => {
    render(<ChatHeader {...baseProps()} />);
    expect(screen.queryByLabelText("Back to messages")).not.toBeInTheDocument();
  });

  it("hides delete affordance when hasDeleteThread is false", () => {
    render(<ChatHeader {...baseProps()} hasDeleteThread={false} />);
    expect(screen.queryByLabelText("Delete conversation")).not.toBeInTheDocument();
  });

  it("shows the delete trigger and calls onDeleteClick", async () => {
    const onDeleteClick = vi.fn();
    const user = userEvent.setup();
    render(<ChatHeader {...baseProps()} hasDeleteThread onDeleteClick={onDeleteClick} />);
    await user.click(screen.getByLabelText("Delete conversation"));
    expect(onDeleteClick).toHaveBeenCalledOnce();
  });

  it("shows confirm/cancel controls when confirmDelete", async () => {
    const onCancelDelete = vi.fn();
    const onConfirmDelete = vi.fn();
    const user = userEvent.setup();
    render(
      <ChatHeader
        {...baseProps()}
        hasDeleteThread
        confirmDelete
        onCancelDelete={onCancelDelete}
        onConfirmDelete={onConfirmDelete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancelDelete).toHaveBeenCalledOnce();

    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirmDelete).toHaveBeenCalledOnce();
  });

  it("disables the confirm button and shows a spinner while deleting", () => {
    render(<ChatHeader {...baseProps()} hasDeleteThread confirmDelete isDeletingThread />);
    // While deleting the label text is replaced by a spinner icon.
    const buttons = screen.getAllByRole("button");
    const confirm = buttons.find((b) => b.querySelector(".animate-spin"));
    expect(confirm).toBeDefined();
    expect(confirm).toBeDisabled();
  });

  it("falls back to '?' when chatName is empty", () => {
    render(<ChatHeader {...baseProps()} chatName="" />);
    expect(screen.getByText("?")).toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });
});
