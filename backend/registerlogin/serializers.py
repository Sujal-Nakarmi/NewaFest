from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User, Pandit, Vendor
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth.hashers import check_password
from django.contrib.auth import get_user_model




class UserSerializer(serializers.ModelSerializer):
    user_role = serializers.ChoiceField(choices=User.UserRole.choices, required=False)  # Optional role

    class Meta:
        model = User
        fields = '__all__'

    def create(self, validated_data):
        # Assign 'normal_user' if not provided
        validated_data['user_role'] = validated_data.get('user_role', User.UserRole.NORMAL_USER)  

        # Hash the password before saving
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)


class PanditSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Embed user fields inside Pandit serializer

    class Meta:
        model = Pandit
        fields = '__all__'

    def create(self, validated_data):
        # Extract user data
        user_data = validated_data.pop('user')
        user_data['user_role'] = User.UserRole.PANDIT  # Auto-set role to pandit
        # Hash the password before saving
        user_data['password'] = make_password(user_data['password'])
        user = User.objects.create(**user_data)

        # Create Pandit instance with linked user
        pandit = Pandit.objects.create(user=user, **validated_data)
        return pandit
    
class VendorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # Read-only for promotion API
    user_id = serializers.IntegerField(write_only=True)  # For accepting user ID
    
    class Meta:
        model = Vendor
        fields = ['vendor_id', 'user', 'user_id', 'company_name', 'business_description']
    
    def create(self, validated_data):
        user_id = validated_data.pop('user_id')
        try:
            user = User.objects.get(id=user_id, is_deleted=False)
            # Change user role to vendor
            user.user_role = User.UserRole.VENDOR
            user.save()
            
            # Create vendor instance
            vendor = Vendor.objects.create(user=user, **validated_data)
            return vendor
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        
    
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password

class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField()  # Change 'username' to 'email'
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        try:
            # Get the user directly from the database by email
            user = get_user_model().objects.get(email=attrs.get('email'))
            
            # Check password
            if not check_password(attrs.get('password'), user.password):
                raise serializers.ValidationError('Invalid credentials')

            refresh = self.get_token(user)
            return {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': user.email,
                'user_role': user.user_role,
            }
        except get_user_model().DoesNotExist:
            raise serializers.ValidationError('User not found')




class AdminUserCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'
    
    def create(self, validated_data):
        validated_data['user_role'] = User.UserRole.ADMIN
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    

