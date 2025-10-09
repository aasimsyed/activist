// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getFAQCardSelectors } from "../selectors/faq-card-selectors";
import { getFAQListSelectors } from "../selectors/faq-list-selectors";
import { getFAQTabSelectors } from "../selectors/faq-tab-selectors";

/**
 * Actions for FAQ interactions (clicks, expand/collapse, edit)
 */
export function createFAQInteractionActions(page: Page) {
  const listSelectors = getFAQListSelectors(page);
  const cardSelectors = getFAQCardSelectors(page);
  const tabSelectors = getFAQTabSelectors(page);

  return {
    async clickNewFaq() {
      await listSelectors.newFaqButton.click();
    },

    async clickFaqDisclosure(index: number) {
      await cardSelectors.getFaqDisclosureButton(index).click();
    },

    async clickFaqEdit(index: number) {
      await cardSelectors.getFaqEditButton(index).click();
    },

    async clickAboutTab() {
      await tabSelectors.aboutTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/about/);
    },

    async clickEventsTab() {
      await tabSelectors.eventsTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/events/);
    },

    async clickResourcesTab() {
      await tabSelectors.resourcesTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/resources/);
    },

    async clickFaqTab() {
      await tabSelectors.faqTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/faq/);
    },

    async getFaqCount() {
      return await listSelectors.faqCards.count();
    },

    async isNewFaqButtonVisible() {
      return await listSelectors.newFaqButton.isVisible();
    },

    async isFaqTabActive() {
      return (
        (await tabSelectors.faqTab.getAttribute("aria-selected")) === "true"
      );
    },

    async isEmptyStateVisible() {
      return await listSelectors.emptyState.isVisible();
    },

    async hasFaqEntries() {
      const count = await this.getFaqCount();
      return count > 0;
    },

    async getFaqQuestionText(index: number) {
      return await cardSelectors.getFaqQuestion(index).textContent();
    },

    async getFaqAnswerText(index: number) {
      return await cardSelectors.getFaqAnswer(index).textContent();
    },

    async isFaqExpanded(index: number) {
      const chevronUp = cardSelectors.getFaqChevronUp(index);
      return await chevronUp.isVisible();
    },

    async isFaqCollapsed(index: number) {
      const chevronDown = cardSelectors.getFaqChevronDown(index);
      return await chevronDown.isVisible();
    },

    async expandFaq(index: number) {
      const expandButton = page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-disclosure-button");
      await expandButton.click();
    },

    async collapseFaq(index: number) {
      const collapseButton = page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-disclosure-button");
      await collapseButton.click();
    },

    async editFaq(index: number) {
      const editButton = page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-edit-button");
      await editButton.click();
    },
  };
}
