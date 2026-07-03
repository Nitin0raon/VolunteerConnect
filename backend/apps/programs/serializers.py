"""
Serializers for Program management.
"""
from rest_framework import serializers
from .models import Program


class ProgramSerializer(serializers.ModelSerializer):
    """Full read serializer for Program."""

    ngo_name = serializers.CharField(source='ngo.organization_name', read_only=True)
    available_slots = serializers.IntegerField(read_only=True)
    is_full = serializers.BooleanField(read_only=True)

    class Meta:
        model = Program
        fields = (
            'id', 'ngo', 'ngo_name', 'title', 'description', 'capacity',
            'current_participants', 'available_slots', 'is_full', 'status',
            'location', 'start_date', 'end_date', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'ngo', 'ngo_name', 'current_participants', 'created_at', 'updated_at')


class ProgramCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new program."""

    class Meta:
        model = Program
        fields = ('title', 'description', 'capacity', 'location', 'start_date', 'end_date')

    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Capacity must be greater than zero.')
        return value

    def validate(self, attrs):
        start = attrs.get('start_date')
        end = attrs.get('end_date')
        if start and end and end < start:
            raise serializers.ValidationError({'end_date': 'End date cannot be before start date.'})
        return attrs


class ProgramUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating an existing program."""

    class Meta:
        model = Program
        fields = ('title', 'description', 'capacity', 'status', 'location', 'start_date', 'end_date')

    def validate_capacity(self, value):
        if value <= 0:
            raise serializers.ValidationError('Capacity must be greater than zero.')
        return value
