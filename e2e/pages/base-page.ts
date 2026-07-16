import type { Page, Locator } from "@playwright/test";

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  abstract get path(): string;

  async goto() {
    await this.page.goto(this.path);
    await this.page.waitForLoadState("networkidle");
  }

  async isLoaded(): Promise<boolean> {
    return this.page.url().includes(this.path);
  }

  protected locator(selector: string): Locator {
    return this.page.locator(selector);
  }

  protected getByRole(role: string, options?: { name?: string | RegExp }): Locator {
    return this.page.getByRole(role as unknown as Parameters<Page["getByRole"]>[0], options);
  }

  protected getByText(text: string | RegExp): Locator {
    return this.page.getByText(text);
  }

  protected getByLabel(label: string | RegExp): Locator {
    return this.page.getByLabel(label);
  }

  protected getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }
}
