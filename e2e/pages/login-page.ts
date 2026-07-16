import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get path() {
    return "/login";
  }

  async login(email: string, password: string) {
    await this.page.fill("#email", email);
    await this.page.fill("#password", password);
    await this.page.getByRole("button", { name: "Sign In" }).click();
    await this.page.waitForLoadState("networkidle");
  }
}
