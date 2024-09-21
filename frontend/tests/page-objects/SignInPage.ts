import { PageObjectBase } from "../utils/PageObjectBase";
import type { Page, Locator } from "@playwright/test";

const locators = {
  USERNAME_INPUT: "#sign-in-username input",
  PASSWORD_INPUT: "#sign-in-password input",
  VISIBILITY_ICON: "#sign-in-password span[role='button']",
  SIGN_IN_BUTTON: "#sign-in-submit",
  FORGOT_PASSWORD_BUTTON: "#sign-in-forgot-password",
  SIGN_UP_LINK: "#sign-in-signup-link",
  PASSWORD_STRENGTH_INDICATOR: "#sign-in-password-strength",
  FRIENDLY_CAPTCHA: "#sign-in-captcha",
};

export class SignInPage extends PageObjectBase {
  constructor(page: Page) {
    super(page, locators, "Sign In", "/auth/sign-in");
  }

  get usernameInput(): Locator {
    return this.getLocator("USERNAME_INPUT");
  }

  get passwordInput(): Locator {
    return this.getLocator("PASSWORD_INPUT");
  }

  get visibilityIcon(): Locator {
    return this.getLocator("VISIBILITY_ICON");
  }

  get signInButton(): Locator {
    return this.getLocator("SIGN_IN_BUTTON");
  }

  get forgotPasswordButton(): Locator {
    return this.getLocator("FORGOT_PASSWORD_BUTTON");
  }

  get signUpLink(): Locator {
    return this.getLocator("SIGN_UP_LINK");
  }

  get passwordStrengthIndicator(): Locator {
    return this.getLocator("PASSWORD_STRENGTH_INDICATOR");
  }

  get friendlyCaptcha(): Locator {
    return this.getLocator("FRIENDLY_CAPTCHA");
  }

  async fillUsername(username: string): Promise<void> {
    await this.page.fill(this.locators.USERNAME_INPUT, username);
  }

  async fillPassword(password: string): Promise<void> {
    await this.page.fill(this.locators.PASSWORD_INPUT, password);
  }

  async getPasswordInputType(): Promise<string> {
    const passwordInput = this.page.locator(this.locators.PASSWORD_INPUT);
    return await passwordInput.getAttribute('type') || '';
  }

  async clickVisibilityIcon(): Promise<void> {
    await this.page.click(this.locators.VISIBILITY_ICON);
  }

  async clickSignIn(): Promise<void> {
    await this.page.click(this.locators.SIGN_IN_BUTTON);
  }

  async clickForgotPassword(): Promise<void> {
    await this.page.click(this.locators.FORGOT_PASSWORD_BUTTON);
  }

  async clickSignUp(): Promise<void> {
    await this.page.click(this.locators.SIGN_UP_LINK);
  }

  async isPasswordStrengthIndicatorVisible(): Promise<boolean> {
    return await this.page.isVisible(this.locators.PASSWORD_STRENGTH_INDICATOR);
  }

  async isFriendlyCaptchaVisible(): Promise<boolean> {
    return await this.page.isVisible(this.locators.FRIENDLY_CAPTCHA);
  }

  async signIn(username: string, password: string): Promise<void> {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickSignIn();
  }

  // Mobile-specific methods
  async isMobileView(): Promise<boolean> {
    return await this.isMobile();
  }

  // Desktop-specific methods
  async isDesktopView(): Promise<boolean> {
    return !(await this.isMobile());
  }

  // Responsive design checks
  async checkResponsiveLayout(): Promise<void> {
    const isMobile = await this.isMobileView();
    if (isMobile) {
      // Add mobile-specific layout checks here
      // For example, check if certain elements are stacked vertically
    } else {
      // Add desktop-specific layout checks here
      // For example, check if certain elements are side by side
    }
  }
}
