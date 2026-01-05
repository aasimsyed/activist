// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Unit tests for SidebarLeftFilterEvents.vue
 *
 * These tests verify the route query sync behavior:
 * - Query params are synced only when on /events route
 * - Query params are NOT synced when on other routes (prevents persistence bug)
 */
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick, reactive, watch } from "vue";

// MARK: Test the watcher logic directly

describe("SidebarLeftFilterEvents Route Query Sync", () => {
  /**
   * These tests verify the core watcher logic that prevents stale query params
   * from persisting when navigating between routes (issue #1738).
   *
   * The actual component uses this pattern:
   * ```
   * watch(
   *   route,
   *   (form) => {
   *     if (form.path !== "/events") {
   *       return;
   *     }
   *     // ... sync query params
   *   },
   *   { immediate: true }
   * );
   * ```
   */

  // Simulate the route reactive object
  let mockRoute: { path: string; query: Record<string, unknown> };
  let formData: { value: Record<string, unknown> };
  let viewType: { value: string };

  // This simulates the watcher logic from SidebarLeftFilterEvents.vue
  const setupWatcher = () => {
    watch(
      () => mockRoute,
      (form) => {
        // Only sync query params when on /events route
        if (form.path !== "/events") {
          return;
        }

        // Extract view from query (handled separately)
        const { view, ...rest } = form.query as Record<string, unknown>;
        formData.value = { ...rest };
        viewType.value = typeof view === "string" ? view : "map";
      },
      { immediate: true, deep: true }
    );
  };

  beforeEach(() => {
    mockRoute = reactive({
      path: "/events",
      query: {},
    });
    formData = reactive({ value: {} });
    viewType = reactive({ value: "map" });
  });

  describe("Path-based Query Sync", () => {
    it("syncs query params when route.path is /events", async () => {
      mockRoute.path = "/events";
      mockRoute.query = {
        topics: "ENVIRONMENT",
        location: "Berlin",
        view: "list",
      };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({
        topics: "ENVIRONMENT",
        location: "Berlin",
      });
      expect(viewType.value).toBe("list");
    });

    it("does NOT sync query params when route.path is /organizations", async () => {
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "ENVIRONMENT" };

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
    it("syncs new query when navigating TO /events", async () => {
      // Start on a different route
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "OLD_TOPIC" };

      setupWatcher();
      await nextTick();

      // Verify formData is empty (not on /events)
      expect(formData.value).toEqual({});

      // Navigate to /events with new query
      mockRoute.path = "/events";
      mockRoute.query = { topics: "NEW_TOPIC", view: "calendar" };
      await nextTick();

      // formData should now have the new query params
      expect(formData.value).toEqual({ topics: "NEW_TOPIC" });
      expect(viewType.value).toBe("calendar");
    });

    it("does NOT update formData when navigating AWAY from /events", async () => {
      // Start on /events with query params
      mockRoute.path = "/events";
      mockRoute.query = { topics: "ENVIRONMENT", view: "map" };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({ topics: "ENVIRONMENT" });

      // Navigate to /organizations (the query might still be in URL during transition)
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "ENVIRONMENT" };
      await nextTick();

      // formData should NOT be updated with /organizations query
      // It keeps its last value from /events
      expect(formData.value).toEqual({ topics: "ENVIRONMENT" });
    });

    it("prevents /organizations query params from being synced to /events filter", async () => {
      // Core bug scenario: User filters on /organizations, navigates to /events
      // The /events filter should NOT pick up /organizations params

      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "EDUCATION", location: "Berlin" };

      setupWatcher();
      await nextTick();

      // formData should be empty because we're not on /events
      expect(formData.value).toEqual({});
      expect(formData.value).not.toHaveProperty("topics");
      expect(formData.value).not.toHaveProperty("location");
    });

    it("correctly syncs when navigating /organizations -> /events -> /organizations -> /events", async () => {
      setupWatcher();

      // Start on /organizations
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "ORG_TOPIC" };
      await nextTick();
      expect(formData.value).toEqual({});

      // Go to /events
      mockRoute.path = "/events";
      mockRoute.query = { topics: "EVENT_TOPIC", view: "list" };
      await nextTick();
      expect(formData.value).toEqual({ topics: "EVENT_TOPIC" });
      expect(viewType.value).toBe("list");

      // Back to /organizations
      mockRoute.path = "/organizations";
      mockRoute.query = { topics: "ANOTHER_ORG_TOPIC" };
      await nextTick();
      // formData should still have the /events value (not synced)
      expect(formData.value).toEqual({ topics: "EVENT_TOPIC" });

      // Return to /events with different query
      mockRoute.path = "/events";
      mockRoute.query = {
        topics: "NEW_EVENT_TOPIC",
        location: "Paris",
        view: "calendar",
      };
      await nextTick();
      expect(formData.value).toEqual({
        topics: "NEW_EVENT_TOPIC",
        location: "Paris",
      });
      expect(viewType.value).toBe("calendar");
    });
  });

  describe("View Type Handling", () => {
    it("extracts view from query separately", async () => {
      mockRoute.path = "/events";
      mockRoute.query = { topics: "EDUCATION", view: "list" };

      setupWatcher();
      await nextTick();

      // view should NOT be in formData
      expect(formData.value).not.toHaveProperty("view");
      expect(formData.value).toEqual({ topics: "EDUCATION" });
      expect(viewType.value).toBe("list");
    });

    it("defaults viewType to map when no view query param", async () => {
      mockRoute.path = "/events";
      mockRoute.query = { topics: "EDUCATION" };

      setupWatcher();
      await nextTick();

      expect(viewType.value).toBe("map");
    });

    it("defaults viewType to map when view is not a string", async () => {
      mockRoute.path = "/events";
      mockRoute.query = { topics: "EDUCATION", view: 123 };

      setupWatcher();
      await nextTick();

      expect(viewType.value).toBe("map");
    });
  });

  describe("Edge Cases", () => {
    it("handles empty query object", async () => {
      mockRoute.path = "/events";
      mockRoute.query = {};

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({});
      expect(viewType.value).toBe("map");
    });

    it("handles query with multiple topics", async () => {
      mockRoute.path = "/events";
      mockRoute.query = { topics: ["ENVIRONMENT", "EDUCATION"], view: "list" };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({ topics: ["ENVIRONMENT", "EDUCATION"] });
    });

    it("handles query with days filter", async () => {
      mockRoute.path = "/events";
      mockRoute.query = { days: "7", type: "learn", view: "calendar" };

      setupWatcher();
      await nextTick();

      expect(formData.value).toEqual({ days: "7", type: "learn" });
      expect(viewType.value).toBe("calendar");
    });

    it("handles subpaths of /events", async () => {
      // /events/123 should NOT match exactly /events
      mockRoute.path = "/events/123";
      mockRoute.query = { topics: "ENVIRONMENT" };

      setupWatcher();
      await nextTick();

      // Exact match required, so this should NOT sync
      expect(formData.value).toEqual({});
    });
  });
});
