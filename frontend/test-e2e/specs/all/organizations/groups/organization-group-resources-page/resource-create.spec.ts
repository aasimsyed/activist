// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import { navigateToOrganizationGroupSubpage } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { logTestPath } from "~/test-e2e/utils/test-traceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToOrganizationGroupSubpage(page, "resources");

  // Wait for page to be fully loaded.
  await page.waitForLoadState("domcontentloaded");

  // Wait for the page to be ready and auth state to be hydrated.
  // Check for auth cookie presence as a sign that authentication is working.
  try {
    await page.waitForFunction(
      () => {
        return document.cookie.includes("auth.token");
      },
      { timeout: 15000 }
    );
  } catch {
    // If auth cookie check fails, verify the page is still accessible.
    // and not showing sign-in page (which would indicate auth failure).
    const currentUrl = page.url();
    if (currentUrl.includes("/auth/sign-in")) {
      throw new Error("Authentication failed - redirected to sign-in page");
    }

    // Log warning but continue - the page might still be functional.
    // eslint-disable-next-line no-console
    console.warn("Auth cookie not found, but page appears to be loaded");
  }

  // Additional wait for UI to stabilize.
  await page.waitForTimeout(500);
});

test.describe(
  "Organization Group Resources Page - Resource Create",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can access new resource creation", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupResourcesPage } = organizationPage;

      // Verify new resource button is visible and functional.
      await expect(groupResourcesPage.list.newResourceButton).toBeVisible();
      await expect(groupResourcesPage.list.newResourceButton).toBeEnabled();

      // Click the new resource button to open modal.
      await groupResourcesPage.list.newResourceButton.click();

      // Verify resource creation modal opens.
      await expect(groupResourcesPage.modal.resourceModal).toBeVisible();

      // Close the modal using the close button.
      await expect(
        groupResourcesPage.modal.resourceModalCloseButton
      ).toBeVisible();
      await groupResourcesPage.modal.resourceModalCloseButton.click();
      // Verify modal closes
      await expect(groupResourcesPage.modal.resourceModal).not.toBeVisible();
    });
  }
);
