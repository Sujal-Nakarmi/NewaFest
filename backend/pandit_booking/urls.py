from django.urls import path
from . import views

urlpatterns = [
    
    path('pandits/', views.list_pandits, name='list_pandits'),
    path('bookings/', views.list_bookings, name='list_bookings'),
    path('bookings/create/', views.create_booking, name='create_booking'),
    
    path('bookings/<int:booking_id>/status/', views.update_booking_status, name='update_booking_status'),
    path('bookings/cancellation/<int:booking_id>/', views.cancel_booking, name='cancel_booking'),
    path('bookings/history/', views.user_booking_history, name='user-booking-history'),

    
    path('booking/reviews/create/', views.create_review, name='create-review'),
    path('booking/reviews/pandit/<int:pandit_id>/', views.pandit_reviews, name='pandit-reviews'),
    path('booking/reviews/user/', views.user_reviews, name='user-reviews'),

]