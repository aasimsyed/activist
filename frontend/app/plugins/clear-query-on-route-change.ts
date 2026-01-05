// SPDX-License-Identifier: AGPL-3.0-or-later
/**
 * Plugin to clear query parameters when navigating between different top-level routes.
 *
 * This ensures that filters (like topic selections) don't persist when switching
 * between sections like /events and /organizations.
 */
export default defineNuxtPlugin(() => {
  const router = useRouter();

  /**
   * Extract the first path segment from a path string.
   * Handles locale prefixes by checking for known locales.
   * @example "/en/events" -> "events", "/organizations" -> "organizations"
   */
  function getBaseRoute(path: string): string {
    // Remove leading slash and split by /
    const segments = path.replace(/^\//, "").split("/");

    // Skip locale segment if present (2-letter codes like 'en', 'de', etc.)
    const firstSegment = segments[0] || "";
    const isLocale = /^[a-z]{2}(-[a-z]{2})?$/i.test(firstSegment);

    return isLocale && segments.length > 1 ? segments[1] || "" : firstSegment;
  }

  // Routes where we should clear query params when navigating between them
  const topLevelRoutes = new Set([
    "events",
    "organizations",
    "groups",
    "home",
    "",
  ]);

  router.beforeEach((to, from) => {
    const toBase = getBaseRoute(to.path);
    const fromBase = getBaseRoute(from.path);

    // Only clear query params when navigating between different top-level routes
    // and when the destination has no explicit query params set
    const isTopLevelChange =
      topLevelRoutes.has(toBase) &&
      topLevelRoutes.has(fromBase) &&
      toBase !== fromBase;

    // Check if the current navigation already has query params
    // (meaning they were intentionally set, not carried over)
    const hasQueryParams = Object.keys(to.query).length > 0;

    if (isTopLevelChange && hasQueryParams) {
      // Check if these query params were explicitly set or inherited
      // by comparing with the from route
      const inheritedParams = Object.keys(from.query).filter(
        (key) => to.query[key] === from.query[key]
      );

      // If all query params in `to` match `from`, they were inherited
      if (
        inheritedParams.length > 0 &&
        inheritedParams.length === Object.keys(to.query).length
      ) {
        // Redirect to same path without query params
        return { path: to.path, query: {} };
      }
    }
    return true;
  });
});
