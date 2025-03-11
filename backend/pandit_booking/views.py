from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from .models import PanditBooking
from registerlogin.models import Pandit, User
from rest_framework.permissions import AllowAny
from .serializers import (
    PanditDetailSerializer,
    BookingSerializer,
    CreateBookingSerializer
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
    """Create a new booking for a pandit."""
    serializer = CreateBookingSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            # Check if pandit exists and is active
            pandit = get_object_or_404(
                Pandit, 
                pandit_id=serializer.validated_data['pandit'].pandit_id,
                user__is_deleted=False
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