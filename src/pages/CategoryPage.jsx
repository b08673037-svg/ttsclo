import { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiSearch, FiSlash, FiHeart, FiGrid, FiList,
  FiArrowLeft, FiCheck,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { db } from "../firebase";
import "./CategoryPage.css";

const slugify = (str) =>
  (str || "").toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and");

export default function CategoryPage() {
  const { categoryId } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [wishlist, setWishlist] = useState([]);
  const [search, setSearch] = useState("");
  const [activeSub, setActiveSub] = useState("All");

  useEffect(() => {
    const timeoutId = setTimeout(() => setLoading(false), 2500);
    const productsRef = ref(db, "ttsCollection/products");
    const unsub = onValue(productsRef, (snap) => {
      clearTimeout(timeoutId);
      const data = snap.val();
      if (data) {
        const arr = Object.keys(data)
          .map((k) => ({ id: k, ...data[k] }))
          .filter((p) => p.status === "active");
        setAllProducts(arr);
      }
      setLoading(false);
    });
    return () => { clearTimeout(timeoutId); unsub(); };
  }, []);

  // Reset subcategory when category changes
  useEffect(() => {
    setActiveSub("All");
    setSearch("");
  }, [categoryId]);

  // 1. Filter products that match this category
  const categoryProducts = useMemo(() => {
    return allProducts.filter((p) => {
      const pSlug = slugify(p.category || "");
      const matchesSlug = pSlug === categoryId;
      const matchesId = (p.category || "").toLowerCase().replace(/\s+/g, "-") === categoryId;
      return matchesSlug || matchesId;
    });
  }, [allProducts, categoryId]);

  // 2. Extract unique subcategories for this category
  const subcategories = useMemo(() => {
    const subs = new Set();
    categoryProducts.forEach((p) => {
      if (p.subcategory && p.subcategory.trim() !== "") {
        subs.add(p.subcategory.trim());
      }
    });
    return ["All", ...Array.from(subs).sort()];
  }, [categoryProducts]);

  // 3. Apply subcategory + search filters
  const filtered = useMemo(() => {
    return categoryProducts.filter((p) => {
      const matchSub = activeSub === "All" || p.subcategory === activeSub;
      
      const q = search.toLowerCase();
      const matchSearch = 
        !search || 
        (p.name || "").toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q);

      return matchSub && matchSearch;
    });
  }, [categoryProducts, activeSub, search]);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const formatPrice = (p) => `Rs. ${Number(p || 0).toLocaleString()}`;

  const categoryName = categoryId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace("And", "&");

  if (loading) {
    return (
      <div className="category-page">
        <div className="category-loading">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="category-page">
      <div className="category-page-container">

        {/* BREADCRUMB */}
        <div className="cat-breadcrumb">
          <Link to="/">Home</Link> <span>/</span>
          <Link to="/collection">Collection</Link> <span>/</span>
          <span className="cat-current">{categoryName}</span>
        </div>

        {/* HEADER */}
        <div className="cat-page-header">
          <div>
            <Link to="/collection" className="cat-back-link">
              <FiArrowLeft /> Back to Collection
            </Link>
            <h1 className="cat-page-title">{categoryName}</h1>
            <p className="cat-page-count">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""} found
            </p>
          </div>
        </div>

        {/* SUBCATEGORY PILLS */}
        {subcategories.length > 1 && (
          <div className="cat-subcategory-row">
            {subcategories.map((sub) => (
              <button
                key={sub}
                className={`cat-sub-btn ${activeSub === sub ? "active" : ""}`}
                onClick={() => setActiveSub(sub)}
              >
                {activeSub === sub && <FiCheck style={{ marginRight: 4, fontSize: 12 }} />}
                {sub}
              </button>
            ))}
          </div>
        )}

        {/* SEARCH & VIEW CONTROLS */}
        <div className="cat-controls">
          <div className="cat-search">
            <FiSearch />
            <input
              type="text"
              placeholder={`Search in ${categoryName}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="cat-view-toggle">
            <button
              className={`cat-view-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <FiGrid />
            </button>
            <button
              className={`cat-view-btn ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <FiList />
            </button>
          </div>
        </div>

        {/* PRODUCTS */}
        {filtered.length === 0 ? (
          <div className="cat-empty">
            <FiSlash size={40} />
            <h3>No products found</h3>
            <p>Try removing the filters or search terms.</p>
            <button 
              onClick={() => { setActiveSub("All"); setSearch(""); }} 
              className="cat-empty-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14 }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className={`cat-products ${viewMode}`}>
            {filtered.map((product) => {
              const hasSale = product.salePrice && Number(product.salePrice) > 0;
              const displayPrice = hasSale ? product.salePrice : product.price;
              return (
                <Link
                  to={`/product/${product.id}`}
                  className="cat-product-item"
                  key={product.id}
                >
                  <div className="cat-product-image">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <div className="cat-no-image">
                        <FiSlash />
                        <span>No Image</span>
                      </div>
                    )}
                    {hasSale && <span className="cat-sale-badge">SALE</span>}
                    <button
                      className={`cat-wishlist ${wishlist.includes(product.id) ? "active" : ""}`}
                      onClick={(e) => toggleWishlist(e, product.id)}
                    >
                      {wishlist.includes(product.id) ? <FaHeart /> : <FiHeart />}
                    </button>
                  </div>
                  <div className="cat-product-info">
                    <span className="cat-product-category">
                      {product.subcategory || product.category}
                    </span>
                    <h3 className="cat-product-name">{product.name}</h3>
                    <div className="cat-product-price-row">
                      <span className="cat-product-price">{formatPrice(displayPrice)}</span>
                      {hasSale && (
                        <span className="cat-product-original">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}