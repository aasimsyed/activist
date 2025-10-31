// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, it, expect } from "vitest";

import { getAllDaysInRange } from "../../app/utils/utils";

describe("utils/utils", () => {
  it("getAllDaysInRange returns inclusive dates", () => {
    const start = new Date("2024-01-01");
    const end = new Date("2024-01-03");
    const out = getAllDaysInRange({ start, end });
    expect(out.map((d) => d.toISOString().slice(0, 10))).toEqual([
      "2024-01-01",
      "2024-01-02",
      "2024-01-03",
    ]);
  });

  it("handles single-day ranges", () => {
    const day = new Date("2024-06-15");
    const out = getAllDaysInRange({ start: day, end: day });
    expect(out).toHaveLength(1);
    expect(out[0]!.toISOString().slice(0, 10)).toBe("2024-06-15");
  });
});
