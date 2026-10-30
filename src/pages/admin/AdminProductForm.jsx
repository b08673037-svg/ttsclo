import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiSave, FiArrowLeft, FiImage, FiPackage, FiDollarSign,
  FiBox, FiTag, FiStar, FiCheck,
} from "react-icons/fi";
import { ref, onValue } from "firebase/database";
import { db } from "../../firebase";
import { createProduct, updateProduct } from "../../services/productService";
import { subscribeToCategories } from "../../services/categoryService";
import "./AdminProductForm.css";

const INITIAL_FORM = {
  name: "", sku: "", category: "", subcategory: "", price: "", salePrice: "",
  stock: "", imageUrl: "", description: "", status: "active",
  isBestSeller: false, isNewArrival: false, isFeatured: false,
};

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditing);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubCat = subscribeToCategories(setCategories);
    return () => unsubCat();
  }, []);

  useEffect(() => {
    if (isEditing) {
      const productRef = ref(db, `ttsCollection/products/${id}`);
      onValue(productRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setFormData({
            ...INITIAL_FORM,
            ...data,
            price: data.price?.toString() || "",
            salePrice: data.salePrice?.toString() || "",
            stock: data.stock?.toString() || "",
            subcategory: data.subcategory || "",
          });
        }
        setFetching(false);
      }, { onlyOnce: true });
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Product name is required";
    if (!formData.price) newErrors.price = "Price is required";
    if (isNaN(formData.price) || Number(formData.price) < 0) newErrors.price = "Invalid price";
    if (formData.salePrice && (isNaN(formData.salePrice) || Number(formData.salePrice) < 0)) {
      newErrors.salePrice = "Invalid sale price";
    }
    if (formData.stock === "" || isNaN(formData.stock)) newErrors.stock = "Stock is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        salePrice: formData.salePrice ? Number(formData.salePrice) : null,
        stock: Number(formData.stock),
      };
      if (isEditing) await updateProduct(id, payload);
      else await createProduct(payload);
      navigate("/admin/products");
    } catch (err) {
      alert("Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="admin-loading-screen">
        <div className="spinner" />
        <p>Loading product...</p>
      </div>
    );
  }

  return (
    <div className="admin-product-form">
      <Link to="/admin/products" className="pf-back-btn">
        <FiArrowLeft /> Back to Products
      </Link>

      <div className="pf-header">
        <h2 className="page-title">{isEditing ? "Edit Product" : "Add New Product"}</h2>
        <p className="page-subtitle">{isEditing ? "Update the product details below." : "Fill in the details to add a new item to your store."}</p>
      </div>

      <form onSubmit={handleSubmit} className="pf-form">

        {/* BASIC INFO */}
        <div className="pf-section">
          <h3 className="pf-section-title"><FiPackage /> Basic Information</h3>

          <div className="pf-group">
            <label>Product Name *</label>
            <input
              type="text" name="name" value={formData.name}
              onChange={handleChange} placeholder="e.g. Premium Brown Peshawari Chappal"
              className={errors.name ? "error" : ""}
            />
            {errors.name && <span className="pf-error">{errors.name}</span>}
          </div>

          <div className="pf-row">
            <div className="pf-group">
              <label>SKU</label>
              <input type="text" name="sku" value={formData.sku}
                onChange={handleChange} placeholder="e.g. TTS-001" />
            </div>
            <div className="pf-group">
              <label>Category</label>
              <select name="category" value={formData.category} onChange={handleChange}>
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
                {categories.length === 0 && (
                  <>
                    <option value="Footwear">Footwear</option>
                    <option value="Undergarments">Undergarments</option>
                    <option value="Fabrics">Fabrics</option>
                    <option value="Accessories">Accessories</option>
                  </>
                )}
              </select>
            </div>
          </div>

          <div className="pf-group">
            <label>Subcategory (Optional)</label>
            <input
              type="text" name="subcategory" value={formData.subcategory}
              onChange={handleChange} placeholder="e.g. Peshawari Chappals"
            />
          </div>

          <div className="pf-group">
            <label>Description</label>
            <textarea name="description" value={formData.description}
              onChange={handleChange} rows={4} placeholder="Describe the product..." />
          </div>
        </div>

        {/* PRICING */}
        <div className="pf-section">
          <h3 className="pf-section-title"><FiDollarSign /> Pricing & Inventory</h3>

          <div className="pf-row">
            <div className="pf-group">
              <label>Regular Price (Rs.) *</label>
              <input type="number" name="price" value={formData.price}
                onChange={handleChange} placeholder="0"
                className={errors.price ? "error" : ""} />
              {errors.price && <span className="pf-error">{errors.price}</span>}
            </div>
            <div className="pf-group">
              <label>Sale Price (Rs.)</label>
              <input type="number" name="salePrice" value={formData.salePrice}
                onChange={handleChange} placeholder="Optional" />
            </div>
            <div className="pf-group">
              <label>Stock Quantity *</label>
              <input type="number" name="stock" value={formData.stock}
                onChange={handleChange} placeholder="0"
                className={errors.stock ? "error" : ""} />
              {errors.stock && <span className="pf-error">{errors.stock}</span>}
            </div>
          </div>
        </div>

        {/* IMAGE */}
        <div className="pf-section">
          <h3 className="pf-section-title"><FiImage /> Product Image</h3>
          <div className="pf-group">
            <label>Image URL</label>
            <input type="url" name="imageUrl" value={formData.imageUrl}
              onChange={handleChange} placeholder="https://example.com/image.jpg" />
          </div>
          {formData.imageUrl && (
            <div className="pf-image-preview">
              <img src={formData.imageUrl} alt="Preview"
                onError={(e) => (e.target.style.display = "none")} />
            </div>
          )}
        </div>

        {/* VISIBILITY */}
        <div className="pf-section">
          <h3 className="pf-section-title"><FiTag /> Visibility & Tags</h3>

          <div className="pf-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="active">Active (Visible on store)</option>
              <option value="inactive">Inactive (Hidden)</option>
            </select>
          </div>

          <div className="pf-checkboxes">
            <label className="pf-checkbox">
              <input type="checkbox" name="isBestSeller"
                checked={formData.isBestSeller} onChange={handleChange} />
              <FiStar /> Best Seller
            </label>
            <label className="pf-checkbox">
              <input type="checkbox" name="isNewArrival"
                checked={formData.isNewArrival} onChange={handleChange} />
              <FiBox /> New Arrival
            </label>
            <label className="pf-checkbox">
              <input type="checkbox" name="isFeatured"
                checked={formData.isFeatured} onChange={handleChange} />
              <FiCheck /> Featured
            </label>
          </div>
        </div>

        <div className="pf-actions">
          <Link to="/admin/products" className="pf-btn-secondary">Cancel</Link>
          <button type="submit" className="pf-btn-primary" disabled={loading}>
            <FiSave /> {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}