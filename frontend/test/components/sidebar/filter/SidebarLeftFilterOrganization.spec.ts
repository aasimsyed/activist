// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Unit tests for SidebarLeftFilterOrganization.vue
 *
 * These tests verify the route query sync behavior:
 * - Query params are synced only when on /organizations route
 * - Query params are NOT synced when on other routes (prevents persistence bug)
 */
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick, reactive, watch } from "vue";

// MARK: Test the watcher logic directly

describe("SidebarLeftFilterOrganization Route Query Sync", () => {
  /**
   * These tests verify the core watcher logic that prevents stale query params
   * from persisting when navigating between routes (issue #1738).
   *
   * The actual component uses this pattern:
   * ```
   * watch(
   *   route,
   *   (newRoute) => {
   *     if (newRoute.path === "/organizations") {
   *       formData.value = { ...newRoute.query };
   *     }
   *   },
   *   { immediate: true }
   * );
   * ```
   */

  // Simulate the route reactive object
  let mockRoute: { path: string; query: Record<string, unknown> };
  let formData: { value: Record<string, unknown> };

  // This simulates the watcher logic from SidebarLeftFilterOrganization.vue
  const setupWatcher = () => {
    watch(
      () => mockRoute,
      (newRoute) => {
        if (newRoute.path === "/organizations") {
          formData.value = { ...newRoute.query };
        }
      },
      { immediate: true, deep: true }
    );
  };

  beforeEach(() => {
    mockRoute = reactive({
      path: "/organizations",
      query: {},
    });
    formData = reactive({ value: {} });
  });

  describe("Path-based Query Sync", () => {
    it("syncs query params when route.path is /organizations", async () => {
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "ENVIRONMENT", location: "Berlin" };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({
        topics: "ENVIRONMENT",
        location: "Berlin",
      });
    });

    it("does NOT sync query params when route.path is /events", async () => {
      mockRoute.path = "/events";
      mockRoute.query = { topics: "ENVIRONMENT", view: "map" };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({});
    });

    it("does NOT sync query params when route.path is /home", async () => {
      mockRoute.path = "/home";
      mockRoute.query = { someParam: "value" };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({});
    });

    it("does NOT sync query params when route.path is empty", async () => {
      mockRoute.path = "";
      mockRoute.query = { topics: "ENVIRONMENT" };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({});
    });
  });

  describe("Navigation Scenarios (Issue #1738)", () => {
    it("syncs new query when navigating TO /organizations", async () => {
      // Start on a different route
      mockRoute.path = "/events";
      mockRoute.query = { topics: "OLD_TOPIC" };

      setupWatcher();
      await nextTick();

      // Verify formData is empty (not on /organizations)
      expect(formData.value).toEqual({});

      // Navigate to /organizations with new query
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "NEW_TOPIC" };
      await nextTick();

      // formData should now have the new query params
      expect(formData.value).toEqual({ topics: "NEW_TOPIC" });
    });

    it("does NOT update formData when navigating AWAY from /organizations", async () => {
      // Start on /organizations with query params
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "ENVIRONMENT" };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({ topics: "ENVIRONMENT" });

      // Navigate to /events (the query might still be in URL during transition)
      mockRoute.path = "/events";
      mockRoute.query = { topics: "ENVIRONMENT", view: "map" };
      await nextTick();

      // formData should NOT be updated with /events query
      // It keeps its last value from /organizations
      expect(formData.value).toEqual({ topics: "ENVIRONMENT" });
    });

    it("prevents /events query params from being synced to /organizations filter", async () => {
      // Core bug scenario: User filters on /events, navigates to /organizations
      // The /organizations filter should NOT pick up /events params

      mockRoute.path = "/events";
      mockRoute.query = { topics: "EDUCATION", view: "list", days: "7" };

      setupWatcher();
      await nextTick();

      // formData should be empty because we're not on /organizations
      expect(formData.value).toEqual({});
      expect(formData.value).not.toHaveProperty("topics");
      expect(formData.value).not.toHaveProperty("view");
      expect(formData.value).not.toHaveProperty("days");
    });

    it("correctly syncs when navigating /events -> /organizations -> /events -> /organizations", async () => {
      setupWatcher();

      // Start on /events
      mockRoute.path = "/events";
      mockRoute.query = { topics: "EVENTS_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({});

      // Go to /organizations
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "ORG_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({ topics: "ORG_TOPIC" });

      // Back to /events
      mockRoute.path = "/events";
      mockRoute.query = { topics: "ANOTHER_EVENTS_TOPIC" };
      await nextTick();
      // formData should still have the /organizations value (not synced)
      expect(formData.value).toEqual({ topics: "ORG_TOPIC" });

      // Return to /organizations with different query
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "NEW_ORG_TOPIC", location: "Berlin" };
      await nextTick();
      expect(formData.value).toEqual({
        topics: "NEW_ORG_TOPIC",
        location: "Berlin",
      });
    });
  });

  describe("Edge Cases", () => {
    it("handles empty query object", async () => {
      mockRoute.path = "/organizations";
      mockRoute.query = {};

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({});
    });

    it("handles query with multiple topics", async () => {
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: ["ENVIRONMENT", "EDUCATION"] };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({ topics: ["ENVIRONMENT", "EDUCATION"] });
    });

    it("handles subpaths of /organizations", async () => {
      // /organizations/123 should NOT match exactly /organizations
      mockRoute.path = "/organizations/123";
      mockRoute.query = { topics: "ENVIRONMENT" };

      setupWatcher();
      await nextTick();

      // Exact match required, so this should NOT sync
      expect(formData.value).toEqual({});
    });
  });
});
