import type { Locator, Page } from "@playwright/test";
import TopicsDropdown from "../component-objects/TopicsDropdown";
import SidebarLeft from "../component-objects/SidebarLeft";
import BasePage from "./BasePage";

export default class HomePage extends BasePage {
  public static readonly locators = {
    HOME_PAGE_MAIN: "#home-page-main",
  };

  readonly topicsDropdown: TopicsDropdown;
  readonly sidebarLeft: SidebarLeft;

  constructor(page: Page) {
    super(page, "Home Page", "/home");
    this.topicsDropdown = new TopicsDropdown(page);
    this.sidebarLeft = new SidebarLeft(page);
    this.setLocators(HomePage.locators);
  }

  get homePage(): Locator {
    return this.getLocator("HOME_PAGE_MAIN");
  }
}
