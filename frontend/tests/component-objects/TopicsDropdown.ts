import type { Page, Locator } from "@playwright/test";
import { PageObjectBase } from "../utils/PageObjectBase";

const locators = {
  TOPICS_DROPDOWN: "#topics-dropdown",
  TOPICS_OPTIONS: "#topics-dropdown ul#isVisibleElement",
};

export class TopicsDropdown extends PageObjectBase {
  constructor(page: Page) {
    super(page, locators);
  }

  get topicsDropdown(): Locator {
    return this.getLocator("TOPICS_DROPDOWN");
  }
  get topicsOptions(): Locator {
    return this.getLocator("TOPICS_OPTIONS");
  }

  async openTopicsDropdown(): Promise<void> {
    if (!(await this.topicsOptions.isVisible())) {
      await this.topicsDropdown.click();
    }
  }

  async closeTopicsDropdown(): Promise<void> {
    if (await this.topicsOptions.isVisible()) {
      await this.topicsDropdown.click();
    }
  }
}
