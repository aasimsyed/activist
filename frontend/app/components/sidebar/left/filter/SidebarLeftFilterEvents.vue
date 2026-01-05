<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div class="flex w-full flex-col space-y-2" data-testid="events-filter">
    <div
      class="flex w-full flex-col items-center"
      data-testid="events-filter-view-type"
    >
      <FormSelectorRadio
        v-if="!sidebar.collapsed || !sidebar.collapsedSwitch"
        @update:modelValue="updateViewType"
        :model-value="viewType"
        :options="optionViews"
      />
    </div>
    <Form
      @submit="handleSubmit"
      class="px-1"
      :initial-values="formData"
      :is-there-submit-button="false"
      :schema="schema"
      :send-on-change="true"
    >
      <FormItem
        v-slot="{ id, handleChange, value }"
        data-testid="events-filter-days"
        :label="$t('i18n.components.sidebar_left_filter_events.days_ahead')"
        name="days"
      >
        <!-- prettier-ignore-attribute :modelValue -->
        <FormSelectorRadio
          :id="id"
          @update:modelValue="handleChange"
          :modelValue="(value.value as string)"
          :options="optionDays"
        />
      </FormItem>
      <FormItem
        v-slot="{ id, handleChange, value }"
        data-testid="events-filter-event-type"
        :label="$t('i18n.components._global.event_type')"
        name="type"
      >
        <!-- prettier-ignore-attribute :modelValue -->
        <FormSelectorRadio
          :id="id"
          @update:modelValue="handleChange"
          :modelValue="(value.value as string)"
          :options="optionEventTypes"
        />
      </FormItem>
      <FormItem
        v-slot="{ id, handleChange, value }"
        data-testid="events-filter-location-type"
        :label="$t('i18n.components._global.location_type')"
        name="setting"
      >
        <!-- prettier-ignore-attribute :modelValue -->
        <FormSelectorRadio
          :id="id"
          @update:modelValue="handleChange"
          :modelValue="(value.value as string)"
          :options="optionLocations"
        />
      </FormItem>
      <FormItem
        v-slot="{ id, handleChange, handleBlur, errorMessage, value }"
        data-testid="events-filter-location"
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
        data-testid="events-filter-topics"
        :label="$t('i18n.components._global.topics')"
        name="topics"
      >
        <!-- prettier-ignore-attribute :selected-options -->
        <FormSelectorCombobox
          :id="id"
          @update:selectedOptions="
            (val: unknown) => handleChange(val as TopicEnum[])
          "
          :label="$t('i18n.components._global.topics')"
          :options="optionsTopics"
          :selected-options="((value.value ?? []) as TopicEnum[])"
        />
      </FormItem>
    </Form>
  </div>
</template>

<script setup lang="ts">
 
import type { LocationQueryRaw } from "vue-router";

import { z } from "zod";

const { t } = useI18n();

const optionsTopics = GLOBAL_TOPICS.map((topic, index) => ({
  label: t(topic.label),
  value: topic.topic,
  id: index,
}));
const schema = z.object({
  days: z.string().optional(),
  location: z.string().optional(),
  topics: z.array(z.string()).optional(),
  type: z.string().optional(),
  setting: z.string().optional(),
  viewType: z.string().optional(),
});
const sidebar = useSidebar();

const optionViews = [
  {
    value: ViewType.LIST,
    key: "list",
    content: IconMap.LIST_UNORDERED,
    aria_label: "i18n.components.sidebar_left_filter_events.view_type_list",
    isIcon: true,
  },
  {
    value: ViewType.MAP,
    key: "map",
    content: IconMap.PIN_MAP_FILL,
    aria_label: "i18n.components.sidebar_left_filter_events.view_type_map",
    isIcon: true,
  },
  {
    value: ViewType.CALENDAR,
    key: "calendar",
    content: IconMap.CALENDAR_DATE_FILL,
    aria_label: "i18n.components.sidebar_left_filter_events.view_type_calendar",
    isIcon: true,
  },
];

const optionDays = [
  {
    value: "1",
    key: "1",
    content: "1",
    aria_label: "i18n.components.sidebar_left_filter_events.days_1_aria_label",
  },
  {
    value: "7",
    key: "7",
    content: "7",
    aria_label: "i18n.components.sidebar_left_filter_events.days_7_aria_label",
  },
  {
    value: "30",
    key: "30",
    content: "30",
    aria_label: "i18n.components.sidebar_left_filter_events.days_30_aria_label",
  },
];

const optionEventTypes = [
  {
    value: "learn",
    key: "LEARN",
    content: t("i18n.components._global.learn"),
    aria_label: "i18n.components._global.event_type_learn_aria_label",
    checkedClass: "style-learn",
  },
  {
    value: "action",
    key: "ACTION",
    content: t("i18n.components._global.action"),
    aria_label: "i18n.components._global.event_type_action_aria_label",
    checkedClass: "style-action",
  },
];

const optionLocations = [
  {
    value: "physical",
    key: "PHYSICAL",
    content: t("i18n.components._global.location_type_physical"),
    aria_label: "i18n.components._global.location_type_physical_aria_label",
    class: "text-nowrap",
  },
  {
    value: "online",
    key: "ONLINE",
    content: t("i18n.components._global.location_type_online"),
    aria_label: "i18n.components._global.location_type_online_aria_label",
    class: "text-nowrap",
  },
];

const route = useRoute();
const router = useRouter();
const updateViewType = (
  value: string | number | boolean | Record<string, unknown> | undefined
) => {
  if (
    typeof value === "string" &&
    Object.values(ViewType).includes(value as ViewType)
  ) {
    viewType.value = value as ViewType;
    router.push({
      query: {
        ...route.query,
        view: value,
      },
    });
    return;
  }
};

const viewType = ref(ViewType.MAP);
const formData = ref({});
const isSubmitting = ref(false);
const pendingQuery = ref<LocationQueryRaw | null>(null);
const lastSubmittedQuery = ref<string | null>(null);

// Helper function to normalize query objects for comparison
const normalizeQuery = (query: LocationQueryRaw): LocationQueryRaw => {
  const normalized: LocationQueryRaw = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === null || value === undefined || value === "") {
      continue;
    }
    // Sort arrays for consistent comparison
    if (Array.isArray(value)) {
      normalized[key] = [...value].sort();
    } else {
      normalized[key] = value;
    }
  }
  return normalized;
};

// Watch route changes and update formData, but skip during form submission
watch(
  route,
  (form) => {
    // Skip route watcher updates if we're currently submitting to prevent circular updates
    if (isSubmitting.value && pendingQuery.value) {
      // Check if this route change matches what we just submitted
      const currentRouteQuery = normalizeQuery(form.query as LocationQueryRaw);
      const normalizedPendingQuery = normalizeQuery(pendingQuery.value);

      if (
        JSON.stringify(normalizedPendingQuery) ===
        JSON.stringify(currentRouteQuery)
      ) {
        // This is our own submission completing
        const { view, ...rest } = (form.query as Record<string, unknown>) || {};
        pendingQuery.value = null;
        // Update viewType and formData immediately to keep form in sync
        viewType.value =
          typeof view === "string" &&
          Object.values(ViewType).includes(view as ViewType)
            ? (view as ViewType)
            : ViewType.MAP;
        formData.value = { ...rest };
        // Clear submission flag after formData is updated, but use nextTick to prevent immediate re-submit
        nextTick(() => {
          isSubmitting.value = false;
          // Clear lastSubmittedQuery after a short delay to prevent immediate duplicate submissions
          setTimeout(() => {
            lastSubmittedQuery.value = null;
          }, 300);
        });
        return;
      }
      // Always return during submission to prevent formData updates
      return;
    }
    const { view, ...rest } = (form.query as Record<string, unknown>) || {};
    const topics = normalizeArrayFromURLQuery(form.query.topics);
    formData.value = { ...rest, topics };
    viewType.value =
      typeof view === "string" &&
      Object.values(ViewType).includes(view as ViewType)
        ? (view as ViewType)
        : ViewType.MAP;
  },
  { immediate: true }
);

// Core submit logic
const performSubmit = (_values: unknown) => {
  // Block submissions if we're already submitting to prevent race conditions
  if (isSubmitting.value) {
    return;
  }

  // Set submitting flag to prevent route watcher from interfering
  isSubmitting.value = true;

  // IMPORTANT: If the incoming values would produce the exact same query as current route,
  // skip submission entirely to prevent unnecessary navigation
  const currentRouteQuery = normalizeQuery(route.query as LocationQueryRaw);

  try {
    const values: Record<string, unknown> = {};
    const input = (_values || {}) as Record<string, unknown>;

    // Build the values object from input
    Object.keys(input).forEach((key) => {
      if (input[key] && input[key] !== "") {
        if (key === "days") {
          values["days_ahead"] = input[key];
          return;
        }
        if (
          key === "topics" &&
          Array.isArray(input[key]) &&
          input[key].length === 0
        ) {
          return;
        }
        if (key === "view") return;
        values[key] = input[key];
      }
      if (route.query.name && route.query.name !== "")
        values["name"] = route.query.name;
    });

    // IMPORTANT: If topics is missing or empty in input, preserve it from route.query or pendingQuery
    // to prevent clearing topics unintentionally
    const inputTopics = input.topics;
    if (
      !values.topics ||
      (Array.isArray(inputTopics) && inputTopics.length === 0)
    ) {
      // First check pendingQuery (if we just submitted with topics), then fall back to route.query
      if (pendingQuery.value?.topics) {
        values.topics = pendingQuery.value.topics;
      } else if (route.query.topics) {
        values.topics = route.query.topics;
      }
    }

    // Build the new query object
    const newQuery: LocationQueryRaw = {
      ...(values as LocationQueryRaw),
      view: viewType.value,
    };

    // Normalize and compare queries to prevent unnecessary navigation
    const normalizedNewQuery = normalizeQuery(newQuery);
    const newQueryString = JSON.stringify(normalizedNewQuery);

    // Check if this submission would produce the same query as current route
    const queryMatchesCurrentRoute =
      newQueryString === JSON.stringify(currentRouteQuery);

    // Prevent submitting the same query twice in quick succession
    if (lastSubmittedQuery.value === newQueryString) {
      isSubmitting.value = false;
      pendingQuery.value = null;
      return;
    }

    // If query matches current route exactly, no need to navigate
    if (queryMatchesCurrentRoute) {
      isSubmitting.value = false;
      pendingQuery.value = null;
      return;
    }

    // Store the query we're about to push so route watcher can recognize it
    pendingQuery.value = newQuery;
    lastSubmittedQuery.value = newQueryString;
    router.push({
      query: newQuery,
    });
    // Don't clear isSubmitting here - let the route watcher do it when it sees the change
  } catch (error) {
    isSubmitting.value = false;
    throw error;
  }
};

// Use a ref to store the latest values, avoiding closure issues
const latestSubmissionValues = ref<unknown>(null);
let submissionTimeout: ReturnType<typeof setTimeout> | null = null;

const handleSubmit = (_values: unknown) => {
  // Ignore submissions entirely if we're already in the middle of processing one
  // This prevents any submissions from queuing up while we're handling navigation
  if (isSubmitting.value) {
    return;
  }

  // Always store the latest values
  latestSubmissionValues.value = _values;

  // Cancel any pending submission
  if (submissionTimeout) {
    clearTimeout(submissionTimeout);
    submissionTimeout = null;
  }

  // Use a short delay to batch rapid changes, always using the latest values
  submissionTimeout = setTimeout(() => {
    // Double-check we're not submitting (might have started during the timeout)
    if (!isSubmitting.value && latestSubmissionValues.value !== null) {
      performSubmit(latestSubmissionValues.value);
      latestSubmissionValues.value = null;
    }
    submissionTimeout = null;
  }, 100);
};
</script>
