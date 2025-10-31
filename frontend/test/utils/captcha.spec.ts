// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, it, expect } from "vitest";

import { FRIENDLY_CAPTCHA_KEY } from "../../app/utils/captcha";

describe("utils/captcha", () => {
  it("exposes FRIENDLY_CAPTCHA_KEY as string or undefined from env", () => {
    if (FRIENDLY_CAPTCHA_KEY !== undefined) {
      expect(typeof FRIENDLY_CAPTCHA_KEY).toBe("string");
    } else {
      expect(FRIENDLY_CAPTCHA_KEY).toBeUndefined();
    }
  });
});
