from django.db import models
from django.utils import timezone
from django.conf import settings


class Event(models.Model):
    # Unchanged
    event_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    photo = models.ImageField(upload_to='event_photos/')
    
    class Meta:
        db_table = 'Event'

    def __str__(self):
        return self.name


class EventDetail(models.Model):
    # Unchanged
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
        
    def __str__(self):
        return f"{self.event.name} - {self.year}"


# Update the models to make event_detail nullable first
class VolunteerType(models.Model):
    type_id = models.AutoField(primary_key=True)
    event_detail = models.ForeignKey(EventDetail, on_delete=models.CASCADE, related_name='volunteer_types', null=True, blank=True)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'VolunteerType'
        verbose_name_plural = 'VolunteerTypes'
    
    def __str__(self):
        event_info = self.event_detail if self.event_detail else "No Event"
        return f"{event_info} - {self.name}"


class NewariInstrument(models.Model):
    instrument_id = models.AutoField(primary_key=True)
    event_detail = models.ForeignKey(EventDetail, on_delete=models.CASCADE, related_name='instruments', null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    available_seats = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'NewariInstrument'
    
    def __str__(self):
        event_info = self.event_detail if self.event_detail else "No Event"
        return f"{event_info} - {self.name} (Available: {self.available_seats})"


class VolunteerLap(models.Model):
    lap_id = models.AutoField(primary_key=True)
    event_detail = models.ForeignKey(EventDetail, on_delete=models.CASCADE, related_name='volunteer_laps', null=True, blank=True)
    lap_number = models.PositiveIntegerField(null=True)
    route_description = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    time = models.TimeField(null=True)
    
    class Meta:
        db_table = 'VolunteerLap'
    
    def __str__(self):
        time_str = self.time.strftime('%I:%M %p') if self.time else "TBD"
        event_info = self.event_detail if self.event_detail else "No Event"
        return f"{event_info} - Lap {self.lap_number}: {self.route_description} at {time_str}"


class Category(models.Model):
    # Unchanged
    category_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    description = models.TextField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'Category'
        verbose_name_plural = 'Categories'
    
    def __str__(self):
        return self.name


class BhintunaRally(models.Model):
    option_id = models.AutoField(primary_key=True)
    event_detail = models.ForeignKey(EventDetail, on_delete=models.CASCADE, related_name='rally_options', null=True, blank=True)
    name = models.CharField(max_length=50)
    available_seats = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'BhintunaRally'

    def __str__(self):
        event_info = self.event_detail if self.event_detail else "No Event"
        return f"{event_info} - {self.name} (Seats: {self.available_seats})"


class BhintunaRallyLap(models.Model):
    # Unchanged
    lap_id = models.AutoField(primary_key=True)
    rally_option = models.ForeignKey(BhintunaRally, on_delete=models.CASCADE)
    lap_number = models.PositiveIntegerField()
    route_description = models.CharField(max_length=255)
    
    class Meta:
        db_table = 'BhintunaRallyLap'
        unique_together = ['rally_option', 'lap_number']
    
    def __str__(self):
        return f"Lap {self.lap_number}: {self.route_description}"
    



class StallType(models.Model):
    type_id = models.AutoField(primary_key=True)
    event_detail = models.ForeignKey(EventDetail, on_delete=models.CASCADE, related_name='stall_types', null=True, blank=True)
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20)
    description = models.TextField(null=True, blank=True)
    available_seats = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'StallType'
        verbose_name_plural = 'StallTypes'
    
    def __str__(self):
        event_info = self.event_detail if self.event_detail else "No Event"
        return f"{event_info} - {self.name} (Available: {self.available_seats})"


class StallLocation(models.Model):
    location_id = models.AutoField(primary_key=True)
    event_detail = models.ForeignKey(EventDetail, on_delete=models.CASCADE, related_name='stall_locations', null=True, blank=True)
    name = models.CharField(max_length=100)
    description = models.TextField(null=True, blank=True)
    available_seats = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'StallLocation'
    
    def __str__(self):
        event_info = self.event_detail if self.event_detail else "No Event"
        return f"{event_info} - {self.name} (Available: {self.available_seats})"


class EventRegistration(models.Model):
    # Unchanged
    registration_id = models.AutoField(primary_key=True)
    event_detail = models.ForeignKey(EventDetail, on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.ForeignKey(Category, on_delete=models.PROTECT)
    registration_date = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'EventRegistration'
    
    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()


class RegistrationDetail(models.Model):
    # Unchanged
    detail_id = models.AutoField(primary_key=True)
    registration = models.OneToOneField(EventRegistration, on_delete=models.CASCADE)
    # Stall-specific fields
    stall_type = models.ForeignKey(StallType, on_delete=models.PROTECT, null=True, blank=True)
    drinks = models.CharField(max_length=200, null=True, blank=True)
    food_items = models.CharField(max_length=200, null=True, blank=True)
    stall_location = models.ForeignKey(StallLocation, on_delete=models.PROTECT, null=True, blank=True)
    # Rally-specific fields
    rally_option = models.ForeignKey(BhintunaRally, on_delete=models.PROTECT, null=True, blank=True)
    rally_laps = models.ManyToManyField(BhintunaRallyLap, blank=True)
    # Volunteer-specific fields
    volunteer_type = models.ForeignKey(VolunteerType, on_delete=models.PROTECT, null=True, blank=True)
    newari_instrument = models.ForeignKey(NewariInstrument, on_delete=models.PROTECT, null=True, blank=True)
    volunteer_laps = models.ManyToManyField(VolunteerLap, blank=True)
    
    class Meta:
        db_table = 'RegistrationDetail'


class BhintunaTicket(models.Model):
    ticket_id = models.AutoField(primary_key=True)
    event_registration = models.OneToOneField('EventRegistration', on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=200)
    transaction_id = models.CharField(max_length=255, null=True, blank=True)
    payment_method = models.CharField(max_length=50, default='khalti')
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed')
    ], default='pending')
    khalti_data = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'BhintunaTicket'

    def __str__(self):
        return f"Ticket {self.ticket_id} - {self.user.full_name}"