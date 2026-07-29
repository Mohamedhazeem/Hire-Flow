import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class RecruiterApplicantDetailPage extends BasePage {
  constructor(
    page: Page,
    private readonly applicationId: string,
  ) {
    super(page);
  }

  get path() {
    return `/recruiter/applicants/${this.applicationId}`;
  }

  async assertStatus(status: string) {
    await expect(this.page.getByText(status, { exact: false }).first()).toBeVisible();
  }
}
