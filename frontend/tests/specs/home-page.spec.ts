import AxeBuilder from "@axe-core/playwright";
import { HomePage, expect, test } from "../fixtures/page-fixtures";

test.describe("Home Page", () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.navigateTo("/home");
    const topics = homePage.topics;
    await topics.dropdown.waitFor({ state: "visible" });
  });

  // MARK: Accessibility

  // Test accessibility of the home page (skip this test for now).
  // Note: Check to make sure that this is eventually done for light and dark modes.
  test("There are no detectable accessibility issues", async ({
    homePage,
  }, testInfo) => {
    const results = await new AxeBuilder({ page: homePage.getPage() })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    await testInfo.attach("accessibility-scan-results", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });

    expect(results.violations).toEqual([]);
  });

  test("The topics dropdown should be functional", async ({ homePage }) => {
    await homePage.topics.openTopicsDropdown();
    await expect(homePage.topics.options).toBeVisible();
    await homePage.topics.closeTopicsDropdown();
    await expect(homePage.topics.options).toBeHidden();
  });

  // MARK: Desktop
  test("The sidebar should be visible on desktop", async ({ homePage }) => {
    await expect(homePage.sidebarLeft.component).toBeVisible();
  });

  test("The sidebar should expand and collapse when hovered over", async ({ homePage }) => {
    // Check the initial state of the sidebar toggle button
    const isToggleExpanded = await homePage.sidebarLeft.isSidebarLeftToggleExpanded();

    if (isToggleExpanded) {
      // If the toggle is expanded, the sidebar should be expanded
      expect(await homePage.sidebarLeft.isSidebarCollapsed()).toBe(false);

      await homePage.sidebarLeft.clickSidebarLeftToggle();
      await homePage.sidebarLeft.hoverOutsideSidebar();
      expect(await homePage.sidebarLeft.isSidebarCollapsed()).toBe(true);

      await homePage.sidebarLeft.hoverIntoSidebarLeft();
      expect(await homePage.sidebarLeft.isSidebarCollapsed()).toBe(false);
    }
  });

  test("SidebarLeft dropdown menus should be functional", async ({ homePage }) => {
    // Test Info dropdown
    await homePage.sidebarLeft.sidebarLeftInfo.click();
    await expect(homePage.sidebarLeft.sidebarLeftHelp).toBeVisible();
    await expect(homePage.sidebarLeft.sidebarLeftDocs).toBeVisible();
    await expect(homePage.sidebarLeft.sidebarLeftLegal).toBeVisible();
    await homePage.sidebarLeft.sidebarLeftInfo.click();
    await expect(homePage.sidebarLeft.sidebarLeftHelp).toBeHidden();
    await expect(homePage.sidebarLeft.sidebarLeftDocs).toBeHidden();
    await expect(homePage.sidebarLeft.sidebarLeftLegal).toBeHidden();

    // Test User Options dropdown
    await homePage.sidebarLeft.sidebarLeftUserOptions.click();
    await expect(homePage.sidebarLeft.sidebarLeftSignIn).toBeVisible();
    await expect(homePage.sidebarLeft.sidebarLeftSignUp).toBeVisible();
    await homePage.sidebarLeft.sidebarLeftUserOptions.click();
    await expect(homePage.sidebarLeft.sidebarLeftSignIn).toBeHidden();
    await expect(homePage.sidebarLeft.sidebarLeftSignUp).toBeHidden();
  });



  test("SidebarLeft navigation links should be functional", async ({ homePage }) => {
    // Test Organizations link
    await homePage.sidebarLeft.sidebarLeftOrganizations.click();
    await homePage.waitForUrlChange("**/organizations");
    expect(homePage.url()).toContain("/organizations");

    // Test Events link
    await homePage.sidebarLeft.sidebarLeftEvents.click();
    await homePage.waitForUrlChange("**/events");
    expect(homePage.url()).toContain("/events");

    // Test Help link
    await homePage.sidebarLeft.sidebarLeftInfo.click();
    await homePage.sidebarLeft.sidebarLeftHelp.click();
    await homePage.waitForUrlChange("**/help");
    expect(homePage.url()).toContain("/help");

    await homePage.goBack();

    // Test Docs link
    await homePage.sidebarLeft.sidebarLeftInfo.click();
    await homePage.sidebarLeft.sidebarLeftDocs.click();
    await homePage.waitForUrlChange("**/docs");
    expect(homePage.url()).toContain("/docs");

    await homePage.goBack();
    // Test Legal link
    await homePage.sidebarLeft.sidebarLeftInfo.click();
    await homePage.sidebarLeft.sidebarLeftLegal.click();
    await homePage.waitForUrlChange("**/legal");
    expect(homePage.url()).toContain("/legal");

    await homePage.goBack();

    // Test Sign In link
    await homePage.sidebarLeft.sidebarLeftUserOptions.click();
    await homePage.sidebarLeft.sidebarLeftSignIn.click();
    await homePage.waitForUrlChange("**/auth/sign-in");
    expect(homePage.url()).toContain("/auth/sign-in");

    await homePage.goBack();

    // Test Sign Up link
    await homePage.sidebarLeft.sidebarLeftUserOptions.click();
    await homePage.sidebarLeft.sidebarLeftSignUp.click();
    await homePage.waitForUrlChange("**/auth/sign-up");
    expect(homePage.url()).toContain("/auth/sign-up");
  });

  test("Hot key '/' focuses the search input", async ({ homePage }) => {
    await homePage.sidebarLeft.searchBar.pressSlashKey();
    expect(await homePage.sidebarLeft.searchBar.isSearchInputFocused()).toBe(true);
  });

  test("Hot key 'Command+K' or 'Control+K' expands the search input", async ({ homePage }) => {
    await homePage.sidebarLeft.searchBar.pressCommandOrControlK();
    expect(await homePage.sidebarLeft.searchBar.isExpandedSearchInputVisible()).toBe(true);
    await homePage.sidebarLeft.searchBar.clickCloseSearchModal();
    expect(await homePage.sidebarLeft.searchBar.isExpandedSearchInputVisible()).toBe(false);
  });
});
