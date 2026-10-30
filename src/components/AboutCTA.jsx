import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import "./AboutCTA.css";

export default function AboutCTA() {
  return (
    <section className="about-cta-section">
      <div className="about-cta-panel">
        <div className="about-cta-content">
          <h2 className="about-cta-title">Ready to see the collection?</h2>
          <p className="about-cta-desc">
            Browse our latest pieces, or reach out — we're a small team and 
            we answer every message personally.
          </p>
          
          <div className="about-cta-actions">
            <Link to="/collection" className="about-cta-btn about-cta-btn--primary">
              Shop Now <FaArrowRight className="about-cta-arrow" />
            </Link>
            <Link to="/contact" className="about-cta-btn about-cta-btn--secondary">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}