// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Locator, Page } from "@playwright/test";

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

  // Backward compatibility - map old flat structure to new nested structure
  // These can be deprecated over time as tests are updated

  // FAQ List
  get newFaqButton() {
    return this.list.newFaqButton;
  }

  get faqList() {
    return this.list.faqList;
  }

  get faqCards() {
    return this.list.faqCards;
  }

  get firstFaqCard() {
    return this.list.firstFaqCard;
  }

  get lastFaqCard() {
    return this.list.lastFaqCard;
  }

  get emptyState() {
    return this.list.emptyState;
  }

  get emptyStateMessage() {
    return this.list.emptyStateMessage;
  }

  // FAQ Card
  getFaqCard(index: number) {
    return this.card.getFaqCard(index);
  }

  getFaqQuestion(index: number) {
    return this.card.getFaqQuestion(index);
  }

  getFaqAnswer(index: number) {
    return this.card.getFaqAnswer(index);
  }

  getFaqDragHandle(index: number) {
    return this.card.getFaqDragHandle(index);
  }

  getFaqDisclosureButton(index: number) {
    return this.card.getFaqDisclosureButton(index);
  }

  getFaqEditButton(index: number) {
    return this.card.getFaqEditButton(index);
  }

  getFaqDisclosurePanel(index: number) {
    return this.card.getFaqDisclosurePanel(index);
  }

  getFaqChevronUp(index: number) {
    return this.card.getFaqChevronUp(index);
  }

  getFaqChevronDown(index: number) {
    return this.card.getFaqChevronDown(index);
  }

  // Modal
  get faqModal() {
    return this.modal.faqModal;
  }

  get faqModalCloseButton() {
    return this.modal.faqModalCloseButton;
  }

  get editFaqModal() {
    return this.modal.editFaqModal;
  }

  get editFaqModalCloseButton() {
    return this.modal.editFaqModalCloseButton;
  }

  getFaqQuestionInput(modal: Locator) {
    return this.modal.getFaqQuestionInput(modal);
  }

  getFaqAnswerInput(modal: Locator) {
    return this.modal.getFaqAnswerInput(modal);
  }

  getFaqSubmitButton(modal: Locator) {
    return this.modal.getFaqSubmitButton(modal);
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
  async clickNewFaq() {
    return await this.actions.clickNewFaq();
  }

  async clickFaqDisclosure(index: number) {
    return await this.actions.clickFaqDisclosure(index);
  }

  async clickFaqEdit(index: number) {
    return await this.actions.clickFaqEdit(index);
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

  async getFaqCount() {
    return await this.actions.getFaqCount();
  }

  async isNewFaqButtonVisible() {
    return await this.actions.isNewFaqButtonVisible();
  }

  async isFaqTabActive() {
    return await this.actions.isFaqTabActive();
  }

  async isEmptyStateVisible() {
    return await this.actions.isEmptyStateVisible();
  }

  async hasFaqEntries() {
    return await this.actions.hasFaqEntries();
  }

  async getFaqQuestionText(index: number) {
    return await this.actions.getFaqQuestionText(index);
  }

  async getFaqAnswerText(index: number) {
    return await this.actions.getFaqAnswerText(index);
  }

  async isFaqExpanded(index: number) {
    return await this.actions.isFaqExpanded(index);
  }

  async isFaqCollapsed(index: number) {
    return await this.actions.isFaqCollapsed(index);
  }

  async expandFaq(index: number) {
    return await this.actions.expandFaq(index);
  }

  async collapseFaq(index: number) {
    return await this.actions.collapseFaq(index);
  }

  async editFaq(index: number) {
    return await this.actions.editFaq(index);
  }

  async getFaqDragHandlePosition(index: number) {
    return await this.dragDrop.getFaqDragHandlePosition(index);
  }

  async dragFaqToPosition(fromIndex: number, toIndex: number) {
    return await this.dragDrop.dragFaqToPosition(fromIndex, toIndex);
  }
}
