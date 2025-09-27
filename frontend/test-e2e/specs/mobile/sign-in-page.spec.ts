// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "playwright/test";

import { newSidebarRight } from "~/test-e2e/component-objects/SidebarRight";
import { newSignInMenu } from "~/test-e2e/component-objects/SignInMenu";
import { logTestPath, withTestStep } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }, testInfo) => {
  logTestPath(testInfo);
  await withTestStep(testInfo, "Navigate to sign-in page", async () => {
    await page.goto("/auth/sign-in");
  });
});

test.describe("Sign In Page", { tag: "@mobile" }, () => {
  test("User can go to Sign Up page", async ({ page }) => {
    const sidebarRight = newSidebarRight(page);
    const signInMenu = newSignInMenu(page);

    await sidebarRight.openButton.click();
    await signInMenu.toggleOpenButton.click();
    await signInMenu.signUpOption.click();
    await page.waitForURL("**/auth/sign-up");

    expect(page.url()).toContain("/auth/sign-up");
  });
});
