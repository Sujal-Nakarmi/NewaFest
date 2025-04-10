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
