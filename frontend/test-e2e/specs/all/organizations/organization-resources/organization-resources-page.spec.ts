// SPDX-License-Identifier: AGPL-3.0-or-later
import { runAccessibilityTest } from "~/test-e2e/accessibility/accessibilityTesting";
import { navigateToOrganizationSubpage } from "~/test-e2e/actions/navigation";
import { expect, test } from "~/test-e2e/global-fixtures";
import { newOrganizationPage } from "~/test-e2e/page-objects/organization/OrganizationPage";
import { logTestPath, withTestStep } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }) => {
  // Use shared navigation function that automatically detects platform and uses appropriate navigation.
  await navigateToOrganizationSubpage(page, "resources");
});

test.describe(
  "Organization Resources Page",
  { tag: ["@desktop", "@mobile"] },
  () => {
    // Note: Check to make sure that this is eventually done for light and dark modes.
    test("Organization Resources Page has no detectable accessibility issues", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);

      await withTestStep(
        testInfo,
        "Wait for lang attribute to be set",
        async () => {
          await expect(page.locator("html")).toHaveAttribute(
            "lang",
            /^[a-z]{2}(-[A-Z]{2})?$/
          );
        }
      );

      await withTestStep(testInfo, "Run accessibility scan", async () => {
        const violations = await runAccessibilityTest(
          "Organization Resources Page",
          page,
          testInfo
        );
        expect
          .soft(violations, "Accessibility violations found:")
          .toHaveLength(0);

        if (violations.length > 0) {
          // Note: For future implementation.
        }
      });
    });

    test("User can view organization resources", async ({ page }) => {
      const organizationPage = newOrganizationPage(page);
      const { resourcesPage } = organizationPage;

      // Wait for resources to load completely.
      await page.waitForLoadState("domcontentloaded");

      // Wait for either resources or empty state to appear.
      await expect(async () => {
        const resourcesListVisible = await resourcesPage.resourcesList
          .isVisible()
          .catch(() => false);
        const emptyStateVisible = await resourcesPage.emptyState
          .isVisible()
          .catch(() => false);
        expect(resourcesListVisible || emptyStateVisible).toBe(true);
      }).toPass();

      // Check if resources exist or empty state is shown.
      const resourceCount = await resourcesPage.getResourceCount();

      if (resourceCount > 0) {
        // Verify resources list is visible.
        await expect(resourcesPage.resourcesList).toBeVisible();
        await expect(resourcesPage.resourceCards.first()).toBeVisible();

        // Verify first resource has required elements.
        const firstResourceCard = resourcesPage.getResourceCard(0);
        await expect(firstResourceCard).toBeVisible();

        const firstResourceLink = resourcesPage.getResourceLink(0);
        await expect(firstResourceLink).toBeVisible();
        await expect(firstResourceLink).toHaveAttribute("href", /.+/);

        // Verify resource icon is visible.
        const firstResourceIcon = resourcesPage.getResourceIcon(0);
        await expect(firstResourceIcon).toBeVisible();
      } else {
        // Verify empty state is shown when no resources.
        await expect(resourcesPage.emptyState).toBeVisible();
        await expect(resourcesPage.emptyStateMessage).toBeVisible();
      }
    });

    test("User can access new resource creation", async ({ page }) => {
      const organizationPage = newOrganizationPage(page);
      const { resourcesPage } = organizationPage;

      // Verify new resource button is visible and functional.
      await expect(resourcesPage.newResourceButton).toBeVisible();
      await expect(resourcesPage.newResourceButton).toBeEnabled();

      // Check if we're on a mobile/tablet viewport where sidebar might be expanded
      const viewport = page.viewportSize();
      if (viewport && viewport.width < 1280) {
        // Check if sidebar element exists (it doesn't on mobile)
        const sidebarExists = (await page.locator("#sidebar-left").count()) > 0;
        if (sidebarExists) {
          // Import sidebar page object and collapse if needed
          const { newSidebarLeft } = await import(
            "~/test-e2e/component-objects/SidebarLeft"
          );
          const sidebarLeft = newSidebarLeft(page);

          const isExpanded = await sidebarLeft.isExpanded();

          if (isExpanded) {
            // Try multiple approaches to collapse the sidebar
            // 1. Direct state manipulation
            await page.evaluate(() => {
              // Try to find and call the sidebar collapse function
              const sidebar = document.getElementById("sidebar-left");
              if (sidebar) {
                // Trigger mouseleave event
                const mouseLeaveEvent = new Event("mouseleave", {
                  bubbles: true,
                });
                sidebar.dispatchEvent(mouseLeaveEvent);

                // Also try to set collapsed state directly
                if (window.localStorage) {
                  localStorage.setItem("collapsed", "true");
                  localStorage.setItem("collapsedSwitch", "true");
                }
              }
            });

            // 2. Use the sidebar's mouseLeave method as backup
            await sidebarLeft.mouseLeave();

            // 3. Wait a bit for state to update
            await page.waitForTimeout(200);
          }
        }
      }

      // Click the new resource button to open modal.
      await resourcesPage.newResourceButton.click();

      // Verify resource creation modal opens.
      await expect(resourcesPage.resourceModal).toBeVisible();

      // Close the modal using the close button.
      const closeButton = resourcesPage.resourceModalCloseButton(
        resourcesPage.resourceModal
      );
      await expect(closeButton).toBeVisible();
      await closeButton.click();

      // Verify modal closes.
      await expect(resourcesPage.resourceModal).not.toBeVisible();

      // Note: We could add more specific modal testing here.
      // but that might be better suited for a dedicated modal test.
    });
  }
);
