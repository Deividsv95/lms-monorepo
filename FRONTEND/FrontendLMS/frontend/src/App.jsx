import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { apiRequest, getApiBase } from "./lib/api";
import { clearSessionUser, loadSessionUser, saveSessionUser, signIn } from "./lib/auth";
import AuthHeroCard from "./components/AuthHeroCard";
import CoursesSection from "./components/CoursesSection";
import InsightCard from "./components/InsightCard";
import ManagementSection from "./components/ManagementSection";
import SessionStatusCard from "./components/SessionStatusCard";
import TopBar from "./components/TopBar";

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
        } catch {
          // Ignore malformed messages.
        }
      };

      wsRef.current = ws;
    } catch {
      // Ignore websocket setup issues.
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [user]);

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
    if (!enrollmentsOutput) {
      return 0;
    }

    try {
      const parsed = JSON.parse(enrollmentsOutput);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }, [enrollmentsOutput]);

  function resetSession() {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setUser(null);
    setCourses([]);
    setUsers([]);
    setEnrollmentsOutput("");
    setManagementOutput("No actions yet.");
    setAuthError(false);
    setAuthMessage("Logged out.");
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

  async function handleEnroll(courseId) {
    if (!isStudent) {
      return;
    }

    try {
      await apiRequest(`${ROLE_CONFIG.student.enrollBasePath}/${courseId}`, { method: "POST" }, { authToken: user?.accessToken });
      await Promise.all([loadCourses(), loadEnrollments()]);
      setAuthError(false);
      setAuthMessage("Enrollment request sent.");
    } catch (error) {
      setAuthError(true);
      setAuthMessage(error.message || "Enrollment failed.");
    }
  }

  return (
    <>
      <a href="#main" className="skip-link">Skip to main content</a>
      <div className="bg-grid" />
      <div className="bg-orb bg-orb-a" />
      <div className="bg-orb bg-orb-b" />

      <TopBar roleLabel={roleLabel} user={user} onLogout={resetSession} />

      <main className="layout" id="main">
        <Routes>
          <Route
            path="/"
            element={(
              <>
                <AuthHeroCard
                  roleLabel={roleLabel}
                  user={user}
                  coursesCount={courses.length}
                  enrollmentCount={enrollmentCount}
                  onSessionStart={handleSessionStart}
                  authError={authError}
                  authMessage={authMessage}
                />

                <SessionStatusCard
                  user={user}
                  roleLabel={roleLabel}
                  sessionCourses={sessionCourses}
                  isStudent={isStudent}
                  onRefresh={refreshSessionData}
                  onLoadEnrollments={loadEnrollments}
                />

                <InsightCard roleSummary={roleSummary} enrollmentsOutput={enrollmentsOutput} />
              </>
            )}
          />

          <Route
            path="/courses"
            element={(
              <CoursesSection
                courses={courses}
                isStudent={isStudent}
                onLoadCourses={loadCourses}
                onEnroll={handleEnroll}
              />
            )}
          />

          <Route
            path="/management"
            element={(
              canManageCourses ? (
                <ManagementSection
                  canManageCourses={canManageCourses}
                  activeRole={activeRole}
                  isAdmin={isAdmin}
                  selectableTeacherCourses={selectableTeacherCourses}
                  users={users}
                  managementOutput={managementOutput}
                  onCreateCourse={handleCreateCourse}
                  onDeleteCourse={handleDeleteCourse}
                  onCreateUser={handleCreateUser}
                  onDeleteUserById={handleDeleteUserById}
                />
              ) : (
                <section className="card management-card">
                  <h2>Management</h2>
                  <p className="course-meta">Sign in as teacher or admin to access management tools.</p>
                </section>
              )
            )}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
