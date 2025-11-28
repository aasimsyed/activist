# SPDX-License-Identifier: AGPL-3.0-or-later
"""
Management command to verify default_iso field migration (Issue #1638).

This command can be run on remote servers to verify that:
1. The default_iso field exists on all entity models
2. All entities have default_iso set (no null values)
3. default_iso values are valid ISO codes
4. default_iso has matching text entries

Usage:
    python manage.py verify_default_iso_migration
    python manage.py verify_default_iso_migration --verbose
    python manage.py verify_default_iso_migration --fail-fast
"""

from backend.utils.models import ISO_CHOICES
from django.core.management.base import BaseCommand, CommandError
from django.db.models import Count

from communities.groups.models import Group, GroupText
from communities.organizations.models import Organization, OrganizationText
from events.models import Event, EventText


class Command(BaseCommand):
    """Management command to verify default_iso migration."""

    help = "Verify that default_iso field migration completed successfully"

    def add_arguments(self, parser):
        """Add command arguments."""
        parser.add_argument(
            "--verbose",
            action="store_true",
            help="Show detailed output for each entity",
        )
        parser.add_argument(
            "--fail-fast",
            action="store_true",
            help="Stop at first error instead of continuing",
        )

    def handle(self, *args, **options):
        """Execute the verification command."""
        verbose = options["verbose"]
        fail_fast = options["fail_fast"]
        errors = []
        warnings = []

        self.stdout.write(self.style.SUCCESS("\n" + "=" * 70))
        self.stdout.write(self.style.SUCCESS("Verifying default_iso Field Migration"))
        self.stdout.write(self.style.SUCCESS("=" * 70 + "\n"))

        # Test 1: Verify field exists on models
        self.stdout.write("1. Checking if default_iso field exists on models...")
        try:
            self._verify_field_exists()
            self.stdout.write(
                self.style.SUCCESS("   ✓ All models have default_iso field\n")
            )
        except CommandError as e:
            errors.append(str(e))
            self.stdout.write(self.style.ERROR(f"   ✗ {e}\n"))
            if fail_fast:
                self._exit_with_errors(errors, warnings)

        # Test 2: Check for null values
        self.stdout.write("2. Checking for null default_iso values...")
        try:
            null_counts = self._check_null_values()
            if sum(null_counts.values()) == 0:
                self.stdout.write(
                    self.style.SUCCESS("   ✓ No null values found in default_iso\n")
                )
            else:
                error_msg = "   ✗ Found entities with null default_iso:"
                for model, count in null_counts.items():
                    if count > 0:
                        error_msg += f"\n      - {model}: {count} entities"
                errors.append(error_msg)
                self.stdout.write(self.style.ERROR(error_msg + "\n"))
                if fail_fast:
                    self._exit_with_errors(errors, warnings)
        except Exception as e:
            errors.append(f"Error checking null values: {e}")
            self.stdout.write(self.style.ERROR(f"   ✗ Error: {e}\n"))
            if fail_fast:
                self._exit_with_errors(errors, warnings)

        # Test 3: Verify valid ISO codes
        self.stdout.write("3. Verifying default_iso values are valid ISO codes...")
        try:
            invalid_isos = self._check_valid_iso_codes()
            if not invalid_isos:
                self.stdout.write(
                    self.style.SUCCESS("   ✓ All default_iso values are valid\n")
                )
            else:
                error_msg = "   ✗ Found invalid ISO codes:"
                for model, isos in invalid_isos.items():
                    error_msg += f"\n      - {model}: {', '.join(set(isos))}"
                errors.append(error_msg)
                self.stdout.write(self.style.ERROR(error_msg + "\n"))
                if fail_fast:
                    self._exit_with_errors(errors, warnings)
        except Exception as e:
            errors.append(f"Error checking ISO codes: {e}")
            self.stdout.write(self.style.ERROR(f"   ✗ Error: {e}\n"))
            if fail_fast:
                self._exit_with_errors(errors, warnings)

        # Test 4: Check that default_iso has matching texts
        self.stdout.write("4. Checking that default_iso has matching texts...")
        try:
            missing_texts = self._check_default_iso_has_matching_texts(verbose)
            if not missing_texts:
                self.stdout.write(
                    self.style.SUCCESS(
                        "   ✓ All entities have texts matching their default_iso\n"
                    )
                )
            else:
                warning_msg = (
                    "   ⚠ Found entities where default_iso has no matching text:"
                )
                for model, entities in missing_texts.items():
                    warning_msg += f"\n      - {model}: {len(entities)} entities"
                    if verbose:
                        for entity_id, details in list(entities.items())[:5]:
                            warning_msg += f"\n        * {entity_id}: {details}"
                        if len(entities) > 5:
                            warning_msg += f"\n        ... and {len(entities) - 5} more"
                warnings.append(warning_msg)
                self.stdout.write(self.style.WARNING(warning_msg + "\n"))
        except Exception as e:
            warnings.append(f"Warning checking primary text alignment: {e}")
            self.stdout.write(self.style.WARNING(f"   ⚠ Error: {e}\n"))

        # Test 5: Statistics
        self.stdout.write("5. Migration statistics...")
        self._show_statistics(verbose)

        # Summary
        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.SUCCESS("Verification Summary"))
        self.stdout.write("=" * 70)

        if errors:
            self.stdout.write(self.style.ERROR(f"\n✗ ERRORS FOUND: {len(errors)}"))
            for error in errors:
                self.stdout.write(self.style.ERROR(f"  - {error}"))
        else:
            self.stdout.write(self.style.SUCCESS("\n✓ No errors found"))

        if warnings:
            self.stdout.write(self.style.WARNING(f"\n⚠ WARNINGS: {len(warnings)}"))
            for warning in warnings:
                self.stdout.write(self.style.WARNING(f"  - {warning}"))
        else:
            self.stdout.write(self.style.SUCCESS("✓ No warnings"))

        self.stdout.write("\n" + "=" * 70 + "\n")

        if errors:
            raise CommandError(f"Verification failed with {len(errors)} error(s)")

    def _verify_field_exists(self):
        """Verify that default_iso field exists on all models."""
        if not hasattr(Organization, "default_iso"):
            raise CommandError("Organization model missing default_iso field")
        if not hasattr(Group, "default_iso"):
            raise CommandError("Group model missing default_iso field")
        if not hasattr(Event, "default_iso"):
            raise CommandError("Event model missing default_iso field")

        # Verify field properties
        org_field = Organization._meta.get_field("default_iso")
        if org_field.null:
            raise CommandError("Organization.default_iso should not be nullable")
        if org_field.default != "en":
            raise CommandError(
                f"Organization.default_iso default should be 'en', got '{org_field.default}'"
            )

    def _check_null_values(self):
        """Check for null default_iso values."""
        return {
            "Organization": Organization.objects.filter(
                default_iso__isnull=True
            ).count(),
            "Group": Group.objects.filter(default_iso__isnull=True).count(),
            "Event": Event.objects.filter(default_iso__isnull=True).count(),
        }

    def _check_valid_iso_codes(self):
        """Check that all default_iso values are valid ISO codes."""
        valid_isos = {choice[0] for choice in ISO_CHOICES}
        invalid = {}

        # Check Organizations
        org_invalid = list(
            Organization.objects.exclude(default_iso__in=valid_isos).values_list(
                "default_iso", flat=True
            )
        )
        if org_invalid:
            invalid["Organization"] = org_invalid

        # Check Groups
        group_invalid = list(
            Group.objects.exclude(default_iso__in=valid_isos).values_list(
                "default_iso", flat=True
            )
        )
        if group_invalid:
            invalid["Group"] = group_invalid

        # Check Events
        event_invalid = list(
            Event.objects.exclude(default_iso__in=valid_isos).values_list(
                "default_iso", flat=True
            )
        )
        if event_invalid:
            invalid["Event"] = event_invalid

        return invalid

    def _check_default_iso_has_matching_texts(self, verbose=False):
        """Check if default_iso has a matching text entry."""
        missing_texts = {}

        # Check Organizations
        org_missing = {}
        for org in Organization.objects.all():
            matching_texts = OrganizationText.objects.filter(
                org=org, iso=org.default_iso
            )
            if not matching_texts.exists():
                org_missing[str(org.id)] = (
                    f"default_iso='{org.default_iso}' but no text with this ISO exists"
                )
        if org_missing:
            missing_texts["Organization"] = org_missing

        # Check Groups
        group_missing = {}
        for group in Group.objects.all():
            matching_texts = GroupText.objects.filter(
                group=group, iso=group.default_iso
            )
            if not matching_texts.exists():
                group_missing[str(group.id)] = (
                    f"default_iso='{group.default_iso}' but no text with this ISO exists"
                )
        if group_missing:
            missing_texts["Group"] = group_missing

        # Check Events
        event_missing = {}
        for event in Event.objects.all():
            matching_texts = EventText.objects.filter(
                event=event, iso=event.default_iso
            )
            if not matching_texts.exists():
                event_missing[str(event.id)] = (
                    f"default_iso='{event.default_iso}' but no text with this ISO exists"
                )
        if event_missing:
            missing_texts["Event"] = event_missing

        return missing_texts

    def _show_statistics(self, verbose=False):
        """Show migration statistics."""
        valid_isos = [choice[0] for choice in ISO_CHOICES]

        for model_class, model_name in [
            (Organization, "Organization"),
            (Group, "Group"),
            (Event, "Event"),
        ]:
            total = model_class.objects.count()
            iso_counts = (
                model_class.objects.values("default_iso")
                .annotate(count=Count("default_iso"))
                .order_by("-count")
            )

            self.stdout.write(f"\n   {model_name}:")
            self.stdout.write(f"      Total entities: {total}")
            self.stdout.write("      Default ISO distribution:")

            for iso_count in iso_counts:
                iso = iso_count["default_iso"]
                count = iso_count["count"]
                percentage = (count / total * 100) if total > 0 else 0
                marker = "✓" if iso in valid_isos else "✗"
                self.stdout.write(
                    f"         {marker} {iso}: {count} ({percentage:.1f}%)"
                )

            if verbose and total > 0:
                # Show entities without any texts
                if model_name == "Organization":
                    without_texts = Organization.objects.annotate(
                        text_count=Count("texts")
                    ).filter(text_count=0)
                elif model_name == "Group":
                    without_texts = Group.objects.annotate(
                        text_count=Count("texts")
                    ).filter(text_count=0)
                else:  # Event
                    without_texts = Event.objects.annotate(
                        text_count=Count("texts")
                    ).filter(text_count=0)

                count_no_texts = without_texts.count()
                if count_no_texts > 0:
                    self.stdout.write(
                        f"      Entities without any texts: {count_no_texts}"
                    )

        self.stdout.write("")

    def _exit_with_errors(self, errors, warnings):
        """Exit with error summary."""
        self.stdout.write("\n" + "=" * 70)
        self.stdout.write(self.style.ERROR("VERIFICATION FAILED (fail-fast mode)"))
        self.stdout.write("=" * 70)
        if errors:
            for error in errors:
                self.stdout.write(self.style.ERROR(f"  ✗ {error}"))
        if warnings:
            for warning in warnings:
                self.stdout.write(self.style.WARNING(f"  ⚠ {warning}"))
        raise CommandError(f"Verification failed with {len(errors)} error(s)")
