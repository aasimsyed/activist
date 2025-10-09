// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

/**
 * Selectors for FAQ list elements
 */
export function getFAQListSelectors(page: Page) {
  return {
    get newFaqButton() {
      return page.getByRole("button", {
        name: new RegExp(
          getEnglishText("i18n.pages._global.new_faq_aria_label"),
          "i"
        ),
      });
    },

    get faqList() {
      return page.getByTestId("organization-group-faq-list");
    },

    get faqCards() {
      return page.getByTestId("faq-card");
    },

    get firstFaqCard() {
      return this.faqCards.first();
    },

    get lastFaqCard() {
      return this.faqCards.last();
    },

    get emptyState() {
      return page.getByTestId("empty-state");
    },

    get emptyStateMessage() {
      return this.emptyState.getByRole("heading", { level: 4 }).first();
    },
  };
}
