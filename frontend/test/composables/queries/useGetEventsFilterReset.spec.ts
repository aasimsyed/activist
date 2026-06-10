// SPDX-License-Identifier: AGPL-3.0-or-later
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

import type { EventFilters } from "../../../shared/types/event";

import { createMockEvent } from "../../mocks/factories";

// MARK: Mocks

vi.mock("../../../app/composables/generic/useToaster", () => ({
  useToaster: () => ({
    showToastError: vi.fn(),
  }),
}));

const { mockListEvents } = vi.hoisted(() => ({
  mockListEvents: vi.fn(),
}));

mockNuxtImport("listEvents", () => mockListEvents);

// MARK: Tests

describe("useGetEvents filter reset", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it("resets to a single page of filtered results without duplicates", async () => {
    const makeEvents = (prefix: string, count: number, offset = 0) =>
      Array.from({ length: count }, (_, i) =>
        createMockEvent({ id: `${prefix}-${offset + i}` })
      );

    mockListEvents.mockImplementation(
      (params: EventFilters & { page: number; page_size: number }) => {
        if (params.location === "Berlin") {
          return params.page === 1
            ? Promise.resolve({
                data: makeEvents("berlin", 10),
                isLastPage: false,
              })
            : Promise.resolve({
                data: makeEvents("berlin", 3, 10),
                isLastPage: true,
              });
        }
        return Promise.resolve({
          data: makeEvents("all", 10, (params.page - 1) * 10),
          isLastPage: false,
        });
      }
    );

    const { useGetEvents } =
      await import("../../../app/composables/queries/useGetEvents");

    const filters = ref<EventFilters>({});
    const { data, getMore } = useGetEvents(filters);

    await vi.waitFor(() => expect(data.value).toHaveLength(10));

    getMore();
    await vi.waitFor(() => expect(data.value).toHaveLength(20));

    filters.value = { location: "Berlin" };
    await vi.waitFor(() =>
      expect(mockListEvents).toHaveBeenCalledWith(
        expect.objectContaining({ location: "Berlin", page: 1 })
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 50));

    const ids = (data.value ?? []).map((event) => event.id);
    expect(ids.length).toBeLessThanOrEqual(10);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((id) => String(id).startsWith("berlin"))).toBe(true);
  });
});
