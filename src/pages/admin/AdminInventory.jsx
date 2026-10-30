import { useState, useEffect, useMemo } from "react";
import {
  FiSearch, FiPackage, FiAlertTriangle, FiRefreshCw,
  FiPlus, FiMinus, FiChevronDown, FiX, FiCheck, FiClock,
  FiTrendingDown, FiTrendingUp,
} from "react-icons/fi";
import {
  subscribeToInventory,
  subscribeToInventoryLogs,
  adjustStock,
} from "../../services/inventoryService";
import "./AdminInventory.css";

const STOCK_FILTERS = [
  { id: "all", label: "All Products" },
  { id: "critical", label: "Critical (≤3)" },
  { id: "low", label: "Low (4–10)" },
  { id: "out", label: "Out of Stock" },
  { id: "healthy", label: "Healthy (>10)" },
];

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showLogs, setShowLogs] = useState(false);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ newStock: "", reason: "Restock", note: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsubProducts = subscribeToInventory((data) => {
      clearTimeout(timeoutId);
      setProducts(data);
      setLoading(false);
    });
    const unsubLogs = subscribeToInventoryLogs((data) => setLogs(data));
    return () => {
      clearTimeout(timeoutId);
      unsubProducts();
      unsubLogs();
    };
  }, []);

  const stats = useMemo(() => {
    const out = products.filter((p) => Number(p.stock || 0) === 0).length;
    const critical = products.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 3).length;
    const low = products.filter((p) => Number(p.stock || 0) > 3 && Number(p.stock || 0) <= 10).length;
    const healthy = products.filter((p) => Number(p.stock || 0) > 10).length;
    const totalUnits = products.reduce((s, p) => s + Number(p.stock || 0), 0);
    const stockValue = products.reduce((s, p) => s + Number(p.stock || 0) * Number(p.price || 0), 0);
    return { out, critical, low, healthy, totalUnits, stockValue };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        (p.name || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);

      let matchFilter = true;
      const stock = Number(p.stock || 0);
      if (filter === "critical") matchFilter = stock > 0 && stock <= 3;
      else if (filter === "low") matchFilter = stock > 3 && stock <= 10;
      else if (filter === "out") matchFilter = stock === 0;
      else if (filter === "healthy") matchFilter = stock > 10;

      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  const openAdjust = (product) => {
    setAdjusting(product);
    setAdjustForm({
      newStock: String(product.stock || 0),
      reason: "Restock",
      note: "",
    });
  };

  const closeAdjust = () => {
    setAdjusting(null);
    setAdjustForm({ newStock: "", reason: "Restock", note: "" });
  };

  const handleSave = async () => {
    if (!adjusting) return;
    setSaving(true);
    try {
      await adjustStock(adjusting, Number(adjustForm.newStock), adjustForm.reason, adjustForm.note);
      closeAdjust();
    } catch (err) {
      alert("Failed to update stock: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const quickAdjust = async (product, delta) => {
    const newStock = Math.max(0, Number(product.stock || 0) + delta);
    try {
      await adjustStock(product, newStock, delta > 0 ? "Restock" : "Manual Deduction", "");
    } catch (err) {
      alert("Failed: " + err.message);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: "Out", cls: "critical" };
    if (stock <= 3) return { label: "Critical", cls: "critical" };
    if (stock <= 10) return { label: "Low", cls: "warning" };
    return { label: "Healthy", cls: "healthy" };
  };

  const formatDate = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-US", {
      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading inventory...</p>
      </div>
    );
  }

  return (
    <div className="admin-inventory">

      {/* HEADER */}
      <div className="inv-header">
        <div>
          <h2 className="page-title">Inventory</h2>
          <p className="page-subtitle">Track stock levels and manage restocking across all products.</p>
        </div>
        <button
          className={`inv-logs-btn ${showLogs ? "active" : ""}`}
          onClick={() => setShowLogs(!showLogs)}
        >
          <FiClock /> {showLogs ? "Hide History" : "Stock History"}
        </button>
      </div>

      {/* STATS */}
      <div className="inv-stats">
        <div className="inv-stat-card">
          <div className="inv-stat-icon green"><FiPackage /></div>
          <div className="inv-stat-info">
            <span className="inv-stat-label">Total Units</span>
            <span className="inv-stat-value">{stats.totalUnits}</span>
          </div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-icon gold"><FiTrendingUp /></div>
          <div className="inv-stat-info">
            <span className="inv-stat-label">Stock Value</span>
            <span className="inv-stat-value">Rs. {stats.stockValue.toLocaleString()}</span>
          </div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-icon amber"><FiAlertTriangle /></div>
          <div className="inv-stat-info">
            <span className="inv-stat-label">Low Stock</span>
            <span className="inv-stat-value">{stats.critical + stats.low}</span>
          </div>
        </div>
        <div className="inv-stat-card">
          <div className="inv-stat-icon red"><FiTrendingDown /></div>
          <div className="inv-stat-info">
            <span className="inv-stat-label">Out of Stock</span>
            <span className="inv-stat-value">{stats.out}</span>
          </div>
        </div>
      </div>

      {/* LOGS PANEL */}
      {showLogs && (
        <div className="inv-logs-panel">
          <h3 className="inv-logs-title">Recent Stock Movements</h3>
          {logs.length === 0 ? (
            <p className="inv-logs-empty">No stock movements yet. Adjust a product to start tracking.</p>
          ) : (
            <div className="inv-logs-list">
              {logs.slice(0, 20).map((log) => (
                <div className="inv-log-row" key={log.id}>
                  <div className={`inv-log-badge ${log.change > 0 ? "positive" : "negative"}`}>
                    {log.change > 0 ? <FiPlus /> : <FiMinus />} {Math.abs(log.change)}
                  </div>
                  <div className="inv-log-info">
                    <span className="inv-log-name">{log.productName}</span>
                    <span className="inv-log-reason">
                      {log.reason} · {log.previousStock} → {log.newStock}
                      {log.note && ` · ${log.note}`}
                    </span>
                  </div>
                  <span className="inv-log-time">{formatDate(log.timestamp)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FILTERS */}
      <div className="inv-filters">
        <div className="inv-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by product, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="inv-filter-tabs">
          {STOCK_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`inv-filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="inv-table-wrap">
        {filtered.length === 0 ? (
          <div className="inv-empty">
            <FiPackage size={40} />
            <p>No products match your filter.</p>
          </div>
        ) : (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Quick Adjust</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const status = getStockStatus(Number(p.stock || 0));
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="inv-prod-cell">
                        <div className="inv-prod-thumb">
                          {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <FiPackage />}
                        </div>
                        <span>{p.name}</span>
                      </div>
                    </td>
                    <td className="text-muted">{p.sku || "—"}</td>
                    <td className="text-muted">{p.category || "—"}</td>
                    <td className="bold">Rs. {Number(p.price || 0).toLocaleString()}</td>
                    <td className="bold">{p.stock || 0}</td>
                    <td>
                      <span className={`inv-status ${status.cls}`}>{status.label}</span>
                    </td>
                    <td>
                      <div className="inv-quick-adjust">
                        <button
                          className="inv-qty-btn"
                          onClick={() => quickAdjust(p, -1)}
                          disabled={Number(p.stock || 0) <= 0}
                          aria-label="Decrease"
                        >
                          <FiMinus />
                        </button>
                        <span className="inv-qty-display">{p.stock || 0}</span>
                        <button
                          className="inv-qty-btn"
                          onClick={() => quickAdjust(p, 1)}
                          aria-label="Increase"
                        >
                          <FiPlus />
                        </button>
                      </div>
                    </td>
                    <td>
                      <button className="inv-adjust-btn" onClick={() => openAdjust(p)}>
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ADJUST MODAL */}
      {adjusting && (
        <div className="inv-modal-overlay" onClick={closeAdjust}>
          <div className="inv-modal" onClick={(e) => e.stopPropagation()}>
            <div className="inv-modal-head">
              <div>
                <h3>Adjust Stock</h3>
                <p>{adjusting.name}</p>
              </div>
              <button className="inv-modal-close" onClick={closeAdjust}>
                <FiX />
              </button>
            </div>

            <div className="inv-modal-body">
              <div className="inv-current-stock">
                <span className="inv-current-label">Current Stock</span>
                <span className="inv-current-value">{adjusting.stock || 0}</span>
              </div>

              <div className="inv-form-group">
                <label>New Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={adjustForm.newStock}
                  onChange={(e) => setAdjustForm({ ...adjustForm, newStock: e.target.value })}
                />
              </div>

              <div className="inv-form-group">
                <label>Reason</label>
                <select
                  value={adjustForm.reason}
                  onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                >
                  <option value="Restock">Restock</option>
                  <option value="Manual Adjustment">Manual Adjustment</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Returned">Returned</option>
                  <option value="Sold (Manual)">Sold (Manual)</option>
                </select>
              </div>

              <div className="inv-form-group">
                <label>Note (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Received from supplier"
                  value={adjustForm.note}
                  onChange={(e) => setAdjustForm({ ...adjustForm, note: e.target.value })}
                />
              </div>
            </div>

            <div className="inv-modal-actions">
              <button className="inv-btn-secondary" onClick={closeAdjust} disabled={saving}>
                Cancel
              </button>
              <button className="inv-btn-primary" onClick={handleSave} disabled={saving}>
                <FiCheck /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}