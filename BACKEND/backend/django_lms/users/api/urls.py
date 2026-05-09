from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import LoginView, LogoutView, RegisterView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("register", RegisterView.as_view(), name="register-no-slash"),
    path("login/", LoginView.as_view(), name="login"),
    path("login", LoginView.as_view(), name="login-no-slash"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("logout", LogoutView.as_view(), name="logout-no-slash"),
    # Issues a new access token given a valid refresh token.
    path("token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("token/refresh", TokenRefreshView.as_view(), name="token-refresh-no-slash"),
]
