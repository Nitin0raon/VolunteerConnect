from django.urls import path
from .views import (
    ProgramListCreateView, ProgramDetailView,
    ProgramParticipantsView, MyProgramsView,
)

urlpatterns = [
    path('mine/', MyProgramsView.as_view(), name='program-mine'),
    path('<int:program_id>/participants/', ProgramParticipantsView.as_view(), name='program-participants'),
    path('<int:program_id>/', ProgramDetailView.as_view(), name='program-detail'),
    path('', ProgramListCreateView.as_view(), name='program-list-create'),
]