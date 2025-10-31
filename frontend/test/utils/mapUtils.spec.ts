// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, it, expect } from "vitest";

import { ColorByEventType } from "../../app/types/map";
import { colorByType } from "../../app/utils/mapUtils";

describe("utils/mapUtils", () => {
  it("maps event types to color enum", () => {
    expect(colorByType.learn).toBe(ColorByEventType.LEARN);
    expect(colorByType.action).toBe(ColorByEventType.ACTION);
  });
});
