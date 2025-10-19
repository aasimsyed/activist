<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <NuxtLoadingIndicator color="#F0A14C" />
  <HeaderMobile />
  <MenuMobileNavigationDropdown v-if="!aboveMediumBP" />
  <slot />
  <MenuMobileNavBar v-if="!aboveMediumBP" />
</template>

<script setup lang="ts">
const aboveMediumBP = useBreakpoint("md");

const sidebar = useSidebar();

onMounted(() => {
  window.addEventListener("resize", handleWindowSizeChange);
  handleWindowSizeChange();

  // FIX: Ensure sidebar is collapsed on initial load for mobile/tablet viewports.
  // This prevents the sidebar from intercepting pointer events during test execution.
  // Without this fix, tests fail with "intercepts pointer events" errors on iPad Portrait (768px).
  if (window.innerWidth < 1280) {
    sidebar.collapsed = true;
    sidebar.collapsedSwitch = true;
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleWindowSizeChange);
});

const handleWindowSizeChange = () => {
  if (window.innerWidth < 1280) {
    sidebar.collapsed = true;
    sidebar.collapsedSwitch = true;
  }
};
</script>
