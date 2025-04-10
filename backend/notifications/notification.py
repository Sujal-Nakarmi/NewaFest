def send_email_notification(notification):
    """
    Send an email notification with improved error handling.
    """
    from django.core.mail import send_mail
    from django.conf import settings
    import logging
    
    subject = f"Notification: {notification.get_notification_type_display()}"
    message = notification.message
    recipient_email = notification.recipient.email
    
    try:
        # Print debugging info
        print(f"Sending email to: {recipient_email}")
        print(f"From: {settings.EMAIL_HOST_USER}")
        print(f"Subject: {subject}")
        
        result = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        
        print(f"Email sending result: {result}")
        return True
    except Exception as e:
        logging.error(f"Failed to send email notification: {e}")
        print(f"Email error details: {str(e)}")
        return False

def create_notification(recipient, notification_type, booking=None, event_registration=None, message=None):
    """
    Create a new notification for a user.
    """
    from .models import Notification  # Avoid circular imports
    
    # Safely generate default messages
    try:
        if booking and hasattr(booking, 'review'):
            review_message = f"New {booking.review.rating}-star review from {booking.user.full_name}"
        else:
            review_message = ""
    except Exception:
        review_message = ""

    default_messages = {
        Notification.NotificationType.BOOKING_CREATED: (
            f"New booking request from {booking.user.full_name}" if booking else ""
        ),
        Notification.NotificationType.BOOKING_ACCEPTED: (
            f"Your booking with {booking.pandit.user.full_name} has been accepted" if booking else ""
        ),
        Notification.NotificationType.BOOKING_REJECTED: (
            f"Your booking with {booking.pandit.user.full_name} has been rejected" if booking else ""
        ),
        Notification.NotificationType.BOOKING_CANCELLED: (
            f"Booking with {booking.user.full_name} has been cancelled" if booking else ""
        ),
        Notification.NotificationType.NEW_REVIEW: review_message,
        Notification.NotificationType.EVENT_REGISTRATION_SUCCESS: (
            f"You have successfully registered for "
            f"{event_registration.event_detail.event.name if event_registration else 'event'} as "
            f"{event_registration.category.name if event_registration else 'participant'}. "
            f"You will soon receive a call for confirmation."
        )
    }

    # Choose provided message or fallback to generated one
    notification_message = message or default_messages.get(notification_type, "You have a new notification.")

    notification = Notification.objects.create(
        recipient=recipient,
        notification_type=notification_type,
        related_booking=booking,
        related_event_registration=event_registration,
        message=notification_message
    )

     # Send email notification
    try:
        send_email_notification(notification)
    except Exception as e:
        # Log the error but don't break the notification creation
        print(f"Failed to send email notification: {e}")
    
    return notification
