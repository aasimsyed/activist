// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { createAboutPageActions } from "./actions/about-page-actions";
import { getAboutContentSelectors } from "./selectors/about-content-selectors";
import { getAboutModalSelectors } from "./selectors/about-modal-selectors";
import { getAboutTabSelectors } from "./selectors/about-tab-selectors";

/**
 * Page Object Model for Organization Group About Page
 * Handles interactions with the group about page within an organization
 */
export class OrganizationGroupAboutPage {
  constructor(private readonly page: Page) {}

  // Selector aggregators
  get content() {
    return getAboutContentSelectors(this.page);
  }

  get modals() {
    return getAboutModalSelectors(this.page);
  }

  get tabs() {
    return getAboutTabSelectors(this.page);
  }

  // Action aggregator
  get actions() {
    return createAboutPageActions(this.page);
  }
}
