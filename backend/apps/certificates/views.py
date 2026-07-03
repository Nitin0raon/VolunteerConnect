"""
Certificate views — generate and download.
"""
import logging
from django.http import FileResponse, Http404
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAuthenticated

from permissions.role_permissions import IsNGO, IsVolunteer
from utils.responses import success_response, created_response
from services.certificate_service import CertificateService
from .serializers import CertificateSerializer
from .models import Certificate

logger = logging.getLogger('apps')


class GenerateCertificateView(APIView):
    """NGO generates a certificate for a volunteer who completed a program."""

    permission_classes = [IsAuthenticated, IsNGO]

    def post(self, request, program_id, volunteer_id):
        certificate = CertificateService.generate_certificate(
            ngo_user=request.user, program_id=program_id, volunteer_id=volunteer_id,
        )
        logger.info(f"Certificate {certificate.certificate_number} generated for volunteer={volunteer_id}")
        return created_response(
            data=CertificateSerializer(certificate, context={'request': request}).data,
            message='Certificate generated successfully.',
        )


class MyCertificatesView(ListAPIView):
    """List the authenticated volunteer's certificates."""

    permission_classes = [IsAuthenticated, IsVolunteer]
    serializer_class = CertificateSerializer

    def get_queryset(self):
        return Certificate.objects.filter(volunteer=self.request.user).select_related('program', 'program__ngo')

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            return self.get_paginated_response(
                CertificateSerializer(page, many=True, context={'request': request}).data
            )
        return success_response(data=CertificateSerializer(queryset, many=True, context={'request': request}).data)


class DownloadCertificateView(APIView):
    """Download the PDF file for a certificate."""

    permission_classes = [IsAuthenticated]

    def get(self, request, certificate_id):
        certificate = CertificateService.get_certificate_for_download(certificate_id, request.user)
        if not certificate.file:
            raise Http404('Certificate file not found.')
        return FileResponse(
            certificate.file.open('rb'),
            as_attachment=True,
            filename=f'{certificate.certificate_number}.pdf',
        )
