// SPDX-License-Identifier: AGPL-3.0-or-later
import {
  ACTIVIST_SECTION_LEARN_MORE_LINK_NAME,
  GET_ACTIVE_LEARN_MORE_LINK_NAME,
  GET_ORGANIZED_LEARN_MORE_LINK_NAME,
  GROW_ORGANIZATION_LEARN_MORE_LINK_NAME,
  ROADMAP_LINK_NAME,
} from "~/test-e2e/accessibility/accessible-names";
import { expect, test } from "~/test-e2e/global-fixtures";
import { getEnglishText } from "~/utils/i18n";

test.beforeEach(async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    new RegExp(getEnglishText("i18n.components.landing_splash.header"), "i")
  );
});

test.describe(
  "Landing Page - Learn More Navigation",
  { tag: ["@desktop", "@unauth"] },
  () => {
    // Override to run without authentication (landing page for unauthenticated users)
    test.use({ storageState: undefined });

    // Explicitly clear all cookies to ensure unauthenticated state
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    test("User can go to Roadmap on desktop", async ({ page }) => {
      await page.getByRole("link", { name: ROADMAP_LINK_NAME }).click();
      await page.waitForURL("**/about/roadmap");

      expect(page.url()).toContain("/about/roadmap");
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
