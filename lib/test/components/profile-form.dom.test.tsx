import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockPush = vi.fn();
const mockPathname = "/user/profile";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname,
}));

const mockUpsertProfile = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/app/features/user/actions/upsert-profile", () => ({
  upsertProfile: (...args: unknown[]) => mockUpsertProfile(...args),
}));

import { ProfileForm } from "@/app/features/user/components/profile-form";

describe("ProfileForm", () => {
  afterEach(() => vi.clearAllMocks());

  it("renders all form sections", () => {
    render(<ProfileForm />);
    expect(screen.getByLabelText("Headline")).toBeInTheDocument();
    expect(screen.getByText("Bio")).toBeInTheDocument();
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByText("Pay Expectations (USD)")).toBeInTheDocument();
    expect(screen.getByText("Experience")).toBeInTheDocument();
    expect(screen.getByText("Social Links")).toBeInTheDocument();
  });

  it("pre-fills from defaultValues", () => {
    render(
      <ProfileForm
        defaultValues={{
          headline: "Senior Engineer",
          bio: "A bio",
          location: "NYC",
          skills: ["React", "TypeScript"],
          workMode: null,
          basePay: 120000,
          ctc: null,
          ectc: null,
          experiences: [],
          socialLinks: [],
        }}
      />,
    );
    expect(screen.getByDisplayValue("Senior Engineer")).toBeInTheDocument();
    expect(screen.getByDisplayValue("A bio")).toBeInTheDocument();
    expect(screen.getByDisplayValue("NYC")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove React")).toBeInTheDocument();
    expect(screen.getByLabelText("Remove TypeScript")).toBeInTheDocument();
    expect(screen.getByDisplayValue("120000")).toBeInTheDocument();
  });

  it("calls upsertProfile with skills on submit", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    // Fill headline (required for meaningful submit)
    await user.type(screen.getByLabelText("Headline"), "Test Engineer");

    // Add a skill via SkillInput
    const skillInput = screen.getByPlaceholderText("Search or type a skill...");
    await user.type(skillInput, "React");
    await user.click(screen.getByRole("option", { name: "React" }));
    expect(screen.getByLabelText("Remove React")).toBeInTheDocument();

    // Submit
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(mockUpsertProfile).toHaveBeenCalledTimes(1);
    });

    const callArg = mockUpsertProfile.mock.calls[0][0];
    expect(callArg).toHaveProperty("skills");
    expect(callArg.skills).toContain("React");
  });

  it("includes multiple skills in submission", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText("Headline"), "Test Engineer");

    // Add first skill
    const skillInput = screen.getByPlaceholderText("Search or type a skill...");
    await user.type(skillInput, "React");
    await user.click(screen.getByRole("option", { name: "React" }));

    // Add second skill
    await user.type(skillInput, "TypeScript");
    await user.click(screen.getByRole("option", { name: "TypeScript" }));

    // Submit
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(mockUpsertProfile).toHaveBeenCalledTimes(1);
    });

    const callArg = mockUpsertProfile.mock.calls[0][0];
    expect(callArg.skills).toContain("React");
    expect(callArg.skills).toContain("TypeScript");
  });

  it("shows success message after submission", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText("Headline"), "Test Engineer");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(screen.getByText("Profile saved successfully")).toBeInTheDocument();
    });
  });

  it("shows server error when upsertProfile throws", async () => {
    mockUpsertProfile.mockRejectedValueOnce(new Error("Server error message"));
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText("Headline"), "Test Engineer");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(screen.getByText("Server error message")).toBeInTheDocument();
    });
  });

  it("submit is disabled while submitting", async () => {
    mockUpsertProfile.mockImplementationOnce(() => new Promise(() => {}));
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText("Headline"), "Test Engineer");
    await user.click(screen.getByRole("button", { name: "Save profile" }));

    expect(screen.getByRole("button", { name: /Saving/ })).toBeDisabled();
  });

  it("submit is disabled when form is unchanged", () => {
    render(<ProfileForm />);
    expect(screen.getByRole("button", { name: "Save profile" })).toBeDisabled();
  });

  it("submit enables after user makes a change", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    const btn = screen.getByRole("button", { name: "Save profile" });
    expect(btn).toBeDisabled();

    await user.type(screen.getByLabelText("Headline"), "Changed");
    expect(btn).not.toBeDisabled();
  });

  it("submits after user modifies form", async () => {
    const user = userEvent.setup();
    render(<ProfileForm />);

    await user.type(screen.getByLabelText("Headline"), "Test");

    await user.click(screen.getByRole("button", { name: "Save profile" }));

    await waitFor(() => {
      expect(mockUpsertProfile).toHaveBeenCalledTimes(1);
    });

    const callArg = mockUpsertProfile.mock.calls[0][0];
    expect(callArg.skills).toEqual([]);
    expect(callArg.headline).toBe("Test");
  });
});
