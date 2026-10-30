import { useState, useEffect, useMemo } from "react";
import {
  FiSearch, FiUsers, FiX, FiMail, FiPhone, FiMapPin,
  FiDollarSign, FiShoppingBag, FiCalendar, FiChevronRight,
} from "react-icons/fi";
import { subscribeToCustomers } from "../../services/customerService";
import "./AdminCustomers.css";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("recent"); // recent | spend | orders
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToCustomers((data) => {
      clearTimeout(timeoutId);
      setCustomers(data);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
  }, []);

  const stats = useMemo(() => {
    const total = customers.length;
    const totalSpent = customers.reduce((s, c) => s + (c.totalSpent || 0), 0);
    const totalOrders = customers.reduce((s, c) => s + (c.orderCount || 0), 0);
    const avgSpent = total > 0 ? totalSpent / total : 0;
    return { total, totalSpent, totalOrders, avgSpent };
  }, [customers]);

  const filtered = useMemo(() => {
    let arr = customers.filter((c) => {
      const q = search.toLowerCase();
      return (
        (c.name || "").toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.email || "").toLowerCase().includes(q)
      );
    });

    if (sortBy === "recent") {
      arr = arr.sort((a, b) => (b.lastOrderAt || 0) - (a.lastOrderAt || 0));
    } else if (sortBy === "spend") {
      arr = arr.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    } else if (sortBy === "orders") {
      arr = arr.sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
    }

    return arr;
  }, [customers, search, sortBy]);

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const initials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="admin-customers">

      {/* HEADER */}
      <div className="cust-header">
        <div>
          <h2 className="page-title">Customers</h2>
          <p className="page-subtitle">
            Manage your customers and view their order history.
          </p>
        </div>
      </div>

      {/* STATS */}
      <div className="cust-stats">
        <div className="cust-stat-card">
          <div className="cust-stat-icon gold"><FiUsers /></div>
          <div className="cust-stat-info">
            <span className="cust-stat-label">Total Customers</span>
            <span className="cust-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-icon green"><FiDollarSign /></div>
          <div className="cust-stat-info">
            <span className="cust-stat-label">Total Spent</span>
            <span className="cust-stat-value">Rs. {stats.totalSpent.toLocaleString()}</span>
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-icon blue"><FiShoppingBag /></div>
          <div className="cust-stat-info">
            <span className="cust-stat-label">Total Orders</span>
            <span className="cust-stat-value">{stats.totalOrders}</span>
          </div>
        </div>
        <div className="cust-stat-card">
          <div className="cust-stat-icon purple"><FiDollarSign /></div>
          <div className="cust-stat-info">
            <span className="cust-stat-label">Avg. Spent</span>
            <span className="cust-stat-value">Rs. {stats.avgSpent.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="cust-filters">
        <div className="cust-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="cust-sort">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="recent">Most Recent</option>
            <option value="spend">Highest Spend</option>
            <option value="orders">Most Orders</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="cust-table-wrap">
        {filtered.length === 0 ? (
          <div className="cust-empty">
            <FiUsers size={40} />
            <p>{search ? "No customers match your search." : "No customers yet. They'll appear here after their first order."}</p>
          </div>
        ) : (
          <table className="cust-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} onClick={() => setSelected(c)} style={{ cursor: "pointer" }}>
                  <td>
                    <div className="cust-cell">
                      <div className="cust-avatar">{initials(c.name)}</div>
                      <div className="cust-cell-info">
                        <span className="cust-name">{c.name || "Guest"}</span>
                        <span className="cust-id">ID: {c.id.slice(-8)}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="cust-contact">
                      {c.phone && <span><FiPhone /> {c.phone}</span>}
                      {c.email && <span><FiMail /> {c.email}</span>}
                      {!c.phone && !c.email && <span className="text-muted">—</span>}
                    </div>
                  </td>
                  <td className="bold">{c.orderCount || 0}</td>
                  <td className="gold bold">Rs. {(c.totalSpent || 0).toLocaleString()}</td>
                  <td className="text-muted">{formatDate(c.lastOrderAt)}</td>
                  <td><FiChevronRight className="cust-arrow" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* CUSTOMER DETAIL MODAL */}
      {selected && (
        <div className="cust-modal-overlay" onClick={() => setSelected(null)}>
          <div className="cust-modal" onClick={(e) => e.stopPropagation()}>
            <div className="cust-modal-head">
              <div className="cust-modal-profile">
                <div className="cust-avatar large">{initials(selected.name)}</div>
                <div>
                  <h3>{selected.name || "Guest"}</h3>
                  <p>Customer since {formatDate(selected.createdAt)}</p>
                </div>
              </div>
              <button className="cust-modal-close" onClick={() => setSelected(null)}>
                <FiX />
              </button>
            </div>

            <div className="cust-modal-body">

              {/* CONTACT */}
              <div className="cust-modal-section">
                <h4 className="cust-section-title">Contact Information</h4>
                <div className="cust-info-grid">
                  <div className="cust-info-item">
                    <FiPhone className="cust-info-icon" />
                    <div>
                      <span className="cust-info-label">Phone</span>
                      <span className="cust-info-value">{selected.phone || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="cust-info-item">
                    <FiMail className="cust-info-icon" />
                    <div>
                      <span className="cust-info-label">Email</span>
                      <span className="cust-info-value">{selected.email || "Not provided"}</span>
                    </div>
                  </div>
                  <div className="cust-info-item full">
                    <FiMapPin className="cust-info-icon" />
                    <div>
                      <span className="cust-info-label">Address</span>
                      <span className="cust-info-value">
                        {selected.address
                          ? `${selected.address.street || ""}, ${selected.address.city || ""} ${selected.address.postalCode || ""}`
                          : "Not provided"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SUMMARY */}
              <div className="cust-modal-section">
                <h4 className="cust-section-title">Summary</h4>
                <div className="cust-summary-grid">
                  <div className="cust-summary-card">
                    <FiShoppingBag className="cust-summary-icon" />
                    <span className="cust-summary-value">{selected.orderCount || 0}</span>
                    <span className="cust-summary-label">Orders</span>
                  </div>
                  <div className="cust-summary-card">
                    <FiDollarSign className="cust-summary-icon" />
                    <span className="cust-summary-value">Rs. {(selected.totalSpent || 0).toLocaleString()}</span>
                    <span className="cust-summary-label">Total Spent</span>
                  </div>
                  <div className="cust-summary-card">
                    <FiCalendar className="cust-summary-icon" />
                    <span className="cust-summary-value">{formatDate(selected.lastOrderAt)}</span>
                    <span className="cust-summary-label">Last Order</span>
                  </div>
                </div>
              </div>

              {/* ORDERS */}
              <div className="cust-modal-section">
                <h4 className="cust-section-title">Order History ({selected.orders?.length || 0})</h4>
                {selected.orders && selected.orders.length > 0 ? (
                  <div className="cust-orders-list">
                    {selected.orders.map((o) => (
                      <div className="cust-order-row" key={o.id}>
                        <div className="cust-order-info">
                          <span className="cust-order-id">#TTS-{o.id.slice(-6).toUpperCase()}</span>
                          <span className="cust-order-date">{formatDateTime(o.createdAt)}</span>
                        </div>
                        <span className={`cust-order-status ${o.status?.toLowerCase() || "pending"}`}>
                          {o.status || "Pending"}
                        </span>
                        <span className="cust-order-total">Rs. {Number(o.total || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted" style={{ fontSize: 12 }}>No orders yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}