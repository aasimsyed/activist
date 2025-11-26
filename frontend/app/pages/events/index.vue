<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div class="bg-layer-0 px-8">
    <Head>
      <Title>{{ $t("i18n.pages.events.index.header_title") }} </Title>
    </Head>
    <HeaderAppPage
      :header="$t('i18n.pages.events.index.header_title')"
      :tagline="$t('i18n.pages.events.index.subheader')"
    >
      <div class="flex flex-col space-x-3 sm:flex-row">
        <ComboboxTopics
          @update:selectedTopics="handleSelectedTopicsUpdate"
          :receivedSelectedTopics="selectedTopics"
        />
      </div>
    </HeaderAppPage>
    <Loading
      v-if="pending && !loadingFetchMore"
      :loading="pending && !loadingFetchMore"
    />
    <div v-else-if="showEvents">
      <EventsList v-if="viewType === ViewType.LIST" :events="events" />
      <EventsMap v-else-if="viewType === ViewType.MAP" :events="events" />
      <EventsCalendar
        v-else-if="viewType === ViewType.CALENDAR"
        :events="events"
      />
      <!-- The bottom sentinel for Intersection Observer. -->
      <div ref="bottomSentinel">
        <Loading
          v-if="loadingFetchMore && pending"
          :loading="loadingFetchMore && pending"
        />
      </div>
    </div>
    <EmptyState v-else pageType="events" :permission="false" />
  </div>
</template>

<script setup lang="ts">
/* eslint-disable no-console */
const viewType = ref<ViewType>(ViewType.MAP);
const route = useRoute();
const router = useRouter();
const loadingFetchMore = ref(false);

const filters = computed<EventFilters>(() => {
  const { view, ...rest } = route.query; // omit view
  return rest as unknown as EventFilters;
});
const selectedTopics = ref<TopicEnum[]>([]);
watch(
  () => route.query.topics,
  (newVal, oldVal) => {
    console.log("[HEADER TOPICS WATCHER] Route query.topics changed:", {
      oldVal,
      newVal,
      url: window.location.href,
    });
    if (Array.isArray(newVal)) {
      selectedTopics.value = newVal as TopicEnum[];
    } else if (typeof newVal === "string") {
      selectedTopics.value = [newVal as TopicEnum];
    } else {
      selectedTopics.value = [];
    }
    console.log(
      "[HEADER TOPICS WATCHER] Updated selectedTopics.value to:",
      selectedTopics.value
    );
  },
  { immediate: true }
);
const handleSelectedTopicsUpdate = (selectedTopics: TopicEnum[]) => {
  console.log("[HEADER TOPICS UPDATE] Called with:", selectedTopics);
  console.log("[HEADER TOPICS UPDATE] Current route query:", route.query);
  console.log("[HEADER TOPICS UPDATE] Current URL:", window.location.href);
  const query = { ...route.query };
  if (selectedTopics.length > 0) {
    query.topics = selectedTopics;
  } else {
    delete query.topics;
  }
  console.log("[HEADER TOPICS UPDATE] Replacing route with query:", query);
  router.replace({ query });
  console.log("[HEADER TOPICS UPDATE] router.replace called");
};

watch(
  filters,
  () => {
    // Reset loading more state when filters change.
    loadingFetchMore.value = false;
  },
  { immediate: true, deep: true }
);
const { data: events, pending, getMore } = useGetEvents(filters);

const bottomSentinel = ref<HTMLElement | null>(null);
const canFetchMore = computed(() => viewType.value === ViewType.LIST);
const changeFetchMore = () => {
  loadingFetchMore.value = true;
};

useCustomInfiniteScroll({
  sentinel: bottomSentinel,
  fetchMore: getMore,
  canFetchMore,
  callback: changeFetchMore,
});

const showEvents = computed(() => {
  if (events.value.length > 0) {
    if (loadingFetchMore.value) {
      return true;
    }
    return !pending.value;
  }
  return false;
});

watchEffect(() => {
  const q = route.query.view;
  if (
    typeof q === "string" &&
    Object.values(ViewType).includes(q as ViewType)
  ) {
    viewType.value = q as ViewType;
  }
});
</script>
