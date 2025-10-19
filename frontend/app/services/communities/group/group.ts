// SPDX-License-Identifier: AGPL-3.0-or-later
// Groups service: plain exported functions (no composables, no state).
// Uses services/http.ts helpers and centralizes error handling + normalization.

import type {
  GroupResponse,
  GroupsResponseBody,
  Group as GroupT,
} from "~/types/communities/group";

import { get, put, type AcceptedBody } from "~/services/http";
import { defaultGroupText } from "~/types/communities/group";
import { errorHandler } from "~/utils/errorHandler";

// MARK: Map API Response to Type

export function mapGroup(res: GroupResponse): GroupT {
  return {
    id: res.id,
    images: res.images ?? [],
    groupName: res.groupName,
    name: res.name,
    tagline: res.tagline,
    org: res.org,
    createdBy: res.createdBy,
    iconUrl: res.iconUrl,
    location: res.location,
    getInvolvedUrl: res.getInvolvedUrl,
    socialLinks: res.socialLinks,
    creationDate: res.creationDate,
    events: res.events ?? [],
    resources: res.resources ?? [],
    faqEntries: res.faqEntries ?? [],
    texts: res.texts?.[0] ?? defaultGroupText,
  };
}

// MARK: Get Group by ID

export async function getGroup(id: string): Promise<GroupT> {
  try {
    const res = await get<GroupResponse>(`/communities/groups/${id}`, {
      withoutAuth: true,
    });
    return mapGroup(res);
  } catch (e) {
    const err = errorHandler(e);
    throw err;
  }
}

// MARK: List All Groups

export async function listGroups(): Promise<GroupT[]> {
  try {
    const res = await get<GroupsResponseBody>(`/communities/group`, {
      withoutAuth: true,
    });
    return res.results.map(mapGroup);
  } catch (e) {
    const err = errorHandler(e);
    throw err;
  }
}

// MARK: Creates Group

// MARK: Update Group

/**
 * Update Group model fields directly (e.g., getInvolvedUrl).
 *
 * FIX: This function was added to solve the issue where group join URLs
 * were not persisting in the About section edit modal. The problem was
 * that getInvolvedUrl belongs to the Group model, not the GroupText model,
 * so it needs to be updated via the groups endpoint, not the group_texts endpoint.
 *
 * Related to: useGroupTextsMutations.ts - makes separate API calls for GroupText and Group models
 */
export async function updateGroup(
  groupId: string,
  data: { getInvolvedUrl?: string }
): Promise<void> {
  try {
    await put(
      `/communities/groups/${groupId}`,
      {
        getInvolvedUrl: data.getInvolvedUrl,
      } as AcceptedBody,
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    const err = errorHandler(e);
    throw err;
  }
}

// export async function createGroup(data: GroupCreateFormData): Promise<GroupT> {
//   try {
//     const payload = {
//       name: data.name,
//       location: data.location,
//       tagline: data.tagline,
//       social_accounts: data.social_accounts,
//       description: data.description,
//       topics: data.topics,
//       high_risk: false,
//       total_flags: 0,
//       acceptance_date: new Date()
//     }
//     const res = await post<GroupResponse, GroupCreateFormData>(`/communities/groups`, payload)
//     return mapGroup(res)
//   } catch (e) {
//     const err = errorHandler(e)
//     showToastError(err.message)
//     throw err
//   }
// }
