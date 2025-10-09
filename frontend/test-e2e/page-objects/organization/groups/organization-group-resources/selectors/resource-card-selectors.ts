// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

/**
 * Selectors for individual resource card elements
 */
export function getResourceCardSelectors(page: Page) {
  return {
    getResourceCard(index: number) {
      return page.getByTestId("resource-card").nth(index);
    },

    getResourceDragHandle(index: number) {
      return page
        .getByTestId("resource-card")
        .nth(index)
        .getByTestId("resource-drag-handle");
    },

    getResourceLink(index: number) {
      return page
        .getByTestId("resource-card")
        .nth(index)
        .getByTestId("resource-link");
    },

    getResourceIcon(index: number) {
      return page
        .getByTestId("resource-card")
        .nth(index)
        .getByTestId("resource-icon");
    },

    getResourceTitle(index: number) {
      return page
        .getByTestId("resource-card")
        .nth(index)
        .getByRole("heading", { level: 3 });
    },

    getResourceMenuButton(index: number) {
      return page
        .getByTestId("resource-card")
        .nth(index)
        .getByTestId("menu-button");
    },

    getResourceMenuTooltip(index: number) {
      return page
        .getByTestId("resource-card")
        .nth(index)
        .getByTestId("menu-tooltip");
    },

    getResourceShareButton(index: number) {
      return page
        .getByTestId("resource-card")
        .nth(index)
        .getByTestId("menu-tooltip")
        .getByRole("button", {
          name: new RegExp(getEnglishText("i18n._global.share"), "i"),
        });
    },

    getResourceEditButton(index: number) {
      return page
        .getByTestId("resource-card")
        .nth(index)
        .getByTestId("icon-edit");
    },
  };
}
