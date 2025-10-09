// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import { newSignInPage } from "~/test-e2e/page-objects/SignInPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth/sign-in");
});

test.describe(
  "Sign In Page - Form Elements",
  { tag: ["@desktop", "@mobile", "@unauth"] },
  () => {
    // Override to run without authentication
    test.use({ storageState: undefined });

    // Explicitly clear all cookies to ensure unauthenticated state
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("User can go to Reset Password page", async ({ page }) => {
      const signInPage = newSignInPage(page);

      await signInPage.forgotPasswordLink.click();
      await page.waitForURL("**/auth/pwreset/email");

      expect(page.url()).toContain("/auth/pwreset/email");
    });

    test("Page displays captcha", async ({ page }) => {
      const signInPage = newSignInPage(page);
      await expect(signInPage.captcha).toBeVisible();
    });
  }
);
