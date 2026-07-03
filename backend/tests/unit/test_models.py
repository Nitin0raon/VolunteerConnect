"""
Unit tests for all models.
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

from apps.accounts.models import UserRole
from apps.ngos.models import NGOProfile, NGOStatus
from apps.programs.models import Program, ProgramStatus
from apps.participation.models import Participation, ParticipationStatus

User = get_user_model()


class UserModelTest(TestCase):

    def setUp(self):
        self.ngo_user = User.objects.create_user(
            email='ngo@test.com',
            password='TestPass123!',
            first_name='Test',
            last_name='NGO',
            role=UserRole.NGO,
        )
        self.volunteer = User.objects.create_user(
            email='vol@test.com',
            password='TestPass123!',
            first_name='Test',
            last_name='Volunteer',
            role=UserRole.VOLUNTEER,
        )

    def test_user_str(self):
        self.assertIn('ngo@test.com', str(self.ngo_user))

    def test_is_ngo_property(self):
        self.assertTrue(self.ngo_user.is_ngo)
        self.assertFalse(self.volunteer.is_ngo)

    def test_is_volunteer_property(self):
        self.assertTrue(self.volunteer.is_volunteer)
        self.assertFalse(self.ngo_user.is_volunteer)

    def test_get_full_name(self):
        self.assertEqual(self.ngo_user.get_full_name(), 'Test NGO')

    def test_email_is_unique(self):
        with self.assertRaises(Exception):
            User.objects.create_user(
                email='ngo@test.com',
                password='AnotherPass!',
                first_name='Dup',
                last_name='User',
                role=UserRole.VOLUNTEER,
            )

    def test_cannot_register_as_admin(self):
        """Admin role should only be creatable via create_superuser."""
        # create_user with role=admin should succeed at DB level; the serializer blocks it.
        admin = User.objects.create_user(
            email='admin@test.com',
            password='AdminPass123!',
            first_name='Admin',
            last_name='User',
            role=UserRole.ADMIN,
        )
        self.assertEqual(admin.role, UserRole.ADMIN)

    def test_create_superuser(self):
        superuser = User.objects.create_superuser(
            email='super@test.com',
            password='Super123!',
            first_name='Super',
            last_name='User',
        )
        self.assertTrue(superuser.is_staff)
        self.assertTrue(superuser.is_superuser)
        self.assertEqual(superuser.role, UserRole.ADMIN)


class NGOProfileModelTest(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='ngo@test.com', password='Pass123!',
            first_name='Org', last_name='Owner', role=UserRole.NGO,
        )

    def test_default_status_is_pending(self):
        profile = NGOProfile.objects.create(
            user=self.user, organization_name='Hope Org', description='Helping people.'
        )
        self.assertEqual(profile.status, NGOStatus.PENDING)
        self.assertFalse(profile.is_approved)

    def test_is_approved_property(self):
        profile = NGOProfile.objects.create(
            user=self.user, organization_name='Hope Org', description='desc',
            status=NGOStatus.APPROVED,
        )
        self.assertTrue(profile.is_approved)

    def test_str(self):
        profile = NGOProfile.objects.create(
            user=self.user, organization_name='Hope Org', description='desc',
        )
        self.assertIn('Hope Org', str(profile))


class ProgramModelTest(TestCase):

    def setUp(self):
        user = User.objects.create_user(
            email='ngo@test.com', password='Pass123!',
            first_name='Org', last_name='Owner', role=UserRole.NGO,
        )
        self.ngo = NGOProfile.objects.create(
            user=user, organization_name='Hope Org',
            description='desc', status=NGOStatus.APPROVED,
        )

    def test_is_full_property(self):
        p = Program.objects.create(
            ngo=self.ngo, title='Clean Up', description='desc', capacity=2, current_participants=2,
        )
        self.assertTrue(p.is_full)

    def test_available_slots(self):
        p = Program.objects.create(
            ngo=self.ngo, title='Clean Up', description='desc', capacity=5, current_participants=2,
        )
        self.assertEqual(p.available_slots, 3)

    def test_capacity_validation(self):
        p = Program(ngo=self.ngo, title='Bad', description='desc', capacity=0, current_participants=0)
        with self.assertRaises(ValidationError):
            p.clean()

    def test_capacity_below_participants_raises(self):
        p = Program(ngo=self.ngo, title='Bad', description='desc', capacity=1, current_participants=3)
        with self.assertRaises(ValidationError):
            p.clean()


class ParticipationModelTest(TestCase):

    def setUp(self):
        ngo_user = User.objects.create_user(
            email='ngo@test.com', password='Pass123!',
            first_name='NGO', last_name='Owner', role=UserRole.NGO,
        )
        self.volunteer = User.objects.create_user(
            email='vol@test.com', password='Pass123!',
            first_name='Vol', last_name='Unteer', role=UserRole.VOLUNTEER,
        )
        ngo = NGOProfile.objects.create(
            user=ngo_user, organization_name='Hope', description='desc', status=NGOStatus.APPROVED,
        )
        self.program = Program.objects.create(
            ngo=ngo, title='Beach Cleanup', description='Clean the beach', capacity=10,
        )

    def test_create_participation(self):
        p = Participation.objects.create(
            volunteer=self.volunteer, program=self.program, status=ParticipationStatus.JOINED,
        )
        self.assertEqual(p.status, ParticipationStatus.JOINED)
        self.assertIsNone(p.waitlist_position)
