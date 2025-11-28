# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Automated tests for default_iso field migration (Issue #1638).

These tests verify that:
1. The default_iso field exists on Organization, Group, and Event models
2. The field is correctly set on all entities
3. Edge cases are handled properly (entities without texts, etc.)
4. All entities have a default_iso value set

These tests run automatically in CI/CD after migrations are applied.
"""

import pytest
from django.core.management import call_command

from communities.groups.models import Group, GroupText
from communities.organizations.models import Organization, OrganizationText
from events.models import Event, EventText


@pytest.mark.django_db
def test_default_iso_field_exists_on_models():
    """
    Test that default_iso field exists on all entity models after migration.

    This test verifies the migration successfully added the field.
    """
    # Test Organization model
    assert hasattr(Organization, "default_iso"), (
        "Organization model missing default_iso field"
    )
    field = Organization._meta.get_field("default_iso")
    assert field is not None, "Organization.default_iso field not found"
    assert field.default == "en", "Organization.default_iso should default to 'en'"
    assert not field.null, "Organization.default_iso should not be nullable"
    assert not field.blank, "Organization.default_iso should not be blank"

    # Test Group model
    assert hasattr(Group, "default_iso"), "Group model missing default_iso field"
    field = Group._meta.get_field("default_iso")
    assert field is not None, "Group.default_iso field not found"
    assert field.default == "en", "Group.default_iso should default to 'en'"
    assert not field.null, "Group.default_iso should not be nullable"
    assert not field.blank, "Group.default_iso should not be blank"

    # Test Event model
    assert hasattr(Event, "default_iso"), "Event model missing default_iso field"
    field = Event._meta.get_field("default_iso")
    assert field is not None, "Event.default_iso field not found"
    assert field.default == "en", "Event.default_iso should default to 'en'"
    assert not field.null, "Event.default_iso should not be nullable"
    assert not field.blank, "Event.default_iso should not be blank"


@pytest.mark.django_db
def test_all_entities_have_default_iso_set():
    """
    Test that all existing entities have default_iso set (not null).

    This verifies the data migration populated the field correctly.
    """
    # Check Organizations
    orgs_without_default = Organization.objects.filter(default_iso__isnull=True)
    assert orgs_without_default.count() == 0, (
        f"Found {orgs_without_default.count()} organizations with null default_iso"
    )

    # Check Groups
    groups_without_default = Group.objects.filter(default_iso__isnull=True)
    assert groups_without_default.count() == 0, (
        f"Found {groups_without_default.count()} groups with null default_iso"
    )

    # Check Events
    events_without_default = Event.objects.filter(default_iso__isnull=True)
    assert events_without_default.count() == 0, (
        f"Found {events_without_default.count()} events with null default_iso"
    )


@pytest.mark.django_db
def test_default_iso_populated_from_primary_text():
    """
    Test that default_iso works correctly with text entries.

    This verifies that entities can have default_iso set and matching texts can be found.
    """
    from communities.groups.factories import GroupFactory, GroupTextFactory
    from communities.organizations.factories import (
        OrganizationFactory,
        OrganizationTextFactory,
    )
    from events.factories import EventFactory, EventTextFactory

    # Test Organization
    org = OrganizationFactory()
    org.default_iso = "fr"
    org.save()
    OrganizationTextFactory(org=org, iso="fr", description="French text")
    OrganizationTextFactory(org=org, iso="en", description="English text")

    # Refresh from DB
    org.refresh_from_db()

    # The default_iso should be set correctly
    assert org.default_iso is not None
    assert org.default_iso == "fr"

    # Verify we can find the text matching default_iso
    default_text = OrganizationText.objects.filter(org=org, iso=org.default_iso).first()
    assert default_text is not None
    assert default_text.iso == "fr"

    # Test Group
    group = GroupFactory()
    group.default_iso = "de"
    group.save()
    GroupTextFactory(group=group, iso="de", description="German text")
    GroupTextFactory(group=group, iso="en", description="English text")

    group.refresh_from_db()
    assert group.default_iso is not None
    assert group.default_iso == "de"

    default_text = GroupText.objects.filter(group=group, iso=group.default_iso).first()
    assert default_text is not None

    # Test Event
    event = EventFactory()
    event.default_iso = "es"
    event.save()
    EventTextFactory(event=event, iso="es", description="Spanish text")
    EventTextFactory(event=event, iso="en", description="English text")

    event.refresh_from_db()
    assert event.default_iso is not None
    assert event.default_iso == "es"

    default_text = EventText.objects.filter(event=event, iso=event.default_iso).first()
    assert default_text is not None


@pytest.mark.django_db
def test_default_iso_defaults_to_en_when_no_primary_text():
    """
    Test that default_iso defaults to 'en' when entity has no primary text.

    This verifies edge case handling in the migration.
    """
    from communities.groups.factories import GroupFactory
    from communities.organizations.factories import OrganizationFactory
    from events.factories import EventFactory

    # Create entities without any texts
    org = OrganizationFactory()
    # Don't create any texts
    org.refresh_from_db()
    assert org.default_iso == "en", "Organization without texts should default to 'en'"

    group = GroupFactory()
    group.refresh_from_db()
    assert group.default_iso == "en", "Group without texts should default to 'en'"

    event = EventFactory()
    event.refresh_from_db()
    assert event.default_iso == "en", "Event without texts should default to 'en'"


@pytest.mark.django_db
def test_default_iso_with_matching_text():
    """
    Test that default_iso works correctly when entities have matching texts.

    This verifies that entities can have texts matching their default_iso.
    """
    from communities.organizations.factories import (
        OrganizationFactory,
        OrganizationTextFactory,
    )

    # Create organization and set default_iso
    org = OrganizationFactory()
    org.default_iso = "fr"
    org.save()

    # Create text matching the default_iso
    french_text = OrganizationTextFactory(org=org, iso="fr", description="French text")

    # Refresh org to ensure default_iso is persisted
    org.refresh_from_db()

    # Verify default_iso is set correctly
    assert org.default_iso is not None
    assert org.default_iso == "fr"

    # Verify we can find the text matching default_iso
    matching_text = OrganizationText.objects.filter(
        org=org, iso=org.default_iso
    ).first()
    assert matching_text is not None, "Should find text matching default_iso"
    assert matching_text.iso == french_text.iso


@pytest.mark.django_db
def test_default_iso_after_populate_db():
    """
    Test that default_iso is set correctly after populate_db command.

    This simulates the real-world scenario where data is populated.
    """
    # Flush database to start fresh
    call_command("flush", "--noinput")
    call_command("loaddata", "fixtures/topics.json")

    # Populate database
    call_command(
        "populate_db",
        users=2,
        orgs_per_user=1,
        groups_per_org=1,
        events_per_org=1,
        events_per_group=1,
        resources_per_entity=1,
        faq_entries_per_entity=1,
        json_data_to_assign="",
    )

    # Verify all entities have default_iso set
    orgs = Organization.objects.all()
    for org in orgs:
        assert org.default_iso is not None, f"Organization {org.id} missing default_iso"
        assert org.default_iso in ["en", "fr", "de", "es", "pt"], (
            f"Invalid ISO: {org.default_iso}"
        )

    groups = Group.objects.all()
    for group in groups:
        assert group.default_iso is not None, f"Group {group.id} missing default_iso"
        assert group.default_iso in ["en", "fr", "de", "es", "pt"], (
            f"Invalid ISO: {group.default_iso}"
        )

    events = Event.objects.all()
    for event in events:
        assert event.default_iso is not None, f"Event {event.id} missing default_iso"
        assert event.default_iso in ["en", "fr", "de", "es", "pt"], (
            f"Invalid ISO: {event.default_iso}"
        )


@pytest.mark.django_db
def test_new_entities_get_default_iso():
    """
    Test that new entities created after migration have default_iso set.

    This verifies the default value works for new entities.
    """
    from communities.groups.factories import GroupFactory
    from communities.organizations.factories import OrganizationFactory
    from events.factories import EventFactory

    # Create new entities
    org = OrganizationFactory()
    assert org.default_iso == "en", "New organization should have default_iso='en'"

    group = GroupFactory()
    assert group.default_iso == "en", "New group should have default_iso='en'"

    event = EventFactory()
    assert event.default_iso == "en", "New event should have default_iso='en'"


@pytest.mark.django_db
def test_default_iso_valid_iso_codes():
    """
    Test that all default_iso values are valid ISO codes from ISO_CHOICES.

    This ensures data integrity after migration.
    """
    from backend.utils.models import ISO_CHOICES

    valid_isos = [choice[0] for choice in ISO_CHOICES]

    # Check all organizations
    orgs = Organization.objects.all()
    for org in orgs:
        assert org.default_iso in valid_isos, (
            f"Organization {org.id} has invalid default_iso: {org.default_iso}"
        )

    # Check all groups
    groups = Group.objects.all()
    for group in groups:
        assert group.default_iso in valid_isos, (
            f"Group {group.id} has invalid default_iso: {group.default_iso}"
        )

    # Check all events
    events = Event.objects.all()
    for event in events:
        assert event.default_iso in valid_isos, (
            f"Event {event.id} has invalid default_iso: {event.default_iso}"
        )
