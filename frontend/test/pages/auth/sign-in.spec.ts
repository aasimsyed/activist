// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * NOTE: Sign-in functionality is tested in Playwright e2e tests.
 * See: frontend/test-e2e/specs/all/authentication/sign-in/
 *
 * Unit tests were disabled because authentication is handled by @sidebase/nuxt-auth
 * which requires a full browser environment. The authentication flow is comprehensively
 * tested in Playwright tests which can properly test the full sign-in flow including
 * cookie handling, navigation, and token management.
 */
import { describe } from "vitest";

describe.skip("sign-in", () => {
  // All tests moved to Playwright e2e tests
  // See: frontend/test-e2e/specs/all/authentication/sign-in/
});
