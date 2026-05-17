const STORAGE_KEY = "lms_user";

const isLocalLike =
  window.location.protocol === "file:" ||
  ["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname);

const API_BASE =
  (typeof window !== "undefined" && window.API_BASE) ||
  (isLocalLike ? "http://127.0.0.1:8000" : window.location.origin);

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

const USER_PROFILES = {
  1: { id: 1, role: "admin", name: "Admin", username: "admin_demo", password: "Admin@123" },
  2: { id: 2, role: "teacher", name: "Teacher", username: "teacher_demo", password: "Teacher@123" },
  3: { id: 3, role: "student", name: "Student", username: "student_demo", password: "Student@123" },
};

const els = {
  authMessage: document.getElementById("authMessage"),
  courseCountValue: document.getElementById("courseCountValue"),
  courseCreateBtn: document.getElementById("courseCreateBtn"),
  courseCreateForm: document.getElementById("courseCreateForm"),
  courseDeleteBtn: document.getElementById("courseDeleteBtn"),
  courseIdWrap: document.getElementById("courseIdWrap"),
  courseManageForm: document.getElementById("courseManageForm"),
  courseManageHint: document.getElementById("courseManageHint"),
  courseSelectWrap: document.getElementById("courseSelectWrap"),
  coursesList: document.getElementById("coursesList"),
  enrollmentCountValue: document.getElementById("enrollmentCountValue"),
  enrollmentsOutput: document.getElementById("enrollmentsOutput"),
  loadCoursesBtn: document.getElementById("loadCoursesBtn"),
  loadEnrollmentsBtn: document.getElementById("loadEnrollmentsBtn"),
  loadProfileBtn: document.getElementById("loadProfileBtn"),
  loginForm: document.getElementById("loginForm"),
  logoutBtn: document.getElementById("logoutBtn"),
  managementHint: document.getElementById("managementHint"),
  managementOutput: document.getElementById("managementOutput"),
  managementSection: document.getElementById("managementSection"),
  profileOutput: document.getElementById("profileOutput"),
  roleAccent: document.getElementById("roleAccent"),
  roleSummary: document.getElementById("roleSummary"),
  roleSummaryTitle: document.getElementById("roleSummaryTitle"),
  sessionRoleValue: document.getElementById("sessionRoleValue"),
  sessionState: document.getElementById("sessionState"),
  userCreateBtn: document.getElementById("userCreateBtn"),
  userCreateForm: document.getElementById("userCreateForm"),
  userDeleteBtn: document.getElementById("userDeleteBtn"),
  userManageForm: document.getElementById("userManageForm"),
  userManageSection: document.getElementById("userManageSection"),
  usersList: document.getElementById("usersList"),
};

const state = {
  courses: [],
  users: [],
  user: loadStoredUser(),
  ws: null, // WebSocket connection for real-time updates
};

function loadStoredUser() {
  try {
    const rawUser = localStorage.getItem(STORAGE_KEY);
    return rawUser ? JSON.parse(rawUser) : null;
  } catch {
    return null;
  }
}

function apiBase() {
  return String(API_BASE || "http://127.0.0.1:8000").trim().replace(/\/+$/, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatApiError(data) {
  if (typeof data === "string") {
    const trimmed = data.trim();

    if (!trimmed) {
      return "Request failed";
    }

    if (/<\/?[a-z][\s\S]*>/i.test(trimmed)) {
      const cannotGetMatch = trimmed.match(/Cannot GET\s+([^<\s]+)/i);
      if (cannotGetMatch) {
        return `API route not found: ${cannotGetMatch[1]}`;
      }
      return "Server returned an unexpected HTML error page.";
    }

    return trimmed;
  }

  if (data && typeof data === "object") {
    return data.message || data.detail || JSON.stringify(data, null, 2);
  }

  return "Request failed";
}

function formatOutput(data) {
  return typeof data === "string" ? data : JSON.stringify(data, null, 2);
}

function setMessage(text, isError = false) {
  els.authMessage.textContent = text;
  els.authMessage.className = isError ? "message error" : "message";
}

function setText(element, value) {
  element.textContent = value;
}

function setEnrollmentsOutput(value) {
  els.enrollmentsOutput.hidden = true;
  els.enrollmentsOutput.textContent = "";
}

function activeUser() {
  return state.user;
}

function activeRole() {
  const user = activeUser();
  return user ? user.role : null;
}

function hasRole(role) {
  return activeRole() === role;
}

function isAdmin() {
  return hasRole("admin");
}

function isStudent() {
  return hasRole("student");
}

function activeRoleConfig() {
  const role = activeRole();
  return role ? ROLE_CONFIG[role] : null;
}

function saveSession(user) {
  state.user = user;

  if (user) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

function resetForm(form, postReset) {
  form.reset();
  if (typeof postReset === "function") {
    postReset();
  }
}

function clearCreateCourseForm() {
  resetForm(els.courseCreateForm);
}

function clearCourseForm() {
  resetForm(els.courseManageForm, renderCourseOptions);
}

function clearUserForm() {
  resetForm(els.userManageForm);
}

function clearCreateUserForm() {
  resetForm(els.userCreateForm);
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

function updateDashboardMetrics() {
  const role = activeRole();
  const roleLabel = role ? ROLE_CONFIG[role].label : "Guest";
  const summary = roleSummaryContent(role);

  setText(els.sessionRoleValue, roleLabel);
  setText(els.courseCountValue, String(state.courses.length));
  setText(els.roleAccent, role ? roleLabel : "No role");
  setText(els.sessionState, roleLabel);
  setText(els.roleSummaryTitle, summary.title);
  setText(els.roleSummary, summary.body);
}

function clearSession() {
  disconnectWebSocket();
  saveSession(null);
  state.courses = [];
  state.users = [];
  clearCreateCourseForm();
  clearCourseForm();
  clearCreateUserForm();
  clearUserForm();
  setMessage("");
  setEnrollmentsOutput("");
  setText(els.enrollmentCountValue, "0");
  setText(els.managementOutput, "No actions yet.");
  renderSession();
  renderCourses();
}

async function request(path, options = {}, requiresAuth = true) {
  const headers = new Headers(options.headers || {});
  const user = activeUser();

  if (requiresAuth) {
    if (!user) {
      throw new Error("Start a session first.");
    }
    if (user.accessToken) {
      headers.set("Authorization", `Bearer ${user.accessToken}`);
    } else {
      headers.set("x-user-id", String(user.id));
    }
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const normalizedPath = path.endsWith("/") ? path : `${path}/`;

  const response = await fetch(`${apiBase()}${normalizedPath}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type") || "";

  // 204 No Content — no body to parse
  if (response.status === 204) {
    return null;
  }

  const data = contentType.includes("application/json")
    ? await response.json().catch(() => ({}))
    : await response.text();

  if (!response.ok) {
    throw new Error(formatApiError(data));
  }

  // Unwrap Django paginated responses: { count, results: [...] }
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    return data.results;
  }

  return data;
}

function requireValue(value, message) {
  if (!value) {
    throw new Error(message);
  }
}

function connectWebSocket() {
  const user = activeUser();
  
  if (!user || !user.accessToken) {
    console.log("WebSocket: No authenticated user");
    return;
  }

  // Convert HTTP/HTTPS to WS/WSS
  const wsProtocol = apiBase().startsWith("https") ? "wss" : "ws";
  const wsUrl = `${wsProtocol}://${window.location.host}/ws/courses/?token=${user.accessToken}`;
  
  try {
    state.ws = new WebSocket(wsUrl);
    
    state.ws.onopen = () => {
      console.log("WebSocket connected");
    };
    
    state.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Course update received:", data);
        
        if (data.type === "course_update") {
          handleCourseUpdate(data);
        }
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };
    
    state.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    
    state.ws.onclose = () => {
      console.log("WebSocket disconnected");
      state.ws = null;
    };
  } catch (error) {
    console.error("Failed to establish WebSocket:", error);
  }
}

function disconnectWebSocket() {
  if (state.ws) {
    state.ws.close();
    state.ws = null;
  }
}

function handleCourseUpdate(data) {
  const { event, course } = data;
  
  if (!course) return;
  
  switch (event) {
    case "course_created":
      // Add new course to list
      if (!state.courses.find(c => c.id === course.id)) {
        state.courses.push(course);
        console.log("Course added:", course.title);
      }
      break;
      
    case "course_updated":
      // Update existing course
      const existingIndex = state.courses.findIndex(c => c.id === course.id);
      if (existingIndex >= 0) {
        state.courses[existingIndex] = course;
        console.log("Course updated:", course.title);
      }
      break;
      
    case "course_deleted":
      // Remove course from list
      state.courses = state.courses.filter(c => c.id !== course.id);
      console.log("Course deleted:", course.title);
      break;
  }
  
  // Update UI
  renderSession();
  renderCourses();
}

function loadedCourseNames() {
  return state.courses.map((course) => course.title || "Untitled");
}

function sessionSummaryMarkup() {
  const user = activeUser();

  if (!user) {
    return '<p class="course-meta">Not logged in</p>';
  }

  const courses = loadedCourseNames();
  const courseText = courses.length
    ? courses.map((name) => escapeHtml(name)).join(", ")
    : "No courses loaded yet";

  return `
    <div class="summary-grid" aria-label="Session details">
      <article class="summary-item">
        <span class="summary-label">ID</span>
        <span class="summary-value">${escapeHtml(user.id)}</span>
      </article>
      <article class="summary-item">
        <span class="summary-label">Role</span>
        <span class="summary-value">${escapeHtml(ROLE_CONFIG[user.role]?.label ?? user.role)}</span>
      </article>
      <article class="summary-item">
        <span class="summary-label">Name</span>
        <span class="summary-value">${escapeHtml(user.name)}</span>
      </article>
    </div>
    <div class="summary-courses">
      <strong>Courses:</strong> ${courseText}
    </div>
  `;
}

function courseBody(payload) {
  return JSON.stringify({
    title: payload.title,
    description: payload.description,
  });
}

function toUsername(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 50);
}

function userBody(payload, includePassword = false) {
  // For updates, payload.username is read directly from the form.
  // For creates, payload.name is converted to a slug username.
  const username = payload.username || toUsername(payload.name || "");
  const body = {
    username,
    role: payload.role,
  };

  if (payload.email) {
    body.email = payload.email;
  }

  if (includePassword) {
    body.password = payload.password || `${username}_123`;
  }

  return JSON.stringify(body);
}

function renderManagement() {
  const role = activeRole();
  const canManageCourses = role === "teacher" || isAdmin();
  const showAdminControls = isAdmin();
  const courseSelect = els.courseManageForm.elements.courseId;
  const courseManualId = els.courseManageForm.elements.courseIdManual;

  els.managementSection.hidden = !canManageCourses;
  els.managementSection.style.display = canManageCourses ? "" : "none";
  els.userManageSection.hidden = !showAdminControls;
  els.userManageSection.style.display = showAdminControls ? "" : "none";
  els.courseSelectWrap.hidden = showAdminControls;
  els.courseSelectWrap.style.display = showAdminControls ? "none" : "";
  els.courseIdWrap.hidden = !showAdminControls;
  els.courseIdWrap.style.display = showAdminControls ? "" : "none";
  courseSelect.disabled = !canManageCourses || showAdminControls;
  courseManualId.disabled = !showAdminControls;

  if (!canManageCourses) {
    return;
  }

  if (role === "teacher") {
    els.managementHint.textContent = "Create and delete courses.";
    els.courseManageHint.textContent = "Select a course to delete.";
    return;
  }

  els.managementHint.textContent = "Create and delete courses and users.";
  els.courseManageHint.textContent = "Enter a course ID to delete.";
}

function renderSession() {
  const role = activeRole();

  els.profileOutput.innerHTML = sessionSummaryMarkup();
  els.logoutBtn.hidden = !activeUser();
  els.loadEnrollmentsBtn.hidden = !role || !isStudent();
  updateDashboardMetrics();
  renderManagement();
}

function renderCourseOptions() {
  const select = els.courseManageForm.elements.courseId;
  const currentValue = select.value;
  const selectableCourses = hasRole("teacher")
    ? state.courses.filter((course) => String(course.created_by) === String(activeUser()?.id))
    : state.courses;

  if (!selectableCourses.length) {
    select.innerHTML = `<option value="">Select a course</option>`;
    select.disabled = true;
    return;
  }

  select.innerHTML = [
    '<option value="">Select a course</option>',
    ...selectableCourses.map((course) => {
      const title = escapeHtml(course.title || "Untitled");
      const id = escapeHtml(course.id || "");
      return `<option value="${id}">${title}</option>`;
    }),
  ].join("");
  select.disabled = isAdmin();

  if (selectableCourses.some((course) => String(course.id) === currentValue)) {
    select.value = currentValue;
  }
}

function renderUsers() {
  if (!isAdmin()) {
    els.usersList.innerHTML = "";
    return;
  }

  if (!state.users.length) {
    els.usersList.innerHTML = `<p class="course-meta">No users loaded.</p>`;
    return;
  }

  els.usersList.innerHTML = state.users.map((user) => `
    <article class="course-item">
      <div class="course-item-head">
        <div>
          <div class="course-title">${escapeHtml(user.username || `User ${user.id}`)}</div>
          <div class="course-meta">Role: ${escapeHtml(user.role || "-")}</div>
        </div>
        <div class="course-meta">User #${escapeHtml(user.id || "-")}</div>
      </div>
      <div class="course-meta">Email: ${escapeHtml(user.email || "-")}</div>
      <div class="course-actions">
        <button class="btn danger" data-action="delete-user" data-id="${user.id}">Delete User</button>
      </div>
    </article>
  `).join("");
}

function renderCourses() {
  const role = activeRole();

  setText(els.courseCountValue, String(state.courses.length));

  if (!state.courses.length) {
    els.coursesList.innerHTML = `<p class="course-meta">No courses loaded.</p>`;
    renderCourseOptions();
    return;
  }

  const canEnroll = role === "student";

  els.coursesList.innerHTML = state.courses.map((course) => `
    <article class="course-item">
      <div class="course-item-head">
        <div>
          <div class="course-title">${escapeHtml(course.title || "Untitled")}</div>
          <div class="course-meta">${escapeHtml(course.description || "")}</div>
        </div>
        <div class="course-meta">Course #${escapeHtml(course.id || "-")}</div>
      </div>
      <div class="course-meta">Created by: ${escapeHtml(course.created_by_username || course.createdBy || "-")}</div>
      <div class="course-actions">
        ${canEnroll ? `<button class="btn line" data-action="enroll" data-id="${course.id}">Enroll</button>` : ""}
      </div>
    </article>
  `).join("");
  renderCourseOptions();
}

function currentCoursesPath() {
  const config = activeRoleConfig();
  return config ? config.listCoursesPath || null : null;
}

function courseManagementBasePath() {
  const config = activeRoleConfig();
  return config ? config.courseBasePath || null : null;
}

async function refreshSessionData() {
  renderSession();
  await loadCourses();
  await loadUsers();
  await loadEnrollments();
}

async function handleSessionStart(event) {
  event.preventDefault();

  const username = String(els.loginForm.elements.username.value || "").trim();
  const password = String(els.loginForm.elements.password.value || "");

  if (!username) {
    setMessage("Username is required.", true);
    return;
  }

  if (!password) {
    setMessage("Password is required.", true);
    return;
  }

  try {
    const data = await request(
      "/api/auth/login/",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
      false,
    );

    const loggedInUser = data?.user ?? null;
    const accessToken = data?.access ?? "";

    if (!loggedInUser || !accessToken) {
      throw new Error("Login response is missing required authentication data.");
    }

    const sessionUser = {
      accessToken,
      id: loggedInUser.id,
      name: loggedInUser.name || loggedInUser.username || `User ${loggedInUser.id}`,
      refreshToken: data?.refresh || "",
      role: loggedInUser.role,
      username: loggedInUser.username || username,
    };

    saveSession(sessionUser);
    setMessage("");
    await refreshSessionData();
    connectWebSocket();
    const roleLabel = ROLE_CONFIG[sessionUser.role] ? ROLE_CONFIG[sessionUser.role].label : "User";
    setMessage(`Session started as ${roleLabel} (${sessionUser.username}).`);
  } catch (error) {
    setMessage(error.message || "Could not start session", true);
  }
}

function syncProfileCredentials() {
  const profile = USER_PROFILES[Number(els.loginForm.elements.userId.value)];
  if (!profile) {
    return;
  }

  els.loginForm.elements.username.value = profile.username;
  els.loginForm.elements.password.value = ""; // Prevent autofill of password
}

async function loadCourses() {
  const role = activeRole();

  if (!role) {
    state.courses = [];
    renderSession();
    renderCourses();
    return;
  }

  const path = currentCoursesPath();
  if (!path) {
    state.courses = [];
    renderSession();
    els.coursesList.innerHTML = `<p class="course-meta">Courses are not available for this profile.</p>`;
    renderCourseOptions();
    return;
  }

  try {
    state.courses = await request(path);
    renderSession();
    renderCourses();
  } catch (error) {
    state.courses = [];
    renderSession();
    els.coursesList.innerHTML = `<p class="message error">Could not load courses right now.</p>`;
    renderCourseOptions();
  }
}

async function loadEnrollments() {
  const user = activeUser();

  if (!user) {
    setEnrollmentsOutput("");
    setText(els.enrollmentCountValue, "0");
    return;
  }

  if (!isStudent()) {
    setEnrollmentsOutput("");
    setText(els.enrollmentCountValue, "0");
    return;
  }

  try {
    const data = await request(ROLE_CONFIG.student.enrolledCoursesPath);
    setEnrollmentsOutput(formatOutput(data));
    setText(els.enrollmentCountValue, String(Array.isArray(data) ? data.length : 0));
  } catch (error) {
    setEnrollmentsOutput(error.message || "Request failed");
    setText(els.enrollmentCountValue, "0");
  }
}

async function enrollInCourse(courseId) {
  try {
    await request(`${ROLE_CONFIG.student.enrollBasePath}/${courseId}`, { method: "POST" });
    await Promise.all([loadCourses(), loadEnrollments()]);
    setMessage("Enrollment request sent.");
  } catch (error) {
    setMessage(error.message || "Enrollment failed", true);
  }
}

async function loadUsers() {
  if (!isAdmin()) {
    state.users = [];
    renderUsers();
    return;
  }

  try {
    state.users = await request(ROLE_CONFIG.admin.userBasePath);
    renderUsers();
  } catch (error) {
    state.users = [];
    els.usersList.innerHTML = `<p class="message error">Could not load users right now.</p>`;
  }
}

function getCourseFormData() {
  const formData = new FormData(els.courseManageForm);
  const selectedCourseId = String(formData.get("courseId") || "").trim();
  const manualCourseId = String(formData.get("courseIdManual") || "").trim();

  return {
    courseId: isAdmin() ? manualCourseId : selectedCourseId,
  };
}

function getCreateCourseFormData() {
  const formData = new FormData(els.courseCreateForm);
  return {
    description: String(formData.get("description") || "").trim(),
    title: String(formData.get("title") || "").trim(),
  };
}

function getUserFormData() {
  const formData = new FormData(els.userManageForm);
  return {
    userId: String(formData.get("userId") || "").trim(),
  };
}

function getCreateUserFormData() {
  const formData = new FormData(els.userCreateForm);
  return {
    name: String(formData.get("name") || "").trim(),
    role: String(formData.get("role") || "student").trim(),
  };
}

async function runCourseMutation(method) {
  const basePath = courseManagementBasePath();
  if (!basePath) {
    throw new Error("Current role cannot manage courses.");
  }

  const payload = getCourseFormData();
  const requestPath = `${basePath}/${payload.courseId}`;

  requireValue(payload.courseId, "Course ID is required for delete.");

  return request(requestPath, {
    body: undefined,
    method,
  });
}

async function handleCreateCourse() {
  const basePath = courseManagementBasePath();
  if (!basePath) {
    setMessage("Current role cannot manage courses.", true);
    return;
  }

  try {
    const payload = getCreateCourseFormData();
    console.log("Create course payload:", payload);
    
    requireValue(payload.title, "Course title is required.");
    requireValue(payload.description, "Course description is required.");

    console.log("Sending POST request to:", basePath);
    const data = await request(basePath, {
      method: "POST",
      body: courseBody(payload),
    });

    console.log("Course created response:", data);
    setText(els.managementOutput, formatOutput(data));
    clearCreateCourseForm();
    if (currentCoursesPath()) {
      await loadCourses();
    }
    setMessage("Course created successfully!");
  } catch (error) {
    console.error("Create course error:", error);
    setMessage(error.message || "Course action failed", true);
  }
}

async function runUserMutation(method) {
  if (!isAdmin()) {
    throw new Error("Only admin can manage users.");
  }

  const payload = getUserFormData();
  const requestPath = `${ROLE_CONFIG.admin.userBasePath}/${payload.userId}`;

  requireValue(payload.userId, "User ID is required for delete.");

  return request(requestPath, {
    body: undefined,
    method,
  });
}

async function handleCreateUser() {
  if (!isAdmin()) {
    setMessage("Only admin can manage users.", true);
    return;
  }

  try {
    const payload = getCreateUserFormData();
    requireValue(payload.name, "User name is required.");

    const username = toUsername(payload.name);
    requireValue(username, "Name must include letters or numbers.");

    const data = await request(ROLE_CONFIG.admin.userBasePath, {
      method: "POST",
      body: userBody({ ...payload, password: `${username}_123` }, true),
    });

    setText(els.managementOutput, formatOutput(data));
    clearCreateUserForm();
    await loadUsers();
    setMessage("User created.");
  } catch (error) {
    setMessage(error.message || "User action failed", true);
  }
}

async function handleCourseMutation(method, successMessage) {
  try {
    const data = await runCourseMutation(method);
    setText(els.managementOutput, data != null ? formatOutput(data) : successMessage);
    if (currentCoursesPath()) {
      await loadCourses();
    }
    setMessage(successMessage);
  } catch (error) {
    setMessage(error.message || "Course action failed", true);
  }
}

async function handleUserMutation(method, successMessage) {
  try {
    const data = await runUserMutation(method);
    setText(els.managementOutput, data != null ? formatOutput(data) : successMessage);
    clearUserForm();
    await loadUsers();
    setMessage(successMessage);
  } catch (error) {
    setMessage(error.message || "User action failed", true);
  }
}

async function handleCourseActions(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) {
    return;
  }

  if (button.dataset.action === "enroll" && isStudent()) {
    await enrollInCourse(button.dataset.id);
  }
}

async function handleUserActions(event) {
  const button = event.target.closest("button[data-action='delete-user']");
  if (!button || !isAdmin()) {
    return;
  }

  if (!confirm(`Delete user #${button.dataset.id}? This cannot be undone.`)) {
    return;
  }

  try {
    const data = await request(`${ROLE_CONFIG.admin.userBasePath}/${button.dataset.id}`, { method: "DELETE" });
    setText(els.managementOutput, data != null ? formatOutput(data) : "User deleted.");
    await loadUsers();
    setMessage("User deleted.");
  } catch (error) {
    setMessage(error.message || "User action failed", true);
  }
}

function bindDeleteAction(button, confirmMessage, onConfirm) {
  button.addEventListener("click", () => {
    if (!confirm(confirmMessage)) return;
    onConfirm();
  });
}

function wireEvents() {
  // Verify elements exist before wiring
  if (!els.courseCreateBtn) {
    console.error("courseCreateBtn element not found!");
  } else {
    console.log("wiring courseCreateBtn click handler");
    els.courseCreateBtn.addEventListener("click", handleCreateCourse);
  }
  
  bindDeleteAction(
    els.courseDeleteBtn,
    "Delete this course? This cannot be undone.",
    () => handleCourseMutation("DELETE", "Course deleted."),
  );
  els.coursesList.addEventListener("click", handleCourseActions);
  els.loadCoursesBtn.addEventListener("click", loadCourses);
  els.loadEnrollmentsBtn.addEventListener("click", loadEnrollments);
  els.loadProfileBtn.addEventListener("click", refreshSessionData);
  els.loginForm.addEventListener("submit", handleSessionStart);
  els.loginForm.elements.userId.addEventListener("change", syncProfileCredentials);
  els.logoutBtn.addEventListener("click", () => {
    clearSession();
    setMessage("Logged out.");
  });
  els.userCreateBtn.addEventListener("click", handleCreateUser);
  bindDeleteAction(
    els.userDeleteBtn,
    "Delete this user? This cannot be undone.",
    () => handleUserMutation("DELETE", "User deleted."),
  );
  els.usersList.addEventListener("click", handleUserActions);
}

(async function init() {
  wireEvents();
  syncProfileCredentials();
  renderSession();
  renderCourses();
  // Show/hide password toggle
  const passwordInput = document.getElementById("password");
  const togglePasswordBtn = document.getElementById("togglePassword");
  if (passwordInput && togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", function () {
      const isPassword = passwordInput.type === "password";
      passwordInput.type = isPassword ? "text" : "password";
      togglePasswordBtn.setAttribute("aria-label", isPassword ? "Hide password" : "Show password");
      togglePasswordBtn.textContent = isPassword ? "Hide" : "Show";
    });
  }
  await loadCourses();
  await loadUsers();
  await loadEnrollments();
})();