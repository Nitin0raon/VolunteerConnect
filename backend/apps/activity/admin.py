from django.contrib import admin
from .models import Activity


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'description', 'created_at')
    list_filter = ('action',)
    search_fields = ('user__email', 'description')
    readonly_fields = ('user', 'action', 'description', 'metadata', 'created_at')
