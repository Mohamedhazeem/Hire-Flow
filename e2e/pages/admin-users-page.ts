import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";

export class AdminUsersPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get path() {
    return "/admin/users";
  }

  async banUser(userRowSelector: string) {
    await this.page.locator(userRowSelector).first().click();
  }
}
