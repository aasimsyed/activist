// SPDX-License-Identifier: AGPL-3.0-or-later
import { navigateToFirstOrganization } from "~/test-e2e/actions/navigation";
import { expect, test } from "~/test-e2e/global-fixtures";
import { newOrganizationPage } from "~/test-e2e/page-objects/organization/OrganizationPage";

test.beforeEach(async ({ page }) => {
  // Already authenticated via global storageState.
  await navigateToFirstOrganization(page);

  // Wait for auth state to be fully loaded.
  await page.waitForLoadState("domcontentloaded");

  // Wait for page to be fully loaded (no arbitrary delay).
  await expect(async () => {
    // Verify page is interactive and fully rendered.
    const isReady = await page.evaluate(
      () => document.readyState === "complete"
    );
    expect(isReady).toBe(true);
  }).toPass({
    timeout: 10000,
    intervals: [100, 250],
  });
});

test.describe(
  "Organization About Page - Image Carousel",
  { tag: ["@desktop", "@mobile"] },
  () => {
    test.setTimeout(60000); // increased timeout for slow dev mode loading

    test("User can upload image (CREATE, UPDATE, DELETE)", async ({ page }) => {
      const organizationPage = newOrganizationPage(page);

      // Ensure we're on the About page.
      await expect(page).toHaveURL(/.*\/organizations\/.*\/about/, {
        timeout: 10000,
      });

      // Wait for page to be ready.
      await page.waitForLoadState("domcontentloaded");

      // Wait for the about card to be visible.
      await expect(organizationPage.aboutPage.imageCarousel).toBeVisible({
        timeout: 15000,
      });

      // Get the initial number of images in the carousel
      const initialCarouselCount = await organizationPage.aboutPage.getImageCarouselImages.count();

      // Wait for edit icon to be available (auth state should be loaded).
      await expect(
        organizationPage.aboutPage.imageCarouselEditIcon
      ).toBeVisible({
        timeout: 10000,
      });

      // Click the edit icon to open the image upload modal.
      await organizationPage.aboutPage.imageCarouselEditIcon.click({
        force: true,
      });

      // Verify the image upload modal appears.
      await expect(organizationPage.uploadImageModal.modal).toBeVisible();

      // Verify the image upload form is visible.
      const imageUploadInput =
        organizationPage.uploadImageModal.imageUploadInput(
          organizationPage.uploadImageModal.modal
        );
      await expect(imageUploadInput).toBeEnabled();
      await expect(imageUploadInput).toBeEditable();

      // Count initial number of files uploaded in the modal.
      const existingUploadEntries = await organizationPage.uploadImageModal
        .getUploadedImages(organizationPage.uploadImageModal.modal)
        .all();
      const existingUploadEntriesCount = existingUploadEntries.length;

      // Set image input.
      const filePng = {
        name: "file.png",
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
          "base64"
        ),
      };
      await imageUploadInput.setInputFiles(filePng);

      // New entry appears in the modal.
      await expect(
        organizationPage.uploadImageModal.getUploadedImages(
          organizationPage.uploadImageModal.modal
        )
      ).toHaveCount(existingUploadEntriesCount + 1);

      // Upload image.
      await organizationPage.uploadImageModal
        .uploadButton(organizationPage.uploadImageModal.modal)
        .click();

      // Wait for the modal to close and page to update.
      await expect(organizationPage.uploadImageModal.modal).not.toBeVisible({
        timeout: 10000,
      });

      // Verify the number of image in the carousel matches the number of files in the modal.
      await expect(
        organizationPage.aboutPage.getImageCarouselImages
      ).toHaveCount(existingUploadEntriesCount + 1);

      // Open the modal and remove the first image
      await organizationPage.aboutPage.imageCarouselEditIcon.click({
        force: true,
      });
      await organizationPage.uploadImageModal
        .removeButton(organizationPage.uploadImageModal.modal, 0)
        .click();

      // Number of files upload goes back to existing count.
      await expect(
        organizationPage.uploadImageModal.getUploadedImages(
          organizationPage.uploadImageModal.modal
        )
      ).toHaveCount(existingUploadEntriesCount);

      // Close the upload image modal.
      await organizationPage.uploadImageModal
        .closeButton(organizationPage.uploadImageModal.modal)
        .click();

      // Wait for the modal to close and page to update.
      await expect(organizationPage.uploadImageModal.modal).not.toBeVisible({
        timeout: 10000,
      });

      // Verify the number of image in the carousel matches the number of files in the modal.
      await expect(
        organizationPage.aboutPage.getImageCarouselImages
      ).toHaveCount(initialCarouselCount);
    });

    test("User can upload multiple images (CREATE, UPDATE, DELETE)", async ({ page }) => {
      const organizationPage = newOrganizationPage(page);

      // Ensure we're on the About page.
      await expect(page).toHaveURL(/.*\/organizations\/.*\/about/, {
        timeout: 10000,
      });

      // Wait for page to be ready.
      await page.waitForLoadState("domcontentloaded");

      // Wait for the about card to be visible.
      await expect(organizationPage.aboutPage.imageCarousel).toBeVisible({
        timeout: 15000,
      });

      // Wait for edit icon to be available (auth state should be loaded).
      await expect(
        organizationPage.aboutPage.imageCarouselEditIcon
      ).toBeVisible({
        timeout: 10000,
      });

      // Click the edit icon to open the image upload modal.
      await organizationPage.aboutPage.imageCarouselEditIcon.click({
        force: true,
      });

      // Verify the image upload modal appears.
      await expect(organizationPage.uploadImageModal.modal).toBeVisible();

      // Verify the image upload form is visible.
      const imageUploadInput =
        organizationPage.uploadImageModal.imageUploadInput(
          organizationPage.uploadImageModal.modal
        );
      await expect(imageUploadInput).toBeEnabled();

      // Count initial number of files uploaded in the modal.
      const existingUploadEntriesCount = await organizationPage.uploadImageModal
        .getUploadedImages(organizationPage.uploadImageModal.modal)
        .count();

      // Set image input.
      const createPngFile = (name: string) => ({
        name,
        mimeType: "image/png",
        buffer: Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGP4z8AAAAMBAQDJ/pLvAAAAAElFTkSuQmCC",
          "base64"
        ),
      });

      const filePng = [
        createPngFile("file1.png"),
        createPngFile("file2.png"),
        createPngFile("file3.png")
      ]
      // Upload 2 images
      await imageUploadInput.setInputFiles(filePng);

      // New entry appears in the modal.
      await expect(
        organizationPage.uploadImageModal.getUploadedImages(
          organizationPage.uploadImageModal.modal
        )
      ).toHaveCount(existingUploadEntriesCount + filePng.length);

      // Upload image.
      await organizationPage.uploadImageModal
        .uploadButton(organizationPage.uploadImageModal.modal)
        .click();

      // Wait for the modal to close and page to update.
      await expect(organizationPage.uploadImageModal.modal).not.toBeVisible({
        timeout: 10000,
      });

      // Verify the number of image in the carousel matches the number of files in the modal.
      await expect(
        organizationPage.aboutPage.getImageCarouselImages
      ).toHaveCount(existingUploadEntriesCount + filePng.length);

      // Pagination using dots
      const dots = organizationPage.aboutPage.getImageCarouselDots;

      if (await dots.count() > 1) {
        // Click second dot
        await dots.nth(1).click();
        await expect(
          organizationPage.aboutPage.getImageCarouselImages.nth(1)
        ).toBeVisible();
      }
    });
  }
);
