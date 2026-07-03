"""
Django-filter FilterSet for Program search/filter.
"""
import django_filters
from .models import Program, ProgramStatus


class ProgramFilter(django_filters.FilterSet):
    """Filter programs by status and NGO."""

    status = django_filters.ChoiceFilter(choices=ProgramStatus.choices)
    ngo = django_filters.NumberFilter(field_name='ngo__id')

    class Meta:
        model = Program
        fields = ['status', 'ngo']
