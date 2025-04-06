from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models
from django.utils import timezone
from django.db.models.signals import post_save



# Custom user manager
class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, password, **extra_fields)

    # Add method to get active users only
    def active(self):
        return self.filter(is_deleted=False)

class User(AbstractBaseUser):
    class UserRole(models.TextChoices):
        NORMAL_USER = "normal_user", "Normal User"
        ADMIN = "admin", "Admin"
        PANDIT = "pandit", "Pandit"
        VENDOR = "vendor", "Vendor" 

    id = models.AutoField(primary_key=True)
    full_name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    password = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=10)
    address = models.CharField(max_length=200)
    country = models.CharField(max_length=50)
    profile_picture = models.ImageField(upload_to='profile_pictures/', null=True, blank=True)
    user_role = models.CharField(
        max_length=15,
        choices=UserRole.choices,
        default=UserRole.NORMAL_USER
    )
    # Add fields for soft delete
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)


    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name', 'phone_number', 'address', 'country']

    objects = UserManager()

    class Meta:
        db_table = 'User'

    def soft_delete(self):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.email = f"deleted_{self.id}_{self.email}"  # Prevent email conflicts
        self.save()

    

class Pandit(models.Model):
    pandit_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    experience_years = models.IntegerField()
    experience_description = models.TextField()
    # Add this to your Pandit model
    average_rating = models.FloatField(default=0.0)
    total_reviews = models.IntegerField(default=0)


    class Meta:
        db_table = "Pandit"


class Vendor(models.Model):
    vendor_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=200)
    business_description = models.TextField()
    
    
    class Meta:
        db_table = "Vendor"


class Inquiry(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150)
    phone_number = models.CharField(max_length=20)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'inquiry'
    
    def mark_as_resolved(self):
        self.is_resolved = True
        self.resolved_at = timezone.now()
        self.save()

    def __str__(self):
        return f"{self.name} - {self.subject}"