import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const queryState = {
  data: undefined as unknown,
  isLoading: false,
  isError: false,
};

vi.mock("@tanstack/react-query", () => ({
  useQuery: () => ({ data: queryState.data, isLoading: queryState.isLoading, isError: queryState.isError }),
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}));

vi.mock("@/lib/api/api-client", () => ({
  apiClient: vi.fn(),
}));

vi.mock("@/components/shared/job-meta-grid", () => ({
  JobMetaGrid: () => <div data-testid="job-meta-grid">JobMetaGrid</div>,
}));

vi.mock("@/components/shared/section-card", () => ({
  SectionCard: ({ children, title, count, countLabel }: { children: React.ReactNode; title: string; count?: number; countLabel?: string }) => (
    <div data-testid={`section-card-${title}`} data-count={count ?? ""} data-countlabel={countLabel ?? ""}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/shared/job-detail-tabs", () => ({
  JobDetailTabs: ({ tabs, baseHref }: { tabs: Array<{ label: string }>; baseHref: string }) => (
    <div data-testid="job-detail-tabs">
      {tabs.map((t, i) => (
        <span key={i}>{t.label}</span>
      ))}
    </div>
  ),
}));

vi.mock("@/components/ui/badge", () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}));

vi.mock("@/components/ui/skeleton", () => ({
  Skeleton: () => <div data-testid="skeleton">Loading...</div>,
}));

vi.mock("@/app/features/recruiter/components/applicants-table", () => ({
  ApplicantsTable: ({ jobId, pageSize }: { jobId: string; pageSize?: number }) => (
    <div data-testid="applicants-table" data-jobid={jobId} data-pagesize={String(pageSize ?? 20)}>
      ApplicantsTable
    </div>
  ),
}));

import { JobDetail } from "@/app/features/recruiter/components/job-detail";

describe("JobDetail", () => {
  afterEach(() => {
    vi.clearAllMocks();
    queryState.data = undefined;
    queryState.isLoading = false;
    queryState.isError = false;
  });

  it("renders loading skeletons while data loads", () => {
    queryState.isLoading = true;
    const { container } = render(<JobDetail jobId="job-1" />);
    const skeletons = container.querySelectorAll('[data-testid="skeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders an error message when the query fails", () => {
    queryState.isError = true;
    render(<JobDetail jobId="job-1" />);
    expect(screen.getByText(/Failed to load job details/)).toBeInTheDocument();
    const backButton = screen.getByText(/Back to jobs/);
    expect(backButton.closest("button")).toBeInTheDocument();
  });

  it("renders job details, tabs, and applicants table on success", () => {
    queryState.data = {
      data: {
        job: {
          id: "job-1",
          title: "Test Job",
          status: "active",
          description: "Test description",
          applicationCount: 5,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      },
    };
    render(<JobDetail jobId="job-1" />);

    expect(screen.getByText("Test Job")).toBeInTheDocument();
    expect(screen.getByTestId("badge")).toHaveTextContent("Active");
    expect(screen.getByTestId("job-detail-tabs")).toBeInTheDocument();
    expect(screen.getByTestId("job-meta-grid")).toBeInTheDocument();
    expect(screen.getByTestId("section-card-Description")).toBeInTheDocument();
    expect(screen.getByTestId("applicants-table")).toHaveAttribute("data-jobid", "job-1");
  });

  it("passes pageSize=10 to ApplicantsTable", () => {
    queryState.data = {
      data: {
        job: {
          id: "job-1",
          title: "Test Job",
          status: "active",
          description: "Test description",
          applicationCount: 5,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      },
    };
    render(<JobDetail jobId="job-1" />);
    const table = screen.getByTestId("applicants-table");
    expect(table).toHaveAttribute("data-pagesize", "10");
  });

  it("renders back link to recruiter jobs list", () => {
    queryState.data = {
      data: {
        job: {
          id: "job-1",
          title: "Test Job",
          status: "draft",
          description: "Test description",
          applicationCount: 0,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      },
    };
    render(<JobDetail jobId="job-1" />);
    const backLink = screen.getByRole("link", { name: "" });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute("href", "/recruiter/jobs");
  });

  it("shows Edit button only when job is not archived", () => {
    queryState.data = {
      data: {
        job: {
          id: "job-1",
          title: "Test Job",
          status: "active",
          description: "Test description",
          applicationCount: 0,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      },
    };
    render(<JobDetail jobId="job-1" />);
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("hides Edit button when job is archived", () => {
    queryState.data = {
      data: {
        job: {
          id: "job-1",
          title: "Archived Job",
          status: "archived",
          description: "Test description",
          applicationCount: 0,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      },
    };
    render(<JobDetail jobId="job-1" />);
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("renders Tab headers without a back arrow on View Details", () => {
    queryState.data = {
      data: {
        job: {
          id: "job-1",
          title: "Test Job",
          status: "active",
          description: "Test description",
          applicationCount: 5,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      },
    };
    render(<JobDetail jobId="job-1" />);
    const tabs = screen.getByTestId("job-detail-tabs");
    expect(tabs).toHaveTextContent("View Details");
    expect(tabs).toHaveTextContent("Applicants");
    expect(tabs).toHaveTextContent("Analytics");
  });

  it("renders applicants section replaced by ApplicantsTable", () => {
    queryState.data = {
      data: {
        job: {
          id: "job-1",
          title: "Test Job",
          status: "active",
          description: "Test description",
          applicationCount: 5,
          createdAt: new Date("2024-01-01"),
          updatedAt: new Date("2024-01-02"),
        },
      },
    };
    render(<JobDetail jobId="job-1" />);
    expect(screen.getByTestId("applicants-table")).toBeInTheDocument();
    expect(screen.queryByTestId("section-card-Applicants")).not.toBeInTheDocument();
  });
});
