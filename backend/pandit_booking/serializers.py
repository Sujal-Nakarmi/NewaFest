from rest_framework import serializers
from .models import PanditBooking, PanditReview, PanditAvailability
from django.utils import timezone

from registerlogin.models import Pandit, User  # Updated import path
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
                 'description', 'status', 'created_at', 'updated_at']

class CreateBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = PanditBooking
        fields = ['pandit', 'booking_date', 'description']

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