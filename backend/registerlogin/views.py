from rest_framework.decorators import api_view
from rest_framework import status
from rest_framework.response import Response
from .serializers import UserSerializer, PanditSerializer, VendorSerializer, ProfileUpdateSerializer, InquirySerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import RefreshToken

from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainSerializer
from rest_framework.permissions import AllowAny
from backend.permissions import IsAdmin  # adjust import path based on where you put the permissions.py




@api_view(['POST'])
@permission_classes([AllowAny]) 
def register_user(request):
    if request.method == 'POST':
        data = request.data

        # Check if required fields are present
        if not all(field in data for field in ['email', 'password', 'full_name', 'phone_number', 'address', 'country']):
            return Response({"detail": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'email': user.email,
                'full_name': user.full_name,  # Include full_name here
                'user_role': user.user_role,
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([AllowAny])
def register_pandit(request):
    if request.method == 'POST':
        serializer = PanditSerializer(data=request.data)

        if serializer.is_valid():
            pandit = serializer.save()
            return Response({"message": "Pandit registered successfully"}, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    


@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Only authenticated users can access this view
def protected_view(request):
    return Response({"message": "This is a protected view!"})


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request):

    print("Request received in get_user_profile view")
    # The user is automatically populated from the JWT token
    user = request.user

    if not user.is_authenticated:
        return Response(
            {"detail": "Authentication failed", "code": "authentication_failed"},
            status=status.HTTP_401_UNAUTHORIZED
        )

    return Response({
        "id": user.id,
        "full_name": user.full_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "address": user.address,
        "country": user.country,
        "user_role": user.user_role
    }, status=status.HTTP_200_OK)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_user_profile(request):
    """Update the authenticated user's profile"""
    user = request.user
    
    if not user.is_authenticated:
        return Response(
            {"detail": "Authentication failed", "code": "authentication_failed"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    serializer = ProfileUpdateSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Change the authenticated user's password"""
    user = request.user
    
    if not user.is_authenticated:
        return Response(
            {"detail": "Authentication failed", "code": "authentication_failed"},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    
    if not old_password or not new_password:
        return Response(
            {"detail": "Both old and new passwords are required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user.check_password(old_password):
        return Response(
            {"detail": "Incorrect old password"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user.set_password(new_password)
    user.save()
    
    return Response({"detail": "Password updated successfully"}, status=status.HTTP_200_OK)



from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from .serializers import AdminUserCreateSerializer
from .models import User
from rest_framework.permissions import BasePermission




@api_view(['POST'])
@permission_classes([AllowAny])  # Only for first admin creation
def create_first_admin(request):
    # Check if any admin exists
    if User.objects.filter(user_role=User.UserRole.ADMIN).exists():
        return Response(
            {"detail": "Admin already exists. Use admin login to create more admins."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = AdminUserCreateSerializer(data=request.data)
    if serializer.is_valid():
        admin = serializer.save()
        refresh = RefreshToken.for_user(admin)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'email': admin.email,
            'user_role': admin.user_role
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAdmin])
def create_admin(request):
    serializer = AdminUserCreateSerializer(data=request.data)
    if serializer.is_valid():
        admin = serializer.save()
        return Response({
            'message': 'Admin created successfully',
            'email': admin.email
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_create_user(request):
    if request.method == 'POST':
        data = request.data
        
        # Check if required fields are present
        if not all(field in data for field in ['email', 'password', 'full_name', 'phone_number', 'address', 'country']):
            return Response({"detail": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = UserSerializer(data=data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User created successfully',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAdmin])
def admin_create_pandit(request):
    if request.method == 'POST':
        serializer = PanditSerializer(data=request.data)

        if serializer.is_valid():
            pandit = serializer.save()
            return Response({
                'message': 'Pandit created successfully',
                'pandit': PanditSerializer(pandit).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAdmin])
def manage_user(request, user_id):
    try:
        user = User.objects.get(id=user_id, is_deleted=False)
    except User.DoesNotExist:
        return Response(
            {"detail": "User not found or has been deleted"}, 
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        user.soft_delete()  # Use soft delete instead of actual deletion
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_dashboard(request):
    # Get query parameters for filtering
    role = request.query_params.get('role', None)
    search = request.query_params.get('search', None)
    
    # Get active users
    users = User.objects.filter(is_deleted=False)
    
    # Apply filters if provided
    if role:
        users = users.filter(user_role=role)
    
    if search:
        users = users.filter(
            Q(email__icontains=search) |
            Q(full_name__icontains=search) |
            Q(phone_number__icontains=search)
        )
    
    # Get counts
    total_users = User.objects.filter(is_deleted=False).count()
    total_pandits = User.objects.filter(
        is_deleted=False,
        user_role=User.UserRole.PANDIT
    ).count()
    total_normal_users = User.objects.filter(
        is_deleted=False,
        user_role=User.UserRole.NORMAL_USER
    ).count()
    total_vendors = User.objects.filter(
        is_deleted=False,
        user_role=User.UserRole.VENDOR
    ).count()
    
    # Serialize the filtered users
    serializer = UserSerializer(users, many=True)
    
    # Return both counts and user list
    return Response({
        'stats': {
            'total_users': total_users,
            'total_pandits': total_pandits,
            'total_normal_users': total_normal_users,
            'total_vendors': total_vendors
        },
        'users': serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAdmin])
def promote_to_vendor(request):
    """
    API endpoint for an admin to promote a user to vendor role.
    Requires admin permissions.
    """
    if request.method == 'POST':
        serializer = VendorSerializer(data=request.data)
        if serializer.is_valid():
            vendor = serializer.save()
            return Response({
                'message': 'User promoted to vendor successfully',
                'vendor': VendorSerializer(vendor).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

@api_view(['POST'])
@permission_classes([AllowAny])
def submit_inquiry(request):
    if request.method == 'POST':
        data = request.data
        
        # Check if required fields are present
        if not all(field in data for field in ['name', 'email', 'message']):
            return Response({"detail": "Missing required fields"}, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = InquirySerializer(data=data)
        if serializer.is_valid():
            inquiry = serializer.save()
            return Response({
                'status': 'success',
                'message': 'Your inquiry has been submitted successfully',
                'inquiry_id': inquiry.id
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)