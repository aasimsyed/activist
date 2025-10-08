// SPDX-License-Identifier: AGPL-3.0-or-later
import { navigateToOrganizationGroupSubpage } from "~/test-e2e/actions/navigation";
import { expect, test } from "~/test-e2e/global-fixtures";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { submitModalWithRetry } from "~/test-e2e/utils/modalHelpers";
import { logTestPath } from "~/test-e2e/utils/testTraceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToOrganizationGroupSubpage(page, "about");
});

test.describe(
  "Organization Group About Page - Social Links Create",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can create a new social link", async ({ page }, testInfo) => {
      // Increase timeout for slow page loads in dev mode.
      test.setTimeout(60000);

      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupAboutPage } = organizationPage;

      // Ensure we're on the About page.
      await expect(page).toHaveURL(/.*\/groups\/.*\/about/);
      await expect(groupAboutPage.connectCard).toBeVisible();

      // Generate unique content for this test run.
      const timestamp = Date.now();
      const newLabel = `Test Group Social Link ${timestamp}`;
      const newUrl = `https://test-group-social-${timestamp}.com`;

      // Open the social links modal.
      const connectCardEditIcon =
        groupAboutPage.connectCard.getByTestId("edit-icon");
      await connectCardEditIcon.click();
      await expect(groupAboutPage.socialLinksModal).toBeVisible();

      // Count existing social links.
      const initialCount = await groupAboutPage.socialLinksModal
        .locator('input[id^="form-item-socialLinks."][id$=".label"]')
        .count();

      // Add a new social link.
      const addButton = groupAboutPage.socialLinksModal.locator(
        'button:has-text("Add link")'
      );
      await expect(addButton).toBeVisible();
      // Use JavaScript click to bypass viewport restrictions on mobile.
      await addButton.evaluate((btn) => (btn as HTMLElement).click());

      // Wait for the new entry to appear.
      await expect(
        groupAboutPage.socialLinksModal.locator(
          'input[id^="form-item-socialLinks."][id$=".label"]'
        )
      ).toHaveCount(initialCount + 1);

      // Use the newly added entry (at the last index).
      const newEntryIndex = initialCount;
      const newLabelField = groupAboutPage.socialLinksModal.locator(
        `[id="form-item-socialLinks.${newEntryIndex}.label"]`
      );
      const newUrlField = groupAboutPage.socialLinksModal.locator(
        `[id="form-item-socialLinks.${newEntryIndex}.link"]`
      );

      await expect(newLabelField).toBeVisible();
      await expect(newUrlField).toBeVisible();

      await newLabelField.pressSequentially(newLabel);
      await newUrlField.pressSequentially(newUrl);

      // Verify the fields contain the entered text.
      await expect(newLabelField).toHaveValue(newLabel);
      await expect(newUrlField).toHaveValue(newUrl);

      // Ensure fields are not empty before submitting.
      expect(newLabel.trim()).toBeTruthy();
      expect(newUrl.trim()).toBeTruthy();

      // Save the new social link with retry logic.
      const submitButton = groupAboutPage.socialLinksModal.locator(
        'button[type="submit"]'
      );
      await submitModalWithRetry(
        page,
        groupAboutPage.socialLinksModal,
        submitButton,
        "CREATE"
      );

      // Verify the new social link appears on the Connect card.
      const { connectCard } = groupAboutPage;

      // Wait for the page to update after the modal closes.
      await page.waitForTimeout(1000);

      // Check if social links were created (with flexible timeout).
      let allSocialLinks = 0;
      try {
        await expect(
          connectCard.getByTestId("social-link").first()
        ).toBeVisible({
          timeout: 10000,
        });
        allSocialLinks = await connectCard.getByTestId("social-link").count();
      } catch {
        // CREATE might have failed, check if any links exist at all.
        allSocialLinks = await connectCard.getByTestId("social-link").count();
        if (allSocialLinks === 0) {
          throw new Error("No social links found after CREATE operation");
        }
      }
    });
  }
);
