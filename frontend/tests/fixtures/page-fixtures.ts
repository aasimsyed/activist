import { test as baseTest } from "@playwright/test";
import { LandingPage } from "../page-objects/LandingPage";
import { HomePage } from "../page-objects/HomePage";
import { SignInPage } from "../page-objects/SignInPage";

export const test = baseTest.extend<{
  landingPage: LandingPage;
  homePage: HomePage;
  signInPage: SignInPage;
}>({
  landingPage: async ({ page }, use) => {
    const landingPage = new LandingPage(page);
    await landingPage.navigateTo("/en");
    await landingPage.landingSplash.waitFor({ state: "visible" });
    await use(landingPage);
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  signInPage: async ({ page }, use) => {
    const signInPage = new SignInPage(page);
    await use(signInPage);
  },
});

export { expect } from "@playwright/test";
export { LandingPage, HomePage, SignInPage };
