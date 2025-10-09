// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getFAQCardSelectors } from "../selectors/faq-card-selectors";

/**
 * Actions for FAQ drag and drop operations
 */
export function createFAQDragDropActions(page: Page) {
  const cardSelectors = getFAQCardSelectors(page);

  return {
    async getFaqDragHandlePosition(index: number) {
      const dragHandle = page
        .getByTestId("faq-card")
        .nth(index)
        .getByTestId("faq-drag-handle");
      return await dragHandle.boundingBox();
    },

    async dragFaqToPosition(fromIndex: number, toIndex: number) {
      const sourceHandle = cardSelectors.getFaqDragHandle(fromIndex);
      const targetHandle = cardSelectors.getFaqDragHandle(toIndex);

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
}
