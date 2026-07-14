import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusTimeline, type StatusTimelineEntry } from "@/components/shared/status-timeline";

describe("StatusTimeline", () => {
  it("renders empty state when entries is empty", () => {
    render(<StatusTimeline entries={[]} />);
    expect(screen.getByText("No status history available.")).toBeInTheDocument();
  });

  it("renders single entry label", () => {
    const entries: StatusTimelineEntry[] = [
      { id: "1", type: "status_change", fromStatus: "applied", toStatus: "reviewing", label: "Under Review", changedByName: null, note: null, createdAt: new Date().toISOString(), isUpcoming: false },
    ];
    render(<StatusTimeline entries={entries} />);
    expect(screen.getByText("Under Review")).toBeInTheDocument();
  });

  it("renders multiple entries in order", () => {
    const entries: StatusTimelineEntry[] = [
      { id: "1", type: "application_submitted", fromStatus: null, toStatus: "applied", label: "Application Submitted", changedByName: null, note: null, createdAt: new Date(Date.now() - 86400000).toISOString(), isUpcoming: false },
      { id: "2", type: "status_change", fromStatus: "applied", toStatus: "reviewing", label: "Under Review", changedByName: null, note: null, createdAt: new Date().toISOString(), isUpcoming: false },
    ];
    render(<StatusTimeline entries={entries} />);
    expect(screen.getByText("Under Review")).toBeInTheDocument();
    expect(screen.getByText("Application Submitted")).toBeInTheDocument();
  });

  it("handles fromStatus null for first submission entry", () => {
    const entries: StatusTimelineEntry[] = [
      { id: "1", type: "application_submitted", fromStatus: null, toStatus: "applied", label: "Application Submitted", changedByName: null, note: null, createdAt: new Date().toISOString(), isUpcoming: false },
    ];
    render(<StatusTimeline entries={entries} />);
    expect(screen.getByText("Application Submitted")).toBeInTheDocument();
  });

  it("renders upcoming badge", () => {
    const entries: StatusTimelineEntry[] = [
      { id: "1", type: "status_change", fromStatus: "interview_scheduled", toStatus: "interview_scheduled", label: "Interview Scheduled", changedByName: null, note: null, createdAt: new Date(Date.now() + 86400000).toISOString(), isUpcoming: true },
    ];
    render(<StatusTimeline entries={entries} />);
    expect(screen.getByText("Upcoming")).toBeInTheDocument();
  });

  it("renders note text", () => {
    const entries: StatusTimelineEntry[] = [
      { id: "1", type: "status_change", fromStatus: "applied", toStatus: "rejected", label: "Rejected", changedByName: null, note: "Not enough experience", createdAt: new Date().toISOString(), isUpcoming: false },
    ];
    render(<StatusTimeline entries={entries} />);
    expect(screen.getByText("Not enough experience")).toBeInTheDocument();
  });

  it("renders changed by name", () => {
    const entries: StatusTimelineEntry[] = [
      { id: "1", type: "status_change", fromStatus: "applied", toStatus: "reviewing", label: "Under Review", changedByName: "Recruiter Jane", note: null, createdAt: new Date().toISOString(), isUpcoming: false },
    ];
    render(<StatusTimeline entries={entries} />);
    expect(screen.getByText(/by Recruiter Jane/)).toBeInTheDocument();
  });
});
