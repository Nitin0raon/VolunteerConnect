"""
NGO management views.
"""
import logging
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView, RetrieveAPIView
from rest_framework.permissions import IsAuthenticated

from permissions.role_permissions import IsAdmin, IsNGO
from utils.responses import success_response, created_response
from services.ngo_service import NGOService
from .models import NGOProfile
from .serializers import (
    NGOProfileSerializer, NGOProfileCreateSerializer,
    NGOListSerializer, NGOApprovalSerializer, NGORejectionSerializer,
)

logger = logging.getLogger('apps')


class NGORegisterProfileView(APIView):
    """Create or update NGO profile for the authenticated NGO user."""

    permission_classes = [IsAuthenticated, IsNGO]

    def post(self, request):
        serializer = NGOProfileCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        profile = NGOService.create_profile(request.user, serializer.validated_data)
        return created_response(
            data=NGOProfileSerializer(profile).data,
            message='NGO profile created. Awaiting admin approval.',
        )

    def patch(self, request):
        serializer = NGOProfileCreateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        profile = NGOService.update_profile(request.user, serializer.validated_data)
        return success_response(data=NGOProfileSerializer(profile).data, message='Profile updated.')


class NGOMyProfileView(APIView):
    """Return the authenticated NGO's own profile."""

    permission_classes = [IsAuthenticated, IsNGO]

    def get(self, request):
        profile = NGOService.get_profile_by_user(request.user)
        return success_response(data=NGOProfileSerializer(profile).data)


class PendingNGOListView(ListAPIView):
    """List all pending NGOs. Admin only."""

    permission_classes = [IsAuthenticated, IsAdmin]
    serializer_class = NGOListSerializer

    def get_queryset(self):
        return NGOService.get_pending_ngos()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(NGOListSerializer(page, many=True).data)
        return success_response(data=NGOListSerializer(queryset, many=True).data)


class ApproveNGOView(APIView):
    """Approve a pending NGO. Admin only."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, ngo_id):
        NGOApprovalSerializer(data=request.data).is_valid(raise_exception=True)
        ngo = NGOService.approve_ngo(ngo_id, approved_by=request.user)
        logger.info(f"Admin {request.user.email} approved NGO id={ngo_id}")
        return success_response(
            data=NGOProfileSerializer(ngo).data,
            message='NGO approved successfully.',
        )


class RejectNGOView(APIView):
    """Reject a pending NGO with a reason. Admin only."""

    permission_classes = [IsAuthenticated, IsAdmin]

    def post(self, request, ngo_id):
        serializer = NGORejectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ngo = NGOService.reject_ngo(ngo_id, reason=serializer.validated_data['reason'], rejected_by=request.user)
        logger.info(f"Admin {request.user.email} rejected NGO id={ngo_id}")
        return success_response(
            data=NGOProfileSerializer(ngo).data,
            message='NGO rejected.',
        )


class NGOListView(ListAPIView):
    """Public-ish list of approved NGOs with search."""

    permission_classes = [IsAuthenticated]
    serializer_class = NGOListSerializer

    def get_queryset(self):
        return NGOService.get_approved_ngos()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        search = request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(organization_name__icontains=search)
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(NGOListSerializer(page, many=True).data)
        return success_response(data=NGOListSerializer(queryset, many=True).data)


class NGODetailView(RetrieveAPIView):
    """Retrieve a single approved NGO by ID."""

    permission_classes = [IsAuthenticated]
    serializer_class = NGOProfileSerializer

    def get_object(self):
        return NGOService.get_ngo_by_id(self.kwargs['ngo_id'])

    def retrieve(self, request, *args, **kwargs):
        return success_response(data=NGOProfileSerializer(self.get_object()).data)
