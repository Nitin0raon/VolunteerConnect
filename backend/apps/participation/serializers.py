"""
Serializers for participation/enrollment.
"""
from rest_framework import serializers
from .models import Participation


class ParticipationSerializer(serializers.ModelSerializer):
    """Read serializer for participation records."""

    volunteer_name = serializers.CharField(source='volunteer.get_full_name', read_only=True)
    volunteer_email = serializers.EmailField(source='volunteer.email', read_only=True)
    program_title = serializers.CharField(source='program.title', read_only=True)
    ngo_name = serializers.CharField(source='program.ngo.organization_name', read_only=True)

    class Meta:
        model = Participation
        fields = (
            'id', 'volunteer', 'volunteer_name', 'volunteer_email',
            'program', 'program_title', 'ngo_name', 'status',
            'message', 'waitlist_position',
            'requested_at', 'joined_at', 'left_at', 'completed_at', 'reviewed_at',
        )
        read_only_fields = fields


class JoinRequestSerializer(serializers.Serializer):
    """Serializer for submitting a join request."""
    message = serializers.CharField(max_length=500, required=False, allow_blank=True)


class ReviewRequestSerializer(serializers.Serializer):
    """Serializer for NGO accepting or rejecting a join request."""
    action = serializers.ChoiceField(choices=['accept', 'reject'])
    reason = serializers.CharField(max_length=500, required=False, allow_blank=True)