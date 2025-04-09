from django.db import models

# Create your models here.
from django.db import models
from django.utils import timezone
from django.conf import settings
from registerlogin.models import User, Pandit  # Updated import path
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Avg


class PanditBooking(models.Model):
    class BookingStatus(models.TextChoices):
        PENDING = "pending", "Pending"
        ACCEPTED = "accepted", "Accepted"
        REJECTED = "rejected", "Rejected"
        CANCELLED = "cancelled", "Cancelled"
        
    booking_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_bookings'
    )
    pandit = models.ForeignKey(
        'registerlogin.Pandit',
        on_delete=models.CASCADE,
        related_name='pandit_bookings'
    )
    booking_date = models.DateTimeField()
    description = models.TextField()
    
    # Replace multiple location fields with a single full_location field
    full_location = models.TextField(null=True, blank=True)
    
    # Keep landmark as it might contain additional details
    landmark = models.TextField(null=True, blank=True)
    
    # Optionally keep latitude/longitude for map functionality
    location_latitude = models.FloatField(null=True, blank=True)
    location_longitude = models.FloatField(null=True, blank=True)
    
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


class PanditReview(models.Model):
    class RatingChoices(models.IntegerChoices):
        ONE = 1, "1 Star"
        TWO = 2, "2 Stars"
        THREE = 3, "3 Stars"
        FOUR = 4, "4 Stars" 
        FIVE = 5, "5 Stars"
    
    review_id = models.AutoField(primary_key=True)
    booking = models.OneToOneField(
        PanditBooking,
        on_delete=models.CASCADE,
        related_name='review'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_reviews'
    )
    pandit = models.ForeignKey(
        'registerlogin.Pandit',
        on_delete=models.CASCADE,
        related_name='pandit_reviews'
    )
    rating = models.IntegerField(choices=RatingChoices.choices)
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'PanditReview'
        ordering = ['-created_at']
        # Ensure a user can only review a booking once
        unique_together = ['booking', 'user']


# And update it whenever a review is saved
@receiver(post_save, sender=PanditReview)
def update_pandit_rating(sender, instance, created, **kwargs):
    if created:  # Only update on new reviews
        pandit = instance.pandit
        reviews = PanditReview.objects.filter(pandit=pandit)
        pandit.total_reviews = reviews.count()
        pandit.average_rating = reviews.aggregate(Avg('rating'))['rating__avg'] or 0.0
        pandit.save()
    

class PanditAvailability(models.Model):
    class DayOfWeek(models.IntegerChoices):
        MONDAY = 0, "Monday"
        TUESDAY = 1, "Tuesday"
        WEDNESDAY = 2, "Wednesday"
        THURSDAY = 3, "Thursday"
        FRIDAY = 4, "Friday"
        SATURDAY = 5, "Saturday"
        SUNDAY = 6, "Sunday"
    
    availability_id = models.AutoField(primary_key=True)
    pandit = models.ForeignKey(
        'registerlogin.Pandit',
        on_delete=models.CASCADE,
        related_name='availabilities'
    )
    day_of_week = models.IntegerField(choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'PanditAvailability'
        ordering = ['day_of_week', 'start_time']
        unique_together = ['pandit', 'day_of_week', 'start_time', 'end_time']
    
    def __str__(self):
        return f"{self.pandit.user.get_full_name()} - {self.get_day_of_week_display()} {self.start_time}-{self.end_time}"
    

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
        'PanditBooking',  # Using string to avoid circular import issues
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