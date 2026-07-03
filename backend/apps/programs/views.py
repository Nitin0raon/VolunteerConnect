"""
Program management views.
"""
import logging
from rest_framework.generics import ListAPIView
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from permissions.role_permissions import IsNGO, IsApprovedNGO
from utils.responses import success_response, created_response, no_content_response
from services.program_service import ProgramService
from .models import Program
from .serializers import ProgramSerializer, ProgramCreateSerializer, ProgramUpdateSerializer
from .filters import ProgramFilter

logger = logging.getLogger('apps')


class ProgramListCreateView(ListAPIView):
    """List all programs (with search/filter) or create a new one (NGO only)."""

    permission_classes = [IsAuthenticated]
    serializer_class = ProgramSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ProgramFilter
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'capacity', 'title']

    def get_queryset(self):
        return ProgramService.get_all_programs()

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(ProgramSerializer(page, many=True).data)
        return success_response(data=ProgramSerializer(queryset, many=True).data)

    def post(self, request):
        # Only approved NGOs may create programs
        if not (request.user.is_ngo):
            from utils.exceptions import PermissionDeniedException
            raise PermissionDeniedException('Only NGOs can create programs.')

        serializer = ProgramCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        program = ProgramService.create_program(request.user, serializer.validated_data)
        logger.info(f"NGO {request.user.email} created program '{program.title}'")
        return created_response(data=ProgramSerializer(program).data, message='Program created successfully.')


class ProgramDetailView(APIView):
    """Retrieve, update, or delete a single program."""

    permission_classes = [IsAuthenticated]

    def get(self, request, program_id):
        program = ProgramService.get_program_by_id(program_id)
        return success_response(data=ProgramSerializer(program).data)

    def patch(self, request, program_id):
        serializer = ProgramUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        program = ProgramService.update_program(program_id, request.user, serializer.validated_data)
        logger.info(f"Program {program_id} updated by {request.user.email}")
        return success_response(data=ProgramSerializer(program).data, message='Program updated successfully.')

    def delete(self, request, program_id):
        ProgramService.delete_program(program_id, request.user)
        logger.info(f"Program {program_id} deleted by {request.user.email}")
        return no_content_response(message='Program deleted successfully.')


class ProgramParticipantsView(APIView):
    """View list of participants for a program (NGO owner only)."""

    permission_classes = [IsAuthenticated, IsNGO]

    def get(self, request, program_id):
        participants = ProgramService.get_program_participants(program_id, request.user)
        from apps.participation.serializers import ParticipationSerializer
        return success_response(data=ParticipationSerializer(participants, many=True).data)


class MyProgramsView(ListAPIView):
    """List programs created by the authenticated NGO."""

    permission_classes = [IsAuthenticated, IsNGO]
    serializer_class = ProgramSerializer

    def get_queryset(self):
        return ProgramService.get_programs_by_ngo_user(self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(ProgramSerializer(page, many=True).data)
        return success_response(data=ProgramSerializer(queryset, many=True).data)
