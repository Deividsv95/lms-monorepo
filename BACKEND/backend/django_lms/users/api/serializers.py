from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()

VALID_ROLES = [User.ROLE_STUDENT, User.ROLE_TEACHER, User.ROLE_ADMIN]


class RoleValidationMixin:
    def validate_role(self, value):
        if value not in VALID_ROLES:
            raise serializers.ValidationError("Invalid role")
        return value


class RegisterSerializer(RoleValidationMixin, serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserUpdateSerializer(RoleValidationMixin, serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "role"]
        extra_kwargs = {
            "username": {"required": False},
            "email": {"required": False},
            "role": {"required": False},
        }


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "role"]
