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
    // Import sidebar page object
    const { newSidebarLeft } = await import(
      "~/test-e2e/component-objects/SidebarLeft"
    );
    const sidebarLeft = newSidebarLeft(page);

    // Check if we're on a mobile/tablet viewport where sidebar might be expanded
    const viewport = page.viewportSize();
    if (viewport && viewport.width < 1280) {
      // Check if sidebar is expanded and collapse it if needed
      const isExpanded = await sidebarLeft.isExpanded();
      if (isExpanded) {
        // On mobile/tablet, we need to set both collapsed states
        // First click the lock toggle to set collapsedSwitch
        await sidebarLeft.lockToggle.click();

        // Then trigger mouse leave event to set collapsed state
        await page.evaluate(() => {
          const sidebar = document.getElementById("sidebar-left");
          if (sidebar) {
            const event = new Event("mouseleave", { bubbles: true });
            sidebar.dispatchEvent(event);
          }
        });

        await sidebarLeft.expectIsCollapsed();
      }
    }

    const groupLink = page
      .getByTestId("group-card")
      .nth(index)
      .getByRole("link")
      .first();
    await groupLink.click();
  },
});
