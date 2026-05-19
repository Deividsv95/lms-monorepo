import { useEffect, useState } from "react";
import styles from "./AuthHeroCard.module.css";

const USER_PROFILES = {
  1: { username: "admin_demo" },
  2: { username: "teacher_demo" },
  3: { username: "student_demo" },
};

/**
 * LoginForm: Authentication interface
 * Handles: User profile selection, password input, login submission
 */
function LoginForm({ onSubmit, authError, authMessage, isLoading = false }) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showDemoCreds, setShowDemoCreds] = useState(false);
  const [form, setForm] = useState({
    userId: "3",
    username: USER_PROFILES[3].username,
    password: "",
  });

  useEffect(() => {
    const profile = USER_PROFILES[Number(form.userId)];
    if (!profile) return;

    setForm((prev) => ({
      ...prev,
      username: profile.username,
      password: "",
    }));
  }, [form.userId]);

  async function handleSubmit(event) {
    event.preventDefault();
    await onSubmit({
      username: form.username,
      password: form.password,
    });
    setForm((prev) => ({ ...prev, password: "" }));
  }

  const demoToggleStyle = {
    background: "transparent",
    border: "none",
    color: "#00796b",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    fontSize: "0.85rem",
    fontWeight: 600,
    marginTop: "1rem",
    padding: 0,
    textDecoration: "underline",
    textUnderlineOffset: "0.18em",
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
      <div className={styles.formGroup}>
        <label htmlFor="user-profile-select" className={styles.label}>User Profile</label>
        <select
          id="user-profile-select"
          value={form.userId}
          onChange={(e) => setForm((prev) => ({ ...prev, userId: e.target.value }))}
          className={styles.select}
        >
          <option value="1">Admin Demo</option>
          <option value="2">Teacher Demo</option>
          <option value="3">Student Demo</option>
        </select>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="username-input" className={styles.label}>Username</label>
        <input
          id="username-input"
          type="text"
          value={form.username}
          readOnly
          className={styles.input}
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password-input" className={styles.label}>Password</label>
        <div className={styles.passwordWrapper}>
          <input
            id="password-input"
            type={passwordVisible ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            className={styles.input}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className={styles.toggleButton}
            disabled={isLoading}
          >
            {passwordVisible ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {authMessage && (
        <div className={`${styles.message} ${authError ? styles.error : styles.success}`}>
          {authMessage}
        </div>
      )}

      <button type="submit" className="btn primary" disabled={isLoading}>
        {isLoading ? "Starting session..." : "Start Session"}
      </button>
    </form>

    <button
      type="button"
      onClick={() => setShowDemoCreds(!showDemoCreds)}
      style={demoToggleStyle}
    >
      <span>{showDemoCreds ? "Hide Demo Credentials" : "Show Demo Credentials"}</span>
      <span aria-hidden="true">{showDemoCreds ? "▲" : "▼"}</span>
    </button>

    {showDemoCreds && (
      <div
        className="demo-credentials"
        style={{
          marginTop: "0.75rem",
          border: "1px solid var(--line)",
          borderRadius: 12,
          background: "rgba(255,255,255,0.85)",
          padding: "1rem",
          fontSize: "0.98rem",
        }}
      >
        <strong>Demo Login Credentials</strong>
        <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse", fontSize: "0.97rem" }}>
          <thead>
            <tr style={{ color: "var(--muted)" }}>
              <th style={{ textAlign: "left", padding: 4 }}>Username</th>
              <th style={{ textAlign: "left", padding: 4 }}>Password</th>
              <th style={{ textAlign: "left", padding: 4 }}>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: 4 }}><code>admin_demo</code></td>
              <td style={{ padding: 4 }}><code>Admin@123</code></td>
              <td style={{ padding: 4 }}>Admin</td>
            </tr>
            <tr>
              <td style={{ padding: 4 }}><code>teacher_demo</code></td>
              <td style={{ padding: 4 }}><code>Teacher@123</code></td>
              <td style={{ padding: 4 }}>Teacher</td>
            </tr>
            <tr>
              <td style={{ padding: 4 }}><code>student_demo</code></td>
              <td style={{ padding: 4 }}><code>Student@123</code></td>
              <td style={{ padding: 4 }}>Student</td>
            </tr>
          </tbody>
        </table>
        <div style={{ color: "var(--muted)", fontSize: "0.93rem", marginTop: 6 }}>
          Use these accounts to test all roles in the LMS.
        </div>
      </div>
    )}
    </>
  );
}

export default LoginForm;
