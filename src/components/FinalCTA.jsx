import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import "./FinalCTA.css";

export default function FinalCTA() {
  return (
    <section className="cta-section">
      <div className="cta-panel">
        
        {/* SUBTLE BACKGROUND GLOW */}
        <div className="cta-glow"></div>

        <div className="cta-content">
          <h2 className="cta-title">
            Ready to shop <span className="text-gold">smart?</span>
          </h2>
          
          <p className="cta-desc">
            Quality undergarments, handmade Peshawari chappals (Kheri & Kaptaan), and more — 
            delivered same-day in Toba Tek Singh. Join 6,000+ happy customers who stopped wasting 
            time at the bazaar.
          </p>

          <div className="cta-actions">
            {/* Changed classes to cta-btn */}
            <Link to="/collection" className="cta-btn cta-btn--primary">
              Shop Now <FaArrowRight className="btn-arrow" />
            </Link>
            
            <Link to="/wholesale" className="cta-btn cta-btn--secondary">
              Become a Wholesale Buyer
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}