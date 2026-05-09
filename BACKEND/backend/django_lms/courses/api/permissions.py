from rest_framework.permissions import BasePermission


class RolePermission(BasePermission):
    required_role = None

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == self.required_role
        )


class IsStudent(RolePermission):
    required_role = "student"


class IsTeacher(RolePermission):
    required_role = "teacher"


class IsAdminRole(RolePermission):
    required_role = "admin"
