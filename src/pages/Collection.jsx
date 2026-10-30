import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiSearch, FiFilter, FiHeart, FiGrid, FiList, FiSlash } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { useStorefrontProducts } from "../hooks/useStorefrontProducts";
import "./Collection.css";

export default function Collection() {
  const { products, loading } = useStorefrontProducts("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [filters, setFilters] = useState({ category: "", minPrice: "", maxPrice: "", onSale: false });
  const [wishlist, setWishlist] = useState([]);

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    setWishlist((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const query = activeSearch.toLowerCase();
      const matchesSearch =
        (product.name || "").toLowerCase().includes(query) ||
        (product.category || "").toLowerCase().includes(query) ||
        (product.sku || "").toLowerCase().includes(query);

      const matchesCategory = filters.category
        ? (product.category || "").toLowerCase() === filters.category.toLowerCase()
        : true;

      const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.price;
      const matchesMin = filters.minPrice ? effectivePrice >= Number(filters.minPrice) : true;
      const matchesMax = filters.maxPrice ? effectivePrice <= Number(filters.maxPrice) : true;
      const matchesSale = filters.onSale ? (product.salePrice && product.salePrice > 0) : true;

      return matchesSearch && matchesCategory && matchesMin && matchesMax && matchesSale;
    });
  }, [products, activeSearch, filters]);

  const handleSearch = (e) => { e.preventDefault(); setActiveSearch(searchQuery); };
  const clearFilters = () => { setFilters({ category: "", minPrice: "", maxPrice: "", onSale: false }); setSearchQuery(""); setActiveSearch(""); };
  const formatPrice = (price) => `Rs. ${Number(price || 0).toLocaleString()}`;

  if (loading) return <div className="collection-page"><div className="loading-state">Loading products...</div></div>;

  return (
    <div className="collection-page">
      <div className="collection-container">
        <div className="collection-header">
          <span className="collection-label">Collection</span>
          <h1 className="collection-title">All Products</h1>
          <p className="collection-count">{filteredProducts.length} products found</p>
        </div>

        <div className="collection-toolbar">
          <form className="search-form" onSubmit={handleSearch}>
            <div className="search-input-wrapper">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Search products by name, brand, keyword..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <button type="submit" className="btn-search"><FiSearch /> Search</button>
          </form>
          <button className={`btn-advanced ${showFilters ? "active" : ""}`} onClick={() => setShowFilters(!showFilters)}>
            <FiFilter /> Advanced
          </button>
        </div>

        {showFilters && (
          <div className="advanced-filters">
            <div className="filter-group">
              <label>Category</label>
              <input type="text" placeholder="e.g. Footwear" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })} />
            </div>
            <div className="filter-group">
              <label>Min Price</label>
              <input type="number" placeholder="0" value={filters.minPrice} onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
            </div>
            <div className="filter-group">
              <label>Max Price</label>
              <input type="number" placeholder="10000" value={filters.maxPrice} onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
            </div>
            <div className="filter-group checkbox-group">
              <label><input type="checkbox" checked={filters.onSale} onChange={(e) => setFilters({ ...filters, onSale: e.target.checked })} /> On Sale Only</label>
            </div>
            <button className="btn-clear-filters" onClick={clearFilters}>Clear All</button>
          </div>
        )}

        <div className="collection-controls">
          <span className="results-text">Showing {filteredProducts.length} of {products.length}</span>
          <div className="view-toggle-wrapper">
            <button className={`view-btn ${viewMode === "grid" ? "active" : ""}`} onClick={() => setViewMode("grid")}><FiGrid /></button>
            <button className={`view-btn ${viewMode === "list" ? "active" : ""}`} onClick={() => setViewMode("list")}><FiList /></button>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <FiSlash className="empty-icon" />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters.</p>
            <button onClick={clearFilters} className="btn-clear-filters">Clear Filters</button>
          </div>
        ) : (
          <div className={`products-wrapper ${viewMode}`}>
            {filteredProducts.map((product) => {
              const hasSale = product.salePrice && product.salePrice > 0;
              const displayPrice = hasSale ? product.salePrice : product.price;
              return (
                <Link to={`/product/${product.id}`} className="product-item" key={product.id}>
                  <div className="product-image-area">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : (
                      <div className="no-image-placeholder"><FiSlash /><span>No Image</span></div>
                    )}
                    {hasSale && <span className="sale-badge">SALE</span>}
                    <button className={`wishlist-btn ${wishlist.includes(product.id) ? "active" : ""}`} onClick={(e) => toggleWishlist(e, product.id)}>
                      {wishlist.includes(product.id) ? <FaHeart /> : <FiHeart />}
                    </button>
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3 className="product-name">{product.name}</h3>
                    <div className="product-price-row">
                      <span className="product-price">{formatPrice(displayPrice)}</span>
                      {hasSale && <span className="product-original-price">{formatPrice(product.price)}</span>}
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