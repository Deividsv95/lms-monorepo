from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Course


User = get_user_model()


class CourseApiTests(APITestCase):
    def setUp(self):
        self.student = User.objects.create_user(
            username="student1", password="pass12345", role="student"
        )
        self.teacher = User.objects.create_user(
            username="teacher1", password="pass12345", role="teacher"
        )
        self.admin = User.objects.create_user(
            username="admin1", password="pass12345", role="admin"
        )

    def _auth(self, user):
        refresh = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {str(refresh.access_token)}")

    # ── Happy-path tests ──────────────────────────────────────────────────────

    def test_teacher_can_create_course(self):
        self._auth(self.teacher)
        payload = {"title": "DRF Basics", "description": "Intro course"}
        response = self.client.post("/api/teacher/courses/", payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Course.objects.count(), 1)

    def test_teacher_can_view_admin_created_courses_in_list(self):
        Course.objects.create(
            title="Admin Course",
            description="Visible to teachers",
            created_by=self.admin,
        )
        self._auth(self.teacher)

        response = self.client.get("/api/teacher/courses/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Admin Course")

    def test_course_data_syncs_across_teacher_student_admin(self):
        # Teacher creates a course.
        self._auth(self.teacher)
        create_response = self.client.post(
            "/api/teacher/courses/",
            {"title": "Sync Course", "description": "Initial"},
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        course_id = create_response.data["id"]

        # Student can see the newly created course.
        self._auth(self.student)
        student_list = self.client.get("/api/student/courses/")
        self.assertEqual(student_list.status_code, status.HTTP_200_OK)
        self.assertTrue(any(c["id"] == course_id for c in student_list.data))

        # Admin can also see the same course.
        self._auth(self.admin)
        admin_list = self.client.get("/api/admin/courses/")
        self.assertEqual(admin_list.status_code, status.HTTP_200_OK)
        self.assertTrue(any(c["id"] == course_id for c in admin_list.data))

        # Teacher updates title; student and admin should see updated value.
        self._auth(self.teacher)
        update_response = self.client.patch(
            f"/api/teacher/courses/{course_id}/",
            {"title": "Sync Course Updated"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)

        self._auth(self.student)
        student_after_update = self.client.get("/api/student/courses/")
        self.assertEqual(student_after_update.status_code, status.HTTP_200_OK)
        updated_for_student = next(c for c in student_after_update.data if c["id"] == course_id)
        self.assertEqual(updated_for_student["title"], "Sync Course Updated")

        self._auth(self.admin)
        admin_after_update = self.client.get("/api/admin/courses/")
        self.assertEqual(admin_after_update.status_code, status.HTTP_200_OK)
        updated_for_admin = next(c for c in admin_after_update.data if c["id"] == course_id)
        self.assertEqual(updated_for_admin["title"], "Sync Course Updated")

        # Admin deletes the course; it should disappear for teacher and student.
        delete_response = self.client.delete(f"/api/admin/courses/{course_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

        self._auth(self.teacher)
        teacher_after_delete = self.client.get("/api/teacher/courses/")
        self.assertEqual(teacher_after_delete.status_code, status.HTTP_200_OK)
        self.assertFalse(any(c["id"] == course_id for c in teacher_after_delete.data))

        self._auth(self.student)
        student_after_delete = self.client.get("/api/student/courses/")
        self.assertEqual(student_after_delete.status_code, status.HTTP_200_OK)
        self.assertFalse(any(c["id"] == course_id for c in student_after_delete.data))

    def test_student_can_enroll_and_view_enrolled_courses(self):
        course = Course.objects.create(
            title="Python",
            description="Python for beginners",
            created_by=self.teacher,
        )
        self._auth(self.student)

        enroll_response = self.client.post(f"/api/student/enroll/{course.id}/", format="json")
        self.assertEqual(enroll_response.status_code, status.HTTP_201_CREATED)

        courses_response = self.client.get("/api/student/enrolled-courses/")
        self.assertEqual(courses_response.status_code, status.HTTP_200_OK)
        results = courses_response.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["title"], "Python")

    def test_admin_can_create_update_delete_user(self):
        self._auth(self.admin)

        create_payload = {
            "username": "student2",
            "password": "pass12345",
            "email": "student2@example.com",
            "role": "student",
        }
        create_response = self.client.post("/api/admin/users/", create_payload, format="json")
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        user_id = create_response.data["id"]

        update_payload = {"role": "teacher"}
        update_response = self.client.patch(f"/api/admin/users/{user_id}/", update_payload, format="json")
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["role"], "teacher")

        delete_response = self.client.delete(f"/api/admin/users/{user_id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_teacher_can_patch_own_course(self):
        self._auth(self.teacher)
        course = Course.objects.create(
            title="Old Title", description="Old desc", created_by=self.teacher
        )
        response = self.client.patch(
            f"/api/teacher/courses/{course.id}/",
            {"title": "New Title"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], "New Title")

    def test_teacher_delete_returns_204(self):
        self._auth(self.teacher)
        course = Course.objects.create(
            title="To Delete", description="bye", created_by=self.teacher
        )
        response = self.client.delete(f"/api/teacher/courses/{course.id}/")
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Course.objects.count(), 0)

    # ── Unauthenticated access (401) ──────────────────────────────────────────

    def test_unauthenticated_cannot_browse_courses(self):
        response = self.client.get("/api/student/courses/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_create_course(self):
        response = self.client.post(
            "/api/teacher/courses/", {"title": "X", "description": "Y"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # ── Cross-role access (403) ───────────────────────────────────────────────

    def test_student_cannot_create_course(self):
        self._auth(self.student)
        response = self.client.post(
            "/api/teacher/courses/", {"title": "X", "description": "Y"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_access_admin_endpoints(self):
        self._auth(self.teacher)
        response = self.client.get("/api/admin/courses/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_student_cannot_access_admin_endpoints(self):
        self._auth(self.student)
        response = self.client.get("/api/admin/users/")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_delete_another_teachers_course(self):
        other_teacher = User.objects.create_user(
            username="teacher2", password="pass12345", role="teacher"
        )
        course = Course.objects.create(
            title="Other Course", description="Not mine", created_by=other_teacher
        )
        self._auth(self.teacher)
        response = self.client.delete(f"/api/teacher/courses/{course.id}/")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Duplicate enrollment ──────────────────────────────────────────────────

    def test_student_cannot_enroll_twice(self):
        course = Course.objects.create(
            title="Python", description="For beginners", created_by=self.teacher
        )
        self._auth(self.student)
        self.client.post(f"/api/student/enroll/{course.id}/", format="json")
        response = self.client.post(f"/api/student/enroll/{course.id}/", format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_enroll_nonexistent_course_returns_404(self):
        self._auth(self.student)
        response = self.client.post("/api/student/enroll/99999/", format="json")
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    # ── Invalid payloads ─────────────────────────────────────────────────────

    def test_teacher_create_course_missing_title_returns_400(self):
        self._auth(self.teacher)
        response = self.client.post(
            "/api/teacher/courses/", {"description": "No title"}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_create_user_missing_fields_returns_400(self):
        self._auth(self.admin)
        response = self.client.post("/api/admin/users/", {"username": "incomplete"}, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

