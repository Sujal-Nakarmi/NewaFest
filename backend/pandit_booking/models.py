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