// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/**
 * FAQ-specific drag and drop helpers
 */

/**
 * Gets the current order of FAQ cards by extracting their questions
 * This can be used to verify that drag and drop reordering worked correctly
 * @param page - Playwright page object
 * @returns Array of FAQ questions in their current order
 */
export async function getFAQCardOrder(page: Page): Promise<string[]> {
  // Wait for FAQ cards to be loaded.
  await page.waitForSelector('[data-testid="faq-card"]');

  const faqCards = page.getByTestId("faq-card");
  const count = await faqCards.count();

  const faqQuestions: string[] = [];

  // Extract the question from each FAQ card.
  for (let i = 0; i < count; i++) {
    const card = faqCards.nth(i);
    const questionElement = card.getByTestId("faq-question");
    const question = await questionElement.textContent();
    if (question) {
      faqQuestions.push(question.trim());
    }
  }
  return faqQuestions;
}
