from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from backend.permissions import IsAdmin
from django.utils import timezone
from .serializers import CombinedEventSerializer
from .models import Event, EventDetail
from django.db import transaction

@api_view(['POST'])
@permission_classes([IsAdmin])
def manage_event(request):
    serializer = CombinedEventSerializer(data=request.data)

    if serializer.is_valid():
        try:
            with transaction.atomic():
                event_name = serializer.validated_data.get('name', None)
                existing_event = None

                if event_name:
                    existing_event = Event.objects.filter(name=event_name).first()
                
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
