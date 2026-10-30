import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiPackage,
  FiCheck, FiX, FiAlertTriangle, FiFilter,
} from "react-icons/fi";
import { subscribeToProducts, deleteProduct } from "../../services/productService";
import "./AdminProducts.css";

const STOCK_FILTERS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "inactive", label: "Inactive" },
  { id: "low", label: "Low Stock" },
  { id: "out", label: "Out of Stock" },
];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToProducts((data) => {
      clearTimeout(timeoutId);
      setProducts(data);
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const low = products.filter((p) => Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 10).length;
    const out = products.filter((p) => Number(p.stock || 0) === 0).length;
    return { total, active, low, out };
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch =
        (p.name || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q);

      let matchFilter = true;
      if (filter === "active") matchFilter = p.status === "active";
      else if (filter === "inactive") matchFilter = p.status !== "active";
      else if (filter === "low") matchFilter = Number(p.stock || 0) > 0 && Number(p.stock || 0) <= 10;
      else if (filter === "out") matchFilter = Number(p.stock || 0) === 0;

      return matchSearch && matchFilter;
    });
  }, [products, search, filter]);

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
      try {
        await deleteProduct(id);
      } catch (err) {
        alert("Failed: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="admin-products">

      <div className="prod-header">
        <div>
          <h2 className="page-title">Products</h2>
          <p className="page-subtitle">Manage your store inventory and product listings.</p>
        </div>
        <Link to="/admin/products/new" className="prod-add-btn">
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="prod-stats">
        <div className="prod-stat-card">
          <div className="prod-stat-icon gold"><FiPackage /></div>
          <div className="prod-stat-info">
            <span className="prod-stat-label">Total Products</span>
            <span className="prod-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="prod-stat-card">
          <div className="prod-stat-icon green"><FiCheck /></div>
          <div className="prod-stat-info">
            <span className="prod-stat-label">Active</span>
            <span className="prod-stat-value">{stats.active}</span>
          </div>
        </div>
        <div className="prod-stat-card">
          <div className="prod-stat-icon amber"><FiAlertTriangle /></div>
          <div className="prod-stat-info">
            <span className="prod-stat-label">Low Stock</span>
            <span className="prod-stat-value">{stats.low}</span>
          </div>
        </div>
        <div className="prod-stat-card">
          <div className="prod-stat-icon red"><FiX /></div>
          <div className="prod-stat-info">
            <span className="prod-stat-label">Out of Stock</span>
            <span className="prod-stat-value">{stats.out}</span>
          </div>
        </div>
      </div>

      <div className="prod-filters">
        <div className="prod-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by name, SKU or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="prod-filter-tabs">
          {STOCK_FILTERS.map((f) => (
            <button
              key={f.id}
              className={`prod-filter-btn ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="prod-table-wrap">
        {filtered.length === 0 ? (
          <div className="prod-empty">
            <FiPackage size={40} />
            <p>{search ? "No products match your search." : "No products yet. Click Add Product to start."}</p>
          </div>
        ) : (
          <table className="prod-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="prod-cell">
                      <div className="prod-thumb">
                        {p.imageUrl ? <img src={p.imageUrl} alt="" /> : <FiPackage />}
                      </div>
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="text-muted">{p.sku || "—"}</td>
                  <td className="text-muted">{p.category || "—"}</td>
                  <td>
                    <span className="bold">Rs. {Number(p.price || 0).toLocaleString()}</span>
                    {p.salePrice && (
                      <span className="prod-sale-price">Rs. {Number(p.salePrice).toLocaleString()}</span>
                    )}
                  </td>
                  <td>
                    <span className={`prod-stock ${Number(p.stock || 0) <= 3 ? "critical" : Number(p.stock || 0) <= 10 ? "warning" : "healthy"}`}>
                      {p.stock || 0}
                    </span>
                  </td>
                  <td>
                    <span className={`prod-status ${p.status === "active" ? "active" : "inactive"}`}>
                      {p.status || "inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="prod-actions">
                      <Link to={`/admin/products/${p.id}/edit`} className="prod-action-btn">
                        <FiEdit2 />
                      </Link>
                      <button onClick={() => handleDelete(p.id, p.name)} className="prod-action-btn delete">
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