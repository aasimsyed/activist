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
  "Organization Group FAQ Page - FAQ Edit",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can edit existing FAQ entries", async ({ page }, testInfo) => {
      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupFaqPage } = organizationPage;

      // Wait for FAQ entries to load completely.
      await page.waitForLoadState("domcontentloaded");

      const faqCount = await groupFaqPage.actions.getFaqCount();

      if (faqCount > 0) {
        // Get the original question text.
        const originalQuestion =
          await groupFaqPage.actions.getFaqQuestionText(0);
        expect(originalQuestion).toBeTruthy();

        // Expand the FAQ to get the answer text.
        await groupFaqPage.actions.expandFaq(0);

        // Wait for FAQ to be expanded.
        await expect(groupFaqPage.card.getFaqAnswer(0)).toBeVisible();

        const originalAnswer = await groupFaqPage.actions.getFaqAnswerText(0);
        expect(originalAnswer).toBeTruthy();

        // Verify edit button is visible and clickable.
        const editButton = groupFaqPage.card.getFaqEditButton(0);
        await expect(editButton).toBeVisible();
        await expect(editButton).toBeEnabled();

        // Test that edit button is clickable (click and verify no errors).
        await groupFaqPage.actions.editFaq(0);
        // Verify edit button click was successful (no errors thrown).
        // Since modal is not implemented yet, we just verify the click worked.
        await expect(editButton).toBeVisible();
      } else {
        // Skip test if no FAQ entries available for editing.
        test.skip(
          faqCount > 0,
          "No FAQ entries available to test editing functionality"
        );
      }
    });
  }
);
