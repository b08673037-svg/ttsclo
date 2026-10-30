import { useState, useEffect, useMemo } from "react";
import {
  FiTag, FiPlus, FiEdit2, FiTrash2, FiX, FiSave,
  FiCheck, FiCopy, FiCalendar, FiDollarSign, FiPercent,
  FiUsers, FiPower, FiSearch,
} from "react-icons/fi";
import {
  subscribeToCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
} from "../../services/couponService";
import "./AdminCoupons.css";

const INITIAL_FORM = {
  code: "",
  description: "",
  discountType: "percentage", // percentage | fixed
  discountValue: "",
  minOrderValue: "",
  usageLimit: "",
  expiresAt: "",
  isActive: true,
};

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [copiedId, setCopiedId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToCoupons((data) => {
      clearTimeout(timeoutId);
      setCoupons(data);
      setLoading(false);
    });
    return () => {
      clearTimeout(timeoutId);
      unsub();
    };
  }, []);

  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(
      (c) => c.isActive && (!c.expiresAt || Date.now() < c.expiresAt)
    ).length;
    const expired = coupons.filter((c) => c.expiresAt && Date.now() > c.expiresAt).length;
    const used = coupons.reduce((s, c) => s + (c.usageCount || 0), 0);
    return { total, active, expired, used };
  }, [coupons]);

  const filtered = useMemo(() => {
    if (!search) return coupons;
    const q = search.toLowerCase();
    return coupons.filter(
      (c) =>
        (c.code || "").toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q)
    );
  }, [coupons, search]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
    setErrors({});
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: String(coupon.discountValue || ""),
      minOrderValue: String(coupon.minOrderValue || ""),
      usageLimit: String(coupon.usageLimit || ""),
      expiresAt: coupon.expiresAt
        ? new Date(coupon.expiresAt).toISOString().split("T")[0]
        : "",
      isActive: coupon.isActive !== false,
    });
    setEditingId(coupon.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = "Coupon code is required";
    if (!formData.discountValue) newErrors.discountValue = "Discount value is required";
    if (Number(formData.discountValue) <= 0) newErrors.discountValue = "Must be greater than 0";
    if (
      formData.discountType === "percentage" &&
      Number(formData.discountValue) > 100
    ) {
      newErrors.discountValue = "Percentage cannot exceed 100%";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        expiresAt: formData.expiresAt
          ? new Date(formData.expiresAt).getTime()
          : null,
        isActive: formData.isActive,
      };

      if (editingId) {
        await updateCoupon(editingId, payload);
      } else {
        await createCoupon(payload);
      }
      resetForm();
    } catch (err) {
      alert("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Delete coupon "${code}"?`)) {
      try {
        await deleteCoupon(id);
      } catch (err) {
        alert("Failed to delete: " + err.message);
      }
    }
  };

  const handleToggle = async (id, current) => {
    try {
      await toggleCouponStatus(id, !current);
    } catch (err) {
      alert("Failed to toggle: " + err.message);
    }
  };

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const isExpired = (c) => c.expiresAt && Date.now() > c.expiresAt;
  const isLimitReached = (c) => c.usageLimit && (c.usageCount || 0) >= c.usageLimit;

  const getStatus = (c) => {
    if (!c.isActive) return { cls: "inactive", label: "Inactive" };
    if (isExpired(c)) return { cls: "expired", label: "Expired" };
    if (isLimitReached(c)) return { cls: "expired", label: "Limit Reached" };
    return { cls: "active", label: "Active" };
  };

  const formatDate = (ts) => {
    if (!ts) return "Never";
    return new Date(ts).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading coupons...</p>
      </div>
    );
  }

  return (
    <div className="admin-coupons">

      {/* HEADER */}
      <div className="cp-header">
        <div>
          <h2 className="page-title">Coupons & Discounts</h2>
          <p className="page-subtitle">Create promo codes to boost sales and reward customers.</p>
        </div>
        <button
          className="cp-add-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <FiPlus /> Create Coupon
        </button>
      </div>

      {/* STATS */}
      <div className="cp-stats">
        <div className="cp-stat-card">
          <div className="cp-stat-icon gold"><FiTag /></div>
          <div className="cp-stat-info">
            <span className="cp-stat-label">Total Coupons</span>
            <span className="cp-stat-value">{stats.total}</span>
          </div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon green"><FiPower /></div>
          <div className="cp-stat-info">
            <span className="cp-stat-label">Active</span>
            <span className="cp-stat-value">{stats.active}</span>
          </div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon red"><FiCalendar /></div>
          <div className="cp-stat-info">
            <span className="cp-stat-label">Expired</span>
            <span className="cp-stat-value">{stats.expired}</span>
          </div>
        </div>
        <div className="cp-stat-card">
          <div className="cp-stat-icon blue"><FiUsers /></div>
          <div className="cp-stat-info">
            <span className="cp-stat-label">Total Uses</span>
            <span className="cp-stat-value">{stats.used}</span>
          </div>
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="cp-form-card">
          <div className="cp-form-head">
            <h3>{editingId ? "Edit Coupon" : "New Coupon"}</h3>
            <button className="cp-form-close" onClick={resetForm}>
              <FiX />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="cp-form">
            <div className="cp-form-row">
              <div className="cp-form-group">
                <label>Coupon Code *</label>
                <input
                  type="text"
                  name="code"
                  placeholder="e.g. EID15"
                  value={formData.code}
                  onChange={handleChange}
                  className={errors.code ? "error" : ""}
                  style={{ textTransform: "uppercase" }}
                />
                {errors.code && <span className="cp-error">{errors.code}</span>}
              </div>
              <div className="cp-form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  placeholder="e.g. Eid Sale 15% off"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-group">
                <label>Discount Type *</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleChange}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (Rs.)</option>
                </select>
              </div>
              <div className="cp-form-group">
                <label>
                  Discount Value * {formData.discountType === "percentage" ? "(%)" : "(Rs.)"}
                </label>
                <input
                  type="number"
                  name="discountValue"
                  placeholder={formData.discountType === "percentage" ? "15" : "500"}
                  value={formData.discountValue}
                  onChange={handleChange}
                  className={errors.discountValue ? "error" : ""}
                />
                {errors.discountValue && <span className="cp-error">{errors.discountValue}</span>}
              </div>
            </div>

            <div className="cp-form-row">
              <div className="cp-form-group">
                <label>Min Order Value (Rs.)</label>
                <input
                  type="number"
                  name="minOrderValue"
                  placeholder="0 (no minimum)"
                  value={formData.minOrderValue}
                  onChange={handleChange}
                />
              </div>
              <div className="cp-form-group">
                <label>Usage Limit</label>
                <input
                  type="number"
                  name="usageLimit"
                  placeholder="Unlimited"
                  value={formData.usageLimit}
                  onChange={handleChange}
                />
              </div>
              <div className="cp-form-group">
                <label>Expires On</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleChange}
                />
              </div>
            </div>

            <label className="cp-checkbox-label">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              Active (available for customers)
            </label>

            <div className="cp-form-actions">
              <button type="button" className="cp-btn-secondary" onClick={resetForm} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="cp-btn-primary" disabled={saving}>
                <FiSave /> {saving ? "Saving..." : "Save Coupon"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH */}
      <div className="cp-search">
        <FiSearch />
        <input
          type="text"
          placeholder="Search coupons by code or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      {filtered.length === 0 ? (
        <div className="cp-empty">
          <FiTag size={40} />
          <p>{search ? "No coupons match your search." : "No coupons yet. Create your first one!"}</p>
        </div>
      ) : (
        <div className="cp-grid">
          {filtered.map((c) => {
            const status = getStatus(c);
            return (
              <div className={`cp-card status-${status.cls}`} key={c.id}>
                <div className="cp-card-top">
                  <div className="cp-code-wrapper">
                    <div className="cp-code-badge">
                      {c.discountType === "percentage" ? <FiPercent /> : <FiDollarSign />}
                    </div>
                    <span className="cp-code">{c.code}</span>
                    <button
                      className="cp-copy-btn"
                      onClick={() => handleCopy(c.id, c.code)}
                      title="Copy code"
                    >
                      {copiedId === c.id ? <FiCheck /> : <FiCopy />}
                    </button>
                  </div>
                  <span className={`cp-status ${status.cls}`}>{status.label}</span>
                </div>

                {c.description && (
                  <p className="cp-desc">{c.description}</p>
                )}

                <div className="cp-discount-display">
                  <span className="cp-discount-value">
                    {c.discountType === "percentage"
                      ? `${c.discountValue}%`
                      : `Rs. ${Number(c.discountValue).toLocaleString()}`}
                  </span>
                  <span className="cp-discount-label">OFF</span>
                </div>

                <div className="cp-meta">
                  {c.minOrderValue > 0 && (
                    <div className="cp-meta-row">
                      <span>Min order</span>
                      <strong>Rs. {Number(c.minOrderValue).toLocaleString()}</strong>
                    </div>
                  )}
                  <div className="cp-meta-row">
                    <span>Used</span>
                    <strong>
                      {c.usageCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : ""}
                    </strong>
                  </div>
                  <div className="cp-meta-row">
                    <span>Expires</span>
                    <strong>{formatDate(c.expiresAt)}</strong>
                  </div>
                </div>

                <div className="cp-card-actions">
                  <button
                    className="cp-action-btn"
                    onClick={() => handleToggle(c.id, c.isActive)}
                    title={c.isActive ? "Deactivate" : "Activate"}
                  >
                    <FiPower />
                  </button>
                  <button
                    className="cp-action-btn"
                    onClick={() => handleEdit(c)}
                    title="Edit"
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    className="cp-action-btn delete"
                    onClick={() => handleDelete(c.id, c.code)}
                    title="Delete"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}