import { useState, useEffect } from "react";
import {
  FiSearch, FiTrash2, FiDownload, FiMail, FiUsers,
} from "react-icons/fi";
import {
  subscribeToSubscribers,
  deleteSubscriber,
} from "../../services/subscriberService";
import "./AdminSubscribers.css";

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToSubscribers((data) => {
      clearTimeout(timeoutId);
      setSubscribers(data);
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  const handleDelete = async (id, email) => {
    if (window.confirm(`Remove "${email}" from subscribers?`)) {
      try { await deleteSubscriber(id); }
      catch (err) { alert("Failed: " + err.message); }
    }
  };

  const handleExport = () => {
    if (subscribers.length === 0) return;
    const csv = "Email,Subscribed\n" + subscribers.map((s) =>
      `"${s.email}","${new Date(s.createdAt || Date.now()).toLocaleString()}"`
    ).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tts-subscribers-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter((s) =>
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" /><p>Loading subscribers...</p>
      </div>
    );
  }

  return (
    <div className="admin-subscribers">
      <div className="sub-header">
        <div>
          <h2 className="page-title">Newsletter Subscribers</h2>
          <p className="page-subtitle">{subscribers.length} subscriber{subscribers.length !== 1 ? "s" : ""} in your list.</p>
        </div>
        <button className="sub-export-btn" onClick={handleExport} disabled={subscribers.length === 0}>
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="sub-stats">
        <div className="sub-stat-card">
          <div className="sub-stat-icon gold"><FiMail /></div>
          <div className="sub-stat-info">
            <span className="sub-stat-label">Total Subscribers</span>
            <span className="sub-stat-value">{subscribers.length}</span>
          </div>
        </div>
        <div className="sub-stat-card">
          <div className="sub-stat-icon green"><FiUsers /></div>
          <div className="sub-stat-info">
            <span className="sub-stat-label">This Month</span>
            <span className="sub-stat-value">
              {subscribers.filter((s) => {
                if (!s.createdAt) return false;
                const d = new Date(s.createdAt);
                const now = new Date();
                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
              }).length}
            </span>
          </div>
        </div>
      </div>

      <div className="sub-search">
        <FiSearch />
        <input type="text" placeholder="Search by email..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="sub-table-wrap">
        {filtered.length === 0 ? (
          <div className="sub-empty">
            <FiMail size={40} />
            <p>{search ? "No subscribers match your search." : "No subscribers yet. They'll appear here once someone subscribes."}</p>
          </div>
        ) : (
          <table className="sub-table">
            <thead>
              <tr><th>Email</th><th>Subscribed On</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="sub-email-cell">
                      <FiMail className="sub-email-icon" />
                      <span>{s.email}</span>
                    </div>
                  </td>
                  <td className="text-muted">{formatDate(s.createdAt)}</td>
                  <td><span className="sub-status">Active</span></td>
                  <td>
                    <button className="sub-action-btn" onClick={() => handleDelete(s.id, s.email)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}