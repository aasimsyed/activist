// SPDX-License-Identifier: AGPL-3.0-or-later

// Plugin to ensure HTML lang attribute is always set
export default defineNuxtPlugin(() => {
  // Set lang attribute immediately on client side
  if (import.meta.client) {
    // Set it immediately
    document.documentElement.setAttribute("lang", "en");

    // Also set it after a short delay to ensure it's applied
    setTimeout(() => {
      if (!document.documentElement.hasAttribute("lang")) {
        document.documentElement.setAttribute("lang", "en");
      }
    }, 100);
  }
});
