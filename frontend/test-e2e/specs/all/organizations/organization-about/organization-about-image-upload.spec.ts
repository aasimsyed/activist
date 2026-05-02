// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "playwright-core";
import { navigateToFirstOrganization } from "~/test-e2e/actions/navigation";
import { tinyPng } from "~/test-e2e/fixtures/images";
import { expect, test } from "~/test-e2e/global-fixtures";
import { newOrganizationPage } from "~/test-e2e/page-objects/organization/OrganizationPage";

test.beforeEach(async ({ page }) => {
  const organizationId = await pageSetup(page);
  await purgeImages(page, organizationId);
});

test.afterEach(async ({ page }) => {
  const organizationId = await pageSetup(page);
  await purgeImages(page, organizationId);
});

const pageSetup = async (page: Page) => {
  const { organizationId } = await navigateToFirstOrganization(page);
  await page.waitForLoadState("networkidle");

  return organizationId;
};

const purgeImages = async (page: Page, organizationId: string) => {
  const res = await page.request.get(
    `/api/public/communities/organization/${organizationId}/images`
  );
  const images: { id: string }[] = await res.json();
  await Promise.all(
    images.map((img) =>
      page.request.delete(`/api/auth/content/images/${img.id}`)
    )
  );

  // Reload so the carousel reflects the purged state.
  await page.reload({ waitUntil: "networkidle" });
};

// Run serially so Desktop Chrome and Mobile Chrome workers do not hit the
// same organization concurrently and corrupt each other's state.
test.describe.serial(
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

      // Read the carousel baseline BEFORE opening the modal. When there are no
      // real images the carousel shows placeholder slides; this value is used
      // for the post-delete assertion (restore to original state).
      const initialCarouselCount = parseInt(
        (await page
          .getByTestId("image-carousel-main")
          .getAttribute("data-slide-count")) ?? "0"
      );

      // Wait for edit icon to be available (auth state should be loaded).
      await expect(
        organizationPage.aboutPage.imageCarouselEditIcon
      ).toBeVisible({
        timeout: 10000,
      });

      // Click the edit icon to open the image upload modal.
      await organizationPage.aboutPage.imageCarouselEditIcon.click();

      // Verify the image upload modal appears.
      await expect(organizationPage.uploadImageModal.modal).toBeVisible();

      // Verify the image upload form is visible.
      const imageUploadInput =
        organizationPage.uploadImageModal.imageUploadInput(
          organizationPage.uploadImageModal.modal
        );
      await expect(imageUploadInput).toBeEnabled();

      // Count how many server-side images are already in the modal.
      // This is the real-image baseline (placeholders are not counted here).
      const existingUploadEntriesCount = await organizationPage.uploadImageModal
        .getUploadedImages(organizationPage.uploadImageModal.modal)
        .count();

      await imageUploadInput.setInputFiles(tinyPng("file.png"));

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

      // Wait for the modal to close. The modal only closes after uploadImages
      // awaits both the POST and the subsequent data refresh, so a successful
      // close is proof the upload reached the server.
      await expect(organizationPage.uploadImageModal.modal).not.toBeVisible({
        timeout: 10000,
      });

      // Use the modal's real-image count (not the carousel baseline) to build
      // the expected slide count, because the carousel may have been showing
      // placeholder slides before any real image was uploaded.
      await expect(page.getByTestId("image-carousel-main")).toHaveAttribute(
        "data-slide-count",
        String(existingUploadEntriesCount + 1)
      );

      // Open the modal and remove the first image.
      await organizationPage.aboutPage.imageCarouselEditIcon.click();
      await organizationPage.uploadImageModal
        .removeButton(organizationPage.uploadImageModal.modal, 0)
        .click();

      // Number of files in the modal goes back to the original count.
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

      // Carousel must return to its pre-upload state (real images or placeholders).
      await expect(page.getByTestId("image-carousel-main")).toHaveAttribute(
        "data-slide-count",
        String(initialCarouselCount)
      );
    });

    test("User can upload multiple images (CREATE, UPDATE, DELETE)", async ({
      page,
    }) => {
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
      await organizationPage.aboutPage.imageCarouselEditIcon.click();

      // Verify the image upload modal appears.
      await expect(organizationPage.uploadImageModal.modal).toBeVisible();

      // Verify the image upload form is visible.
      const imageUploadInput =
        organizationPage.uploadImageModal.imageUploadInput(
          organizationPage.uploadImageModal.modal
        );
      await expect(imageUploadInput).toBeEnabled();

      // Count how many server-side images are already in the modal.
      // Use this as the real-image baseline (placeholders are not counted here).
      const existingUploadEntriesCount = await organizationPage.uploadImageModal
        .getUploadedImages(organizationPage.uploadImageModal.modal)
        .count();

      const filePng = [
        tinyPng("file1.png"),
        tinyPng("file2.png"),
        tinyPng("file3.png"),
      ];
      // Upload 3 images.
      await imageUploadInput.setInputFiles(filePng);

      // New entries appear in the modal.
      await expect(
        organizationPage.uploadImageModal.getUploadedImages(
          organizationPage.uploadImageModal.modal
        )
      ).toHaveCount(existingUploadEntriesCount + filePng.length);

      // Upload image.
      await organizationPage.uploadImageModal
        .uploadButton(organizationPage.uploadImageModal.modal)
        .click();

      // Wait for the modal to close. The modal only closes after uploadImages
      // awaits both the POST and the subsequent data refresh, so a successful
      // close is proof the upload reached the server.
      await expect(organizationPage.uploadImageModal.modal).not.toBeVisible({
        timeout: 10000,
      });

      // Verify the carousel grew by exactly the number of uploaded files.
      // Use the modal's real-image count as the baseline (not the carousel's
      // pre-upload count, which may include placeholder slides).
      await expect(page.getByTestId("image-carousel-main")).toHaveAttribute(
        "data-slide-count",
        String(existingUploadEntriesCount + filePng.length)
      );

      // Pagination using dots.
      const dots = organizationPage.aboutPage.getImageCarouselBullets;

      if ((await dots.count()) > 1) {
        // Click second dot.
        await dots.nth(1).click();
        await expect(
          organizationPage.aboutPage.getImageCarouselImages.nth(1)
        ).toBeVisible();
      }
    });
  }
);
