<!-- SPDX-License-Identifier: AGPL-3.0-or-later -->
<template>
  <Disclosure v-slot="{ open }" as="div" class="card-style">
    <div data-testid="faq-card">
      <DisclosureButton
        class="w-full rounded-md px-4 py-2 focus-brand"
        data-testid="faq-disclosure-button"
      >
        <div
          class="flex gap-3"
          :class="{ 'items-center': !open, 'items-start': open }"
        >
          <Icon
            :aria-label="$t('i18n.components._global.draggable_element')"
            class="drag-handle -mr-2 cursor-grab select-none"
            data-testid="faq-drag-handle"
            :name="IconMap.GRIP"
            size="1em"
          />
          <div class="flex text-primary-text">
            <Icon
              v-if="open"
              data-testid="faq-chevron-up"
              :name="IconMap.CHEVRON_UP"
            />
            <Icon
              v-else
              data-testid="faq-chevron-down"
              :name="IconMap.CHEVRON_DOWN"
            />
          </div>
          <div class="flex-col">
            <div
              class="flex select-text items-center gap-3 text-left text-primary-text md:gap-4"
            >
              <div
                class="min-w-0 flex-1"
                @click.stop="
                  console.log(
                    'CardFAQEntry: FAQ question area clicked for FAQ:',
                    props.faqEntry.id,
                    'viewport:',
                    typeof window !== 'undefined' ? window.innerWidth : 'SSR'
                  );
                  // Prevent edit modal from opening when clicking on FAQ question area
                  $event.stopPropagation();
                "
              >
                <p
                  data-testid="faq-question"
                  class="cursor-pointer transition-colors hover:text-primary-text/80"
                >
                  {{ faqEntry.question }}
                </p>
              </div>
              <div class="ml-2 flex-shrink-0">
                <IconEdit
                  @click.stop="
                    useModalHandlers(
                      `ModalFaqEntry${props.pageType.charAt(0).toUpperCase() + props.pageType.slice(1)}` +
                        props.faqEntry.id
                    ).openModal()
                  "
                  @keydown.enter="
                    useModalHandlers(
                      `ModalFaqEntry${props.pageType.charAt(0).toUpperCase() + props.pageType.slice(1)}` +
                        props.faqEntry.id
                    ).openModal()
                  "
                  class="flex rounded p-1 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
                  data-testid="faq-edit-button"
                />
              </div>
              <ModalFaqEntryOrganization
                v-if="pageType === 'organization'"
                :faqEntry="faqEntry"
              />
              <ModalFaqEntryGroup
                v-else-if="pageType === 'group'"
                :faqEntry="faqEntry"
              />
              <ModalFaqEntryEvent
                v-else-if="pageType === 'event'"
                :faqEntry="faqEntry"
              />
            </div>
          </div>
        </div>
      </DisclosureButton>
      <DisclosurePanel
        class="mt-2 border-t border-section-div py-2 focus-within:border-0"
        data-testid="faq-disclosure-panel"
      >
        <p class="select-text text-left" data-testid="faq-answer">
          {{ faqEntry.answer }}
        </p>
      </DisclosurePanel>
    </div>
  </Disclosure>
</template>

<script setup lang="ts">
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";

import type { FaqEntry } from "~/types/content/faq-entry";

import { IconMap } from "~/types/icon-map";

const props = defineProps<{
  faqEntry: FaqEntry;
  pageType: "organization" | "group" | "event";
}>();
</script>
