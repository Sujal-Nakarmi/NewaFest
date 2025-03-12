from django.urls import path
from . import views

urlpatterns = [
    path('pandits/', views.list_pandits, name='list_pandits'),
    path('bookings/', views.list_bookings, name='list_bookings'),
    path('bookings/create/', views.create_booking, name='create_booking'),
    path('bookings/<int:booking_id>/status/', views.update_booking_status, name='update_booking_status'),
    path('bookings/cancellation/<int:booking_id>/', views.cancel_booking, name='cancel_booking')

]