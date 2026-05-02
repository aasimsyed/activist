// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "playwright-core";

/**
 * Guard for capturing the response from a file upload.
 *
 * @param page - Playwright Page object
 * @param urlString - content that matches part of the url
 * @returns
 */
export const uploadResponsePromise = (
  page: Page,
  urlString = "/content/images"
): Promise<{ uploadResponse: Awaited<ReturnType<Page["waitForResponse"]>>; status: number; body: string }> =>
  page
    .waitForResponse(
      (res) =>
        res.request().method() === "POST" && res.url().includes(urlString),
      { timeout: 15000 }
    )
    .then(async (uploadResponse) => {
      const status = uploadResponse.status();
      const body = await uploadResponse.text().catch(() => "<unreadable>");
      return { uploadResponse, status, body };
    });
