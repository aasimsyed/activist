import type { Page, Locator } from "@playwright/test";
import BaseComponent from "./BaseComponent";

export default class SidebarLeft extends BaseComponent {
  public static readonly locators = {
    SIDEBAR_LEFT: "#sidebar-left",
    SIDEBAR_LEFT_TOGGLE: "#sidebar-left-toggle",
  };

  constructor(page: Page) {
    super(page);
    this.setLocators(SidebarLeft.locators);
  }

  get component(): Locator {
    return this.getLocator("SIDEBAR_LEFT");
  }
  get sidebarLeftToggle(): Locator {
    return this.getLocator("SIDEBAR_LEFT_TOGGLE");
  }

  // click on the sidebar left toggle
  async clickSidebarLeftToggle(): Promise<void> {
    await this.sidebarLeftToggle.click();
  }

  // is sidebar left sticky expanded (has class -rotate-180)
  async isSidebarLeftStickyExpanded(): Promise<boolean> {
    return (await this.sidebarLeftToggle.getAttribute("class"))?.includes("-rotate-180") ?? false;
  }

  // is sidebar left collapsed (does not have class -rotate-180)
  async isSidebarLeftCollapsed(): Promise<boolean> {
    return !(await this.isSidebarLeftStickyExpanded());
  }

  // hover over the sidebar left
  async hoverSidebarLeft(): Promise<void> {
    await this.component.hover();
  }

  // hover to the right of the sidebar left
  async hoverOutsideSidebar(): Promise<void> {
    // determine the the width of the visible sidebar
    const boundingBox = await this.component.boundingBox();
    const x = boundingBox?.x ?? 0;
    const y = boundingBox?.y ?? 0;
    // move mouse to the right of the sidebar
    await this.page.mouse.move(x + 200, y + 200);
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
}
