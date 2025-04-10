from django.db import models
from django.conf import settings
from decimal import Decimal
from django.utils import timezone

class RentalItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    # Base price for the item (can be overridden by size variants)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='rental_items/')
    is_available = models.BooleanField(default=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rental_item'
        
    def __str__(self):
        return self.name
    
    @property
    def has_size_variants(self):
        """Return whether this item has multiple size variants."""
        return self.size_variants.count() > 0
    
    @property
    def total_quantity(self):
        """Return the total quantity across all size variants."""
        if self.has_size_variants:
            return sum(variant.quantity for variant in self.size_variants.all())
        return self.default_variant.quantity

class ItemSizeVariant(models.Model):
    variant_id = models.AutoField(primary_key=True)
    rental_item = models.ForeignKey(RentalItem, on_delete=models.CASCADE, related_name='size_variants')
    size = models.CharField(max_length=50)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_default = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'item_size_variant'
        unique_together = ('rental_item', 'size')
        
    def __str__(self):
        return f"{self.rental_item.name} - {self.size}"
    
    def get_price(self):
        """Return this size's price or fall back to the parent item's price."""
        return self.price if self.price is not None else self.rental_item.base_price
    
    def save(self, *args, **kwargs):
        # If this is the first variant or marked as default and no other default exists
        if not self.rental_item.size_variants.exists() or (
            self.is_default and not self.rental_item.size_variants.filter(is_default=True).exclude(pk=self.pk).exists()
        ):
            self.is_default = True
        super().save(*args, **kwargs)
        
class DeliveryLocation(models.Model):
    location_id = models.AutoField(primary_key=True)
    province = models.CharField(max_length=100)
    metro_area = models.CharField(max_length=100, blank=True, null=True)
    area_name = models.CharField(max_length=100)
    delivery_charge = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    landmark = models.TextField(blank=True, null=True)  # Add this field
    
    class Meta:
        db_table = 'delivery_location'
        unique_together = ('province', 'metro_area', 'area_name')
        
    def __str__(self):
        if self.metro_area:
            return f"{self.metro_area} - {self.area_name}"
        return f"{self.province} - {self.area_name}"


class Cart(models.Model):
    cart_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_carts'
    )
   
    # New location fields
    full_location = models.TextField(null=True, blank=True)
    location_latitude = models.FloatField(null=True, blank=True)
    location_longitude = models.FloatField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'Cart'
    
    def __str__(self):
        return f"Cart {self.cart_id} - {self.user.username}"
    
    @property
    def items_total(self):
        return sum(item.price for item in self.items.all())
    
    @property
    def delivery_fee(self):
    # You need to implement the logic to calculate delivery fee based on location
    # For example:
        if self.location_latitude and self.location_longitude:
            # You could implement a calculation based on distance or zone
            return Decimal('50.00')  # Default delivery fee
        return Decimal('0.00')
    
    @property
    def total_price(self):
        return Decimal(self.items_total) + Decimal(self.delivery_fee)
    
    @property
    def items_count(self):
        return self.items.count()

class CartItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    rental_item = models.ForeignKey('renting.RentalItem', on_delete=models.CASCADE)
    size_variant = models.ForeignKey('renting.ItemSizeVariant', on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    rental_start_date = models.DateField(default=timezone.now)
    rental_end_date = models.DateField(null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    added_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'CartItem'
        unique_together = ('cart', 'rental_item', 'size_variant')
        ordering = ['-added_at']
    
    def __str__(self):
        return f"{self.quantity} x {self.rental_item.name} ({self.size_variant.size})"
    
    def save(self, *args, **kwargs):
        # Calculate rental days
        if self.rental_start_date and self.rental_end_date:
            rental_days = (self.rental_end_date - self.rental_start_date).days
            if rental_days < 1:
                rental_days = 1  # Minimum 1 day
            
            # Calculate price based on quantity, rental days, and variant price
            self.price = self.size_variant.price * self.quantity * rental_days
        else:
            # Fallback to original calculation if no end date is set
            self.price = self.size_variant.price * self.quantity
        
        super().save(*args, **kwargs)


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded'),
    ]
    
    PAYMENT_METHODS = [
        ('khalti', 'Khalti'),
        ('cash', 'Cash on Delivery'),
    ]

    order_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    cart = models.OneToOneField(Cart, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    status = models.CharField(
        max_length=50, 
        choices=STATUS_CHOICES, 
        default='pending'
    )
    transaction_id = models.CharField(
        max_length=100, 
        blank=True, 
        null=True,
        unique=True
    )
    payment_method = models.CharField(
        max_length=50,
        choices=PAYMENT_METHODS
    )
    khalti_data = models.JSONField(blank=True, null=True)
    
    # New location fields
    full_location = models.TextField(null=True, blank=True)
    landmark = models.TextField(null=True, blank=True)
    location_latitude = models.FloatField(null=True, blank=True)
    location_longitude = models.FloatField(null=True, blank=True)
    
    class Meta:
        db_table = 'Order'
        indexes = [
            models.Index(fields=['transaction_id']),
            models.Index(fields=['status']),
        ]
        
    def __str__(self):
        return f"Order {self.order_id} ({self.status})"
    
class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='order_items')
    rental_item = models.ForeignKey('renting.RentalItem', on_delete=models.PROTECT)
    size_variant = models.ForeignKey('renting.ItemSizeVariant', on_delete=models.PROTECT)
    quantity = models.PositiveIntegerField()
    rental_start_date = models.DateField()
    rental_end_date = models.DateField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'OrderItem'

    def __str__(self):
        return f"{self.quantity}x {self.rental_item.name} for Order {self.order.order_id}"