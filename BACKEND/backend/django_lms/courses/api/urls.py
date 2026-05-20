from django.urls import path
from users.api.views import AdminUserDetailView, AdminUserView

from .views import (
    AdminCourseDetailView,
    AdminCourseView,
    StudentCourseListView,
    StudentEnrolledCoursesView,
    StudentEnrollView,
    TeacherCourseDetailView,
    TeacherCourseView,
)

urlpatterns = [
    path("courses/", StudentCourseListView.as_view(), name="courses"),
    path("student/courses/", StudentCourseListView.as_view(), name="student-courses"),
    path("student/enroll/<int:course_id>/", StudentEnrollView.as_view(), name="student-enroll"),
    path("student/enrolled-courses/", StudentEnrolledCoursesView.as_view(), name="student-enrolled-courses"),
    path("teacher/courses/", TeacherCourseView.as_view(), name="teacher-courses"),
    path("teacher/courses/<int:course_id>/", TeacherCourseDetailView.as_view(), name="teacher-course-detail"),
    path("admin/courses/", AdminCourseView.as_view(), name="admin-courses"),
    path("admin/courses/<int:course_id>/", AdminCourseDetailView.as_view(), name="admin-course-detail"),
    path("admin/users/", AdminUserView.as_view(), name="admin-users"),
    path("admin/users/<int:user_id>/", AdminUserDetailView.as_view(), name="admin-user-detail"),
]
