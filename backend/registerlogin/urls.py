from django.urls import path
from .views import register_user, register_pandit, protected_view, get_user_profile, CustomTokenObtainPairView, create_admin, create_first_admin, manage_user, admin_dashboard, admin_create_user, admin_create_pandit, promote_to_vendor
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # User registration
    path('register/', register_user, name='register_user'),

    # Pandit registration
    path('register_pandit/', register_pandit, name='register_pandit'),

    # JWT Authentication (Login & Token Refresh)
    path('api/token/', CustomTokenObtainPairView.as_view(), name='custom_token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Protected route (for authenticated users only)
    path('protected/', protected_view, name='protected_view'),

    path('profile/',  get_user_profile, name='user-profile'),



    path('api/admin/create-first/', create_first_admin, name='create_first_admin'),
    path('api/admin/create/', create_admin, name='create_admin'),
    path('api/admin/users/<int:user_id>/', manage_user, name='manage_user'),
    path('api/admin/dashboard/', admin_dashboard, name='admin_dashboard'),


    path('api/admin/users/create/', admin_create_user, name='admin_create_user'),
    path('api/admin/pandits/create/', admin_create_pandit, name='admin_create_pandit'),
    path('api/admin/promote-to-vendor/', promote_to_vendor, name='promote_to_vendor'),
]
