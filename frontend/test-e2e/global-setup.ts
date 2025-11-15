// SPDX-License-Identifier: AGPL-3.0-or-later
import { chromium, type FullConfig } from "@playwright/test";

import { signInAsAdmin } from "~/test-e2e/actions/authentication";
import {
  quickServerHealthCheck,
  waitForServerReady,
} from "~/test-e2e/utils/server-readiness";

/**
 * Global setup runs once before all tests
 * This creates an authenticated session that can be reused across tests for speed
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0]?.use.baseURL;

  if (!baseURL) {
    throw new Error("baseURL is not configured in playwright.config.ts");
  }

  const fs = await import("fs");
  const path = await import("path");
  const authFile = path.join(__dirname, ".auth", "admin.json");

  // Check if auth state already exists and tokens are still valid.
  if (fs.existsSync(authFile)) {
    try {
      const authData = JSON.parse(fs.readFileSync(authFile, "utf-8"));
      const cookies = authData.cookies || [];
      const authToken = cookies.find(
        (c: { name: string }) => c.name === "auth.token"
      );

      if (authToken && authToken.value) {
        // Decode JWT to check actual token expiration (not just cookie expiration).
        try {
          const payload = JSON.parse(
            Buffer.from(authToken.value.split(".")[1], "base64").toString()
          );
          const jwtExp = payload.exp * 1000; // convert to milliseconds
          const now = Date.now();
          const timeUntilExpiry = jwtExp - now;
          const minutesUntilExpiry = timeUntilExpiry / 1000 / 60;

          // Only reuse if JWT token has at least 5 minutes left.
          if (minutesUntilExpiry > 5) {
            const stats = fs.statSync(authFile);
            const ageInHours = (now - stats.mtimeMs) / 1000 / 60 / 60;
            const displayAge =
              ageInHours < 1
                ? `${Math.round(ageInHours * 60)}m`
                : `${Math.round(ageInHours)}h`;
            const displayExpiry =
              minutesUntilExpiry < 60
                ? `${Math.round(minutesUntilExpiry)}m`
                : `${Math.round(minutesUntilExpiry / 60)}h`;
            // eslint-disable-next-line no-console
            console.log(
              `✓ Using existing authenticated session (${displayAge} old, expires in ${displayExpiry})`
            );
            return;
          } else {
            // eslint-disable-next-line no-console
            console.log(
              "⚠️  JWT token expired or expiring soon, creating new session..."
            );
          }
        } catch {
          // eslint-disable-next-line no-console
          console.log("⚠️  Failed to decode JWT, creating new session...");
        }
      }
    } catch {
      // eslint-disable-next-line no-console
      console.log("⚠️  Invalid auth file, creating new session...");
    }
  }

  // Wait for server to be fully ready (skip if local and already responding).
  const isCI = process.env.CI === "true";
  const skipWarmup = !isCI && (await quickServerHealthCheck(baseURL));

  if (!skipWarmup) {
    // eslint-disable-next-line no-console
    console.log("⏳ Waiting for server to be ready...");
    await waitForServerReady({
      baseURL,
      maxRetries: 15, // more retries for slow startup
      retryDelay: 3000, // longer delay between retries
      timeout: 15000, // longer timeout per request
    });
  } else {
    // eslint-disable-next-line no-console
    console.log("✓ Server already responding (skipped warm-up check)");
  }

  // eslint-disable-next-line no-console
  console.log("🔐 Setting up authenticated session...");

  const maxAuthRetries = 3;
  let authSuccess = false;
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxAuthRetries; attempt++) {
    const browser = await chromium.launch();
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();

    // Enable request/response logging for debugging
    page.on("request", (request) => {
      // eslint-disable-next-line no-console
      console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
    });

    page.on("response", (response) => {
      // eslint-disable-next-line no-console
      console.log(
        `📥 RESPONSE: ${response.status()} ${response.url()} (${response.statusText()})`
      );
    });

    page.on("requestfailed", (request) => {
      // eslint-disable-next-line no-console
      console.error(`❌ REQUEST FAILED: ${request.method()} ${request.url()}`);
      // eslint-disable-next-line no-console
      console.error(`   Failure: ${request.failure()?.errorText}`);
    });

    // Log console messages
    page.on("console", (msg) => {
      // eslint-disable-next-line no-console
      console.log(`📋 CONSOLE [${msg.type()}]: ${msg.text()}`);
    });

    // Log page errors
    page.on("pageerror", (error) => {
      // eslint-disable-next-line no-console
      console.error(`🚨 PAGE ERROR: ${error.message}`);
    });

    try {
      if (attempt > 1) {
        // eslint-disable-next-line no-console
        console.log(`🔄 Retry attempt ${attempt}/${maxAuthRetries}...`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Navigate to sign-in page directly.
      // eslint-disable-next-line no-console
      console.log(`🔗 Navigating to ${baseURL}/auth/sign-in...`);
      await page.goto("/auth/sign-in", { waitUntil: "load", timeout: 60000 });

      // eslint-disable-next-line no-console
      console.log(`📍 Current URL after navigation: ${page.url()}`);

      // Check what backend URL is configured in the browser
      const backendURL = await page.evaluate(() => {
        // @ts-expect-error - accessing global env vars
        return window.__NUXT__?.config?.public?.runtimeConfig || {};
      });
      // eslint-disable-next-line no-console
      console.log(
        `🔍 Frontend runtime config (backend URL): ${JSON.stringify(backendURL)}`
      );

      // Check environment variables
      const envVars = await page.evaluate(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const win = window as any;
        return {
          VITE_BACKEND_URL: win.__VITE_BACKEND_URL || "not found",
          VITE_API_URL: win.__VITE_API_URL || "not found",
        };
      });
      // eslint-disable-next-line no-console
      console.log(
        `🔍 Environment variables in browser: ${JSON.stringify(envVars)}`
      );

      // eslint-disable-next-line no-console
      console.log("📝 Filling in credentials...");

      // Sign in without navigating again (skipNavigation = true).
      await signInAsAdmin(page, "admin", "admin", true);

      // eslint-disable-next-line no-console
      console.log("✓ Successfully authenticated");

      // Wait for page to be fully ready before saving state.
      await page.waitForLoadState("domcontentloaded", { timeout: 30000 });

      // Save authentication state to file.
      await context.storageState({ path: authFile });

      // eslint-disable-next-line no-console
      console.log("✅ Authentication state saved to test-e2e/.auth/admin.json");

      authSuccess = true;
      await browser.close();
      break;
    } catch (error) {
      lastError = error as Error;

      // Debug: Get current URL and page content
      try {
        const currentURL = page.url();
        // eslint-disable-next-line no-console
        console.error(`📍 Current URL at error: ${currentURL}`);
        const pageTitle = await page.title();
        // eslint-disable-next-line no-console
        console.error(`📄 Page title: ${pageTitle}`);
        const pageText = await page.textContent("body");
        // eslint-disable-next-line no-console
        console.error(
          `📄 Page body preview: ${pageText?.substring(0, 500)}...`
        );

        // Take screenshot for debugging
        await page.screenshot({
          path: `/tmp/auth-failure-attempt-${attempt}.png`,
          fullPage: true,
        });
        // eslint-disable-next-line no-console
        console.error(
          `📸 Screenshot saved to /tmp/auth-failure-attempt-${attempt}.png`
        );
      } catch (debugError) {
        // eslint-disable-next-line no-console
        console.error(`⚠️  Could not capture debug info: ${debugError}`);
      }

      await browser.close();

      if (attempt === maxAuthRetries) {
        // eslint-disable-next-line no-console
        console.error(
          `❌ Global setup failed after ${maxAuthRetries} attempts:`,
          error
        );
      }
    }
  }

  if (!authSuccess) {
    throw lastError || new Error("Authentication failed after retries");
  }
}

export default globalSetup;
