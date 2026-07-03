from django.urls import path
from .views import (
    RequestJoinProgramView,
    LeaveProgramView,
    MyParticipationsView,
    NGOPendingRequestsView,
    NGOAllRequestsView,
    ReviewJoinRequestView,
)

urlpatterns = [
    # Volunteer actions
    path('mine/', MyParticipationsView.as_view(), name='participation-mine'),
    path('<int:program_id>/join/', RequestJoinProgramView.as_view(), name='participation-join'),
    path('<int:program_id>/leave/', LeaveProgramView.as_view(), name='participation-leave'),

    # NGO review actions
    path('requests/pending/', NGOPendingRequestsView.as_view(), name='participation-pending-requests'),
    path('requests/all/', NGOAllRequestsView.as_view(), name='participation-all-requests'),
    path('requests/<int:participation_id>/review/', ReviewJoinRequestView.as_view(), name='participation-review'),
]