// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Global navigation guard that automatically flushes all query parameters
 * when navigating between routes (path changes).
 *
 * This ensures query params are route-specific and don't persist when
 * navigating between different routes.
 *
 * Special params (`name`, `view`) are handled separately via localStorage
 * composables rather than query params.
 *
 * @see https://github.com/activist-org/activist/issues/1738
 */

export default defineNuxtPlugin(() => {
  const router = useRouter();

  router.beforeEach((to, from, next) => {
    // Only flush query params when navigating between routes (path changes)
    // Don't flush on:
    // - Initial navigation (from.name is null/undefined - e.g., bookmark, direct link)
    // - Query-only changes within the same route (to.path === from.path)
    // - Navigation to routes without query params (already clean)
    if (
      from.name && // Not initial navigation
      to.path !== from.path && // Path changed (route change)
      Object.keys(to.query).length > 0 // Has query params to flush
    ) {
      // Navigate to the same path but without query params
      // This ensures query params don't persist when navigating between routes
      next({
        path: to.path,
        query: {},
        params: to.params,
        hash: to.hash,
        replace: true, // Use replace to avoid creating history entries
      });
      return;
    }

    next();
  });
});
