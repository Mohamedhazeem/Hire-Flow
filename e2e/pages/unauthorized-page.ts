import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class UnauthorizedPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get path() {
    return "/unauthorized";
  }

  async assertUnauthorizedText() {
    await expect(
      this.page.getByText(/unauthorized|forbidden|not permitted/i).first(),
    ).toBeVisible();
  }
}
