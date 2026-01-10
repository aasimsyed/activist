// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Global navigation guard that automatically flushes all query parameters
 * when navigating between routes, except for `name` (search) which persists globally.
 *
 * This ensures query params are route-specific and don't persist when
 * navigating between different routes.
 *
 * @see https://github.com/activist-org/activist/issues/1738
 */
export default defineNuxtPlugin(() => {
  const router = useRouter();

  router.beforeEach((to, from, next) => {
    // Only flush when navigating between different routes (not query-only changes)
    if (from.name && to.name && to.name !== from.name) {
      const preserved: Record<string, string> = {};

      // Preserve search query across all routes
      if (from.query.name && typeof from.query.name === "string") {
        preserved.name = from.query.name;
      }

      next({ ...to, query: preserved });
      return;
    }

    next();
  });
});
