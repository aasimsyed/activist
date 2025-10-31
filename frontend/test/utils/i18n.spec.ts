// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, it, expect } from "vitest";

import { getLocaleText } from "../../app/utils/i18n";
import { LOCALE_CODE } from "../../app/utils/locales";

describe("utils/i18n", () => {
  it("getLocaleText returns en as default and correct map for specific code", () => {
    const en = getLocaleText();
    expect(typeof en).toBe("object");

    const fr = getLocaleText(LOCALE_CODE.FRENCH);
    expect(typeof fr).toBe("object");
    // ensure different locale maps are not empty
    expect(Object.keys(en).length).toBeGreaterThan(0);
    expect(Object.keys(fr).length).toBeGreaterThan(0);
  });
});
