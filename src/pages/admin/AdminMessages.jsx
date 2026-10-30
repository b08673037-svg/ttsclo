import { useState, useEffect, useMemo } from "react";
import {
  FiMail, FiSearch, FiTrash2, FiCheck, FiUser,
  FiClock, FiMessageSquare, FiX,
} from "react-icons/fi";
import {
  subscribeToContactMessages,
  markMessageAsRead,
  deleteContactMessage,
} from "../../services/contactMessageService";
import "./AdminMessages.css";

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToContactMessages((data) => {
      clearTimeout(timeoutId);
      setMessages(data);
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  const stats = useMemo(() => {
    const total = messages.length;
    const unread = messages.filter((m) => !m.read).length;
    const read = messages.filter((m) => m.read).length;
    const today = messages.filter((m) => {
      if (!m.createdAt) return false;
      const d = new Date(m.createdAt);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }).length;
    return { total, unread, read, today };
  }, [messages]);

  const filtered = useMemo(() => {
    return messages.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q) ||
        (m.subject || "").toLowerCase().includes(q) ||
        (m.message || "").toLowerCase().includes(q);

      let matchFilter = true;
      if (filter === "unread") matchFilter = !m.read;
      else if (filter === "read") matchFilter = m.read;

      return matchSearch && matchFilter;
    });
  }, [messages, search, filter]);

  const openMessage = async (msg) => {
    setSelected(msg);
    if (!msg.read) {
      try {
        await markMessageAsRead(msg.id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this message?")) {
      try {
        await deleteContactMessage(id);
        if (selected?.id === id) setSelected(null);
      } catch (err) {
        alert("Failed: " + err.message);
      }
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" /><p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="admin-messages">
      <div className="msg-header">
        <div>
          <h2 className="page-title">Contact Messages</h2>
          <p className="page-subtitle">Read and manage messages from your contact form.</p>
        </div>
      </div>

      <div className="msg-stats">
        <div className="msg-stat-card">
          <div className="msg-stat-icon gold"><FiMail /></div>
          <div className="msg-stat-info">
            <span className="msg-stat-label">Total Messages</span>
            <span className="msg-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="msg-stat-card">
          <div className="msg-stat-icon amber"><FiMessageSquare /></div>
          <div className="msg-stat-info">
            <span className="msg-stat-label">Unread</span>
            <span className="msg-stat-value">{stats.unread}</span>
          </div>
        </div>
        <div className="msg-stat-card">
          <div className="msg-stat-icon green"><FiCheck /></div>
          <div className="msg-stat-info">
            <span className="msg-stat-label">Read</span>
            <span className="msg-stat-value">{stats.read}</span>
          </div>
        </div>
        <div className="msg-stat-card">
          <div className="msg-stat-icon blue"><FiClock /></div>
          <div className="msg-stat-info">
            <span className="msg-stat-label">Today</span>
            <span className="msg-stat-value">{stats.today}</span>
          </div>
        </div>
      </div>

      <div className="msg-filters">
        <div className="msg-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name, email, or subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="msg-filter-tabs">
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              className={`msg-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="msg-empty">
          <FiMail size={40} />
          <p>{search || filter !== "all" ? "No messages match your filter." : "No messages yet. When customers send messages from your contact form, they'll appear here."}</p>
        </div>
      ) : (
        <div className="msg-grid">
          {filtered.map((msg) => (
            <div
              className={`msg-card ${!msg.read ? "unread" : ""}`}
              key={msg.id}
              onClick={() => openMessage(msg)}
            >
              <div className="msg-card-head">
                <div className="msg-sender">
                  <div className="msg-avatar">
                    {msg.name?.[0]?.toUpperCase() || <FiUser />}
                  </div>
                  <div>
                    <span className="msg-name">{msg.name}</span>
                    <span className="msg-email">{msg.email}</span>
                  </div>
                </div>
                {!msg.read && <span className="msg-unread-dot" />}
              </div>
              <div className="msg-subject">{msg.subject}</div>
              <p className="msg-preview">
                {msg.message?.length > 120 ? msg.message.slice(0, 120) + "..." : msg.message}
              </p>
              <div className="msg-card-footer">
                <span className="msg-date">{formatDate(msg.createdAt)}</span>
                <button
                  className="msg-delete-btn"
                  onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="msg-modal-overlay" onClick={() => setSelected(null)}>
          <div className="msg-modal" onClick={(e) => e.stopPropagation()}>
            <div className="msg-modal-head">
              <div className="msg-sender">
                <div className="msg-avatar large">
                  {selected.name?.[0]?.toUpperCase() || <FiUser />}
                </div>
                <div>
                  <h3>{selected.name}</h3>
                  <p>{selected.email}</p>
                </div>
              </div>
              <button className="msg-modal-close" onClick={() => setSelected(null)}>
                <FiX />
              </button>
            </div>

            <div className="msg-modal-body">
              <div className="msg-detail-row">
                <span className="msg-detail-label">Subject</span>
                <span className="msg-detail-value">{selected.subject}</span>
              </div>
              <div className="msg-detail-row">
                <span className="msg-detail-label">Received</span>
                <span className="msg-detail-value">{formatDate(selected.createdAt)}</span>
              </div>
              <div className="msg-detail-message">
                {selected.message}
              </div>
            </div>

            <div className="msg-modal-actions">
              <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="msg-reply-btn">
                <FiMail /> Reply via Email
              </a>
              <button className="msg-delete-modal-btn" onClick={() => handleDelete(selected.id)}>
                <FiTrash2 /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}