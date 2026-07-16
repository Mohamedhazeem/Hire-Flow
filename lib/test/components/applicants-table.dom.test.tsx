import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactElement } from "react";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Control the orchestrator hook so we can drive the table's render branches
// without touching the network or the many child hooks it composes.
const tableState = {
  isLoading: false,
  isError: false,
  applicants: [] as Array<Record<string, unknown>>,
};

function makeTable() {
  return {
    recruiterId: "rec-1",
    isLoading: tableState.isLoading,
    isError: tableState.isError,
    applicants: tableState.applicants,
    selectedRows: [],
    selectedIds: new Set<string>(),
    setSelectedIds: vi.fn(),
    actionedIds: new Set<string>(),
    searchParams: new URLSearchParams(),
    searchInput: "",
    setSearchInput: vi.fn(),
    status: "all",
    updateParams: vi.fn(),
    responseData: { page: 1, totalPages: 1, total: tableState.applicants.length, hasPrevPage: false, hasNextPage: false },
    dialog: { type: "", applicant: null },
    setDialog: vi.fn(),
    bulkDialog: "",
    setBulkDialog: vi.fn(),
    revertTarget: null,
    setRevertTarget: vi.fn(),
    feedback: null,
    setFeedback: vi.fn(),
    bulkTransition: { isPending: false },
    revertTransition: { isPending: false },
    handleBulkAction: vi.fn(),
    handleBulkRejectConfirm: vi.fn(),
    handleRevert: vi.fn(),
  };
}

vi.mock("@/app/features/recruiter/components/use-applicants-table", () => ({
  useApplicantsTable: () => makeTable(),
}));

import { ApplicantsTable } from "@/app/features/recruiter/components/applicants-table";

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("ApplicantsTable", () => {
  afterEach(() => {
    vi.clearAllMocks();
    tableState.isLoading = false;
    tableState.isError = false;
    tableState.applicants = [];
  });

  it("renders loading skeletons while data loads", () => {
    tableState.isLoading = true;
    const { container } = renderWithClient(<ApplicantsTable jobId="job-1" />);
    expect(container.querySelectorAll('[class*="rounded"]').length).toBeGreaterThan(0);
    // The toolbar search box is not rendered during loading.
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("renders an error message when the query fails", () => {
    tableState.isError = true;
    renderWithClient(<ApplicantsTable jobId="job-1" />);
    expect(screen.getByText(/Failed to load applicants/)).toBeInTheDocument();
  });

  it("renders the empty-state message when there are no applicants", () => {
    tableState.applicants = [];
    renderWithClient(<ApplicantsTable jobId="job-1" />);
    expect(screen.getByText("No applicants yet for this job.")).toBeInTheDocument();
  });
});
