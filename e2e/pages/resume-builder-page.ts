import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";

export class ResumeBuilderPage extends BasePage {
  constructor(
    page: Page,
    private readonly resumeId: string,
  ) {
    super(page);
  }

  get path() {
    return `/user/resumes/builder/${this.resumeId}`;
  }
}
