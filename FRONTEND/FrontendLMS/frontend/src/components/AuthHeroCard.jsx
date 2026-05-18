import { useEffect, useState } from "react";
import styles from "./AuthHeroCard.module.css";

const USER_PROFILES = {
  1: { username: "admin_demo" },
  2: { username: "teacher_demo" },
  3: { username: "student_demo" },
};

function AuthHeroCard({
  roleLabel,
  user,
  coursesCount,
  enrollmentCount,
  onSessionStart,
  authError,
  authMessage,
}) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginForm, setLoginForm] = useState({
    userId: "3",
    username: USER_PROFILES[3].username,
    password: "",
  });

  useEffect(() => {
    const profile = USER_PROFILES[Number(loginForm.userId)];
    if (!profile) {
      return;
    }

    setLoginForm((previous) => ({
      ...previous,
      username: profile.username,
      password: "",
    }));
  }, [loginForm.userId]);

  async function handleSubmit(event) {
    event.preventDefault();
    await onSessionStart({
      username: loginForm.username,
      password: loginForm.password,
    });
    setLoginForm((previous) => ({ ...previous, password: "" }));
  }

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
          <div>
            <h2 className={styles.panelTitle}>Sign In</h2>
          </div>
          <span className={styles.roleChip}>{user ? roleLabel : "No role"}</span>
        </div>

        <form className={styles.stack} aria-label="User authentication form" onSubmit={handleSubmit}>
          <label htmlFor="userProfile">
            User Profile
            <select
              id="userProfile"
              name="userId"
              required
              value={loginForm.userId}
              onChange={(event) =>
                setLoginForm((previous) => ({ ...previous, userId: event.target.value }))
              }
            >
              <option value="3">Student</option>
              <option value="2">Teacher</option>
              <option value="1">Admin</option>
            </select>
          </label>

          <label htmlFor="username">
            Username
            <input
              id="username"
              name="username"
              type="text"
              placeholder="student_demo"
              autoComplete="username"
              required
              value={loginForm.username}
              onChange={(event) =>
                setLoginForm((previous) => ({ ...previous, username: event.target.value }))
              }
            />
          </label>

          <label htmlFor="password">
            Password
            <div className={styles.passwordFieldWrap}>
              <input
                id="password"
                name="password"
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter password"
                autoComplete="new-password"
                minLength={6}
                required
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm((previous) => ({ ...previous, password: event.target.value }))
                }
              />
              <button
                type="button"
                className={styles.passwordToggle}
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                onClick={() => setPasswordVisible((value) => !value)}
              >
                {passwordVisible ? "Hide" : "Show"}
              </button>
            </div>
          </label>

          <button className="btn primary" type="submit">Start Session</button>
        </form>

        <p className={`${styles.message} ${authError ? styles.error : ""}`}>{authMessage}</p>
      </div>
    </section>
  );
}

export default AuthHeroCard;
