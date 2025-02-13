from django.urls import path
from .views import list_events, manage_event

urlpatterns = [
    path('admin/events/', list_events, name='list_events'),
    path('admin/events/manage/', manage_event, name='manage_event'),
]