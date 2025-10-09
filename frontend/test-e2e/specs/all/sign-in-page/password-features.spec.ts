// SPDX-License-Identifier: AGPL-3.0-or-later
import { newPasswordStrength } from "~/test-e2e/component-objects/PasswordStrength";
import { expect, test } from "~/test-e2e/global-fixtures";
import { newSignInPage } from "~/test-e2e/page-objects/SignInPage";
import {
  PASSWORD_PROGRESS as PROGRESS,
  PASSWORD_RATING as RATING,
  PASSWORD_STRENGTH_COLOR as COLOR,
} from "~/test-utils/constants";

test.beforeEach(async ({ page }) => {
  await page.goto("/auth/sign-in");
});

test.describe(
  "Sign In Page - Password Features",
  { tag: ["@desktop", "@mobile", "@unauth"] },
  () => {
    // Override to run without authentication
    test.use({ storageState: undefined });

    // Explicitly clear all cookies to ensure unauthenticated state
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("User can show and hide password", async ({ page }) => {
      const signInPage = newSignInPage(page);
      const { passwordInput } = signInPage;

      // Wait for the page to load completely
      await page.waitForLoadState("domcontentloaded");

      // Wait for the password input to be visible
      await expect(passwordInput).toBeVisible({ timeout: 10000 });

      await passwordInput.fill("testpassword");
      await expect(passwordInput).toHaveAttribute("type", "password");

      // Wait for the show password toggle to be visible
      await expect(signInPage.showPasswordToggle).toBeVisible({
        timeout: 10000,
      });

      await signInPage.showPasswordToggle.click();
      await expect(passwordInput).toHaveAttribute("type", "text");

      await signInPage.showPasswordToggle.click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    });

    test("Page shows user password strength rating", async ({ page }) => {
      const signInPage = newSignInPage(page);
      const passwordStrength = newPasswordStrength(page);

      const passwords: {
        password: string;
        expected: {
          text: string;
          color: RegExp | "";
          progress: RegExp;
        };
      }[] = [
        {
          password: "a",
          expected: {
            text: RATING.VERY_WEAK,
            color: COLOR.RED ?? "",
            progress: PROGRESS.P20,
          },
        },
        {
          password: "Activis",
          expected: {
            text: RATING.WEAK,
            color: COLOR.ORANGE ?? "",
            progress: PROGRESS.P40,
          },
        },
        {
          password: "Activist4Climat",
          expected: {
            text: RATING.MEDIUM,
            color: COLOR.YELLOW ?? "",
            progress: PROGRESS.P60,
          },
        },
        {
          password: "Activist4ClimateChange",
          expected: {
            text: RATING.STRONG,
            color: COLOR.GREEN ?? "",
            progress: PROGRESS.P80,
          },
        },
        {
          password: "Activist4ClimateChange!",
          expected: {
            text: RATING.VERY_STRONG,
            color: COLOR.PRIMARY_TEXT ?? "",
            progress: PROGRESS.P100,
          },
        },
        {
          password: "",
          expected: {
            text: RATING.INVALID,
            color: COLOR.NONE ?? "",
            progress: PROGRESS.P20,
          },
        },
      ];

      for (const { password, expected } of passwords) {
        await signInPage.passwordInput.fill(password);
        await expect(passwordStrength.text).toContainText(expected.text);
        await passwordStrength.expectProgress(expected.progress);
        await passwordStrength.expectColor(expected.color);
      }
    });
  }
);
