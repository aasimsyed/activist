// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/**
 * Selectors for individual FAQ card elements
 */
export function getFAQCardSelectors(page: Page) {
  return {
    getFaqCard(index: number) {
      return page.getByTestId("faq-card").nth(index);
    },

    getFaqQuestion(index: number) {
      return page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-question");
    },

    getFaqAnswer(index: number) {
      return page.getByTestId("faq-card").nth(index).getByTestId("faq-answer");
    },

    getFaqDragHandle(index: number) {
      return page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-drag-handle");
    },

    getFaqDisclosureButton(index: number) {
      return page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-disclosure-button");
    },

    getFaqEditButton(index: number) {
      return page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-edit-button");
    },

    getFaqDisclosurePanel(index: number) {
      return page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-disclosure-panel");
    },

    getFaqChevronUp(index: number) {
      return page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-chevron-up");
    },

    getFaqChevronDown(index: number) {
      return page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-chevron-down");
    },
  };
}
