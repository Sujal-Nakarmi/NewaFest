from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import PanditBooking, PanditReview
from registerlogin.models import Pandit, User
from rest_framework.permissions import AllowAny
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from .serializers import (
    PanditDetailSerializer,
    BookingSerializer,
    CreateBookingSerializer,
    PanditReviewSerializer,
    CreateReviewSerializer
)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_pandits(request):
    """List all available pandits."""
    pandits = Pandit.objects.select_related('user').filter(user__is_deleted=False)
    serializer = PanditDetailSerializer(pandits, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_booking(request):
    serializer = CreateBookingSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            pandit = get_object_or_404(
                Pandit, 
                pandit_id=serializer.validated_data['pandit'].pandit_id,
                user__is_deleted=False
            )
            
            # Check if pandit is already booked at this time
            requested_date = serializer.validated_data['booking_date']
            existing_bookings = PanditBooking.objects.filter(
                pandit=pandit,
                booking_date__range=(
                    requested_date - timezone.timedelta(hours=1),
                    requested_date + timezone.timedelta(hours=1)
                ),
                status__in=[
                    PanditBooking.BookingStatus.PENDING,
                    PanditBooking.BookingStatus.ACCEPTED
                ]
            ).exists()
            
            if existing_bookings:
                return Response(
                    {'error': 'Pandit already has a booking at this time'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            booking = serializer.save(
                user=request.user,
                status=PanditBooking.BookingStatus.PENDING
            )
            response_serializer = BookingSerializer(booking)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_bookings(request):
    """List bookings based on user role."""
    if request.user.user_role == User.UserRole.PANDIT:
        bookings = PanditBooking.objects.filter(
            pandit__user=request.user
        ).select_related('user', 'pandit', 'pandit__user')
    else:
        bookings = PanditBooking.objects.filter(
            user=request.user
        ).select_related('user', 'pandit', 'pandit__user')
    
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_booking_status(request, booking_id):
    """Update booking status (for pandits only)."""
    booking = get_object_or_404(PanditBooking, booking_id=booking_id)
    
    if request.user != booking.pandit.user:
        return Response(
            {'error': 'Only the assigned pandit can update booking status'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    new_status = request.data.get('status')
    if new_status not in [choice[0] for choice in PanditBooking.BookingStatus.choices]:
        return Response(
            {'error': 'Invalid status value'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    booking.status = new_status
    booking.save()
    serializer = BookingSerializer(booking)
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def cancel_booking(request, booking_id):
    """Cancel a booking (for users only)."""
    booking = get_object_or_404(PanditBooking, booking_id=booking_id)
    
    if request.user != booking.user:
        return Response(
            {'error': 'Only the booking user can cancel this booking'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if booking.status not in [PanditBooking.BookingStatus.PENDING, PanditBooking.BookingStatus.ACCEPTED]:
        return Response(
            {'error': 'Cannot cancel a booking that is already cancelled or rejected'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if cancellation is allowed (e.g., not too close to booking time)
    time_until_booking = booking.booking_date - timezone.now()
    if time_until_booking < timezone.timedelta(hours=24):
        return Response(
            {'error': 'Bookings cannot be cancelled less than 24 hours before the appointment'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    booking.status = PanditBooking.BookingStatus.CANCELLED
    booking.save()
    
    # Notify pandit of cancellation
    # send_booking_notification(booking, 'cancelled')
    
    serializer = BookingSerializer(booking)
    return Response(serializer.data)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_booking_history(request):
    """Retrieve booking history for the authenticated user."""
    
    # Get all bookings for the current user
    bookings = PanditBooking.objects.filter(
        user=request.user
    ).order_by('-booking_date')  # Most recent bookings first
    
    # Optional: You can add filtering by status if needed
    status_filter = request.query_params.get('status', None)
    if status_filter:
        bookings = bookings.filter(status=status_filter)
    
    # Paginate results if there might be many bookings
    paginator = PageNumberPagination()
    paginator.page_size = 10  # Adjust based on your requirements
    paginated_bookings = paginator.paginate_queryset(bookings, request)
    
    serializer = BookingSerializer(paginated_bookings, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_review(request):
    """Create a review for a completed booking."""
    serializer = CreateReviewSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Get the booking
            booking = get_object_or_404(
                PanditBooking,
                booking_id=serializer.validated_data['booking_id']
            )
            
            # Check if this is the user's booking
            if request.user != booking.user:
                return Response(
                    {'error': 'You can only review your own bookings'},
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Check if the booking is completed (accepted status)
            if booking.status != PanditBooking.BookingStatus.ACCEPTED:
                return Response(
                    {'error': 'You can only review completed bookings'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if a review already exists
            if PanditReview.objects.filter(booking=booking).exists():
                return Response(
                    {'error': 'You have already reviewed this booking'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the review
            review = PanditReview.objects.create(
                booking=booking,
                user=request.user,
                pandit=booking.pandit,
                rating=serializer.validated_data['rating'],
                comment=serializer.validated_data['comment']
            )
            
            response_serializer = PanditReviewSerializer(review)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def pandit_reviews(request, pandit_id):
    """Get all reviews for a specific pandit."""
    pandit = get_object_or_404(Pandit, pandit_id=pandit_id)
    
    reviews = PanditReview.objects.filter(pandit=pandit)
    
    # Add pagination if needed
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_reviews = paginator.paginate_queryset(reviews, request)
    
    serializer = PanditReviewSerializer(paginated_reviews, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_reviews(request):
    """Get all reviews written by the authenticated user."""
    reviews = PanditReview.objects.filter(user=request.user)
    
    # Add pagination if needed
    paginator = PageNumberPagination()
    paginator.page_size = 10
    paginated_reviews = paginator.paginate_queryset(reviews, request)
    
    serializer = PanditReviewSerializer(paginated_reviews, many=True)
    return paginator.get_paginated_response(serializer.data)