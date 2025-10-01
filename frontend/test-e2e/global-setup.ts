// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, type FullConfig } from "@playwright/test";

import { signInAsAdmin } from "~/test-e2e/actions/authentication";

/**
 * Global setup runs once before all tests
 * This creates an authenticated session that can be reused across tests for speed
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;

  if (!baseURL) {
    throw new Error("baseURL is not configured in playwright.config.ts");
  }

  // eslint-disable-next-line no-console
  console.log("🔐 Setting up authenticated session...");

  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();

  try {
    // Navigate to home and perform authentication
    await page.goto("/");
    await signInAsAdmin(page);

    // Save authentication state to file
    await context.storageState({ path: "test-e2e/.auth/admin.json" });

    // eslint-disable-next-line no-console
    console.log("✅ Authentication state saved to test-e2e/.auth/admin.json");
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("❌ Global setup failed:", error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
