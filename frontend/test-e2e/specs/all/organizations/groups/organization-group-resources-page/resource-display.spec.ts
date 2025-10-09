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
  "Organization Group Resources Page - Resource Display",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can view group resources", async ({ page }, testInfo) => {
      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupResourcesPage } = organizationPage;

      // Wait for resources to load completely.
      await page.waitForLoadState("domcontentloaded");

      // Wait for either resources or empty state to appear.
      await expect(async () => {
        const resourcesListVisible = await groupResourcesPage.list.resourcesList
          .isVisible()
          .catch(() => false);
        const emptyStateVisible = await groupResourcesPage.list.emptyState
          .isVisible()
          .catch(() => false);
        expect(resourcesListVisible || emptyStateVisible).toBe(true);
      }).toPass({ timeout: 10000 });

      // Check if resources exist or empty state is shown.
      const resourceCount = await groupResourcesPage.actions.getResourceCount();

      if (resourceCount > 0) {
        // Verify resources list is visible.
        await expect(groupResourcesPage.list.resourcesList).toBeVisible();
        await expect(
          groupResourcesPage.list.resourceCards.first()
        ).toBeVisible();

        // Verify first resource has required elements.
        const firstResourceCard = groupResourcesPage.card.getResourceCard(0);
        await expect(firstResourceCard).toBeVisible();

        const firstResourceLink = groupResourcesPage.card.getResourceLink(0);
        await expect(firstResourceLink).toBeVisible();
        await expect(firstResourceLink).toHaveAttribute("href", /.+/);
        // Verify resource icon is visible.
        const firstResourceIcon = groupResourcesPage.card.getResourceIcon(0);
        await expect(firstResourceIcon).toBeVisible();
      } else {
        // Verify empty state is shown when no resources.
        await expect(groupResourcesPage.list.emptyState).toBeVisible();
        await expect(groupResourcesPage.list.emptyStateMessage).toBeVisible();
      }
    });
  }
);
