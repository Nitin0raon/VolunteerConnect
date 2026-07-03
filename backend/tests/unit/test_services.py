"""
Unit tests for service layer business logic.
"""
from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth import get_user_model

from apps.accounts.models import UserRole
from apps.ngos.models import NGOProfile, NGOStatus
from apps.programs.models import Program, ProgramStatus
from apps.participation.models import Participation, ParticipationStatus
from services.participation_service import ParticipationService
from services.program_service import ProgramService
from services.ngo_service import NGOService
from utils.exceptions import (
    ConflictException, ServiceException, ResourceNotFoundException, PermissionDeniedException,
)

User = get_user_model()


def make_ngo_user(email='ngo@test.com'):
    user = User.objects.create_user(
        email=email, password='Pass123!', first_name='NGO', last_name='Owner', role=UserRole.NGO,
    )
    profile = NGOProfile.objects.create(
        user=user, organization_name='Hope Org', description='desc', status=NGOStatus.APPROVED,
    )
    return user, profile


def make_volunteer(email='vol@test.com'):
    return User.objects.create_user(
        email=email, password='Pass123!', first_name='Vol', last_name='Unteer', role=UserRole.VOLUNTEER,
    )


def make_program(ngo_profile, title='Beach Cleanup', capacity=5):
    return Program.objects.create(
        ngo=ngo_profile, title=title, description='Clean the beach', capacity=capacity,
    )


class NGOServiceTest(TestCase):

    def test_create_profile_sets_pending(self):
        user = User.objects.create_user(
            email='ngo2@test.com', password='Pass123!', first_name='A', last_name='B', role=UserRole.NGO,
        )
        profile = NGOService.create_profile(user, {
            'organization_name': 'New Org', 'description': 'desc',
        })
        self.assertEqual(profile.status, NGOStatus.PENDING)

    def test_create_profile_duplicate_raises(self):
        user = User.objects.create_user(
            email='ngo3@test.com', password='Pass123!', first_name='A', last_name='B', role=UserRole.NGO,
        )
        NGOService.create_profile(user, {'organization_name': 'Org', 'description': 'desc'})
        with self.assertRaises(ConflictException):
            NGOService.create_profile(user, {'organization_name': 'Org2', 'description': 'desc'})

    @patch('services.ngo_service.EmailService.send_ngo_approved')
    def test_approve_ngo_sets_status(self, mock_email):
        user = User.objects.create_user(
            email='ngo4@test.com', password='Pass123!', first_name='A', last_name='B', role=UserRole.NGO,
        )
        profile = NGOProfile.objects.create(user=user, organization_name='Org', description='desc')
        admin = User.objects.create_superuser(email='admin@test.com', password='Admin123!', first_name='A', last_name='B')

        result = NGOService.approve_ngo(profile.id, approved_by=admin)
        self.assertEqual(result.status, NGOStatus.APPROVED)
        mock_email.assert_called_once()

    def test_approve_already_approved_raises(self):
        _, profile = make_ngo_user()
        admin = User.objects.create_superuser(email='admin@test.com', password='Admin123!', first_name='A', last_name='B')
        with self.assertRaises(ConflictException):
            NGOService.approve_ngo(profile.id, approved_by=admin)


class ProgramServiceTest(TestCase):

    @patch('services.program_service.invalidate_ngo_dashboard')
    def test_create_program(self, mock_cache):
        user, profile = make_ngo_user()
        program = ProgramService.create_program(user, {'title': 'Park Cleanup', 'description': 'desc', 'capacity': 10})
        self.assertEqual(program.title, 'Park Cleanup')
        self.assertEqual(program.ngo, profile)

    def test_create_program_unapproved_raises(self):
        user = User.objects.create_user(
            email='pending@test.com', password='Pass123!', first_name='A', last_name='B', role=UserRole.NGO,
        )
        NGOProfile.objects.create(user=user, organization_name='Pending Org', description='desc')
        with self.assertRaises(PermissionDeniedException):
            ProgramService.create_program(user, {'title': 'X', 'description': 'y', 'capacity': 5})

    @patch('services.program_service.invalidate_ngo_dashboard')
    def test_update_program_capacity_below_participants_raises(self, mock_cache):
        user, profile = make_ngo_user()
        program = make_program(profile, capacity=5)
        program.current_participants = 4
        program.save()
        with self.assertRaises(ServiceException):
            ProgramService.update_program(program.id, user, {'capacity': 2})

    @patch('services.program_service.invalidate_ngo_dashboard')
    def test_delete_program_with_participants_raises(self, mock_cache):
        user, profile = make_ngo_user()
        program = make_program(profile)
        program.current_participants = 1
        program.save()
        with self.assertRaises(ServiceException):
            ProgramService.delete_program(program.id, user)

    def test_get_program_not_found_raises(self):
        with self.assertRaises(ResourceNotFoundException):
            ProgramService.get_program_by_id(99999)


class ParticipationServiceTest(TestCase):

    def setUp(self):
        self.ngo_user, self.ngo_profile = make_ngo_user()
        self.volunteer = make_volunteer()
        self.program = make_program(self.ngo_profile, capacity=2)

    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_join_program_success(self, m1, m2, mock_email):
        participation = ParticipationService.join_program(self.volunteer, self.program.id)
        self.assertEqual(participation.status, ParticipationStatus.JOINED)
        self.program.refresh_from_db()
        self.assertEqual(self.program.current_participants, 1)

    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_join_full_program_goes_to_waitlist(self, m1, m2, mock_email):
        v2 = make_volunteer('v2@test.com')
        v3 = make_volunteer('v3@test.com')
        ParticipationService.join_program(self.volunteer, self.program.id)
        ParticipationService.join_program(v2, self.program.id)
        # Program is now full (capacity=2)
        p = ParticipationService.join_program(v3, self.program.id)
        self.assertEqual(p.status, ParticipationStatus.WAITLISTED)
        self.assertEqual(p.waitlist_position, 1)

    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_double_join_raises(self, m1, m2, mock_email):
        ParticipationService.join_program(self.volunteer, self.program.id)
        with self.assertRaises(ConflictException):
            ParticipationService.join_program(self.volunteer, self.program.id)

    @patch('services.participation_service.EmailService.send_volunteer_left')
    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.EmailService.send_waitlist_promoted')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_leave_promotes_waitlisted(self, m1, m2, mock_promoted, mock_left, mock_joined):
        v2 = make_volunteer('v2@test.com')
        v3 = make_volunteer('v3@test.com')
        ParticipationService.join_program(self.volunteer, self.program.id)
        ParticipationService.join_program(v2, self.program.id)
        ParticipationService.join_program(v3, self.program.id)  # goes to waitlist

        ParticipationService.leave_program(self.volunteer, self.program.id)

        promoted = Participation.objects.get(volunteer=v3, program=self.program)
        self.assertEqual(promoted.status, ParticipationStatus.JOINED)
        mock_promoted.assert_called_once()

    def test_join_nonexistent_program_raises(self):
        with self.assertRaises(ResourceNotFoundException):
            ParticipationService.join_program(self.volunteer, 99999)

    def test_leave_not_enrolled_raises(self):
        with self.assertRaises(ConflictException):
            ParticipationService.leave_program(self.volunteer, self.program.id)
