from rest_framework import permissions

class IsCoder(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated

class IsMaster(permissions.BasePermission):
    def has_permission(self, request, view):
        # Admin is also a Master
        return request.user.is_authenticated and (request.user.role == 'MASTER' or request.user.role == 'ADMIN')

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'ADMIN'