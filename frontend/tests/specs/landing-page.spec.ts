import AxeBuilder from "@axe-core/playwright";
import { LandingPage, expect, test } from "../fixtures/test-fixtures";

test.describe("Landing Page", () => {
  // MARK: Accessibility

  // Note: Check to make sure that this is eventually done for light and dark modes.
  test("There are no detectable accessibility issues", async ({
    landingPage,
    isAccessibilityTest,
  }, testInfo) => {
    const results = await new AxeBuilder({ page: landingPage.getPage() })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    await testInfo.attach("accessibility-scan-results", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });

    expect(results.violations).toEqual([]);
  });

  // MARK: Header

  // Test that the correct Header is visible on mobile or desktop.
  test("The correct header element should be visible on mobile and desktop", async ({
    landingPage,
  }) => {
    const header = await landingPage.getVisibleHeader();
    await expect(header).toBeVisible();
  });

  // Test that the Roadmap button is visible and clickable only on Desktop Header.
  test("Roadmap button should be visible and clickable only on Desktop", async ({
    landingPage,
  }) => {
    const result = await landingPage.checkRoadmapButtonVisibility();
    expect(result).toBe(true);
  });

  // Test that the Get In Touch button is visible and clickable only on Desktop Header.
  test("Get In Touch button is functional", async ({ landingPage }) => {
    const result = await landingPage.checkGetInTouchButtonFunctionality();
    expect(result).toBe(true);
  });

  // Test that the theme dropdown is visible and functional.
  test("Theme dropdown is functional", async ({ landingPage }) => {
    const themes = ["light", "dark"];

    for (const theme of themes) {
      await landingPage.selectThemeOption(theme);
      const currentTheme = await landingPage.currentTheme();
      expect(currentTheme).toContain(theme);
    }
  });

  // Test that the language dropdown is visible and functional.
  test("Language dropdown options are visible", async ({ landingPage }) => {
    const visibleOptions = await landingPage.getVisibleLanguageOptions();
    expect(visibleOptions.length).toBeGreaterThan(0);
    for (const option of visibleOptions) {
      await expect(option).toBeVisible();
    }
  });

  // MARK: Landing Page

  // Test that the title of the landing page contains "activist".
  test('Title should contain "activist"', async ({ landingPage }) => {
    const pageTitle = await landingPage.title();
    expect(pageTitle).toContain("activist");
  });

  // Test that the landing page contains the request access link.
  test("Splash should contain the request access link", async ({
    landingPage,
  }) => {
    const requestAccessLink = landingPage.requestAccessLink;
    expect(await requestAccessLink.getAttribute("href")).toBe(
      LandingPage.urls.REQUEST_ACCESS_URL
    );
  });

  // Test that all important links are visible on the landing page.
  test("All important links should be visible on the landing page", async ({
    landingPage,
  }) => {
    const importantLinks = await landingPage.getImportantLinks();
    for (const link of importantLinks) {
      await expect(link).toBeVisible();
    }
  });
});
