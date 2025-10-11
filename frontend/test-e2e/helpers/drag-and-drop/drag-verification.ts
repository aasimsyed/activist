// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/**
 * Drag and drop verification utilities
 */

/**
 * Verifies that two items were successfully reordered (swapped positions)
 * @param page - Playwright page object
 * @param expectedFirstItem - The item that should now be in the first position
 * @param expectedSecondItem - The item that should now be in the second position
 * @param getOrderFunction - Function to get the current order of items
 */
export async function verifyReorder(
  page: Page,
  expectedFirstItem: string,
  expectedSecondItem: string,
  getOrderFunction: (page: Page) => Promise<string[]>
): Promise<void> {
  // Use Playwright's built-in polling mechanism to wait for the order to change.
  // This retries automatically until the condition is met or timeout is reached.
  await page.waitForFunction(
    async ({ expected }) => {
      // This function runs in the browser context repeatedly until it returns true.
      // We need to re-query the DOM each time to get the latest order.

      // MARK: FAQ Card

      const faqCards = document.querySelectorAll('[data-testid="faq-card"]');
      if (faqCards.length >= 2) {
        const firstQuestion = faqCards[0]
          ?.querySelector('[data-testid="faq-question"]')
          ?.textContent?.trim();
        const secondQuestion = faqCards[1]
          ?.querySelector('[data-testid="faq-question"]')
          ?.textContent?.trim();

        if (
          firstQuestion === expected.second &&
          secondQuestion === expected.first
        ) {
          return true;
        }
      }

      // MARK: Resource Card

      const resourceCards = document.querySelectorAll(
        '[data-testid="resource-card"]'
      );
      if (resourceCards.length >= 2) {
        const firstResource = resourceCards[0]
          ?.querySelector("h3")
          ?.textContent?.trim();
        const secondResource = resourceCards[1]
          ?.querySelector("h3")
          ?.textContent?.trim();

        if (
          firstResource === expected.second &&
          secondResource === expected.first
        ) {
          return true;
        }
      }

      return false;
    },
    {
      expected: {
        first: expectedFirstItem,
        second: expectedSecondItem,
      },
    },
    {
      timeout: 15000, // Increased for slower devices (iPad Portrait)
      polling: 100, // poll every 100ms
    }
  );

  // Additional wait for API persistence on slower devices
  await page.waitForTimeout(500);

  // Final verification to provide clear error message if somehow still wrong.
  const finalOrder = await getOrderFunction(page);
  if (
    finalOrder[0] !== expectedSecondItem ||
    finalOrder[1] !== expectedFirstItem
  ) {
    throw new Error(
      `Reorder verification failed. Expected [${expectedSecondItem}, ${expectedFirstItem}], but got [${finalOrder[0]}, ${finalOrder[1]}]`
    );
  }
}
