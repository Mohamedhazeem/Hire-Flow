import { BasePage } from "./base-page";
import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export class MessagesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get path() {
    return "/recruiter/messages";
  }

  async sendMessage(text: string) {
    await this.page.fill('textarea, input[type="text"], [contenteditable="true"]', text);
    const sendBtn = this.page.getByRole("button", { name: /send|submit/i }).first();
    if (await sendBtn.isVisible()) {
      await sendBtn.click();
    } else {
      await this.page.keyboard.press("Enter");
    }
    await this.page.waitForTimeout(300);
  }

  async assertMessageVisible(text: string) {
    await expect(this.page.getByText(text).first()).toBeVisible();
  }
}
