import LoginForm from "./LoginForm";
import styles from "./AuthHeroCard.module.css";

function Dashboard({
  user,
  roleLabel,
  coursesCount,
  enrollmentCount,
  enrolledCourses = [],
  sessionCourses,
  onSessionStart,
  onLogout,
  onRefresh,
  authError,
  authMessage,
  isStudent,
}) {
  if (!user) {
    return (
      <section className={`${styles.heroCard} card auth-card`}>
        <div className={styles.heroCopy}>
          <h2 className={styles.title}>Role-Based Learning Management</h2>
          <p className={styles.heroText}>
            Switch between student, teacher, and admin modes to access role-specific
            tools and course management.
          </p>

          <div className={styles.heroStats} aria-label="Dashboard stats">
            <article className={styles.statTile}>
              <span className={styles.statLabel}>Session</span>
              <strong className={styles.statValue}>{roleLabel}</strong>
            </article>
            <article className={styles.statTile}>
              <span className={styles.statLabel}>Visible courses</span>
              <strong className={styles.statValue}>{coursesCount}</strong>
            </article>
            <article className={styles.statTile}>
              <span className={styles.statLabel}>Student enrollments</span>
              <strong className={styles.statValue}>{enrollmentCount}</strong>
            </article>
          </div>
        </div>

        <div className={styles.sessionCardPanel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Sign In</h2>
            <span className={styles.roleChip}>No role</span>
          </div>
          <LoginForm
            onSubmit={onSessionStart}
            authError={authError}
            authMessage={authMessage}
          />
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={`${styles.heroCard} card session-card`}>
        <div className={styles.heroCopy}>
          <h2 className={styles.title}>Welcome, {user.username}!</h2>
          <p className={styles.heroText}>
            You are logged in as <strong>{roleLabel}</strong>
          </p>

          <div className={styles.heroStats} aria-label="Session stats">
            <article className={styles.statTile}>
              <span className={styles.statLabel}>Active Role</span>
              <strong className={styles.statValue}>{roleLabel}</strong>
            </article>
            <article className={styles.statTile}>
              <span className={styles.statLabel}>Visible Courses</span>
              <strong className={styles.statValue}>{coursesCount}</strong>
            </article>
            <article className={styles.statTile}>
              <span className={styles.statLabel}>Your Enrollments</span>
              <strong className={styles.statValue}>{enrollmentCount}</strong>
            </article>
          </div>
        </div>

        <div className={styles.sessionCardPanel}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Session Info</h2>
            <span className={styles.roleChip}>{roleLabel}</span>
          </div>
          <div className={styles.sessionInfo}>
            <p>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>Visible Courses:</strong> {sessionCourses.join(", ") || "None"}
            </p>
            {isStudent && (
              <button type="button" onClick={onRefresh} className="btn secondary">
                Refresh Enrollments
              </button>
            )}
            <button type="button" onClick={onLogout} className="btn danger">
              End Session
            </button>
          </div>
        </div>
      </section>

      {isStudent && (
        <section className="card courses-card">
          <div className="courses-head">
            <div>
              <h2>Your Enrollments</h2>
            </div>
            <button type="button" onClick={onRefresh} className="btn line">
              Refresh
            </button>
          </div>

          <div className="courses-list">
            {enrolledCourses.length === 0 ? (
              <p className="course-meta">You haven&apos;t enrolled in any courses yet!</p>
            ) : (
              enrolledCourses.map((course) => (
                <article key={course.id} className="course-item">
                  <div className="course-item-head">
                    <div>
                      <div className="course-title">{course.title || "Untitled"}</div>
                      <div className="course-meta">{course.description || ""}</div>
                    </div>
                    <div className="course-meta">Course #{course.id || "-"}</div>
                  </div>
                  <div className="course-meta">
                    Teacher: {course.created_by_username || course.createdBy || "-"}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </>
  );
}

export default Dashboard;
