// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Composable for route-scoped query parameter synchronization.
 *
 * Prevents query params from persisting when navigating between routes.
 * Uses route.name matching for robustness with i18n locale prefixes.
 *
 * @see https://github.com/activist-org/activist/issues/1738
 *
 * @example
 * // In a filter component that should only sync on /events:
 * const { isActiveRoute, watchRouteQuery } = useRouteQuerySync("events");
 *
 * watchRouteQuery((query) => {
 *   formData.value = { ...query };
 * });
 */

import type { LocationQuery } from "vue-router";

type RouteQueryCallback = (query: LocationQuery) => void;

/**
 * Creates a route-scoped query sync utility.
 *
 * @param targetRouteName - Base route name to match (e.g., "events", "organizations").
 *                          Matches exactly or with i18n suffix (e.g., "events___en").
 */
export function useRouteQuerySync(targetRouteName: string) {
  const route = useRoute();

  /**
   * Checks if current route matches the target route name.
   * Handles i18n route naming convention (e.g., "events" matches "events___en").
   */
  const isActiveRoute = computed(() => {
    const name = route.name?.toString() ?? "";
    // Match exact name or name with i18n suffix (e.g., "events" or "events___en")
    // But NOT subpages (e.g., "events-eventId" should not match "events")
    return name === targetRouteName || name.startsWith(`${targetRouteName}___`);
  });

  /**
   * Creates a watcher that only syncs query params when on the target route.
   * Prevents stale query params from persisting when navigating between routes.
   *
   * @param callback - Function to call with query params when on target route
   * @param options - Watch options (immediate defaults to true)
   */
  const watchRouteQuery = (
    callback: RouteQueryCallback,
    options: { immediate?: boolean } = { immediate: true }
  ) => {
    return watch(
      route,
      (newRoute) => {
        const name = newRoute.name?.toString() ?? "";
        const isMatch =
          name === targetRouteName || name.startsWith(`${targetRouteName}___`);

        if (!isMatch) {
          return;
        }

        callback(newRoute.query);
      },
      { immediate: options.immediate }
    );
  };

  return {
    isActiveRoute,
    watchRouteQuery,
  };
}
