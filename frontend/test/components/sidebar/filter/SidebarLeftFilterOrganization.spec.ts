// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Unit tests for SidebarLeftFilterOrganization.vue route query sync behavior.
 * Verifies fix for issue #1738: Query params should not persist across routes.
 *
 * Tests the useRouteQuerySync composable pattern which uses route.name matching
 * for robustness with i18n locale prefixes.
 *
 * @see https://github.com/activist-org/activist/issues/1738
 */
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick, reactive, watch } from "vue";

describe("SidebarLeftFilterOrganization Route Query Sync", () => {
  /**
   * These tests verify the route-scoped watcher logic that prevents stale query params
   * from persisting when navigating between routes.
   *
   * The component uses useRouteQuerySync("organizations") which matches:
   * - route.name === "organizations" (exact match)
   * - route.name.startsWith("organizations___") (i18n variants like "organizations___en")
   *
   * It does NOT match:
   * - "organizations-orgId" (subpages)
   * - "events" (other routes)
   */

  let mockRoute: { name: string; query: Record<string, unknown> };
  let formData: { value: Record<string, unknown> };

  /**
   * Simulates useRouteQuerySync("organizations") behavior
   */
  const isOrganizationsRoute = (routeName: string): boolean => {
    return (
      routeName === "organizations" || routeName.startsWith("organizations___")
    );
  };

  const setupWatcher = () => {
    watch(
      () => mockRoute,
      (newRoute) => {
        if (!isOrganizationsRoute(newRoute.name)) {
          return;
        }
        formData.value = { ...newRoute.query };
      },
      { immediate: true, deep: true }
    );
  };

  beforeEach(() => {
    mockRoute = reactive({ name: "organizations", query: {} });
    formData = reactive({ value: {} });
  });

  describe("Route Name-based Query Sync", () => {
    it("syncs query params when on organizations route", async () => {
      mockRoute.name = "organizations";
      mockRoute.query = { topics: "ENVIRONMENT", location: "Berlin" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({
        topics: "ENVIRONMENT",
        location: "Berlin",
      });
    });

    it("syncs query params when on i18n organizations route (organizations___en)", async () => {
      mockRoute.name = "organizations___en";
      mockRoute.query = { topics: "ENVIRONMENT", location: "Paris" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({
        topics: "ENVIRONMENT",
        location: "Paris",
      });
    });

    it("syncs query params when on i18n organizations route (organizations___de)", async () => {
      mockRoute.name = "organizations___de";
      mockRoute.query = { topics: "CLIMATE" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({ topics: "CLIMATE" });
    });

    it("does NOT sync when on events route", async () => {
      mockRoute.name = "events";
      mockRoute.query = { topics: "ENVIRONMENT", view: "map" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({});
    });

    it("does NOT sync when on events i18n route", async () => {
      mockRoute.name = "events___en";
      mockRoute.query = { topics: "ENVIRONMENT" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({});
    });

    it("does NOT sync when on home route", async () => {
      mockRoute.name = "home";
      mockRoute.query = { someParam: "value" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({});
    });

    it("does NOT sync when route name is empty", async () => {
      mockRoute.name = "";
      mockRoute.query = { topics: "ENVIRONMENT" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({});
    });

    it("does NOT sync for organization detail subpages (organizations-orgId)", async () => {
      mockRoute.name = "organizations-orgId";
      mockRoute.query = { topics: "ENVIRONMENT" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({});
    });

    it("does NOT sync for i18n org detail subpages (organizations-orgId___en)", async () => {
      mockRoute.name = "organizations-orgId___en";
      mockRoute.query = { topics: "ENVIRONMENT" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({});
    });
  });

  describe("Issue #1738 Scenarios", () => {
    it("prevents events query from syncing to organizations filter", async () => {
      // Core bug: User filters on /events, navigates to /organizations
      // The /organizations filter should NOT pick up /events params
      mockRoute.name = "events";
      mockRoute.query = { topics: "EDUCATION", view: "map", days: "7" };
      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({});
      expect(formData.value).not.toHaveProperty("topics");
      expect(formData.value).not.toHaveProperty("view");
    });

    it("syncs when navigating TO organizations route", async () => {
      mockRoute.name = "events";
      mockRoute.query = { topics: "OLD" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({});

      mockRoute.name = "organizations";
      mockRoute.query = { topics: "NEW", location: "Paris" };
      await nextTick();
      expect(formData.value).toEqual({ topics: "NEW", location: "Paris" });
    });

    it("does NOT update formData when navigating AWAY from organizations", async () => {
      mockRoute.name = "organizations";
      mockRoute.query = { topics: "ENVIRONMENT" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({ topics: "ENVIRONMENT" });

      mockRoute.name = "events";
      mockRoute.query = { topics: "DIFFERENT", view: "list" };
      await nextTick();
      // Should keep old value, not sync new route's query
      expect(formData.value).toEqual({ topics: "ENVIRONMENT" });
    });

    it("handles multi-hop navigation correctly", async () => {
      setupWatcher();

      // Start on events
      mockRoute.name = "events";
      mockRoute.query = { topics: "EVENTS_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({});

      // Go to organizations
      mockRoute.name = "organizations";
      mockRoute.query = { topics: "ORG_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({ topics: "ORG_TOPIC" });

      // Back to events
      mockRoute.name = "events";
      mockRoute.query = { topics: "ANOTHER_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({ topics: "ORG_TOPIC" }); // Unchanged

      // Return to organizations
      mockRoute.name = "organizations";
      mockRoute.query = { topics: "FINAL_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({ topics: "FINAL_TOPIC" });
    });

    it("handles navigation across i18n locales", async () => {
      setupWatcher();

      // Start on English organizations
      mockRoute.name = "organizations___en";
      mockRoute.query = { topics: "EN_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({ topics: "EN_TOPIC" });

      // Switch to German organizations
      mockRoute.name = "organizations___de";
      mockRoute.query = { topics: "DE_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({ topics: "DE_TOPIC" });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty query object", async () => {
      mockRoute.name = "organizations";
      mockRoute.query = {};
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({});
    });

    it("handles multiple topics array", async () => {
      mockRoute.name = "organizations";
      mockRoute.query = { topics: ["ENVIRONMENT", "EDUCATION"] };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({ topics: ["ENVIRONMENT", "EDUCATION"] });
    });
  });
});
