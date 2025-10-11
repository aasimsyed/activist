// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import { performDragAndDrop } from "~/test-e2e/helpers/drag-and-drop";
import { navigateToOrganizationSubpage } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";

test.beforeEach(async ({ page }) => {
  // Use shared navigation function that automatically detects platform and uses appropriate navigation.
  await navigateToOrganizationSubpage(page, "faq");
});

test.describe("Organization FAQ Page - Desktop", { tag: "@desktop" }, () => {
  test("User can reorder FAQ entries using drag and drop on desktop", async ({
    page,
  }) => {
    const organizationPage = newOrganizationPage(page);
    const { faqPage } = organizationPage;

    // Wait for FAQ entries to load completely.
    await page.waitForLoadState("domcontentloaded");

    const faqCount = await faqPage.getFAQCount();

    if (faqCount >= 2) {
      // Get initial order of first 2 FAQ questions for drag and drop test.
      const firstQuestion = await faqPage.getFAQQuestionText(0);
      const secondQuestion = await faqPage.getFAQQuestionText(1);

      // Verify drag handles are visible.
      const firstFAQDragHandle = faqPage.getFAQDragHandle(0);
      const secondFAQDragHandle = faqPage.getFAQDragHandle(1);

      await expect(firstFAQDragHandle).toBeVisible();
      await expect(secondFAQDragHandle).toBeVisible();

      // Ensure sidebar is collapsed before drag (iPad Portrait issue)
      const viewport = page.viewportSize();
      if (viewport && viewport.width <= 1024) {
        await page.mouse.move(viewport.width - 50, viewport.height / 2);
        await page.waitForTimeout(500);
      }

      // Perform drag and drop using shared helper (includes proper waits for iPad).
      await performDragAndDrop(page, firstFAQDragHandle, secondFAQDragHandle);

      // Wait for reorder to persist and verify using retry logic
      await expect(async () => {
        const finalFirstQuestion = await faqPage.getFAQQuestionText(0);
        const finalSecondQuestion = await faqPage.getFAQQuestionText(1);
        expect(finalFirstQuestion).toBe(secondQuestion);
        expect(finalSecondQuestion).toBe(firstQuestion);
      }).toPass({ timeout: 10000 });
    } else {
      // Skip test if insufficient FAQ entries for drag and drop testing.
      test.skip(
        faqCount >= 2,
        "Need at least 2 FAQ entries to test drag and drop functionality"
      );
    }
  });
});
