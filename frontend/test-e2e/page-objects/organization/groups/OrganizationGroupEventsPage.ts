// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

/**
 * Page Object Model for Organization Group Events Page
 *
 * Flat POM pattern with semantic prefixes for improved readability.
 * All selectors and actions are at the top level, organized by type:
 * - Header elements: newEventButton, subscribeToEventsButton
 * - List elements: eventsList, eventCards, firstEventCard, lastEventCard
 * - Empty state: emptyState, emptyStateMessage
 * - Tab elements: aboutTab, eventsTab, resourcesTab, faqTab
 * - Card methods: getEventCard(), getEventLink(), getEventTitle(), etc.
 * - Actions: clickNewEvent(), clickSubscribeToEvents(), getEventCount(), etc.
 */
export const newGroupEventsPage = (page: Page) => {
  return {
    // ========================================
    // HEADER ELEMENTS
    // ========================================

    get newEventButton() {
      return page.getByRole("link", { name: /new event/i });
    },

    get subscribeToEventsButton() {
      return page.getByRole("button", { name: /subscribe to events/i });
    },

    // ========================================
    // LIST AND CARD ELEMENTS
    // ========================================

    get eventsList() {
      return page.locator(".space-y-3.py-4");
    },

    get eventCards() {
      return page.getByTestId("event-card");
    },

    get firstEventCard() {
      return this.eventCards.first();
    },

    get lastEventCard() {
      return this.eventCards.last();
    },

    // ========================================
    // EMPTY STATE ELEMENTS
    // ========================================

    get emptyState() {
      return page.getByTestId("empty-state");
    },

    get emptyStateMessage() {
      return this.emptyState.getByRole("heading", { level: 4 }).first();
    },

    // ========================================
    // TAB NAVIGATION ELEMENTS
    // ========================================

    get tabs() {
      return page.getByRole("tablist");
    },

    get aboutTab() {
      return page.getByRole("tab", {
        name: new RegExp(getEnglishText("i18n._global.about"), "i"),
      });
    },

    get eventsTab() {
      return page.getByRole("tab", {
        name: new RegExp(getEnglishText("i18n._global.events"), "i"),
      });
    },

    get resourcesTab() {
      return page.getByRole("tab", {
        name: new RegExp(getEnglishText("i18n._global.resources"), "i"),
      });
    },

    get faqTab() {
      return page.getByRole("tab", {
        name: new RegExp(getEnglishText("i18n._global.faq"), "i"),
      });
    },

    // ========================================
    // CARD INTERACTION METHODS (by index)
    // ========================================

    getEventCard(index: number) {
      return this.eventCards.nth(index);
    },

    getEventLink(index: number) {
      return this.eventCards.nth(index).getByRole("link").first();
    },

    async getEventTitle(index: number) {
      const eventCard = this.eventCards.nth(index);
      return await eventCard.getByTestId("event-title").textContent();
    },

    async getEventDate(index: number) {
      const eventCard = this.eventCards.nth(index);
      return await eventCard.getByTestId("event-date").textContent();
    },

    async getEventLocation(index: number) {
      const eventCard = this.eventCards.nth(index);
      return await eventCard.getByTestId("event-location").textContent();
    },

    // ========================================
    // ACTIONS
    // ========================================

    async clickNewEvent() {
      await this.newEventButton.click();
    },

    async clickSubscribeToEvents() {
      await this.subscribeToEventsButton.click();
    },

    async clickFirstEvent() {
      await this.firstEventCard.click();
    },

    async clickAboutTab() {
      await this.aboutTab.click();
    },

    async clickEventsTab() {
      await this.eventsTab.click();
    },

    async clickResourcesTab() {
      await this.resourcesTab.click();
    },

    async clickFaqTab() {
      await this.faqTab.click();
    },

    // ========================================
    // VERIFICATION METHODS
    // ========================================

    async getEventCount() {
      return await this.eventCards.count();
    },

    async isNewEventButtonVisible() {
      return await this.newEventButton.isVisible();
    },

    async isSubscribeToEventsButtonVisible() {
      return await this.subscribeToEventsButton.isVisible();
    },

    async isEventsTabActive() {
      return (await this.eventsTab.getAttribute("aria-selected")) === "true";
    },

    async isEmptyStateVisible() {
      return await this.emptyState.isVisible();
    },

    async hasEvents() {
      const count = await this.getEventCount();
      return count > 0;
    },
  };
};

export type GroupEventsPage = ReturnType<typeof newGroupEventsPage>;
