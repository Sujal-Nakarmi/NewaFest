from rest_framework import serializers
from .models import RentalItem, ItemSizeVariant, DeliveryLocation

class ItemSizeVariantSerializer(serializers.ModelSerializer):
    actual_price = serializers.DecimalField(source='get_price', max_digits=10, decimal_places=2, read_only=True)
    
    
    class Meta:
        model = ItemSizeVariant
        fields = ['variant_id', 'size', 'quantity', 'price', 'actual_price', 'is_default']
        read_only_fields = ['variant_id', 'actual_price']

class DeliveryLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliveryLocation
        fields = ['location_id', 'province', 'metro_area', 'area_name', 'delivery_charge']

class RentalItemSerializer(serializers.ModelSerializer):
    size_variants = ItemSizeVariantSerializer(many=True, read_only=True)
    
    class Meta:
        model = RentalItem
        fields = ['item_id', 'name', 'description', 'base_price', 'image', 
                 'is_available', 'category', 'size_variants', 
                 'created_at', 'updated_at', 'has_size_variants', 'total_quantity']
        read_only_fields = ['item_id', 'created_at', 'updated_at', 
                           'has_size_variants', 'total_quantity']
    
    def validate_base_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than zero.")
        return value
    


# Serializer for creating a rental item with optional size variants
class RentalItemCreateSerializer(serializers.ModelSerializer):
    size_variants = ItemSizeVariantSerializer(many=True, required=False)
    
    class Meta:
        model = RentalItem
        fields = ['name', 'description', 'base_price', 'image', 
                 'is_available', 'category', 'size_variants']
    
    def create(self, validated_data):
        size_variants_data = validated_data.pop('size_variants', [])
        rental_item = RentalItem.objects.create(**validated_data)
        
        # If no size variants provided, create a default "One Size" variant
        if not size_variants_data:
            ItemSizeVariant.objects.create(
                rental_item=rental_item,
                size="One Size",
                quantity=1,
                price=None,  # Use base price
                is_default=True
            )
        else:
            # Create provided size variants
            for variant_data in size_variants_data:
                ItemSizeVariant.objects.create(rental_item=rental_item, **variant_data)
        
        return rental_item

from rest_framework import serializers
from .models import Cart, CartItem, RentalItem, ItemSizeVariant

from rest_framework import serializers
from .models import Cart, CartItem, RentalItem, ItemSizeVariant

class CartItemSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='rental_item.name', read_only=True)
    item_image = serializers.SerializerMethodField()
    size = serializers.CharField(source='size_variant.size', read_only=True)
    unit_price = serializers.SerializerMethodField()
    rental_days = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ('item_id', 'rental_item', 'size_variant', 'item_name', 'item_image', 'size',
                  'quantity', 'rental_start_date', 'rental_end_date', 'rental_days', 'unit_price', 
                  'price', 'added_at')
        read_only_fields = ('item_id', 'rental_item', 'size_variant', 'price', 'added_at')
    
    def get_item_image(self, obj):
        request = self.context.get('request')
        if obj.rental_item.image and request:
            return request.build_absolute_uri(obj.rental_item.image.url)
        return None
    
    def get_unit_price(self, obj):
        # Use the get_price method to get the correct price per day
        return obj.size_variant.get_price()
    
    def get_rental_days(self, obj):
        # Calculate rental days based on start and end dates
        if obj.rental_start_date and obj.rental_end_date:
            return (obj.rental_end_date - obj.rental_start_date).days
        return 1  # Default to 1 day if dates are not set

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    items_total = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    items_count = serializers.IntegerField(read_only=True)
    delivery_location_details = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ('cart_id', 'items', 'items_total', 'delivery_fee', 'total_price', 
                  'items_count', 'delivery_location', 'delivery_location_details', 
                  'created_at', 'updated_at')
        read_only_fields = ('cart_id', 'created_at', 'updated_at')
    
    def get_delivery_location_details(self, obj):
        if obj.delivery_location:
            return DeliveryLocationSerializer(obj.delivery_location).data
        return None