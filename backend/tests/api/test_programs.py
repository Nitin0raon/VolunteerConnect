"""
API tests for program CRUD and participation endpoints.
"""
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.accounts.models import UserRole
from apps.ngos.models import NGOProfile, NGOStatus
from apps.programs.models import Program, ProgramStatus

User = get_user_model()


def create_approved_ngo(email='ngo@test.com'):
    user = User.objects.create_user(
        email=email, password='Pass123!', first_name='NGO', last_name='Owner', role=UserRole.NGO,
    )
    profile = NGOProfile.objects.create(
        user=user, organization_name='Hope Org', description='desc', status=NGOStatus.APPROVED,
    )
    return user, profile


def create_volunteer(email='vol@test.com'):
    return User.objects.create_user(
        email=email, password='Pass123!', first_name='Vol', last_name='U', role=UserRole.VOLUNTEER,
    )


class ProgramCRUDTest(APITestCase):

    list_url = '/api/v1/programs/'

    def setUp(self):
        self.ngo_user, self.ngo_profile = create_approved_ngo()
        self.volunteer = create_volunteer()

    def test_create_program_as_approved_ngo(self):
        self.client.force_authenticate(user=self.ngo_user)
        data = {'title': 'Beach Cleanup', 'description': 'Clean the beach', 'capacity': 20}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['title'], 'Beach Cleanup')

    def test_create_program_as_volunteer_denied(self):
        self.client.force_authenticate(user=self.volunteer)
        data = {'title': 'Test', 'description': 'desc', 'capacity': 5}
        response = self.client.post(self.list_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_programs(self):
        Program.objects.create(
            ngo=self.ngo_profile, title='Park Cleanup', description='desc', capacity=10,
        )
        self.client.force_authenticate(user=self.volunteer)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data['count'], 0)

    def test_list_programs_search(self):
        Program.objects.create(ngo=self.ngo_profile, title='Unique Beach Event', description='desc', capacity=5)
        Program.objects.create(ngo=self.ngo_profile, title='Forest Walk', description='desc', capacity=5)
        self.client.force_authenticate(user=self.volunteer)
        response = self.client.get(self.list_url + '?search=Unique')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 1)

    def test_list_programs_filter_by_status(self):
        Program.objects.create(ngo=self.ngo_profile, title='Active Program', description='desc', capacity=5, status=ProgramStatus.ACTIVE)
        Program.objects.create(ngo=self.ngo_profile, title='Done Program', description='desc', capacity=5, status=ProgramStatus.COMPLETED)
        self.client.force_authenticate(user=self.volunteer)
        response = self.client.get(self.list_url + '?status=completed')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for item in response.data['results']:
            self.assertEqual(item['status'], 'completed')

    def test_update_program_by_owner(self):
        program = Program.objects.create(ngo=self.ngo_profile, title='Old Title', description='desc', capacity=10)
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.patch(f'/api/v1/programs/{program.id}/', {'title': 'New Title'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['title'], 'New Title')

    def test_update_program_by_non_owner_denied(self):
        ngo_user2, ngo_profile2 = create_approved_ngo('ngo2@test.com')
        program = Program.objects.create(ngo=self.ngo_profile, title='Title', description='desc', capacity=10)
        self.client.force_authenticate(user=ngo_user2)
        response = self.client.patch(f'/api/v1/programs/{program.id}/', {'title': 'Hijacked'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_program_with_participants_denied(self):
        program = Program.objects.create(
            ngo=self.ngo_profile, title='Title', description='desc', capacity=10, current_participants=1,
        )
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.delete(f'/api/v1/programs/{program.id}/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_program_detail(self):
        program = Program.objects.create(ngo=self.ngo_profile, title='Detail', description='desc', capacity=5)
        self.client.force_authenticate(user=self.volunteer)
        response = self.client.get(f'/api/v1/programs/{program.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['id'], program.id)

    def test_unauthenticated_cannot_list(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ParticipationAPITest(APITestCase):

    def setUp(self):
        self.ngo_user, self.ngo_profile = create_approved_ngo()
        self.volunteer = create_volunteer()
        self.program = Program.objects.create(
            ngo=self.ngo_profile, title='Beach Cleanup', description='desc', capacity=5,
        )

    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_join_program(self, m1, m2, mock_email):
        self.client.force_authenticate(user=self.volunteer)
        response = self.client.post(f'/api/v1/participation/{self.program.id}/join/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['status'], 'pending')

    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_join_full_program_waitlisted(self, m1, m2, mock_email):
        # Fill program
        self.program.capacity = 1
        self.program.current_participants = 1
        self.program.save()
        self.client.force_authenticate(user=self.volunteer)
        response = self.client.post(f'/api/v1/participation/{self.program.id}/join/')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['data']['status'], 'pending')

    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_ngo_approve_join_request(self, m1, m2, mock_email):
        self.client.force_authenticate(user=self.volunteer)
        join_res = self.client.post(f'/api/v1/participation/{self.program.id}/join/')
        part_id = join_res.data['data']['id']

        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.post(f'/api/v1/participation/requests/{part_id}/review/', {'action': 'accept'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['status'], 'joined')

    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.EmailService.send_volunteer_left')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_leave_program(self, m1, m2, m3, mock_email):
        self.client.force_authenticate(user=self.volunteer)
        self.client.post(f'/api/v1/participation/{self.program.id}/join/')
        response = self.client.post(f'/api/v1/participation/{self.program.id}/leave/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_ngo_cannot_join_program(self):
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.post(f'/api/v1/participation/{self.program.id}/join/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    @patch('services.participation_service.EmailService.send_volunteer_joined')
    @patch('services.participation_service.invalidate_volunteer_dashboard')
    @patch('services.participation_service.invalidate_ngo_dashboard')
    def test_my_participations(self, m1, m2, mock_email):
        self.client.force_authenticate(user=self.volunteer)
        self.client.post(f'/api/v1/participation/{self.program.id}/join/')
        response = self.client.get('/api/v1/participation/mine/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data['count'], 0)
