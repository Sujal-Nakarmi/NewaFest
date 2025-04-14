from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from rest_framework.pagination import PageNumberPagination
from .serializer import  NotificationSerializer
from rest_framework.response import Response
from django.shortcuts import get_object_or_404



# Create your views here.

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


# 1. Install the required packages
# pip install qrcode pillow

# In your Django views.py or a separate utility file:
import qrcode
from io import BytesIO
import base64
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
from adminwork.models import EventRegistration
from django.conf import settings

# In notifications/qr_code.py
import qrcode
from io import BytesIO
import base64
import qrcode
from io import BytesIO
import base64

def generate_qr_code(data):
    import qrcode
    from io import BytesIO

    qr = qrcode.make(data)
    buffered = BytesIO()
    qr.save(buffered, format="PNG")
    buffered.seek(0)
    return buffered.read()  # Return binary content


def ticket_view(request, registration_id):
    """View for displaying a ticket with an embedded QR code"""
    # Get the registration from database
    registration = get_object_or_404(EventRegistration, registration_id=registration_id)
    
     # Generate verification URL
    verification_url = f"{settings.SITE_URL}/adminwork/qr/verify-registration/{registration.registration_id}/"
    
    # Generate QR code
    qr_code = generate_qr_code(verification_url)
    
  
    


    # Get registration details
    registration_detail = registration.registrationdetail
    event_detail = registration.event_detail
    category = registration.category
    
    # Prepare context based on category type
    context = {
        'user': registration.user,
        'event_name': event_detail.event.name,
        'event_year': event_detail.year,
        'event_location': event_detail.location,
        'event_start_time': event_detail.start_time,
        'registration_id': registration.registration_id,
        'registration_date': registration.registration_date,
        'category': category.name,
        'category_code': category.code,
        'qr_code': qr_code,
    }
    
    # Add category-specific details
    if category.code == 'RALLY':
        context.update({
            'rally_option': registration_detail.rally_option.name,
            'rally_laps': list(registration_detail.rally_laps.all()),
            'seats': registration_detail.seats,
        })
        template_name = 'notifications/email/rally_ticket.html'
        
    elif category.code == 'Volunteer':
        context.update({
            'volunteer_type': registration_detail.volunteer_type.name,
            'volunteer_laps': list(registration_detail.volunteer_laps.all()),
        })
        if registration_detail.newari_instrument:
            context['instrument'] = registration_detail.newari_instrument.name
        template_name = 'notifications/email/volunteer_ticket.html'
        
    elif category.code == 'STALL':
        context.update({
            'stall_type': registration_detail.stall_type.name,
            'stall_location': registration_detail.stall_location.name,
        })
        if registration_detail.food_items:
            context['food_items'] = registration_detail.food_items
        if registration_detail.drinks:
            context['drinks'] = registration_detail.drinks
        template_name = 'notifications/email/stall_ticket.html'
        
    else:
        # Default template for other categories
        template_name = 'notifications/email/generic_ticket.html'
    
    # Render the appropriate ticket template
    return render(request, template_name, context)