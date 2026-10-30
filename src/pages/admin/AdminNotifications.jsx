import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiBell, FiShoppingBag, FiAlertTriangle, FiMail, FiCheck, FiFilter } from "react-icons/fi";
import { subscribeToNotifications } from "../../services/notificationService";
import "./AdminNotifications.css";

const ICONS = {
  order: <FiShoppingBag />,
  stock: <FiAlertTriangle />,
  message: <FiMail />,
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "order", label: "Orders" },
  { id: "stock", label: "Low Stock" },
  { id: "message", label: "Messages" },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToNotifications((data) => {
      clearTimeout(timeoutId);
      setNotifications(data);
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    return notifications.filter((n) => n.type === filter);
  }, [notifications, filter]);

  const counts = useMemo(() => ({
    order: notifications.filter((n) => n.type === "order").length,
    stock: notifications.filter((n) => n.type === "stock").length,
    message: notifications.filter((n) => n.type === "message").length,
  }), [notifications]);

  const formatTime = (ts) => {
    if (!ts) return "";
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    const hrs = Math.floor(diff / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" /><p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="admin-notifications">
      <div className="notif-page-header">
        <div>
          <h2 className="page-title">Notifications</h2>
          <p className="page-subtitle">All your order, stock, and message alerts in one place.</p>
        </div>
      </div>

      <div className="notif-stats">
        <div className="notif-stat-card">
          <div className="notif-stat-icon gold"><FiBell /></div>
          <div className="notif-stat-info">
            <span className="notif-stat-label">Total</span>
            <span className="notif-stat-value">{notifications.length}</span>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon gold"><FiShoppingBag /></div>
          <div className="notif-stat-info">
            <span className="notif-stat-label">New Orders</span>
            <span className="notif-stat-value">{counts.order}</span>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon amber"><FiAlertTriangle /></div>
          <div className="notif-stat-info">
            <span className="notif-stat-label">Low Stock</span>
            <span className="notif-stat-value">{counts.stock}</span>
          </div>
        </div>
        <div className="notif-stat-card">
          <div className="notif-stat-icon blue"><FiMail /></div>
          <div className="notif-stat-info">
            <span className="notif-stat-label">Messages</span>
            <span className="notif-stat-value">{counts.message}</span>
          </div>
        </div>
      </div>

      <div className="notif-filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            className={`notif-filter-btn ${filter === f.id ? "active" : ""}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="notif-page-empty">
          <FiCheck size={40} />
          <p>All caught up! No notifications in this category.</p>
        </div>
      ) : (
        <div className="notif-page-list">
          {filtered.map((n) => (
            <Link to={n.link} key={n.id} className={`notif-page-item ${n.type}`}>
              <div className={`notif-icon-wrapper ${n.type}`}>
                {ICONS[n.type]}
              </div>
              <div className="notif-page-content">
                <div className="notif-page-title-row">
                  <span className="notif-page-title">{n.title}</span>
                  <span className="notif-page-time">{formatTime(n.createdAt)}</span>
                </div>
                <span className="notif-page-message">{n.message}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}