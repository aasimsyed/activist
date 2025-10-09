// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getResourceCardSelectors } from "../selectors/resource-card-selectors";
import { getResourceListSelectors } from "../selectors/resource-list-selectors";
import { getResourceTabSelectors } from "../selectors/resource-tab-selectors";

/**
 * Actions for resource interactions
 */
export function createResourceInteractionActions(page: Page) {
  const listSelectors = getResourceListSelectors(page);
  const cardSelectors = getResourceCardSelectors(page);
  const tabSelectors = getResourceTabSelectors(page);

  return {
    async clickNewResource() {
      await listSelectors.newResourceButton.click();
    },

    async clickResourceLink(index: number) {
      await cardSelectors.getResourceLink(index).click();
    },

    async clickResourceMenu(index: number) {
      await cardSelectors.getResourceMenuButton(index).click();
    },

    async clickResourceShare(index: number) {
      await cardSelectors.getResourceShareButton(index).click();
    },

    async clickResourceEdit(index: number) {
      await cardSelectors.getResourceEditButton(index).click();
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

    async getResourceCount() {
      return await listSelectors.resourceCards.count();
    },

    async isNewResourceButtonVisible() {
      return await listSelectors.newResourceButton.isVisible();
    },

    async isResourcesTabActive() {
      return (
        (await tabSelectors.resourcesTab.getAttribute("aria-selected")) ===
        "true"
      );
    },

    async isEmptyStateVisible() {
      return await listSelectors.emptyState.isVisible();
    },

    async hasResources() {
      const count = await this.getResourceCount();
      return count > 0;
    },

    async getResourceTitleText(index: number) {
      return await cardSelectors.getResourceTitle(index).textContent();
    },

    async getResourceUrl(index: number) {
      const link = cardSelectors.getResourceLink(index);
      return await link.getAttribute("href");
    },
  };
}
