import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiSuggestionsPanel } from "@/app/features/user/components/ai-suggestions-panel";
import type {
  EnhancementsResponse,
  ResumeSuggestion,
} from "@/app/features/user/schema/resume-ai.schema";

function suggestion(overrides: Partial<ResumeSuggestion> = {}): ResumeSuggestion {
  return {
    type: "bullet_improvement",
    section: "experience",
    original: "Did stuff",
    suggestion: "Led a team of 5 engineers",
    reasoning: "Quantify impact",
    priority: "high",
    ...overrides,
  };
}

function result(overrides: Partial<EnhancementsResponse> = {}): EnhancementsResponse {
  return {
    suggestions: [suggestion()],
    overallScore: 82,
    keyStrengths: ["Strong impact"],
    improvementAreas: ["Add metrics"],
    ...overrides,
  };
}

describe("AiSuggestionsPanel", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the overall score", () => {
    render(
      <AiSuggestionsPanel
        result={result()}
        isBuilder={false}
        isApplying={false}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("renders key strengths and improvement areas", () => {
    render(
      <AiSuggestionsPanel
        result={result()}
        isBuilder={false}
        isApplying={false}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Strong impact")).toBeInTheDocument();
    expect(screen.getByText("Add metrics")).toBeInTheDocument();
  });

  it("shows the empty state when there are no suggestions", () => {
    render(
      <AiSuggestionsPanel
        result={result({ suggestions: [] })}
        isBuilder={false}
        isApplying={false}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("No specific suggestions found")).toBeInTheDocument();
  });

  it("renders the suggestion text and reasoning", () => {
    render(
      <AiSuggestionsPanel
        result={result()}
        isBuilder={false}
        isApplying={false}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Led a team of 5 engineers")).toBeInTheDocument();
    expect(screen.getByText("Quantify impact")).toBeInTheDocument();
  });

  it("shows the Apply button only in builder mode and calls onApply", async () => {
    const onApply = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(
      <AiSuggestionsPanel
        result={result()}
        isBuilder={false}
        isApplying={false}
        onApply={onApply}
        onClose={vi.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Apply" })).not.toBeInTheDocument();

    rerender(
      <AiSuggestionsPanel
        result={result()}
        isBuilder
        isApplying={false}
        onApply={onApply}
        onClose={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Apply" }));
    expect(onApply).toHaveBeenCalledOnce();
  });

  it("copies the suggestion to the clipboard", async () => {
    // Use fireEvent (not userEvent.setup) so our clipboard stub is not replaced
    // by userEvent's own clipboard implementation.
    render(
      <AiSuggestionsPanel
        result={result()}
        isBuilder={false}
        isApplying={false}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Led a team of 5 engineers");
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <AiSuggestionsPanel
        result={result()}
        isBuilder={false}
        isApplying={false}
        onApply={vi.fn()}
        onClose={onClose}
      />,
    );
    // The header close button is the first non-copy/apply button in the panel.
    const closeBtn = container.querySelector("button")!;
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows the file-upload notice for non-builder resumes with suggestions", () => {
    render(
      <AiSuggestionsPanel
        result={result()}
        isBuilder={false}
        isApplying={false}
        onApply={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/file-uploaded resume/i)).toBeInTheDocument();
  });
});
