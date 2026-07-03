"""
Serializers for certificates.
"""
from rest_framework import serializers
from .models import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    program_title = serializers.CharField(source='program.title', read_only=True)
    ngo_name = serializers.CharField(source='program.ngo.organization_name', read_only=True)
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Certificate
        fields = (
            'id', 'certificate_number', 'program', 'program_title',
            'ngo_name', 'download_url', 'issued_at',
        )
        read_only_fields = fields

    def get_download_url(self, obj):
        request = self.context.get('request')
        if obj.file and request:
            return request.build_absolute_uri(obj.file.url)
        return None
