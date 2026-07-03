"""
API tests for NGO approval workflow.
"""
from unittest.mock import patch
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.accounts.models import UserRole
from apps.ngos.models import NGOProfile, NGOStatus

User = get_user_model()


class NGOApprovalAPITest(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_superuser(
            email='admin@test.com', password='Admin123!', first_name='Admin', last_name='User',
        )
        ngo_user = User.objects.create_user(
            email='ngo@test.com', password='Pass123!',
            first_name='Hope', last_name='Foundation', role=UserRole.NGO,
        )
        self.ngo_profile = NGOProfile.objects.create(
            user=ngo_user, organization_name='Hope Org', description='We help.',
        )

    @patch('services.ngo_service.EmailService.send_ngo_approved')
    def test_admin_can_approve_ngo(self, mock_email):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(f'/api/v1/ngos/{self.ngo_profile.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ngo_profile.refresh_from_db()
        self.assertEqual(self.ngo_profile.status, NGOStatus.APPROVED)
        mock_email.assert_called_once()

    @patch('services.ngo_service.EmailService.send_ngo_rejected')
    def test_admin_can_reject_ngo(self, mock_email):
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            f'/api/v1/ngos/{self.ngo_profile.id}/reject/',
            {'reason': 'Incomplete information'},
            format='json',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.ngo_profile.refresh_from_db()
        self.assertEqual(self.ngo_profile.status, NGOStatus.REJECTED)

    def test_non_admin_cannot_approve(self):
        volunteer = User.objects.create_user(
            email='vol@test.com', password='Pass123!',
            first_name='V', last_name='U', role=UserRole.VOLUNTEER,
        )
        self.client.force_authenticate(user=volunteer)
        response = self.client.post(f'/api/v1/ngos/{self.ngo_profile.id}/approve/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_pending_list_requires_admin(self):
        volunteer = User.objects.create_user(
            email='v@test.com', password='Pass123!',
            first_name='V', last_name='U', role=UserRole.VOLUNTEER,
        )
        self.client.force_authenticate(user=volunteer)
        response = self.client.get('/api/v1/ngos/pending/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_list_pending_ngos(self):
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/v1/ngos/pending/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(response.data['count'], 0)
