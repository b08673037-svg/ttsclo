import { Link } from "react-router-dom";
import { FaStar, FaArrowRight } from "react-icons/fa";
import { useStorefrontProducts } from "../hooks/useStorefrontProducts";
import ProductCard from "./ProductCard";
import "./BestSellers.css";

export default function BestSellers() {
  const { products: bestSellers, loading } = useStorefrontProducts("bestSellers");
  const { products: allProducts } = useStorefrontProducts("all");

  // Fallback: Show up to 4 best sellers, or latest products if none are tagged
  const displayProducts = bestSellers.length > 0 ? bestSellers.slice(0, 4) : allProducts.slice(0, 4);

  if (loading) return null;
  if (displayProducts.length === 0) return null; // Hide section if no products exist at all

  return (
    <section className="best-sellers">
      <div className="best-sellers__container">
        <div className="best-sellers__header">
          <div className="best-sellers__header-left">
            <div className="best-sellers__eyebrow">
              <FaStar className="eyebrow-icon" />
              <span>BEST SELLERS</span>
            </div>
            <h2 className="best-sellers__title">Top Picks This Week</h2>
          </div>
          
          <Link to="/collection" className="best-sellers__view-all">
            View all <FaArrowRight className="view-all-arrow" />
          </Link>
        </div>

        <div className="best-sellers__grid">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}