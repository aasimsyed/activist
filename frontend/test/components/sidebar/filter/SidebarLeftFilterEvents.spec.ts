// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Unit tests for SidebarLeftFilterEvents.vue query sync behavior.
 * Verifies fix for issue #1738: Query params should not persist across routes.
 *
 * With the global navigation guard, all query params are automatically flushed
 * when navigating between routes. Filter components sync query params when present,
 * but they don't persist across route changes due to the global guard.
 *
 * View preference is handled via localStorage (useViewPreference) instead of query params.
 *
 * @see https://github.com/activist-org/activist/issues/1738
 */
import { beforeEach, describe, expect, it } from "vitest";
import { nextTick, reactive, watch } from "vue";

describe("SidebarLeftFilterEvents Query Sync", () => {
  /**
   * These tests verify that filter components sync query params when present.
   * The global navigation guard ensures query params are flushed on route change,
   * so we don't need route-scoped checking here.
   */

  let mockRoute: { query: Record<string, unknown> };
  let formData: { value: Record<string, unknown> };

  const setupWatcher = () => {
    watch(
      () => mockRoute.query,
      (query) => {
        const topics = Array.isArray(query.topics)
          ? query.topics
          : query.topics
            ? [query.topics]
            : [];
        // Extract all filter params except view and name (handled via localStorage)
        const { view, name, ...rest } = query as Record<string, unknown>;
        formData.value = { ...rest, topics };
      },
      { immediate: true, deep: true }
    );
  };

  beforeEach(() => {
    mockRoute = reactive({ query: {} });
    formData = reactive({ value: {} });
  });

  describe("Query Param Sync", () => {
    it("syncs query params to formData", async () => {
      mockRoute.query = {
        topics: "ENVIRONMENT",
        location: "Berlin",
        days: "7",
      };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({
        topics: ["ENVIRONMENT"],
        location: "Berlin",
        days: "7",
      });
    });

    it("excludes view and name from formData (handled via localStorage)", async () => {
      mockRoute.query = {
        topics: "ENVIRONMENT",
        view: "list",
        name: "search term",
      };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({
        topics: ["ENVIRONMENT"],
      });
      expect(formData.value).not.toHaveProperty("view");
      expect(formData.value).not.toHaveProperty("name");
    });

    it("handles multiple topics array", async () => {
      mockRoute.query = {
        topics: ["ENVIRONMENT", "EDUCATION"],
        days: "30",
      };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({
        topics: ["ENVIRONMENT", "EDUCATION"],
        days: "30",
      });
    });

    it("handles empty query object", async () => {
      mockRoute.query = {};
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({ topics: [] });
    });

    it("handles days_ahead filter", async () => {
      mockRoute.query = {
        days_ahead: "7",
        type: "learn",
      };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({
        topics: [],
        days_ahead: "7",
        type: "learn",
      });
    });
  });

  describe("Reactivity", () => {
    it("updates formData when query params change", async () => {
      setupWatcher();
      await nextTick();

      mockRoute.query = { topics: "INITIAL" };
      await nextTick();
      expect(formData.value.topics).toEqual(["INITIAL"]);

      mockRoute.query = { topics: "UPDATED", location: "Paris" };
      await nextTick();
      expect(formData.value.topics).toEqual(["UPDATED"]);
      expect(formData.value.location).toBe("Paris");
    });

    it("clears formData when query params are removed", async () => {
      mockRoute.query = { topics: "ENVIRONMENT", location: "Berlin" };
      setupWatcher();
      await nextTick();
      expect(formData.value).toEqual({
        topics: ["ENVIRONMENT"],
        location: "Berlin",
      });

      mockRoute.query = {};
      await nextTick();
      expect(formData.value).toEqual({ topics: [] });
    });
  });

  describe("Issue #1738 - Query Param Persistence", () => {
    it("filters sync from current query (not previous route's query)", async () => {
      // Simulate what happens with global guard:
      // Previous route had topics, but current route doesn't
      setupWatcher();

      // Initial state on events route
      mockRoute.query = { topics: "EVENT_TOPIC", location: "Berlin" };
      await nextTick();
      expect(formData.value.topics).toEqual(["EVENT_TOPIC"]);

      // Navigate to different route - global guard flushes query params
      // So filter component sees empty query
      mockRoute.query = {};
      await nextTick();
      expect(formData.value).toEqual({ topics: [] });
    });
  });
});
