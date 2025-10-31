// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, it, expect } from "vitest";

import { passwordRules } from "../../app/utils/passwordRules";

describe("utils/passwordRules", () => {
  it("exports five default rules in correct order", () => {
    expect(Array.isArray(passwordRules)).toBe(true);
    expect(passwordRules).toHaveLength(5);
    expect(passwordRules.map((r) => r.message)).toEqual([
      "number-of-chars",
      "capital-letters",
      "lower-case-letters",
      "contains-numbers",
      "contains-special-chars",
    ]);
  });

  it("defaults all isValid to false", () => {
    for (const rule of passwordRules) {
      expect(rule.isValid).toBe(false);
    }
  });
});
