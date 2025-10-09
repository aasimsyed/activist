// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Locator, Page } from "@playwright/test";

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

  // Backward compatibility - map old flat structure to new nested structure

  // Resource List
  get newResourceButton() {
    return this.list.newResourceButton;
  }

  get resourcesList() {
    return this.list.resourcesList;
  }

  get resourceCards() {
    return this.list.resourceCards;
  }

  get firstResourceCard() {
    return this.list.firstResourceCard;
  }

  get lastResourceCard() {
    return this.list.lastResourceCard;
  }

  get emptyState() {
    return this.list.emptyState;
  }

  get emptyStateMessage() {
    return this.list.emptyStateMessage;
  }

  // Resource Card
  getResourceCard(index: number) {
    return this.card.getResourceCard(index);
  }

  getResourceDragHandle(index: number) {
    return this.card.getResourceDragHandle(index);
  }

  getResourceLink(index: number) {
    return this.card.getResourceLink(index);
  }

  getResourceIcon(index: number) {
    return this.card.getResourceIcon(index);
  }

  getResourceTitle(index: number) {
    return this.card.getResourceTitle(index);
  }

  getResourceMenuButton(index: number) {
    return this.card.getResourceMenuButton(index);
  }

  getResourceMenuTooltip(index: number) {
    return this.card.getResourceMenuTooltip(index);
  }

  getResourceShareButton(index: number) {
    return this.card.getResourceShareButton(index);
  }

  getResourceEditButton(index: number) {
    return this.card.getResourceEditButton(index);
  }

  // Modal
  get resourceModal() {
    return this.modal.resourceModal;
  }

  get resourceModalCloseButton() {
    return this.modal.resourceModalCloseButton;
  }

  get editResourceModal() {
    return this.modal.editResourceModal;
  }

  get editResourceModalCloseButton() {
    return this.modal.editResourceModalCloseButton;
  }

  getResourceNameInput(modal: Locator) {
    return this.modal.getResourceNameInput(modal);
  }

  getResourceDescriptionInput(modal: Locator) {
    return this.modal.getResourceDescriptionInput(modal);
  }

  getResourceUrlInput(modal: Locator) {
    return this.modal.getResourceUrlInput(modal);
  }

  getResourceSubmitButton(modal: Locator) {
    return this.modal.getResourceSubmitButton(modal);
  }

  // Tabs
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
  async clickNewResource() {
    return await this.actions.clickNewResource();
  }

  async clickResourceLink(index: number) {
    return await this.actions.clickResourceLink(index);
  }

  async clickResourceMenu(index: number) {
    return await this.actions.clickResourceMenu(index);
  }

  async clickResourceShare(index: number) {
    return await this.actions.clickResourceShare(index);
  }

  async clickResourceEdit(index: number) {
    return await this.actions.clickResourceEdit(index);
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

  async getResourceCount() {
    return await this.actions.getResourceCount();
  }

  async isNewResourceButtonVisible() {
    return await this.actions.isNewResourceButtonVisible();
  }

  async isResourcesTabActive() {
    return await this.actions.isResourcesTabActive();
  }

  async isEmptyStateVisible() {
    return await this.actions.isEmptyStateVisible();
  }

  async hasResources() {
    return await this.actions.hasResources();
  }

  async getResourceTitleText(index: number) {
    return await this.actions.getResourceTitleText(index);
  }

  async getResourceUrl(index: number) {
    return await this.actions.getResourceUrl(index);
  }

  async dragResourceToPosition(fromIndex: number, toIndex: number) {
    return await this.dragDrop.dragResourceToPosition(fromIndex, toIndex);
  }
}
