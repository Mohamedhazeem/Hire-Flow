import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";

export class RecruiterPipelinePage extends BasePage {
  constructor(
    page: Page,
    private readonly jobId: string,
  ) {
    super(page);
  }

  get path() {
    return `/recruiter/jobs/${this.jobId}/applicants`;
  }

  async assertApplicantVisible(name: string) {
    await this.page.getByText(name).first().waitFor({ state: "visible" });
  }

  async clickApplicantRow(name: string) {
    await this.page.getByText(name).first().click();
  }
}
