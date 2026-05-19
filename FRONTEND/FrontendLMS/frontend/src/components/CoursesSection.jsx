function CoursesSection({ courses, isStudent, onLoadCourses, onEnroll, enrolledCourseIds = new Set(), enrollingCourseId = null, justEnrolledIds = new Set(), onViewEnrollments }) {
  return (
    <section className="card courses-card">
      <div className="courses-head">
        <div>
          <h2>Available Courses</h2>
        </div>
        <button type="button" onClick={onLoadCourses} className="btn line">Refresh</button>
      </div>

      <div className="courses-list">
        {!courses.length && <p className="course-meta">No courses loaded.</p>}
        {courses.map((course) => {
          let enrollAction = null;
          if (isStudent) {
            if (justEnrolledIds.has(course.id)) {
              enrollAction = (
                <button type="button" className="btn primary" onClick={onViewEnrollments}>
                  View Your Enrollments &rarr;
                </button>
              );
            } else if (enrolledCourseIds.has(course.id)) {
              enrollAction = (
                <button type="button" className="btn primary" onClick={onViewEnrollments}>
                  View Your Enrollments &rarr;
                </button>
              );
            } else if (enrollingCourseId === course.id) {
              enrollAction = (
                <button type="button" className="btn line" disabled>
                  Securing seat...
                </button>
              );
            } else {
              enrollAction = (
                <button type="button" className="btn line" onClick={() => onEnroll(course.id)}>
                  Enroll
                </button>
              );
            }
          }
          return (
            <article key={course.id} className="course-item">
              <div className="course-item-head">
                <div>
                  <div className="course-title">{course.title || "Untitled"}</div>
                  <div className="course-meta">{course.description || ""}</div>
                </div>
                <div className="course-meta">Course #{course.id || "-"}</div>
              </div>
              <div className="course-meta">
                Created by: {course.created_by_username || course.createdBy || "-"}
              </div>
              {isStudent && (
                <div className="course-actions">
                  {enrollAction}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default CoursesSection;
