// SPDX-License-Identifier: AGPL-3.0-or-later

export const useEventMutations = () => {
  const loading = ref(false);
  const { error, handleError, clearError } = useAppError();
  const store = useEventListStore();

  const create = async (eventData: CreateEventInput) => {
    loading.value = true;
    clearError();
    try {
      const event = await createEvent(eventData);
      await refreshEventList();
      return event;
    } catch (e) {
      handleError(e);
      return false;
    } finally {
      loading.value = false;
    }
  };
  const refreshEventList = async () => {
    store.setItems([]);
    store.setIsLastPage(false);
    await refreshNuxtData(getKeyForGetEvents());
  };

  return {
    loading: readonly(loading),
    error: readonly(error),
    create,
    refreshEventList,
  };
};
