// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Locator, Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

/**
 * Selectors for FAQ modal elements
 */
export function getFAQModalSelectors(page: Page) {
  return {
    get faqModal() {
      return page.locator("#modal").first();
    },

    get faqModalCloseButton() {
      return this.faqModal.getByTestId("modal-close-button");
    },

    get editFaqModal() {
      return page.locator("#modal").first();
    },

    get editFaqModalCloseButton() {
      return this.editFaqModal.getByTestId("modal-close-button");
    },

    getFaqQuestionInput(modal: Locator) {
      return modal.getByRole("textbox", {
        name: new RegExp(
          getEnglishText("i18n.components.form_faq_entry.question"),
          "i"
        ),
      });
    },

    getFaqAnswerInput(modal: Locator) {
      return modal.getByRole("textbox", {
        name: new RegExp(
          getEnglishText("i18n.components.form_faq_entry.answer"),
          "i"
        ),
      });
    },

    getFaqSubmitButton(modal: Locator) {
      return modal.getByRole("button", {
        name: new RegExp(getEnglishText("i18n.components.submit"), "i"),
      });
    },
  };
}
