import { SignInPage, expect, test } from "../fixtures/page-fixtures";
import AxeBuilder from "@axe-core/playwright";

test.describe("Sign In Page", () => {
  let signInPage: SignInPage;

  test.beforeEach(async ({ page }) => {
    signInPage = new SignInPage(page);
    await signInPage.navigateTo("/auth/sign-in");
  });

  test("should have no detectable accessibility issues", async ({ signInPage }, testInfo) => {
    const results = await new AxeBuilder({ page: signInPage.getPage() })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    await testInfo.attach("accessibility-scan-results", {
      body: JSON.stringify(results, null, 2),
      contentType: "application/json",
    });

    expect(results.violations).toEqual([]);
  });

  test("should display all necessary elements", async () => {
    await expect(signInPage.usernameInput).toBeVisible();
    await expect(signInPage.passwordInput).toBeVisible();
    await expect(signInPage.visibilityIcon).toBeVisible();
    await expect(signInPage.signInButton).toBeVisible();
    await expect(signInPage.forgotPasswordButton).toBeVisible();
    await expect(signInPage.signUpLink).toBeVisible();
  });

  test("should toggle password visibility", async () => {
    await signInPage.fillPassword("testpassword");

    expect(await signInPage.getPasswordInputType()).toBe("password");

    await signInPage.clickVisibilityIcon();
    expect(await signInPage.getPasswordInputType()).toBe("text");

    await signInPage.clickVisibilityIcon();
    expect(await signInPage.getPasswordInputType()).toBe("password");
  });

  test("should navigate to forgot password page", async () => {
    await signInPage.clickForgotPassword();
    await signInPage.waitForUrlChange("**/auth/reset-password");
    expect(signInPage.url()).toContain("/auth/reset-password");
  });

  test("should navigate to sign up page", async () => {
    await signInPage.clickSignUp();
    await signInPage.waitForUrlChange("**/auth/sign-up");
    expect(signInPage.url()).toContain("/auth/sign-up");
  });

  test("should show password strength indicator", async () => {
    await signInPage.fillPassword("weak");
    expect(await signInPage.isPasswordStrengthIndicatorVisible()).toBe(true);
  });

  test("should show friendly captcha", async () => {
    expect(await signInPage.isFriendlyCaptchaVisible()).toBe(true);
  });

  test("should attempt sign in with valid credentials", async () => {
    await signInPage.signIn("admin", "admin");
    // should be redirected to the home page AND sidebar left should have create button
  });

  test("should show error for invalid credentials", async () => {
    await signInPage.signIn("invaliduser", "invalidpassword");
    // Add assertions for error message or failed sign-in indicator
  });
});
