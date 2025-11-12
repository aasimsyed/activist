// SPDX-License-Identifier: AGPL-3.0-or-later

import type { Ref } from "vue";

/**
 * Keyboard navigation options.
 */
export interface KeyboardNavigationOptions<T> {
  /** Array of items to navigate */
  items: Ref<T[]>;
  /** Current focused index */
  focusedIndex: Ref<number>;
  /** Function to move focus to a specific index */
  moveFocus: (idx: number) => void;
  /** Callback when an item is selected (Space/Enter) */
  onSelect?: (idx: number) => void;
  /** Whether to loop navigation (default: true) */
  loop?: boolean;
  /** Orientation of the navigation (default: 'horizontal') */
  orientation?: "horizontal" | "vertical" | "both";
}

/**
 * Composable for keyboard navigation in groups of interactive elements.
 * Supports Arrow keys, Home, End, Space, and Enter.
 *
 * @param options - Configuration options
 * @returns Keyboard event handler
 *
 * @example
 * const { handleKeyDown } = useKeyboardNavigation({
 *   items: options,
 *   focusedIndex,
 *   moveFocus,
 *   onSelect: toggleOption,
 * });
 */
export function useKeyboardNavigation<T>(
  options: KeyboardNavigationOptions<T>
) {
  const {
    items,
    focusedIndex,
    moveFocus,
    onSelect,
    loop = true,
    orientation = "horizontal",
  } = options;

  /**
   * Handle keyboard events for navigation.
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    const { key } = event;
    const length = items.value.length;

    // Determine navigation keys based on orientation.
    const nextKeys =
      orientation === "vertical"
        ? ["ArrowDown"]
        : orientation === "horizontal"
          ? ["ArrowRight"]
          : ["ArrowRight", "ArrowDown"];

    const prevKeys =
      orientation === "vertical"
        ? ["ArrowUp"]
        : orientation === "horizontal"
          ? ["ArrowLeft"]
          : ["ArrowLeft", "ArrowUp"];

    // Navigate to next item.
    if (nextKeys.includes(key)) {
      event.preventDefault();
      const nextIndex = loop
        ? (focusedIndex.value + 1) % length
        : Math.min(focusedIndex.value + 1, length - 1);
      moveFocus(nextIndex);
    }
    // Navigate to previous item.
    else if (prevKeys.includes(key)) {
      event.preventDefault();
      const prevIndex = loop
        ? (focusedIndex.value - 1 + length) % length
        : Math.max(focusedIndex.value - 1, 0);
      moveFocus(prevIndex);
    }
    // Navigate to first item.
    else if (key === "Home") {
      event.preventDefault();
      moveFocus(0);
    }
    // Navigate to last item.
    else if (key === "End") {
      event.preventDefault();
      moveFocus(length - 1);
    }
    // Select current item.
    else if ((key === " " || key === "Enter") && onSelect) {
      event.preventDefault();
      onSelect(focusedIndex.value);
    }
  };
  return {
    handleKeyDown,
  };
}
