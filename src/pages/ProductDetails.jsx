import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiShoppingBag, FiHeart, FiTruck, FiShield, FiMinus, FiPlus } from "react-icons/fi";
import { FaHeart, FaStar } from "react-icons/fa";
import { ref, onValue } from "firebase/database";
import { useCart } from "../context/CartContext";
import { db } from "../firebase";
import "./ProductDetails.css";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const productRef = ref(db, `ttsCollection/products/${id}`);
    const unsubscribe = onValue(productRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setProduct({ id, ...data });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // ONLY ONE handleAddToCart FUNCTION (Fixed)
  const handleAddToCart = () => {
    addToCart(product, quantity);
    alert(`Added ${quantity} x ${product.name} to your cart!`);
  };

  if (loading) {
    return <div className="loading-screen">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="not-found-screen">
        <h2>Product Not Found</h2>
        <p>This product may have been removed or is no longer available.</p>
        <Link to="/collection" className="back-link">
          <FiArrowLeft /> Back to Collection
        </Link>
      </div>
    );
  }

  const hasSale = product.salePrice && Number(product.salePrice) > 0;
  const displayPrice = hasSale ? product.salePrice : product.price;
  const originalPrice = hasSale ? product.price : null;
  const formatPrice = (p) => `Rs. ${Number(p).toLocaleString()}`;

  return (
    <div className="product-details-page">
      <div className="product-details__container">
        
        {/* BREADCRUMB */}
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span>
          <Link to="/collection">Collection</Link> <span>/</span>
          <span className="current">{product.name}</span>
        </div>

        <div className="product-details__layout">
          
          {/* LEFT: IMAGE */}
          <div className="product-details__image-wrapper">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="main-image" />
            ) : (
              <div className="no-image">No Image</div>
            )}
            {hasSale && <span className="sale-badge">SALE</span>}
          </div>

          {/* RIGHT: INFO */}
          <div className="product-details__info">
            <span className="product-details__category">{product.category || "Uncategorized"}</span>
            <h1 className="product-details__title">{product.name}</h1>

            {/* RATING */}
            <div className="product-details__rating">
              <FaStar /> <FaStar /> <FaStar /> <FaStar /> <FaStar />
              <span className="rating-count">(4.8 · 24 reviews)</span>
            </div>

            {/* PRICE */}
            <div className="product-details__price-row">
              <span className="price-current">{formatPrice(displayPrice)}</span>
              {originalPrice && (
                <span className="price-original">{formatPrice(originalPrice)}</span>
              )}
            </div>

            {/* DESCRIPTION */}
            <p className="product-details__description">
              {product.description || "No description available for this product."}
            </p>

            {/* STOCK STATUS */}
            <div className="stock-status">
              {product.stock > 0 ? (
                <span className="in-stock">✓ In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">✗ Out of Stock</span>
              )}
            </div>

            {/* ACTIONS WITH QUANTITY SELECTOR */}
            <div className="product-details__actions">
              <div className="quantity-selector">
                <button onClick={handleDecrement} disabled={quantity <= 1} aria-label="Decrease quantity">
                  <FiMinus />
                </button>
                <span>{quantity}</span>
                <button onClick={handleIncrement} disabled={quantity >= product.stock} aria-label="Increase quantity">
                  <FiPlus />
                </button>
              </div>

              <button 
                className="add-to-cart-btn" 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
              >
                <FiShoppingBag /> Add to Cart
              </button>

              <button 
                className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                onClick={() => setIsWishlisted(!isWishlisted)}
                aria-label="Toggle wishlist"
              >
                {isWishlisted ? <FaHeart /> : <FiHeart />}
              </button>
            </div>

            {/* TRUST BADGES */}
            <div className="trust-badges">
              <div className="trust-badge">
                <FiTruck />
                <span>Same-Day Delivery in Toba Tek Singh</span>
              </div>
              <div className="trust-badge">
                <FiShield />
                <span>7-Day Easy Exchange</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}