from django.urls import path
from . import views

urlpatterns = [

   path('notifications/', views.get_user_notifications, name='get-notifications'),
    path('notifications/mark-read/<int:notification_id>/', views.mark_notification_read, name='mark-notification-read'),
    path('notifications/mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),

]