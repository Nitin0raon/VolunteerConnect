"""
Participation views — request join, leave, NGO review requests.
"""
import logging
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from permissions.role_permissions import IsVolunteer, IsNGO
from utils.responses import success_response, created_response
from services.participation_service import ParticipationService
from .serializers import ParticipationSerializer, JoinRequestSerializer, ReviewRequestSerializer

logger = logging.getLogger('apps')


class RequestJoinProgramView(APIView):
    """Volunteer requests to join a program — NGO must approve."""

    permission_classes = [IsAuthenticated, IsVolunteer]

    def post(self, request, program_id):
        serializer = JoinRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        participation = ParticipationService.request_join(
            request.user,
            program_id,
            message=serializer.validated_data.get('message', ''),
        )
        return created_response(
            data=ParticipationSerializer(participation).data,
            message='Join request sent. Waiting for NGO approval.',
        )


class LeaveProgramView(APIView):
    """Volunteer leaves a program or cancels their pending request."""

    permission_classes = [IsAuthenticated, IsVolunteer]

    def post(self, request, program_id):
        ParticipationService.leave_program(request.user, program_id)
        return success_response(message='You have left the program.')


class MyParticipationsView(ListAPIView):
    """List the authenticated volunteer's participations."""

    permission_classes = [IsAuthenticated, IsVolunteer]
    serializer_class = ParticipationSerializer

    def get_queryset(self):
        return ParticipationService.get_volunteer_participations(self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(ParticipationSerializer(page, many=True).data)
        return success_response(data=ParticipationSerializer(queryset, many=True).data)


class NGOPendingRequestsView(ListAPIView):
    """NGO views all PENDING join requests for their programs."""

    permission_classes = [IsAuthenticated, IsNGO]
    serializer_class = ParticipationSerializer

    def get_queryset(self):
        return ParticipationService.get_pending_requests_for_ngo(self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(ParticipationSerializer(page, many=True).data)
        return success_response(data=ParticipationSerializer(queryset, many=True).data)


class NGOAllRequestsView(ListAPIView):
    """NGO views all join requests (all statuses) for their programs."""

    permission_classes = [IsAuthenticated, IsNGO]
    serializer_class = ParticipationSerializer

    def get_queryset(self):
        return ParticipationService.get_all_requests_for_ngo(self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(ParticipationSerializer(page, many=True).data)
        return success_response(data=ParticipationSerializer(queryset, many=True).data)


class ReviewJoinRequestView(APIView):
    """NGO accepts or rejects a specific join request."""

    permission_classes = [IsAuthenticated, IsNGO]

    def post(self, request, participation_id):
        serializer = ReviewRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        participation = ParticipationService.review_request(
            participation_id=participation_id,
            ngo_user=request.user,
            action=serializer.validated_data['action'],
            reason=serializer.validated_data.get('reason', ''),
        )
        action = serializer.validated_data['action']
        return success_response(
            data=ParticipationSerializer(participation).data,
            message=f'Request {"accepted" if action == "accept" else "rejected"} successfully.',
        )