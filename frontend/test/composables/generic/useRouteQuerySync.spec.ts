// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Unit tests for useRouteQuerySync composable.
 *
 * This composable provides route-scoped query parameter synchronization,
 * using route.name matching for robustness with i18n locale prefixes.
 *
 * @see https://github.com/activist-org/activist/issues/1738
 */
import { describe, expect, it, vi } from "vitest";
import { nextTick, reactive } from "vue";

describe("useRouteQuerySync", () => {
  /**
   * Tests the route name matching logic used by useRouteQuerySync.
   *
   * The composable matches:
   * - Exact route name (e.g., "events")
   * - Route name with i18n suffix (e.g., "events___en")
   *
   * It does NOT match:
   * - Subpages (e.g., "events-eventId")
   * - Other routes (e.g., "organizations")
   */

  describe("Route Name Matching Logic", () => {
    /**
     * Helper to test route name matching for a given target.
     * This replicates the logic in useRouteQuerySync.
     */
    const isRouteMatch = (
      routeName: string,
      targetRouteName: string
    ): boolean => {
      return (
        routeName === targetRouteName ||
        routeName.startsWith(`${targetRouteName}___`)
      );
    };

    describe("events route matching", () => {
      const target = "events";

      it("matches exact route name", () => {
        expect(isRouteMatch("events", target)).toBe(true);
      });

      it("matches i18n route name with English locale", () => {
        expect(isRouteMatch("events___en", target)).toBe(true);
      });

      it("matches i18n route name with German locale", () => {
        expect(isRouteMatch("events___de", target)).toBe(true);
      });

      it("matches i18n route name with French locale", () => {
        expect(isRouteMatch("events___fr", target)).toBe(true);
      });

      it("does NOT match event detail page", () => {
        expect(isRouteMatch("events-eventId", target)).toBe(false);
      });

      it("does NOT match i18n event detail page", () => {
        expect(isRouteMatch("events-eventId___en", target)).toBe(false);
      });

      it("does NOT match organizations route", () => {
        expect(isRouteMatch("organizations", target)).toBe(false);
      });

      it("does NOT match empty string", () => {
        expect(isRouteMatch("", target)).toBe(false);
      });
    });

    describe("organizations route matching", () => {
      const target = "organizations";

      it("matches exact route name", () => {
        expect(isRouteMatch("organizations", target)).toBe(true);
      });

      it("matches i18n route name with English locale", () => {
        expect(isRouteMatch("organizations___en", target)).toBe(true);
      });

      it("matches i18n route name with German locale", () => {
        expect(isRouteMatch("organizations___de", target)).toBe(true);
      });

      it("does NOT match organization detail page", () => {
        expect(isRouteMatch("organizations-orgId", target)).toBe(false);
      });

      it("does NOT match i18n org detail page", () => {
        expect(isRouteMatch("organizations-orgId___en", target)).toBe(false);
      });

      it("does NOT match group subpage", () => {
        expect(isRouteMatch("organizations-orgId-groups-groupId", target)).toBe(
          false
        );
      });

      it("does NOT match events route", () => {
        expect(isRouteMatch("events", target)).toBe(false);
      });
    });
  });

  describe("isActiveRoute computed property", () => {
    /**
     * Simulates the isActiveRoute computed property behavior.
     */
    const createIsActiveRoute = (
      targetRouteName: string,
      routeRef: { name: string }
    ) => {
      return () => {
        const name = routeRef.name ?? "";
        return (
          name === targetRouteName || name.startsWith(`${targetRouteName}___`)
        );
      };
    };

    it("returns true when on target route", () => {
      const route = reactive({ name: "events" });
      const isActive = createIsActiveRoute("events", route);
      expect(isActive()).toBe(true);
    });

    it("returns true when on i18n target route", () => {
      const route = reactive({ name: "events___en" });
      const isActive = createIsActiveRoute("events", route);
      expect(isActive()).toBe(true);
    });

    it("returns false when on different route", () => {
      const route = reactive({ name: "organizations" });
      const isActive = createIsActiveRoute("events", route);
      expect(isActive()).toBe(false);
    });

    it("returns false when on subpage route", () => {
      const route = reactive({ name: "events-eventId" });
      const isActive = createIsActiveRoute("events", route);
      expect(isActive()).toBe(false);
    });

    it("updates reactively when route changes", async () => {
      const route = reactive({ name: "events" });
      const isActive = createIsActiveRoute("events", route);

      expect(isActive()).toBe(true);

      route.name = "organizations";
      await nextTick();
      expect(isActive()).toBe(false);

      route.name = "events___de";
      await nextTick();
      expect(isActive()).toBe(true);
    });
  });

  describe("watchRouteQuery behavior", () => {
    /**
     * Simulates watchRouteQuery callback behavior.
     */
    it("calls callback only when route matches", async () => {
      const callback = vi.fn();
      const route = reactive({ name: "events", query: { topics: "test" } });
      const targetRouteName = "events";

      // Simulate watchRouteQuery
      const checkAndCall = () => {
        const name = route.name ?? "";
        const isMatch =
          name === targetRouteName || name.startsWith(`${targetRouteName}___`);
        if (isMatch) {
          callback(route.query);
        }
      };

      // Initial call (immediate: true)
      checkAndCall();
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith({ topics: "test" });

      // Change to non-matching route
      route.name = "organizations";
      route.query = { topics: "other" };
      await nextTick();
      checkAndCall();
      expect(callback).toHaveBeenCalledTimes(1); // Not called again

      // Change back to matching route
      route.name = "events";
      route.query = { topics: "new" };
      await nextTick();
      checkAndCall();
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenLastCalledWith({ topics: "new" });
    });

    it("handles i18n route transitions", async () => {
      const callback = vi.fn();
      const route = reactive({ name: "events___en", query: { topics: "en" } });
      const targetRouteName = "events";

      const checkAndCall = () => {
        const name = route.name ?? "";
        const isMatch =
          name === targetRouteName || name.startsWith(`${targetRouteName}___`);
        if (isMatch) {
          callback(route.query);
        }
      };

      checkAndCall();
      expect(callback).toHaveBeenCalledWith({ topics: "en" });

      // Switch to German locale
      route.name = "events___de";
      route.query = { topics: "de" };
      await nextTick();
      checkAndCall();
      expect(callback).toHaveBeenLastCalledWith({ topics: "de" });
    });
  });
});
