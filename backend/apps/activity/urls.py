"""
URL patterns for activity feed.
"""
from django.urls import path
from .views import MyActivityFeedView

urlpatterns = [
    path('mine/', MyActivityFeedView.as_view(), name='activity-mine'),
]
