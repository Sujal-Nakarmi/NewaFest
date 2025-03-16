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
    
class IsAdminOrVendor(BasePermission):
    """
    Allows access to either admins or vendors.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.user_role in [User.UserRole.ADMIN, User.UserRole.VENDOR]