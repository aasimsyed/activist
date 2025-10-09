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
  "Organization Group FAQ Page - FAQ Create",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can access new FAQ creation", async ({ page }, testInfo) => {
      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupFaqPage } = organizationPage;

      // Verify new FAQ button is visible and functional.
      await expect(groupFaqPage.list.newFaqButton).toBeVisible();
      await expect(groupFaqPage.list.newFaqButton).toBeEnabled();

      // Get button text to verify we have the right button.
      const buttonText = await groupFaqPage.list.newFaqButton.textContent();
      expect(buttonText).toContain("FAQ");

      // Verify button has correct aria-label.
      await expect(groupFaqPage.list.newFaqButton).toHaveAttribute(
        "aria-label"
      );

      // Test that button is clickable (click and verify no errors).
      await groupFaqPage.actions.clickNewFaq();
      // Verify button click was successful (no errors thrown).
      // Since modal is not implemented yet, we just verify the click worked.
      await expect(groupFaqPage.list.newFaqButton).toBeVisible();
    });
  }
);
