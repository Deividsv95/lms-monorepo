from django.urls import re_path
from courses.consumers import CourseUpdateConsumer

websocket_urlpatterns = [
    re_path(r"ws/courses/$", CourseUpdateConsumer.as_asgi()),
]
