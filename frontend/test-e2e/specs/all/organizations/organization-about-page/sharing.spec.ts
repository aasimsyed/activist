// SPDX-License-Identifier: AGPL-3.0-or-later
import { navigateToFirstOrganization } from "~/test-e2e/actions/navigation";
import { expect, test } from "~/test-e2e/global-fixtures";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { logTestPath, withTestStep } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToFirstOrganization(page);

  // Wait for auth state to be fully loaded.
  await page.waitForLoadState("domcontentloaded");

  // Give Nuxt Auth time to hydrate session from cookies.
  await page.waitForTimeout(1000);
});

test.describe(
  "Organization About Page - Sharing",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can share the organization page", async ({ page }, testInfo) => {
      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);

      await withTestStep(testInfo, "Open share modal", async () => {
        await organizationPage.shareButton.click();
        await expect(organizationPage.shareModal.modal).toBeVisible();
      });
      await withTestStep(testInfo, "Close share modal", async () => {
        const closeModalButton = organizationPage.shareModal.closeButton(
          organizationPage.shareModal.modal
        );
        await expect(closeModalButton).toBeVisible();
        await closeModalButton.click({ force: true });
        await expect(organizationPage.shareModal.modal).not.toBeVisible();
      });
    });
  }
);
