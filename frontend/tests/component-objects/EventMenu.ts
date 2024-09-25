import type { Page, Locator } from "@playwright/test";
import { PageObjectBase } from "../utils/PageObjectBase";

const locators = {
  TOGGLE: "#submenu",
  ABOUT: "#event-about",
  TEAM: "#event-team",
  RESOURCES: "#event-resources",
  TASKS: "#event-tasks",
  DISCUSSION: "#event-discussion",
  SETTINGS: "#event-settings",
};

export class EventMenu extends PageObjectBase {
  constructor(page: Page) {
    super(page, locators);
  }

  get toggle(): Locator {
    return this.getLocator("TOGGLE");
  }

  get about(): Locator {
    return this.getLocator("ABOUT");
  }

  get team(): Locator {
    return this.getLocator("TEAM");
  }

  get resources(): Locator {
    return this.getLocator("RESOURCES");
  }

  get tasks(): Locator {
    return this.getLocator("TASKS");
  }

  get discussion(): Locator {
    return this.getLocator("DISCUSSION");
  }

  get settings(): Locator {
    return this.getLocator("SETTINGS");
  }

  async open(): Promise<void> {
    if (!(await this.isOpen())) {
      await this.toggle.click();
    }
  }

  async close(): Promise<void> {
    if (await this.isOpen()) {
      await this.toggle.click();
    }
  }

  async isOpen(): Promise<boolean> {
    return await this.toggle.getAttribute("aria-expanded") === "true";
  }

  async isVisible(): Promise<boolean> {
    return await this.toggle.isVisible();
  }

  async isOptionsVisible(): Promise<boolean> {
    return await this.options.isVisible();
  }

  async getActiveSelectedOption(): Promise<string> {
    const selector = await this.isMobile()
      ? "[data-headlessui-state='active selected']"
      : ".style-menu-option-cta";
    return (await this.options.locator(selector).textContent()) || "";
  }

  async selectOption(option: Locator): Promise<void> {
    await option.click();
  }
}
