from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase


User = get_user_model()

REGISTER_URL = "/api/auth/register/"
LOGIN_URL = "/api/auth/login/"
LOGIN_URL_NO_SLASH = "/api/auth/login"


class AuthApiTests(APITestCase):
    def test_register_and_login(self):
        register_payload = {
            "username": "student_new",
            "email": "student@example.com",
            "password": "strongpass123",
            "role": "student",
        }
        register_response = self.client.post(REGISTER_URL, register_payload, format="json")
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", register_response.data)

        login_payload = {"username": "student_new", "password": "strongpass123"}
        login_response = self.client.post(LOGIN_URL, login_payload, format="json")
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data["user"]["role"], "student")

    def test_login_wrong_password_returns_401(self):
        User.objects.create_user(username="u1", password="correct123", role="student")
        response = self.client.post(LOGIN_URL, {"username": "u1", "password": "wrong"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_without_trailing_slash_returns_200(self):
        User.objects.create_user(username="u2", password="correct123", role="student")
        response = self.client.post(
            LOGIN_URL_NO_SLASH,
            {"username": "u2", "password": "correct123"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_login_nonexistent_user_returns_401(self):
        response = self.client.post(LOGIN_URL, {"username": "ghost", "password": "any"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields_returns_400(self):
        response = self.client.post(LOGIN_URL, {"username": "u1"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_username_returns_400(self):
        payload = {"username": "dup", "email": "a@a.com", "password": "pass12345", "role": "student"}
        self.client.post(REGISTER_URL, payload, format="json")
        response = self.client.post(REGISTER_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_invalid_role_returns_400(self):
        payload = {"username": "x", "email": "x@x.com", "password": "pass12345", "role": "superuser"}
        response = self.client.post(REGISTER_URL, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
