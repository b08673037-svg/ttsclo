import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiShoppingBag, FiAlertTriangle, FiMail, FiCheck, FiX } from "react-icons/fi";
import { subscribeToNotifications } from "../../services/notificationService";
import "./NotificationDropdown.css";

const ICONS = {
  order: <FiShoppingBag />,
  stock: <FiAlertTriangle />,
  message: <FiMail />,
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => setNotifications([]), 2000);
    const unsub = subscribeToNotifications((data) => {
      clearTimeout(timeoutId);
      setNotifications(data);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = notifications.length;

  const formatTime = (ts) => {
    if (!ts) return "";
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="notif-wrapper" ref={dropdownRef}>
      <button
        className="admin-theme-btn notif-bell-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <h3>Notifications</h3>
            <span className="notif-count">{unreadCount} new</span>
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <FiCheck size={32} />
                <p>All caught up!</p>
              </div>
            ) : (
              notifications.slice(0, 5).map((n) => (
                <Link
                  key={n.id}
                  to={n.link}
                  className={`notif-item ${n.type}`}
                  onClick={() => setIsOpen(false)}
                >
                  <div className={`notif-icon-wrapper ${n.type}`}>
                    {ICONS[n.type]}
                  </div>
                  <div className="notif-content">
                    <span className="notif-title">{n.title}</span>
                    <span className="notif-message">{n.message}</span>
                    <span className="notif-time">{formatTime(n.createdAt)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            to="/admin/notifications"
            className="notif-footer"
            onClick={() => setIsOpen(false)}
          >
            View All Notifications
          </Link>
        </div>
      )}
    </div>
  );
}