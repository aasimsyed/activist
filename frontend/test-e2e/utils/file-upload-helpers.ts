import type { Page } from "playwright-core";

/**
 * Guard for capturing the response from a file upload.
 * 
 * @param page - Playwright Page object
 * @param urlString - content that matches part of the url
 * @returns 
 */
export const uploadResponsePromise = async (
  page: Page,
  urlString = "/content/images"
) => {
  const uploadResponse = await page.waitForResponse(
    (res) => res.request().method() === "POST" && res.url().includes(urlString),
    { timeout: 15000 }
  );

  const status = uploadResponse.status();
  const body = await uploadResponse.text().catch(() => "<unreadable>");

  return { uploadResponse, status, body };
};
