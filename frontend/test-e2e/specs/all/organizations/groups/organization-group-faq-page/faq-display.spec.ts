// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import { navigateToOrganizationGroupSubpage } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { logTestPath } from "~/test-e2e/utils/test-traceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToOrganizationGroupSubpage(page, "faq");
});

test.describe(
  "Organization Group FAQ Page - FAQ Display",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can view and interact with FAQ entries", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupFaqPage } = organizationPage;

      // Wait for FAQ entries to load completely.
      await page.waitForLoadState("domcontentloaded");

      // Wait for either FAQ entries or empty state to appear.
      await expect(async () => {
        const faqListVisible = await groupFaqPage.list.faqList
          .isVisible()
          .catch(() => false);
        const emptyStateVisible = await groupFaqPage.list.emptyState
          .isVisible()
          .catch(() => false);
        expect(faqListVisible || emptyStateVisible).toBe(true);
      }).toPass({ timeout: 10000 });

      const faqCount = await groupFaqPage.actions.getFaqCount();

      if (faqCount > 0) {
        // Verify FAQ list is visible.
        await expect(groupFaqPage.list.faqList).toBeVisible();
        await expect(groupFaqPage.list.faqCards.first()).toBeVisible();

        // Verify first FAQ has required elements.
        const firstFaqCard = groupFaqPage.card.getFaqCard(0);
        await expect(firstFaqCard).toBeVisible();

        const firstFaqQuestion = groupFaqPage.card.getFaqQuestion(0);
        await expect(firstFaqQuestion).toBeVisible();

        const firstFaqDisclosureButton =
          groupFaqPage.card.getFaqDisclosureButton(0);
        await expect(firstFaqDisclosureButton).toBeVisible();

        // Test expanding FAQ.
        await groupFaqPage.actions.expandFaq(0);
        await expect(groupFaqPage.card.getFaqAnswer(0)).toBeVisible();

        // Test collapsing FAQ.
        await groupFaqPage.actions.collapseFaq(0);
        await expect(groupFaqPage.card.getFaqAnswer(0)).not.toBeVisible();

        // Verify drag handles are visible.
        const firstFaqDragHandle = groupFaqPage.card.getFaqDragHandle(0);
        await expect(firstFaqDragHandle).toBeVisible();
        await expect(firstFaqDragHandle).toContainClass("drag-handle");
        // Verify edit buttons are visible.
        const firstFaqEditButton = groupFaqPage.card.getFaqEditButton(0);
        await expect(firstFaqEditButton).toBeVisible();
      } else {
        // Verify empty state is shown when no FAQ entries.
        await expect(groupFaqPage.list.emptyState).toBeVisible();
        await expect(groupFaqPage.list.emptyStateMessage).toBeVisible();
      }
    });
  }
);
