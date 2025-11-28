# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Test cases for the GroupText model.
"""

import pytest

from communities.groups.factories import GroupFactory, GroupTextFactory

pytestmark = pytest.mark.django_db


def test_group_text_str() -> None:
    """
    Test string representation of GroupText model.
    """
    group_text = GroupTextFactory.build()
    assert hasattr(group_text, "description")


def test_group_text_languages() -> None:
    """
    Test group text with different ISO languages.
    """
    group = GroupFactory()

    # 1. Test default language text.
    group.default_iso = "eng"
    group.save()
    default_text = GroupTextFactory(
        group=group,
        iso="eng",
        description="Default description",
        get_involved="Get involved text",
        donate_prompt="Donation prompt",
    )
    assert default_text.iso == "eng"
    assert default_text.description == "Default description"
    assert group.default_iso == default_text.iso

    # 2. Test additional language text.
    secondary_text = GroupTextFactory(
        group=group,
        iso="spa",
        description="Description",
        get_involved="How to participate",
        donate_prompt="Donation prompt",
    )
    assert secondary_text.iso == "spa"
    assert secondary_text.description == "Description"


def test_group_text_str_representation() -> None:
    """
    Test string representation of GroupText model.
    """
    group = GroupFactory()
    group_text = GroupTextFactory(group=group, iso="eng")

    assert str(group_text) == f"{group_text.group} - {group_text.iso}"
