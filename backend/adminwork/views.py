from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from backend.permissions import IsAdmin
from django.utils import timezone
from .serializers import CombinedEventSerializer
from .serializers import RegistrationSerializer, CategorySerializer, RallySerializer, RallyLapSerializer, VolunteerLapSerializer, VolunteerTypeSerializer, NewariInstrumentSerializer, StallTypeSerializer, StallLocationSerializer
from .models import Event, EventDetail, Category, EventRegistration, RegistrationDetail, BhintunaRally, BhintunaRallyLap, VolunteerLap, VolunteerType, NewariInstrument, StallType, StallLocation, BhintunaTicket
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.conf import settings
import requests
import time



@api_view(['POST'])
@permission_classes([IsAdmin])
def manage_event(request):
    """Create a new event or event detail."""
    serializer = CombinedEventSerializer(data=request.data)

    if serializer.is_valid():
        try:
            with transaction.atomic():
                event_name = serializer.validated_data.get('name', None)
                existing_event = Event.objects.filter(name=event_name).first() if event_name else None

                if not existing_event:
                    # Creating a new event
                    existing_event = Event.objects.create(
                        name=event_name,
                        description=serializer.validated_data.get('description', ''),
                        photo=serializer.validated_data.get('photo', None)
                    )

                # Check if event detail for this year already exists
                year = serializer.validated_data['year']
                existing_detail = EventDetail.objects.filter(event=existing_event, year=year).first()

                if existing_detail:
                    return Response(
                        {'error': f'Event detail for year {year} already exists'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Create new event detail
                event_detail = EventDetail.objects.create(
                    event=existing_event,
                    location=serializer.validated_data['location'],
                    start_time=serializer.validated_data['start_time'],
                    year=year,
                    is_active=(year == timezone.now().year)
                )

                response_data = {
                    'message': 'Event created/updated successfully',
                    'event': {
                        'event_id': existing_event.event_id,
                        'name': existing_event.name,
                        'description': existing_event.description,
                        'photo': request.build_absolute_uri(existing_event.photo.url) if existing_event.photo else None,
                        'location': event_detail.location,
                        'start_time': event_detail.start_time,
                        'year': event_detail.year,
                        'is_active': event_detail.is_active
                    }
                }

                return Response(response_data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAdmin])
def list_events(request):
    """Retrieve a list of events along with the latest event details."""
    events = Event.objects.all()
    response_data = []

    for event in events:
        latest_detail = event.details.order_by('-year').first()
        if latest_detail:
            response_data.append({
                'event_id': event.event_id,
                'name': event.name,
                'description': event.description,
                'photo': request.build_absolute_uri(event.photo.url) if event.photo else None,
                'location': latest_detail.location,
                'start_time': latest_detail.start_time,
                'year': latest_detail.year,
                'is_active': latest_detail.is_active
            })

    return Response(response_data, status=status.HTTP_200_OK)




# In your views.py
@api_view(['GET'])
@permission_classes([AllowAny]) 
def public_list_events(request):
    """Retrieve a list of events along with the latest event details for public users."""
    events = Event.objects.all()
    response_data = []
    
    for event in events:
        latest_detail = event.details.order_by('-year').first()
        if latest_detail:
            # Make sure to construct the full URL correctly
            photo_url = None
            if event.photo:
                photo_url = request.build_absolute_uri(settings.MEDIA_URL + event.photo.name)
            
            response_data.append({
                'event_id': event.event_id,
                'event_detail_id': latest_detail.event_detail_id, 
                'name': event.name,
                'description': event.description,
                'photo': photo_url,
                'location': latest_detail.location,
                'start_time': latest_detail.start_time,
                'year': latest_detail.year,
                'is_active': latest_detail.is_active
            })
    
    return Response(response_data, status=status.HTTP_200_OK)

# In your views.py
@api_view(['GET'])
@permission_classes([AllowAny])
def get_event_detail(request, event_detail_id):
    """Retrieve specific event details by event_detail_id."""
    try:
        event_detail = EventDetail.objects.get(pk=event_detail_id)
        event = event_detail.event
        
        # Build photo URL if available
        photo_url = None
        if event.photo:
            photo_url = request.build_absolute_uri(settings.MEDIA_URL + event.photo.name)
        
        response_data = {
            'event_id': event.event_id,
            'event_detail_id': event_detail.event_detail_id,
            'name': event.name,
            'description': event.description,
            'photo': photo_url,
            'location': event_detail.location,
            'start_time': event_detail.start_time,
            'year': event_detail.year,
            'is_active': event_detail.is_active
        }
        
        return Response(response_data, status=status.HTTP_200_OK)
        
    except EventDetail.DoesNotExist:
        return Response({'error': 'Event detail not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAdmin])
def update_event(request, event_id):
    """Update event details or event year-specific details."""
    event = get_object_or_404(Event, event_id=event_id)
    serializer = CombinedEventSerializer(data=request.data, partial=True)

    if serializer.is_valid():
        try:
            with transaction.atomic():
                # Update event details
                event.name = serializer.validated_data.get('name', event.name)
                event.description = serializer.validated_data.get('description', event.description)
                event.photo = serializer.validated_data.get('photo', event.photo)
                event.save()

                # Update event detail if year is provided
                if 'year' in serializer.validated_data:
                    year = serializer.validated_data['year']
                    event_detail = EventDetail.objects.filter(event=event, year=year).first()

                    if not event_detail:
                        return Response(
                            {'error': f'Event detail for year {year} not found'}, 
                            status=status.HTTP_404_NOT_FOUND
                        )

                    event_detail.location = serializer.validated_data.get('location', event_detail.location)
                    event_detail.start_time = serializer.validated_data.get('start_time', event_detail.start_time)
                    event_detail.is_active = (year == timezone.now().year)
                    event_detail.save()

                return Response({'message': 'Event updated successfully'}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def delete_event(request, event_id):
    """Delete an event and its associated details."""
    event = get_object_or_404(Event, event_id=event_id)

    try:
        event.delete()
        return Response({'message': 'Event deleted successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, serializers
from django.db import transaction

from .models import (
    EventDetail, Category, EventRegistration, RegistrationDetail,
    BhintunaRally, BhintunaRallyLap, VolunteerType, 
    VolunteerLap, NewariInstrument
)
from .serializers import RegistrationSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_for_event(request):
    # Common validation for all registration types
    serializer = RegistrationSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        with transaction.atomic():
            # Get common data
            event_detail = EventDetail.objects.get(pk=serializer.validated_data['event_detail'])
            category = Category.objects.get(pk=serializer.validated_data['category'])
            
            # Route to the appropriate registration handler based on category code
            if category.code == 'RALLY':
                return register_for_rally(request, serializer, event_detail, category)
            elif category.code == 'Volunteer':
                return register_for_volunteer(request, serializer, event_detail, category)
            elif category.code == 'STALL':
                return register_for_stall(request, serializer, event_detail, category)
            else:
                # Handle other category types or return an error
                return Response(
                    {'error': f'Registration for {category.name} is not supported'},
                    status=status.HTTP_400_BAD_REQUEST
                )
                
    except EventDetail.DoesNotExist:
        return Response({'error': 'Event detail not found'}, status=status.HTTP_404_NOT_FOUND)
    except Category.DoesNotExist:
        return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


def register_for_rally(request, serializer, event_detail, category):
    """Handle Bhintuna Rally registrations"""
    # Get number of seats requested (default to 1 if not specified)
    seats_requested = serializer.validated_data.get('seats_requested', 1)
    
    # Check if maximum allowed seats per user is defined for this category
    max_seats_per_user = getattr(category, 'max_seats_per_user', 8)  # Default to 6 if not set

    # Check if user is trying to register more than allowed seats
    if seats_requested > max_seats_per_user:
        return Response(
            {'error': f'Maximum {max_seats_per_user} seats allowed per user for {category.name}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Count existing registrations for this user in this category for this specific event
    existing_registrations = EventRegistration.objects.filter(
        event_detail=event_detail,
        user=request.user,
        category=category,
        is_deleted=False
    )
    existing_registrations_count = existing_registrations.count()
    
    # Check if user will exceed maximum allowed registrations
    if existing_registrations_count + seats_requested > max_seats_per_user:
        error_msg = (f'You already have {existing_registrations_count} registrations for {category.name} in {event_detail}. '
                     f'Maximum allowed is {max_seats_per_user}.')
        return Response(
            {'error': error_msg},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process rally option
    rally_option_id = serializer.validated_data.get('rally_option')
    if not rally_option_id:
        return Response(
            {"error": "Rally option is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        rally_option = BhintunaRally.objects.get(
            pk=rally_option_id,
            event_detail=event_detail,
            is_active=True
        )
    except BhintunaRally.DoesNotExist:
        return Response(
            {"error": f"Invalid rally option for {event_detail}."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if rally_option.available_seats < seats_requested:
        return Response(
            {"error": f"Not enough available seats for this rally option. Only {rally_option.available_seats} remaining."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate laps
    selected_laps = serializer.validated_data.get('rally_laps', [])
    if not selected_laps:
        return Response(
            {"error": "At least one lap must be selected."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    rally_laps = BhintunaRallyLap.objects.filter(
        lap_id__in=selected_laps, 
        rally_option=rally_option
    )
    
    if not rally_laps.exists() or rally_laps.count() != len(selected_laps):
        return Response(
            {"error": f"Invalid laps selected for {rally_option.name}."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process registrations
    registrations = []
    for _ in range(seats_requested):
        registration = EventRegistration.objects.create(
            event_detail=event_detail,
            user=request.user,
            category=category
        )
        
        # Update available seats
        rally_option.available_seats -= 1
        rally_option.save()
        
        # Create registration detail
        registration_detail = RegistrationDetail.objects.create(
            registration=registration,
            rally_option=rally_option
        )
        
        # Assign rally laps
        registration_detail.rally_laps.set(rally_laps)
        
        # Create notification for event registration success
        from notifications.notification import create_notification
        from notifications.models import Notification

        create_notification(
            recipient=request.user,
            notification_type=Notification.NotificationType.EVENT_REGISTRATION_SUCCESS,
            booking=None,  # No booking for event registrations
            event_registration=registration
        )
        
        registrations.append(registration.registration_id)
    
    # Return success response
    return Response({
        'message': f'Successfully registered {seats_requested} seat(s)',
        'registration_ids': registrations,
        'category': category.name,
        'event': f"{event_detail.event.name} - {event_detail.year}"
    }, status=status.HTTP_201_CREATED)


def register_for_volunteer(request, serializer, event_detail, category):
    """Handle Volunteer registrations"""
    # Get number of seats requested (default to 1 if not specified)
    seats_requested = serializer.validated_data.get('seats_requested', 1)
    
    # Check if maximum allowed seats per user is defined for this category
    max_seats_per_user = getattr(category, 'max_seats_per_user', 12)  # Default to 6 if not set

    # Check if user is trying to register more than allowed seats
    if seats_requested > max_seats_per_user:
        return Response(
            {'error': f'Maximum {max_seats_per_user} seats allowed per user for {category.name}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Count existing registrations for this user in this category for this specific event
    existing_registrations = EventRegistration.objects.filter(
        event_detail=event_detail,
        user=request.user,
        category=category,
        is_deleted=False
    )
    existing_registrations_count = existing_registrations.count()
    
    # Check if user will exceed maximum allowed registrations
    if existing_registrations_count + seats_requested > max_seats_per_user:
        error_msg = (f'You already have {existing_registrations_count} registrations for {category.name} in {event_detail}. '
                     f'Maximum allowed is {max_seats_per_user}.')
        return Response(
            {'error': error_msg},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process volunteer type
    volunteer_type_id = serializer.validated_data.get('volunteer_type')
    if not volunteer_type_id:
        return Response(
            {"error": "Volunteer type is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        volunteer_type = VolunteerType.objects.get(
            pk=volunteer_type_id,
            event_detail=event_detail,
            is_active=True
        )
    except VolunteerType.DoesNotExist:
        return Response(
            {"error": f"Invalid volunteer type for {event_detail}."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Process musical instrument if needed
    newari_instrument = None
    if volunteer_type.code == 'Music':
        instrument_id = serializer.validated_data.get('newari_instrument')
        if not instrument_id:
            return Response(
                {"error": "Musical instrument is required for music volunteers."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            newari_instrument = NewariInstrument.objects.get(
                pk=instrument_id,
                event_detail=event_detail,
                is_active=True
            )
        except NewariInstrument.DoesNotExist:
            return Response(
                {"error": f"Invalid musical instrument for {event_detail}."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
        if newari_instrument.available_seats < seats_requested:
            return Response(
                {"error": f"Not enough available positions for this instrument. Only {newari_instrument.available_seats} remaining."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Validate volunteer laps
    selected_volunteer_laps = serializer.validated_data.get('volunteer_laps', [])
    if not selected_volunteer_laps:
        return Response(
            {"error": "At least one volunteer lap must be selected."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    volunteer_laps = VolunteerLap.objects.filter(
        lap_id__in=selected_volunteer_laps,
        event_detail=event_detail,
        is_active=True
    )
    
    if not volunteer_laps.exists() or volunteer_laps.count() != len(selected_volunteer_laps):
        return Response(
            {"error": f"Invalid volunteer laps selected for {event_detail}."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process registrations
    registrations = []
    for _ in range(seats_requested):
        registration = EventRegistration.objects.create(
            event_detail=event_detail,
            user=request.user,
            category=category
        )
        
        # Update available seats for instrument if applicable
        if volunteer_type.code == 'Music' and newari_instrument:
            fresh_instrument = NewariInstrument.objects.get(pk=newari_instrument.instrument_id)
            if fresh_instrument.available_seats < 1:
                registration.delete()
                return Response(
                    {"error": "No available positions left for this instrument."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            fresh_instrument.available_seats -= 1
            fresh_instrument.save()
            newari_instrument = fresh_instrument
        
        # Create registration detail
        registration_detail = RegistrationDetail.objects.create(
            registration=registration,
            volunteer_type=volunteer_type,
            newari_instrument=newari_instrument
        )
        
        # Assign volunteer laps
        registration_detail.volunteer_laps.set(volunteer_laps)
        
        # Create notification for event registration success
        from notifications.notification import create_notification
        from notifications.models import Notification

        create_notification(
            recipient=request.user,
            notification_type=Notification.NotificationType.EVENT_REGISTRATION_SUCCESS,
            booking=None,  # No booking for event registrations
            event_registration=registration
        )
        
        registrations.append(registration.registration_id)
    
    # Return success response
    return Response({
        'message': f'Successfully registered {seats_requested} seat(s)',
        'registration_ids': registrations,
        'category': category.name,
        'event': f"{event_detail.event.name} - {event_detail.year}"
    }, status=status.HTTP_201_CREATED)


def register_for_stall(request, serializer, event_detail, category):
    """Handle Stall registrations"""
    # For stalls, always set max_seats_per_user to 1 and force seats_requested to 1
    max_seats_per_user = 1
    seats_requested = 1  # Force to 1 regardless of input
    
    # Count existing registrations for this user in this category for this specific event
    existing_registrations = EventRegistration.objects.filter(
        event_detail=event_detail,
        user=request.user,
        category=category,
        is_deleted=False
    )
    existing_registrations_count = existing_registrations.count()
    
    # Check if user will exceed maximum allowed registrations
    if existing_registrations_count >= max_seats_per_user:
        error_msg = f'You can only register 1 stall for {event_detail}. You already have an existing stall registration.'
        return Response(
            {'error': error_msg},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process stall type
    stall_type_id = serializer.validated_data.get('stall_type')
    if not stall_type_id:
        return Response(
            {"error": "Stall type is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        stall_type = StallType.objects.get(
            pk=stall_type_id,
            event_detail=event_detail,
            is_active=True
        )
    except StallType.DoesNotExist:
        return Response(
            {"error": f"Invalid stall type for {event_detail}."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if stall_type.available_seats < 1:
        return Response(
            {"error": f"No available spaces for this stall type."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process stall location
    stall_location_id = serializer.validated_data.get('stall_location')
    if not stall_location_id:
        return Response(
            {"error": "Stall location is required."}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        stall_location = StallLocation.objects.get(
            pk=stall_location_id,
            event_detail=event_detail,
            is_active=True
        )
    except StallLocation.DoesNotExist:
        return Response(
            {"error": f"Invalid stall location for {event_detail}."}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if stall_location.available_seats < 1:
        return Response(
            {"error": f"No available spaces at this location."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check required fields based on stall type
    if stall_type.code == 'FOOD' and not serializer.validated_data.get('food_items'):
        return Response(
            {"error": "Food items details are required for food stalls."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
        
    if stall_type.code == 'DRINKS' and not serializer.validated_data.get('drinks'):
        return Response(
            {"error": "Drinks details are required for drink stalls."}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Process registration
    registration = EventRegistration.objects.create(
        event_detail=event_detail,
        user=request.user,
        category=category
    )
    
    # Update available seats
    stall_type.available_seats -= 1
    stall_type.save()
    
    stall_location.available_seats -= 1
    stall_location.save()
    
    # Create registration detail
    registration_detail = RegistrationDetail.objects.create(
        registration=registration,
        stall_type=stall_type,
        stall_location=stall_location,
        drinks=serializer.validated_data.get('drinks'),
        food_items=serializer.validated_data.get('food_items')
    )
    
    # Create notification for event registration success
    from notifications.notification import create_notification
    from notifications.models import Notification

    create_notification(
        recipient=request.user,
        notification_type=Notification.NotificationType.EVENT_REGISTRATION_SUCCESS,
        booking=None,  # No booking for event registrations
        event_registration=registration
    )
    
    # Return success response
    return Response({
        'message': 'Successfully registered your stall',
        'registration_ids': [registration.registration_id],
        'category': category.name,
        'event': f"{event_detail.event.name} - {event_detail.year}"
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_registrations(request, year=None):
    """Get user's registrations with optional year filter."""
    registrations = EventRegistration.objects.filter(
        user=request.user,
        is_deleted=False
    )
    
    if year:
        registrations = registrations.filter(event_detail__year=year)
    
    data = []
    for reg in registrations.select_related('event_detail', 'category', 'registrationdetail'):
        reg_data = {
            'registration_id': reg.registration_id,
            'event_name': reg.event_detail.event.name,
            'category': reg.category.name,
            'year': reg.event_detail.year,
            'registration_date': reg.registration_date
        }
        
        # Add category-specific details
        if hasattr(reg, 'registrationdetail'):
            if reg.category.code == 'MUSIC':
                reg_data['music_instrument'] = reg.registrationdetail.music_instrument
            elif reg.category.code == 'STALL':
                reg_data['drinks'] = reg.registrationdetail.drinks
        
        data.append(reg_data)
    
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAdmin])
def get_all_user_registrations(request):
    # Get query parameters
    category = request.query_params.get('category', None)
    event_name = request.query_params.get('event_name', None)
    
    # Start with base queryset
    registrations = EventRegistration.objects.filter(is_deleted=False)
    
    # Apply filters - add explicit checks
    if category and category.strip():
        registrations = registrations.filter(category__name__iexact=category.strip())
    if event_name and event_name.strip():
        registrations = registrations.filter(event_detail__event__name__iexact=event_name.strip())
    
    # Now get distinct combinations from the FILTERED queryset
    distinct_regs = registrations.values(
        'user__id',
        'event_detail__event__name',
        'category__name',
        'event_detail__year'
    ).distinct()
    
    data = []
    
    for combo in distinct_regs:
        # Get all registrations for this user-event-category combo
        user_regs = registrations.filter(
            user__id=combo['user__id'],
            event_detail__event__name=combo['event_detail__event__name'],
            category__name=combo['category__name'],
            event_detail__year=combo['event_detail__year']
        ).select_related(
            'user', 'event_detail', 'event_detail__event', 'category',
            'registrationdetail'
        ).prefetch_related(
            'registrationdetail__volunteer_laps',
            'registrationdetail__rally_laps'
        )
        
        # Calculate total seats
        total_seats = 0
        
        # Get the earliest registration date
        first_reg = user_regs.order_by('registration_date').first()
        if not first_reg:
            continue  # skip if no registration found (shouldn't happen)
        
        # Group by identical details
        grouped_details = {}
        
        for reg in user_regs:
            # Create a key for grouping identical registrations
            detail_key = combo['category__name']
            
            # Common details
            seats = 0
            detail_hash = {}
            
            # Get registration detail if exists
            if hasattr(reg, 'registrationdetail'):
                detail = reg.registrationdetail
                seats = detail.seats
                total_seats += seats
                
                category_name = reg.category.name
                detail_hash['seats'] = seats
                
                # Add category-specific fields
                if category_name == 'Stall':
                    if detail.stall_type:
                        detail_hash['stall_type'] = detail.stall_type.name
                        detail_key += f"-{detail.stall_type.name}"
                    if detail.stall_location:
                        detail_hash['stall_location'] = detail.stall_location.name
                        detail_key += f"-{detail.stall_location.name}"
                    detail_hash['drinks'] = detail.drinks
                    detail_hash['food_items'] = detail.food_items
                    detail_key += f"-{detail.drinks}-{detail.food_items}"
                
                elif category_name == 'Rally':
                    if detail.rally_option:
                        detail_hash['rally_option'] = detail.rally_option.name
                        detail_key += f"-{detail.rally_option.name}"
                    rally_laps = list(detail.rally_laps.values('lap_number', 'route_description'))
                    if rally_laps:
                        detail_hash['rally_laps'] = rally_laps
                        detail_key += f"-laps:{len(rally_laps)}"
                
                elif category_name == 'Volunteer':
                    if detail.volunteer_type:
                        detail_hash['volunteer_type'] = detail.volunteer_type.name
                        detail_key += f"-{detail.volunteer_type.name}"
                    if detail.newari_instrument:
                        detail_hash['instrument'] = detail.newari_instrument.name
                        detail_key += f"-{detail.newari_instrument.name}"
                    volunteer_laps = list(detail.volunteer_laps.values('lap_number', 'route_description', 'time'))
                    if volunteer_laps:
                        detail_hash['volunteer_laps'] = volunteer_laps
                        for lap in volunteer_laps:
                            detail_key += f"-lap:{lap['lap_number']}-{lap['time']}"
            
            # Handle Ihi registrations (separate table)
            if reg.category.name == 'Ihi' and hasattr(reg, 'ihiregistration'):
                ihi_reg = reg.ihiregistration
                seats = ihi_reg.seats
                total_seats += seats
                detail_hash['seats'] = seats
                detail_hash['location'] = ihi_reg.location.address
                detail_hash['phone'] = ihi_reg.phone
                detail_hash['description'] = ihi_reg.description
                detail_key += f"-{ihi_reg.location.address}-{ihi_reg.phone}"
            
            # Add or update group
            if detail_key in grouped_details:
                grouped_details[detail_key]['registration_ids'].append(reg.registration_id)
                grouped_details[detail_key]['seats'] += seats
            else:
                detail_hash['registration_ids'] = [reg.registration_id]
                grouped_details[detail_key] = detail_hash
        
        # Convert grouped details to list
        details_list = list(grouped_details.values())
        
        data.append({
            'registration_ids': list(user_regs.values_list('registration_id', flat=True)),
            'event_name': combo['event_detail__event__name'],
            'category': combo['category__name'],
            'year': combo['event_detail__year'],
            'registration_date': first_reg.registration_date,
            'user_info': {
                'id': combo['user__id'],
                'name': first_reg.user.full_name,
                'phone_number': first_reg.user.phone_number,
            },
            'total_seats': total_seats,
            'details': details_list
        })
    
    return Response(data, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny]) 
def get_category(request):
    categories = Category.objects.all()  # Get all categories from the Category model
    serializer = CategorySerializer(categories, many=True)  # Serialize the data (many=True means multiple items)
    return Response(serializer.data)  # Return the serialized data in a Response object


@api_view(['GET'])
@permission_classes([AllowAny])
def get_rally_options(request):
    """
    Get rally options, optionally filtered by event_detail_id
    """
    event_detail_id = request.query_params.get('event_detail_id')
    
    if event_detail_id:
        try:
            # Validate event_detail_id exists
            EventDetail.objects.get(pk=event_detail_id)
            rally_options = BhintunaRally.objects.filter(
                event_detail_id=event_detail_id,
                is_active=True
            )
        except EventDetail.DoesNotExist:
            return Response({"error": "Event detail not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        rally_options = BhintunaRally.objects.filter(is_active=True)
    
    serializer = RallySerializer(rally_options, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_rally_laps(request):
    """
    Get rally laps, optionally filtered by rally_option_id
    """
    rally_option_id = request.query_params.get('rally_option_id')
    
    if rally_option_id:
        try:
            # Validate rally_option_id exists
            BhintunaRally.objects.get(pk=rally_option_id)
            laps = BhintunaRallyLap.objects.filter(rally_option_id=rally_option_id)
        except BhintunaRally.DoesNotExist:
            return Response({"error": "Rally option not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        laps = BhintunaRallyLap.objects.all()
    
    serializer = RallyLapSerializer(laps, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_volunteer_types(request):
    """
    Get volunteer types, optionally filtered by event_detail_id
    """
    event_detail_id = request.query_params.get('event_detail_id')
    
    if event_detail_id:
        try:
            # Validate event_detail_id exists
            EventDetail.objects.get(pk=event_detail_id)
            volunteer_types = VolunteerType.objects.filter(
                event_detail_id=event_detail_id,
                is_active=True
            )
        except EventDetail.DoesNotExist:
            return Response({"error": "Event detail not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        volunteer_types = VolunteerType.objects.filter(is_active=True)
    
    serializer = VolunteerTypeSerializer(volunteer_types, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_newari_instruments(request):
    """
    Get Newari instruments, optionally filtered by event_detail_id
    """
    event_detail_id = request.query_params.get('event_detail_id')
    
    if event_detail_id:
        try:
            # Validate event_detail_id exists
            EventDetail.objects.get(pk=event_detail_id)
            instruments = NewariInstrument.objects.filter(
                event_detail_id=event_detail_id,
                is_active=True
            )
        except EventDetail.DoesNotExist:
            return Response({"error": "Event detail not found"}, status=status.HTTP_404_NOT_FOUND)
    else:
        instruments = NewariInstrument.objects.filter(is_active=True)
    
    serializer = NewariInstrumentSerializer(instruments, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_volunteer_laps(request):
    """
    Get volunteer laps for a specific event
    """
    event_detail_id = request.query_params.get('event_detail_id')
    
    if not event_detail_id:
        return Response({"error": "event_detail_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Validate event_detail_id exists
        EventDetail.objects.get(pk=event_detail_id)
        laps = VolunteerLap.objects.filter(
            event_detail_id=event_detail_id,
            is_active=True
        )
    except EventDetail.DoesNotExist:
        return Response({"error": "Event detail not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = VolunteerLapSerializer(laps, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_stall_types(request):
    """
    Get stall types for a specific event
    """
    event_detail_id = request.query_params.get('event_detail_id')
    
    if not event_detail_id:
        return Response({"error": "event_detail_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Validate event_detail_id exists
        EventDetail.objects.get(pk=event_detail_id)
        stall_types = StallType.objects.filter(
            event_detail_id=event_detail_id,
            is_active=True
        )
    except EventDetail.DoesNotExist:
        return Response({"error": "Event detail not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = StallTypeSerializer(stall_types, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_stall_locations(request):
    """
    Get stall locations for a specific event
    """
    event_detail_id = request.query_params.get('event_detail_id')
    
    if not event_detail_id:
        return Response({"error": "event_detail_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Validate event_detail_id exists
        EventDetail.objects.get(pk=event_detail_id)
        stall_locations = StallLocation.objects.filter(
            event_detail_id=event_detail_id,
            is_active=True
        )
    except EventDetail.DoesNotExist:
        return Response({"error": "Event detail not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = StallLocationSerializer(stall_locations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_event_options(request):
    """
    Get all options for a specific event in a single API call
    """
    event_detail_id = request.query_params.get('event_detail_id')
    
    if not event_detail_id:
        return Response({"error": "event_detail_id is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Validate event_detail exists
        event_detail = EventDetail.objects.get(pk=event_detail_id)
        
        # Get all options for this event
        rally_options = BhintunaRally.objects.filter(event_detail=event_detail, is_active=True)
        
        # Get all rally laps for the rally options
        rally_option_ids = rally_options.values_list('option_id', flat=True)
        rally_laps = BhintunaRallyLap.objects.filter(rally_option_id__in=rally_option_ids)
        
        volunteer_types = VolunteerType.objects.filter(event_detail=event_detail, is_active=True)
        instruments = NewariInstrument.objects.filter(event_detail=event_detail, is_active=True)
        volunteer_laps = VolunteerLap.objects.filter(event_detail=event_detail, is_active=True)
        stall_types = StallType.objects.filter(event_detail=event_detail, is_active=True)
        stall_locations = StallLocation.objects.filter(event_detail=event_detail, is_active=True)
        
        # Serialize the data
        return Response({
            "rally_options": RallySerializer(rally_options, many=True).data,
            "rally_laps": RallyLapSerializer(rally_laps, many=True).data,
            "volunteer_types": VolunteerTypeSerializer(volunteer_types, many=True).data,
            "instruments": NewariInstrumentSerializer(instruments, many=True).data,
            "volunteer_laps": VolunteerLapSerializer(volunteer_laps, many=True).data,
            "stall_types": StallTypeSerializer(stall_types, many=True).data,
            "stall_locations": StallLocationSerializer(stall_locations, many=True).data,
        })
        
    except EventDetail.DoesNotExist:
        return Response({"error": "Event detail not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def initiate_ticket_payment(request):
    # Add logging for debugging
    print(f"Authenticated User: {request.user}")
    print(f"Registration ID: {request.data.get('registration_id')}")

    registration_id = request.data.get('registration_id')
    
    try:
        registration = EventRegistration.objects.get(
            registration_id=registration_id, 
            user=request.user
        )
        
        # Get the number of seats from the registration_detail
        try:
            registration_detail = RegistrationDetail.objects.get(registration=registration)
            # Assuming seats_requested is stored somewhere in the registration process
            # If not stored directly, you might need to add this field to your model
            seats = request.data.get('seats', 1)  # Default to 1 if not provided
        except RegistrationDetail.DoesNotExist:
            seats = 1  # Default to 1 seat if detail not found
            
        # Calculate price based on number of seats
        price_per_seat = 200  # Price per seat in NPR
        total_price = price_per_seat * seats
        total_paisa = total_price * 100  # Convert to paisa for Khalti
        
    except EventRegistration.DoesNotExist:
        # More detailed error response
        return Response({
            'error': 'No registration found',
            'details': {
                'user_id': request.user.id,
                'registration_id': registration_id,
                'existing_registrations': list(EventRegistration.objects.filter(user=request.user).values_list('registration_id', flat=True))
            }
        }, status=status.HTTP_404_NOT_FOUND)

    # Create payment payload for Khalti
    frontend_success_url = "http://localhost:5173/ticket/payment/success"
    payload = {
        "return_url": request.data.get('return_url', frontend_success_url),
        "website_url": "http://127.0.0.1:8000",
        "amount": total_paisa,  # Calculated amount in paisa
        "purchase_order_id": f"ticket_{registration.registration_id}_{int(time.time())}",
        "purchase_order_name": f"Bhintuna Rally Ticket {registration.registration_id}",
        "customer_info": {
            "name": request.user.full_name,
            "email": request.user.email,
            "phone": request.user.phone_number
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
        
        # Create ticket
        ticket = BhintunaTicket.objects.create(
            user=request.user,
            event_registration=registration,
            transaction_id=data.get('pidx'),
            price=total_price,  # Use the calculated total price
            seats=seats,  # Store the number of seats
            status='pending'
        )
        
        return Response({
            'payment_url': data.get('payment_url'),
            'pidx': data.get('pidx'),
            'ticket_id': ticket.ticket_id,
            'total_price': total_price,  # Return the total price to the frontend
            'seats': seats  # Return the number of seats for confirmation
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Failed to initiate payment'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_ticket_payment(request):
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
            # Find the ticket associated with this payment
            ticket = BhintunaTicket.objects.get(transaction_id=pidx)
            
            # Update ticket status based on payment status
            if payment_status == "Completed":
                ticket.status = "completed"
                ticket.khalti_data = payment_data
                ticket.save()
                
                return Response({
                    'success': True,
                    'message': 'Ticket payment verified successfully',
                    'ticket_id': ticket.ticket_id,
                    'event_registration_id': ticket.event_registration.registration_id
                }, status=status.HTTP_200_OK)
            else:
                ticket.status = "failed"
                ticket.khalti_data = payment_data
                ticket.save()
                
                return Response({
                    'success': False,
                    'message': f'Ticket payment verification failed. Status: {payment_status}',
                    'ticket_id': ticket.ticket_id
                }, status=status.HTTP_400_BAD_REQUEST)
                
                
        except BhintunaTicket.DoesNotExist:
            return Response({
                'error': 'Ticket not found for this payment'
            }, status=status.HTTP_404_NOT_FOUND)
    else:
        return Response({
            'error': 'Failed to verify ticket payment with Khalti',
            'details': response.json() if response.content else 'No details available'
        }, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def ticket_history(request):
    """
    Get the authenticated user's ticket history.
    Returns:
        - List of tickets with event registration details
    """
    try:
        tickets = BhintunaTicket.objects.filter(
            user=request.user
        ).select_related(
            'event_registration', 
            'event_registration__event_detail', 
            'event_registration__event_detail__event'
        ).order_by('-created_at')
        
        ticket_data = []
        for ticket in tickets:
            ticket_info = {
                'ticket_id': ticket.ticket_id,
                'event_name': ticket.event_registration.event_detail.event.name,
                'event_date': ticket.event_registration.event_detail.start_time,
                'price': ticket.price,
                'status': ticket.status,
                'created_at': ticket.created_at
            }
            ticket_data.append(ticket_info)
        
        return Response({
            'success': True,
            'tickets': ticket_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    


# views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import EventDetail, IhiLocation, EventRegistration, IhiRegistration
from .serializers import IhiLocationSerializer
from django.db import transaction

@api_view(['GET'])
@permission_classes([AllowAny])
def get_ihi_locations(request):
    """Get available ihi locations for an event."""
    event_detail_id = request.GET.get('event_detail_id')
    
    if not event_detail_id:
        return Response(
            {'error': 'event_detail_id is required'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        locations = IhiLocation.objects.filter(
            event_detail_id=event_detail_id,
            is_active=True
        )
        
        serializer = IhiLocationSerializer(locations, many=True)
        return Response({'locations': serializer.data})
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_ihi(request):
    """Register for Ihi event."""
    data = request.data
    user = request.user
    
    # Extract required fields
    event_detail_id = data.get('event_detail')
    location_id = data.get('location')
    seats_requested = data.get('seats_requested', 1)
    phone = data.get('phone')
    description = data.get('description', '')
    
    # Validate input
    if not event_detail_id:
        return Response({'error': 'event_detail_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not location_id:
        return Response({'error': 'location is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not phone:
        return Response({'error': 'phone number is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if seats_requested < 1 or seats_requested > 3:
        return Response({'error': 'Seats must be between 1 and 3'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Get event detail
        event_detail = EventDetail.objects.get(event_detail_id=event_detail_id)
        
        # Get location and check availability
        location = IhiLocation.objects.get(id=location_id)
        
        if location.available_seats < seats_requested:
            return Response(
                {'error': f'Not enough seats available at this location. Available: {location.available_seats}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find Ihi category
        ihi_category = Category.objects.get(code='IHI')
        
        with transaction.atomic():
            # Create event registration
            event_registration = EventRegistration.objects.create(
                event_detail=event_detail,
                user=user,
                category=ihi_category
            )
            
            # Create ihi registration with phone and description
            ihi_registration = IhiRegistration.objects.create(
                event_registration=event_registration,
                location=location,
                seats=seats_requested,
                phone=phone,
                description=description
            )
            
            # Update available seats
            location.available_seats -= seats_requested
            location.save()

         # Create notification for event registration success
            from notifications.notification import create_notification
            from notifications.models import Notification
            
            create_notification(
                recipient=request.user,
                notification_type=Notification.NotificationType.EVENT_REGISTRATION_SUCCESS,
                booking=None,  # No booking for event registrations
                event_registration=event_registration
            )

            return Response({
                'message': 'Successfully registered for Ihi ceremony',
                'registration_id': ihi_registration.registration_id
            }, status=status.HTTP_201_CREATED)
    
    except EventDetail.DoesNotExist:
        return Response({'error': 'Event detail not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except IhiLocation.DoesNotExist:
        return Response({'error': 'Location not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except Category.DoesNotExist:
        return Response({'error': 'Ihi category not found'}, status=status.HTTP_404_NOT_FOUND)
    
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
