from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from courses.models import Course, Enrollment

from .permissions import IsAdminRole, IsStudent, IsTeacher
from .serializers import CourseSerializer


class StudentCourseListView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        courses = Course.objects.all().order_by("id")
        return Response(CourseSerializer(courses, many=True).data)


class StudentEnrollView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)

        _, created = Enrollment.objects.get_or_create(student=request.user, course=course)
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
        return Response(CourseSerializer(courses, many=True).data)


class TeacherCourseView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        courses = Course.objects.all().order_by("id")
        return Response(CourseSerializer(courses, many=True).data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TeacherCourseDetailView(APIView):
    permission_classes = [IsTeacher]

    def put(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, created_by=request.user)
        serializer = CourseSerializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, created_by=request.user)
        serializer = CourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, course_id):
        course = get_object_or_404(Course, id=course_id, created_by=request.user)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminCourseView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        courses = Course.objects.all().order_by("id")
        return Response(CourseSerializer(courses, many=True).data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AdminCourseDetailView(APIView):
    permission_classes = [IsAdminRole]

    def put(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        serializer = CourseSerializer(course, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def patch(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        serializer = CourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, course_id):
        course = get_object_or_404(Course, id=course_id)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
