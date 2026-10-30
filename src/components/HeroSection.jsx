import { Link } from "react-router-dom";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { FaStar, FaTruck } from "react-icons/fa";
import { useStoreSettings } from "../hooks/useStoreSettings";
import "./HeroSection.css";

const PRODUCT_IMAGE_URL = "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=800&q=80";

const STATS_DATA = [
  { value: "8K+", label: "ITEMS IN STOCK" },
  { value: "6K+", label: "ORDERS DELIVERED" },
  { value: "4.8★", label: "CUSTOMER RATING" },
  { value: "7-Day", label: "EASY EXCHANGE" },
];

export default function HeroSection() {
  const { settings } = useStoreSettings();

  // Fallbacks if settings are not yet loaded
  const hero1 = settings?.heroHeading1 || "Undergarments.";
  const hero2 = settings?.heroHeading2 || "Peshawari Chappals.";
  const hero3 = settings?.heroHeading3 || "Delivered Fast.";
  const subtitle = settings?.heroSubtitle || "Toba Tek Singh's trusted online store for premium undergarments...";

  return (
    <section className="hero">
      <div className="hero__container">
        <div className="hero__main">
          <div className="hero__content">
            <div className="hero__eyebrow">
              <FaStar className="hero__eyebrow-icon" />
              <span>SERVING TOBA TEK SINGH SINCE 2018</span>
            </div>

            <h1 className="hero__title">
              <span className="text-white">{hero1}</span>
              <span className="text-gold">{hero2}</span>
              <span className="text-white">{hero3}</span>
            </h1>

            <p className="hero__description">{subtitle}</p>

            <div className="hero__action-group">
              <div className="hero__actions">
                <Link to="/collection" className="hero-btn hero-btn--primary">
                  Shop Now <FiArrowRight />
                </Link>
                <Link to="/collection#categories" className="hero-btn hero-btn--secondary">
                  <FiSearch /> Browse by Category
                </Link>
              </div>

              <div className="hero__badge">
                <div className="hero__badge-left">
                  <FaTruck className="badge-icon" />
                  <span>Same-Day Delivery in {settings?.deliveryCity || "Toba Tek Singh"}</span>
                </div>
                <div className="hero__badge-divider"></div>
                <div className="hero__badge-right">
                  <FaStar className="badge-icon" />
                  <span>4.8 · 6,000+ Orders</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero__image-wrapper">
            <img src={PRODUCT_IMAGE_URL} alt="Premium Footwear" className="hero__image" />
          </div>
        </div>

        <div className="hero__stats-wrapper">
          <div className="hero__stats">
            {STATS_DATA.map((stat, index) => (
              <div className="stat-item" key={index}>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}