from django.contrib import admin
from .models import Program


@admin.register(Program)
class ProgramAdmin(admin.ModelAdmin):
    list_display = ('title', 'ngo', 'status', 'capacity', 'current_participants', 'created_at')
    list_filter = ('status',)
    search_fields = ('title', 'description', 'ngo__organization_name')
    readonly_fields = ('current_participants', 'created_at', 'updated_at')
