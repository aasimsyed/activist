# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Test cases for the OrganizationText model.
"""

import pytest

from communities.organizations.factories import (
    OrganizationFactory,
    OrganizationTextFactory,
)

pytestmark = pytest.mark.django_db


def test_org_text_str() -> None:
    """
    Test string representation of OrganizationText model.
    """
    org_text = OrganizationTextFactory.build()
    assert hasattr(org_text, "description")


def test_org_text_languages() -> None:
    """
    Test organization text with different ISO languages.
    """
    org = OrganizationFactory()

    # 1. Test default language text.
    org.default_iso = "eng"
    org.save()
    default_text = OrganizationTextFactory(
        org=org,
        iso="eng",
        description="Default description",
        get_involved="Get involved text",
        donate_prompt="Donation prompt",
    )
    assert default_text.iso == "eng"
    assert default_text.description == "Default description"
    assert org.default_iso == default_text.iso

    # 2. Test additional language text.
    secondary_text = OrganizationTextFactory(
        org=org,
        iso="spa",
        description="Description",
        get_involved="How to participate",
        donate_prompt="Donation prompt",
    )
    assert secondary_text.iso == "spa"
    assert secondary_text.description == "Description"
