from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import PanditBooking, PanditReview, PanditAvailability, Notification
from registerlogin.models import Pandit, User
from rest_framework.permissions import AllowAny
from django.utils import timezone
from rest_framework.pagination import PageNumberPagination
from .serializers import (
    PanditDetailSerializer,
    BookingSerializer,
    CreateBookingSerializer,
    PanditReviewSerializer,
    CreateReviewSerializer,
    CreatePanditAvailabilitySerializer, PanditAvailabilitySerializer, NotificationSerializer
)

@api_view(['GET'])
@permission_classes([AllowAny])
def list_pandits(request):
    """List all available pandits."""
    pandits = Pandit.objects.select_related('user').filter(user__is_deleted=False)
    serializer = PanditDetailSerializer(pandits, many=True)
    return Response(serializer.data)

# Add this to your create_booking view for better debugging
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
            
            # Check if pandit is available at this time
            day_of_week = requested_date.weekday()  # 0-6 (Monday-Sunday)
            time_of_day = requested_date.time()
            
            # Log the requested day and time for debugging
            print(f"Requested day_of_week: {day_of_week}, time: {time_of_day}")
            
            available_slots = PanditAvailability.objects.filter(
                pandit=pandit,
                day_of_week=day_of_week,
                start_time__lte=time_of_day,
                end_time__gte=time_of_day,
                is_available=True
            )
            
            is_available = available_slots.exists()
            
            if not is_available:
                # Get all available slots for this pandit for better debugging
                all_slots = PanditAvailability.objects.filter(
                    pandit=pandit,
                    is_available=True
                ).values('day_of_week', 'start_time', 'end_time')
                
                return Response(
                    {
                        'error': 'Pandit is not available at the requested time',
                        'details': {
                            'requested_day': day_of_week,
                            'requested_time': time_of_day.strftime('%H:%M:%S'),
                            'available_slots': list(all_slots),
                            'timezone_info': {
                                'django_timezone': str(timezone.get_current_timezone()),
                                'requested_date_tzinfo': str(requested_date.tzinfo)
                            }
                        }
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create the booking with full location instead of multiple fields
            booking_data = {
                'user': request.user,
                'pandit': pandit,
                'booking_date': requested_date,
                'description': serializer.validated_data.get('description', ''),
                'status': PanditBooking.BookingStatus.PENDING
            }
            
            # Add full location if provided in request
            if 'full_location' in request.data:
                booking_data['full_location'] = request.data['full_location']
            
            # Still keep landmark if provided
            if 'landmark' in request.data:
                booking_data['landmark'] = request.data['landmark']
                
            # Keep latitude and longitude if provided
            if 'location_latitude' in request.data and 'location_longitude' in request.data:
                booking_data['location_latitude'] = request.data['location_latitude']
                booking_data['location_longitude'] = request.data['location_longitude']
            
            booking = PanditBooking.objects.create(**booking_data)
              
            # Create notification for the pandit
            from .notification import create_notification
            from .models import Notification
            create_notification(
                recipient=booking.pandit.user,
                notification_type=Notification.NotificationType.BOOKING_CREATED,
                booking=booking
            )
            
            response_serializer = BookingSerializer(booking)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            # Log the full exception for server-side debugging
            import traceback
            print(traceback.format_exc())
            
            return Response(
                {
                    'error': str(e),
                    'details': 'An unexpected error occurred. See server logs for details.'
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
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
        # Create notification for the user
    from .notification import create_notification
    from .models import Notification
    
    if new_status == PanditBooking.BookingStatus.ACCEPTED:
        create_notification(
            recipient=booking.user,
            notification_type=Notification.NotificationType.BOOKING_ACCEPTED,
            booking=booking
        )
    elif new_status == PanditBooking.BookingStatus.REJECTED:
        create_notification(
            recipient=booking.user,
            notification_type=Notification.NotificationType.BOOKING_REJECTED,
            booking=booking
        )
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
    # Create notification for the pandit
    from .notification import create_notification
    from .models import Notification
    create_notification(
        recipient=booking.pandit.user,
        notification_type=Notification.NotificationType.BOOKING_CANCELLED,
        booking=booking
    )
    
    serializer = BookingSerializer(booking)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_notifications(request):
    """Get all notifications for the current user."""
    notifications = Notification.objects.filter(recipient=request.user)
    
    # Option to filter only unread notifications
    unread_only = request.query_params.get('unread', False)
    if unread_only:
        notifications = notifications.filter(is_read=False)
        
    # Pagination (optional but recommended)
    paginator = PageNumberPagination()
    paginator.page_size = 10
    result_page = paginator.paginate_queryset(notifications, request)
    
    serializer = NotificationSerializer(result_page, many=True)
    return paginator.get_paginated_response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_notification_read(request, notification_id):
    """Mark a specific notification as read."""
    notification = get_object_or_404(
        Notification, 
        notification_id=notification_id,
        recipient=request.user
    )
    
    notification.is_read = True
    notification.save()
    
    serializer = NotificationSerializer(notification)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications for the current user as read."""
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return Response({"message": "All notifications marked as read"})


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

             # Create notification for the pandit
            from .notification import create_notification
            from .models import Notification
            
            # Create a custom notification type for reviews in models.py
            # Add this to your NotificationType class in models.py:
            # NEW_REVIEW = "new_review", "New Review Received"
            
            # Create the notification
            create_notification(
                recipient=booking.pandit.user,
                notification_type=Notification.NotificationType.NEW_REVIEW,  # You'll need to add this type
                booking=booking,
                message=f"{request.user.full_name} has left a {review.rating}-star review"
            )
            
            response_serializer = PanditReviewSerializer(review)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
@permission_classes([AllowAny])
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


# In views.py
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_pandit_availability(request, pandit_id=None):
    """List availability slots for a pandit."""
    if pandit_id:
        # List availability for a specific pandit
        pandit = get_object_or_404(Pandit, pandit_id=pandit_id)
        availabilities = PanditAvailability.objects.filter(pandit=pandit)
    elif request.user.user_role == User.UserRole.PANDIT:
        # List availability for the logged-in pandit
        pandit = get_object_or_404(Pandit, user=request.user)
        availabilities = PanditAvailability.objects.filter(pandit=pandit)
    else:
        return Response(
            {'error': 'You must be a pandit or specify a pandit ID'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = PanditAvailabilitySerializer(availabilities, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_availability(request):
    """Create availability slots for a pandit."""
    if request.user.user_role != User.UserRole.PANDIT:
        return Response(
            {'error': 'Only pandits can set availability'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    pandit = get_object_or_404(Pandit, user=request.user)
    serializer = CreatePanditAvailabilitySerializer(data=request.data)
    
    if serializer.is_valid():
        availability = serializer.save(pandit=pandit)
        response_serializer = PanditAvailabilitySerializer(availability)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def update_delete_availability(request, availability_id):
    """Update or delete an availability slot."""
    availability = get_object_or_404(PanditAvailability, availability_id=availability_id)
    
    # Check if the user is the owner of this availability
    if request.user != availability.pandit.user:
        return Response(
            {'error': 'You can only modify your own availability'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if request.method == 'DELETE':
        availability.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # For PUT requests
    serializer = CreatePanditAvailabilitySerializer(availability, data=request.data)
    if serializer.is_valid():
        updated_availability = serializer.save()
        response_serializer = PanditAvailabilitySerializer(updated_availability)
        return Response(response_serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)