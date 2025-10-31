// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, it, expect } from "vitest";

import * as reg from "../../app/utils/imageURLRegistry.s";

describe("utils/imageURLRegistry.s", () => {
  it("exports non-empty string URLs", () => {
    for (const [, value] of Object.entries(reg)) {
      if (typeof value === "string") {
        expect(value.length).toBeGreaterThan(1);
        expect(value.startsWith("/")).toBe(true);
      }
    }
  });
});
