import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingBag } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

export default function ProductCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const toggleWishlist = (e) => {
    e.preventDefault(); 
    setIsWishlisted(!isWishlisted);
  };

  const formatPrice = (price) => {
    return `Rs. ${Number(price || 0).toLocaleString()}`;
  };

  const hasSale = product.salePrice && Number(product.salePrice) > 0;
  const displayPrice = hasSale ? product.salePrice : product.price;
  const originalPrice = hasSale ? product.price : null;

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__image-wrapper">
        {hasSale && <span className="product-card__sale-badge">SALE</span>}
        
        {/* The Wishlist Button */}
        <button 
          className="product-card__wishlist" 
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isWishlisted ? <FaHeart className="icon-filled" /> : <FiHeart />}
        </button>

        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="product-card__image"
          />
        ) : (
          <div className="no-image-placeholder" style={{ height: '100%' }}>
            <span>No Image</span>
          </div>
        )}

        <div className="product-card__hover-action">
          <button className="add-to-cart-btn" onClick={(e) => { e.preventDefault(); alert(`${product.name} added!`); }}>
            <FiShoppingBag /> Add to Cart
          </button>
        </div>
      </div>

      <div className="product-card__info">
        <span className="product-card__category">{product.category || "Uncategorized"}</span>
        <h3 className="product-card__title">{product.name}</h3>
        
        <div className="product-card__price-row">
          <span className="product-card__price">{formatPrice(displayPrice)}</span>
          {originalPrice && (
            <span className="product-card__original-price">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}