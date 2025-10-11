// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "playwright";

import { expect } from "playwright/test";

import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { newOrganizationsHomePage } from "~/test-e2e/page-objects/OrganizationsHomePage";
import { getEnglishText } from "~/utils/i18n";

/**
 * Navigate to the first organization page from the organizations list
 * @param page - Playwright page object
 * @returns Object containing the organizationId and organizationPage object
 */
export async function navigateToFirstOrganization(page: Page) {
  // Navigate to organizations home page.
  await page.goto("/organizations", { waitUntil: "domcontentloaded" });

  // On mobile viewports, ensure sidebar doesn't block content
  const viewport = page.viewportSize();
  if (viewport && viewport.width <= 1024) {
    // Move mouse to right side of screen to trigger sidebar collapse
    await page.mouse.move(viewport.width - 50, viewport.height / 2);
    await page.waitForTimeout(500); // Wait for sidebar animation
  }

  const organizationsHomePage = newOrganizationsHomePage(page);

  // Wait for the heading to be visible before checking text.
  await expect(organizationsHomePage.heading).toBeVisible();
  await expect(organizationsHomePage.heading).toHaveText(
    getEnglishText("i18n.pages.organizations.index.header_title")
  );

  // Wait for at least one organization card to load (data from API).
  // This is the key wait - ensures backend API has returned organizations.
  await expect(page.getByTestId("organization-card").first()).toBeVisible({
    timeout: 30000, // increased for slow remote servers
  });

  // Wait for organization link to be available (should be quick after card is visible).
  await expect(organizationsHomePage.organizationLink).toBeVisible({
    timeout: 10000,
  });

  // Get the href attribute to extract the organization UUID.
  const href =
    await organizationsHomePage.organizationLink.getAttribute("href");
  const organizationId = href?.match(/\/organizations\/([a-f0-9-]{36})/)?.[1];

  if (!organizationId) {
    throw new Error(`Could not extract organization ID from href: ${href}`);
  }

  // Click on the first organization to navigate to its page.
  await organizationsHomePage.organizationLink.click();
  await page.waitForURL(`**/organizations/${organizationId}/**`);

  const organizationPage = newOrganizationPage(page);
  await expect(organizationPage.pageHeading).toBeVisible();

  return {
    organizationId,
    organizationPage,
  };
}

/**
 * Navigate directly to a specific organization page by ID
 * @param page - Playwright page object
 * @param organizationId - The UUID of the organization
 * @returns OrganizationPage object
 */
export async function navigateToOrganization(
  page: Page,
  organizationId: string
) {
  await page.goto(`/organizations/${organizationId}`);
  await page.waitForURL(`**/organizations/${organizationId}/**`);

  const organizationPage = newOrganizationPage(page);
  await expect(organizationPage.pageHeading).toBeVisible();

  return organizationPage;
}

/**
 * Navigate to organization subpage using the appropriate navigation pattern for the platform
 * @param page - Playwright page object
 * @param subpage - The subpage to navigate to (e.g., 'events', 'resources', 'groups')
 * @returns Object containing organizationId and organizationPage
 */
export async function navigateToOrganizationSubpage(
  page: Page,
  subpage: string
) {
  // Map subpage names to menu option names.
  const subpageMapping: Record<string, string> = {
    faq: "questions",
    // Add other mappings as needed.
  };

  const menuSubpage = subpageMapping[subpage] || subpage;

  // Skip authentication since tests are already authenticated via global storageState.
  const { organizationId, organizationPage } =
    await navigateToFirstOrganization(page);

  // On mobile viewports, ensure sidebar doesn't block content
  const viewportSize = page.viewportSize();
  if (viewportSize && viewportSize.width <= 1024) {
    // Move mouse to right side of screen to trigger sidebar collapse
    await page.mouse.move(viewportSize.width - 50, viewportSize.height / 2);
    await page.waitForTimeout(500); // Wait for sidebar animation
  }

  // Detect if mobile layout is active by checking viewport width.
  const isMobileLayout = viewportSize ? viewportSize.width < 768 : false;
  const submenu = page.locator("#submenu");

  if (isMobileLayout) {
    // Mobile layout: requires opening dropdown menu first.
    await submenu.waitFor({ timeout: 10000 });

    const listboxButton = submenu.getByRole("button");
    await listboxButton.waitFor({ state: "attached", timeout: 10000 });

    // Check if the dropdown is already open before clicking.
    const isAlreadyOpen =
      (await listboxButton.getAttribute("aria-expanded")) === "true";
    if (!isAlreadyOpen) {
      await listboxButton.click();
      await page.getByRole("listbox").waitFor({ timeout: 10000 });
    }

    // Wait for the page to be fully loaded and menu entries to be initialized.
    await page.waitForLoadState("domcontentloaded");

    // Wait for the organization page heading to be visible (ensures page is loaded).
    await expect(organizationPage.pageHeading).toBeVisible();

    // Wait for the dropdown options to be rendered.
    await page.getByRole("listbox").waitFor({ timeout: 10000 });

    // Use original subpage name for i18n lookup, not the mapped menuSubpage.
    const i18nKeyMap: Record<string, string> = {
      resources: "i18n._global.resources",
      events: "i18n._global.events",
      faq: "i18n._global.faq",
      groups: "i18n.composables.use_menu_entries_state.groups",
      affiliates: "i18n.composables.use_menu_entries_state.affiliates",
      tasks: "i18n.composables.use_menu_entries_state.tasks",
      discussions: "i18n._global.discussions",
      settings: "i18n._global.settings",
    };

    const i18nKey =
      i18nKeyMap[subpage] ||
      `i18n.composables.use_menu_entries_state.${subpage}`;

    const subpageOption = page.getByRole("option", {
      name: new RegExp(getEnglishText(i18nKey), "i"),
    });

    await subpageOption.click();
  } else {
    // Desktop layout: uses direct tab navigation.
    // Wait for the page to be fully loaded and menu entries to be initialized.
    await page.waitForLoadState("domcontentloaded");
    await expect(organizationPage.pageHeading).toBeVisible();

    // Wait for the specific menu option to be visible and clickable.
    const subpageOption =
      organizationPage.menu[
        `${menuSubpage}Option` as keyof typeof organizationPage.menu
      ];

    await expect(subpageOption).toBeVisible();
    await subpageOption.waitFor({ state: "attached" });

    // Additional wait to ensure menu entries are created with correct route parameters.
    await page.waitForTimeout(500);
    await subpageOption.click();
  }

  await expect(page).toHaveURL(
    new RegExp(`.*\\/organizations\\/.*\\/${subpage}`)
  );
  return { organizationId, organizationPage };
}
