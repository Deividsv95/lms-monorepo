import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { apiRequest, getApiBase } from "./lib/api";
import { clearSessionUser, loadSessionUser, saveSessionUser, signIn } from "./lib/auth";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import CoursesSection from "./components/CoursesSection";
import ManagementSection from "./components/ManagementSection";
import Footer from "./components/Footer";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    listCoursesPath: "/api/admin/courses",
    courseBasePath: "/api/admin/courses",
    userBasePath: "/api/admin/users",
  },
  teacher: {
    label: "Teacher",
    listCoursesPath: "/api/teacher/courses",
    courseBasePath: "/api/teacher/courses",
  },
  student: {
    label: "Student",
    listCoursesPath: "/api/student/courses",
    enrolledCoursesPath: "/api/student/enrolled-courses",
    enrollBasePath: "/api/student/enroll",
  },
};

function formatOutput(data) {
  return typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function roleSummaryContent(role) {
  const summaries = {
    student: { title: "Student", body: "Browse and enroll in courses." },
    teacher: { title: "Teacher", body: "Create and delete courses." },
    admin: { title: "Admin", body: "Create and delete courses and users." },
  };

  return summaries[role] || {
    title: "Role Info",
    body: "Sign in to see role-specific features.",
  };
}

function toUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

function requireValue(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

function App() {
  const wsRef = useRef(null);
  const [user, setUser] = useState(loadSessionUser);
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollmentsOutput, setEnrollmentsOutput] = useState("");
  const [managementOutput, setManagementOutput] = useState("No actions yet.");
  const [authMessage, setAuthMessage] = useState("");
  const [authError, setAuthError] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [justEnrolledIds, setJustEnrolledIds] = useState(new Set());

  const activeRole = user?.role || null;
  const isAdmin = activeRole === "admin";
  const isStudent = activeRole === "student";
  const canManageCourses = activeRole === "teacher" || isAdmin;
  const activeRoleConfig = activeRole ? ROLE_CONFIG[activeRole] : null;

  const roleLabel = activeRole ? ROLE_CONFIG[activeRole]?.label || "User" : "Guest";
  const roleSummary = roleSummaryContent(activeRole);

  const loadCourses = useCallback(async () => {
    if (!activeRoleConfig?.listCoursesPath) {
      setCourses([]);
      return;
    }

    try {
      const data = await apiRequest(activeRoleConfig.listCoursesPath, {}, { authToken: user?.accessToken });
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
      setAuthError(true);
      setAuthMessage("Could not load courses right now.");
    }
  }, [activeRoleConfig, user?.accessToken]);

  const loadUsers = useCallback(async () => {
    if (!isAdmin) {
      setUsers([]);
      return;
    }

    try {
      const data = await apiRequest(ROLE_CONFIG.admin.userBasePath, {}, { authToken: user?.accessToken });
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
      setAuthError(true);
      setAuthMessage("Could not load users right now.");
    }
  }, [isAdmin, user?.accessToken]);

  const loadEnrollments = useCallback(async () => {
    if (!user || !isStudent) {
      setEnrollmentsOutput("");
      return;
    }

    try {
      const data = await apiRequest(ROLE_CONFIG.student.enrolledCoursesPath, {}, { authToken: user?.accessToken });
      setEnrollmentsOutput(formatOutput(data));
    } catch (error) {
      setEnrollmentsOutput(error.message || "Request failed");
    }
  }, [isStudent, user]);

  const refreshSessionData = useCallback(async () => {
    await Promise.all([loadCourses(), loadUsers(), loadEnrollments()]);
  }, [loadCourses, loadEnrollments, loadUsers]);

  useEffect(() => {
    if (!user) {
      setCourses([]);
      setUsers([]);
      setEnrollmentsOutput("");
      return;
    }

    refreshSessionData();
  }, [refreshSessionData, user]);

  useEffect(() => {
    if (user) {
      saveSessionUser(user);
    } else {
      clearSessionUser();
    }
  }, [user]);

  useEffect(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (!user?.accessToken) {
      return;
    }

    try {
      const parsedApiBase = new URL(getApiBase());
      const protocol = parsedApiBase.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${parsedApiBase.host}/ws/courses/?token=${user.accessToken}`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type !== "course_update" || !data.course) {
            return;
          }

          setCourses((previous) => {
            if (data.event === "course_created") {
              if (previous.some((course) => course.id === data.course.id)) {
                return previous;
              }
              return [...previous, data.course];
            }

            if (data.event === "course_updated") {
              return previous.map((course) =>
                course.id === data.course.id ? data.course : course,
              );
            }

            if (data.event === "course_deleted") {
              return previous.filter((course) => course.id !== data.course.id);
            }

            return previous;
          });

          if (isStudent && (data.event === "course_updated" || data.event === "course_deleted")) {
            loadEnrollments();
          }
        } catch {
          // bad ws payload, skip it
        }
      };

      wsRef.current = ws;
    } catch {
      // ws is optional here, so just keep going
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [isStudent, loadEnrollments, user]);

  const sessionCourses = useMemo(
    () => courses.map((course) => course.title || "Untitled"),
    [courses],
  );

  const selectableTeacherCourses = useMemo(() => {
    if (activeRole !== "teacher") {
      return courses;
    }

    return courses.filter((course) => String(course.created_by) === String(user?.id));
  }, [activeRole, courses, user?.id]);

  const enrollmentCount = useMemo(() => {
    if (!enrollmentsOutput) return 0;
    try {
      const parsed = JSON.parse(enrollmentsOutput);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }, [enrollmentsOutput]);

  const enrolledCourses = useMemo(() => {
    if (!isStudent || !enrollmentsOutput) return [];
    try {
      const parsed = JSON.parse(enrollmentsOutput);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [isStudent, enrollmentsOutput]);

  const enrolledCourseIds = useMemo(
    () => new Set(enrolledCourses.map((c) => c.id)),
    [enrolledCourses],
  );

  const navigate = useNavigate();

  function resetSession() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // wipe tokens and bounce back home
    clearSessionUser();

    setUser(null);
    setCourses([]);
    setUsers([]);
    setEnrollmentsOutput("");
    setManagementOutput("No actions yet.");
    setAuthError(false);
    setAuthMessage("Logged out.");
    setEnrollingCourseId(null);
    setJustEnrolledIds(new Set());
    navigate("/");
  }

  async function handleSessionStart(credentials) {
    try {
      const { sessionUser, roleLabel: sessionRoleLabel } = await signIn(credentials);
      setUser(sessionUser);
      setAuthError(false);
      setAuthMessage(`Session started as ${sessionRoleLabel} (${sessionUser.username}).`);
      return true;
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "Could not start session.");
      return false;
    }
  }

  async function handleCreateCourse(payload) {
    if (!activeRoleConfig?.courseBasePath) {
      setAuthError(true);
      setAuthMessage("Current role cannot manage courses.");
      return false;
    }

    try {
      requireValue(String(payload?.title || "").trim(), "Course title is required.");
      requireValue(String(payload?.description || "").trim(), "Course description is required.");

      const data = await apiRequest(activeRoleConfig.courseBasePath, {
        method: "POST",
        body: {
          title: String(payload.title || "").trim(),
          description: String(payload.description || "").trim(),
        },
      }, { authToken: user?.accessToken });

      setManagementOutput(formatOutput(data));
      await loadCourses();
      setAuthError(false);
      setAuthMessage("Course created successfully.");
      return true;
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "Course action failed.");
      return false;
    }
  }

  async function handleDeleteCourse(courseIdValue) {
    if (!activeRoleConfig?.courseBasePath) {
      setAuthError(true);
      setAuthMessage("Current role cannot manage courses.");
      return false;
    }

    try {
      const courseId = String(courseIdValue || "").trim();

      requireValue(courseId, "Course ID is required for delete.");

      const data = await apiRequest(`${activeRoleConfig.courseBasePath}/${courseId}`, {
        method: "DELETE",
      }, { authToken: user?.accessToken });

      setManagementOutput(data != null ? formatOutput(data) : "Course deleted.");
      await loadCourses();
      setAuthError(false);
      setAuthMessage("Course deleted.");
      return true;
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "Course action failed.");
      return false;
    }
  }

  async function handleUpdateCourse(payload) {
    if (!activeRoleConfig?.courseBasePath) {
      setAuthError(true);
      setAuthMessage("Current role cannot manage courses.");
      return false;
    }

    try {
      const courseId = String(payload?.courseId || "").trim();
      const title = String(payload?.title || "").trim();
      const description = String(payload?.description || "").trim();

      requireValue(courseId, "Course ID is required for update.");
      if (!title && !description) {
        throw new Error("Provide a title or description to update.");
      }

      const body = {};
      if (title) {
        body.title = title;
      }
      if (description) {
        body.description = description;
      }

      const data = await apiRequest(`${activeRoleConfig.courseBasePath}/${courseId}`, {
        method: "PATCH",
        body,
      }, { authToken: user?.accessToken });

      setManagementOutput(formatOutput(data));
      await loadCourses();
      setAuthError(false);
      setAuthMessage("Course updated.");
      return true;
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "Course action failed.");
      return false;
    }
  }

  async function handleCreateUser(payload) {
    if (!isAdmin) {
      setAuthError(true);
      setAuthMessage("Only admin can manage users.");
      return false;
    }

    try {
      requireValue(String(payload?.name || "").trim(), "User name is required.");
      const username = toUsername(payload.name);
      requireValue(username, "Name must include letters or numbers.");

      const data = await apiRequest(ROLE_CONFIG.admin.userBasePath, {
        method: "POST",
        body: {
          username,
          role: payload.role,
          password: `${username}_123`,
        },
      }, { authToken: user?.accessToken });

      setManagementOutput(formatOutput(data));
      await loadUsers();
      setAuthError(false);
      setAuthMessage("User created.");
      return true;
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "User action failed.");
      return false;
    }
  }

  async function handleDeleteUserById(userIdValue) {
    if (!isAdmin) {
      setAuthError(true);
      setAuthMessage("Only admin can manage users.");
      return false;
    }

    try {
      const userId = String(userIdValue || "").trim();
      requireValue(userId, "User ID is required for delete.");

      const data = await apiRequest(`${ROLE_CONFIG.admin.userBasePath}/${userId}`, {
        method: "DELETE",
      }, { authToken: user?.accessToken });

      setManagementOutput(data != null ? formatOutput(data) : "User deleted.");
      await loadUsers();
      setAuthError(false);
      setAuthMessage("User deleted.");
      return true;
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "User action failed.");
      return false;
    }
  }

  async function handleUpdateUser(payload) {
    if (!isAdmin) {
      setAuthError(true);
      setAuthMessage("Only admin can manage users.");
      return false;
    }

    try {
      const userId = String(payload?.userId || "").trim();
      const username = String(payload?.username || "").trim();
      const email = String(payload?.email || "").trim();
      const role = String(payload?.role || "").trim();

      requireValue(userId, "User ID is required for update.");
      if (!username && !email && !role) {
        throw new Error("Provide username, email, or role to update.");
      }

      const body = {};
      if (username) {
        body.username = username;
      }
      if (email) {
        body.email = email;
      }
      if (role) {
        body.role = role;
      }

      const data = await apiRequest(`${ROLE_CONFIG.admin.userBasePath}/${userId}`, {
        method: "PATCH",
        body,
      }, { authToken: user?.accessToken });

      setManagementOutput(formatOutput(data));
      await loadUsers();
      setAuthError(false);
      setAuthMessage("User updated.");
      return true;
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "User action failed.");
      return false;
    }
  }

  async function handleEnroll(courseId) {
    if (!isStudent) return;
    setEnrollingCourseId(courseId);
    try {
      await apiRequest(`${ROLE_CONFIG.student.enrollBasePath}/${courseId}`, { method: "POST" }, { authToken: user?.accessToken });
      await Promise.all([loadCourses(), loadEnrollments()]);
      setJustEnrolledIds((prev) => new Set([...prev, courseId]));
      setAuthError(false);
      setAuthMessage("Enrolled successfully.");
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "Enrollment failed.");
    } finally {
      setEnrollingCourseId(null);
    }
  }

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-a" />
      <div className="bg-orb bg-orb-b" />

      <Navbar roleLabel={roleLabel} user={user} onLogout={resetSession} />

      <main className="layout" id="main">
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard
                user={user}
                roleLabel={roleLabel}
                coursesCount={courses.length}
                enrollmentCount={enrollmentCount}
                enrolledCourses={enrolledCourses}
                sessionCourses={sessionCourses}
                onSessionStart={handleSessionStart}
                onLogout={resetSession}
                onRefresh={refreshSessionData}
                authError={authError}
                authMessage={authMessage}
                isStudent={isStudent}
              />
            }
          />

          <Route
            path="/courses"
            element={
              <CoursesSection
                courses={courses}
                isStudent={isStudent}
                onLoadCourses={loadCourses}
                onEnroll={handleEnroll}
                enrolledCourseIds={enrolledCourseIds}
                enrollingCourseId={enrollingCourseId}
                justEnrolledIds={justEnrolledIds}
                onViewEnrollments={() => navigate("/")}
              />
            }
          />

          <Route
            path="/management"
            element={
              canManageCourses ? (
                <ManagementSection
                  canManageCourses={canManageCourses}
                  activeRole={activeRole}
                  isAdmin={isAdmin}
                  selectableTeacherCourses={selectableTeacherCourses}
                  users={users}
                  managementOutput={managementOutput}
                  onCreateCourse={handleCreateCourse}
                  onUpdateCourse={handleUpdateCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onCreateUser={handleCreateUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUserById={handleDeleteUserById}
                />
              ) : (
                <section className="card management-card">
                  <h2>Management</h2>
                  <p className="course-meta">Sign in as teacher or admin to access management tools.</p>
                </section>
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
