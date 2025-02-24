from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from django.conf import settings
from registerlogin.models import User, Pandit  # Updated import path

class PanditBooking(models.Model):
    class BookingStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"

    booking_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,  # Use AUTH_USER_MODEL setting
        on_delete=models.CASCADE,
        related_name='user_bookings'
    )
    pandit = models.ForeignKey(
        'registerlogin.Pandit',  # Use string reference to avoid import issues
        on_delete=models.CASCADE,
        related_name='pandit_bookings'
    )
    booking_date = models.DateTimeField()
    description = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=BookingStatus.choices,
        default=BookingStatus.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'PanditBooking'
        ordering = ['-created_at']