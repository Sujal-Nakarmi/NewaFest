from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os
from .models import RentalItem, ItemSizeVariant, DeliveryLocation
from .serializers import RentalItemSerializer, RentalItemCreateSerializer, ItemSizeVariantSerializer, OrderHistorySerializer
from rest_framework.permissions import AllowAny
from backend.permissions import IsAdminOrVendor
from rest_framework.permissions import IsAuthenticated
from .models import CartItem, Cart, RentalItem, ItemSizeVariant, Order
from .serializers import CartItemSerializer, CartSerializer, DeliveryLocationSerializer
import time
import requests

@api_view(['POST'])
@permission_classes([IsAdminOrVendor])
def create_rental_item(request):
    """Create a new rental item with optional size variants."""
    serializer = RentalItemCreateSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            rental_item = serializer.save()
            
            # Return the full item details
            response_serializer = RentalItemSerializer(rental_item)
            response_data = response_serializer.data
            
            # Construct the full image URL
            if rental_item.image:
                response_data['image'] = request.build_absolute_uri(rental_item.image.url)
                
            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdminOrVendor])
def list_rental_items(request):
    """Retrieve a list of all rental items for admin."""
    rental_items = RentalItem.objects.all()
    serializer = RentalItemSerializer(rental_items, many=True)
    
    # Construct full URLs for images
    response_data = serializer.data
    for item_data, item_obj in zip(response_data, rental_items):
        if item_obj.image:
            item_data['image'] = request.build_absolute_uri(item_obj.image.url)
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def public_list_rental_items(request):
    """Retrieve a list of available rental items for public users."""
    # Optional category filter
    category = request.query_params.get('category', None)
    
    # Filter by availability and optionally by category
    filters = {'is_available': True}
    if category:
        filters['category'] = category
    
    rental_items = RentalItem.objects.filter(**filters)
    serializer = RentalItemSerializer(rental_items, many=True)
    
    # Construct full URLs for images
    response_data = serializer.data
    for item_data, item_obj in zip(response_data, rental_items):
        if item_obj.image:
            item_data['image'] = request.build_absolute_uri(item_obj.image.url)
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_rental_item(request, item_id):
    """Retrieve details of a specific rental item."""
    rental_item = get_object_or_404(RentalItem, item_id=item_id)
    serializer = RentalItemSerializer(rental_item)
    
    # Construct full URL for image
    response_data = serializer.data
    if rental_item.image:
        response_data['image'] = request.build_absolute_uri(rental_item.image.url)
    
    return Response(response_data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAdminOrVendor])
def update_rental_item(request, item_id):
    """Update a rental item."""
    rental_item = get_object_or_404(RentalItem, item_id=item_id)
    serializer = RentalItemSerializer(rental_item, data=request.data, partial=True)
    
    if serializer.is_valid():
        try:
            updated_item = serializer.save()
            
            # Construct the full image URL
            response_data = serializer.data
            if updated_item.image:
                response_data['image'] = request.build_absolute_uri(updated_item.image.url)
            
            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminOrVendor])
def delete_rental_item(request, item_id):
    """Delete a rental item."""
    rental_item = get_object_or_404(RentalItem, item_id=item_id)
    
    try:
        # Delete the associated image file if it exists
        if rental_item.image:
            if os.path.isfile(rental_item.image.path):
                os.remove(rental_item.image.path)
        
        rental_item.delete()
        return Response({'message': 'Rental item deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@permission_classes([IsAdminOrVendor])
def add_size_variant(request, item_id):
    """Add a size variant to an existing rental item."""
    rental_item = get_object_or_404(RentalItem, item_id=item_id)
    
    # Check if the item belongs to the "Ornaments" category
    if rental_item.category and rental_item.category == "Ornaments":
        return Response(
            {'error': 'Size variants cannot be added to items in the Ornaments category'},
            status=status.HTTP_400_BAD_REQUEST
        )
        
    serializer = ItemSizeVariantSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Save the size variant with reference to the parent item
            variant = serializer.save(rental_item=rental_item)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_size_variants(request, item_id):
    """List all size variants for a rental item."""
    rental_item = get_object_or_404(RentalItem, item_id=item_id)
    variants = rental_item.size_variants.all()
    
    serializer = ItemSizeVariantSerializer(variants, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['PUT'])
@permission_classes([IsAdminOrVendor])
def update_size_variant(request, item_id, variant_id):
    """Update a size variant for a rental item."""
    variant = get_object_or_404(ItemSizeVariant, variant_id=variant_id, rental_item_id=item_id)
    serializer = ItemSizeVariantSerializer(variant, data=request.data, partial=True)
    
    if serializer.is_valid():
        try:
            updated_variant = serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminOrVendor])
def delete_size_variant(request, item_id, variant_id):
    """Delete a size variant."""
    variant = get_object_or_404(ItemSizeVariant, variant_id=variant_id, rental_item_id=item_id)
    
    # Don't delete if it's the only variant
    if variant.rental_item.size_variants.count() <= 1:
        return Response(
            {'error': 'Cannot delete the only size variant. An item must have at least one size.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # If deleting the default variant, set another one as default
    if variant.is_default:
        # Find another variant to make default
        other_variant = variant.rental_item.size_variants.exclude(variant_id=variant_id).first()
        if other_variant:
            other_variant.is_default = True
            other_variant.save()
    
    variant.delete()
    return Response({'message': 'Size variant deleted successfully'}, status=status.HTTP_200_OK)

from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from .models import CartItem, Cart, RentalItem, ItemSizeVariant
from .serializers import CartItemSerializer, CartSerializer
from rest_framework.permissions import IsAuthenticated

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime, timedelta
from django.utils import timezone
from .models import Cart, CartItem, RentalItem, ItemSizeVariant
from .serializers import CartSerializer, CartItemSerializer

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    """Add an item to the user's cart."""
    # Get required data from request
    item_id = request.data.get('item_id')
    variant_id = request.data.get('variant_id')
    quantity = int(request.data.get('quantity', 1))
    
    # Get rental dates
    rental_start_date = request.data.get('rental_start_date')
    rental_end_date = request.data.get('rental_end_date')
    
    # Default to today and tomorrow if no dates provided
    if not rental_start_date:
        rental_start_date = timezone.now().date()
    else:
        rental_start_date = datetime.strptime(rental_start_date, '%Y-%m-%d').date()
    
    if not rental_end_date:
        rental_end_date = rental_start_date + timedelta(days=1)
    else:
        rental_end_date = datetime.strptime(rental_end_date, '%Y-%m-%d').date()
    
    # Calculate rental days
    rental_days = (rental_end_date - rental_start_date).days
    if rental_days < 1:
        return Response({'error': 'Rental period must be at least 1 day'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate input data
    if not item_id:
        return Response({'error': 'Item ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if quantity <= 0:
        return Response({'error': 'Quantity must be positive'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get the rental item
    rental_item = get_object_or_404(RentalItem, item_id=item_id, is_available=True)
    
    # Get the size variant if provided, otherwise use default
    if variant_id:
        variant = get_object_or_404(ItemSizeVariant, variant_id=variant_id, rental_item=rental_item)
    else:
        # Get the default variant
        variant = rental_item.size_variants.filter(is_default=True).first()
        if not variant:
            return Response({'error': 'No default size variant found'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if the quantity is available
    if variant.quantity < quantity:
        return Response(
            {'error': f'Only {variant.quantity} units available for this size'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get or create user's cart
    cart, created = Cart.objects.get_or_create(user=request.user, is_active=True)
    
    # Check if the item is already in the cart
    cart_item = CartItem.objects.filter(cart=cart, rental_item=rental_item, size_variant=variant).first()
    
    if cart_item:
        # Update existing cart item
        cart_item.quantity += quantity
        cart_item.rental_start_date = rental_start_date
        cart_item.rental_end_date = rental_end_date
        
        # Check if updated quantity exceeds available stock
        if cart_item.quantity > variant.quantity:
            return Response(
                {'error': f'Cannot add more items. Only {variant.quantity} units available for this size'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate price
        cart_item.price = variant.get_price() * cart_item.quantity * rental_days
        cart_item.save()
    else:
        # Create new cart item
        price = variant.get_price() * quantity * rental_days
        
        cart_item = CartItem.objects.create(
            cart=cart,
            rental_item=rental_item,
            size_variant=variant,
            quantity=quantity,
            rental_start_date=rental_start_date,
            rental_end_date=rental_end_date,
            price=price
        )
    
    # Return the updated cart
    cart_serializer = CartSerializer(cart, context={'request': request})
    return Response(cart_serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart(request):
    """Get the user's current cart."""
    cart, created = Cart.objects.get_or_create(user=request.user, is_active=True)
    cart_serializer = CartSerializer(cart, context={'request': request})
    return Response(cart_serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item(request, cart_item_id):
    """Update quantity or rental dates for a cart item."""
    cart_item = get_object_or_404(CartItem, item_id=cart_item_id, cart__user=request.user)
    
    quantity = request.data.get('quantity')
    rental_start_date = request.data.get('rental_start_date')
    rental_end_date = request.data.get('rental_end_date')
    
    if quantity is not None:
        quantity = int(quantity)
        if quantity <= 0:
            # Remove the item if quantity is 0 or negative
            cart_item.delete()
            cart = cart_item.cart
            cart_serializer = CartSerializer(cart, context={'request': request})
            return Response(cart_serializer.data, status=status.HTTP_200_OK)
        
        # Check if the quantity is available
        if cart_item.size_variant.quantity < quantity:
            return Response(
                {'error': f'Only {cart_item.size_variant.quantity} units available for this size'},
                status=status.HTTP_400_BAD_REQUEST
            )
        cart_item.quantity = quantity
    
    # Update rental dates if provided
    if rental_start_date:
        cart_item.rental_start_date = datetime.strptime(rental_start_date, '%Y-%m-%d').date()
    
    if rental_end_date:
        cart_item.rental_end_date = datetime.strptime(rental_end_date, '%Y-%m-%d').date()
    
    # Validate rental period
    if (cart_item.rental_end_date - cart_item.rental_start_date).days < 1:
        return Response({'error': 'Rental period must be at least 1 day'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Calculate rental days
    rental_days = (cart_item.rental_end_date - cart_item.rental_start_date).days
    
    # Update the price
    cart_item.price = cart_item.size_variant.get_price() * cart_item.quantity * rental_days
    cart_item.save()
    
    # Return the updated cart
    cart_serializer = CartSerializer(cart_item.cart, context={'request': request})
    return Response(cart_serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, cart_item_id):
    """Remove an item from the cart."""
    cart_item = get_object_or_404(CartItem, item_id=cart_item_id, cart__user=request.user)
    cart = cart_item.cart
    cart_item.delete()
    
    # Return the updated cart
    cart_serializer = CartSerializer(cart, context={'request': request})
    return Response(cart_serializer.data, status=status.HTTP_200_OK)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    """Clear all items from the user's cart."""
    cart = Cart.objects.filter(user=request.user, is_active=True).first()
    
    if cart:
        cart.items.all().delete()
        cart_serializer = CartSerializer(cart, context={'request': request})
        return Response(cart_serializer.data, status=status.HTTP_200_OK)
    else:
        return Response({'message': 'Cart is already empty'}, status=status.HTTP_200_OK)
    

@api_view(['GET'])
@permission_classes([AllowAny])
def list_provinces(request):
    """List all provinces with available delivery locations."""
    provinces = DeliveryLocation.objects.filter(
        is_available=True
    ).values_list('province', flat=True).distinct()
    return Response(list(provinces), status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def list_metro_areas(request, province):
    """List all metro areas in a province."""
    metro_areas = DeliveryLocation.objects.filter(
        province=province, 
        is_available=True
    ).values_list('metro_area', flat=True).distinct()
    return Response(list(metro_areas), status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_areas(request, province, metro_area=None):
    """List all areas in a metro area."""
    filters = {'province': province, 'is_available': True}
    if metro_area:
        filters['metro_area'] = metro_area
    
    locations = DeliveryLocation.objects.filter(**filters)
    serializer = DeliveryLocationSerializer(locations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_delivery_location(request):
    """Update the delivery location for the user's cart."""
    location_id = request.data.get('location_id')
    
    if not location_id:
        return Response({'error': 'Location ID is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Get the delivery location
    location = get_object_or_404(DeliveryLocation, location_id=location_id, is_available=True)
    
    # Get or create user's cart
    cart, created = Cart.objects.get_or_create(user=request.user, is_active=True)
    
    # Update cart's delivery location
    cart.delivery_location = location
    cart.save()
    
    # Return the updated cart
    cart_serializer = CartSerializer(cart, context={'request': request})
    return Response(cart_serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_all_delivery_locations(request):
    """List all available delivery locations."""
    locations = DeliveryLocation.objects.filter(is_available=True)
    serializer = DeliveryLocationSerializer(locations, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_payment(request):
    cart_id = request.data.get('cart_id')
    cart = get_object_or_404(Cart, cart_id=cart_id, user=request.user, is_active=True)
    
    # Check if cart has items
    if cart.items.count() == 0:
        return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)
    

    # Create payment payload for Khalti
    frontend_success_url = "http://localhost:5173/payment/success"
    payload = {
        "return_url": request.data.get('return_url', frontend_success_url),
        "website_url": "http://127.0.0.1:8000",
        "amount": int(cart.total_price * 100),  # Convert to paisa
        "purchase_order_id": f"order_{cart.cart_id}_{int(time.time())}",
        "purchase_order_name": f"Rental Order {cart.cart_id}",
        "customer_info": {
             "name": request.user.full_name,  # Use full_name directly
            "email": request.user.email,
            "phone": request.user.phone_number  # Use phone_number directly
        }
    }
    
    # Make request to Khalti API
    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    response = requests.post(
        "https://dev.khalti.com/api/v2/epayment/initiate/", 
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        data = response.json()
        
        # Create order
        order = Order.objects.create(
            user=request.user,
            cart=cart,
            payment_method="khalti",
            transaction_id=data.get('pidx')
        )
        
        # Deactivate cart
        cart.is_active = False
        cart.save()
        
        return Response({
            'payment_url': data.get('payment_url'),
            'pidx': data.get('pidx'),
            'order_id': order.order_id
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Failed to initiate payment'}, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_payment(request):
    pidx = request.data.get('pidx')
    
    if not pidx:
        return Response({'error': 'Payment identifier (pidx) is required'}, 
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Make request to Khalti verification API
    headers = {
        "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "pidx": pidx
    }
    
    response = requests.post(
        "https://dev.khalti.com/api/v2/epayment/lookup/",
        json=payload,
        headers=headers
    )
    
    if response.status_code == 200:
        payment_data = response.json()
        transaction_id = payment_data.get('transaction_id', '')
        payment_status = payment_data.get('status', '')
        
        try:
            # Find the order associated with this payment
            order = Order.objects.get(transaction_id=pidx)
            
            # Update order status based on payment status
            if payment_status == "Completed":
                order.status = "completed"
                order.khalti_data = payment_data
                order.save()
                
                # Update cart status (mark as inactive since order is completed)
                cart = order.cart
                cart.is_active = False
                cart.save()
                
                # Update inventory quantities if needed
                for cart_item in cart.items.all():
                    size_variant = cart_item.size_variant
                    size_variant.quantity -= cart_item.quantity
                    size_variant.save()
                
                return Response({
                    'success': True,
                    'message': 'Payment verified successfully',
                    'order_id': order.order_id
                }, status=status.HTTP_200_OK)
            else:
                order.status = "failed"
                order.khalti_data = payment_data
                order.save()
                
                # Reactivate the cart as payment failed
                cart = order.cart
                cart.is_active = True
                cart.save()
                
                return Response({
                    'success': False,
                    'message': f'Payment verification failed. Status: {payment_status}',
                    'order_id': order.order_id
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Order.DoesNotExist:
            return Response({
                'error': 'Order not found for this payment'
            }, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({
            'error': 'Failed to verify payment with Khalti',
            'details': response.json() if response.content else 'No details available'
        }, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_history(request):
    """
    Get the authenticated user's order history.
    Returns:
        - List of orders with cart items and total prices
    """
    try:
        orders = Order.objects.filter(user=request.user).order_by('-created_at')
        serializer = OrderHistorySerializer(orders, many=True)
        return Response({
            'success': True,
            'orders': serializer.data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)