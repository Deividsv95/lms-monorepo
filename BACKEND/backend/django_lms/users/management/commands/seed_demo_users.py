"""
Django management command to seed demo users for testing.
"""
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed demo users with different roles for testing'

    def handle(self, *args, **options):
        demo_users = [
            {'username': 'admin_demo', 'password': 'Admin@123', 'email': 'admin@test.local', 'is_staff': True, 'is_superuser': True, 'role': User.ROLE_ADMIN},
            {'username': 'teacher_demo', 'password': 'Teacher@123', 'email': 'teacher@test.local', 'is_staff': False, 'is_superuser': False, 'role': User.ROLE_TEACHER},
            {'username': 'student_demo', 'password': 'Student@123', 'email': 'student@test.local', 'is_staff': False, 'is_superuser': False, 'role': User.ROLE_STUDENT},
        ]

        for user_data in demo_users:
            username = user_data.pop('username')
            password = user_data.pop('password')
            
            user, created = User.objects.get_or_create(
                username=username,
                defaults=user_data
            )
            
            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Created user: {username}')
                )
            else:
                # Update password and role if user already exists
                user.set_password(password)
                user.role = user_data.get('role', User.ROLE_STUDENT)
                user.save()
                self.stdout.write(
                    self.style.WARNING(f'Updated user: {username}')
                )
