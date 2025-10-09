// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

/**
 * Selectors for resource list elements
 */
export function getResourceListSelectors(page: Page) {
  return {
    get newResourceButton() {
      return page.getByRole("button", {
        name: new RegExp(
          getEnglishText(
            "i18n.pages._global.resources.new_resource_aria_label"
          ),
          "i"
        ),
      });
    },

    get resourcesList() {
      return page.getByTestId("organization-group-resources-list");
    },

    get resourceCards() {
      return page.getByTestId("resource-card");
    },

    get firstResourceCard() {
      return this.resourceCards.first();
    },

    get lastResourceCard() {
      return this.resourceCards.last();
    },

    get emptyState() {
      return page.getByTestId("empty-state");
    },

    get emptyStateMessage() {
      return this.emptyState.getByRole("heading", { level: 4 }).first();
    },
  };
}
