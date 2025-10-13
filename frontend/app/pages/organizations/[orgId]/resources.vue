<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <div class="flex flex-col bg-layer-0 px-4 xl:px-8">
    <Head>
      <Title>
        {{ organization.name }}&nbsp;{{ $t("i18n._global.resources_lower") }}
      </Title>
    </Head>
    <HeaderAppPageOrganization
      :header="organization.name + ' ' + $t('i18n._global.resources_lower')"
      :tagline="$t('i18n.pages.organizations._global.resources_tagline')"
      :underDevelopment="false"
    >
      <div class="flex space-x-2 lg:space-x-3">
        <BtnAction
          @click.stop="openModal()"
          @keydown.enter="openModal()"
          ariaLabel="i18n.pages._global.resources.new_resource_aria_label"
          class="w-max"
          :cta="true"
          fontSize="sm"
          iconSize="1.35em"
          label="i18n._global.new_resource"
          :leftIcon="IconMap.PLUS"
          linkTo="/"
        />
        <ModalResourceOrganization />
      </div>
    </HeaderAppPageOrganization>
    <!-- Draggable list -->
    <div v-if="orgStore.organization.resources?.length" class="py-4">
      <draggable
        v-model="resourceListComputed"
        @end="onDragEnd"
        :animation="150"
        chosen-class="sortable-chosen"
        class="flex flex-col gap-4"
        data-testid="organization-resources-list"
        :delay="0"
        :delay-on-touch-start="false"
        direction="vertical"
        :disabled="false"
        :distance="5"
        drag-class="sortable-drag"
        fallback-class="sortable-fallback"
        :fallback-tolerance="0"
        :force-fallback="false"
        ghost-class="sortable-ghost"
        handle=".drag-handle"
        :invert-swap="false"
        item-key="id"
        :swap-threshold="0.5"
        :touch-start-threshold="3"
      >
        <template #item="{ element }">
          <CardResource
            :entityType="EntityType.ORGANIZATION"
            :isReduced="true"
            :resource="element"
          />
        </template>
      </draggable>
    </div>
    <EmptyState v-else class="py-4" pageType="resources" :permission="false" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import draggable from "vuedraggable";

import type { Organization } from "~/types/communities/organization";
import type { Resource } from "~/types/content/resource";

import { EntityType } from "~/types/entity";
import { IconMap } from "~/types/icon-map";

const { openModal } = useModalHandlers("ModalResourceOrganization");
const props = defineProps<{
  organization: Organization;
}>();

const orgStore = useOrganizationStore();

// Use computed property to directly reference store state (single source of truth)
const resourceListComputed = computed({
  get: () => orgStore.organization.resources || [],
  set: (value: Resource[]) => {
    // Update the store directly when draggable changes the order
    orgStore.organization.resources = value;
  },
});

const onDragEnd = async () => {
  // Update order indices before persisting
  const updatedList = resourceListComputed.value.map((resource, index) => ({
    ...resource,
    order: index,
  }));

  // Store now handles optimistic updates and rollback on error
  await orgStore.reorderResource(props.organization, updatedList);
};
</script>

<style scoped>
.sortable-ghost {
  opacity: 0.4;
  transition: opacity 0.05s ease;
}

.sortable-chosen {
  background-color: rgba(0, 0, 0, 0.1);
  transition: background-color 0.05s ease;
}

.sortable-drag {
  transform: rotate(5deg);
  transition: transform 0.05s ease;
}

.sortable-fallback {
  display: none;
}

/* Ensure drag handles work properly. */
.drag-handle {
  user-select: none;
}
</style>
