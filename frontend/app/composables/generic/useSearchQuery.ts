// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Composable for managing search query using localStorage.
 *
 * Since we flush all query params on route change, search query is stored
 * in localStorage instead. This allows search to persist across route
 * navigations within the same session.
 *
 * @example
 * // In search sidebar:
 * const { searchQuery, setSearchQuery, clearSearchQuery } = useSearchQuery();
 */

import { computed, ref, watch } from "vue";

const STORAGE_KEY = "activist:search-query";

// Shared reactive state for real-time sync between components
let searchQueryState: ReturnType<typeof ref<string>> | undefined;
let searchQueryWatchersSet = false;

/**
 * Creates a search query manager with localStorage persistence.
 * Uses shared reactive state so multiple components stay in sync in real-time.
 *
 * @returns Object with searchQuery ref and setter/clearer functions
 */
export function useSearchQuery() {
  // Initialize from localStorage or use empty string
  const getStoredQuery = (): string => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && typeof stored === "string") {
          return stored;
        }
      } catch (error) {
        // localStorage may be unavailable
        // eslint-disable-next-line no-console
        console.warn("Failed to read search query from localStorage:", error);
      }
    }
    return "";
  };

  // Use shared state if exists, otherwise create new
  // If shared state exists, sync from localStorage to handle cases where
  // localStorage was cleared or changed externally
  if (!searchQueryState) {
    searchQueryState = ref<string>(getStoredQuery());
  }

  // Only set up watchers once (must be set up before syncing)
  if (!searchQueryWatchersSet) {
    searchQueryWatchersSet = true;

    // Persist to localStorage when searchQuery changes
    watch(
      searchQueryState,
      (newQuery) => {
        if (
          typeof window !== "undefined" &&
          typeof localStorage !== "undefined"
        ) {
          try {
            if (newQuery && newQuery.trim().length > 0) {
              localStorage.setItem(STORAGE_KEY, newQuery);
              // Dispatch storage event for other tabs/windows (optional)
              window.dispatchEvent(
                new StorageEvent("storage", {
                  key: STORAGE_KEY,
                  newValue: newQuery,
                  storageArea: localStorage,
                })
              );
            } else {
              localStorage.removeItem(STORAGE_KEY);
            }
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn("Failed to save search query to localStorage:", error);
          }
        }
      },
      { immediate: false }
    );

    // Listen to storage events from other tabs/windows
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY && e.storageArea === localStorage) {
          searchQueryState.value = (e.newValue || "") as string;
        }
      });
    }
  } else {
    // Watcher is already set up, sync from localStorage in case it was cleared/changed
    const stored = getStoredQuery();
    if (searchQueryState.value !== stored) {
      searchQueryState.value = stored;
    }
  }

  const searchQuery = searchQueryState;

  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
  };

  const clearSearchQuery = () => {
    // Just set to empty string - the watcher will remove from localStorage
    searchQuery.value = "";
  };

  return {
    searchQuery: computed(() => searchQuery.value),
    setSearchQuery,
    clearSearchQuery,
  };
}
