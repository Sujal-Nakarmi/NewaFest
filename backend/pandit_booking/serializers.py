from rest_framework import serializers
from .models import PanditBooking
from django.utils import timezone

from registerlogin.models import Pandit, User  # Updated import path
from registerlogin.serializers import UserSerializer  # Import your existing UserSerializer

class PanditDetailSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Pandit
        fields = ['pandit_id', 'user', 'experience_years', 'experience_description']

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
