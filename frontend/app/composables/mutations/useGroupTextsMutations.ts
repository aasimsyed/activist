// SPDX-License-Identifier: AGPL-3.0-or-later
// Mutation composable for FAQ entries - uses direct service calls, not useAsyncData.

import type { MaybeRef } from "vue";

import type { GroupUpdateTextFormData } from "~/types/communities/group";
import type { AppError } from "~/utils/errorHandler";

import { updateGroupTexts } from "~/services/communities/group/text";
import { updateGroup } from "~/services/communities/group/group";

import { getKeyForGetGroup } from "../queries/useGetGroup";

export function useGroupTextsMutations(groupId: MaybeRef<string>) {
  const { showToastError } = useToaster();

  const loading = ref(false);
  const error = ref<Error | null>(null);

  const currentGroupId = computed(() => unref(groupId));

  // Update group texts.
  async function updateTexts(
    textsData: GroupUpdateTextFormData,
    textId: string
  ) {
    if (!currentGroupId.value) {
      return false;
    }

    loading.value = true;
    error.value = null;
    try {
      // Update GroupText model (description, getInvolved, donate_prompt)
      await updateGroupTexts(currentGroupId.value, textId, {
        description: textsData.description,
        getInvolved: textsData.getInvolved,
        getInvolvedUrl: "", // This field is ignored by GroupText endpoint
      });

      // Update Group model (getInvolvedUrl)
      if (textsData.getInvolvedUrl !== undefined) {
        await updateGroup(currentGroupId.value, {
          getInvolvedUrl: textsData.getInvolvedUrl,
        });
      }

      // Refresh the group data to get the updated texts.
      await refreshGroupData();
      return true;
    } catch (err) {
      showToastError((err as AppError).message);
      return false;
    } finally {
      loading.value = false;
    }
  }
  // Helper to refresh group data after mutations.
  async function refreshGroupData() {
    if (!currentGroupId.value) {
      return;
    }

    // Invalidate the useAsyncData cache so next read will refetch.
    await refreshNuxtData(getKeyForGetGroup(currentGroupId.value));
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    updateTexts,
    refreshGroupData,
  };
}
