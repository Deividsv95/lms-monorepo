import { NavLink } from "react-router-dom";
import styles from "./TopBar.module.css";

/**
 * Navbar: Navigation and user status display
 * Handles: Route links, role label, logout action
 */
function Navbar({ roleLabel, user, onLogout }) {
  return (
    <header className={styles.topbar} role="banner">
      <div className={styles.topbarBrand}>
        <h1 className={styles.title}>LMS Portal</h1>
        <nav className={styles.topbarNav} aria-label="Primary">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/courses"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
          >
            Courses
          </NavLink>
          <NavLink
            to="/management"
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
          >
            Management
          </NavLink>
        </nav>
      </div>
      <div className={styles.topbarActions}>
        <div className={styles.presencePill}>
          <span className={styles.presenceDot} />
          <span>{roleLabel}</span>
        </div>
        {user && (
          <button type="button" onClick={onLogout} className="btn ghost">
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;
