import { useState, useEffect } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiLayers,
} from "react-icons/fi";
import {
  subscribeToCategories, createCategory, updateCategory, deleteCategory,
} from "../../services/categoryService";
import "./AdminCategories.css";

const INITIAL_FORM = {
  name: "", description: "", imageUrl: "", order: 0, isActive: true,
};

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const unsub = subscribeToCategories((data) => {
      clearTimeout(timeoutId);
      setCategories(data);
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

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

  const handleEdit = (cat) => {
    setFormData({
      name: cat.name || "", description: cat.description || "",
      imageUrl: cat.imageUrl || "", order: cat.order || 0,
      isActive: cat.isActive !== false,
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete category "${name}"?`)) {
      try { await deleteCategory(id); }
      catch (err) { alert("Failed: " + err.message); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!formData.name.trim()) {
      setErrors({ name: "Category name is required" });
      return;
    }
    setSaving(true);
    try {
      const payload = { ...formData, order: Number(formData.order) || 0 };
      if (editingId) await updateCategory(editingId, payload);
      else await createCategory(payload);
      resetForm();
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" /><p>Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="admin-categories">
      <div className="cat-header">
        <div>
          <h2 className="page-title">Categories</h2>
          <p className="page-subtitle">Organize products into categories for easy browsing.</p>
        </div>
        <button className="cat-add-btn" onClick={() => { resetForm(); setShowForm(true); }}>
          <FiPlus /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="cat-form-card">
          <div className="cat-form-head">
            <h3>{editingId ? "Edit Category" : "New Category"}</h3>
            <button className="cat-form-close" onClick={resetForm}><FiX /></button>
          </div>
          <form onSubmit={handleSubmit} className="cat-form">
            <div className="cat-form-row">
              <div className="cat-form-group">
                <label>Category Name *</label>
                <input type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="e.g. Footwear"
                  className={errors.name ? "error" : ""} />
                {errors.name && <span className="cat-error">{errors.name}</span>}
              </div>
              <div className="cat-form-group">
                <label>Display Order</label>
                <input type="number" name="order" value={formData.order}
                  onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="cat-form-group">
              <label>Description</label>
              <textarea name="description" value={formData.description}
                onChange={handleChange} rows={2} placeholder="Short description..." />
            </div>
            <div className="cat-form-group">
              <label>Category Image URL</label>
              <input type="url" name="imageUrl" value={formData.imageUrl}
                onChange={handleChange} placeholder="https://example.com/cat.jpg" />
            </div>
            {formData.imageUrl && (
              <div className="cat-image-preview">
                <img src={formData.imageUrl} alt="Preview"
                  onError={(e) => (e.target.style.display = "none")} />
              </div>
            )}
            <label className="cat-checkbox">
              <input type="checkbox" name="isActive" checked={formData.isActive}
                onChange={handleChange} />
              Active (visible on storefront)
            </label>
            <div className="cat-form-actions">
              <button type="button" className="cat-btn-secondary" onClick={resetForm} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="cat-btn-primary" disabled={saving}>
                <FiSave /> {saving ? "Saving..." : "Save Category"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="cat-table-wrap">
        {categories.length === 0 ? (
          <div className="cat-empty">
            <FiLayers size={40} /><p>No categories yet. Create your first one!</p>
          </div>
        ) : (
          <table className="cat-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Description</th>
                <th>Order</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    {cat.imageUrl ? (
                      <img src={cat.imageUrl} alt={cat.name} className="cat-thumb" />
                    ) : (
                      <div className="cat-thumb-placeholder"><FiLayers /></div>
                    )}
                  </td>
                  <td className="bold">{cat.name}</td>
                  <td className="text-muted">{cat.description || "—"}</td>
                  <td className="text-muted">{cat.order || 0}</td>
                  <td>
                    <span className={`cat-status ${cat.isActive !== false ? "active" : "inactive"}`}>
                      {cat.isActive !== false ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="cat-actions">
                      <button onClick={() => handleEdit(cat)} className="cat-action-btn">
                        <FiEdit2 />
                      </button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="cat-action-btn delete">
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