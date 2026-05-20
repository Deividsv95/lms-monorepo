from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken


User = get_user_model()


class BriefRequirementApiSmokeTests(APITestCase):
    def _auth_as_student(self):
        student = User.objects.create_user(
            username="smoke_student",
            password="pass12345",
            role="student",
        )
        refresh = RefreshToken.for_user(student)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}"
        )

    def test_get_courses_endpoint_returns_200_for_authenticated_student(self):
        self._auth_as_student()

        response = self.client.get("/api/courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_unauthenticated_user_is_blocked_from_courses_endpoint(self):
        response = self.client.get("/api/courses/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
