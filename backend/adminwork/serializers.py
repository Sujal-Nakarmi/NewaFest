from rest_framework import serializers
from .models import Event
from .models import Category

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



class RegistrationSerializer(serializers.Serializer):
    event_detail = serializers.IntegerField()
    category = serializers.IntegerField()
    music_instrument = serializers.CharField(required=False, allow_null=True)
    drinks = serializers.CharField(required=False, allow_null=True)

    def validate(self, data):
        category = Category.objects.get(pk=data['category'])
        
        if category.code == 'MUSIC' and not data.get('music_instrument'):
            raise serializers.ValidationError({
                "music_instrument": "Required for music volunteers"
            })
        elif category.code == 'STALL' and not data.get('drinks'):
            raise serializers.ValidationError({
                "drinks": "Required for stall registration"
            })
        return data