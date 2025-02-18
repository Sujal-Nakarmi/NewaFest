from django.urls import path
from .views import list_events, manage_event, update_event, delete_event, register_for_event, get_user_registrations

urlpatterns = [
    path('admin/events/', list_events, name='list_events'),
    path('admin/events/manage/', manage_event, name='manage_event'),
    path('admin/events/update/<int:event_id>/', update_event, name='update_event'),
    path('admin/events/delete/<int:event_id>/', delete_event, name='delete_event'),
    path('events/register/', register_for_event, name='register_event'),
    path('events/registrations/', get_user_registrations, name='user_registrations'),   


]