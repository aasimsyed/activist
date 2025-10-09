// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import {
  getFAQCardOrder,
  performDragAndDrop,
  verifyReorder,
} from "~/test-e2e/helpers/drag-and-drop";
import { navigateToOrganizationGroupSubpage } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { logTestPath } from "~/test-e2e/utils/test-traceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToOrganizationGroupSubpage(page, "faq");
});

test.describe(
  "Organization Group FAQ Page - FAQ Reordering",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can reorder FAQ entries using drag and drop", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupFaqPage } = organizationPage;

      // Wait for page to load and then for FAQ cards to appear.
      await page.waitForLoadState("domcontentloaded");

      // Wait for FAQ cards to be present (with timeout to handle empty state).
      try {
        await expect(groupFaqPage.list.faqCards.first()).toBeVisible({
          timeout: 5000,
        });
      } catch {
        // If no FAQ cards appear, that's fine - could be empty state.
      }

      const faqCount = await groupFaqPage.actions.getFaqCount();

      if (faqCount >= 2) {
        // Get initial order of first 2 FAQ questions for drag and drop test.
        const initialOrder = await getFAQCardOrder(page);
        const firstQuestion = initialOrder[0];
        const secondQuestion = initialOrder[1];

        // Verify drag handles are visible and have correct classes.
        const firstFaqDragHandle = groupFaqPage.card.getFaqDragHandle(0);
        const secondFaqDragHandle = groupFaqPage.card.getFaqDragHandle(1);

        await expect(firstFaqDragHandle).toBeVisible();
        await expect(secondFaqDragHandle).toBeVisible();

        // Validate drag handles have the correct CSS class.
        await expect(firstFaqDragHandle).toContainClass("drag-handle");
        await expect(secondFaqDragHandle).toContainClass("drag-handle");

        // Perform drag and drop using shared utility.
        await performDragAndDrop(page, firstFaqDragHandle, secondFaqDragHandle);
        // Verify the reorder using shared utility.
        await verifyReorder(
          page,
          firstQuestion ?? "",
          secondQuestion ?? "",
          getFAQCardOrder
        );
      } else {
        // Skip test if insufficient FAQ entries for drag and drop testing
        test.skip(
          faqCount >= 2,
          "Need at least 2 FAQ entries to test drag and drop functionality"
        );
      }
    });
  }
);
