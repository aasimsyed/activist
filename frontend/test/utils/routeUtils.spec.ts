// SPDX-License-Identifier: AGPL-3.0-or-later
import { describe, it, expect } from "vitest";

describe("utils/routeUtils", () => {
  it("isCurrentRoutePathSubpageOf returns true for valid subpages", async () => {
    const mod = await import("../../app/utils/routeUtils");
    expect(
      mod.isCurrentRoutePathSubpageOf("groups", "en___groups-members")
    ).toBe(true);
    expect(mod.isCurrentRoutePathSubpageOf("groups", "groups-search")).toBe(
      false
    );
    expect(mod.isCurrentRoutePathSubpageOf("groups", "groups-create")).toBe(
      false
    );
    expect(mod.isCurrentRoutePathSubpageOf("groups", "groups")).toBe(false);
  });

  it("currentRoutePathIncludes checks routeName contains path ignoring locale prefix", async () => {
    const mod = await import("../../app/utils/routeUtils");
    expect(mod.currentRoutePathIncludes("groups", "en___groups-members")).toBe(
      true
    );
    expect(mod.currentRoutePathIncludes("events", "en___groups-members")).toBe(
      false
    );
  });
});
