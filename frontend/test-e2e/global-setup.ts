// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, type FullConfig } from "@playwright/test";

import { signInAsAdmin } from "~/test-e2e/actions/authentication";

/**
 * Global setup runs once before all tests
 * This creates an authenticated session that can be reused across tests for speed
 * Note: This runs even for unauthenticated projects, but they don't use the storageState
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL;

  if (!baseURL) {
    throw new Error("baseURL is not configured in playwright.config.ts");
  }

  const fs = await import("fs");
  const authFile = "test-e2e/.auth/admin.json";

  // Check if auth state already exists and is recent (less than 24 hours old)
  if (fs.existsSync(authFile)) {
    const stats = fs.statSync(authFile);
    const ageInHours = (Date.now() - stats.mtimeMs) / 1000 / 60 / 60;

    if (ageInHours < 24) {
      const displayAge =
        ageInHours < 1
          ? `${Math.round(ageInHours * 60)}m`
          : `${Math.round(ageInHours)}h`;
      // eslint-disable-next-line no-console
      console.log(`✓ Using existing authenticated session (${displayAge} old)`);
      return;
    }
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
    await context.storageState({ path: authFile });

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
