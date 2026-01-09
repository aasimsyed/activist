// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Composable for managing view preference (map/list/calendar) using localStorage.
 *
 * Since we flush all query params on route change, view preference is stored
 * in localStorage instead. This allows the preference to persist across
 * sessions while keeping query params clean.
 *
 * @example
 * // In events page:
 * const { viewType, setViewType } = useViewPreference("events", ViewType.MAP);
 */

import type { ComputedRef } from "vue";

import { computed, ref, watch } from "vue";

const STORAGE_KEY_PREFIX = "activist:view-preference:";

// Shared reactive state per route key for real-time sync between components
const viewPreferenceState = new Map<string, ReturnType<typeof ref>>();

/**
 * Creates a view preference manager with localStorage persistence.
 * Uses shared reactive state so multiple components using the same route key
 * stay in sync in real-time.
 *
 * @param routeKey - Unique key for this route (e.g., "events", "organizations")
 * @param defaultValue - Default view type if none stored
 * @returns Object with viewType ref and setViewType function
 */
export function useViewPreference<T extends string>(
  routeKey: string,
  defaultValue: T
) {
  const storageKey = `${STORAGE_KEY_PREFIX}${routeKey}`;

  // Initialize from localStorage or use default
  const getStoredView = (): T => {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && typeof stored === "string") {
          return stored as T;
        }
      } catch (error) {
        // localStorage may be unavailable (e.g., private browsing)
        // eslint-disable-next-line no-console
        console.warn(
          "Failed to read view preference from localStorage:",
          error
        );
      }
    }
    return defaultValue;
  };

  // Use shared state if exists, otherwise create new
  // If shared state exists, sync from localStorage to handle cases where
  // localStorage was cleared or changed externally
  let viewType: ReturnType<typeof ref<T>>;
  if (viewPreferenceState.has(routeKey)) {
    viewType = viewPreferenceState.get(routeKey)! as ReturnType<typeof ref<T>>;
    // Sync from localStorage in case it was cleared/changed
    const stored = getStoredView();
    if (viewType.value !== stored) {
      viewType.value = stored;
    }
  } else {
    viewType = ref<T>(getStoredView()) as ReturnType<typeof ref<T>>;
    viewPreferenceState.set(routeKey, viewType);

    // Persist to localStorage when viewType changes
    watch(
      viewType,
      (newView) => {
        if (
          typeof window !== "undefined" &&
          typeof localStorage !== "undefined"
        ) {
          try {
            localStorage.setItem(storageKey, newView);
            // Dispatch storage event for other tabs/windows (optional)
            window.dispatchEvent(
              new StorageEvent("storage", {
                key: storageKey,
                newValue: newView,
                storageArea: localStorage,
              })
            );
          } catch (error) {
            // eslint-disable-next-line no-console
            console.warn(
              "Failed to save view preference to localStorage:",
              error
            );
          }
        }
      },
      { immediate: false }
    );

    // Listen to storage events from other tabs/windows or same tab updates
    if (typeof window !== "undefined") {
      window.addEventListener("storage", (e) => {
        if (
          e.key === storageKey &&
          e.newValue &&
          e.storageArea === localStorage
        ) {
          viewType.value = e.newValue as T;
        }
      });
    }
  }

  const setViewType = (view: T) => {
    viewType.value = view;
  };

  return {
    viewType: computed(() => viewType.value) as ComputedRef<T>,
    setViewType,
  };
}
