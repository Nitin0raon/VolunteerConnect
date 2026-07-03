"""
API tests for authentication endpoints.
"""
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

from apps.accounts.models import UserRole

User = get_user_model()


class RegisterAPITest(APITestCase):

    url = '/api/v1/auth/register/'

    def test_register_volunteer_success(self):
        data = {
            'email': 'volunteer@test.com',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'role': UserRole.VOLUNTEER,
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['data']['email'], data['email'])

    def test_register_ngo_success(self):
        data = {
            'email': 'ngo@test.com',
            'first_name': 'Hope',
            'last_name': 'Foundation',
            'role': UserRole.NGO,
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_register_as_admin_fails(self):
        data = {
            'email': 'admin@test.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'role': 'admin',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_password_mismatch(self):
        data = {
            'email': 'x@test.com',
            'first_name': 'X',
            'last_name': 'Y',
            'role': UserRole.VOLUNTEER,
            'password': 'SecurePass123!',
            'password_confirm': 'WrongPass!',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email(self):
        User.objects.create_user(email='dup@test.com', password='Pass123!', first_name='D', last_name='U', role=UserRole.VOLUNTEER)
        data = {
            'email': 'dup@test.com',
            'first_name': 'D', 'last_name': 'U',
            'role': UserRole.VOLUNTEER,
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginAPITest(APITestCase):

    url = '/api/v1/auth/login/'

    def setUp(self):
        self.user = User.objects.create_user(
            email='user@test.com', password='Pass123!',
            first_name='Test', last_name='User', role=UserRole.VOLUNTEER,
        )

    def test_login_success(self):
        response = self.client.post(self.url, {'email': 'user@test.com', 'password': 'Pass123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data['data'])
        self.assertIn('refresh', response.data['data'])

    def test_login_wrong_password(self):
        response = self.client.post(self.url, {'email': 'user@test.com', 'password': 'WrongPass!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        response = self.client.post(self.url, {'email': 'ghost@test.com', 'password': 'Pass123!'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class MeAPITest(APITestCase):

    url = '/api/v1/auth/me/'

    def setUp(self):
        self.user = User.objects.create_user(
            email='me@test.com', password='Pass123!',
            first_name='Me', last_name='User', role=UserRole.VOLUNTEER,
        )
        self.client.force_authenticate(user=self.user)

    def test_me_authenticated(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['data']['email'], self.user.email)

    def test_me_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
