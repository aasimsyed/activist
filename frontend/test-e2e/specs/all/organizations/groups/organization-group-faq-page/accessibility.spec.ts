// SPDX-License-Identifier: AGPL-3.0-or-later
import { runAccessibilityTest } from "~/test-e2e/accessibility/accessibilityTesting";
import { expect, test } from "~/test-e2e/global-fixtures";
import { navigateToOrganizationGroupSubpage } from "~/test-e2e/helpers/navigation";
import { logTestPath, withTestStep } from "~/test-e2e/utils/test-traceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToOrganizationGroupSubpage(page, "faq");
});

test.describe(
  "Organization Group FAQ Page - Accessibility",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("Organization Group FAQ Page has no detectable accessibility issues", async ({
      page,
    }, testInfo) => {
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
          "Organization Group FAQ Page",
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
