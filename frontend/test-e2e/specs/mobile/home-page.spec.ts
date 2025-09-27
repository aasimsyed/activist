// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "playwright/test";

import { newInfoMenu } from "~/test-e2e/component-objects/InfoMenu";
import { newMainNavOptions } from "~/test-e2e/component-objects/MainNavOptions";
import { newSearchbar } from "~/test-e2e/component-objects/Searchbar";
import { newSidebarRight } from "~/test-e2e/component-objects/SidebarRight";
import { newSignInMenu } from "~/test-e2e/component-objects/SignInMenu";
import { logTestPath, withTestStep } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }, testInfo) => {
  logTestPath(testInfo);
  await withTestStep(testInfo, "Navigate to home page", async () => {
    await page.goto("/home");
  });
});

test.describe("Home Page", { tag: "@mobile" }, () => {
  test("User can open searchbar", async ({ page }, testInfo) => {
    logTestPath(testInfo);
    const searchbar = newSearchbar(page);

    await withTestStep(testInfo, "Open searchbar", async () => {
      await searchbar.openToggle.click();
      await expect(searchbar.input).toHaveAttribute("placeholder", /search/i);
    });

    await withTestStep(testInfo, "Close searchbar", async () => {
      await searchbar.openToggle.click();
      await expect(searchbar.input).not.toBeVisible();
    });
  });

  test("Navigation main options: Home, Events, and Organizations", async ({
    page,
  }, testInfo) => {
    logTestPath(testInfo);
    const { homeLink, eventsLink, organizationsLink } = newMainNavOptions(page);

    const links = [
      { link: eventsLink, path: "/events" },
      { link: organizationsLink, path: "/organizations" },
      { link: homeLink, path: "/home" },
    ];

    for (const { link, path } of links) {
      await withTestStep(testInfo, `Navigate to ${path}`, async () => {
        await link.click();
        await page.waitForURL(`**${path}`);
        expect(page.url()).toContain(path);
      });

      await withTestStep(testInfo, "Return to home page", async () => {
        await page.goto("/home");
      });
    }
  });

  test("Navigation submenus: Info and Join activist", async ({ page }) => {
    const sidebarRight = newSidebarRight(page);
    const infoMenu = newInfoMenu(page);
    const signInMenu = newSignInMenu(page);
    const submenus = [
      {
        submenu: infoMenu,
        options: [
          { link: infoMenu.helpOption, path: "/help" },
          { link: infoMenu.documentationOption, path: "/docs" },
          { link: infoMenu.legalOption, path: "/legal" },
        ],
      },
      {
        submenu: signInMenu,
        options: [
          { link: signInMenu.signInOption, path: "/auth/sign-in" },
          { link: signInMenu.signUpOption, path: "/auth/sign-up" },
        ],
      },
    ];

    for (const { submenu, options } of submenus) {
      for (const { link, path } of options) {
        await sidebarRight.openButton.click();
        await submenu.toggleOpenButton.click();
        await link.click();

        await page.waitForURL(`**${path}`);
        expect(page.url()).toContain(path);

        await page.goto("/home");
      }
    }
  });
});
