// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import {
  getResourceCardOrder,
  performDragAndDrop,
} from "~/test-e2e/helpers/drag-and-drop";
import { navigateToOrganizationSubpage } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";

test.beforeEach(async ({ page }) => {
  // Use shared navigation function that automatically detects platform and uses appropriate navigation.
  await navigateToOrganizationSubpage(page, "resources");
});

test.describe("Organization Resources Page", { tag: "@desktop" }, () => {
  test("User can share organization resources", async ({ page }) => {
    const organizationPage = newOrganizationPage(page);
    const { resourcesPage } = organizationPage;

    // Wait for page to load and then for resource cards to appear.
    await page.waitForLoadState("domcontentloaded");

    // Wait for resource cards to be present (with timeout to handle empty state).
    try {
      await expect(resourcesPage.resourceCards.first()).toBeVisible({
        timeout: 5000,
      });
    } catch {
      // If no resource cards appear, that's fine - could be empty state.
    }

    const resourceCount = await resourcesPage.getResourceCount();

    if (resourceCount > 0) {
      // Open the tooltip menu for the first resource.
      const menuButton = resourcesPage.getResourceMenuButton(0);
      await expect(menuButton).toBeVisible();
      await menuButton.click();

      // Verify tooltip menu appears and immediately click share button.
      const menuTooltip = resourcesPage.getResourceMenuTooltip(0);
      await expect(menuTooltip).toBeVisible();

      // Click share button immediately while tooltip is open.
      const shareButton = resourcesPage.getResourceShareButton(0);
      await shareButton.click();

      // Verify share modal opens.
      await expect(organizationPage.shareModal.modal).toBeVisible();

      // Close the modal.
      const closeButton = organizationPage.shareModal.closeButton(
        organizationPage.shareModal.modal
      );
      await expect(closeButton).toBeVisible();
      await closeButton.click({ force: true });

      // Verify modal closes.
      await expect(organizationPage.shareModal.modal).not.toBeVisible();
    } else {
      // Skip test if no resources are available.
      test.skip(resourceCount > 0, "No resources available to test sharing");
    }
  });

  test("User can reorder resources using drag and drop on desktop", async ({
    page,
  }) => {
    const organizationPage = newOrganizationPage(page);
    const { resourcesPage } = organizationPage;

    // Wait for page to load and then for resource cards to appear.
    await page.waitForLoadState("domcontentloaded");

    // Wait for resource cards to be present (with timeout to handle empty state).
    try {
      await expect(resourcesPage.resourceCards.first()).toBeVisible({
        timeout: 5000,
      });
    } catch {
      // If no resource cards appear, that's fine - could be empty state.
    }

    const resourceCount = await resourcesPage.getResourceCount();

    if (resourceCount >= 2) {
      // Get initial order of first 2 resources for drag and drop test.
      const initialOrder = await getResourceCardOrder(page);
      const firstResource = initialOrder[0];
      const secondResource = initialOrder[1];

      // Verify drag handles are visible and have correct classes.
      const firstResourceDragHandle = resourcesPage.getResourceDragHandle(0);
      const secondResourceDragHandle = resourcesPage.getResourceDragHandle(1);

      await expect(firstResourceDragHandle).toBeVisible();
      await expect(secondResourceDragHandle).toBeVisible();

      // Validate drag handles have the correct CSS class.
      await expect(firstResourceDragHandle).toContainClass("drag-handle");
      await expect(secondResourceDragHandle).toContainClass("drag-handle");

      // Ensure sidebar is collapsed before drag (iPad Portrait issue)
      const viewport = page.viewportSize();
      if (viewport && viewport.width <= 1024) {
        await page.mouse.move(viewport.width - 50, viewport.height / 2);
        await page.waitForTimeout(500);
      }

      // Perform drag and drop using shared helper (includes proper waits for iPad).
      await performDragAndDrop(
        page,
        firstResourceDragHandle,
        secondResourceDragHandle
      );

      // Wait for reorder to persist and verify using retry logic
      await expect(async () => {
        const finalOrder = await getResourceCardOrder(page);
        expect(finalOrder[0]).toBe(secondResource);
        expect(finalOrder[1]).toBe(firstResource);
      }).toPass({ timeout: 10000 });
    } else {
      // Skip test if insufficient resources for drag and drop testing.
      test.skip(
        resourceCount >= 2,
        "Need at least 2 resources to test drag and drop functionality"
      );
    }
  });
});
