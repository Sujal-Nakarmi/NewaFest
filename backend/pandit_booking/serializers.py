from rest_framework import serializers
from .models import PanditBooking, PanditReview, PanditAvailability, Notification
from django.utils import timezone

from registerlogin.models import Pandit, User # Updated import path
from registerlogin.serializers import UserSerializer  # Import your existing UserSerializer

class PanditDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Pandit
        fields = ['pandit_id', 'user', 'experience_years', 'experience_description', 'average_rating', 'total_reviews']

class BookingSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source='user', read_only=True)
    pandit_details = PanditDetailSerializer(source='pandit', read_only=True)
    
    class Meta:
        model = PanditBooking
        fields = ['booking_id', 'user_details', 'pandit_details', 'booking_date', 
                 'description',  'location_province',
            'location_metro_area',
            'location_area',
            'location_id',
            'landmark', 'status', 'created_at', 'updated_at']

class CreateBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PanditBooking
        fields = [ 'pandit', 
            'booking_date', 
            'description',
            'location_province',
            'location_metro_area',
            'location_area',
            'location_id',
            'landmark']

    def validate_booking_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Booking date cannot be in the past")
        return value


class PanditReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = PanditReview
        fields = '__all__'
        read_only_fields = ['review_id', 'user', 'pandit', 'created_at', 'updated_at']


class CreateReviewSerializer(serializers.ModelSerializer):
    booking_id = serializers.IntegerField()
    
    class Meta:
        model = PanditReview
        fields = ['booking_id', 'rating', 'comment']


# In serializers.py
class PanditAvailabilitySerializer(serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)
    
    class Meta:
        model = PanditAvailability
        fields = ['availability_id', 'pandit', 'day_of_week', 'day_name', 'start_time', 'end_time', 'is_available']
        read_only_fields = ['availability_id']

class CreatePanditAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = PanditAvailability
        fields = ['day_of_week', 'start_time', 'end_time', 'is_available']
    
    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        return data
    
# Add to serializers.py
class NotificationSerializer(serializers.ModelSerializer):
    related_booking_details = serializers.SerializerMethodField()
    related_event_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Notification
        fields = [
            'notification_id', 'notification_type', 'message',
            'is_read', 'created_at', 'related_booking_details',
            'related_event_details'
        ]
    
    def get_related_booking_details(self, obj):
        if obj.related_booking:
            return {
                'booking_id': obj.related_booking.booking_id,
                'booking_date': obj.related_booking.booking_date,
                'status': obj.related_booking.status,
                'with_user': obj.related_booking.user.full_name 
                    if obj.recipient == obj.related_booking.pandit.user else None,
                'with_pandit': obj.related_booking.pandit.user.full_name
                    if obj.recipient == obj.related_booking.user else None,
            }
        return None
    
    def get_related_event_details(self, obj):
        if obj.related_event_registration:
            return {
                'registration_id': obj.related_event_registration.registration_id,
                'event_name': obj.related_event_registration.event_detail.event.name,
                'event_year': obj.related_event_registration.event_detail.year,
                'category': obj.related_event_registration.category.name,
                'registration_date': obj.related_event_registration.registration_date,
            }
        return None