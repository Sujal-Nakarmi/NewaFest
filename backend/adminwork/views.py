from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from backend.permissions import IsAdmin
from django.utils import timezone
from .serializers import CombinedEventSerializer
from .serializers import RegistrationSerializer, CategorySerializer, RallySerializer
from .models import Event, EventDetail, Category, EventRegistration, RegistrationDetail, BhintunaRally
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




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def register_for_event(request):
    serializer = RegistrationSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            with transaction.atomic():
                event_detail = EventDetail.objects.get(pk=serializer.validated_data['event_detail'])
                category = Category.objects.get(pk=serializer.validated_data['category'])
                
                existing_registration = EventRegistration.objects.filter(
                    event_detail=event_detail,
                    user=request.user,
                    category=category,
                    is_deleted=False
                ).first()
                
                if existing_registration:
                    return Response(
                        {'error': f'Already registered for {category.name} this year'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                registration = EventRegistration.objects.create(
                    event_detail=event_detail,
                    user=request.user,
                    category=category
                )
                
                RegistrationDetail.objects.create(
                    registration=registration,
                    music_instrument=serializer.validated_data.get('music_instrument'),
                    drinks=serializer.validated_data.get('drinks'),
                    rally_option_id=serializer.validated_data.get('rally_option')
                )
                
                return Response({
                    'message': 'Registration successful',
                    'registration_id': registration.registration_id,
                    'category': category.name,
                    'year': event_detail.year
                }, status=status.HTTP_201_CREATED)
                
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
def get_rallyoptions(request):
    categories = BhintunaRally.objects.all()  # Get all categories from the Category model
    serializer = RallySerializer(categories, many=True)  # Serialize the data (many=True means multiple items)
    return Response(serializer.data)  # Return the serialized data in a Response object

