// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Locator, Page } from "@playwright/test";

import { expect } from "~/test-e2e/global-fixtures";

export const loadSecondPage = async (
  page: Page,
  cards: Locator
): Promise<void> => {
  await expect(cards.first()).toBeVisible();
  await expect
    .poll(
      async () => {
        try {
          await cards.last().scrollIntoViewIfNeeded({ timeout: 2000 });
        } catch {}
        await page.evaluate(() => {
          const container = document.querySelector(
            "[class*='overflow-y-scroll']"
          ) as HTMLElement | null;
          if (container) container.scrollTo(0, container.scrollHeight);
        });
        return cards.count();
      },
      { timeout: 30000, intervals: [300, 700, 1000, 1500, 2000] }
    )
    .toBeGreaterThan(10);
};

export const expectFilteredResults = async (
  page: Page,
  cards: Locator,
  filterPattern: RegExp
): Promise<void> => {
  await expect
    .poll(
      async () => {
        const texts = await cards.allTextContents();
        return texts.every((text) => filterPattern.test(text));
      },
      { timeout: 10000 }
    )
    .toBe(true);
  await page.waitForTimeout(1000);
  const texts = await cards.allTextContents();
  expect(texts.every((text) => filterPattern.test(text))).toBe(true);
  expect(new Set(texts).size).toBe(texts.length);
};
