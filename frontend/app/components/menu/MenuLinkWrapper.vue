<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <a
    v-if="to"
    @click.prevent="navigateWithoutQuery"
    class="font-md group relative flex w-full basis-full cursor-pointer items-center justify-center rounded-md text-left text-sm transition duration-200 focus-brand"
    :class="{
      'style-menu-option-cta': selected,
      'style-menu-option': !selected && isAddStyles,
      'p-2': isAddStyles,
    }"
    :href="localePath(to)"
  >
    <slot />
  </a>
  <button
    v-else
    class="font-md group relative flex w-full basis-full cursor-pointer items-center justify-center rounded-md text-left text-sm transition duration-200 focus-brand"
    :class="{
      'style-menu-option-cta': selected,
      'style-menu-option': !selected && isAddStyles,
      'p-2': isAddStyles,
    }"
    type="button"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const localePath = useLocalePath();

export interface Props {
  to?: string;
  selected: boolean;
  isAddStyles?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isAddStyles: true,
});

async function navigateWithoutQuery() {
  if (props.to) {
    // Use navigateTo with explicit empty query to clear params from previous route
    await navigateTo(
      {
        path: localePath(props.to),
        query: {},
      },
      {
        replace: false,
      }
    );
  }
}
</script>
