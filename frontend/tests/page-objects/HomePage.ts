import type { Locator, Page } from "@playwright/test";
import { PageObjectBase } from "../utils/PageObjectBase";
import { TopicsDropdown } from "../component-objects/TopicsDropdown";
import {SidebarLeft } from "../component-objects/SidebarLeft";

const locators = {
  HOME_HEADER: "#home-header",
};

export class HomePage extends PageObjectBase {
  readonly topicsDropdown: TopicsDropdown;
  readonly sidebarLeft: SidebarLeft;

  constructor(page: Page) {
    super(page, locators, "Home Page", "/home");
    this.topicsDropdown = new TopicsDropdown(page);
    this.sidebarLeft = new SidebarLeft(page);
  }

  get homeHeader(): Locator {
    return this.getLocator("HOME_HEADER");
  }
}
