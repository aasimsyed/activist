// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "playwright";

import { expect } from "playwright/test";

import { navigateToFirstOrganization } from "./organization-navigation";

/**
 * Navigate to the first event from the first organization's events page
 * @param page - Playwright page object
 * @returns Object containing organizationId, eventId (if available), and page objects
 */
export async function navigateToFirstOrganizationEvent(page: Page) {
  // First navigate to the first organization.
  const { organizationId, organizationPage } =
    await navigateToFirstOrganization(page);

  // Navigate to the Events tab.
  await organizationPage.menu.eventsOption.click();
  await expect(page).toHaveURL(/.*\/organizations\/.*\/events/);

  // Check if there are any events available.
  const { eventsPage } = organizationPage;
  const eventCount = await eventsPage.getEventCount();

  if (eventCount === 0) {
    throw new Error("No events available to navigate to");
  }

  // Get the first event's URL before navigating.
  const firstEventLink = eventsPage.getEventLink(0);
  const eventUrl = await firstEventLink.getAttribute("href");

  if (!eventUrl) {
    throw new Error("Could not get event URL");
  }

  // Extract event ID from the URL (assuming format like /events/{uuid}).
  const eventId = eventUrl.match(/\/events\/([a-f0-9-]{36})/)?.[1];

  if (!eventId) {
    throw new Error("Could not extract event ID from URL");
  }

  // Navigate to the first event.
  await eventsPage.navigateToEvent(0);
  await page.waitForURL(`**/events/${eventId}/**`);

  // Verify we're on the event page.
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  return {
    organizationId,
    eventId,
    organizationPage,
    eventsPage,
  };
}
