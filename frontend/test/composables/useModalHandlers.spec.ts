// SPDX-License-Identifier: AGPL-3.0-or-later
import { setActivePinia, createPinia } from "pinia";
import { describe, it, expect, beforeEach, vi } from "vitest";

import { useModalHandlers } from "~/composables/useModalHandlers";
import { useModals } from "~/stores/modals";

describe("useModalHandlers", () => {
  beforeEach(() => {
    // Create a fresh pinia instance for each test
    setActivePinia(createPinia());
  });

  // MARK: - Basic Functionality

  describe("Basic functionality", () => {
    it("returns openModal and handleCloseModal functions", () => {
      const { openModal, handleCloseModal } = useModalHandlers("TestModal");

      expect(openModal).toBeTypeOf("function");
      expect(handleCloseModal).toBeTypeOf("function");
    });

    it("creates handlers for specific modal name", () => {
      const modalName = "MySpecificModal";
      const { openModal } = useModalHandlers(modalName);

      openModal();

      const modals = useModals();
      expect(modals.modals[modalName]).toBeDefined();
      expect(modals.modals[modalName].isOpen).toBe(true);
    });

    it("can be called multiple times for different modals", () => {
      const modal1 = useModalHandlers("Modal1");
      const modal2 = useModalHandlers("Modal2");

      expect(modal1.openModal).not.toBe(modal2.openModal);
      expect(modal1.handleCloseModal).not.toBe(modal2.handleCloseModal);
    });
  });

  // MARK: - Opening Modals

  describe("openModal", () => {
    it("opens a modal without parameters", () => {
      const modalName = "TestModal";
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal();

      expect(modals.modals[modalName]).toBeDefined();
      expect(modals.modals[modalName].isOpen).toBe(true);
    });

    it("opens a modal with parameters", () => {
      const modalName = "TestModal";
      const params = { userId: 123, action: "edit" };
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(params);

      expect(modals.modals[modalName].isOpen).toBe(true);
      expect(modals.modals[modalName].data).toEqual(params);
    });

    it("opens a modal with string parameter", () => {
      const modalName = "TestModal";
      const params = "simple string";
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(params);

      expect(modals.modals[modalName].data).toBe(params);
    });

    it("opens a modal with number parameter", () => {
      const modalName = "TestModal";
      const params = 42;
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(params);

      expect(modals.modals[modalName].data).toBe(params);
    });

    it("opens a modal with array parameter", () => {
      const modalName = "TestModal";
      const params = [1, 2, 3, "test"];
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(params);

      expect(modals.modals[modalName].data).toEqual(params);
    });

    it("opens a modal with complex object parameter", () => {
      const modalName = "TestModal";
      const params = {
        user: { id: 1, name: "Test User" },
        settings: { theme: "dark", notifications: true },
        metadata: ["tag1", "tag2"],
      };
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(params);

      expect(modals.modals[modalName].data).toEqual(params);
    });

    it("closes other modals when opening a new one", () => {
      const modal1 = useModalHandlers("Modal1");
      const modal2 = useModalHandlers("Modal2");
      const modals = useModals();

      modal1.openModal();
      expect(modals.modals.Modal1.isOpen).toBe(true);

      modal2.openModal();
      expect(modals.modals.Modal1.isOpen).toBe(false);
      expect(modals.modals.Modal2.isOpen).toBe(true);
    });

    it("can reopen the same modal after closing", () => {
      const modalName = "TestModal";
      const { openModal, handleCloseModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal();
      expect(modals.modals[modalName].isOpen).toBe(true);

      handleCloseModal();
      expect(modals.modals[modalName].isOpen).toBe(false);

      openModal();
      expect(modals.modals[modalName].isOpen).toBe(true);
    });

    it("updates parameters when opening already open modal", () => {
      const modalName = "TestModal";
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal({ action: "create" });
      expect(modals.modals[modalName].data).toEqual({ action: "create" });

      openModal({ action: "edit", id: 123 });
      expect(modals.modals[modalName].data).toEqual({
        action: "edit",
        id: 123,
      });
    });
  });

  // MARK: - Closing Modals

  describe("handleCloseModal", () => {
    it("closes an open modal", () => {
      const modalName = "TestModal";
      const { openModal, handleCloseModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal();
      expect(modals.modals[modalName].isOpen).toBe(true);

      handleCloseModal();
      expect(modals.modals[modalName].isOpen).toBe(false);
    });

    it("can be called on a modal that was never opened", () => {
      const modalName = "NeverOpenedModal";
      const { handleCloseModal } = useModalHandlers(modalName);

      // Should not throw an error
      expect(() => handleCloseModal()).not.toThrow();
    });

    it("can be called multiple times without error", () => {
      const modalName = "TestModal";
      const { openModal, handleCloseModal } = useModalHandlers(modalName);

      openModal();
      handleCloseModal();
      handleCloseModal();
      handleCloseModal();

      // Should not throw
      expect(() => handleCloseModal()).not.toThrow();
    });

    it("preserves modal data when closing", () => {
      const modalName = "TestModal";
      const params = { userId: 123 };
      const { openModal, handleCloseModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(params);
      handleCloseModal();

      // Data should still be there, just modal is closed
      expect(modals.modals[modalName].isOpen).toBe(false);
      expect(modals.modals[modalName].data).toEqual(params);
    });
  });

  // MARK: - Multiple Modals

  describe("Multiple modals management", () => {
    it("manages multiple modals independently", () => {
      const modal1 = useModalHandlers("Modal1");
      const modal2 = useModalHandlers("Modal2");
      const modal3 = useModalHandlers("Modal3");
      const modals = useModals();

      modal1.openModal({ data: "modal1" });
      modal2.openModal({ data: "modal2" });
      modal3.openModal({ data: "modal3" });

      // Only the last opened modal should be open
      expect(modals.modals.Modal1.isOpen).toBe(false);
      expect(modals.modals.Modal2.isOpen).toBe(false);
      expect(modals.modals.Modal3.isOpen).toBe(true);

      // But all should have their data preserved
      expect(modals.modals.Modal1.data).toEqual({ data: "modal1" });
      expect(modals.modals.Modal2.data).toEqual({ data: "modal2" });
      expect(modals.modals.Modal3.data).toEqual({ data: "modal3" });
    });

    it("can close specific modals without affecting others", () => {
      const modal1 = useModalHandlers("Modal1");
      const modal2 = useModalHandlers("Modal2");
      const modals = useModals();

      modal1.openModal();
      modal2.openModal();

      modal1.handleCloseModal();

      expect(modals.modals.Modal1.isOpen).toBe(false);
      expect(modals.modals.Modal2.isOpen).toBe(true);
    });

    it("handles modals with similar names correctly", () => {
      const modal1 = useModalHandlers("Modal");
      const modal2 = useModalHandlers("ModalEdit");
      const modal3 = useModalHandlers("ModalDelete");
      const modals = useModals();

      modal1.openModal({ type: "base" });
      modal2.openModal({ type: "edit" });
      modal3.openModal({ type: "delete" });

      expect(modals.modals.Modal.data).toEqual({ type: "base" });
      expect(modals.modals.ModalEdit.data).toEqual({ type: "edit" });
      expect(modals.modals.ModalDelete.data).toEqual({ type: "delete" });
    });
  });

  // MARK: - Store Integration

  describe("Store integration", () => {
    it("calls store openModalAndUpdateState method", () => {
      const modalName = "TestModal";
      const modals = useModals();
      const spy = vi.spyOn(modals, "openModalAndUpdateState");

      const { openModal } = useModalHandlers(modalName);
      openModal();

      expect(spy).toHaveBeenCalledWith(modalName, undefined);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("calls store openModalAndUpdateState with parameters", () => {
      const modalName = "TestModal";
      const params = { test: "data" };
      const modals = useModals();
      const spy = vi.spyOn(modals, "openModalAndUpdateState");

      const { openModal } = useModalHandlers(modalName);
      openModal(params);

      expect(spy).toHaveBeenCalledWith(modalName, params);
    });

    it("calls store closeModalAndUpdateState method", () => {
      const modalName = "TestModal";
      const modals = useModals();
      const spy = vi.spyOn(modals, "closeModalAndUpdateState");

      const { openModal, handleCloseModal } = useModalHandlers(modalName);
      openModal();
      handleCloseModal();

      expect(spy).toHaveBeenCalledWith(modalName);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it("uses the same store instance across multiple handlers", () => {
      const modal1 = useModalHandlers("Modal1");
      const modal2 = useModalHandlers("Modal2");
      const modals = useModals();

      modal1.openModal({ data: 1 });
      modal2.openModal({ data: 2 });

      // Both should affect the same store
      expect(Object.keys(modals.modals)).toContain("Modal1");
      expect(Object.keys(modals.modals)).toContain("Modal2");
    });
  });

  // MARK: - Edge Cases

  describe("Edge cases", () => {
    it("handles empty string modal name", () => {
      const { openModal, handleCloseModal } = useModalHandlers("");
      const modals = useModals();

      openModal();
      expect(modals.modals[""]).toBeDefined();
      expect(modals.modals[""].isOpen).toBe(true);

      handleCloseModal();
      expect(modals.modals[""].isOpen).toBe(false);
    });

    it("handles modal names with special characters", () => {
      const specialNames = [
        "Modal-With-Dashes",
        "Modal_With_Underscores",
        "Modal.With.Dots",
        "Modal123",
        "ModalWithCamelCase",
      ];

      specialNames.forEach((name) => {
        const { openModal } = useModalHandlers(name);
        const modals = useModals();

        openModal();
        expect(modals.modals[name].isOpen).toBe(true);
      });
    });

    it("handles very long modal names", () => {
      const longName = "A".repeat(1000);
      const { openModal } = useModalHandlers(longName);
      const modals = useModals();

      openModal();
      expect(modals.modals[longName].isOpen).toBe(true);
    });

    it("handles null as parameter", () => {
      const modalName = "TestModal";
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(null);
      expect(modals.modals[modalName].data).toBe(null);
    });

    it("handles undefined as parameter", () => {
      const modalName = "TestModal";
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(undefined);
      expect(modals.modals[modalName].data).toBe(undefined);
    });

    it("handles boolean as parameter", () => {
      const modalName = "TestModal";
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal(true);
      expect(modals.modals[modalName].data).toBe(true);

      openModal(false);
      expect(modals.modals[modalName].data).toBe(false);
    });
  });

  // MARK: - Real-world Usage Patterns

  describe("Real-world usage patterns", () => {
    it("handles FAQ modal pattern (modal with ID)", () => {
      const faqId = "faq-123";
      const modalName = `ModalFAQEntry${faqId}`;
      const { openModal, handleCloseModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal({ faqId, action: "edit" });
      expect(modals.modals[modalName].isOpen).toBe(true);
      expect(modals.modals[modalName].data).toEqual({ faqId, action: "edit" });

      handleCloseModal();
      expect(modals.modals[modalName].isOpen).toBe(false);
    });

    it("handles delete confirmation pattern", () => {
      const itemId = 456;
      const modalName = `ModalDeleteFAQ${itemId}`;
      const { openModal, handleCloseModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal({
        itemId,
        confirmMessage: "Are you sure you want to delete this FAQ?",
      });

      expect(modals.modals[modalName].isOpen).toBe(true);
      expect(modals.modals[modalName].data).toMatchObject({ itemId });

      handleCloseModal();
      expect(modals.modals[modalName].isOpen).toBe(false);
    });

    it("handles image carousel pattern", () => {
      const modalName = "ModalMediaImageCarousel";
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal({
        images: ["img1.jpg", "img2.jpg", "img3.jpg"],
        initialIndex: 1,
      });

      expect(modals.modals[modalName].data).toMatchObject({
        images: expect.any(Array),
        initialIndex: 1,
      });
    });

    it("handles command palette pattern", () => {
      const modalName = "ModalCommandPalette";
      const { openModal, handleCloseModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal();
      expect(modals.modals[modalName].isOpen).toBe(true);

      // Command palette typically closes on selection
      handleCloseModal();
      expect(modals.modals[modalName].isOpen).toBe(false);
    });

    it("handles share page pattern", () => {
      const modalName = "ModalSharePage";
      const { openModal } = useModalHandlers(modalName);
      const modals = useModals();

      openModal({
        url: "https://activist.org/events/123",
        title: "Climate Action Event",
      });
      expect(modals.modals[modalName].data).toMatchObject({
        url: expect.any(String),
        title: expect.any(String),
      });
    });
  });
});
