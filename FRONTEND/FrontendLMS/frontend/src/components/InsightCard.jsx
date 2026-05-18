function InsightCard({ roleSummary, enrollmentsOutput }) {
  return (
    <aside className="card insight-card">
      <h2>{roleSummary.title}</h2>
      <p>{roleSummary.body}</p>
      <div className="insight-rail">
        <span className="insight-pill">Student enrollments</span>
        <span className="insight-pill">Teacher publishing</span>
        <span className="insight-pill">Admin controls</span>
      </div>
      {enrollmentsOutput && <pre>{enrollmentsOutput}</pre>}
    </aside>
  );
}

export default InsightCard;
