from django.db import models


from django.db import models

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

'''
class RentalItem(models.Model):
    item_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField(default=1)
    image = models.ImageField(upload_to='rental_items/')
    is_available = models.BooleanField(default=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    size = models.CharField(max_length=50, blank=True, null=True)  # Added size field
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'RentalItem'
        
    def __str__(self):
        return self.name
    

class RentalItemSize(models.Model):
    size_id = models.AutoField(primary_key=True)
    rental_item = models.ForeignKey(RentalItem, on_delete=models.CASCADE, related_name='sizes')
    size = models.CharField(max_length=50)
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    # The price can be null if it's the same as the parent item
    
    class Meta:
        db_table = 'RentalItemSize'
        unique_together = ('rental_item', 'size')
        
    def __str__(self):
        return f"{self.rental_item.name} - {self.size}"
        
    def get_price(self):
        # Return this size's price or fall back to the parent item's price
        return self.price if self.price else self.rental_item.price'
'''


from django.db import models
from django.conf import settings
from django.utils import timezone

class Cart(models.Model):
    cart_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='user_carts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Cart {self.cart_id} - {self.user.username}"
    
    @property
    def total_price(self):
        return sum(item.price for item in self.items.all())
    
    @property
    def items_count(self):
        return self.items.count()
    
    class Meta:
        db_table = 'Cart'
        ordering = ['-created_at']

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