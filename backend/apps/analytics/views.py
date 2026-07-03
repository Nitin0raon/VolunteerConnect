"""
Analytics dashboard views — cached via Redis.
"""
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated

from permissions.role_permissions import IsNGO, IsVolunteer
from utils.responses import success_response
from services.analytics_service import AnalyticsService


class NGODashboardView(APIView):
    """Return cached analytics dashboard for the authenticated NGO."""

    permission_classes = [IsAuthenticated, IsNGO]

    def get(self, request):
        data = AnalyticsService.get_ngo_dashboard(request.user)
        return success_response(data=data)


class VolunteerDashboardView(APIView):
    """Return cached analytics dashboard for the authenticated volunteer."""

    permission_classes = [IsAuthenticated, IsVolunteer]

    def get(self, request):
        data = AnalyticsService.get_volunteer_dashboard(request.user)
        return success_response(data=data)
