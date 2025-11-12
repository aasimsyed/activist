// SPDX-License-Identifier: AGPL-3.0-or-later

import { ref, computed, onMounted, onBeforeUpdate, type Ref } from "vue";

/**
 * Composable for managing roving tabindex focus pattern.
 * Used for keyboard navigation in groups of interactive elements.
 *
 * @param items - Reactive array of items in the group
 * @param selectedValue - Currently selected value (optional)
 * @returns Focus management utilities
 *
 * @example
 * const { focusedIndex, itemRefs, setItemRef, getTabIndex, handleFocus } =
 *   useRovingFocus(options, modelValue);
 */
export function useRovingFocus<T extends { value: unknown }>(
  items: Ref<T[]>,
  selectedValue?: Ref<unknown>
) {
  const focusedIndex = ref<number>(0);
  const itemRefs = ref<(HTMLElement | null)[]>([]);

  /**
   * Track element refs for focus management.
   */
  const setItemRef = (el: HTMLElement | null, idx: number) => {
    if (el) {
      itemRefs.value[idx] = el;
    }
  };

  /**
   * Clear refs before component update.
   */
  onBeforeUpdate(() => {
    itemRefs.value = [];
  });

  /**
   * Set initial focus index on mount.
   */
  onMounted(() => {
    if (selectedValue?.value !== undefined) {
      const selectedIndex = items.value.findIndex(
        (item) => item.value === selectedValue.value
      );
      focusedIndex.value = selectedIndex >= 0 ? selectedIndex : 0;
    }
  });

  /**
   * Get tabindex for roving tabindex pattern.
   * Only the focused/selected item is tabbable (tabindex="0").
   */
  const getTabIndex = computed(() => (idx: number) => {
    // If nothing is selected, first item is tabbable.
    if (selectedValue?.value === undefined) {
      return idx === 0 ? 0 : -1;
    }
    // Otherwise, the selected item is tabbable.
    const selectedIndex = items.value.findIndex(
      (item) => item.value === selectedValue.value
    );
    return idx === selectedIndex ? 0 : -1;
  });

  /**
   * Update focused index when an item receives focus.
   */
  const handleFocus = (idx: number) => {
    focusedIndex.value = idx;
  };

  /**
   * Move focus to a specific index.
   */
  const moveFocus = (idx: number) => {
    if (idx >= 0 && idx < items.value.length) {
      focusedIndex.value = idx;
      itemRefs.value[idx]?.focus();
    }
  };
  return {
    focusedIndex,
    itemRefs,
    setItemRef,
    getTabIndex,
    handleFocus,
    moveFocus,
  };
}
