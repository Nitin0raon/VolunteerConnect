from django.urls import path
from .views import NGODashboardView, VolunteerDashboardView

urlpatterns = [
    path('ngo-dashboard/', NGODashboardView.as_view(), name='analytics-ngo-dashboard'),
    path('volunteer-dashboard/', VolunteerDashboardView.as_view(), name='analytics-volunteer-dashboard'),
]