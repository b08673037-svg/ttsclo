import { FiMenu, FiUser, FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import NotificationDropdown from "./NotificationDropdown";
import "./AdminTopbar.css";

export default function AdminTopbar({ toggleSidebar, adminEmail }) {
  const displayName = adminEmail ? adminEmail.split("@")[0] : "Admin";
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <button className="menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
          <FiMenu />
        </button>
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="topbar-right">
        <button
          className="admin-theme-btn"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <FiSun /> : <FiMoon />}
        </button>

        {/* REPLACED BELL BUTTON WITH DROPDOWN COMPONENT */}
        <NotificationDropdown />

        <div className="admin-profile">
          <div className="avatar">
            <FiUser />
          </div>
          <div className="profile-info">
            <span className="profile-name">{displayName}</span>
            <span className="profile-role">Store Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}