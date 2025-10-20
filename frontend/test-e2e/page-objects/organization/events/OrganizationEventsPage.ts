// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

export const newOrganizationEventsPage = (page: Page) => ({
  // MARK: Header Action

  eventsNewButton: page.getByRole("link", {
    name: new RegExp(
      getEnglishText(
        "i18n.pages.organizations.events.new_org_event_aria_label"
      ),
      "i"
    ),
  }),
  eventsSubscribeButton: page.getByRole("button", {
    name: new RegExp(
      getEnglishText(
        "i18n.pages.organizations._global.subscribe_to_events_aria_label"
      ),
      "i"
    ),
  }),

  // MARK: Events List

  eventsList: page.getByTestId("organization-events-list"),
  eventCards: page.getByTestId("event-card"),

  // MARK: Event Card

  getEventCard: (index: number) => page.getByTestId("event-card").nth(index),
  getEventTitle: (index: number) =>
    page
      .getByTestId("event-card")
      .nth(index)
      .getByRole("heading", { level: 3 })
      .first(),
  getEventLink: (index: number) =>
    page.getByTestId("event-card").nth(index).getByRole("link").first(),
  getEventDate: (index: number) =>
    page.getByTestId("event-card").nth(index).locator("[class*='date']"),
  getEventLocation: (index: number) =>
    page.getByTestId("event-card").nth(index).locator("[class*='location']"),

  // MARK: Event Menu

  getEventMenuButton: (index: number) =>
    page.getByTestId("event-card").nth(index).getByTestId("menu-button"),
  getEventMenuTooltip: (index: number) =>
    page.getByTestId("event-card").nth(index).getByTestId("menu-tooltip"),
  getEventShareButton: (index: number) =>
    page
      .getByTestId("event-card")
      .nth(index)
      .getByRole("button", {
        name: new RegExp(
          getEnglishText("i18n._global.share_event_aria_label"),
          "i"
        ),
      }),
  getEventSubscribeButton: (index: number) =>
    page
      .getByTestId("event-card")
      .nth(index)
      .getByRole("button", {
        name: new RegExp(
          getEnglishText("i18n._global.subscribe_to_event_aria_label"),
          "i"
        ),
      }),

  // MARK: Empty State

  emptyState: page.getByTestId("empty-state"),
  emptyStateMessage: page.getByTestId("empty-state").locator("p").first(),

  // MARK: Event Navigation

  navigateToEvent: async (index: number) => {
    // Import sidebar page object
    const { newSidebarLeft } = await import(
      "~/test-e2e/component-objects/SidebarLeft"
    );
    const sidebarLeft = newSidebarLeft(page);

    // Check if we're on a mobile/tablet viewport where sidebar might be expanded
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1280) {
      // Check if sidebar element exists (it doesn't on mobile)
      const sidebarExists = (await page.locator("#sidebar-left").count()) > 0;
      if (sidebarExists) {
        // Check if sidebar is expanded and collapse it if needed
        const isExpanded = await sidebarLeft.isExpanded();
        if (isExpanded) {
          // On mobile/tablet, simulate mouse leaving the sidebar like desktop behavior
          const viewport = page.viewportSize();
          await page.mouse.move(viewport!.width - 10, 10); // Move to right side of screen (outside sidebar)

          await sidebarLeft.expectIsCollapsed();
        }
      }
    }

    const eventLink = page
      .getByTestId("event-card")
      .nth(index)
      .getByRole("link")
      .first();
    await eventLink.click();
  },

  // MARK: Count Helpers
  getEventCount: async () => {
    return await page.getByTestId("event-card").count();
  },
});
