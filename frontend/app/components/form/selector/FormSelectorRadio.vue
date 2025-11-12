<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div
    ref="groupRef"
    @keydown="handleKeyDown"
    :aria-label="$t('i18n.components.form_selector_radio.title_aria_label')"
    class="flex h-10 w-full px-1"
    role="radiogroup"
  >
    <button
      v-for="(option, idx) in options"
      :key="option.key"
      :ref="(el) => setButtonRef(el as HTMLButtonElement, idx)"
      @click="toggleOption(option.value, idx)"
      @focus="handleFocus(idx)"
      :aria-checked="isOptionChecked(option)"
      :aria-label="$t(option.aria_label)"
      class="flex flex-1 cursor-pointer items-center justify-center rounded-none"
      :class="[
        {
          'style-menu-option-cta': isOptionChecked(option),
          'style-menu-option bg-layer-2': !isOptionChecked(option),
          'rounded-l-lg': idx === 0,
          'rounded-r-lg': idx === options.length - 1,
        },
        option.class,
        {
          [option.checkedClass || '']: isOptionChecked(option),
        },
      ]"
      role="radio"
      :tabindex="getTabIndex(idx)"
      type="button"
    >
      <Icon
        v-if="option.isIcon"
        :aria-hidden="true"
        class="h-6 w-6"
        :name="option.content as string"
      />
      <span v-else class="text-sm font-medium" :class="option.class">
        {{ option.content }}
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUpdate } from "vue";

type Option = {
  value: string | number | boolean | Record<string, unknown> | undefined;
  key: string;
  content: HTMLElement | string;
  aria_label: string;
  label?: string;
  isIcon?: boolean;
  class?: string;
  checkedClass?: string;
};

const props = defineProps<{
  modelValue: string | number | boolean | Record<string, unknown> | undefined;
  options: Option[];
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: typeof props.modelValue): void;
}>();

// Refs for keyboard navigation and focus management.
const groupRef = ref<HTMLDivElement | null>(null);
const buttonRefs = ref<(HTMLButtonElement | null)[]>([]);
const focusedIndex = ref<number>(0);

// Track button refs.
const setButtonRef = (el: HTMLButtonElement | null, idx: number) => {
  if (el) {
    buttonRefs.value[idx] = el;
  }
};

// Clear button refs before update.
onBeforeUpdate(() => {
  buttonRefs.value = [];
});

// Set initial focus index.
onMounted(() => {
  // Focus on the selected option, or the first option if none selected.
  const selectedIndex = props.options.findIndex(
    (opt) => opt.value === props.modelValue
  );
  focusedIndex.value = selectedIndex >= 0 ? selectedIndex : 0;
});

const toggleOption = (optionValue: Option["value"], idx: number) => {
  focusedIndex.value = idx;

  // If clicking the currently selected option, deselect it.
  if (props.modelValue === optionValue) {
    emit("update:modelValue", undefined);
  } else {
    emit("update:modelValue", optionValue);
  }
};

const isOptionChecked = (option: Option) => {
  return props.modelValue === option.value;
};

// Roving tabindex: only the focused button is tabbable.
const getTabIndex = (idx: number) => {
  // If nothing is selected, first button is tabbable.
  if (props.modelValue === undefined) {
    return idx === 0 ? 0 : -1;
  }
  // Otherwise, the selected button is tabbable.
  const selectedIndex = props.options.findIndex(
    (opt) => opt.value === props.modelValue
  );
  return idx === selectedIndex ? 0 : -1;
};

const handleFocus = (idx: number) => {
  focusedIndex.value = idx;
};

// Keyboard navigation (Arrow keys, Home, End, Space, Enter).
const handleKeyDown = (event: KeyboardEvent) => {
  const { key } = event;

  // Arrow key navigation.
  if (key === "ArrowRight" || key === "ArrowDown") {
    event.preventDefault();
    const nextIndex = (focusedIndex.value + 1) % props.options.length;
    focusedIndex.value = nextIndex;
    buttonRefs.value[nextIndex]?.focus();
  } else if (key === "ArrowLeft" || key === "ArrowUp") {
    event.preventDefault();
    const prevIndex =
      (focusedIndex.value - 1 + props.options.length) % props.options.length;
    focusedIndex.value = prevIndex;
    buttonRefs.value[prevIndex]?.focus();
  }
  // Home/End keys.
  else if (key === "Home") {
    event.preventDefault();
    focusedIndex.value = 0;
    buttonRefs.value[0]?.focus();
  } else if (key === "End") {
    event.preventDefault();
    const lastIndex = props.options.length - 1;
    focusedIndex.value = lastIndex;
    buttonRefs.value[lastIndex]?.focus();
  }
  // Space/Enter to toggle.
  else if (key === " " || key === "Enter") {
    event.preventDefault();
    const currentOption = props.options[focusedIndex.value];
    if (currentOption) {
      toggleOption(currentOption.value, focusedIndex.value);
    }
  }
};
</script>
