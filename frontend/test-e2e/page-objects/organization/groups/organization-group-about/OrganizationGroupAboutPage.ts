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

  // Backward compatibility - map old flat structure to new nested structure

  // Header
  get joinGroupButton() {
    return this.content.joinGroupButton;
  }

  get shareButton() {
    return this.content.shareButton;
  }

  // Content
  get aboutCard() {
    return this.content.aboutCard;
  }

  get imageCarousel() {
    return this.content.imageCarousel;
  }

  get getInvolvedCard() {
    return this.content.getInvolvedCard;
  }

  get connectCard() {
    return this.content.connectCard;
  }

  // Modals
  get shareModal() {
    return this.modals.shareModal;
  }

  get socialLinksModal() {
    return this.modals.socialLinksModal;
  }

  get textModal() {
    return this.modals.textModal;
  }

  // Tabs - Note: Keep these for backward compatibility
  get aboutTab() {
    return this.tabs.aboutTab;
  }

  get eventsTab() {
    return this.tabs.eventsTab;
  }

  get resourcesTab() {
    return this.tabs.resourcesTab;
  }

  get faqTab() {
    return this.tabs.faqTab;
  }

  // Actions
  async clickJoinGroup() {
    return await this.actions.clickJoinGroup();
  }

  async clickShare() {
    return await this.actions.clickShare();
  }

  async clickAboutTab() {
    return await this.actions.clickAboutTab();
  }

  async clickEventsTab() {
    return await this.actions.clickEventsTab();
  }

  async clickResourcesTab() {
    return await this.actions.clickResourcesTab();
  }

  async clickFaqTab() {
    return await this.actions.clickFaqTab();
  }

  async expandReduceText() {
    return await this.actions.expandReduceText();
  }

  async isJoinGroupButtonVisible() {
    return await this.actions.isJoinGroupButtonVisible();
  }

  async isShareButtonVisible() {
    return await this.actions.isShareButtonVisible();
  }

  async isAboutCardVisible() {
    return await this.actions.isAboutCardVisible();
  }

  async isImageCarouselVisible() {
    return await this.actions.isImageCarouselVisible();
  }

  async isShareModalOpen() {
    return await this.modals.shareModal.isVisible();
  }

  async isAboutTabActive() {
    return await this.actions.isAboutTabActive();
  }
}
