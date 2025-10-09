// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

/**
 * Selectors for About page content elements
 */
export function getAboutContentSelectors(page: Page) {
  return {
    get joinGroupButton() {
      return page.getByRole("link", {
        name: new RegExp(
          getEnglishText("i18n._global.join_group_aria_label"),
          "i"
        ),
      });
    },

    get shareButton() {
      return page.getByRole("button", {
        name: new RegExp(
          getEnglishText(
            "i18n.pages.organizations.groups.about.share_group_aria_label"
          ),
          "i"
        ),
      });
    },

    get aboutCard() {
      return page.getByTestId("card-about");
    },

    get imageCarousel() {
      return page.getByTestId("image-carousel");
    },

    get getInvolvedCard() {
      return page.getByTestId("card-get-involved");
    },

    get connectCard() {
      return page.getByTestId("card-connect");
    },
  };
}
