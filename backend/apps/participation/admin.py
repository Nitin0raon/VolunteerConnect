from django.contrib import admin
from .models import Participation


@admin.register(Participation)
class ParticipationAdmin(admin.ModelAdmin):
    list_display = ('volunteer', 'program', 'status', 'waitlist_position', 'joined_at')
    list_filter = ('status',)
    search_fields = ('volunteer__email', 'program__title')
