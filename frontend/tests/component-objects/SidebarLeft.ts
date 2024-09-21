import type { Page, Locator } from "@playwright/test";
import { PageObjectBase } from "../utils/PageObjectBase";
import { SearchBar } from "./SearchBar";

const locators = {
  SIDEBAR_LEFT: "#sidebar-left",
  SIDEBAR_LEFT_TOGGLE: "#sidebar-left-toggle",
  SIDEBAR_LEFT_EVENTS: "#sidebar-left-events",
  SIDEBAR_LEFT_ORGANIZATIONS: "#sidebar-left-organizations",
  SIDEBAR_LEFT_CREATE: "#sidebar-left-create button",
  SIDEBAR_LEFT_HELP: "#sidebar-left-help",
  SIDEBAR_LEFT_DOCS: "#sidebar-left-docs",
  SIDEBAR_LEFT_LEGAL: "#sidebar-left-legal",
  SIDEBAR_LEFT_SIGN_IN: "#sidebar-left-sign-in",
  SIDEBAR_LEFT_SIGN_UP: "#sidebar-left-sign-up",
  SIDEBAR_LEFT_INFO: "#sidebar-left-info button",
  SIDEBAR_LEFT_USER_OPTIONS: "#sidebar-left-user-options button",
};

export class SidebarLeft extends PageObjectBase {
  constructor(page: Page) {
    super(page, locators);
    this.searchBar = new SearchBar(page);
  }

  get component(): Locator {
    return this.getLocator("SIDEBAR_LEFT");
  }
  get sidebarLeftToggle(): Locator {
    return this.getLocator("SIDEBAR_LEFT_TOGGLE");
  }

  get sidebarLeftEvents(): Locator {
    return this.getLocator("SIDEBAR_LEFT_EVENTS");
  }

  get sidebarLeftOrganizations(): Locator {
    return this.getLocator("SIDEBAR_LEFT_ORGANIZATIONS");
  }

  get sidebarLeftCreate(): Locator {
    return this.getLocator("SIDEBAR_LEFT_CREATE");
  }

  get sidebarLeftInfo(): Locator {
    return this.getLocator("SIDEBAR_LEFT_INFO");
  }

  get sidebarLeftHelp(): Locator {
    return this.getLocator("SIDEBAR_LEFT_HELP");
  }

  get sidebarLeftDocs(): Locator {
    return this.getLocator("SIDEBAR_LEFT_DOCS");
  }

  get sidebarLeftLegal(): Locator {
    return this.getLocator("SIDEBAR_LEFT_LEGAL");
  }

  get sidebarLeftUserOptions(): Locator {
    return this.getLocator("SIDEBAR_LEFT_USER_OPTIONS");
  }

  get sidebarLeftSignIn(): Locator {
    return this.getLocator("SIDEBAR_LEFT_SIGN_IN");
  }

  get sidebarLeftSignUp(): Locator {
    return this.getLocator("SIDEBAR_LEFT_SIGN_UP");
  }

  // click on the sidebar left toggle
  async clickSidebarLeftToggle(): Promise<void> {
    await this.sidebarLeftToggle.click();
  }

  // is sidebar left sticky expanded (has class -rotate-180)
  async isSidebarLeftToggleExpanded(): Promise<boolean> {
    const toggleClass = await this.sidebarLeftToggle.getAttribute("class");
    return toggleClass?.includes("-rotate-180") ?? false;
  }

  // is sidebar left collapsed (does not have class -rotate-180)
  async isSidebarLeftToggleCollapsed(): Promise<boolean> {
    const toggleClass = await this.sidebarLeftToggle.getAttribute("class");
    return toggleClass?.includes("pb-1 pl-0.5") ?? false;
  }

  // hover over the sidebar left
  async hoverSidebarLeft(): Promise<void> {
    await this.component.hover();
  }

  // hover to the right of the sidebar left
  async hoverOutsideSidebar(): Promise<void> {
    const boundingBox = await this.component.boundingBox();
    if (!boundingBox) {
      throw new Error("Unable to get bounding box of SidebarLeft");
    }

    const { x, y, width, height } = boundingBox;

    // Move the mouse to the right of the sidebar
    const outsideX = x + width + 10; // 10 pixels to the right of the sidebar
    const outsideY = y + height / 2; // Vertically centered

    await this.page.mouse.move(outsideX, outsideY);
  }

  async hoverIntoSidebarLeft(): Promise<void> {
    // determine the the width of the visible sidebar
    const boundingBox = await this.component.boundingBox();
    const x = boundingBox?.x ?? 0;
    const y = boundingBox?.y ?? 0;
    // move mouse to the center of the sidebar
    await this.page.mouse.move(x / 2, y / 2);
  }

  // is sidebar collapsed (has class w-16)
  async isSidebarCollapsed(): Promise<boolean> {
    return (await this.component.getAttribute("class"))?.includes("w-16") ?? false;
  }

  async searchFor(text: string): Promise<void> {
    await this.searchBar.fillSearchInput(text);
  }

  async isSearchBarVisible(): Promise<boolean> {
    return this.searchBar.isSearchInputVisible();
  }
}
