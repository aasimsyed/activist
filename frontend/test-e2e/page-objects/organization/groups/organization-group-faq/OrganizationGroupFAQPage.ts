// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

/**
 * Page Object for Organization Group FAQ Page
 *
 * Simple flat structure for easy understanding by novice contributors.
 * All elements and actions are at the top level with semantic naming.
 *
 * Usage:
 *   const faqPage = newGroupFaqPage(page);
 *   await expect(faqPage.faqCards).toBeVisible();
 *   await faqPage.clickNewFaq();
 */
export const newGroupFaqPage = (page: Page) => {
  return {
    // ========================================
    // FAQ LIST ELEMENTS
    // ========================================
    get newFaqButton() {
      return page.getByRole("button", {
        name: new RegExp(
          getEnglishText("i18n.pages._global.new_faq_aria_label"),
          "i"
        ),
      });
    },

    get faqList() {
      return page.getByTestId("organization-group-faq-list");
    },

    get faqCards() {
      return page.getByTestId("faq-card");
    },

    get firstFaqCard() {
      return this.faqCards.first();
    },

    get lastFaqCard() {
      return this.faqCards.last();
    },

    get emptyState() {
      return page.getByTestId("empty-state");
    },

    get emptyStateMessage() {
      return this.emptyState.getByRole("heading", { level: 4 }).first();
    },

    // ========================================
    // FAQ CARD ELEMENTS (indexed)
    // ========================================
    getFaqCard: (index: number) => page.getByTestId("faq-card").nth(index),

    getFaqQuestion: (index: number) =>
      page.getByTestId("faq-card").nth(index).getByTestId("faq-question"),

    getFaqAnswer: (index: number) =>
      page.getByTestId("faq-card").nth(index).getByTestId("faq-answer"),

    getFaqDragHandle: (index: number) =>
      page.getByTestId("faq-card").nth(index).getByTestId("faq-drag-handle"),

    getFaqDisclosureButton: (index: number) =>
      page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-disclosure-button"),

    getFaqEditButton: (index: number) =>
      page.getByTestId("faq-card").nth(index).getByTestId("faq-edit-button"),

    getFaqDeleteButton: (index: number) =>
      page.getByTestId("faq-card").nth(index).getByTestId("faq-delete-button"),

    getFaqDisclosurePanel: (index: number) =>
      page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-disclosure-panel"),

    getFaqChevronUp: (index: number) =>
      page.getByTestId("faq-card").nth(index).getByTestId("faq-chevron-up"),

    getFaqChevronDown: (index: number) =>
      page.getByTestId("faq-card").nth(index).getByTestId("faq-chevron-down"),

    // ========================================
    // MODAL ELEMENTS
    // ========================================
    get faqModal() {
      return page.locator("#modal").first();
    },

    get faqModalCloseButton() {
      return this.faqModal.getByTestId("modal-close-button");
    },

    get editFaqModal() {
      return page.locator("#modal").first();
    },

    get editFaqModalCloseButton() {
      return this.editFaqModal.getByTestId("modal-close-button");
    },

    get faqModalQuestionInput() {
      return this.faqModal.getByRole("textbox", {
        name: new RegExp(
          getEnglishText("i18n.components.form_faq_entry.question"),
          "i"
        ),
      });
    },

    get faqModalAnswerInput() {
      return this.faqModal.getByRole("textbox", {
        name: new RegExp(
          getEnglishText("i18n.components.form_faq_entry.answer"),
          "i"
        ),
      });
    },

    get faqModalSubmitButton() {
      return this.faqModal.getByRole("button", {
        name: new RegExp(getEnglishText("i18n.components.submit"), "i"),
      });
    },

    // ========================================
    // TAB NAVIGATION ELEMENTS
    // ========================================
    get tabs() {
      return page.getByRole("tablist");
    },

    get aboutTab() {
      return page.getByRole("tab", {
        name: new RegExp(getEnglishText("i18n._global.about"), "i"),
      });
    },

    get eventsTab() {
      return page.getByRole("tab", {
        name: new RegExp(getEnglishText("i18n._global.events"), "i"),
      });
    },

    get resourcesTab() {
      return page.getByRole("tab", {
        name: new RegExp(getEnglishText("i18n._global.resources"), "i"),
      });
    },

    get faqTab() {
      return page.getByRole("tab", {
        name: new RegExp(getEnglishText("i18n._global.faq"), "i"),
      });
    },

    // ========================================
    // ACTIONS - FAQ Interactions
    // ========================================
    async clickNewFaq() {
      await this.newFaqButton.click();
    },

    async clickFaqDisclosure(index: number) {
      await this.getFaqDisclosureButton(index).click();
    },

    async clickFaqEdit(index: number) {
      await this.getFaqEditButton(index).click();
    },

    async getFaqCount() {
      return await this.faqCards.count();
    },

    async isNewFaqButtonVisible() {
      return await this.newFaqButton.isVisible();
    },

    async isFaqTabActive() {
      return (await this.faqTab.getAttribute("aria-selected")) === "true";
    },

    async isEmptyStateVisible() {
      return await this.emptyState.isVisible();
    },

    async hasFaqEntries() {
      const count = await this.getFaqCount();
      return count > 0;
    },

    async getFaqQuestionText(index: number) {
      return await this.getFaqQuestion(index).textContent();
    },

    async getFaqAnswerText(index: number) {
      return await this.getFaqAnswer(index).textContent();
    },

    async isFaqExpanded(index: number) {
      const chevronUp = this.getFaqChevronUp(index);
      return await chevronUp.isVisible();
    },

    async isFaqCollapsed(index: number) {
      const chevronDown = this.getFaqChevronDown(index);
      return await chevronDown.isVisible();
    },

    async expandFaq(index: number) {
      const expandButton = page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-disclosure-button");
      await expandButton.click();
    },

    async collapseFaq(index: number) {
      const collapseButton = page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-disclosure-button");
      await collapseButton.click();
    },

    async editFaq(index: number) {
      const editButton = page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-edit-button");
      await editButton.click();
    },

    // ========================================
    // ACTIONS - Tab Navigation
    // ========================================
    async clickAboutTab() {
      await this.aboutTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/about/);
    },

    async clickEventsTab() {
      await this.eventsTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/events/);
    },

    async clickResourcesTab() {
      await this.resourcesTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/resources/);
    },

    async clickFaqTab() {
      await this.faqTab.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForURL(/.*\/groups\/.*\/faq/);
    },

    // ========================================
    // ACTIONS - Drag & Drop
    // ========================================
    async getFaqDragHandlePosition(index: number) {
      const dragHandle = page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-drag-handle");
      return await dragHandle.boundingBox();
    },

    async dragFaqToPosition(fromIndex: number, toIndex: number) {
      const sourceHandle = this.getFaqDragHandle(fromIndex);
      const targetHandle = this.getFaqDragHandle(toIndex);

      const sourceBox = await sourceHandle.boundingBox();
      const targetBox = await targetHandle.boundingBox();

      if (sourceBox && targetBox) {
        const startX = sourceBox.x + sourceBox.width / 2;
        const startY = sourceBox.y + sourceBox.height / 2;
        const endX = targetBox.x + targetBox.width / 2;
        const endY = targetBox.y + targetBox.height / 2;

        // Hover over the source handle first.
        await page.mouse.move(startX, startY);
        await page.waitForTimeout(200);

        // Start drag operation.
        await page.mouse.down();
        await page.waitForTimeout(300);

        // Move to target with more intermediate steps for smoother drag.
        const steps = 10;
        for (let i = 1; i <= steps; i++) {
          const progress = i / steps;
          const currentX = startX + (endX - startX) * progress;
          const currentY = startY + (endY - startY) * progress;
          await page.mouse.move(currentX, currentY);
          await page.waitForTimeout(100);
        }

        // Hover over target for a moment before releasing.
        await page.mouse.move(endX, endY);
        await page.waitForTimeout(200);

        // Release the mouse.
        await page.mouse.up();
        await page.waitForTimeout(500);
      }
    },
  };
};

export type GroupFaqPage = ReturnType<typeof newGroupFaqPage>;
