from rest_framework import serializers
from .models import Notification



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