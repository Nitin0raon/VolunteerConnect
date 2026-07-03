from django.contrib import admin
from .models import NGOProfile


@admin.register(NGOProfile)
class NGOProfileAdmin(admin.ModelAdmin):
    list_display = ('organization_name', 'user', 'status', 'created_at', 'approved_at')
    list_filter = ('status',)
    search_fields = ('organization_name', 'user__email')
    readonly_fields = ('approved_by', 'approved_at', 'created_at', 'updated_at')
