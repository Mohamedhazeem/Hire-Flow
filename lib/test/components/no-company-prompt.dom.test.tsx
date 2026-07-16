import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NoCompanyPrompt } from "@/app/features/recruiter/components/no-company-prompt";

describe("NoCompanyPrompt", () => {
  it("renders the welcome heading", () => {
    render(<NoCompanyPrompt />);
    expect(screen.getByRole("heading", { name: "Welcome to HireFlow" })).toBeInTheDocument();
  });

  it("links to the company creation page", () => {
    render(<NoCompanyPrompt />);
    const link = screen.getByRole("link", { name: /Create Company Profile/ });
    expect(link).toHaveAttribute("href", "/recruiter/company");
  });
});
