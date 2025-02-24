from django.db import models
from django.utils import timezone
from django.conf import settings


class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    photo = models.ImageField(upload_to='event_photos/')
    
    class Meta:
        db_table = 'Event'

    def __str__(self):
        return self.name

class EventDetail(models.Model):
    event_detail_id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='details')
    location = models.CharField(max_length=200)
    start_time = models.DateTimeField()
    year = models.IntegerField()
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'EventDetail'

    def save(self, *args, **kwargs):
        current_year = timezone.now().year
        self.is_active = (self.year == current_year)
        super().save(*args, **kwargs)



class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)  # "Volunteer Music" or "Volunteer Stall"
    code = models.CharField(max_length=20)   # "MUSIC" or "STALL"
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'Category'
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name

class EventRegistration(models.Model):
    registration_id = models.AutoField(primary_key=True)
    event_detail = models.ForeignKey('EventDetail', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    registration_date = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'EventRegistration'
        # Allow same user to register for different categories in different years
        unique_together = ['event_detail', 'user', 'category']
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

class RegistrationDetail(models.Model):
    detail_id = models.AutoField(primary_key=True)
    registration = models.OneToOneField(EventRegistration, on_delete=models.CASCADE)
    music_instrument = models.CharField(max_length=100, null=True, blank=True)
    drinks = models.CharField(max_length=200, null=True, blank=True)
    rally_option = models.ForeignKey('BhintunaRally', on_delete=models.PROTECT, null=True, blank=True)

    class Meta:
        db_table = 'RegistrationDetail'


class BhintunaRally(models.Model):
    option_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)  # Walk, Bike, Car
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'BhintunaRally'

    def __str__(self):
        return self.name