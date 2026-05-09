from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course, Enrollment
from .permissions import IsAdminRole, IsStudent, IsTeacher
from .serializers import CourseSerializer


def _get_course_or_none(**filters):
    return Course.objects.filter(**filters).first()


def _paginated_response(request, queryset, serializer_class):
    paginator = PageNumberPagination()
    page = paginator.paginate_queryset(queryset, request)
    serializer = serializer_class(page, many=True)
    return paginator.get_paginated_response(serializer.data)


class StudentCourseListView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        courses = Course.objects.all().order_by("id")
        return _paginated_response(request, courses, CourseSerializer)


class StudentEnrollView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, course_id):
        course = _get_course_or_none(id=course_id)
        if course is None:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
        if not created:
            return Response({"detail": "Already enrolled"}, status=status.HTTP_400_BAD_REQUEST)

        return Response(
            {
                "detail": "Enrollment successful",
                "course_id": course.id,
                "student_id": request.user.id,
            },
            status=status.HTTP_201_CREATED,
        )


class StudentEnrolledCoursesView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        courses = Course.objects.filter(enrollments__student=request.user).order_by("id")
        return _paginated_response(request, courses, CourseSerializer)


class TeacherCourseView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        courses = Course.objects.all().order_by("id")
        return _paginated_response(request, courses, CourseSerializer)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TeacherCourseDetailView(APIView):
    permission_classes = [IsTeacher]

    def put(self, request, course_id):
        course = _get_course_or_none(id=course_id, created_by=request.user)
        if course is None:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, course_id):
        course = _get_course_or_none(id=course_id, created_by=request.user)
        if course is None:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, course_id):
        course = _get_course_or_none(id=course_id, created_by=request.user)
        if course is None:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCourseView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        courses = Course.objects.all().order_by("id")
        return _paginated_response(request, courses, CourseSerializer)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminCourseDetailView(APIView):
    permission_classes = [IsAdminRole]

    def put(self, request, course_id):
        course = _get_course_or_none(id=course_id)
        if course is None:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, course_id):
        course = _get_course_or_none(id=course_id)
        if course is None:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = CourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, course_id):
        course = _get_course_or_none(id=course_id)
        if course is None:
            return Response({"detail": "Course not found"}, status=status.HTTP_404_NOT_FOUND)

        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
