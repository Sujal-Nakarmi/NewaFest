from django.db import models
from django.conf import settings

# Create your models here.

# Add this to your models.py
class Notification(models.Model):
    class NotificationType(models.TextChoices):
        BOOKING_CREATED = "booking_created", "New Booking Created"
        BOOKING_ACCEPTED = "booking_accepted", "Booking Accepted"
        BOOKING_REJECTED = "booking_rejected", "Booking Rejected"
        BOOKING_CANCELLED = "booking_cancelled", "Booking Cancelled"
        NEW_REVIEW = "new_review", "New Review Received"
        EVENT_REGISTRATION_SUCCESS = "event_registration_success", "Event Registration Successful"
        
    notification_id = models.AutoField(primary_key=True)
    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NotificationType.choices
    )
    related_booking = models.ForeignKey(
        'pandit_booking.PanditBooking',  # Using string to avoid circular import issues
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    related_event_registration = models.ForeignKey(
        'adminwork.EventRegistration',  # Specify the app name here
        on_delete=models.CASCADE,
        related_name='notifications',
        null=True,
        blank=True
    )
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'Notification'
        ordering = ['-created_at']