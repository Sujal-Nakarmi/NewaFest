def send_email_notification(notification):
    from django.core.mail import EmailMultiAlternatives
    from django.conf import settings
    from django.template.loader import render_to_string
    from django.utils.html import strip_tags
    from email.mime.image import MIMEImage
    import logging
    from django.core.mail import send_mail

    subject = f"Notification: {notification.get_notification_type_display()}"
    recipient_email = notification.recipient.email

    try:
        if notification.notification_type == notification.NotificationType.EVENT_REGISTRATION_SUCCESS and notification.related_event_registration:
            registration = notification.related_event_registration
            event_detail = registration.event_detail
            category = registration.category

            verification_url = f"{settings.SITE_URL}/verify/{registration.registration_id}/"

            from notifications.views import generate_qr_code
            qr_image_binary = generate_qr_code(verification_url)

            # Prepare context
            context = {
                'user': notification.recipient,
                'event_name': event_detail.event.name,
                'event_year': event_detail.year,
                'event_location': event_detail.location,
                'event_start_time': event_detail.start_time,
                'registration_id': registration.formatted_id,
                'raw_registration_id': registration.registration_id,
                'registration_date': registration.registration_date,
                'category': category.name,
                'category_code': category.code,
            }

            # Add category-specific context
            if category.code == 'RALLY':
                registration_detail = registration.registrationdetail
                context.update({
                    'rally_option': registration_detail.rally_option.name,
                    'rally_laps': list(registration_detail.rally_laps.all()),
                    'seats': registration_detail.seats,
                })
                template_name = 'notifications/email/rally_ticket.html'

            elif category.code == 'Volunteer':
                registration_detail = registration.registrationdetail
                context.update({
                    'volunteer_type': registration_detail.volunteer_type.name,
                    'volunteer_laps': list(registration_detail.volunteer_laps.all()),
                })
                if registration_detail.newari_instrument:
                    context['instrument'] = registration_detail.newari_instrument.name
                template_name = 'notifications/email/volunteer_ticket.html'

            elif category.code == 'STALL':
                registration_detail = registration.registrationdetail
                context.update({
                    'stall_type': registration_detail.stall_type.name,
                    'stall_location': registration_detail.stall_location.name,
                })
                if registration_detail.food_items:
                    context['food_items'] = registration_detail.food_items
                if registration_detail.drinks:
                    context['drinks'] = registration_detail.drinks
                template_name = 'notifications/email/stall_ticket.html'
            
            elif category.code == 'IHI':
                # Retrieve IHI registration details
                try:
                    ihi_registration = registration.ihiregistration
                    ihi_location = ihi_registration.location
                    
                    context.update({
                        'ihi_location': ihi_location,
                        'seats': ihi_registration.seats,
                        'phone': ihi_registration.phone,
                        'description': ihi_registration.description,
                    })
                    template_name = 'notifications/email/ihi_ticket.html'
                except:
                    # Fallback if IHI registration details are not found
                    logging.error(f"IHI registration details not found for registration {registration.registration_id}")
                    template_name = 'notifications/email/generic_ticket.html'

            else:
                template_name = 'notifications/email/generic_ticket.html'

            # Add placeholder for QR in template
            context['qr_cid'] = 'qr_code_image'

            html_content = render_to_string(template_name, context)
            text_content = strip_tags(html_content)

            email = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[recipient_email]
            )
            email.attach_alternative(html_content, "text/html")

            # Attach QR code with CID
            qr_attachment = MIMEImage(qr_image_binary)
            qr_attachment.add_header('Content-ID', '<qr_code_image>')
            qr_attachment.add_header('Content-Disposition', 'inline', filename="qr_code.png")
            email.attach(qr_attachment)

            result = email.send()

        else:
            message = notification.message
            result = send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )

        print(f"Email sent: {result}")
        return True

    except Exception as e:
        logging.error(f"Failed to send email notification: {e}")
        print(f"Email error: {e}")
        return False

def create_notification(recipient, notification_type, booking=None, event_registration=None, message=None):
    """
    Create a new notification for a user with enhanced details for event registrations.
    """
    from .models import Notification  # Avoid circular imports
    
    # For event registrations, create a detailed message
    if notification_type == Notification.NotificationType.EVENT_REGISTRATION_SUCCESS and event_registration:
        event_name = event_registration.event_detail.event.name
        category_name = event_registration.category.name
        
        # Generate proper notification message
        notification_message = (
            f"You have successfully registered for {event_name} as a {category_name}. "
            f"Your registration ID is {event_registration.formatted_id}. "
            f"Please check your email for your detailed ticket information."
        )
    else:
        # Handle other notification types as before
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
        }
        
        # Choose provided message or fallback to generated one
        notification_message = message or default_messages.get(notification_type, "You have a new notification.")
    
    # Create the notification record
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