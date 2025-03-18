from rest_framework import serializers
from .models import Event, EventDetail, Category, BhintunaRally, BhintunaRallyLap, VolunteerType, VolunteerLap, NewariInstrument, StallType, StallLocation


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

# serializers.py additions

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

from rest_framework import serializers
from .models import Category, EventDetail, BhintunaRally, BhintunaRallyLap, VolunteerType, NewariInstrument, VolunteerLap

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
                
                rally_option = BhintunaRally.objects.get(pk=data['rally_option'])
                
                # Check if enough seats are available for the request
                if rally_option.available_seats < seats_requested:
                    raise serializers.ValidationError({
                        "seats_requested": f"Not enough seats available. Only {rally_option.available_seats} remaining."
                    })
                
                selected_laps = data.get('rally_laps', [])
                if not selected_laps:
                    raise serializers.ValidationError({"rally_laps": "At least one lap must be selected"})
                
                # Validate lap IDs
                valid_laps = BhintunaRallyLap.objects.filter(
                    lap_id__in=selected_laps,
                    rally_option=rally_option
                ).count()
                
                if valid_laps != len(selected_laps):
                    raise serializers.ValidationError({"rally_laps": "Some selected laps are invalid"})
                    
            elif category.code == 'Volunteer':
                if not data.get('volunteer_type'):
                    raise serializers.ValidationError({"volunteer_type": "Volunteer type is required"})
                
                volunteer_type = VolunteerType.objects.get(pk=data['volunteer_type'])
                
                # For music volunteer type, check the instrument
                if volunteer_type.code == 'MUSIC':
                    if not data.get('newari_instrument'):
                        raise serializers.ValidationError({
                            "newari_instrument": "Instrument selection is required for music volunteers"
                        })
                    
                    instrument = NewariInstrument.objects.get(pk=data['newari_instrument'])
                    
                    # Check if enough instrument positions are available
                    if instrument.available_seats < seats_requested:
                        raise serializers.ValidationError({
                            "seats_requested": f"Not enough positions available for this instrument. Only {instrument.available_seats} remaining."
                        })
                
                # All volunteer types need to select laps
                selected_laps = data.get('volunteer_laps', [])
                if not selected_laps:
                    raise serializers.ValidationError({"volunteer_laps": "At least one lap must be selected"})
                
                # Validate lap IDs
                valid_laps = VolunteerLap.objects.filter(lap_id__in=selected_laps).count()
                if valid_laps != len(selected_laps):
                    raise serializers.ValidationError({"volunteer_laps": "Some selected volunteer laps are invalid"})
                    
            elif category.code == 'STALL':
                if not data.get('stall_type'):
                    raise serializers.ValidationError({"stall_type": "Stall type is required"})
                
                stall_type = StallType.objects.get(pk=data['stall_type'])
                
                # Check if enough seats are available for the request
                if stall_type.available_seats < seats_requested:
                    raise serializers.ValidationError({
                        "seats_requested": f"Not enough stall spaces available. Only {stall_type.available_seats} remaining."
                    })
                
                # Add validation for stall location - now properly indented within the STALL condition
                if not data.get('stall_location'):
                    raise serializers.ValidationError({"stall_location": "Stall location is required"})
                
                try:
                    stall_location = StallLocation.objects.get(pk=data['stall_location'])
                    
                    # Check if enough seats are available at this location
                    if stall_location.available_seats < seats_requested:
                        raise serializers.ValidationError({
                            "stall_location": f"Not enough spaces available at this location. Only {stall_location.available_seats} remaining."
                        })
                except StallLocation.DoesNotExist:
                    raise serializers.ValidationError({"stall_location": "Invalid stall location ID"})
                
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
        except BhintunaRally.DoesNotExist:
            raise serializers.ValidationError({"rally_option": "Invalid rally option ID"})
        except VolunteerType.DoesNotExist:
            raise serializers.ValidationError({"volunteer_type": "Invalid volunteer type ID"})
        except NewariInstrument.DoesNotExist:
            raise serializers.ValidationError({"newari_instrument": "Invalid instrument ID"})
        except StallType.DoesNotExist:
            raise serializers.ValidationError({"stall_type": "Invalid stall type ID"})
        except Exception as e:
            raise serializers.ValidationError({"non_field_errors": str(e)})


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'  # You can specify the fields you want to expose, or use '__all__' to expose all.


class RallySerializer(serializers.ModelSerializer):
    class Meta:
        model = BhintunaRally
        fields = '__all__'  # You can specify the fields you want to expose, or use '__all__' to expose all.


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