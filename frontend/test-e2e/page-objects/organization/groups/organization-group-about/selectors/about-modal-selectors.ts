// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/**
 * Selectors for About page modal elements
 */
export function getAboutModalSelectors(page: Page) {
  return {
    get shareModal() {
      return page.getByTestId("modal-ModalSharePage");
    },

    get socialLinksModal() {
      return page.getByTestId("modal-ModalSocialLinksGroup");
    },

    get textModal() {
      return page.getByTestId("modal-ModalTextGroup");
    },
  };
}
