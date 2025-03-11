from django.urls import path, include
from .views import list_events, manage_event, update_event, delete_event, register_for_event, get_user_registrations, public_list_events, get_category, get_rallyoptions
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/events/', list_events, name='list_events'),
    path('admin/events/manage/', manage_event, name='manage_event'),
    path('admin/events/update/<int:event_id>/', update_event, name='update_event'),
    path('admin/events/delete/<int:event_id>/', delete_event, name='delete_event'),
    path('events/register/', register_for_event, name='register_event'),
    path('events/registrations/', get_user_registrations, name='user_registrations'),   
    path('events/', public_list_events, name='public_list_events'),

    path('events/categories/', get_category, name='category-list'),

    path('events/rallyoptions/', get_rallyoptions, name='rally-options'),


]

  # This is important - it tells Django to serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)