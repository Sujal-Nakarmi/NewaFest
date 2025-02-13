from rest_framework import serializers
from .models import Event

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
