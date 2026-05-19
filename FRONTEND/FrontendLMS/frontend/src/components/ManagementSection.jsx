import { useState } from "react";

function ManagementSection({
  canManageCourses,
  activeRole,
  isAdmin,
  selectableTeacherCourses,
  users,
  managementOutput,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onCreateUser,
  onUpdateUser,
  onDeleteUserById,
}) {
  const [createCourseForm, setCreateCourseForm] = useState({
    title: "",
    description: "",
  });
  const [courseManageForm, setCourseManageForm] = useState({
    courseId: "",
    courseIdManual: "",
  });
  const [updateCourseForm, setUpdateCourseForm] = useState({
    courseId: "",
    title: "",
    description: "",
  });
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    role: "student",
  });
  const [userManageForm, setUserManageForm] = useState({
    userId: "",
  });
  const [updateUserForm, setUpdateUserForm] = useState({
    userId: "",
    username: "",
    email: "",
    role: "",
  });

  if (!canManageCourses) {
    return null;
  }

  async function handleCreateCourseClick() {
    const success = await onCreateCourse(createCourseForm);
    if (success) {
      setCreateCourseForm({ title: "", description: "" });
    }
  }

  async function handleDeleteCourseClick() {
    const courseId = isAdmin
      ? String(courseManageForm.courseIdManual || "").trim()
      : String(courseManageForm.courseId || "").trim();

    if (!window.confirm("Delete this course? This cannot be undone.")) {
      return;
    }

    const success = await onDeleteCourse(courseId);
    if (success) {
      setCourseManageForm({ courseId: "", courseIdManual: "" });
    }
  }

  async function handleUpdateCourseClick() {
    const success = await onUpdateCourse(updateCourseForm);
    if (success) {
      setUpdateCourseForm({ courseId: "", title: "", description: "" });
    }
  }

  async function handleCreateUserClick() {
    const success = await onCreateUser(createUserForm);
    if (success) {
      setCreateUserForm({ name: "", role: "student" });
    }
  }

  async function handleDeleteUserClick(userIdValue) {
    if (!String(userIdValue || "").trim()) {
      return onDeleteUserById(userIdValue);
    }

    if (!window.confirm(`Delete user #${userIdValue}? This cannot be undone.`)) {
      return false;
    }

    return onDeleteUserById(userIdValue);
  }

  async function handleDeleteUserFromFormClick() {
    const userId = String(userManageForm.userId || "").trim();
    const success = await handleDeleteUserClick(userId);
    if (success) {
      setUserManageForm({ userId: "" });
    }
  }

  async function handleUpdateUserClick() {
    const success = await onUpdateUser(updateUserForm);
    if (success) {
      setUpdateUserForm({ userId: "", username: "", email: "", role: "" });
    }
  }

  return (
    <section className="card management-card">
      <div className="courses-head">
        <div>
          <h2>Course &amp; User Management</h2>
        </div>
      </div>
      <p className="hint">
        {activeRole === "teacher"
          ? "Create, update, and delete your courses."
          : "Create, update, and delete courses and users."}
      </p>

      <section className="management-block">
        <h3>Create Course</h3>
        <form className="stack" onSubmit={(event) => event.preventDefault()}>
          <div className="management-grid">
            <label>
              Title
              <input
                name="title"
                type="text"
                placeholder="New course title"
                value={createCourseForm.title}
                onChange={(event) =>
                  setCreateCourseForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className="management-span-2">
              Description
              <textarea
                name="description"
                rows="4"
                placeholder="New course description"
                value={createCourseForm.description}
                onChange={(event) =>
                  setCreateCourseForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
              />
            </label>
          </div>
          <div className="small-actions">
            <button type="button" onClick={handleCreateCourseClick} className="btn primary">
              Create Course
            </button>
          </div>
        </form>
      </section>

      <section className="management-block">
        <h3>Update Course</h3>
        <p className="hint">Select a course and provide the fields you want to change.</p>

        <form className="stack" onSubmit={(event) => event.preventDefault()}>
          <div className="management-grid">
            <label>
              Course
              <select
                name="updateCourseId"
                value={updateCourseForm.courseId}
                onChange={(event) =>
                  setUpdateCourseForm((previous) => ({
                    ...previous,
                    courseId: event.target.value,
                  }))
                }
              >
                <option value="">Select a course</option>
                {selectableTeacherCourses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title || `Course ${course.id}`}
                  </option>
                ))}
              </select>
            </label>
            <label>
              New Title (optional)
              <input
                name="updateTitle"
                type="text"
                placeholder="Updated course title"
                value={updateCourseForm.title}
                onChange={(event) =>
                  setUpdateCourseForm((previous) => ({
                    ...previous,
                    title: event.target.value,
                  }))
                }
              />
            </label>
            <label className="management-span-2">
              New Description (optional)
              <textarea
                name="updateDescription"
                rows="4"
                placeholder="Updated course description"
                value={updateCourseForm.description}
                onChange={(event) =>
                  setUpdateCourseForm((previous) => ({
                    ...previous,
                    description: event.target.value,
                  }))
                }
              />
            </label>
          </div>

          <div className="small-actions">
            <button type="button" onClick={handleUpdateCourseClick} className="btn secondary">
              Update Course
            </button>
          </div>
        </form>
      </section>

      <section className="management-block">
        <h3>Delete Course</h3>
        <p className="hint">
          {isAdmin
            ? "Enter a course ID to delete."
            : "Select a course to delete."}
        </p>

        <form className="stack" onSubmit={(event) => event.preventDefault()}>
          <div className="management-grid">
            {!isAdmin && (
              <label>
                Course
                <select
                  name="courseId"
                  value={courseManageForm.courseId}
                  onChange={(event) =>
                    setCourseManageForm((previous) => ({
                      ...previous,
                      courseId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select a course</option>
                  {selectableTeacherCourses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title || `Course ${course.id}`}
                    </option>
                  ))}
                </select>
              </label>
            )}

            {isAdmin && (
              <label>
                Course ID
                <input
                  name="courseIdManual"
                  type="number"
                  min="1"
                  placeholder="Enter course ID"
                  value={courseManageForm.courseIdManual}
                  onChange={(event) =>
                    setCourseManageForm((previous) => ({
                      ...previous,
                      courseIdManual: event.target.value,
                    }))
                  }
                />
              </label>
            )}
          </div>

          <div className="small-actions">
            <button type="button" onClick={handleDeleteCourseClick} className="btn danger">
              Delete Course
            </button>
          </div>
        </form>
      </section>

      {isAdmin && (
        <section className="management-block">
          <h3>User Management</h3>
          <div className="management-split">
            <section className="management-panel">
              <h4>Available Users</h4>
              <p className="hint">Only admin can view and remove user accounts.</p>
              <div className="courses-list">
                {!users.length && <p className="course-meta">No users loaded.</p>}
                {users.map((item) => (
                  <article key={item.id} className="course-item">
                    <div className="course-item-head">
                      <div>
                        <div className="course-title">{item.username || `User ${item.id}`}</div>
                        <div className="course-meta">Role: {item.role || "-"}</div>
                      </div>
                      <div className="course-meta">User #{item.id || "-"}</div>
                    </div>
                    <div className="course-meta">Email: {item.email || "-"}</div>
                    <div className="course-actions">
                      <button
                        type="button"
                        className="btn danger"
                        onClick={() => handleDeleteUserClick(item.id)}
                      >
                        Delete User
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="management-panel">
              <h4>Create User</h4>
              <p className="hint">Add a new student, teacher, or admin account.</p>
              <form className="stack compact-stack" onSubmit={(event) => event.preventDefault()}>
                <div className="management-grid single-column-grid">
                  <label>
                    Name
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter name"
                      value={createUserForm.name}
                      onChange={(event) =>
                        setCreateUserForm((previous) => ({
                          ...previous,
                          name: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Role
                    <select
                      name="role"
                      value={createUserForm.role}
                      onChange={(event) =>
                        setCreateUserForm((previous) => ({
                          ...previous,
                          role: event.target.value,
                        }))
                      }
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>
                <div className="small-actions">
                  <button type="button" onClick={handleCreateUserClick} className="btn primary">
                    Create
                  </button>
                </div>
              </form>
            </section>

            <section className="management-panel">
              <h4>Delete User</h4>
              <p className="hint">Enter a user ID to remove the account.</p>
              <form className="stack compact-stack" onSubmit={(event) => event.preventDefault()}>
                <div className="management-grid single-column-grid">
                  <label>
                    User ID
                    <input
                      name="userId"
                      type="number"
                      min="1"
                      placeholder="Existing user ID"
                      value={userManageForm.userId}
                      onChange={(event) =>
                        setUserManageForm({ userId: event.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="small-actions">
                  <button type="button" onClick={handleDeleteUserFromFormClick} className="btn danger">
                    Delete
                  </button>
                </div>
              </form>
            </section>

            <section className="management-panel">
              <h4>Update User</h4>
              <p className="hint">Select a user and provide fields to update.</p>
              <form className="stack compact-stack" onSubmit={(event) => event.preventDefault()}>
                <div className="management-grid single-column-grid">
                  <label>
                    User
                    <select
                      name="updateUserId"
                      value={updateUserForm.userId}
                      onChange={(event) =>
                        setUpdateUserForm((previous) => ({
                          ...previous,
                          userId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select a user</option>
                      {users.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.username || `User ${item.id}`}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Username (optional)
                    <input
                      name="updateUsername"
                      type="text"
                      placeholder="Updated username"
                      value={updateUserForm.username}
                      onChange={(event) =>
                        setUpdateUserForm((previous) => ({
                          ...previous,
                          username: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Email (optional)
                    <input
                      name="updateEmail"
                      type="email"
                      placeholder="updated@email.com"
                      value={updateUserForm.email}
                      onChange={(event) =>
                        setUpdateUserForm((previous) => ({
                          ...previous,
                          email: event.target.value,
                        }))
                      }
                    />
                  </label>
                  <label>
                    Role (optional)
                    <select
                      name="updateRole"
                      value={updateUserForm.role}
                      onChange={(event) =>
                        setUpdateUserForm((previous) => ({
                          ...previous,
                          role: event.target.value,
                        }))
                      }
                    >
                      <option value="">Keep current role</option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                </div>
                <div className="small-actions">
                  <button type="button" onClick={handleUpdateUserClick} className="btn secondary">
                    Update User
                  </button>
                </div>
              </form>
            </section>
          </div>
        </section>
      )}

      <section className="management-block">
        <h3>Response</h3>
        <pre>{managementOutput}</pre>
      </section>
    </section>
  );
}

export default ManagementSection;
