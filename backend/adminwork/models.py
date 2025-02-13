from django.db import models
from django.utils import timezone

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