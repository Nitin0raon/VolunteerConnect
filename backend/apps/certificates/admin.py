from django.contrib import admin
from .models import Certificate


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_number', 'volunteer', 'program', 'issued_at')
    search_fields = ('certificate_number', 'volunteer__email', 'program__title')
    readonly_fields = ('certificate_number', 'issued_at')
