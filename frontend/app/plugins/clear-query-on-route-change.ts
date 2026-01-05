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

    // When navigating between different top-level routes, clear query params
    const isTopLevelChange =
      topLevelRoutes.has(toBase) &&
      topLevelRoutes.has(fromBase) &&
      toBase !== fromBase;

    // Check both source and destination for query params
    // Source params might get copied to destination during navigation
    const toHasQueryParams = Object.keys(to.query).length > 0;
    const fromHasQueryParams = Object.keys(from.query).length > 0;

    if (isTopLevelChange && (toHasQueryParams || fromHasQueryParams)) {
      // Redirect to same path without query params
      return { path: to.path, query: {} };
    }

    return true;
  });
});
