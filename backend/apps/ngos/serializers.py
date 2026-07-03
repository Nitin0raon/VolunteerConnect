"""
Serializers for NGO profile and approval management.
"""
from rest_framework import serializers
from apps.accounts.serializers import UserSerializer
from .models import NGOProfile


class NGOProfileSerializer(serializers.ModelSerializer):
    """Full read serializer for NGO profile."""

    user = UserSerializer(read_only=True)

    class Meta:
        model = NGOProfile
        fields = (
            'id', 'user', 'organization_name', 'description',
            'website', 'phone', 'address', 'status',
            'rejection_reason', 'approved_at', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'user', 'status', 'rejection_reason', 'approved_at', 'created_at', 'updated_at')


class NGOProfileCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating NGO profile during registration."""

    class Meta:
        model = NGOProfile
        fields = ('organization_name', 'description', 'website', 'phone', 'address')

    def validate_organization_name(self, value):
        if not value.strip():
            raise serializers.ValidationError('Organization name cannot be blank.')
        return value.strip()


class NGOApprovalSerializer(serializers.Serializer):
    """Serializer for approving an NGO."""

    # No additional fields required — admin just POSTs to the endpoint.
    pass


class NGORejectionSerializer(serializers.Serializer):
    """Serializer for rejecting an NGO with a reason."""

    reason = serializers.CharField(max_length=1000, required=True)


class NGOListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for NGO list views."""

    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = NGOProfile
        fields = (
            'id', 'organization_name', 'description', 'website',
            'status', 'user_email', 'user_name', 'created_at',
        )

    def get_user_name(self, obj):
        return obj.user.get_full_name()
