<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <Combobox :id="id" v-model="internalSelectedOptions" as="div" multiple>
    <div class="relative">
      <ComboboxInput v-slot="{ id: inputId, onBlur }" as="div" class="flex">
        <FormTextInput
          :id="inputId"
          @click="handleInputFocus"
          @focus="handleInputFocus"
          @update:modelValue="(val) => (query = val)"
          :label="label"
          :modelValue="query"
          :onBlur="onBlur"
          :placeholder="label"
        />
      </ComboboxInput>
      <!-- Hidden button used only for programmatic control to open combobox -->
      <ComboboxButton
        :ref="
          (el: unknown) => {
            comboboxButtonRef = el as HTMLElement | null;
          }
        "
        :aria-hidden="true"
        class="hidden"
        tabindex="-1"
      />
    </div>
    <ComboboxOptions :id="`${id}-options`">
      <ComboboxOption
        v-for="option in filteredOptions"
        :key="option.id"
        v-slot="{ selected, active }"
        as="template"
        :value="option"
      >
        <li
          class="relative cursor-default select-none py-2 pl-10 pr-4"
          :class="{
            'bg-cta-orange/80 text-primary-text dark:bg-cta-orange/40 dark:text-cta-orange':
              active,
            'text-primary-text': !active,
          }"
        >
          <span class="block truncate">
            {{ $t(option.label) }}
          </span>
          <span
            v-if="selected"
            class="absolute inset-y-0 left-0 flex items-center pl-3"
            :class="{
              'text-primary-text dark:text-cta-orange': active,
              'text-cta-orange dark:text-cta-orange': !active,
            }"
          >
            <Icon :name="IconMap.CHECK" />
          </span>
        </li>
      </ComboboxOption>
    </ComboboxOptions>
    <ul
      v-if="internalSelectedOptions.length > 0"
      class="mt-2 flex"
      :class="{
        'flex-col space-y-2': hasColOptions,
        'space-x-1': !hasColOptions,
      }"
    >
      <li v-for="option in internalSelectedOptions" :key="option.id">
        <Shield
          :key="option.id + '-selected-only'"
          @click="() => onClick(option)"
          :active="true"
          class="mobileTopic max-sm:w-full"
          :icon="IconMap.GLOBE"
          :isSelector="true"
          :label="option.label"
        />
      </li>
    </ul>
  </Combobox>
</template>

<script setup lang="ts">
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions,
} from "@headlessui/vue";

interface Option {
  id: number | string;
  label: string;
  value: unknown;
}

interface Props {
  options: Option[];
  selectedOptions: unknown[];
  id: string;
  label: string;
  hasColOptions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  hasColOptions: true,
});
const query = ref("");
const comboboxButtonRef = ref<HTMLElement | null>(null);

const onClick = (option: Option) => {
  internalSelectedOptions.value = internalSelectedOptions.value.filter(
    (o: Option) => o.id !== option.id
  );
};

const emit = defineEmits<{
  (e: "update:selectedOptions", value: unknown[]): void;
}>();

function handleInputFocus() {
  // When input is focused or clicked, ensure the combobox opens to display all options.
  // Headless UI's Combobox in multiple mode doesn't automatically open on focus,
  // so we programmatically click the hidden button to trigger it.
  setTimeout(() => {
    const optionsElement = document.getElementById(`${props.id}-options`);
    const isVisible = optionsElement?.offsetParent;

    // If the dropdown is not visible, click the hidden button to open it.
    if (!isVisible && comboboxButtonRef.value) {
      comboboxButtonRef.value.click();
    }
  }, 100);
}

const filteredOptions = computed(() =>
  query.value !== ""
    ? props.options.filter((option: Option) =>
        option.label.toLowerCase().includes(query.value.toLowerCase())
      )
    : props.options
);

const internalSelectedOptions = computed({
  get() {
    if (props.selectedOptions && props.selectedOptions.length === 0) {
      return [];
    }
    // Always compute from prop.
    return props.options.filter((option: Option) =>
      (props.selectedOptions as unknown[]).includes(option.value)
    );
  },
  set(newOptions) {
    const values = (newOptions as Option[]).map((option) => option.value);
    // Only emit if value actually changed.
    if (JSON.stringify(values) !== JSON.stringify(props.selectedOptions)) {
      emit("update:selectedOptions", values);
    }
  },
});
</script>
