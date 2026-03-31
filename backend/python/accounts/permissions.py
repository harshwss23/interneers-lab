from rest_framework import permissions

class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'ADMIN')

class IsWarehouseManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'WAREHOUSE_MANAGER')

class IsAdminOrWarehouseManager(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in ['ADMIN', 'WAREHOUSE_MANAGER'])
