// SPDX-License-Identifier: AGPL-3.0-or-later
import type { Page } from "@playwright/test";

import { getEnglishText } from "~/utils/i18n";

export const newOrganizationGroupsPage = (page: Page) => ({
  // MARK: Header Action

  newGroupButton: page.getByRole("link", {
    name: new RegExp(
      getEnglishText(
        "i18n.pages.organizations.groups.index.new_group_aria_label"
      ),
      "i"
    ),
  }),

  // MARK: Groups List

  groupsList: page.getByTestId("organization-groups-list"),
  groupCards: page.getByTestId("group-card"),

  // MARK: Group Card

  getGroupCard: (index: number) => page.getByTestId("group-card").nth(index),
  getGroupTitle: (index: number) =>
    page.getByTestId("group-card").nth(index).getByTestId("group-title"),
  getGroupLink: (index: number) =>
    page.getByTestId("group-card").nth(index).getByRole("link").first(),
  getGroupDescription: (index: number) =>
    page.getByTestId("group-card").nth(index).getByTestId("group-description"),
  getGroupEntityName: (index: number) =>
    page.getByTestId("group-card").nth(index).getByTestId("group-entity-name"),
  getGroupLocation: (index: number) =>
    page.getByTestId("group-card").nth(index).locator("[class*='location']"),

  // MARK: Group Menu

  getGroupMenuButton: (index: number) =>
    page.getByTestId("group-card").nth(index).getByTestId("menu-button"),
  getGroupMenuTooltip: (index: number) =>
    page.getByTestId("group-card").nth(index).getByTestId("menu-tooltip"),
  getGroupShareButton: (index: number) =>
    page
      .getByTestId("group-card")
      .nth(index)
      .getByRole("button", {
        name: new RegExp(getEnglishText("i18n._global.share"), "i"),
      }),

  // MARK: Empty State

  emptyState: page.getByTestId("empty-state"),
  emptyStateMessage: page.getByTestId("empty-state").locator("p, div").first(),

  // MARK: Utility

  getGroupCount: async () => {
    try {
      return await page.getByTestId("group-card").count();
    } catch {
      return 0;
    }
  },

  navigateToGroup: async (index: number) => {
    // On mobile viewports, ensure sidebar doesn't block clicks
    const viewport = page.viewportSize();
    if (viewport && viewport.width <= 1024) {
      // Move mouse to right side of screen to trigger sidebar collapse
      await page.mouse.move(viewport.width - 50, viewport.height / 2);
      await page.waitForTimeout(500); // Wait for sidebar animation
    }

    const groupLink = page
      .getByTestId("group-card")
      .nth(index)
      .getByRole("link")
      .first();

    // Use force to bypass sidebar/element interception on mobile viewports
    // This is safe because we're clicking a visible, valid navigation link
    await groupLink.click({ force: true });
  },
});
