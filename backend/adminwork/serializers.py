from rest_framework import serializers
from .models import (
    Event, EventDetail, Category, BhintunaRally, BhintunaRallyLap,
    VolunteerType, VolunteerLap, NewariInstrument, StallType, StallLocation,
    EventRegistration, RegistrationDetail
)

class CombinedEventSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200, required=False)
    description = serializers.CharField(required=False)
    photo = serializers.ImageField(required=False)
    location = serializers.CharField(max_length=200)
    start_time = serializers.DateTimeField()
    year = serializers.IntegerField()
    
    def validate(self, data):
        event_name = data.get("name")
        if event_name:
            existing_event = Event.objects.filter(name=event_name).first()
            
            # If event does not exist, require description and photo
            if not existing_event:
                if not data.get("description"):
                    raise serializers.ValidationError({"description": "Description is required for new events."})
                if not data.get("photo"):
                    raise serializers.ValidationError({"photo": "Photo is required for new events."})
        
        return data

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class VolunteerTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerType
        fields = '__all__'

class NewariInstrumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewariInstrument
        fields = '__all__'

class VolunteerLapSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerLap
        fields = '__all__'

class RallySerializer(serializers.ModelSerializer):
    class Meta:
        model = BhintunaRally
        fields = '__all__'

class RallyLapSerializer(serializers.ModelSerializer):
    class Meta:
        model = BhintunaRallyLap
        fields = '__all__'

class StallTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StallType
        fields = '__all__'

class StallLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = StallLocation
        fields = '__all__'

class RegistrationSerializer(serializers.Serializer):
    event_detail = serializers.IntegerField()
    category = serializers.IntegerField()
    
    # Multiple seats support
    seats_requested = serializers.IntegerField(default=1, min_value=1, max_value=10)
    
    # Rally-specific fields
    rally_option = serializers.IntegerField(required=False, allow_null=True)
    rally_laps = serializers.ListField(child=serializers.IntegerField(), required=False)
    
    # Volunteer-specific fields
    volunteer_type = serializers.IntegerField(required=False, allow_null=True)
    newari_instrument = serializers.IntegerField(required=False, allow_null=True)
    volunteer_laps = serializers.ListField(child=serializers.IntegerField(), required=False)
    
    # Stall-specific fields
    stall_type = serializers.IntegerField(required=False, allow_null=True)
    drinks = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    food_items = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    stall_location = serializers.IntegerField(required=False, allow_null=True)
    
    def validate(self, data):
        try:
            category = Category.objects.get(pk=data['category'])
            event_detail = EventDetail.objects.get(pk=data['event_detail'])
            
            # Validate seats requested against available seats
            seats_requested = data.get('seats_requested', 1)
            
            if category.code == 'RALLY':
                if not data.get('rally_option'):
                    raise serializers.ValidationError({"rally_option": "Rally option is required"})
                
                # Get rally option for the specific event
                rally_option = BhintunaRally.objects.filter(
                    pk=data['rally_option'],
                    event_detail=event_detail,
                    is_active=True
                ).first()
                
                if not rally_option:
                    raise serializers.ValidationError({
                        "rally_option": f"This rally option is not available for the selected event {event_detail}"
                    })
                
                # Check if enough seats are available for the request
                if rally_option.available_seats < seats_requested:
                    raise serializers.ValidationError({
                        "seats_requested": f"Not enough seats available. Only {rally_option.available_seats} remaining."
                    })
                
                selected_laps = data.get('rally_laps', [])
                if not selected_laps:
                    raise serializers.ValidationError({"rally_laps": "At least one lap must be selected"})
                
                # Validate lap IDs for this rally option
                valid_laps = BhintunaRallyLap.objects.filter(
                    lap_id__in=selected_laps,
                    rally_option=rally_option
                ).count()
                
                if valid_laps != len(selected_laps):
                    raise serializers.ValidationError({"rally_laps": "Some selected laps are invalid"})
            
            elif category.code == 'VOLUNTEER':
                if not data.get('volunteer_type'):
                    raise serializers.ValidationError({"volunteer_type": "Volunteer type is required"})
                
                # Get volunteer type for the specific event
                volunteer_type = VolunteerType.objects.filter(
                    pk=data['volunteer_type'], 
                    event_detail=event_detail,
                    is_active=True
                ).first()
                
                if not volunteer_type:
                    raise serializers.ValidationError({
                        "volunteer_type": f"This volunteer type is not available for the selected event {event_detail}"
                    })
                
                # For music volunteer type, check the instrument
                if volunteer_type.code == 'MUSIC':
                    if not data.get('newari_instrument'):
                        raise serializers.ValidationError({
                            "newari_instrument": "Instrument selection is required for music volunteers"
                        })
                    
                    # Get instrument for the specific event
                    instrument = NewariInstrument.objects.filter(
                        pk=data['newari_instrument'],
                        event_detail=event_detail,
                        is_active=True
                    ).first()
                    
                    if not instrument:
                        raise serializers.ValidationError({
                            "newari_instrument": f"This instrument is not available for the selected event {event_detail}"
                        })
                    
                    # Check if enough instrument positions are available
                    if instrument.available_seats < seats_requested:
                        raise serializers.ValidationError({
                            "seats_requested": f"Not enough positions available for this instrument. Only {instrument.available_seats} remaining."
                        })
                
                # All volunteer types need to select laps
                selected_laps = data.get('volunteer_laps', [])
                if not selected_laps:
                    raise serializers.ValidationError({"volunteer_laps": "At least one lap must be selected"})
                
                # Validate lap IDs for this event
                valid_laps = VolunteerLap.objects.filter(
                    lap_id__in=selected_laps,
                    event_detail=event_detail,
                    is_active=True
                ).count()
                
                if valid_laps != len(selected_laps):
                    raise serializers.ValidationError({"volunteer_laps": "Some selected volunteer laps are invalid for this event"})
            
            elif category.code == 'STALL':
                if not data.get('stall_type'):
                    raise serializers.ValidationError({"stall_type": "Stall type is required"})
                
                # Get stall type for the specific event
                stall_type = StallType.objects.filter(
                    pk=data['stall_type'],
                    event_detail=event_detail,
                    is_active=True
                ).first()
                
                if not stall_type:
                    raise serializers.ValidationError({
                        "stall_type": f"This stall type is not available for the selected event {event_detail}"
                    })
                
                # Check if enough seats are available for the request
                if stall_type.available_seats < seats_requested:
                    raise serializers.ValidationError({
                        "seats_requested": f"Not enough stall spaces available. Only {stall_type.available_seats} remaining."
                    })
                
                # Add validation for stall location within the STALL condition
                if not data.get('stall_location'):
                    raise serializers.ValidationError({"stall_location": "Stall location is required"})
                
                # Get stall location for the specific event
                stall_location = StallLocation.objects.filter(
                    pk=data['stall_location'],
                    event_detail=event_detail,
                    is_active=True
                ).first()
                
                if not stall_location:
                    raise serializers.ValidationError({
                        "stall_location": f"This stall location is not available for the selected event {event_detail}"
                    })
                
                # Check if enough seats are available at this location
                if stall_location.available_seats < seats_requested:
                    raise serializers.ValidationError({
                        "stall_location": f"Not enough spaces available at this location. Only {stall_location.available_seats} remaining."
                    })
                
                # Validate required fields based on stall type
                if stall_type.code == 'FOOD' and not data.get('food_items'):
                    raise serializers.ValidationError({"food_items": "Food items are required for food stalls"})
                
                if stall_type.code == 'DRINKS' and not data.get('drinks'):
                    raise serializers.ValidationError({"drinks": "Drinks information is required for drinks stalls"})
            
            return data
            
        except Category.DoesNotExist:
            raise serializers.ValidationError({"category": "Invalid category ID"})
        except EventDetail.DoesNotExist:
            raise serializers.ValidationError({"event_detail": "Invalid event detail ID"})
        except Exception as e:
            raise serializers.ValidationError({"non_field_errors": str(e)})

class EventDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventDetail
        fields = '__all__'

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class EventOptionsSerializer(serializers.Serializer):
    """Serializer to return all options available for a specific event"""
    event_detail_id = serializers.IntegerField()
    
    def validate(self, data):
        try:
            event_detail_id = data.get('event_detail_id')
            EventDetail.objects.get(pk=event_detail_id)
            return data
        except EventDetail.DoesNotExist:
            raise serializers.ValidationError({"event_detail_id": "Invalid event detail ID"})
    
    def to_representation(self, instance):
        event_detail_id = instance.get('event_detail_id')
        event_detail = EventDetail.objects.get(pk=event_detail_id)
        
        # Get all options related to this specific event
        volunteer_types = VolunteerTypeSerializer(
            VolunteerType.objects.filter(event_detail=event_detail, is_active=True), 
            many=True
        ).data
        
        instruments = NewariInstrumentSerializer(
            NewariInstrument.objects.filter(event_detail=event_detail, is_active=True), 
            many=True
        ).data
        
        volunteer_laps = VolunteerLapSerializer(
            VolunteerLap.objects.filter(event_detail=event_detail, is_active=True), 
            many=True
        ).data
        
        rally_options = RallySerializer(
            BhintunaRally.objects.filter(event_detail=event_detail, is_active=True), 
            many=True
        ).data
        
        stall_types = StallTypeSerializer(
            StallType.objects.filter(event_detail=event_detail, is_active=True), 
            many=True
        ).data
        
        stall_locations = StallLocationSerializer(
            StallLocation.objects.filter(event_detail=event_detail, is_active=True), 
            many=True
        ).data
        
        categories = CategorySerializer(
            Category.objects.filter(is_active=True), 
            many=True
        ).data
        
        return {
            "event_detail": EventDetailSerializer(event_detail).data,
            "categories": categories,
            "volunteer_types": volunteer_types,
            "instruments": instruments,
            "volunteer_laps": volunteer_laps,
            "rally_options": rally_options,
            "stall_types": stall_types,
            "stall_locations": stall_locations
        }

class EventRegistrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventRegistration
        fields = '__all__'
        read_only_fields = ('registration_id', 'registration_date', 'is_deleted', 'deleted_at')

class RegistrationDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = RegistrationDetail
        fields = '__all__'
        read_only_fields = ('detail_id',)