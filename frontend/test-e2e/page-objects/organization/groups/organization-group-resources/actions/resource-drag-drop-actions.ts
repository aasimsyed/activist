// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getResourceCardSelectors } from "../selectors/resource-card-selectors";

/**
 * Actions for resource drag and drop operations
 */
export function createResourceDragDropActions(page: Page) {
  const cardSelectors = getResourceCardSelectors(page);

  return {
    async dragResourceToPosition(fromIndex: number, toIndex: number) {
      const sourceHandle = cardSelectors.getResourceDragHandle(fromIndex);
      const targetHandle = cardSelectors.getResourceDragHandle(toIndex);

      const sourceBox = await sourceHandle.boundingBox();
      const targetBox = await targetHandle.boundingBox();

      if (sourceBox && targetBox) {
        const startX = sourceBox.x + sourceBox.width / 2;
        const startY = sourceBox.y + sourceBox.height / 2;
        const endX = targetBox.x + targetBox.width / 2;
        const endY = targetBox.y + targetBox.height / 2;

        // Simulate drag with mouse events.
        await page.mouse.move(startX, startY);
        await page.mouse.down();
        await page.waitForTimeout(100);

        // Move to target with intermediate steps.
        const steps = 5;
        for (let i = 1; i <= steps; i++) {
          const progress = i / steps;
          const currentX = startX + (endX - startX) * progress;
          const currentY = startY + (endY - startY) * progress;
          await page.mouse.move(currentX, currentY);
          await page.waitForTimeout(50);
        }

        await page.mouse.up();
        await page.waitForTimeout(200);
      }
    },
  };
}
