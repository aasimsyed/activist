// SPDX-License-Identifier: AGPL-3.0-or-later
import { runAccessibilityTest } from "~/test-e2e/accessibility/accessibilityTesting";
import { navigateToFirstOrganization } from "~/test-e2e/actions/navigation";
import { expect, test } from "~/test-e2e/global-fixtures";
import { logTestPath, withTestStep } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToFirstOrganization(page);

  // Wait for auth state to be fully loaded.
  await page.waitForLoadState("domcontentloaded");

  // Give Nuxt Auth time to hydrate session from cookies.
  await page.waitForTimeout(1000);
});

test.describe(
  "Organization About Page - Accessibility",
  { tag: ["@desktop", "@mobile"] },
  () => {
    // Increase test timeout for slow dev mode loading.
    test.setTimeout(60000);
    // Note: Check to make sure that this is eventually done for light and dark modes.
    test("Organization About Page has no detectable accessibility issues", async ({
      page,
    }, testInfo) => {
      logTestPath(testInfo);

      await withTestStep(testInfo, "Run accessibility scan", async () => {
        const violations = await runAccessibilityTest(
          "Organization About Page",
          page,
          testInfo
        );
        expect
          .soft(violations, "Accessibility violations found:")
          .toHaveLength(0);
        if (violations.length > 0) {
          // Note: For future implementation.
        }
      });
    });
  }
);
