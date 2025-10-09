// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Locator, Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

/**
 * Selectors for resource modal elements
 */
export function getResourceModalSelectors(page: Page) {
  return {
    get resourceModal() {
      return page.getByTestId("modal-ModalResourceGroup");
    },

    get resourceModalCloseButton() {
      return this.resourceModal.getByTestId("modal-close-button");
    },

    get editResourceModal() {
      return page.getByTestId("modal-ModalResourceGroup");
    },

    get editResourceModalCloseButton() {
      return this.editResourceModal.getByTestId("modal-close-button");
    },

    getResourceNameInput(modal: Locator) {
      return modal.getByRole("textbox", {
        name: new RegExp(getEnglishText("i18n.pages.contact.name"), "i"),
      });
    },

    getResourceDescriptionInput(modal: Locator) {
      return modal.getByRole("textbox", {
        name: new RegExp(getEnglishText("i18n._global.description"), "i"),
      });
    },

    getResourceUrlInput(modal: Locator) {
      return modal.getByRole("textbox", {
        name: new RegExp(
          getEnglishText("i18n.components.form_resource.link"),
          "i"
        ),
      });
    },

    getResourceSubmitButton(modal: Locator) {
      return modal.getByRole("button", {
        name: new RegExp(getEnglishText("i18n.components.submit"), "i"),
      });
    },
  };
}
