import type { Page, Locator } from "@playwright/test";

export class PageObjectBase {
  protected readonly page: Page;
  protected readonly pageName?: string;
  protected readonly pageURL?: string;
  protected locators: Record<string, string> = {};

  constructor(page: Page, locators: Record<string, string>, pageName?: string, pageURL?: string) {
    this.page = page;
    this.locators = locators;
    this.forwardPageMethods();
    this.pageName = pageName;
    this.pageURL = pageURL;
  }

  private forwardPageMethods() {
    Object.getOwnPropertyNames(Object.getPrototypeOf(this.page)).forEach((method) => {
      if (!(method in this) && typeof this.page[method as keyof Page] === 'function') {
        (this as any)[method] = (...args: any[]) => (this.page as any)[method](...args);
      }
    });
  }

  // Forward all methods from Page to this.page
  [key: string]: any;

  // Common utility methods
  public async isMobile(): Promise<boolean> {
    const viewportSize = this.page.viewportSize();
    return viewportSize !== null && viewportSize.width < 768;
  }

  public async waitForUrlChange(
    expectedUrlPattern: string | RegExp | ((url: URL) => boolean),
    options?: { timeout?: number }
  ): Promise<void> {
    const timeout = options?.timeout || 10000;
    await this.page.waitForURL(expectedUrlPattern, { timeout });
  }

  public async currentTheme(): Promise<string> {
    return (await this.page.locator("html").getAttribute("class")) ?? "";
  }

  public getLocator(selector: string | keyof typeof this.locators): Locator {
    if (typeof selector === 'string') {
      return this.page.locator(selector);
    }
    return this.page.locator(this.locators[selector]);
  }
}
