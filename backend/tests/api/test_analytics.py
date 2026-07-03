"""
API tests for analytics dashboards.
"""
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.accounts.models import UserRole
from apps.ngos.models import NGOProfile, NGOStatus

User = get_user_model()


class DashboardAPITest(APITestCase):

    def setUp(self):
        ngo_user = User.objects.create_user(
            email='ngo@test.com', password='Pass123!',
            first_name='NGO', last_name='Owner', role=UserRole.NGO,
        )
        NGOProfile.objects.create(
            user=ngo_user, organization_name='Hope Org',
            description='desc', status=NGOStatus.APPROVED,
        )
        self.ngo_user = ngo_user

        self.volunteer = User.objects.create_user(
            email='vol@test.com', password='Pass123!',
            first_name='Vol', last_name='U', role=UserRole.VOLUNTEER,
        )

    @patch('utils.cache.cache')
    def test_ngo_dashboard(self, mock_cache):
        mock_cache.get.return_value = None
        mock_cache.set.return_value = True
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.get('/api/v1/analytics/ngo-dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertIn('total_programs', data)
        self.assertIn('active_programs', data)
        self.assertIn('total_participants', data)

    @patch('utils.cache.cache')
    def test_volunteer_dashboard(self, mock_cache):
        mock_cache.get.return_value = None
        mock_cache.set.return_value = True
        self.client.force_authenticate(user=self.volunteer)
        response = self.client.get('/api/v1/analytics/volunteer-dashboard/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data['data']
        self.assertIn('joined_programs', data)
        self.assertIn('certificates_earned', data)

    def test_volunteer_cannot_access_ngo_dashboard(self):
        self.client.force_authenticate(user=self.volunteer)
        response = self.client.get('/api/v1/analytics/ngo-dashboard/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_ngo_cannot_access_volunteer_dashboard(self):
        self.client.force_authenticate(user=self.ngo_user)
        response = self.client.get('/api/v1/analytics/volunteer-dashboard/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
