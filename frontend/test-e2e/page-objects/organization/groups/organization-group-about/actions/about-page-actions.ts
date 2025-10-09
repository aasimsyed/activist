// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Locator, Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

import { getAboutContentSelectors } from "../selectors/about-content-selectors";
import { getAboutTabSelectors } from "../selectors/about-tab-selectors";

/**
 * Actions for About page interactions
 */
export function createAboutPageActions(page: Page) {
  const contentSelectors = getAboutContentSelectors(page);
  const tabSelectors = getAboutTabSelectors(page);

  // Helper method to wait for tab state to update.
  async function waitForTabState(tab: Locator, expectedSelected: boolean) {
    await tab.waitFor({ state: "attached" });

    // Wait for the tab to have the correct aria-selected state.
    await page.waitForFunction(
      ({ tabSelector, expected }) => {
        const tabs = document.querySelectorAll(tabSelector);
        for (const tab of tabs) {
          if (tab.getAttribute("aria-selected") === expected) {
            return true;
          }
        }
        return false;
      },
      {
        tabSelector: '[role="tab"]',
        expected: expectedSelected.toString(),
      },
      { timeout: 10000 }
    );
  }

  return {
    async clickJoinGroup() {
      await contentSelectors.joinGroupButton.click();
    },

    async clickShare() {
      await contentSelectors.shareButton.click();
    },

    async clickAboutTab() {
      await tabSelectors.aboutTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/about/);
      await waitForTabState(tabSelectors.aboutTab, true);
    },

    async clickEventsTab() {
      await tabSelectors.eventsTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/events/);
      await waitForTabState(tabSelectors.eventsTab, true);
    },

    async clickResourcesTab() {
      await tabSelectors.resourcesTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/resources/);
      await waitForTabState(tabSelectors.resourcesTab, true);
    },

    async clickFaqTab() {
      await tabSelectors.faqTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/faq/);
      await waitForTabState(tabSelectors.faqTab, true);
    },

    async expandReduceText() {
      const expandButton = page.getByRole("button", {
        name: new RegExp(
          getEnglishText(
            "i18n.components.card.about._global.full_text_aria_label"
          ),
          "i"
        ),
      });
      const collapseButton = page.getByRole("button", {
        name: new RegExp(
          getEnglishText(
            "i18n.components.card.about._global.reduce_text_aria_label"
          ),
          "i"
        ),
      });

      if (await expandButton.isVisible()) {
        await expandButton.click();
      } else if (await collapseButton.isVisible()) {
        await collapseButton.click();
      }
    },

    async isJoinGroupButtonVisible() {
      return await contentSelectors.joinGroupButton.isVisible();
    },

    async isShareButtonVisible() {
      return await contentSelectors.shareButton.isVisible();
    },

    async isAboutCardVisible() {
      return await contentSelectors.aboutCard.isVisible();
    },

    async isImageCarouselVisible() {
      return await contentSelectors.imageCarousel.isVisible();
    },

    async isAboutTabActive() {
      return (
        (await tabSelectors.aboutTab.getAttribute("aria-selected")) === "true"
      );
    },
  };
}
