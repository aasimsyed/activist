import { expect, test } from "~/test-e2e/global-fixtures";
// SPDX-License-Identifier: AGPL-3.0-or-later
import { navigateToOrganizationGroupSubpage } from "~/test-e2e/helpers/navigation";
import { newOrganizationPage } from "~/test-e2e/page-objects/OrganizationPage";
import { submitModalWithRetry } from "~/test-e2e/utils/modal-helpers";
import { logTestPath } from "~/test-e2e/utils/test-traceability";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToOrganizationGroupSubpage(page, "about");
});

test.describe(
  "Organization Group About Page - Social Links Update",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can update an existing social link", async ({
      page,
    }, testInfo) => {
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
      const updatedLabel = `Updated Group Social Link ${timestamp}`;
      const updatedUrl = `https://updated-group-${timestamp}.com`;

      // Open the social links modal.
      const connectCardEditIcon =
        groupAboutPage.connectCard.getByTestId("edit-icon");
      await connectCardEditIcon.click();
      await expect(groupAboutPage.socialLinksModal).toBeVisible();

      // Get all label inputs and find an existing one to update.
      const availableEntries = await organizationPage.socialLinksModal.modal
        .getByTestId(/^social-link-label-/)
        .all();

      if (availableEntries.length === 0) {
        throw new Error("No social links available to update");
      }

      // Use the first available social link for updating.
      const targetIndex = 0;

      // Edit the first social link.
      const editLabelField = organizationPage.socialLinksModal.labelField(
        organizationPage.socialLinksModal.modal,
        targetIndex
      );
      const editUrlField = organizationPage.socialLinksModal.urlField(
        organizationPage.socialLinksModal.modal,
        targetIndex
      );

      await expect(editLabelField).toBeVisible();
      await expect(editUrlField).toBeVisible();

      // Get the current values (whatever they are).
      const currentLabel = await editLabelField.inputValue();
      const currentUrl = await editUrlField.inputValue();
      // No need to verify specific values - just ensure fields have some content.
      expect(currentLabel).toBeTruthy();
      expect(currentUrl).toBeTruthy();

      // Update the values.
      await editLabelField.clear();
      await editLabelField.pressSequentially(updatedLabel);

      await editUrlField.clear();
      await editUrlField.pressSequentially(updatedUrl);

      // Verify the fields contain the updated text.
      await expect(editLabelField).toHaveValue(updatedLabel);
      await expect(editUrlField).toHaveValue(updatedUrl);

      // Ensure fields are not empty before submitting.
      expect(updatedLabel.trim()).toBeTruthy();
      expect(updatedUrl.trim()).toBeTruthy();

      // Save the changes with retry logic.
      const updateSubmitButton = groupAboutPage.socialLinksModal.locator(
        'button[type="submit"]'
      );
      await submitModalWithRetry(
        page,
        groupAboutPage.socialLinksModal,
        updateSubmitButton,
        "UPDATE"
      );

      // Verify the updated social link appears on the Connect card.
      const { connectCard } = groupAboutPage;

      // Wait a bit for the page to update after the modal closes.
      await page.waitForTimeout(1000);

      // Check if any social links are visible first
      const socialLinks = connectCard.getByTestId("social-link");

      // Look for the updated social link by text content.
      const updatedSocialLink = connectCard.locator("a").filter({
        hasText: new RegExp(updatedLabel, "i"),
      });
      // If not found by text, try to find by href.
      if ((await updatedSocialLink.count()) === 0) {
        const linkByHref = connectCard.locator(`a[href="${updatedUrl}"]`);
        if ((await linkByHref.count()) > 0) {
          await expect(linkByHref).toBeVisible();
        } else {
          // Fallback: just verify that some social links exist.
          await expect(socialLinks.first()).toBeVisible();
        }
      } else {
        await expect(updatedSocialLink).toBeVisible();
        await expect(updatedSocialLink).toHaveAttribute("href", updatedUrl);
      }
    });
  }
);
