import type { Page, Locator } from "@playwright/test";
import { PageObjectBase } from "../utils/PageObjectBase";

const locators = {
  SEARCH_BAR: "#input-search",
  SEARCH_ICON: "icon[name='search']",
  EXPANDED_SEARCH_INPUT: "#expanded-search-input",
  SEARCH_MODAL: "#search-modal",
  CLOSE_SEARCH_MODAL: "#search-modal button",
};

export class SearchBar extends PageObjectBase {
  constructor(page: Page) {
    super(page, locators);
  }

  get searchInput(): Locator {
    return this.getLocator("SEARCH_BAR");
  }

  get searchIcon(): Locator {
    return this.getLocator("SEARCH_ICON");
  }

  get searchModal(): Locator {
    return this.getLocator("SEARCH_MODAL");
  }

  async fillSearchInput(text: string): Promise<void> {
    await this.searchInput.fill(text);
  }

  async clickSearchIcon(): Promise<void> {
    await this.searchIcon.click();
  }

  async isSearchInputFocused(): Promise<boolean> {
    return this.searchInput.evaluate((el) => el === document.activeElement);
  }

  async isSearchInputVisible(): Promise<boolean> {
    return this.searchInput.isVisible();
  }

  async getSearchInputPlaceholder(): Promise<string | null> {
    return this.searchInput.getAttribute("placeholder");
  }

  async pressSlashKey(): Promise<void> {
    await this.page.keyboard.press("/");
  }

  async pressCommandOrControlK(): Promise<void> {
    const isMac = await this.page.evaluate(() => /^Mac/i.test(navigator.userAgent));
    if (isMac) {
      await this.page.keyboard.press("Meta+K");
    } else {
      await this.page.keyboard.press("Control+K");
    }
  }

  async clickCloseSearchModal(): Promise<void> {
    await this.getLocator("CLOSE_SEARCH_MODAL").click();
  }

  async isExpandedSearchInputVisible(): Promise<boolean> {
    return this.searchModal.isVisible();
  }

  async fillExpandedSearchInput(text: string): Promise<void> {
    await this.searchModal.fill(text);
  }
}
