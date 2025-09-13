// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Router } from "#vue-router";

// Injects the lang attribute in all Nuxt <Head></Head> components.
export default defineNuxtPlugin((nuxtApp) => {
  const router: Router = nuxtApp.vueApp.config.globalProperties.$router;
  router.afterEach((_to) => {
    // Use the current locale from i18n instead of parsing URL
    const languageCode =
      (nuxtApp.$i18n as { locale: { value: string } })?.locale?.value || "en";
    document.documentElement.setAttribute("lang", languageCode);
  });
});
