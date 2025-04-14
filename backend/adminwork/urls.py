from django.urls import path, include
from .views import list_events, manage_event, update_event, delete_event, register_for_event, get_user_registrations, public_list_events, get_category, get_rally_options, get_all_user_registrations, get_rally_laps, get_newari_instruments, get_volunteer_laps, get_volunteer_types, get_stall_types, get_stall_locations, get_event_detail, get_event_options, initiate_ticket_payment, verify_ticket_payment, ticket_history
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path('admin/events/', list_events, name='list_events'),
    path('admin/events/manage/', manage_event, name='manage_event'),
    path('admin/events/update/<int:event_id>/', update_event, name='update_event'),
    path('admin/events/delete/<int:event_id>/', delete_event, name='delete_event'),
    path('events/register/', register_for_event, name='register_event'),
    path('events/registrations/', get_user_registrations, name='user_registrations'),   
    path('admin/events/registrations/', get_all_user_registrations, name='user_registrations'), 
    path('events/', public_list_events, name='public_list_events'),
    path('event-detail/<int:event_detail_id>/', get_event_detail, name='get_event_detail'),

    path('events/categories/', get_category, name='category-list'),

    path('events/rallyoptions/', get_rally_options, name='rally-options'),
    path('events/rallylaps/', get_rally_laps, name='rally-options'),
    path('events/volunteertypes/', get_volunteer_types, name='rally-options'),
    path('events/newariinstruments/', get_newari_instruments, name='rally-options'),
    path('events/volunteerlaps/', get_volunteer_laps ,name='rally-options'),


    path('events/stalltypes/', get_stall_types ,name='rally-options'),
    path('events/stalllocations/', get_stall_locations ,name='rally-options'),

    path('api/event-options/', get_event_options, name='event-options'),

    path('tickets/initiate_payment/', views.initiate_ticket_payment, name='initiate_ticket_payment'),
    path('tickets/verify-payment/', verify_ticket_payment, name='verify_ticket_payment'),
    path('tickets/history/', ticket_history, name='ticket_history'),

    path('api/ihi-locations/', views.get_ihi_locations, name='get_ihi_locations'),
    path('events/register-ihi/', views.register_ihi, name='register_ihi'),



# Don't forget to add this to your urls.py
   path('qr/verify-registration/<str:formatted_id>/', views.verify_registration, name='verify-registration'),


]

  # This is important - it tells Django to serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)