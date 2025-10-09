// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  SIGN_IN_LINK_NAME,
  SIGN_UP_LINK_NAME,
} from "~/test-e2e/accessibility/accessible-names";
import { expect, test } from "~/test-e2e/global-fixtures";
import { getEnglishText } from "~/utils/i18n";

test.beforeEach(async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    new RegExp(getEnglishText("i18n.components.landing_splash.header"), "i")
  );
});

test.describe(
  "Landing Page - Auth Navigation",
  { tag: ["@desktop", "@unauth"] },
  () => {
    // Override to run without authentication (landing page for unauthenticated users)
    test.use({ storageState: undefined });

    // Explicitly clear all cookies to ensure unauthenticated state
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("User can go to Sign In page", async ({ page }) => {
      await page.getByRole("link", { name: SIGN_IN_LINK_NAME }).click();
      await page.waitForURL("**/auth/sign-in");

      expect(page.url()).toContain("/auth/sign-in");
    });

    test("User can go to Sign Up page", async ({ page }) => {
      await page.getByRole("link", { name: SIGN_UP_LINK_NAME }).click();
      await page.waitForURL("**/auth/sign-up");
      expect(page.url()).toContain("/auth/sign-up");
    });
  }
);
