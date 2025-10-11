// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import { performDragAndDrop } from "~/test-e2e/helpers/drag-and-drop";
import { navigateToOrganizationGroupSubpage } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToOrganizationGroupSubpage(page, "faq");
});

test.describe(
  "Organization Group FAQ Page - Desktop",
  { tag: "@desktop" },
  () => {
    test("User can reorder FAQ entries using drag and drop on desktop", async ({
      page,
    }) => {
      const organizationPage = newOrganizationPage(page);
      const { groupFaqPage } = organizationPage;

      // Wait for FAQ entries to load completely.
      await page.waitForLoadState("domcontentloaded");

      const faqCount = await groupFaqPage.getFaqCount();

      if (faqCount >= 2) {
        // Get initial order of first 2 FAQ questions for drag and drop test.
        const firstQuestion = await groupFaqPage.getFaqQuestionText(0);
        const secondQuestion = await groupFaqPage.getFaqQuestionText(1);

        // Verify drag handles are visible.
        const firstFaqDragHandle = groupFaqPage.getFaqDragHandle(0);
        const secondFaqDragHandle = groupFaqPage.getFaqDragHandle(1);

        await expect(firstFaqDragHandle).toBeVisible();
        await expect(secondFaqDragHandle).toBeVisible();

        // Ensure sidebar is collapsed before drag (iPad Portrait issue)
        const viewport = page.viewportSize();
        if (viewport && viewport.width <= 1024) {
          await page.mouse.move(viewport.width - 50, viewport.height / 2);
          await page.waitForTimeout(500);
        }

        // Perform drag and drop using shared helper (includes proper waits for iPad).
        await performDragAndDrop(page, firstFaqDragHandle, secondFaqDragHandle);

        // Wait for reorder to persist and verify using retry logic
        await expect(async () => {
          const finalFirstQuestion = await groupFaqPage.getFaqQuestionText(0);
          const finalSecondQuestion = await groupFaqPage.getFaqQuestionText(1);
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
  }
);
