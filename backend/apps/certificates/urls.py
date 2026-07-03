"""
URL patterns for certificate endpoints.
"""
from django.urls import path
from .views import GenerateCertificateView, MyCertificatesView, DownloadCertificateView

urlpatterns = [
    path('mine/', MyCertificatesView.as_view(), name='certificate-mine'),
    path('<int:certificate_id>/download/', DownloadCertificateView.as_view(), name='certificate-download'),
    path('generate/<int:program_id>/<int:volunteer_id>/', GenerateCertificateView.as_view(), name='certificate-generate'),
]
