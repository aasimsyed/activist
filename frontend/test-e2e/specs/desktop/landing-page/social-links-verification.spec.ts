// SPDX-License-Identifier: AGPL-3.0-or-later
import { expect, test } from "~/test-e2e/global-fixtures";
import { getEnglishText } from "~/utils/i18n";

test.beforeEach(async ({ page }) => {
  await page.goto("/en");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    new RegExp(getEnglishText("i18n.components.landing_splash.header"), "i")
  );
});

test.describe(
  "Landing Page - Social Links Verification",
  { tag: ["@desktop", "@unauth"] },
  () => {
    // Override to run without authentication (landing page for unauthenticated users)
    test.use({ storageState: undefined });

    // Explicitly clear all cookies to ensure unauthenticated state
    test.beforeEach(async ({ context }) => {
      await context.clearCookies();
    });

    // Socials banner, open-source section and footer twice in source code and community section.
    test("There are four links to the activist GitHub on the landing page", async ({
      page,
    }) => {
      const landingPageLinks = page
        .getByRole("link", { name: /.*/ })
        .filter({ hasText: /.*/ });

      const GitHubLinkCount = await landingPageLinks.evaluateAll(
        (links) =>
          links.filter(
            (link) =>
              (link as HTMLAnchorElement).href ===
              "https://github.com/activist-org/activist"
          ).length
      );

      expect(GitHubLinkCount).toBe(4);
    });

    // Socials banner and footer.
    test("There are two links to the activist public Matrix community on the landing page", async ({
      page,
    }) => {
      const landingPageLinks = page
        .getByRole("link", { name: /.*/ })
        .filter({ hasText: /.*/ });

      const MatrixLinkCount = await landingPageLinks.evaluateAll(
        (links) =>
          links.filter((link) =>
            (link as HTMLAnchorElement).href.includes(
              "https://matrix.to/#/#activist_community:matrix.org"
            )
          ).length
      );

      expect(MatrixLinkCount).toBe(2);
    });

    // Socials banner and footer.
    test("There are two links to the activist Instagram on the landing page", async ({
      page,
    }) => {
      const landingPageLinks = page
        .getByRole("link", { name: /.*/ })
        .filter({ hasText: /.*/ });

      const InstagramLinkCount = await landingPageLinks.evaluateAll(
        (links) =>
          links.filter((link) =>
            (link as HTMLAnchorElement).href.includes(
              "https://instagram.com/activist_org"
            )
          ).length
      );
      expect(InstagramLinkCount).toBe(2);
    });
  }
);
