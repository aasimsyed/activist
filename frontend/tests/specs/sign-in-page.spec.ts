import { SignInPage, expect, test } from "../fixtures/page-fixtures";
import AxeBuilder from "@axe-core/playwright";

test.describe("Sign In Page", () => {

  test.beforeEach(async ({ signInPage }) => {
    test.setTimeout(600000);
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

  test("should display all necessary elements", async ({ signInPage }) => {
    await expect(signInPage.usernameInput).toBeVisible();
    await expect(signInPage.passwordInput).toBeVisible();
    await expect(signInPage.visibilityIcon).toBeVisible();
    await expect(signInPage.signInButton).toBeVisible();
    await expect(signInPage.forgotPasswordButton).toBeVisible();
    await expect(signInPage.signUpLink).toBeVisible();
  });

  test("should toggle password visibility", async ({ signInPage }) => {
    await signInPage.fillPassword("testpassword");

    expect(await signInPage.getPasswordInputType()).toBe("password");

    await signInPage.clickVisibilityIcon();
    expect(await signInPage.getPasswordInputType()).toBe("text");

    await signInPage.clickVisibilityIcon();
    expect(await signInPage.getPasswordInputType()).toBe("password");
  });

  test("should navigate to forgot password page", async ({ signInPage }) => {
    await signInPage.clickForgotPassword();
    await signInPage.waitForUrlChange("**/auth/reset-password");
    expect(signInPage.url()).toContain("/auth/reset-password");
  });

  test("should navigate to sign up page", async ({ signInPage }) => {
    await signInPage.clickSignUp();
    await signInPage.waitForUrlChange("**/auth/sign-up");
    expect(signInPage.url()).toContain("/auth/sign-up");
  });

  test("should show password strength indicator", async ({ signInPage }) => {
    expect(await signInPage.isPasswordStrengthIndicatorVisible()).toBe(true);
  });

  test("should show correct password strength indicators for various passwords", async ({ signInPage }) => {
    const passwordTests = [
      { password: "a", expected: { strength: "Very Weak", color: "#cc0000", progress: "20%" } },
      { password: "Activis", expected: { strength: "Weak", color: "#e69138", progress: "40%" } },
      { password: "Activist4Climat", expected: { strength: "Medium", color: "#f1c232", progress: "60%" } },
      { password: "Activist4ClimateChange", expected: { strength: "Strong", color: "#6aa84f", progress: "80%" } },
      { password: "Activist4ClimateChange!", expected: { strength: "Very Strong", color: "bg-light-text", progress: "100%" } }
    ];

    for (const { password, expected } of passwordTests) {
      await signInPage.fillPassword(password);
      const color = await signInPage.getPasswordStrengthIndicatorColor();
      const strength = await signInPage.getPasswordStrengthText();
      const progress = await signInPage.getPasswordStrengthProgress();
      expect(await signInPage.isPasswordStrengthIndicatorVisible()).toBe(true);
      expect(await signInPage.getPasswordStrengthIndicatorColor()).toBe(expected.color);
      expect((await signInPage.getPasswordStrengthText()).toLowerCase()).toBe(expected.strength.toLowerCase());
      expect(await signInPage.getPasswordStrengthProgress()).toBe(expected.progress);
    }
  });

  test("should show friendly captcha", async ({ signInPage }) => {
    expect(await signInPage.isFriendlyCaptchaVisible()).toBe(true);
  });

  test("should attempt sign in with valid credentials", async ({ signInPage }) => {
    await signInPage.signIn("admin", "admin");
    await signInPage.waitForUrlChange("**/home");
    expect(signInPage.url()).toContain("/home");
    // should be redirected to the home page AND sidebar left should have create button
  });

  test("should show error for invalid credentials", async ({ signInPage }) => {
    const dialogPromise = signInPage.waitForEvent('dialog');
    await signInPage.signIn("invaliduser", "invalidpassword");

    const dialog = await dialogPromise;
    expect(dialog.message()).toContain("Invalid login credentials");

    await dialog.dismiss();
    expect(signInPage.url()).toContain("/auth/sign-in");
  });
});
