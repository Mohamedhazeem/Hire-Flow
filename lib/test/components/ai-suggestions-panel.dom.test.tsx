import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiSuggestionsPanel } from "@/app/features/user/components/ai-suggestions-panel";
import type { EnhancementsResponse } from "@/app/features/user/schema/resume-ai.schema";

function result(overrides: Partial<EnhancementsResponse> = {}): EnhancementsResponse {
  return {
    suggestions: [
      {
        type: "bullet_improvement",
        section: "experience",
        original: "Did stuff",
        suggestion: "Led a team of 5 engineers",
        reasoning: "Quantify impact",
        priority: "high",
      },
    ],
    overallScore: 82,
    projectedScore: 92,
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
    render(<AiSuggestionsPanel result={result()} isBuilder={false} onClose={vi.fn()} />);
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("renders the projected score and delta", () => {
    render(<AiSuggestionsPanel result={result()} isBuilder={false} onClose={vi.fn()} />);
    expect(screen.getByText("92")).toBeInTheDocument();
    expect(screen.getByText("+10")).toBeInTheDocument();
  });

  it("shows zero delta when projected equals overall score", () => {
    render(
      <AiSuggestionsPanel
        result={result({ overallScore: 50, projectedScore: 50 })}
        isBuilder={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("+0")).toBeInTheDocument();
  });

  it("renders key strengths and improvement areas", () => {
    render(<AiSuggestionsPanel result={result()} isBuilder={false} onClose={vi.fn()} />);
    expect(screen.getByText("Strong impact")).toBeInTheDocument();
    expect(screen.getByText("Add metrics")).toBeInTheDocument();
  });

  it("shows the empty state when there are no suggestions", () => {
    render(
      <AiSuggestionsPanel
        result={result({ suggestions: [] })}
        isBuilder={false}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText(/No specific suggestions found/)).toBeInTheDocument();
  });

  it("renders the suggestion text and reasoning", () => {
    render(<AiSuggestionsPanel result={result()} isBuilder={false} onClose={vi.fn()} />);
    expect(screen.getByText("Led a team of 5 engineers")).toBeInTheDocument();
    expect(screen.getByText("Quantify impact")).toBeInTheDocument();
  });

  it("renders the original text when present", () => {
    render(<AiSuggestionsPanel result={result()} isBuilder={false} onClose={vi.fn()} />);
    expect(screen.getByText("Did stuff")).toBeInTheDocument();
  });

  it("copies the suggestion to the clipboard", async () => {
    render(<AiSuggestionsPanel result={result()} isBuilder={false} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Led a team of 5 engineers");
    await waitFor(() => expect(screen.getByText("Copied")).toBeInTheDocument());
  });

  it("calls onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    const { container } = render(
      <AiSuggestionsPanel result={result()} isBuilder={false} onClose={onClose} />,
    );
    const closeBtn = container.querySelector("button")!;
    await user.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows the file-upload notice for non-builder resumes with suggestions", () => {
    render(<AiSuggestionsPanel result={result()} isBuilder={false} onClose={vi.fn()} />);
    expect(screen.getByText(/uploaded as a file/i)).toBeInTheDocument();
  });

  it("hides the file-upload notice for builder resumes", () => {
    render(<AiSuggestionsPanel result={result()} isBuilder onClose={vi.fn()} />);
    expect(screen.queryByText(/uploaded as a file/i)).not.toBeInTheDocument();
  });
});
