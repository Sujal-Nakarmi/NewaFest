from rest_framework.permissions import BasePermission
from registerlogin.models import User  # adjust import path as needed

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.user_role == User.UserRole.ADMIN
    
# In permissions.py
class IsVendor(BasePermission):
    """
    Allows access only to vendors.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.user_role == User.UserRole.VENDOR
        )