// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Unit tests for useViewPreference composable.
 *
 * Tests localStorage-based view preference persistence for routes.
 *
 * @see https://github.com/activist-org/activist/issues/1738
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("useViewPreference", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
    // Note: Shared state persists between tests, but syncing from localStorage
    // (which is cleared here) will reset it when composable is called
  });

  describe("localStorage persistence", () => {
    it("defaults to provided default value when no stored value", () => {
      const { viewType } = useViewPreference("events", "map");
      expect(viewType.value).toBe("map");
    });

    it("loads stored value from localStorage", () => {
      localStorage.setItem("activist:view-preference:events", "list");
      const { viewType } = useViewPreference("events", "map");
      expect(viewType.value).toBe("list");
    });

    it("persists value to localStorage when set", async () => {
      // Use unique route key to avoid shared state from previous tests
      const { viewType, setViewType } = useViewPreference(
        "events-persist",
        "map"
      );
      expect(viewType.value).toBe("map");

      setViewType("list");
      // Wait for watcher to persist (needs tick for reactivity + storage write)
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(viewType.value).toBe("list");
      expect(
        localStorage.getItem("activist:view-preference:events-persist")
      ).toBe("list");
    });

    it("uses route-specific storage key", () => {
      localStorage.setItem("activist:view-preference:events", "list");
      localStorage.setItem("activist:view-preference:organizations", "grid");

      const eventsView = useViewPreference("events", "map");
      const orgsView = useViewPreference("organizations", "map");

      expect(eventsView.viewType.value).toBe("list");
      expect(orgsView.viewType.value).toBe("grid");
    });

    it("handles localStorage errors gracefully", () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const { viewType, setViewType } = useViewPreference("events", "map");
      setViewType("list");

      // Should not throw, should still update the value
      expect(viewType.value).toBe("list");

      Storage.prototype.setItem = originalSetItem;
    });

    it("handles localStorage unavailable (private browsing)", () => {
      // Mock localStorage.getItem to throw
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error("localStorage not available");
      });

      // Use a unique route key to avoid shared state from previous tests
      const { viewType } = useViewPreference("events-private-browsing", "map");
      expect(viewType.value).toBe("map");

      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe("reactivity", () => {
    it("updates reactively when setViewType is called", async () => {
      // Use a unique route key to avoid shared state from previous tests
      const { viewType, setViewType } = useViewPreference(
        "events-reactive",
        "map"
      );
      expect(viewType.value).toBe("map");

      setViewType("calendar");
      // Wait for reactivity
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(viewType.value).toBe("calendar");
    });
  });
});
