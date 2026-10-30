import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiSearch, FiEye, FiTrash2, FiShoppingBag,
  FiClock, FiCheck, FiDollarSign,
} from "react-icons/fi";
import { subscribeToOrders, deleteOrder } from "../../services/orderService";
import "./AdminOrders.css";

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "Pending", label: "Pending" },
  { id: "Confirmed", label: "Confirmed" },
  { id: "Processing", label: "Processing" },
  { id: "Shipped", label: "Shipped" },
  { id: "Delivered", label: "Delivered" },
  { id: "Cancelled", label: "Cancelled" },
];

const STATUS_COLORS = {
  Pending: "pending",
  Confirmed: "confirmed",
  Processing: "processing",
  Shipped: "shipped",
  Delivered: "delivered",
  Cancelled: "cancelled",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    
    // Subscribe to Firebase
    const unsub = subscribeToOrders(
      (data) => {
        clearTimeout(timeoutId);
        console.log("🟢 Orders received from Firebase:", data);
        setOrders(data);
        setLoading(false);
      },
      (error) => { // Adding error callback support
        clearTimeout(timeoutId);
        console.error("🔴 Firebase read error:", error);
        setLoading(false);
      }
    );

    return () => { 
      clearTimeout(timeoutId); 
      unsub(); 
    };
  }, []);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "Pending").length;
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const revenue = orders
      .filter((o) => o.status !== "Cancelled")
      .reduce((s, o) => s + Number(o.total || 0), 0);
    return { total, pending, delivered, revenue };
  }, [orders]);

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      const q = search.toLowerCase();
      const matchSearch =
        (o.id || "").toLowerCase().includes(q) ||
        (o.customerName || "").toLowerCase().includes(q) ||
        (o.phone || "").toLowerCase().includes(q);
      const matchFilter = filter === "all" || o.status === filter;
      return matchSearch && matchFilter;
    });
  }, [orders, search, filter]);

  const handleDelete = async (id) => {
    if (window.confirm("Delete this order permanently?")) {
      try { await deleteOrder(id); }
      catch (err) { alert("Failed: " + err.message); }
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders">

      <div className="orders-header">
        <div>
          <h2 className="page-title">Orders</h2>
          <p className="page-subtitle">Manage customer orders and fulfillment.</p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="orders-stat-card">
          <div className="orders-stat-icon gold"><FiShoppingBag /></div>
          <div className="orders-stat-info">
            <span className="orders-stat-label">Total Orders</span>
            <span className="orders-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="orders-stat-card">
          <div className="orders-stat-icon amber"><FiClock /></div>
          <div className="orders-stat-info">
            <span className="orders-stat-label">Pending</span>
            <span className="orders-stat-value">{stats.pending}</span>
          </div>
        </div>
        <div className="orders-stat-card">
          <div className="orders-stat-icon green"><FiCheck /></div>
          <div className="orders-stat-info">
            <span className="orders-stat-label">Delivered</span>
            <span className="orders-stat-value">{stats.delivered}</span>
          </div>
        </div>
        <div className="orders-stat-card">
          <div className="orders-stat-icon blue"><FiDollarSign /></div>
          <div className="orders-stat-info">
            <span className="orders-stat-label">Revenue</span>
            <span className="orders-stat-value">Rs. {stats.revenue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="orders-filters">
        <div className="orders-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by order ID, customer or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="orders-filter-tabs">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`orders-filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="orders-table-wrap">
        {filtered.length === 0 ? (
          <div className="orders-empty">
            <FiShoppingBag size={40} />
            <p>{search || filter !== "all" ? "No orders match your filter." : "No orders yet."}</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o.id}>
                  <td className="order-id">#TTS-{o.id.slice(-6).toUpperCase()}</td>
                  <td>
                    <div className="order-customer">
                      <span className="order-cust-name">{o.customerName || "Guest"}</span>
                      <span className="order-cust-phone">{o.phone || "—"}</span>
                    </div>
                  </td>
                  <td className="text-muted">{formatDate(o.createdAt)}</td>
                  <td className="bold gold">Rs. {Number(o.total || 0).toLocaleString()}</td>
                  <td>
                    <span className={`order-status ${STATUS_COLORS[o.status] || "pending"}`}>
                      {o.status || "Pending"}
                    </span>
                  </td>
                  <td>
                    <div className="order-actions">
                      <Link to={`/admin/orders/${o.id}`} className="order-action-btn">
                        <FiEye />
                      </Link>
                      <button onClick={() => handleDelete(o.id)} className="order-action-btn delete">
                        <FiTrash2 />
                      </button>
                    </div>
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