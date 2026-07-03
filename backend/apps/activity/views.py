"""
Activity feed views.
"""
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from utils.responses import success_response
from .models import Activity
from .serializers import ActivitySerializer


class MyActivityFeedView(ListAPIView):
    """Return the authenticated user's activity feed (works for both NGO and Volunteer)."""

    permission_classes = [IsAuthenticated]
    serializer_class = ActivitySerializer

    def get_queryset(self):
        return Activity.objects.filter(user=self.request.user).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(ActivitySerializer(page, many=True).data)
        return success_response(data=ActivitySerializer(queryset, many=True).data)
