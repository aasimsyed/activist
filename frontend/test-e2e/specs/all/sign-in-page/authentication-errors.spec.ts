// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import { newSignInPage } from "~/test-e2e/page-objects/SignInPage";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth/sign-in");
});

test.describe(
  "Sign In Page - Authentication Errors",
  { tag: ["@desktop", "@mobile", "@unauth"] },
  () => {
    // Override to run without authentication
    test.use({ storageState: undefined });

    // Explicitly clear all cookies to ensure unauthenticated state
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("Page shows error for invalid credentials", async ({ page }) => {
      const signInPage = newSignInPage(page);

      await signInPage.usernameInput.fill("invaliduser");
      await signInPage.passwordInput.fill("invaliduser");

      // Click CAPTCHA if present
      const { captcha } = signInPage;
      if (await captcha.isVisible()) {
        await captcha.click();
      }

      await signInPage.signInButton.click();

      // Wait for error toast to appear
      const errorToast = page.locator('[data-sonner-toast][data-type="error"]');
      await expect(errorToast).toBeVisible();

      // Verify error message content
      await expect(errorToast).toContainText(/invalid username or password/i);
      // Verify we stay on sign-in page
      expect(page.url()).toContain("/auth/sign-in");
    });
  }
);
