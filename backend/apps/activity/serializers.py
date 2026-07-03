"""
Serializer for activity feed entries.
"""
from rest_framework import serializers
from .models import Activity


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ('id', 'action', 'description', 'metadata', 'created_at')
        read_only_fields = fields
