import { describe, it, expect } from "vitest";
import { JOB_CATEGORIES } from "@/lib/job-categories";

describe("JOB_CATEGORIES", () => {
  it("has 5 entries", () => {
    expect(JOB_CATEGORIES).toHaveLength(5);
  });

  it("each entry has label and filter properties", () => {
    for (const category of JOB_CATEGORIES) {
      expect(category).toHaveProperty("label");
      expect(category).toHaveProperty("filter");
    }
  });

  it("Technology category has industry filter", () => {
    const tech = JOB_CATEGORIES.find((c) => c.label === "Technology");
    expect(tech?.filter).toEqual({ industry: "Technology" });
  });

  it("Remote category has workMode filter", () => {
    const remote = JOB_CATEGORIES.find((c) => c.label === "Remote");
    expect(remote?.filter).toEqual({ workMode: "remote" });
  });

  it("Healthcare, Finance, Marketing have industry filters", () => {
    for (const label of ["Healthcare", "Finance", "Marketing"]) {
      const cat = JOB_CATEGORIES.find((c) => c.label === label);
      expect(cat?.filter).toEqual({ industry: label });
    }
  });
});
