"""
Business logic for certificate generation using ReportLab.
"""
import io
import logging
import uuid
from datetime import date

from django.core.files.base import ContentFile
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib.enums import TA_CENTER

from apps.certificates.models import Certificate
from apps.participation.models import Participation, ParticipationStatus
from repositories.program_repository import ProgramRepository
from repositories.user_repository import UserRepository
from services.activity_service import ActivityService
from apps.activity.models import ActivityAction
from utils.exceptions import ResourceNotFoundException, PermissionDeniedException, ConflictException

logger = logging.getLogger('services')


class CertificateService:

    @staticmethod
    def generate_certificate(ngo_user, program_id: int, volunteer_id: int) -> Certificate:
        """
        Generate a PDF certificate for a volunteer who participated in a program.
        Only the owning NGO can issue certificates.
        """
        program = ProgramRepository.get_by_id(program_id)
        if not program:
            raise ResourceNotFoundException('Program not found.')

        ngo_profile = getattr(ngo_user, 'ngo_profile', None)
        if not ngo_profile or program.ngo_id != ngo_profile.id:
            raise PermissionDeniedException('You do not own this program.')

        volunteer = UserRepository.get_by_id(volunteer_id)
        if not volunteer:
            raise ResourceNotFoundException('Volunteer not found.')

        # Check volunteer has active or completed participation
        has_participation = Participation.objects.filter(
            volunteer=volunteer,
            program=program,
            status__in=[ParticipationStatus.JOINED, ParticipationStatus.COMPLETED],
        ).exists()
        if not has_participation:
            raise PermissionDeniedException('This volunteer has not participated in the program.')

        # Prevent duplicate certificate
        if Certificate.objects.filter(volunteer=volunteer, program=program).exists():
            raise ConflictException('A certificate has already been issued for this volunteer and program.')

        # Generate a unique certificate number before creating the object
        certificate_number = f'CERT-{uuid.uuid4().hex[:12].upper()}'

        # Build the PDF in memory
        pdf_content = CertificateService._build_pdf(
            volunteer_name=volunteer.get_full_name(),
            program_name=program.title,
            ngo_name=program.ngo.organization_name,
            completion_date=date.today(),
            certificate_number=certificate_number,
        )

        certificate = Certificate(
            volunteer=volunteer,
            program=program,
            certificate_number=certificate_number,
        )
        certificate.file.save(
            f'{certificate_number}.pdf',
            ContentFile(pdf_content),
            save=False,
        )
        certificate.save()

        ActivityService.log(
            user=volunteer,
            action=ActivityAction.CERTIFICATE_GENERATED,
            description=f'Certificate issued for "{program.title}".',
            metadata={'program_id': program.id, 'certificate_number': certificate_number},
        )

        logger.info(f"CertificateService: certificate {certificate_number} generated for volunteer {volunteer.email}")
        return certificate

    @staticmethod
    def _build_pdf(
        volunteer_name: str,
        program_name: str,
        ngo_name: str,
        completion_date: date,
        certificate_number: str,
    ) -> bytes:
        """Build and return a PDF certificate as bytes using ReportLab."""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=landscape(A4),
            rightMargin=1 * inch,
            leftMargin=1 * inch,
            topMargin=0.75 * inch,
            bottomMargin=0.75 * inch,
        )

        styles = getSampleStyleSheet()
        story = []

        # Header
        header_style = ParagraphStyle(
            'Header',
            parent=styles['Heading1'],
            fontSize=36,
            textColor=colors.HexColor('#1a3a5c'),
            alignment=TA_CENTER,
            spaceAfter=6,
        )
        story.append(Paragraph('Certificate of Participation', header_style))
        story.append(Spacer(1, 0.2 * inch))
        story.append(HRFlowable(width='100%', thickness=2, color=colors.HexColor('#2563eb')))
        story.append(Spacer(1, 0.3 * inch))

        # Body text
        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontSize=14,
            alignment=TA_CENTER,
            spaceAfter=8,
        )
        name_style = ParagraphStyle(
            'Name',
            parent=styles['Heading2'],
            fontSize=28,
            textColor=colors.HexColor('#2563eb'),
            alignment=TA_CENTER,
            spaceAfter=10,
        )
        program_style = ParagraphStyle(
            'Program',
            parent=styles['Normal'],
            fontSize=18,
            textColor=colors.HexColor('#1a3a5c'),
            alignment=TA_CENTER,
            spaceAfter=8,
        )

        story.append(Paragraph('This is to certify that', body_style))
        story.append(Paragraph(volunteer_name, name_style))
        story.append(Paragraph('has successfully participated in', body_style))
        story.append(Paragraph(f'<b>{program_name}</b>', program_style))
        story.append(Paragraph(f'organized by <b>{ngo_name}</b>', body_style))
        story.append(Spacer(1, 0.3 * inch))
        story.append(HRFlowable(width='80%', thickness=1, color=colors.HexColor('#cccccc')))
        story.append(Spacer(1, 0.2 * inch))

        # Footer details
        footer_style = ParagraphStyle(
            'Footer',
            parent=styles['Normal'],
            fontSize=11,
            textColor=colors.HexColor('#555555'),
            alignment=TA_CENTER,
            spaceAfter=4,
        )
        story.append(Paragraph(f'Date of Completion: {completion_date.strftime("%B %d, %Y")}', footer_style))
        story.append(Paragraph(f'Certificate No: {certificate_number}', footer_style))

        doc.build(story)
        return buffer.getvalue()

    @staticmethod
    def get_certificate_for_download(certificate_id: int, user) -> Certificate:
        try:
            certificate = Certificate.objects.select_related(
                'volunteer', 'program', 'program__ngo'
            ).get(id=certificate_id)
        except Certificate.DoesNotExist:
            raise ResourceNotFoundException('Certificate not found.')

        # Only the certificate owner or NGO that issued it may download
        ngo_profile = getattr(user, 'ngo_profile', None)
        is_owner = certificate.volunteer_id == user.id
        is_issuing_ngo = ngo_profile and certificate.program.ngo_id == ngo_profile.id

        if not (is_owner or is_issuing_ngo or user.is_staff):
            raise PermissionDeniedException('You do not have permission to download this certificate.')

        return certificate
