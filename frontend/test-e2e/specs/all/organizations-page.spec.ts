// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "playwright/test";

import { runAccessibilityTest } from "~/test-e2e/accessibility/accessibilityTesting";
import { logTestPath, withTestStep } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }, testInfo) => {
  logTestPath(testInfo);
  await withTestStep(testInfo, "Navigate to organizations page", async () => {
    await page.goto("/organizations");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /organizations/i
    );
  });
});

test.describe("Organizations Page", { tag: ["@desktop", "@mobile"] }, () => {
  // Note: Check to make sure that this is eventually done for light and dark modes.
  test(
    "Organizations Page has no detectable accessibility issues",
    { tag: "@accessibility" },
    async ({ page }, testInfo) => {
      const violations = await runAccessibilityTest(
        "Organizations Page",
        page,
        testInfo
      );
      expect
        .soft(violations, "Accessibility violations found:")
        .toHaveLength(0);

      if (violations.length > 0) {
        // Note: For future implementation.
      }
    }
  );
});
