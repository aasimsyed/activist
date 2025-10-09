// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { createFAQDragDropActions } from "./actions/faq-drag-drop-actions";
import { createFAQInteractionActions } from "./actions/faq-interaction-actions";
import { getFAQCardSelectors } from "./selectors/faq-card-selectors";
import { getFAQListSelectors } from "./selectors/faq-list-selectors";
import { getFAQModalSelectors } from "./selectors/faq-modal-selectors";
import { getFAQTabSelectors } from "./selectors/faq-tab-selectors";

/**
 * Page Object Model for Organization Group FAQ Page
 * Handles interactions with the group FAQ page within an organization
 */
export class OrganizationGroupFAQPage {
  constructor(private readonly page: Page) {}

  // Selector aggregators
  get list() {
    return getFAQListSelectors(this.page);
  }

  get card() {
    return getFAQCardSelectors(this.page);
  }

  get modal() {
    return getFAQModalSelectors(this.page);
  }

  get tabs() {
    return getFAQTabSelectors(this.page);
  }

  // Action aggregators
  get actions() {
    return createFAQInteractionActions(this.page);
  }

  get dragDrop() {
    return createFAQDragDropActions(this.page);
  }
}
