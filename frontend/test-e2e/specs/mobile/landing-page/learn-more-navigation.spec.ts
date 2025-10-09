// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  ACTIVIST_SECTION_LEARN_MORE_LINK_NAME,
  GET_ACTIVE_LEARN_MORE_LINK_NAME,
  GET_ORGANIZED_LEARN_MORE_LINK_NAME,
  GROW_ORGANIZATION_LEARN_MORE_LINK_NAME,
} from "~/test-e2e/accessibility/accessible-names";
import { expect, test } from "~/test-e2e/global-fixtures";
import { getEnglishText } from "~/utils/i18n";

test.describe(
  "Landing Page - Learn More Navigation",
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

    test("User can go to Learn More page from Get Active learn more link", async ({
      page,
    }) => {
      await page
        .getByRole("link", { name: GET_ACTIVE_LEARN_MORE_LINK_NAME })
        .click();
      await page.waitForURL("**/activist");

      expect(page.url()).toContain("/activist");
    });

    test("User can go to Learn More page from Get Organized learn more link", async ({
      page,
    }) => {
      await page
        .getByRole("link", { name: GET_ORGANIZED_LEARN_MORE_LINK_NAME })
        .click();
      await page.waitForURL("**/activist");

      expect(page.url()).toContain("/activist");
    });

    test("User can go to Learn More page from Grow Organization learn more link", async ({
      page,
    }) => {
      await page
        .getByRole("link", { name: GROW_ORGANIZATION_LEARN_MORE_LINK_NAME })
        .click();
      await page.waitForURL("**/activist");

      expect(page.url()).toContain("/activist");
    });

    test("User can go to Learn More page from activist section learn more link", async ({
      page,
    }) => {
      await page
        .getByRole("link", { name: ACTIVIST_SECTION_LEARN_MORE_LINK_NAME })
        .click();
      await page.waitForURL("**/activist");
      expect(page.url()).toContain("/activist");
    });
  }
);
