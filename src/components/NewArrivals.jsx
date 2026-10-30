import { Link } from "react-router-dom";
import { FaStar, FaArrowRight } from "react-icons/fa";
import { useStorefrontProducts } from "../hooks/useStorefrontProducts";
import ProductCard from "./ProductCard";
import "./NewArrivals.css";

export default function NewArrivals() {
  const { products: newArrivals, loading } = useStorefrontProducts("newArrivals");

  if (loading) return null;
  if (newArrivals.length === 0) return null;

  return (
    <section className="new-arrivals">
      <div className="new-arrivals__container">
        <div className="new-arrivals__header">
          <div className="new-arrivals__header-left">
            <div className="new-arrivals__eyebrow">
              <FaStar className="eyebrow-icon" />
              <span>FRESH STOCK</span>
            </div>
            <h2 className="new-arrivals__title">New Arrivals</h2>
          </div>
          
          <Link to="/collection" className="new-arrivals__view-all">
            View all <FaArrowRight className="view-all-arrow" />
          </Link>
        </div>

        <div className="new-arrivals__grid">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}