import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class UserApplicationsPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get path() {
    return "/user/applications";
  }

  async assertApplicationRow(status: string) {
    await expect(this.page.getByText(status, { exact: false }).first()).toBeVisible();
  }
}
