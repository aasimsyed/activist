// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Locator, Page } from "@playwright/test";

/**
 * Core drag and drop operations
 */

/**
 * Performs a drag and drop operation from source to target using mouse events
 * This uses intermediate steps for smooth dragging to ensure vuedraggable detects the operation
 * @param page - Playwright page object
 * @param sourceLocator - The locator for the element to drag (typically a drag handle)
 * @param targetLocator - The locator for the target position (typically another drag handle)
 * @param steps - Number of intermediate steps for the drag motion (default: 10)
 */
export async function performDragAndDrop(
  page: Page,
  sourceLocator: Locator,
  targetLocator: Locator,
  steps = 10
): Promise<void> {
  // Get bounding boxes for source and target.
  const sourceBox = await sourceLocator.boundingBox();
  const targetBox = await targetLocator.boundingBox();

  if (!sourceBox || !targetBox) {
    throw new Error("Could not get bounding boxes for drag and drop elements");
  }

  // Calculate center points.
  const startX = sourceBox.x + sourceBox.width / 2;
  const startY = sourceBox.y + sourceBox.height / 2;
  const endX = targetBox.x + targetBox.width / 2;
  const endY = targetBox.y + targetBox.height / 2;

  // Move to start position.
  await page.mouse.move(startX, startY);

  // Press mouse button.
  await page.mouse.down();

  // Wait for drag start to be detected by observing CSS class change.
  await page
    .waitForFunction(
      () => {
        const dragElements = document.querySelectorAll(
          ".sortable-chosen, .sortable-drag"
        );
        return dragElements.length > 0;
      },
      { timeout: 5000 }
    )
    .catch(() => {
      // If no sortable classes appear, continue anyway (might work without them).
    });

  // Move to target with intermediate steps for smooth drag.
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    const currentX = startX + (endX - startX) * progress;
    const currentY = startY + (endY - startY) * progress;
    await page.mouse.move(currentX, currentY);
  }

  // Release mouse button.
  await page.mouse.up();
  // Wait for animation to complete by checking if ghost/chosen classes are removed.
  await page
    .waitForFunction(
      () => {
        const dragElements = document.querySelectorAll(
          ".sortable-chosen, .sortable-drag, .sortable-ghost"
        );
        return dragElements.length === 0;
      },
      { timeout: 2000 }
    )
    .catch(() => {
      // If classes don't clear, continue anyway (might have completed).
    });
}
