// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Unit tests for useSearchQuery composable.
 *
 * Tests localStorage-based search query persistence.
 *
 * @see https://github.com/activist-org/activist/issues/1738
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";

describe("useSearchQuery", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    if (typeof localStorage !== "undefined") {
      localStorage.clear();
    }
  });

  describe("localStorage persistence", () => {
    it("defaults to empty string when no stored value", () => {
      const { searchQuery } = useSearchQuery();
      expect(searchQuery.value).toBe("");
    });

    it("loads stored value from localStorage", () => {
      localStorage.setItem("activist:search-query", "test search");
      const { searchQuery } = useSearchQuery();
      expect(searchQuery.value).toBe("test search");
    });

    it("persists value to localStorage when set", async () => {
      const { searchQuery, setSearchQuery } = useSearchQuery();
      expect(searchQuery.value).toBe("");

      setSearchQuery("new search");
      // Wait for watcher to persist (needs tick for reactivity + storage write)
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(searchQuery.value).toBe("new search");
      expect(localStorage.getItem("activist:search-query")).toBe("new search");
    });

    it("removes from localStorage when cleared", async () => {
      localStorage.setItem("activist:search-query", "existing search");
      const { searchQuery, clearSearchQuery } = useSearchQuery();
      expect(searchQuery.value).toBe("existing search");

      clearSearchQuery();
      // Wait for watcher to persist (needs tick for reactivity + storage write)
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 20));

      expect(searchQuery.value).toBe("");
      expect(localStorage.getItem("activist:search-query")).toBeNull();
    });

    it("removes from localStorage when set to empty string", async () => {
      // First, clear any existing state by setting to empty
      const { setSearchQuery: clearFirst } = useSearchQuery();
      clearFirst("");
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Now test the actual scenario
      localStorage.setItem("activist:search-query", "existing search");
      const { searchQuery, setSearchQuery } = useSearchQuery();
      // Wait for sync from localStorage
      await nextTick();

      setSearchQuery("");
      // Wait for watcher to persist (needs tick for reactivity + storage write)
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 30));

      expect(searchQuery.value).toBe("");
      expect(localStorage.getItem("activist:search-query")).toBeNull();
    });

    it("handles localStorage errors gracefully", () => {
      // Mock localStorage.setItem to throw
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = vi.fn(() => {
        throw new Error("Storage quota exceeded");
      });

      const { searchQuery, setSearchQuery } = useSearchQuery();
      setSearchQuery("test");

      // Should not throw, should still update the value
      expect(searchQuery.value).toBe("test");

      Storage.prototype.setItem = originalSetItem;
    });

    it("handles localStorage unavailable (private browsing)", () => {
      // Mock localStorage.getItem to throw
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error("localStorage not available");
      });

      // Should default to empty string
      const { searchQuery } = useSearchQuery();
      expect(searchQuery.value).toBe("");

      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe("reactivity", () => {
    it("updates reactively when setSearchQuery is called", async () => {
      const { searchQuery, setSearchQuery } = useSearchQuery();
      expect(searchQuery.value).toBe("");

      setSearchQuery("reactive update");
      // Wait for reactivity
      await nextTick();

      expect(searchQuery.value).toBe("reactive update");
    });
  });
});
