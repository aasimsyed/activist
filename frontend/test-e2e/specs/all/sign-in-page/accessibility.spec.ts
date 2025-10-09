// SPDX-License-Identifier: AGPL-3.0-or-later
import { runAccessibilityTest } from "~/test-e2e/accessibility/accessibilityTesting";
import { expect, test } from "~/test-e2e/global-fixtures";
import { logTestPath, withTestStep } from "~/test-e2e/utils/test-traceability";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth/sign-in");
});

test.describe(
  "Sign In Page - Accessibility",
  { tag: ["@desktop", "@mobile", "@unauth"] },
  () => {
    // Override to run without authentication
    test.use({ storageState: undefined });

    // Explicitly clear all cookies to ensure unauthenticated state
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test(
      "Sign In Page has no detectable accessibility issues",
      { tag: "@accessibility" },
      async ({ page }, testInfo) => {
        logTestPath(testInfo);

        await withTestStep(
          testInfo,
          "Wait for lang attribute to be set",
          async () => {
            await expect(page.locator("html")).toHaveAttribute(
              "lang",
              /^[a-z]{2}(-[A-Z]{2})?$/
            );
          }
        );

        await withTestStep(testInfo, "Run accessibility scan", async () => {
          const violations = await runAccessibilityTest(
            "Sign In Page",
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
      }
    );
  }
);
