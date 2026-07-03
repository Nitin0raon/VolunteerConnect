"""
Authentication views — register, login, logout, token refresh.
Views only authenticate, validate, call services, and return responses.
"""
import logging
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from utils.responses import success_response, created_response, error_response
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer
from services.account_service import AccountService

logger = logging.getLogger('apps')


class RegisterView(APIView):
    """Register a new NGO or Volunteer account."""

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = AccountService.register(serializer.validated_data)
        logger.info(f"New user registered: {user.email} role={user.role}")
        return created_response(
            data=UserSerializer(user).data,
            message='Registration successful.',
        )


class LoginView(TokenObtainPairView):
    """Login and obtain JWT access + refresh tokens."""

    permission_classes = [AllowAny]
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        logger.info(f"Login successful for: {request.data.get('email')}")
        return success_response(data=response.data, message='Login successful.')


class LogoutView(APIView):
    """Blacklist the refresh token on logout."""

    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return error_response(message='Refresh token is required.')
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            logger.info(f"User logged out: {request.user.email}")
            return success_response(message='Logged out successfully.')
        except TokenError as e:
            return error_response(message=str(e))


class TokenRefreshView(TokenRefreshView):
    """Refresh access token using a valid refresh token."""

    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        return success_response(data=response.data, message='Token refreshed.')


class MeView(APIView):
    """Return the authenticated user's profile."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return success_response(data=UserSerializer(request.user).data)
