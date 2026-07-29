import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";

export class JobDetailPage extends BasePage {
  constructor(
    page: Page,
    private readonly jobId: string,
  ) {
    super(page);
  }

  get path() {
    return `/jobs/${this.jobId}`;
  }

  async clickLogInToApply() {
    await this.page.getByRole("link", { name: "Log in to Apply" }).click();
    await this.page.waitForLoadState("networkidle");
  }

  async clickApplyNow() {
    await this.page.getByRole("button", { name: "Apply Now" }).click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async selectResume(label: string) {
    await this.page.getByLabel("Select a resume").selectOption({ label });
  }

  async fillCoverLetter(text: string) {
    await this.page.locator("textarea").fill(text);
  }

  async submitApplication() {
    await this.page.getByRole("button", { name: "Submit Application" }).click();
    await this.page.waitForLoadState("networkidle");
  }

  async waitForApplicationSuccess() {
    await this.page.getByText("Application Submitted!").waitFor({ state: "visible" });
    await this.page.waitForLoadState("networkidle");
  }
}
