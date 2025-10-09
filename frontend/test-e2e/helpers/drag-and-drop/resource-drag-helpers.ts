// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

/**
 * Resource-specific drag and drop helpers
 */

/**
 * Gets the current order of resource cards by extracting their names/titles
 * This can be used to verify that drag and drop reordering worked correctly
 * @param page - Playwright page object
 * @returns Array of resource names in their current order
 */
export async function getResourceCardOrder(page: Page): Promise<string[]> {
  // Wait for resources to be loaded.
  await page.waitForSelector('[data-testid="resource-card"]');

  // Get all resource cards.
  const resourceCards = page.getByTestId("resource-card");
  const count = await resourceCards.count();

  const resourceNames: string[] = [];

  // Extract the name/title from each resource card.
  for (let i = 0; i < count; i++) {
    const card = resourceCards.nth(i);
    // The resource name is in an h3 element within the card.
    const nameElement = card.getByRole("heading", { level: 3 }).first();
    const name = await nameElement.textContent();
    if (name) {
      resourceNames.push(name.trim());
    }
  }
  return resourceNames;
}
