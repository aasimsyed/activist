// SPDX-License-Identifier: AGPL-3.0-or-later
import { newSidebarRight } from "~/test-e2e/component-objects/SidebarRight";
import { newSignInMenu } from "~/test-e2e/component-objects/SignInMenu";
import { expect, test } from "~/test-e2e/global-fixtures";
import { getEnglishText } from "~/utils/i18n";

test.describe(
  "Landing Page - Auth Navigation",
  { tag: ["@mobile", "@unauth"] },
  () => {
    // Override to run without authentication (landing page for unauthenticated users)
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page, context }) => {
      // Clear all cookies and local storage to ensure completely unauthenticated state
      await context.clearCookies();
      await page.goto("/en");
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });

      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        new RegExp(getEnglishText("i18n.components.landing_splash.header"), "i")
      );
    });

    test("User can go to Sign In page", async ({ page }) => {
      const sidebar = newSidebarRight(page);
      await sidebar.openButton.click();

      const signInMenu = newSignInMenu(page);
      await signInMenu.toggleOpenButton.click();
      await signInMenu.signInOption.click();

      await page.waitForURL("**/auth/sign-in");
      expect(page.url()).toContain("/auth/sign-in");
    });

    test("User can go to Sign Up page", async ({ page }) => {
      const sidebar = newSidebarRight(page);
      await sidebar.openButton.click();

      const signInMenu = newSignInMenu(page);
      await signInMenu.toggleOpenButton.click();
      await signInMenu.signUpOption.click();
      await page.waitForURL("**/auth/sign-up");
      expect(page.url()).toContain("/auth/sign-up");
    });
  }
);
