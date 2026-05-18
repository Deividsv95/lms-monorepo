function SessionStatusCard({
  user,
  roleLabel,
  sessionCourses,
  isStudent,
  onRefresh,
  onLoadEnrollments,
}) {
  return (
    <section className="card profile-card">
      <div className="section-head">
        <div>
          <h2>Session Status</h2>
        </div>
        <div className="small-actions no-margin">
          <button type="button" onClick={onRefresh} className="btn line">Refresh</button>
          {isStudent && (
            <button type="button" onClick={onLoadEnrollments} className="btn line">Enrollments</button>
          )}
        </div>
      </div>

      {!user && <div className="profile-summary">Not logged in</div>}
      {user && (
        <div className="profile-summary">
          <div className="summary-grid" aria-label="Session details">
            <article className="summary-item">
              <span className="summary-label">ID</span>
              <span className="summary-value">{user.id}</span>
            </article>
            <article className="summary-item">
              <span className="summary-label">Role</span>
              <span className="summary-value">{roleLabel}</span>
            </article>
            <article className="summary-item">
              <span className="summary-label">Name</span>
              <span className="summary-value">{user.name}</span>
            </article>
          </div>
          <div className="summary-courses">
            <strong>Courses:</strong>{" "}
            {sessionCourses.length ? sessionCourses.join(", ") : "No courses loaded yet"}
          </div>
        </div>
      )}
    </section>
  );
}

export default SessionStatusCard;
