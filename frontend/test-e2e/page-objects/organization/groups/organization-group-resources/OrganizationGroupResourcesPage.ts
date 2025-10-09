// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { createResourceDragDropActions } from "./actions/resource-drag-drop-actions";
import { createResourceInteractionActions } from "./actions/resource-interaction-actions";
import { getResourceCardSelectors } from "./selectors/resource-card-selectors";
import { getResourceListSelectors } from "./selectors/resource-list-selectors";
import { getResourceModalSelectors } from "./selectors/resource-modal-selectors";
import { getResourceTabSelectors } from "./selectors/resource-tab-selectors";

/**
 * Page Object Model for Organization Group Resources Page
 * Handles interactions with the group resources page within an organization
 */
export class OrganizationGroupResourcesPage {
  constructor(private readonly page: Page) {}

  // Selector aggregators
  get list() {
    return getResourceListSelectors(this.page);
  }

  get card() {
    return getResourceCardSelectors(this.page);
  }

  get modal() {
    return getResourceModalSelectors(this.page);
  }

  get tabs() {
    return getResourceTabSelectors(this.page);
  }

  // Action aggregators
  get actions() {
    return createResourceInteractionActions(this.page);
  }

  get dragDrop() {
    return createResourceDragDropActions(this.page);
  }
}
