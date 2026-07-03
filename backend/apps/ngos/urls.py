"""
URL patterns for NGO endpoints.
"""
from django.urls import path
from .views import (
    NGORegisterProfileView, NGOMyProfileView, PendingNGOListView,
    ApproveNGOView, RejectNGOView, NGOListView, NGODetailView,
)

urlpatterns = [
    path('profile/', NGORegisterProfileView.as_view(), name='ngo-profile-create'),
    path('profile/me/', NGOMyProfileView.as_view(), name='ngo-profile-me'),
    path('pending/', PendingNGOListView.as_view(), name='ngo-pending-list'),
    path('<int:ngo_id>/approve/', ApproveNGOView.as_view(), name='ngo-approve'),
    path('<int:ngo_id>/reject/', RejectNGOView.as_view(), name='ngo-reject'),
    path('<int:ngo_id>/', NGODetailView.as_view(), name='ngo-detail'),
    path('', NGOListView.as_view(), name='ngo-list'),
]
