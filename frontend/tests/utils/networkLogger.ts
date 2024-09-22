import type { Page, Request, Response } from "@playwright/test";

export function setupNetworkLogging(page: Page) {
  page.on('request', (request: Request) => console.log('>>', request.method(), request.url()));
  page.on('response', async (response: Response) => {
    console.log('<<', response.status(), response.statusText(), response.url());
    const headers = await response.allHeaders();
    console.log('Response Headers:', JSON.stringify(headers, null, 2));
    const body = await response.text();
    console.log('Response Body:', body);
  });
}
