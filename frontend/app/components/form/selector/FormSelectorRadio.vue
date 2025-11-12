<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div
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
import { toRef } from "vue";

import { useKeyboardNavigation } from "~/composables/useKeyboardNavigation";
import { useRovingFocus } from "~/composables/useRovingFocus";

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

// Focus management with roving tabindex pattern.
const {
  focusedIndex,
  itemRefs: _itemRefs,
  setItemRef: setButtonRef,
  getTabIndex,
  handleFocus,
  moveFocus,
} = useRovingFocus(
  toRef(() => props.options),
  toRef(() => props.modelValue)
);

// Selection logic.
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

// Keyboard navigation (Arrow keys, Home, End, Space, Enter).
const { handleKeyDown } = useKeyboardNavigation({
  items: toRef(() => props.options),
  focusedIndex,
  moveFocus,
  onSelect: (idx: number) => {
    const option = props.options[idx];
    if (option) {
      toggleOption(option.value, idx);
    }
  },
  orientation: "horizontal",
});
</script>
