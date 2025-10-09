import { expect, test } from "~/test-e2e/global-fixtures";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { navigateToOrganizationGroupSubpage } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { logTestPath, withTestStep } from "~/test-e2e/utils/test-traceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToOrganizationGroupSubpage(page, "about");
});

test.describe(
  "Organization Group About Page - Sharing",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can share the group page", async ({ page }, testInfo) => {
      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupAboutPage } = organizationPage;

      await withTestStep(testInfo, "Open share modal", async () => {
        await groupAboutPage.actions.clickShare();
        await expect(groupAboutPage.modals.shareModal).toBeVisible();
      });

      await withTestStep(testInfo, "Close share modal", async () => {
        const closeModalButton =
          groupAboutPage.modals.shareModal.getByTestId("modal-close-button");
        await expect(closeModalButton).toBeVisible();
        await closeModalButton.click({ force: true });
        // Wait for the modal to actually close.
        await expect(groupAboutPage.modals.shareModal).not.toBeVisible({
          timeout: 10000,
        });
      });
    });
  }
);
