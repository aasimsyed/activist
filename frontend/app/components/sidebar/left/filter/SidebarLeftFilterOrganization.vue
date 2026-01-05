<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <Form
    @submit="handleSubmit"
    class="px-1"
    :initial-values="formData"
    :is-there-submit-button="false"
    :schema="schema"
    :send-on-change="true"
  >
    <FormItem
      v-slot="{ id, handleChange, handleBlur, errorMessage, value }"
      :label="$t('i18n._global.location')"
      name="location"
    >
      <!-- prettier-ignore-attribute :modelValue -->
      <FormTextInputSearch
        :id="id"
        @blur="handleBlur"
        @update:modelValue="handleChange"
        :ariaLabel="
          $t(
            'i18n.components.sidebar.left.filter._global.search_button_aria_label'
          )
        "
        :hasError="!!errorMessage.value"
        :label="
          $t('i18n.components.sidebar.left.filter._global.filter_by_location')
        "
        :modelValue="(value.value as string)"
      />
    </FormItem>
    <FormItem
      v-slot="{ id, handleChange, value }"
      :label="$t('i18n.components._global.topics')"
      name="topics"
    >
      <!-- prettier-ignore-attribute :selected-topics -->
      <FormSelectorComboboxTopics
        :id="id"
        @update:selectedOptions="
          (val: unknown) => handleChange(val as TopicEnum[])
        "
        :label="$t('i18n.components._global.topics')"
        :selected-topics="((value.value ?? []) as TopicEnum[])"
      />
    </FormItem>
  </Form>
</template>

<script setup lang="ts">
import type { LocationQueryRaw } from "vue-router";

import { z } from "zod";

const schema = z.object({
  location: z.string().optional(),
  topics: z.array(z.string()).optional(),
});
const route = useRoute();
const router = useRouter();
const formData = ref({});

// Track if this is the initial mount to prevent race condition with old query params
const isInitialMount = ref(true);

watch(
  route,
  (form) => {
    formData.value = { ...form.query };
  },
  { immediate: true }
);

// After initial mount, allow form submissions
onMounted(() => {
  // Use nextTick to ensure the form has initialized before allowing submissions
  nextTick(() => {
    isInitialMount.value = false;
  });
});

const handleSubmit = (_values: unknown) => {
  // Skip submission on initial mount to prevent query params from persisting
  // across route changes (race condition where old route.query is read before update)
  if (isInitialMount.value) {
    return;
  }

  const values: LocationQueryRaw = {};
  const input = (_values || {}) as Record<string, LocationQueryRaw[string]>;
  Object.keys(input).forEach((key) => {
    if (input[key] && input[key] !== "") {
      if (
        key === "topics" &&
        Array.isArray(input[key]) &&
        input[key].length === 0
      ) {
        return;
      }
      values[key] = input[key];
    }
    if (route.query.name && route.query.name !== "")
      values["name"] = route.query.name;
  });
  router.push({
    query: values, // use the normalized values object
  });
};
</script>
