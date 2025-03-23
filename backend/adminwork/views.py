from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from backend.permissions import IsAdmin
from django.utils import timezone
from .serializers import CombinedEventSerializer
from .serializers import RegistrationSerializer, CategorySerializer, RallySerializer, RallyLapSerializer, VolunteerLapSerializer, VolunteerTypeSerializer, NewariInstrumentSerializer, StallTypeSerializer, StallLocationSerializer
from .models import Event, EventDetail, Category, EventRegistration, RegistrationDetail, BhintunaRally, BhintunaRallyLap, VolunteerLap, VolunteerType, NewariInstrument, StallType, StallLocation
from django.db import transaction
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.conf import settings



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
    serializer = RegistrationSerializer(data=request.data)

    if serializer.is_valid():
        try:
            with transaction.atomic():
                event_detail = EventDetail.objects.get(pk=serializer.validated_data['event_detail'])
                category = Category.objects.get(pk=serializer.validated_data['category'])
                
                # Get number of seats requested (default to 1 if not specified)
                seats_requested = serializer.validated_data.get('seats_requested', 1)
                
                # Check if maximum allowed seats per user is defined for this category
                max_seats_per_user = getattr(category, 'max_seats_per_user', 5)  # Default to 5 if not set
                
                # Check if user is trying to register more than allowed seats
                if seats_requested > max_seats_per_user:
                    return Response(
                        {'error': f'Maximum {max_seats_per_user} seats allowed per user for {category.name}'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                # Count existing registrations for this user in this category for this specific event
                existing_registrations_count = EventRegistration.objects.filter(
                    event_detail=event_detail,
                    user=request.user,
                    category=category,
                    is_deleted=False
                ).count()
                
                # Check if user will exceed maximum allowed registrations
                if existing_registrations_count + seats_requested > max_seats_per_user:
                    remaining_slots = max_seats_per_user - existing_registrations_count
                    return Response(
                        {'error': f'You already have {existing_registrations_count} registrations for {category.name} in {event_detail}. Maximum allowed is {max_seats_per_user}. You can register {remaining_slots} more seats.'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                registrations = []
                
                # Pre-process rally option if needed
                rally_option = None
                if category.code == 'RALLY':
                    rally_option_id = serializer.validated_data.get('rally_option')
                    if not rally_option_id:
                        return Response(
                            {"error": "Rally option is required."}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Get the rally option - ensure it's for this specific event
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
                    
                    # Check if there are enough available seats in the rally option
                    if rally_option.available_seats < seats_requested:
                        return Response(
                            {"error": f"Not enough available seats for this rally option. Only {rally_option.available_seats} remaining."}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # Pre-process volunteer type and instrument if needed
                volunteer_type = None
                newari_instrument = None
                if category.code == 'Volunteer':
                    volunteer_type_id = serializer.validated_data.get('volunteer_type')
                    if not volunteer_type_id:
                        return Response(
                            {"error": "Volunteer type is required."}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Get the volunteer type - ensure it's for this specific event
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
                    
                    # Handle music volunteer type with instrument selection
                    if volunteer_type.code == 'Music':
                        instrument_id = serializer.validated_data.get('newari_instrument')
                        if not instrument_id:
                            return Response(
                                {"error": "Musical instrument is required for music volunteers."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        # Get the instrument - ensure it's for this specific event
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
                        
                        # Check if there are enough available seats for this instrument
                        if newari_instrument.available_seats < seats_requested:
                            return Response(
                                {"error": f"Not enough available positions for this instrument. Only {newari_instrument.available_seats} remaining."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                         
                # Pre-process stall type if needed
                stall_type = None
                stall_location = None
                if category.code == 'STALL':
                    stall_type_id = serializer.validated_data.get('stall_type')
                    if not stall_type_id:
                        return Response(
                            {"error": "Stall type is required."}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    # Get the stall type - ensure it's for this specific event
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
                    
                    # Check if there are enough available seats for this stall type
                    if stall_type.available_seats < seats_requested:
                        return Response(
                            {"error": f"Not enough available spaces for this stall type. Only {stall_type.available_seats} remaining."}, 
                            status=status.HTTP_400_BAD_REQUEST
                        )
                    
                    stall_location_id = serializer.validated_data.get('stall_location')
                    if not stall_location_id:
                        return Response(
                             {"error": "Stall location is required."}, 
                             status=status.HTTP_400_BAD_REQUEST
                        )

                    # Get the stall location - ensure it's for this specific event
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
                    
                    # Check if there are enough available seats at this location
                    if stall_location.available_seats < seats_requested:
                        return Response(
                            {"error": f"Not enough available spaces at this location. Only {stall_location.available_seats} remaining."}, 
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

                # Process registrations for each seat
                for _ in range(seats_requested):
                    # Create event registration
                    registration = EventRegistration.objects.create(
                        event_detail=event_detail,
                        user=request.user,
                        category=category
                    )
                    
                    # Handle rally registration
                    if category.code == 'RALLY':
                        selected_laps = serializer.validated_data.get('rally_laps', [])
                        
                        if not selected_laps:
                            registration.delete()  # Clean up if validation fails
                            return Response(
                                {"error": "At least one lap must be selected."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        # Get selected laps - ensure they're for this specific rally option
                        rally_laps = BhintunaRallyLap.objects.filter(
                            lap_id__in=selected_laps, 
                            rally_option=rally_option
                        )
                        
                        if not rally_laps.exists() or rally_laps.count() != len(selected_laps):
                            registration.delete()  # Clean up if validation fails
                            return Response(
                                {"error": f"Invalid laps selected for {rally_option.name}."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        # Deduct a seat from the rally option - this is now done once per registration
                        rally_option.available_seats -= 1
                        rally_option.save()
                    
                    # Handle volunteer registration
                    elif category.code == 'Volunteer':
                        selected_volunteer_laps = serializer.validated_data.get('volunteer_laps', [])
                        
                        if not selected_volunteer_laps:
                            registration.delete()  # Clean up if validation fails
                            return Response(
                                {"error": "At least one volunteer lap must be selected."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        # Get selected volunteer laps - ensure they're for this specific event
                        volunteer_laps = VolunteerLap.objects.filter(
                            lap_id__in=selected_volunteer_laps,
                            event_detail=event_detail,
                            is_active=True
                        )
                        
                        if not volunteer_laps.exists() or volunteer_laps.count() != len(selected_volunteer_laps):
                            registration.delete()  # Clean up if validation fails
                            return Response(
                                {"error": f"Invalid volunteer laps selected for {event_detail}."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        # For music volunteers, properly deduct instrument seat for each registration
                        if volunteer_type.code == 'Music' and newari_instrument:
                            # Re-fetch the instrument to get latest available_seats count
                            fresh_instrument = NewariInstrument.objects.get(pk=newari_instrument.instrument_id)
                            if fresh_instrument.available_seats < 1:
                                registration.delete()  # Clean up if validation fails
                                return Response(
                                    {"error": "No available positions left for this instrument."}, 
                                    status=status.HTTP_400_BAD_REQUEST
                                )
                            
                            # Deduct one seat from the instrument and save
                            fresh_instrument.available_seats -= 1
                            fresh_instrument.save()
                            
                            # Update our reference to the instrument with the fresh one
                            newari_instrument = fresh_instrument
                    
                    # Handle stall registration
                    elif category.code == 'STALL':
                        # Deduct a seat from the stall type - ensure we get the fresh instance
                        fresh_stall_type = StallType.objects.get(pk=stall_type.type_id)
                        if fresh_stall_type.available_seats < 1:
                            registration.delete()  # Clean up if validation fails
                            return Response(
                                {"error": "No available spaces left for this stall type."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        # Deduct one seat from the stall type and save
                        fresh_stall_type.available_seats -= 1
                        fresh_stall_type.save()
                        
                        # Update our reference to the stall type with the fresh one
                        stall_type = fresh_stall_type
                        
                        # Deduct a seat from the stall location - ensure we get the fresh instance
                        fresh_stall_location = StallLocation.objects.get(pk=stall_location.location_id)
                        if fresh_stall_location.available_seats < 1:
                            # Rollback the stall type seat deduction
                            fresh_stall_type.available_seats += 1
                            fresh_stall_type.save()
                            
                            registration.delete()  # Clean up if validation fails
                            return Response(
                                {"error": "No available spaces left at this location."}, 
                                status=status.HTTP_400_BAD_REQUEST
                            )
                        
                        # Deduct one seat from the stall location and save
                        fresh_stall_location.available_seats -= 1
                        fresh_stall_location.save()
                        
                        # Update our reference to the stall location with the fresh one
                        stall_location = fresh_stall_location
                    
                    # Create registration detail
                    registration_detail = RegistrationDetail.objects.create(
                        registration=registration,
                        newari_instrument=newari_instrument,
                        drinks=serializer.validated_data.get('drinks'),
                        food_items=serializer.validated_data.get('food_items'),
                        rally_option=rally_option,
                        volunteer_type=volunteer_type,
                        stall_type=stall_type,
                        stall_location=stall_location
                    )
                    
                    # Assign laps based on category
                    if category.code == 'RALLY' and 'rally_laps' in locals():
                        registration_detail.rally_laps.set(rally_laps)
                    
                    if category.code == 'Volunteer' and 'volunteer_laps' in locals():
                        registration_detail.volunteer_laps.set(volunteer_laps)
                    
                    registrations.append(registration.registration_id)
                
                # Return success response with all registration IDs
                return Response({
                    'message': f'Successfully registered {seats_requested} seat(s)',
                    'registration_ids': registrations,
                    'category': category.name,
                    'event': f"{event_detail.event.name} - {event_detail.year}"
                }, status=status.HTTP_201_CREATED)

        except EventDetail.DoesNotExist:
            return Response({'error': 'Event detail not found'}, status=status.HTTP_404_NOT_FOUND)
        except Category.DoesNotExist:
            return Response({'error': 'Category not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


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
def get_all_user_registrations(request, year=None):
    """Get all user registrations for admins."""
    registrations = EventRegistration.objects.filter(is_deleted=False)
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