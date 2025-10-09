import { expect, test } from "~/test-e2e/global-fixtures";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { navigateToFirstOrganization } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { submitModalWithRetry } from "~/test-e2e/utils/modalHelpers";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToFirstOrganization(page);

  // Wait for auth state to be fully loaded.
  await page.waitForLoadState("domcontentloaded");

  // Give Nuxt Auth time to hydrate session from cookies.
  await page.waitForTimeout(1000);
});

test.describe(
  "Organization About Page - Social Links Delete",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can delete a social link", async ({ page }) => {
      const organizationPage = newOrganizationPage(page);

      // Ensure we're on the About page.
      await expect(page).toHaveURL(/.*\/organizations\/.*\/about/, {
        timeout: 10000,
      });

      // Wait for page to be fully loaded (network requests complete) - longer timeout for dev mode.
      await page.waitForLoadState("domcontentloaded");

      // Wait for the connect card to be visible (longer timeout for slow dev mode loading).
      await expect(organizationPage.aboutPage.connectCard).toBeVisible({
        timeout: 15000,
      });

      // Generate unique content for this test run.
      const timestamp = Date.now();
      const newLabel = `Test Social Link ${timestamp}`;
      const newUrl = `https://test-social-${timestamp}.com`;

      // PHASE 1: CREATE - Add a new social link first.
      await organizationPage.aboutPage.connectCardEditIcon.click();
      await expect(organizationPage.socialLinksModal.modal).toBeVisible();

      // Count existing social link entries using data-testid.
      const existingEntries = await organizationPage.socialLinksModal.modal
        .getByTestId(/^social-link-entry-/)
        .all();
      const initialCount = existingEntries.length;

      // Add a new social link
      const addButton = organizationPage.socialLinksModal.addButton(
        organizationPage.socialLinksModal.modal
      );
      await expect(addButton).toBeVisible();
      // Use JavaScript click to bypass viewport restrictions on mobile.
      await addButton.evaluate((btn) => (btn as HTMLElement).click());

      // Wait for the new entry to appear.
      await expect(
        organizationPage.socialLinksModal.modal.getByTestId(
          /^social-link-entry-/
        )
      ).toHaveCount(initialCount + 1);

      // Use the newly added entry (at the last index).
      const newEntryIndex = initialCount;
      const newLabelField = organizationPage.socialLinksModal.labelField(
        organizationPage.socialLinksModal.modal,
        newEntryIndex
      );
      const newUrlField = organizationPage.socialLinksModal.urlField(
        organizationPage.socialLinksModal.modal,
        newEntryIndex
      );

      await expect(newLabelField).toBeVisible();
      await expect(newUrlField).toBeVisible();

      await newLabelField.pressSequentially(newLabel);
      await newUrlField.pressSequentially(newUrl);

      // Verify the fields contain the entered text.
      await expect(newLabelField).toHaveValue(newLabel);
      await expect(newUrlField).toHaveValue(newUrl);

      // Save the new social link with retry logic.
      const submitButton = organizationPage.socialLinksModal.submitButton(
        organizationPage.socialLinksModal.modal
      );
      await submitModalWithRetry(
        page,
        organizationPage.socialLinksModal.modal,
        submitButton,
        "CREATE"
      );

      // Wait for the modal to close and page to update.
      await expect(organizationPage.socialLinksModal.modal).not.toBeVisible({
        timeout: 10000,
      });

      // PHASE 2: DELETE - Remove the social link we created.
      await organizationPage.aboutPage.connectCardEditIcon.click();
      await expect(organizationPage.socialLinksModal.modal).toBeVisible();

      // Get the current form entries using test IDs.
      const allLabelInputs = await organizationPage.socialLinksModal.modal
        .getByTestId(/^social-link-label-/)
        .all();

      if (allLabelInputs.length === 0) {
        throw new Error("No social links available to delete");
      }

      // Find the entry that contains our label.
      let deleteIndex = -1;
      const foundValues = [];

      for (let i = 0; i < allLabelInputs.length; i++) {
        const value = await allLabelInputs[i]?.inputValue();
        foundValues.push(value);

        // Try exact match.
        if (value === newLabel) {
          deleteIndex = i;
          break;
        }
      }

      if (deleteIndex === -1) {
        throw new Error(
          `Could not find the social link we created for deletion. Looking for: "${newLabel}", Found: [${foundValues.join(", ")}]`
        );
      }

      // Delete the social link we created.
      const deleteButton = organizationPage.socialLinksModal.removeButton(
        organizationPage.socialLinksModal.modal,
        deleteIndex
      );
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();

      // Save the deletion with retry logic.
      const deleteSubmitButton = organizationPage.socialLinksModal.submitButton(
        organizationPage.socialLinksModal.modal
      );
      await expect(deleteSubmitButton).toBeVisible();
      await expect(deleteSubmitButton).toBeEnabled();

      await submitModalWithRetry(
        page,
        organizationPage.socialLinksModal.modal,
        deleteSubmitButton,
        "DELETE"
      );
      // Verify the deleted social link no longer appears on the Connect card.
      // Use getByTestId and filter by text since accessible name might include icon.
      const { connectCard } = organizationPage.aboutPage;
      await expect(
        connectCard.getByTestId("social-link").filter({ hasText: newLabel })
      ).not.toBeVisible({
        timeout: 10000,
      });
    });
  }
);
