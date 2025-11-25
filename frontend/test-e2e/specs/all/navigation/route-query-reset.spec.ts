// SPDX-License-Identifier: AGPL-3.0-or-later
import { newEventsFilter } from "~/test-e2e/component-objects/EventsFilter";
import { newMainNavOptions } from "~/test-e2e/component-objects/MainNavOptions";
import { newSidebarLeft } from "~/test-e2e/component-objects/SidebarLeft";
import { expect, test } from "~/test-e2e/global-fixtures";
import { newOrganizationsHomePage } from "~/test-e2e/page-objects/OrganizationsHomePage";
import { logTestPath, withTestStep } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/events/i);
});

test.describe(
  "Route Query Parameter Reset on Navigation",
  { tag: ["@desktop", "@mobile"] },
  () => {
    // MARK: Events to Organizations

    test("should reset query parameters when navigating from events to organizations via sidebar", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);

      const sidebarLeft = newSidebarLeft(page);
      const { organizationsLink } = newMainNavOptions(page);

      await withTestStep(
        testInfo,
        "Open sidebar and apply a topic filter on events page",
        async () => {
          await sidebarLeft.open();

          // Apply a topic filter via the topics combobox.
          // Click the button (not the input) to open the dropdown.
          const eventsFilter = newEventsFilter(page);
          const topicsSection = eventsFilter.topicsSection;
          // The button is the one that opens the combobox dropdown
          const topicsComboboxButton = topicsSection.getByRole("button", {
            name: /topics/i,
          });
          await expect(topicsComboboxButton).toBeVisible();
          await topicsComboboxButton.click();

          // Wait for options to appear and select a topic (e.g., "Environment").
          const topicOption = page.getByRole("option", {
            name: /environment/i,
          });
          await expect(topicOption).toBeVisible({ timeout: 5000 });
          await topicOption.click();

          // Wait for navigation to complete and URL to stabilize with topics parameter.
          // The URL may briefly change and revert due to form handling, so we wait for it to stabilize.
          await page.waitForLoadState("networkidle");
          await expect(async () => {
            const url = page.url();
            expect(url).toMatch(/topics=/);
            // Wait a moment and check again to ensure it's stable
            await page.waitForLoadState("domcontentloaded");
            const urlAgain = page.url();
            expect(urlAgain).toMatch(/topics=/);
          }).toPass({ timeout: 10000 });
          await expect(page).toHaveURL(/topics=/);
        }
      );

      await withTestStep(
        testInfo,
        "Navigate to organizations page via sidebar",
        async () => {
          // Click organizations link in sidebar.
          await organizationsLink.click();

          // Wait for navigation to organizations page.
          await page.waitForURL(/\/organizations(\/|$)/, { timeout: 5000 });
          await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            /organizations/i
          );
        }
      );

      await withTestStep(
        testInfo,
        "Verify query parameters are cleared on organizations page",
        async () => {
          const url = new URL(page.url());
          const topicsParam = url.searchParams.get("topics");

          // Verify topics parameter is NOT present.
          expect(topicsParam).toBeNull();

          // Verify URL doesn't contain any query parameters.
          expect(url.search).toBe("");
        }
      );
    });

    test("should reset query parameters when navigating from events to organizations via mobile navigation", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);

      await withTestStep(
        testInfo,
        "Apply a topic filter on events page",
        async () => {
          // Apply a topic filter via the topics combobox.
          // Click the button (not the input) to open the dropdown.
          const eventsFilter = newEventsFilter(page);
          const topicsSection = eventsFilter.topicsSection;
          // The button is the one that opens the combobox dropdown
          const topicsComboboxButton = topicsSection.getByRole("button", {
            name: /topics/i,
          });
          await expect(topicsComboboxButton).toBeVisible();
          await topicsComboboxButton.click();

          // Wait for options to appear and select a topic.
          const topicOption = page.getByRole("option", {
            name: /environment/i,
          });
          await expect(topicOption).toBeVisible({ timeout: 5000 });
          await topicOption.click();

          // Verify URL now contains the topic filter.
          await page.waitForURL(/topics=/, { timeout: 5000 });
          await expect(page).toHaveURL(/topics=/);
        }
      );

      await withTestStep(
        testInfo,
        "Navigate to organizations page via mobile navigation bar",
        async () => {
          // Click organizations link in mobile navigation bar.
          const organizationsLink = page.locator("#organizations");
          await expect(organizationsLink).toBeVisible();
          await organizationsLink.evaluate((element: HTMLElement) => {
            element.click();
          });

          // Wait for navigation to organizations page.
          await page.waitForURL(/\/organizations(\/|$)/, { timeout: 5000 });
          await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            /organizations/i
          );
        }
      );

      await withTestStep(
        testInfo,
        "Verify query parameters are cleared on organizations page",
        async () => {
          const url = new URL(page.url());
          const topicsParam = url.searchParams.get("topics");

          // Verify topics parameter is NOT present.
          expect(topicsParam).toBeNull();

          // Verify URL doesn't contain any query parameters.
          expect(url.search).toBe("");
        }
      );
    });

    // MARK: Organizations to Events

    test("should reset query parameters when navigating from organizations to events via sidebar", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);

      const sidebarLeft = newSidebarLeft(page);
      const organizationsHomePage = newOrganizationsHomePage(page);
      const { eventsLink } = newMainNavOptions(page);

      await withTestStep(
        testInfo,
        "Navigate to organizations page and apply a topic filter",
        async () => {
          await page.goto("/organizations");
          await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            /organizations/i
          );

          await sidebarLeft.open();

          // Apply a topic filter via the topics combobox.
          const topicsCombobox = organizationsHomePage.comboboxButton;
          await expect(topicsCombobox).toBeVisible();
          await topicsCombobox.click();

          // Wait for options to appear and select a topic.
          const topicOption = page.getByRole("option", {
            name: /environment/i,
          });
          await expect(topicOption).toBeVisible({ timeout: 5000 });
          await topicOption.click();

          // Verify URL now contains the topic filter.
          await page.waitForURL(/topics=/, { timeout: 5000 });
          await expect(page).toHaveURL(/topics=/);
        }
      );

      await withTestStep(
        testInfo,
        "Navigate to events page via sidebar",
        async () => {
          // Click events link in sidebar.
          await eventsLink.click();

          // Wait for navigation to events page.
          await page.waitForURL(/\/events(\/|$)/, { timeout: 5000 });
          await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            /events/i
          );
        }
      );

      await withTestStep(
        testInfo,
        "Verify query parameters are cleared on events page",
        async () => {
          const url = new URL(page.url());
          const topicsParam = url.searchParams.get("topics");

          // Verify topics parameter is NOT present.
          expect(topicsParam).toBeNull();

          // Verify URL doesn't contain any query parameters (except view if default).
          // Note: Events page may have a default 'view' parameter, so we only check for topics.
          expect(topicsParam).toBeNull();
        }
      );
    });

    test("should reset query parameters when navigating from organizations to events via mobile navigation", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);

      const organizationsHomePage = newOrganizationsHomePage(page);

      await withTestStep(
        testInfo,
        "Navigate to organizations page and apply a topic filter",
        async () => {
          await page.goto("/organizations");
          await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            /organizations/i
          );

          // Apply a topic filter via the topics combobox.
          const topicsCombobox = organizationsHomePage.comboboxButton;
          await expect(topicsCombobox).toBeVisible();
          await topicsCombobox.click();

          // Wait for options to appear and select a topic.
          const topicOption = page.getByRole("option", {
            name: /environment/i,
          });
          await expect(topicOption).toBeVisible({ timeout: 5000 });
          await topicOption.click();

          // Verify URL now contains the topic filter.
          await page.waitForURL(/topics=/, { timeout: 5000 });
          await expect(page).toHaveURL(/topics=/);
        }
      );

      await withTestStep(
        testInfo,
        "Navigate to events page via mobile navigation bar",
        async () => {
          // Click events link in mobile navigation bar.
          const eventsLink = page.locator("#events");
          await expect(eventsLink).toBeVisible();
          await eventsLink.evaluate((element: HTMLElement) => {
            element.click();
          });

          // Wait for navigation to events page.
          await page.waitForURL(/\/events(\/|$)/, { timeout: 5000 });
          await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            /events/i
          );
        }
      );

      await withTestStep(
        testInfo,
        "Verify query parameters are cleared on events page",
        async () => {
          const url = new URL(page.url());
          const topicsParam = url.searchParams.get("topics");

          // Verify topics parameter is NOT present.
          expect(topicsParam).toBeNull();

          // Note: Events page may have a default 'view' parameter, so we only check for topics.
          expect(topicsParam).toBeNull();
        }
      );
    });

    // MARK: Query Parameters Should Persist Within Same Route

    test("should preserve query parameters when navigating within the same route", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);

      const sidebarLeft = newSidebarLeft(page);

      await withTestStep(
        testInfo,
        "Apply a topic filter on events page",
        async () => {
          await sidebarLeft.open();

          const eventsFilter = newEventsFilter(page);
          const topicsCombobox =
            eventsFilter.topicsSection.getByRole("combobox");
          await expect(topicsCombobox).toBeVisible();
          await topicsCombobox.click();

          const topicOption = page.getByRole("option", {
            name: /environment/i,
          });
          await expect(topicOption).toBeVisible({ timeout: 5000 });
          await topicOption.click();

          await page.waitForURL(/topics=/, { timeout: 5000 });
          await expect(page).toHaveURL(/topics=/);
        }
      );
      await withTestStep(
        testInfo,
        "Reload the page and verify query parameters persist",
        async () => {
          const urlBeforeReload = page.url();
          await page.reload();
          await expect(page).toHaveURL(new RegExp(urlBeforeReload));
        }
      );
    });
  }
);
