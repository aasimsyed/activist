// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "playwright/test";

import { newSignInPage } from "~/test-e2e/page-objects/SignInPage";
import { logTestPath, withTestStep } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }, testInfo) => {
  logTestPath(testInfo);
  await withTestStep(testInfo, "Navigate to sign-in page", async () => {
    await page.goto("/auth/sign-in");
  });
});

test.describe("Sign In Page", { tag: "@desktop" }, () => {
  test("User can go to Sign Up page", async ({ page }) => {
    const signInPage = newSignInPage(page);

    await signInPage.signUpLink.click();
    await page.waitForURL("**/auth/sign-up");

    expect(page.url()).toContain("/auth/sign-up");
  });
});
