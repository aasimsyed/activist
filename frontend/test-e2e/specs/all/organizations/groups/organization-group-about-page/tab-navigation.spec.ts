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
  "Organization Group About Page - Tab Navigation",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("Group about page tab navigation works correctly", async ({
      page,
    }, testInfo) => {
      test.setTimeout(60000); // group pages load slowly in dev mode
      logTestPath(testInfo);

      const organizationPage = newOrganizationPage(page);
      const { groupAboutPage } = organizationPage;

      await withTestStep(testInfo, "Navigate to events tab", async () => {
        await groupAboutPage.actions.clickEventsTab();
        await expect(groupAboutPage.tabs.eventsTab).toHaveAttribute(
          "aria-selected",
          "true"
        );
        await expect(groupAboutPage.tabs.aboutTab).toHaveAttribute(
          "aria-selected",
          "false"
        );
      });

      await withTestStep(testInfo, "Navigate to resources tab", async () => {
        await groupAboutPage.actions.clickResourcesTab();
        await expect(groupAboutPage.tabs.resourcesTab).toHaveAttribute(
          "aria-selected",
          "true"
        );
        await expect(groupAboutPage.tabs.eventsTab).toHaveAttribute(
          "aria-selected",
          "false"
        );
      });

      await withTestStep(testInfo, "Navigate to FAQ tab", async () => {
        await groupAboutPage.actions.clickFaqTab();
        await expect(groupAboutPage.tabs.faqTab).toHaveAttribute(
          "aria-selected",
          "true"
        );
        await expect(groupAboutPage.tabs.resourcesTab).toHaveAttribute(
          "aria-selected",
          "false"
        );
      });
      await withTestStep(testInfo, "Return to about tab", async () => {
        await groupAboutPage.actions.clickAboutTab();
        await expect(groupAboutPage.tabs.aboutTab).toHaveAttribute(
          "aria-selected",
          "true"
        );
        await expect(groupAboutPage.tabs.faqTab).toHaveAttribute(
          "aria-selected",
          "false"
        );
      });
    });
  }
);
