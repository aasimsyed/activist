import AxeBuilder from "@axe-core/playwright";
import { HomePage, expect, test } from "../fixtures/test-fixtures";

test.describe("Home Page", () => {
  // MARK: Accessibility

  // Test accessibility of the home page (skip this test for now).
  // Note: Check to make sure that this is eventually done for light and dark modes.
  test("There are no detectable accessibility issues", async ({
    homePage,
    isAccessibilityTest
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
    await homePage.checkTopicsDropdownFunctionality();
  });

  test("The sidebar should be visible on desktop", async ({ homePage }) => {
    const isVisible = await homePage.checkSidebarVisibilityOnDesktop();
    expect(isVisible).toBe(true);
  });

  test("The sidebar should expand and collapse when hovered over", async ({ homePage }) => {
    const results = await homePage.checkSidebarExpandCollapse();
    results.forEach(result => expect(result).toBe(true));
  });

  test("Navigation dropdown menus should be functional", async ({ homePage }) => {
    const results = await homePage.checkNavigationMenus();
    results.forEach(result => expect(result).toBe(true));
  });

  test("Navigation links should be functional", async ({ homePage }) => {
    const results = await homePage.checkNavigationLinks();
    const expectedPaths = ["/organizations", "/home", "/events", "/help", "/docs", "/legal", "/auth/sign-in", "/auth/sign-up"];
    results.forEach((url, index) => expect(url).toContain(expectedPaths[index]));
  });

  test("Hot keys should function correctly", async ({ homePage }) => {
    const isMobile = await homePage.isMobile();
    test.skip(isMobile, "This test is only for desktop");

    if (!isMobile) {
      const [isSearchInputFocused, isExpandedSearchInputVisible, isExpandedSearchInputHidden] = await homePage.checkHotKeyFunctionality();
      expect(isSearchInputFocused).toBe(true);
      expect(isExpandedSearchInputVisible).toBe(true);
      expect(isExpandedSearchInputHidden).toBe(true);
    }
  });

  test("Search bar should be functional on both mobile and desktop", async ({ homePage }) => {
    const results = await homePage.checkSearchFunctionality();
    expect(results).toEqual([true, true, true, true]);
  });
});
