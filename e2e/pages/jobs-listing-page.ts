import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";

export class JobsListingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get path() {
    return "/jobs";
  }

  async openJobDetail(jobId: string) {
    await this.page.goto(`/jobs/${jobId}`);
    await this.page.waitForLoadState("networkidle");
  }
}
