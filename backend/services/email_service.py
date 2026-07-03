"""
Reusable synchronous email service using Django's SMTP backend.
"""
import logging
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger('services')


class EmailService:
    """Centralized service for sending all transactional emails."""

    @staticmethod
    def _send(subject: str, template_name: str, context: dict, to_email: str) -> bool:
        """Render an HTML template and send synchronously. Returns success bool."""
        try:
            html_content = render_to_string(template_name, context)
            text_content = strip_tags(html_content)
            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[to_email],
            )
            email.attach_alternative(html_content, 'text/html')
            email.send(fail_silently=False)
            logger.info(f"Email sent: '{subject}' to {to_email}")
            return True
        except Exception as exc:
            logger.error(f"Failed to send email '{subject}' to {to_email}: {exc}")
            return False

    @classmethod
    def send_ngo_approved(cls, ngo_profile):
        cls._send(
            subject='Your NGO has been approved!',
            template_name='emails/ngo_approved.html',
            context={
                'organization_name': ngo_profile.organization_name,
                'frontend_url': settings.FRONTEND_URL,
            },
            to_email=ngo_profile.user.email,
        )

    @classmethod
    def send_ngo_rejected(cls, ngo_profile, reason: str):
        cls._send(
            subject='Update on your NGO application',
            template_name='emails/ngo_rejected.html',
            context={
                'organization_name': ngo_profile.organization_name,
                'reason': reason,
                'frontend_url': settings.FRONTEND_URL,
            },
            to_email=ngo_profile.user.email,
        )

    @classmethod
    def send_volunteer_joined(cls, participation):
        cls._send(
            subject=f"You've joined {participation.program.title}",
            template_name='emails/volunteer_joined.html',
            context={
                'volunteer_name': participation.volunteer.get_full_name(),
                'program_title': participation.program.title,
                'ngo_name': participation.program.ngo.organization_name,
                'status': participation.status,
                'frontend_url': settings.FRONTEND_URL,
            },
            to_email=participation.volunteer.email,
        )

    @classmethod
    def send_volunteer_left(cls, volunteer, program):
        cls._send(
            subject=f"You've left {program.title}",
            template_name='emails/volunteer_left.html',
            context={
                'volunteer_name': volunteer.get_full_name(),
                'program_title': program.title,
                'frontend_url': settings.FRONTEND_URL,
            },
            to_email=volunteer.email,
        )

    @classmethod
    def send_waitlist_promoted(cls, participation):
        cls._send(
            subject=f"You're in! Spot opened in {participation.program.title}",
            template_name='emails/waitlist_promoted.html',
            context={
                'volunteer_name': participation.volunteer.get_full_name(),
                'program_title': participation.program.title,
                'ngo_name': participation.program.ngo.organization_name,
                'frontend_url': settings.FRONTEND_URL,
            },
            to_email=participation.volunteer.email,
        )
