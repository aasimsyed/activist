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
  "Organization Group About Page - Social Links Delete",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test("User can delete a social link", async ({ page }, testInfo) => {
      // Increase timeout for slow page loads in dev mode.
      test.setTimeout(60000);

      logTestPath(testInfo);
      const organizationPage = newOrganizationPage(page);
      const { groupAboutPage } = organizationPage;

      // Ensure we're on the About page.
      await expect(page).toHaveURL(/.*\/groups\/.*\/about/);
      await expect(groupAboutPage.content.connectCard).toBeVisible();

      // Open the social links modal.
      const connectCardEditIcon =
        groupAboutPage.content.connectCard.getByTestId("edit-icon");
      await connectCardEditIcon.click();
      await expect(groupAboutPage.modals.socialLinksModal).toBeVisible();

      // Get the current form entries using test IDs.
      const allLabelInputs = await organizationPage.socialLinksModal.modal
        .getByTestId(/^social-link-label-/)
        .all();

      if (allLabelInputs.length === 0) {
        throw new Error("No social links available to delete");
      }

      // Get the label of the first social link (we'll verify it's deleted).
      const deleteIndex = 0;
      const labelToDelete = await allLabelInputs[deleteIndex]?.inputValue();

      if (!labelToDelete) {
        throw new Error("Could not get label of social link to delete");
      }

      // Delete the first social link.
      const deleteButton = organizationPage.socialLinksModal.removeButton(
        organizationPage.socialLinksModal.modal,
        deleteIndex
      );
      await expect(deleteButton).toBeVisible();
      await deleteButton.click();

      // Save the deletion with retry logic.
      const deleteSubmitButton = groupAboutPage.modals.socialLinksModal.locator(
        'button[type="submit"]'
      );
      await expect(deleteSubmitButton).toBeVisible();
      await expect(deleteSubmitButton).toBeEnabled();

      await submitModalWithRetry(
        page,
        groupAboutPage.modals.socialLinksModal,
        deleteSubmitButton,
        "DELETE"
      );

      // Verify the deleted social link no longer appears on the Connect card.
      const connectCard = groupAboutPage.content.connectCard;

      // Wait for the modal to close and page to update.
      await expect(groupAboutPage.modals.socialLinksModal).not.toBeVisible({
        timeout: 10000,
      });
      // Verify the deleted social link no longer exists.
      const deletedSocialLink = connectCard
        .getByTestId("social-link")
        .filter({ hasText: labelToDelete });
      await expect(deletedSocialLink).not.toBeVisible({
        timeout: 10000,
      });
    });
  }
);
