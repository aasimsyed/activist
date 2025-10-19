// SPDX-License-Identifier: AGPL-3.0-or-later
import { useModals } from "~/stores/modals";

export function useModalHandlers(modalName: string) {
  const modals = useModals();

  const openModal = (params?: unknown) => {
    modals.openModalAndUpdateState(modalName, params);
  };
  const handleCloseModal = () => {
    console.log("handleCloseModal called for modal:", modalName);
    const result = modals.closeModalAndUpdateState(modalName);
    console.log("closeModalAndUpdateState result:", result);
    return result;
  };

  return {
    openModal,
    handleCloseModal,
  };
}
