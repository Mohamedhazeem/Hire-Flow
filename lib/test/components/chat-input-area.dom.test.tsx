import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { ChatInputArea } from "@/components/chat/chat-input-area";

function baseProps() {
  return {
    input: "",
    onInputChange: vi.fn(),
    onSubmit: vi.fn((e: { preventDefault: () => void }) => e.preventDefault()),
    selectedFile: null as File | null,
    fileError: null as string | null,
    isSending: false,
    onFileSelect: vi.fn(),
    onFileRemove: vi.fn(),
    fileInputRef: createRef<HTMLInputElement>(),
  };
}

describe("ChatInputArea", () => {
  it("disables submit when there is no input and no file", () => {
    render(<ChatInputArea {...baseProps()} />);
    const submit = screen.getByRole("button", { name: "" }) as HTMLButtonElement;
    // The submit button is the only type=submit button in the form.
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => (b as HTMLButtonElement).type === "submit");
    expect(submitBtn).toBeDisabled();
    void submit;
  });

  it("enables submit when input has non-whitespace text", () => {
    render(<ChatInputArea {...baseProps()} input="hello" />);
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => (b as HTMLButtonElement).type === "submit");
    expect(submitBtn).toBeEnabled();
  });

  it("keeps submit disabled for whitespace-only input", () => {
    render(<ChatInputArea {...baseProps()} input="   " />);
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => (b as HTMLButtonElement).type === "submit");
    expect(submitBtn).toBeDisabled();
  });

  it("calls onInputChange as the user types", async () => {
    const onInputChange = vi.fn();
    const user = userEvent.setup();
    render(<ChatInputArea {...baseProps()} onInputChange={onInputChange} />);
    await user.type(screen.getByPlaceholderText("Type a message..."), "hi");
    expect(onInputChange).toHaveBeenCalled();
  });

  it("renders the selected file chip with name and remove control", async () => {
    const onFileRemove = vi.fn();
    const user = userEvent.setup();
    const file = new File(["x".repeat(2048)], "report.pdf", { type: "application/pdf" });
    render(<ChatInputArea {...baseProps()} selectedFile={file} onFileRemove={onFileRemove} />);
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText("2.0 KB")).toBeInTheDocument();

    await user.click(screen.getByLabelText("Remove selected file"));
    expect(onFileRemove).toHaveBeenCalledOnce();
  });

  it("renders a file error message", () => {
    render(<ChatInputArea {...baseProps()} fileError="File too large" />);
    expect(screen.getByText("File too large")).toBeInTheDocument();
  });

  it("clicks the hidden file input when the attach button is pressed", async () => {
    const props = baseProps();
    const ref = createRef<HTMLInputElement>();
    const user = userEvent.setup();
    render(<ChatInputArea {...props} fileInputRef={ref} />);
    const clickSpy = vi.fn();
    if (ref.current) ref.current.click = clickSpy;
    await user.click(screen.getByLabelText("Attach file"));
    expect(clickSpy).toHaveBeenCalledOnce();
  });

  it("submits the form via onSubmit", async () => {
    const onSubmit = vi.fn((e: { preventDefault: () => void }) => e.preventDefault());
    const user = userEvent.setup();
    render(<ChatInputArea {...baseProps()} input="hi" onSubmit={onSubmit} />);
    const submitBtn = screen
      .getAllByRole("button")
      .find((b) => (b as HTMLButtonElement).type === "submit")!;
    await user.click(submitBtn);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("disables inputs while sending", () => {
    render(<ChatInputArea {...baseProps()} input="hi" isSending />);
    expect(screen.getByPlaceholderText("Type a message...")).toBeDisabled();
    expect(screen.getByLabelText("Attach file")).toBeDisabled();
  });
});
